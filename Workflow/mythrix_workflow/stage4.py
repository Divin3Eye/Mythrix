from typing import List, Tuple, Optional
from pydantic import BaseModel, Field
from mythrix_workflow.models import EvidenceItem, WorkflowInput
from mythrix_workflow.stage1 import IntentAnalysis
from mythrix_workflow.stage2 import SourceUsageStrategy

class SufficiencyEvaluation(BaseModel):
    support_level: str = Field(
        ...,
        description="Must be one of: strong support, partial support, weak support, no support"
    )
    unsupported_or_missing_areas: Optional[str] = Field(
        default=None,
        description="Details about what is missing or unsupported in the current sources relative to the user's objective."
    )
    explanation: str

def evaluate_sufficiency(
    intent: IntentAnalysis,
    strategy: SourceUsageStrategy,
    evidence: List[EvidenceItem],
    query: str
) -> SufficiencyEvaluation:
    query_lower = query.lower()
    
    # Simple check for no evidence
    if not evidence:
        return SufficiencyEvaluation(
            support_level="no support",
            unsupported_or_missing_areas="No sources or matching chunks were provided or found in the project scope.",
            explanation="The evidence list is completely empty."
        )

    # Calculate total word count or chunk count
    total_chunks = len(evidence)
    total_length = sum(len(e.chunk_text) for e in evidence)

    # Let's assess based on intent requirements
    intent_type = intent.intent_type.lower()
    
    # 1. Project Status Report needs broader context. If only a single chunk or very short content is found, say partial or weak.
    if intent_type == "project status report":
        if total_chunks >= 3 and total_length > 500:
            return SufficiencyEvaluation(
                support_level="strong support",
                explanation=f"Found broad project evidence ({total_chunks} sections) sufficient for a complete report."
            )
        elif total_chunks > 0:
            return SufficiencyEvaluation(
                support_level="partial support",
                unsupported_or_missing_areas="Missing comprehensive project documents, active risk registries, or complete milestone updates. The retrieved sources do not fully cover the request.",
                explanation=f"Only {total_chunks} short chunks are available, which is insufficient for a comprehensive status report."
            )
            
    # 2. Critique / Narrative Analysis needs substantial content. If short or sparse chunks are present:
    if intent_type in ["critique", "narrative analysis", "character analysis"]:
        if total_chunks >= 2 and total_length > 200:
            return SufficiencyEvaluation(
                support_level="strong support",
                explanation=f"Sufficient text patterns ({total_length} characters) found to extract behavior, motivations, and style."
            )
        else:
            return SufficiencyEvaluation(
                support_level="partial support",
                unsupported_or_missing_areas="Missing deeper manuscript/report context or multi-chapter content. Cannot perform complete creative pattern analysis or deep diagnosis without more materials.",
                explanation="Retrieved material is extremely sparse. Critique and analysis will be limited to short snippets."
            )

    # 3. Recommendations / Strategy
    if intent_type in ["recommendation", "strategy or planning support"]:
        if total_chunks >= 2:
            return SufficiencyEvaluation(
                support_level="strong support",
                explanation="Multiple source documents found to construct a grounded strategy recommendation."
            )
        else:
            return SufficiencyEvaluation(
                support_level="partial support",
                unsupported_or_missing_areas="Only a single source snippet exists. Cannot generate a thoroughly cross-validated strategy without more evidence.",
                explanation="Partial support. Strategy is based on a very limited source set."
            )

    # Default logic
    if total_length > 100:
        return SufficiencyEvaluation(
            support_level="strong support",
            explanation="Good length of source text matching the user query."
        )
    else:
        return SufficiencyEvaluation(
            support_level="partial support",
            unsupported_or_missing_areas="Only minimal context was matched in sources.",
            explanation="Low volume of text matching the user query."
        )
