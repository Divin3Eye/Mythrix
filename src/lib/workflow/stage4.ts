import { IntentAnalysis, SourceUsageStrategy, EvidenceItem, SufficiencyEvaluation } from "./models";

export function evaluateSufficiency(
  intent: IntentAnalysis,
  strategy: SourceUsageStrategy,
  evidence: EvidenceItem[],
  query: string
): SufficiencyEvaluation {
  const queryLower = query.toLowerCase();

  // Simple check for no evidence
  if (evidence.length === 0) {
    return {
      support_level: "no support",
      unsupported_or_missing_areas: "No sources or matching chunks were provided or found in the project scope.",
      explanation: "The evidence list is completely empty."
    };
  }

  // Calculate total word count or chunk count
  const totalChunks = evidence.length;
  const totalLength = evidence.reduce((sum, e) => sum + e.chunk_text.length, 0);

  // Let's assess based on intent requirements
  const intentType = intent.intent_type.toLowerCase();

  // 1. Project Status Report needs broader context
  if (intentType === "project status report") {
    if (totalChunks >= 3 && totalLength > 500) {
      return {
        support_level: "strong support",
        explanation: `Found broad project evidence (${totalChunks} sections) sufficient for a complete report.`
      };
    } else if (totalChunks > 0) {
      return {
        support_level: "partial support",
        unsupported_or_missing_areas: "Missing comprehensive project documents, active risk registries, or complete milestone updates. The retrieved sources do not fully cover the request.",
        explanation: `Only ${totalChunks} short chunks are available, which is insufficient for a comprehensive status report.`
      };
    }
  }

  // 2. Critique / Narrative Analysis needs substantial content
  if (["critique", "narrative analysis", "character analysis"].includes(intentType)) {
    if (totalChunks >= 2 && totalLength > 200) {
      return {
        support_level: "strong support",
        explanation: `Sufficient text patterns (${totalLength} characters) found to extract behavior, motivations, and style.`
      };
    } else {
      return {
        support_level: "partial support",
        unsupported_or_missing_areas: "Missing deeper manuscript/report context or multi-chapter content. Cannot perform complete creative pattern analysis or deep diagnosis without more materials.",
        explanation: "Retrieved material is extremely sparse. Critique and analysis will be limited to short snippets."
      };
    }
  }

  // 3. Recommendations / Strategy
  if (["recommendation", "strategy or planning support"].includes(intentType)) {
    if (totalChunks >= 2) {
      return {
        support_level: "strong support",
        explanation: "Multiple source documents found to construct a grounded strategy recommendation."
      };
    } else {
      return {
        support_level: "partial support",
        unsupported_or_missing_areas: "Only a single source snippet exists. Cannot generate a thoroughly cross-validated strategy without more evidence.",
        explanation: "Partial support. Strategy is based on a very limited source set."
      };
    }
  }

  // Default logic
  if (totalLength > 100) {
    return {
      support_level: "strong support",
      explanation: "Good length of source text matching the user query."
    };
  } else {
    return {
      support_level: "partial support",
      unsupported_or_missing_areas: "Only minimal context was matched in sources.",
      explanation: "Low volume of text matching the user query."
    };
  }
}
