import { WorkflowInput, SourceUsageStrategy, EvidenceItem } from "./models";

export function gatherEvidence(
  workflowInput: WorkflowInput,
  strategy: SourceUsageStrategy
): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];
  const selectedSrcsSet = workflowInput.selected_sources
    ? new Set(workflowInput.selected_sources)
    : null;

  for (const chunk of workflowInput.retrieved_chunks) {
    // If selected_sources are provided, restrict retrieval to those only.
    if (selectedSrcsSet !== null && !selectedSrcsSet.has(chunk.source_id)) {
      continue;
    }

    let whySelected = "";

    // Determine why this was selected based on intent / strategy scope
    if (strategy.creative_narrative_focus) {
      whySelected = `Selected for pattern & character analysis (${strategy.retrieval_scope} scope) due to creative/narrative keywords.`;
    } else if (strategy.retrieval_scope === "narrow") {
      whySelected = "Selected as a direct keyword/semantic match for direct factual query.";
    } else if (strategy.retrieval_scope === "broad") {
      whySelected = `Selected for broad overview / report synthesis (${strategy.retrieval_scope} scope).`;
    } else if (strategy.retrieval_scope === "pattern") {
      whySelected = "Selected to analyze recurring themes, patterns, or structure.";
    } else if (strategy.retrieval_scope === "cross-source") {
      whySelected = "Selected to compare views or identify contradictions across sources.";
    } else {
      whySelected = "Selected as relevant background chunk.";
    }

    // Include page / section context in why_selected if available
    if (chunk.label) {
      whySelected += ` Found in ${chunk.label}.`;
    }

    evidence.push({
      source_id: chunk.source_id,
      source_name: chunk.source_name,
      chunk_id: chunk.chunk_id,
      chunk_text: chunk.chunk_text,
      label: chunk.label,
      why_selected: whySelected
    });
  }

  return evidence;
}
