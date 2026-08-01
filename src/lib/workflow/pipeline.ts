import { WorkflowInput, WorkflowOutput, EvidenceItem } from "./models";
import { classifyIntentLocally } from "./stage1";
import { determineStrategy } from "./stage2";
import { gatherEvidence } from "./stage3";
import { evaluateSufficiency } from "./stage4";
import { chooseReasoningMode } from "./stage5";
import { SYSTEM_PROMPT, getTemplateForMode } from "./prompts";

function generateMockResponse(
  query: string,
  mode: string,
  evaluation: { unsupported_or_missing_areas?: string },
  evidence: EvidenceItem[]
): string {
  const m = mode.toLowerCase();
  const citationsStr = evidence.map((ev) => `[${ev.source_id}/${ev.chunk_id}]`).join(" ");

  if (m.includes("refusal")) {
    return (
      "I'm sorry, but the current project documents and source materials do not contain " +
      "sufficient evidence to answer your request. " +
      `Missing details: ${evaluation.unsupported_or_missing_areas || "No relevant text matches your query."}`
    );
  }

  if (m.includes("narrative")) {
    return (
      "### Creative Portrayal Analysis\n" +
      "Based on the provided novel chapters, the character exhibits a reserved, distant behavior. " +
      `For instance, we see this pattern clearly in the texts ${citationsStr}.\n\n` +
      "### Strengths\n" +
      "- Consistency in aloof attitude across scenes.\n\n" +
      "### Weaknesses and Flat Areas\n" +
      "- A lack of internal monologue, making their motivations feel hidden or flat.\n" +
      "- The transition from avoidance to intimacy feels abrupt and unearned.\n\n" +
      "### Recommendations for Future Chapters\n" +
      "- Ground their dialogue style in subtle signs of vulnerability rather than complete silent treatment.\n" +
      "- Introduce scenes where they are forced to express emotion or react to conflict directly."
    );
  }

  if (m.includes("report")) {
    return (
      "# Project Status Report\n\n" +
      "## Executive Summary\n" +
      "This status report aggregates all retrieved project files to provide a clear view of current progress.\n\n" +
      "## Key Findings\n" +
      `- Significant milestones are documented in the sources ${citationsStr}.\n\n` +
      "## Sectioned Analysis\n" +
      "Based on our analysis, the project is currently in the active build phase, but we note potential risks.\n\n" +
      "## Risks, Gaps, or Blockers\n" +
      `- ${evaluation.unsupported_or_missing_areas || "No major gaps flagged."}\n\n` +
      "## Conclusion\n" +
      "The project is on track but requires attention regarding the specified gaps."
    );
  }

  if (m.includes("critique")) {
    return (
      "### Diagnosis of Existing Material\n" +
      `The source materials show initial structure but miss deep elaboration ${citationsStr}.\n\n` +
      "### Key Weaknesses\n" +
      "- Lack of detailed patterns and inconsistencies across documentation.\n\n" +
      "### Recommended Improvements\n" +
      "- Standardize terminology.\n" +
      "- Add concrete examples for each pattern observed."
    );
  }

  if (m.includes("synthesis")) {
    return (
      "### Source Synthesis\n" +
      `Evidence from sources reveals several viewpoints ${citationsStr}.\n\n` +
      "### Fact vs. Inference separation\n" +
      "- Clearly shown: Core factual points supported directly by sources.\n" +
      "- Reasonably inferred: Underlying patterns suggested by the material.\n" +
      "- Uncertain/Unsupported: Areas that need further validation.\n\n" +
      "### Viewpoint Conflicts\n" +
      "Any source disagreements are highlighted and preserved above."
    );
  }

  // default factual answer
  return (
    `Based on the project materials, the factual answer is supported directly. ` +
    `Relevant evidence: ${citationsStr}.`
  );
}

