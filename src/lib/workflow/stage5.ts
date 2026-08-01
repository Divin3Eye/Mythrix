import { IntentAnalysis, SufficiencyEvaluation } from "./models";

export function chooseReasoningMode(
  intent: IntentAnalysis,
  evaluation: SufficiencyEvaluation
): string {
  // 1. Refusal/Gap Mode: For unsupported or completely out-of-scope requests
  if (
    intent.intent_type === "unsupported / out-of-scope request" ||
    evaluation.support_level === "no support"
  ) {
    return "Refusal / gap mode";
  }

  // Normalize intent type
  const it = intent.intent_type.toLowerCase();

  // 2. Narrative Analysis Mode
  if (
    ["character analysis", "narrative analysis"].includes(it) ||
    intent.explanation.includes("novel") ||
    intent.explanation.includes("chapter")
  ) {
    return "Narrative analysis mode";
  }

  // 3. Critique Mode
  if (["critique", "writing improvement"].includes(it)) {
    return "Critique mode";
  }

  // 4. Report Mode
  if (["project status report", "gap analysis"].includes(it)) {
    return "Report mode";
  }

  // 5. Synthesis Mode
  if (
    ["comparison", "brainstorming from existing material", "transformation of source material into artifact"].includes(it) ||
    intent.wants_synthesis_across_sources
  ) {
    return "Synthesis mode";
  }

  // 6. Evidence Answer Mode
  if (it === "direct factual answer") {
    return "Evidence answer mode";
  }

  // Fallback to Evidence Answer Mode
  return "Evidence answer mode";
}
