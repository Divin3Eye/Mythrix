"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/actions/auth";

export async function addSource(input: {
  notebook_id: string;
  name: string;
  url: string | null;
  size_bytes: number;
  content?: string;
}) {
  const userId = await requireUser();
  const supabase = await createClient();

  // Verify notebook belongs to user
  const { data: nb, error: nbErr } = await supabase
    .from("notebooks")
    .select("id")
    .eq("id", input.notebook_id)
    .eq("user_id", userId)
    .single();

  if (nbErr || !nb) throw new Error("Notebook not found");

  let storageUrl: string | null = input.url;

  // If content is provided, upload to Storage
  if (input.content) {
    const filePath = `${userId}/${input.notebook_id}/${crypto.randomUUID()}-${input.name}`;
    const { error: uploadErr } = await supabase.storage
      .from("source-files")
      .upload(filePath, input.content, {
        contentType: "text/plain",
        upsert: false,
      });

    if (!uploadErr) {
      const { data: urlData } = supabase.storage
        .from("source-files")
        .getPublicUrl(filePath);
      storageUrl = urlData.publicUrl;
    }
  }

  const { data, error } = await supabase.from("source_files").insert({
    user_id: userId,
    notebook_id: input.notebook_id,
    name: input.name,
    url: storageUrl,
    size_bytes: input.size_bytes,
  }).select("id, name, url, size_bytes, created_at")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/notebook/${input.notebook_id}/sources`);
  revalidatePath("/dashboard");
  revalidatePath("/storage");
  
  return data;
}

export async function deleteSource(id: string) {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data: source, error: selErr } = await supabase
    .from("source_files")
    .select("id, notebook_id, url")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (selErr || !source) throw new Error("Source not found");

  // Delete from Storage if URL exists
  if (source.url) {
    // Extract path from URL and delete
    const urlParts = source.url.split("/");
    const bucketIndex = urlParts.indexOf("source-files");
    if (bucketIndex !== -1) {
      const filePath = urlParts.slice(bucketIndex + 1).join("/");
      await supabase.storage.from("source-files").remove([filePath]);
    }
  }

  const { error } = await supabase
    .from("source_files")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/notebook/${source.notebook_id}/sources`);
  revalidatePath("/dashboard");
  revalidatePath("/storage");
}

export async function getSources(notebookId: string) {
  const userId = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("source_files")
    .select("id, name, url, size_bytes, created_at")
    .eq("notebook_id", notebookId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

const MAX_VIEW_SIZE = 50 * 1024; // 50KB

export async function getSourceContent(sourceId: string): Promise<{ name: string; content: string; truncated: boolean; totalSize: number }> {
  const userId = await requireUser();
  const supabase = await createClient();

  // Get source metadata
  const { data: source, error: selErr } = await supabase
    .from("source_files")
    .select("id, name, url, size_bytes, notebook_id")
    .eq("id", sourceId)
    .eq("user_id", userId)
    .single();

  if (selErr || !source) throw new Error("Source not found");

  // Pure URL sources (not from Supabase Storage) don't have content to view
  if (!source.url || (!source.url.includes("source-files") && source.url.startsWith("http"))) {
    return {
      name: source.name,
      content: "This is a URL source. Open the link to view content.",
      truncated: false,
      totalSize: 0,
    };
  }

  // Extract file path from URL (works for both storage URLs and relative paths)
  const urlParts = source.url.split("/");
  const bucketIndex = urlParts.indexOf("source-files");
  if (bucketIndex === -1) throw new Error("Invalid storage URL");

  const filePath = urlParts.slice(bucketIndex + 1).join("/");

  // Download file content (limited by Supabase)
  const { data: fileData, error: dlErr } = await supabase.storage
    .from("source-files")
    .download(filePath);

  if (dlErr) throw new Error("Failed to download file");

  const fullContent = await fileData.text();
  const totalSize = fullContent.length;
  const truncated = totalSize > MAX_VIEW_SIZE;
  const content = truncated ? fullContent.slice(0, MAX_VIEW_SIZE) : fullContent;

  return {
    name: source.name,
    content,
    truncated,
    totalSize,
  };
}