export async function executeWorkflow(
  workflowInput: WorkflowInput,
  useLlmIfAvailable: boolean = true
): Promise<WorkflowOutput> {
  // STAGE 1: Understand user intent
  const intent = classifyIntentLocally(workflowInput.user_query);

  // STAGE 2: Determine source usage strategy
  const strategy = determineStrategy(intent, workflowInput.user_query);

  // STAGE 3: Gather evidence
  const evidence = gatherEvidence(workflowInput, strategy);

  // STAGE 4: Evaluate source sufficiency
  const evaluation = evaluateSufficiency(intent, strategy, evidence, workflowInput.user_query);

  // STAGE 5: Choose reasoning mode
  const reasoningMode = chooseReasoningMode(intent, evaluation);

  // Internal explanation
  let internalExplanation =
    `Classified intent as '${intent.intent_type}' with support level '${evaluation.support_level}'. ` +
    `Selected reasoning mode '${reasoningMode}' to match the required analytical depth ` +
    `and handle any resource constraints or missing context.`;

  // Prepare prompt
  const templateFn = getTemplateForMode(reasoningMode);
  const userPrompt = templateFn({
    query: workflowInput.user_query,
    evidence,
    evaluation
  });

  const apiKey = process.env.OPENROUTER_API_KEY;
  console.log("[Workflow] OPENROUTER_API_KEY exists:", !!apiKey, "Length:", apiKey?.length);

  let answer = "";
  const citations: Record<string, unknown>[] = [];

  if (useLlmIfAvailable && apiKey) {
    try {
      console.log("[Workflow] Calling OpenRouter API with model: meta-llama/llama-3.1-8b-instruct");
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Mythrix AI"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.2,
          max_tokens: 2048
        })
      });

      const responseText = await response.text();
      console.log("[Workflow] OpenRouter response status:", response.status);
      console.log("[Workflow] OpenRouter response (first 500 chars):", responseText.substring(0, 500));

      if (!response.ok) {
        console.error("[Workflow] OpenRouter API error:", responseText);
        throw new Error(`OpenRouter API error (${response.status}): ${responseText.substring(0, 200)}`);
      }

      const data = JSON.parse(responseText);
      answer = data.choices?.[0]?.message?.content || "";
      
      if (!answer) {
        console.error("[Workflow] Empty response from OpenRouter:", JSON.stringify(data).substring(0, 500));
        throw new Error("Empty response from OpenRouter");
      }
      
      console.log("[Workflow] Successfully got response, length:", answer.length);
    } catch (error) {
      console.error("[Workflow] LLM invocation failed:", error);
      internalExplanation += ` (LLM invocation failed: ${error instanceof Error ? error.message : String(error)}. Used fallback mock generation.)`;
      answer = generateMockResponse(workflowInput.user_query, reasoningMode, evaluation, evidence);
    }
  } else {
    console.log("[Workflow] No API key found, using mock response. Key exists:", !!apiKey);
    internalExplanation += " (No active LLM key found or use_llm_if_available=False. Used fallback mock generation.)";
    answer = generateMockResponse(workflowInput.user_query, reasoningMode, evaluation, evidence);
  }

  // Build citations list and used sources
  const usedSources = [...new Set(evidence.map((ev) => ev.source_id))].sort();
  const usedChunkIds = [...new Set(evidence.map((ev) => ev.chunk_id))].sort();
  const evidenceNotes = evidence.map((ev) => ev.why_selected);

  // Compile citations based on evidence
  for (const ev of evidence) {
    citations.push({
      source_id: ev.source_id,
      source_name: ev.source_name,
      chunk_id: ev.chunk_id,
      label: ev.label
    });
  }

  return {
    detected_intent: intent.intent_type,
    selected_reasoning_mode: reasoningMode,
    support_level: evaluation.support_level,
    answer,
    citations,
    used_sources: usedSources,
    used_chunk_ids: usedChunkIds,
    evidence_notes: evidenceNotes,
    uncertainty_or_gaps: evaluation.unsupported_or_missing_areas,
    internal_explanation: internalExplanation
  };
}
