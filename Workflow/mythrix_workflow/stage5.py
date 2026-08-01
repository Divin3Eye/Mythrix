from typing import List
from mythrix_workflow.stage1 import IntentAnalysis
from mythrix_workflow.stage4 import SufficiencyEvaluation

def choose_reasoning_mode(
    intent: IntentAnalysis,
    evaluation: SufficiencyEvaluation
) -> str:
    """
    Selects one of six reasoning modes:
    1. Evidence answer mode
    2. Report mode
    3. Critique mode
    4. Narrative analysis mode
    5. Synthesis mode
    6. Refusal / gap mode
    """
    # 1. Refusal/Gap Mode: For unsupported or completely out-of-scope requests or when support is completely missing
    if intent.intent_type == "unsupported / out-of-scope request" or evaluation.support_level == "no support":
        return "Refusal / gap mode"

    # Normalize intent type
    it = intent.intent_type.lower()

    # 2. Narrative Analysis Mode
    if it in ["character analysis", "narrative analysis"] or "novel" in intent.explanation or "chapter" in intent.explanation:
        return "Narrative analysis mode"

    # 3. Critique Mode
    if it in ["critique", "writing improvement"]:
        return "Critique mode"

    # 4. Report Mode
    if it in ["project status report", "gap analysis"]:
        return "Report mode"

    # 5. Synthesis Mode
    if it in ["comparison", "brainstorming from existing material", "transformation of source material into artifact"] or intent.wants_synthesis_across_sources:
        return "Synthesis mode"

    # 6. Evidence Answer Mode
    if it == "direct factual answer":
        return "Evidence answer mode"

    # Fallback to Evidence Answer Mode
    return "Evidence answer mode"
