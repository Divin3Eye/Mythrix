from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class IntentAnalysis(BaseModel):
    intent_type: str = Field(
        ...,
        description="Must be one of: direct factual answer, project status report, source-grounded summary, comparison, critique, recommendation, brainstorming from existing material, gap analysis, transformation of source material into artifact, writing improvement, character analysis, narrative analysis, strategy or planning support, unsupported / out-of-scope request"
    )
    wants_information_retrieval: bool
    wants_analysis: bool
    wants_improvement_suggestions: bool
    wants_synthesis_across_sources: bool
    output_format_preference: str = Field(
        ...,
        description="One of: report, brief, outline, draft, explanation, Q&A, or other"
    )
    explanation: str

# Local rules for fallback if LLM is unavailable or for local testing/deterministic classification
def classify_intent_locally(query: str) -> IntentAnalysis:
    query_lower = query.lower()
    
    # 1. Narrative & character analysis
    if any(k in query_lower for k in ["character", "love interest", "protagonist", "arc", "dialogue", "motivation", "romance"]):
        if any(k in query_lower for k in ["improve", "better", "weak", "fix", "critique"]):
            return IntentAnalysis(
                intent_type="narrative analysis",
                wants_information_retrieval=True,
                wants_analysis=True,
                wants_improvement_suggestions=True,
                wants_synthesis_across_sources=True,
                output_format_preference="explanation",
                explanation="Detected narrative analysis with improvement suggestions based on character/creative keywords."
            )
        return IntentAnalysis(
            intent_type="character analysis",
            wants_information_retrieval=True,
            wants_analysis=True,
            wants_improvement_suggestions=False,
            wants_synthesis_across_sources=True,
            output_format_preference="explanation",
            explanation="Detected character analysis based on character/creative keywords."
        )

    # 2. Project status report
    if any(k in query_lower for k in ["status report", "complete report", "project status", "project update"]):
        return IntentAnalysis(
            intent_type="project status report",
            wants_information_retrieval=True,
            wants_analysis=True,
            wants_improvement_suggestions=False,
            wants_synthesis_across_sources=True,
            output_format_preference="report",
            explanation="Detected project status report request based on status keywords."
        )

    # 3. Critique / Writing improvement
    if any(k in query_lower for k in ["critique", "weakness", "how can i improve", "improve this", "what is weak", "where does this fail"]):
        return IntentAnalysis(
            intent_type="critique",
            wants_information_retrieval=True,
            wants_analysis=True,
            wants_improvement_suggestions=True,
            wants_synthesis_across_sources=True,
            output_format_preference="explanation",
            explanation="Detected critique based on improvement or weakness keywords."
        )

    # 4. Comparison
    if any(k in query_lower for k in ["compare", "difference", "versus", "vs", "disagreement", "conflict"]):
        return IntentAnalysis(
            intent_type="comparison",
            wants_information_retrieval=True,
            wants_analysis=True,
            wants_improvement_suggestions=False,
            wants_synthesis_across_sources=True,
            output_format_preference="explanation",
            explanation="Detected comparison request."
        )

    # 5. Recommendation / Strategy
    if any(k in query_lower for k in ["recommend", "strategy", "plan", "suggest"]):
        return IntentAnalysis(
            intent_type="recommendation",
            wants_information_retrieval=True,
            wants_analysis=True,
            wants_improvement_suggestions=True,
            wants_synthesis_across_sources=True,
            output_format_preference="explanation",
            explanation="Detected recommendation request based on strategy keywords."
        )

    # 6. Brainstorming
    if any(k in query_lower for k in ["brainstorm", "ideas", "suggest some", "creative options"]):
        return IntentAnalysis(
            intent_type="brainstorming from existing material",
            wants_information_retrieval=True,
            wants_analysis=False,
            wants_improvement_suggestions=True,
            wants_synthesis_across_sources=True,
            output_format_preference="outline",
            explanation="Detected brainstorming request."
        )

    # 7. Default factual answer
    return IntentAnalysis(
        intent_type="direct factual answer",
        wants_information_retrieval=True,
        wants_analysis=False,
        wants_improvement_suggestions=False,
        wants_synthesis_across_sources=False,
        output_format_preference="Q&A",
        explanation="Defaulting to direct factual answer."
    )
