import os
import json
from typing import Optional, List, Dict, Any
from openai import OpenAI
from jinja2 import Template

from mythrix_workflow.models import WorkflowInput, WorkflowOutput, EvidenceItem
from mythrix_workflow.stage1 import classify_intent_locally
from mythrix_workflow.stage2 import determine_strategy
from mythrix_workflow.stage3 import gather_evidence
from mythrix_workflow.stage4 import evaluate_sufficiency, SufficiencyEvaluation
from mythrix_workflow.stage5 import choose_reasoning_mode
from mythrix_workflow.prompts import SYSTEM_PROMPT, get_template_for_mode

# Mock generation fallback when OPENROUTER_API_KEY is not configured
def generate_mock_response(
    query: str,
    mode: str,
    evaluation: SufficiencyEvaluation,
    evidence: List[EvidenceItem]
) -> str:
    m = mode.lower()
    citations_str = " ".join([f"[{ev.source_id}/{ev.chunk_id}]" for ev in evidence])
    
    if "refusal" in m:
        return (
            "I'm sorry, but the current project documents and source materials do not contain "
            "sufficient evidence to answer your request. "
            f"Missing details: {evaluation.unsupported_or_missing_areas or 'No relevant text matches your query.'}"
        )
    
    if "narrative" in m:
        return (
            "### Creative Portrayal Analysis\n"
            "Based on the provided novel chapters, the character exhibits a reserved, distant behavior. "
            f"For instance, we see this pattern clearly in the texts {citations_str}.\n\n"
            "### Strengths\n"
            "- Consistency in aloof attitude across scenes.\n\n"
            "### Weaknesses and Flat Areas\n"
            "- A lack of internal monologue, making their motivations feel hidden or flat.\n"
            "- The transition from avoidance to intimacy feels abrupt and unearned.\n\n"
            "### Recommendations for Future Chapters\n"
            "- Ground their dialogue style in subtle signs of vulnerability rather than complete silent treatment.\n"
            "- Introduce scenes where they are forced to express emotion or react to conflict directly."
        )
        
    if "report" in m:
        return (
            f"# Project Status Report\n\n"
            f"## Executive Summary\n"
            f"This status report aggregates all retrieved project files to provide a clear view of current progress.\n\n"
            f"## Key Findings\n"
            f"- Significant milestones are documented in the sources {citations_str}.\n\n"
            f"## Sectioned Analysis\n"
            f"Based on our analysis, the project is currently in the active build phase, but we note potential risks.\n\n"
            f"## Risks, Gaps, or Blockers\n"
            f"- {evaluation.unsupported_or_missing_areas or 'No major gaps flagged.'}\n\n"
            f"## Conclusion\n"
            f"The project is on track but requires attention regarding the specified gaps."
        )

    if "critique" in m:
        return (
            "### Diagnosis of Existing Material\n"
            f"The source materials show initial structure but miss deep elaboration {citations_str}.\n\n"
            "### Key Weaknesses\n"
            "- Lack of detailed patterns and inconsistencies across documentation.\n\n"
            "### Recommended Improvements\n"
            "- Standardize terminology.\n"
            "- Add concrete examples for each pattern observed."
        )

    if "synthesis" in m:
        return (
            "### Source Synthesis\n"
            f"Evidence from sources reveals several viewpoints {citations_str}.\n\n"
            "### Fact vs. Inference separation\n"
            "- Clearly shown: Core factual points supported directly by sources.\n"
            "- Reasonably inferred: Underlying patterns suggested by the material.\n"
            "- Uncertain/Unsupported: Areas that need further validation.\n\n"
            "### Viewpoint Conflicts\n"
            "Any source disagreements are highlighted and preserved above."
        )

    # default factual answer
    return (
        f"Based on the project materials, the factual answer is supported directly. "
        f"Relevant evidence: {citations_str}."
    )

def execute_workflow(workflow_input: WorkflowInput, use_llm_if_available: bool = True) -> WorkflowOutput:
    """
    Executes the full multi-stage Mythrix AI workflow.
    """
    # STAGE 1: Understand user intent
    intent = classify_intent_locally(workflow_input.user_query)
    
    # STAGE 2: Determine source usage strategy
    strategy = determine_strategy(intent, workflow_input.user_query)
    
    # STAGE 3: Gather evidence
    evidence = gather_evidence(workflow_input, strategy)
    
    # STAGE 4: Evaluate source sufficiency
    evaluation = evaluate_sufficiency(intent, strategy, evidence, workflow_input.user_query)
    
    # STAGE 5: Choose reasoning mode
    reasoning_mode = choose_reasoning_mode(intent, evaluation)
    
    # Internal explanation describing why the workflow chose this reasoning mode
    internal_explanation = (
        f"Classified intent as '{intent.intent_type}' with support level '{evaluation.support_level}'. "
        f"Selected reasoning mode '{reasoning_mode}' to match the required analytical depth "
        f"and handle any resource constraints or missing context."
    )
    
    # Prepare prompt
    template_str = get_template_for_mode(reasoning_mode)
    template = Template(template_str)
    user_prompt = template.render(
        query=workflow_input.user_query,
        evidence=evidence,
        evaluation=evaluation
    )
    
    api_key = os.environ.get("OPENROUTER_API_KEY") or os.environ.get("NVIDIA_API_KEY")
    
    answer = ""
    citations: List[Dict[str, Any]] = []
    
    if use_llm_if_available and api_key:
        try:
            # We can use OpenRouter or Nvidia NIM.
            # Base URL defaults are handled by checking which key is available.
            base_url = "https://openrouter.ai/api/v1" if os.environ.get("OPENROUTER_API_KEY") else "https://integrate.api.nvidia.com/v1"
            model = os.environ.get("WORKFLOW_MODEL", "meta-llama/llama-3.1-8b-instruct:free" if "openrouter" in base_url else "nvidia/llama-3.1-8b-instruct")
            
            client = OpenAI(
                base_url=base_url,
                api_key=api_key
            )
            
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.2,
                max_tokens=2048
            )
            answer = response.choices[0].message.content or ""
        except Exception as e:
            # Fallback on failure
            internal_explanation += f" (LLM invocation failed: {str(e)}. Used fallback mock generation.)"
            answer = generate_mock_response(workflow_input.user_query, reasoning_mode, evaluation, evidence)
    else:
        internal_explanation += " (No active LLM key found or use_llm_if_available=False. Used fallback mock generation.)"
        answer = generate_mock_response(workflow_input.user_query, reasoning_mode, evaluation, evidence)
        
    # Build citations list and used sources
    used_sources = sorted(list(set(ev.source_id for ev in evidence)))
    used_chunk_ids = sorted(list(set(ev.chunk_id for ev in evidence)))
    evidence_notes = [ev.why_selected for ev in evidence]
    
    # Parse citations from the final generated answer or just compile them based on evidence
    for ev in evidence:
        citations.append({
            "source_id": ev.source_id,
            "source_name": ev.source_name,
            "chunk_id": ev.chunk_id,
            "label": ev.label
        })
        
    return WorkflowOutput(
        detected_intent=intent.intent_type,
        selected_reasoning_mode=reasoning_mode,
        support_level=evaluation.support_level,
        answer=answer,
        citations=citations,
        used_sources=used_sources,
        used_chunk_ids=used_chunk_ids,
        evidence_notes=evidence_notes,
        uncertainty_or_gaps=evaluation.unsupported_or_missing_areas,
        internal_explanation=internal_explanation
    )
