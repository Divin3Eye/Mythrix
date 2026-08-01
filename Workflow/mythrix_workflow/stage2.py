from pydantic import BaseModel, Field
from typing import List, Optional
from mythrix_workflow.stage1 import IntentAnalysis

class SourceUsageStrategy(BaseModel):
    retrieval_scope: str = Field(
        ...,
        description="One of: narrow, broad, pattern, cross-source"
    )
    analysis_guidelines: List[str] = Field(
        default_factory=list,
        description="Specific instructions on how to analyze the extracted evidence."
    )
    should_separate_inference_levels: bool = Field(
        default=False,
        description="Whether to separate clearly shown facts, reasonable inferences, and unsupported/uncertain items."
    )
    requires_diagnosis_first: bool = Field(
        default=False,
        description="Whether the output must provide a diagnosis of current materials before recommendations."
    )
    creative_narrative_focus: bool = Field(
        default=False,
        description="Whether the focus is on creative writing elements (behaviors, dialogue, emotion, relationships)."
    )

def determine_strategy(intent: IntentAnalysis, query: str) -> SourceUsageStrategy:
    intent_type = intent.intent_type.lower()
    query_lower = query.lower()
    
    # Defaults
    retrieval_scope = "narrow"
    analysis_guidelines = ["Locate direct support for the user's specific request."]
    should_separate_inference_levels = False
    requires_diagnosis_first = False
    creative_narrative_focus = False

    if intent_type == "direct factual answer":
        retrieval_scope = "narrow"
        analysis_guidelines = [
            "Find the most directly relevant supporting chunks.",
            "Verify facts directly from source texts.",
            "Cite specifically what supports the answer."
        ]
        
    elif intent_type == "project status report":
        retrieval_scope = "broad"
        analysis_guidelines = [
            "Collect broader evidence across many relevant sources.",
            "Organize findings into cohesive topical sections.",
            "Identify project goals, progress, blockers, risks, and current state.",
            "Explicitly mention any important missing coverage or gaps in project files."
        ]
        
    elif intent_type in ["critique", "writing improvement"]:
        retrieval_scope = "pattern"
        requires_diagnosis_first = True
        analysis_guidelines = [
            "Extract relevant material from the sources first.",
            "Analyze patterns, weaknesses, inconsistencies, missing depth, or missed opportunities.",
            "Structure the critique with a clear diagnosis of the current materials.",
            "Provide actionable, grounded recommendations based strictly on the diagnosis."
        ]
        
    elif intent_type in ["character analysis", "narrative analysis"]:
        retrieval_scope = "pattern"
        creative_narrative_focus = True
        requires_diagnosis_first = True
        analysis_guidelines = [
            "Inspect the relevant chapters and sections.",
            "Trace recurring behavior, dialogue style, motivations, and emotional progression.",
            "Track relationship dynamics and conflict progression across chapters.",
            "Do not answer like a factual Q&A bot; analyze the creative work deeply.",
            "Provide suggestions tied to actual passages, scenes, or observed behaviors."
        ]
        
    elif intent_type == "comparison":
        retrieval_scope = "cross-source"
        analysis_guidelines = [
            "Gather evidence for each side of the comparison separately.",
            "Identify direct overlaps, differences, or contradictions.",
            "Surface any conflicting information instead of flattening or resolving it silently."
        ]
        
    elif intent_type in ["recommendation", "strategy or planning support"]:
        retrieval_scope = "pattern"
        should_separate_inference_levels = True
        requires_diagnosis_first = True
        analysis_guidelines = [
            "Strictly separate the analysis into: (1) what the sources clearly show, (2) what can be reasonably inferred, and (3) what remains uncertain or unsupported.",
            "Provide practical recommendations grounded directly in observed evidence."
        ]
        
    elif intent_type == "brainstorming from existing material":
        retrieval_scope = "broad"
        analysis_guidelines = [
            "Gather existing project themes, constraints, and ideas.",
            "Generate novel suggestions or brainstorming points that remain faithful to and grounded in the source corpus."
        ]
        
    elif intent_type == "gap analysis":
        retrieval_scope = "broad"
        analysis_guidelines = [
            "Identify what is missing or unsupported in the current sources relative to the user's objective.",
            "Highlight any weak spots, uncorroborated claims, or documentation gaps."
        ]
        
    elif intent_type == "transformation of source material into artifact":
        retrieval_scope = "broad"
        analysis_guidelines = [
            "Gather the raw material to be transformed.",
            "Format, restructure, or rewrite the material into the target artifact shape (e.g., outline, brief, newsletter, draft) without losing source fidelity."
        ]
        
    elif intent_type == "unsupported / out-of-scope request":
        retrieval_scope = "narrow"
        analysis_guidelines = [
            "Explain clearly why the request is out of scope or unsupported by the current project files."
        ]

    # Additional contextual overrides
    if "love interest" in query_lower or "romance" in query_lower or "novel" in query_lower:
        creative_narrative_focus = True
        if retrieval_scope == "narrow":
            retrieval_scope = "pattern"

    return SourceUsageStrategy(
        retrieval_scope=retrieval_scope,
        analysis_guidelines=analysis_guidelines,
        should_separate_inference_levels=should_separate_inference_levels,
        requires_diagnosis_first=requires_diagnosis_first,
        creative_narrative_focus=creative_narrative_focus
    )
