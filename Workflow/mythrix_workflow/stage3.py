from typing import List, Optional, Set
from mythrix_workflow.models import SourceChunk, EvidenceItem, WorkflowInput
from mythrix_workflow.stage2 import SourceUsageStrategy

def gather_evidence(
    workflow_input: WorkflowInput,
    strategy: SourceUsageStrategy
) -> List[EvidenceItem]:
    """
    Simulates / performs evidence gathering on retrieved chunks according to the strategy.
    Filters by selected_sources if provided.
    Augments chunks with explanation on why they were selected based on the retrieval scope.
    """
    evidence: List[EvidenceItem] = []
    
    selected_srcs_set: Optional[Set[str]] = (
        set(workflow_input.selected_sources) if workflow_input.selected_sources else None
    )

    for chunk in workflow_input.retrieved_chunks:
        # If selected_sources are provided, restrict retrieval to those only.
        if selected_srcs_set is not None and chunk.source_id not in selected_srcs_set:
            continue
            
        why_selected = ""
        # Determine why this was selected based on intent / strategy scope
        if strategy.creative_narrative_focus:
            why_selected = f"Selected for pattern & character analysis ({strategy.retrieval_scope} scope) due to creative/narrative keywords."
        elif strategy.retrieval_scope == "narrow":
            why_selected = "Selected as a direct keyword/semantic match for direct factual query."
        elif strategy.retrieval_scope == "broad":
            why_selected = f"Selected for broad overview / report synthesis ({strategy.retrieval_scope} scope)."
        elif strategy.retrieval_scope == "pattern":
            why_selected = "Selected to analyze recurring themes, patterns, or structure."
        elif strategy.retrieval_scope == "cross-source":
            why_selected = "Selected to compare views or identify contradictions across sources."
        else:
            why_selected = "Selected as relevant background chunk."

        # Include page / section context in why_selected if available
        if chunk.label:
            why_selected += f" Found in {chunk.label}."

        evidence.append(
            EvidenceItem(
                source_id=chunk.source_id,
                source_name=chunk.source_name,
                chunk_id=chunk.chunk_id,
                chunk_text=chunk.chunk_text,
                label=chunk.label,
                why_selected=why_selected
            )
        )
        
    return evidence
