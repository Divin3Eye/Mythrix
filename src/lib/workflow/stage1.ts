import { IntentAnalysis } from "./models";

export function classifyIntentLocally(query: string): IntentAnalysis {
  const q = query.toLowerCase();

  // 1. Narrative & character analysis
  if (["character", "love interest", "protagonist", "arc", "dialogue", "motivation", "romance"].some(k => q.includes(k))) {
    if (["improve", "better", "weak", "fix", "critique"].some(k => q.includes(k))) {
      return {
        intent_type: "narrative analysis",
        wants_information_retrieval: true,
        wants_analysis: true,
        wants_improvement_suggestions: true,
        wants_synthesis_across_sources: true,
        output_format_preference: "explanation",
        explanation: "Detected narrative analysis with improvement suggestions based on character/creative keywords."
      };
    }
    return {
      intent_type: "character analysis",
      wants_information_retrieval: true,
      wants_analysis: true,
      wants_improvement_suggestions: false,
      wants_synthesis_across_sources: true,
      output_format_preference: "explanation",
      explanation: "Detected character analysis based on character/creative keywords."
    };
  }

  // 2. Project status report
  if (["status report", "complete report", "project status", "project update"].some(k => q.includes(k))) {
    return {
      intent_type: "project status report",
      wants_information_retrieval: true,
      wants_analysis: true,
      wants_improvement_suggestions: false,
      wants_synthesis_across_sources: true,
      output_format_preference: "report",
      explanation: "Detected project status report request based on status keywords."
    };
  }

  // 3. Critique / Writing improvement
  if (["critique", "weakness", "how can i improve", "improve this", "what is weak", "where does this fail"].some(k => q.includes(k))) {
    return {
      intent_type: "critique",
      wants_information_retrieval: true,
      wants_analysis: true,
      wants_improvement_suggestions: true,
      wants_synthesis_across_sources: true,
      output_format_preference: "explanation",
      explanation: "Detected critique based on improvement or weakness keywords."
    };
  }

  // 4. Comparison
  if (["compare", "difference", "versus", "vs", "disagreement", "conflict"].some(k => q.includes(k))) {
    return {
      intent_type: "comparison",
      wants_information_retrieval: true,
      wants_analysis: true,
      wants_improvement_suggestions: false,
      wants_synthesis_across_sources: true,
      output_format_preference: "explanation",
      explanation: "Detected comparison request."
    };
  }

  // 5. Recommendation / Strategy
  if (["recommend", "strategy", "plan", "suggest"].some(k => q.includes(k))) {
    return {
      intent_type: "recommendation",
      wants_information_retrieval: true,
      wants_analysis: true,
      wants_improvement_suggestions: true,
      wants_synthesis_across_sources: true,
      output_format_preference: "explanation",
      explanation: "Detected recommendation request based on strategy keywords."
    };
  }

  // 6. Brainstorming
  if (["brainstorm", "ideas", "suggest some", "creative options"].some(k => q.includes(k))) {
    return {
      intent_type: "brainstorming from existing material",
      wants_information_retrieval: true,
      wants_analysis: false,
      wants_improvement_suggestions: true,
      wants_synthesis_across_sources: true,
      output_format_preference: "outline",
      explanation: "Detected brainstorming request."
    };
  }

  // 7. Default factual answer
  return {
    intent_type: "direct factual answer",
    wants_information_retrieval: true,
    wants_analysis: false,
    wants_improvement_suggestions: false,
    wants_synthesis_across_sources: false,
    output_format_preference: "Q&A",
    explanation: "Defaulting to direct factual answer."
  };
}
