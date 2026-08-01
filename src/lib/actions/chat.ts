"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "./auth";
import { executeWorkflow } from "@/lib/workflow/pipeline";
import { WorkflowInput, SourceChunk } from "@/lib/workflow/models";

export interface ChatResponse {
  answer: string;
  detected_intent: string;
  reasoning_mode: string;
  support_level: string;
  citations: Record<string, unknown>[];
  uncertainty_or_gaps?: string;
}

export async function sendChatMessage(
  notebookId: string,
  userMessage: string,
  conversationHistory: { role: string; content: string }[] = []
): Promise<ChatResponse> {
  const userId = await requireUser();
  const supabase = await createClient();

  // Verify notebook ownership
  const { data: notebook } = await supabase
    .from("notebooks")
    .select("id")
    .eq("id", notebookId)
    .eq("user_id", userId)
    .single();

  if (!notebook) {
    throw new Error("Notebook not found or access denied");
  }

  // Fetch source files for this notebook
  const { data: sources } = await supabase
    .from("source_files")
    .select("id, name, url, size_bytes")
    .eq("notebook_id", notebookId)
    .eq("user_id", userId);

  // Convert sources to chunks — download and read file content from Storage
  const retrievedChunks: SourceChunk[] = [];

  for (const source of sources || []) {
    let chunkText = "";

    if (source.url) {
      try {
        // Extract path from URL and download from Storage
        const urlParts = source.url.split("/");
        const bucketIndex = urlParts.indexOf("source-files");
        if (bucketIndex !== -1) {
          const filePath = urlParts.slice(bucketIndex + 1).join("/");
          const { data: fileData, error: downloadErr } = await supabase.storage
            .from("source-files")
            .download(filePath);

          if (!downloadErr && fileData) {
            chunkText = await fileData.text();
          }
        }
      } catch (err) {
        console.error(`[Chat] Failed to download file ${source.name}:`, err);
      }
    }

    // Fallback if no content could be read
    if (!chunkText) {
      chunkText = `Source file: ${source.name}. Content could not be read.`;
    }

    // Split long content into chunks (max 4000 chars each)
    const maxChunkSize = 4000;
    if (chunkText.length > maxChunkSize) {
      const sentences = chunkText.split(/(?<=[.!?])\s+/);
      let currentChunk = "";
      let chunkIndex = 0;

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
          retrievedChunks.push({
            chunk_id: `${source.id}_chunk_${chunkIndex}`,
            source_id: source.id,
            source_name: source.name || "Untitled Source",
            chunk_text: currentChunk.trim(),
            label: source.name,
          });
          chunkIndex++;
          currentChunk = "";
        }
        currentChunk += sentence + " ";
      }

      if (currentChunk.trim()) {
        retrievedChunks.push({
          chunk_id: `${source.id}_chunk_${chunkIndex}`,
          source_id: source.id,
          source_name: source.name || "Untitled Source",
          chunk_text: currentChunk.trim(),
          label: source.name,
        });
      }
    } else {
      retrievedChunks.push({
        chunk_id: source.id,
        source_id: source.id,
        source_name: source.name || "Untitled Source",
        chunk_text: chunkText,
        label: source.name,
      });
    }
  }

  // Build workflow input
  const workflowInput: WorkflowInput = {
    user_query: userMessage,
    notebook_id: notebookId,
    retrieved_chunks: retrievedChunks,
    conversation_history: conversationHistory
  };

  // Execute the workflow
  const output = await executeWorkflow(workflowInput);

  return {
    answer: output.answer,
    detected_intent: output.detected_intent,
    reasoning_mode: output.selected_reasoning_mode,
    support_level: output.support_level,
    citations: output.citations,
    uncertainty_or_gaps: output.uncertainty_or_gaps
  };
}
