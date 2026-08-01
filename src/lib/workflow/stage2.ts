import { IntentAnalysis, SourceUsageStrategy } from "./models";

export function determineStrategy(intent: IntentAnalysis, query: string): SourceUsageStrategy {
  const intentType = intent.intent_type.toLowerCase();
  const q = query.toLowerCase();

  let retrievalScope = "narrow";
  const analysisGuidelines = ["Locate direct support for the user's specific request."];
  let shouldSeparateInferenceLevels = false;
  let requiresDiagnosisFirst = false;
  let creativeNarrativeFocus = false;

  if (intentType === "direct factual answer") {
    retrievalScope = "narrow";
    analysisGuidelines.push(
      "Find the most directly relevant supporting chunks.",
      "Verify facts directly from source texts.",
      "Cite specifically what supports the answer."
    );
  } else if (intentType === "project status report") {
    retrievalScope = "broad";
    analysisGuidelines.push(
      "Collect broader evidence across many relevant sources.",
      "Organize findings into cohesive topical sections.",
      "Identify project goals, progress, blockers, risks, and current state.",
      "Explicitly mention any important missing coverage or gaps in project files."
    );
  } else if (["critique", "writing improvement"].includes(intentType)) {
    retrievalScope = "pattern";
    requiresDiagnosisFirst = true;
    analysisGuidelines.push(
      "Extract relevant material from the sources first.",
      "Analyze patterns, weaknesses, inconsistencies, missing depth, or missed opportunities.",
      "Structure the critique with a clear diagnosis of the current materials.",
      "Provide actionable, grounded recommendations based strictly on the diagnosis."
    );
  } else if (["character analysis", "narrative analysis"].includes(intentType)) {
    retrievalScope = "pattern";
    creativeNarrativeFocus = true;
    requiresDiagnosisFirst = true;
    analysisGuidelines.push(
      "Inspect the relevant chapters and sections.",
      "Trace recurring behavior, dialogue style, motivations, and emotional progression.",
      "Track relationship dynamics and conflict progression across chapters.",
      "Do not answer like a factual Q&A bot; analyze the creative work deeply.",
      "Provide suggestions tied to actual passages, scenes, or observed behaviors."
    );
  } else if (intentType === "comparison") {
    retrievalScope = "cross-source";
    analysisGuidelines.push(
      "Gather evidence for each side of the comparison separately.",
      "Identify direct overlaps, differences, or contradictions.",
      "Surface any conflicting information instead of flattening or resolving it silently."
    );
  } else if (["recommendation", "strategy or planning support"].includes(intentType)) {
    retrievalScope = "pattern";
    shouldSeparateInferenceLevels = true;
    requiresDiagnosisFirst = true;
    analysisGuidelines.push(
      "Strictly separate the analysis into: (1) what the sources clearly show, (2) what can be reasonably inferred, and (3) what remains uncertain or unsupported.",
      "Provide practical recommendations grounded directly in observed evidence."
    );
  } else if (intentType === "brainstorming from existing material") {
    retrievalScope = "broad";
    analysisGuidelines.push(
      "Gather existing project themes, constraints, and ideas.",
      "Generate novel suggestions or brainstorming points that remain faithful to and grounded in the source corpus."
    );
  } else if (intentType === "gap analysis") {
    retrievalScope = "broad";
    analysisGuidelines.push(
      "Identify what is missing or unsupported in the current sources relative to the user's objective.",
      "Highlight any weak spots, uncorroborated claims, or documentation gaps."
    );
  } else if (intentType === "transformation of source material into artifact") {
    retrievalScope = "broad";
    analysisGuidelines.push(
      "Gather the raw material to be transformed.",
      "Format, restructure, or rewrite the material into the target artifact shape (e.g., outline, brief, newsletter, draft) without losing source fidelity."
    );
  } else if (intentType === "unsupported / out-of-scope request") {
    retrievalScope = "narrow";
    analysisGuidelines.push(
      "Explain clearly why the request is out of scope or unsupported by the current project files."
    );
  }

  // Additional contextual overrides
  if (q.includes("love interest") || q.includes("romance") || q.includes("novel")) {
    creativeNarrativeFocus = true;
    if (retrievalScope === "narrow") {
      retrievalScope = "pattern";
    }
  }

  return {
    retrieval_scope: retrievalScope,
    analysis_guidelines: analysisGuidelines,
    should_separate_inference_levels: shouldSeparateInferenceLevels,
    requires_diagnosis_first: requiresDiagnosisFirst,
    creative_narrative_focus: creativeNarrativeFocus
  };
}
