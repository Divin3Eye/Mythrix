from typing import List, Dict, Any, Optional
from mythrix_workflow.models import EvidenceItem

# Detailed Jinja2 templates for structured prompting per reasoning mode

SYSTEM_PROMPT = """You are Mythrix AI, an advanced, highly intelligent source-grounded research and creation workspace. 
You are NOT a generic chatbot or a simple source scraper. Your purpose is to act as a brilliant, faithful project and writing assistant.

Core grounded rules:
1. NEVER silently answer from general knowledge when the corpus does not support it.
2. NEVER pretend scraped pages are enough if they are shallow.
3. NEVER output generic filler. Always produce deep, targeted, highly professional analysis.
4. NEVER treat all questions as mere summarization. Adapt your style entirely to the active reasoning mode.
5. ALWAYS preserve source traceability. You MUST cite relevant sources and use citation markers (e.g., [source_id/chunk_id]) to ground your analysis.
6. If multiple sources conflict, surface the conflict clearly instead of flattening or ignoring it.
7. If requested to make recommendations or suggest improvements, ground them deeply in observed evidence from the sources first (diagnose before suggesting).
8. If generating a report, gather broad evidence and write a structured, comprehensive document.
9. If analyzing character development or writing, analyze the source material as a creative literary work, examining behaviours, dialogues, pacing, emotions, and motivation, rather than treating it like a factual DB.
"""

EVIDENCE_ANSWER_TEMPLATE = """
User Query: {{ query }}

Reasoning Mode: Evidence Answer Mode (Concise, direct answer with clear supporting citations)

Source Evidence Provided:
{% for item in evidence %}
- [Source: {{ item.source_name }} (ID: {{ item.source_id }}, Chunk ID: {{ item.chunk_id }}), Label: {{ item.label or "N/A" }}]
  Content: "{{ item.chunk_text }}"
{% endfor %}

{% if evaluation.support_level == "partial support" %}
Note: The available evidence only partially supports this request. 
Unsupported or Missing Areas: {{ evaluation.unsupported_or_missing_areas }}
{% endif %}

Instructions:
Generate a direct, factual answer using ONLY the source evidence. Include citations in the format [source_id/chunk_id] right next to the facts. Do not hallucinate or use external general knowledge.
"""

REPORT_TEMPLATE = """
User Query: {{ query }}

Reasoning Mode: Report Mode (Comprehensive, structured report aggregating evidence across multiple topics)

Source Evidence Provided:
{% for item in evidence %}
- [Source: {{ item.source_name }} (ID: {{ item.source_id }}, Chunk ID: {{ item.chunk_id }}), Label: {{ item.label or "N/A" }}]
  Content: "{{ item.chunk_text }}"
{% endfor %}

{% if evaluation.support_level == "partial support" %}
Note: The available evidence only partially covers this report. 
Unsupported or Missing Areas: {{ evaluation.unsupported_or_missing_areas }}
{% endif %}

Instructions:
Generate a comprehensive, structured report using the following outline:
1. Title
2. Executive Summary
3. Key Findings (with specific source citations in [source_id/chunk_id] format)
4. Sectioned Analysis (aggregate evidence and organize into logical sections)
5. Risks, Gaps, or Blockers (including any missing or unsupported information)
6. Conclusion (based solely on sources)

Ensure every section is grounded with citations in [source_id/chunk_id] format.
"""

CRITIQUE_TEMPLATE = """
User Query: {{ query }}

Reasoning Mode: Critique Mode (Diagnosis followed by actionable, grounded suggestions)

Source Evidence Provided:
{% for item in evidence %}
- [Source: {{ item.source_name }} (ID: {{ item.source_id }}, Chunk ID: {{ item.chunk_id }}), Label: {{ item.label or "N/A" }}]
  Content: "{{ item.chunk_text }}"
{% endfor %}

{% if evaluation.support_level == "partial support" %}
Note: The available evidence only partially supports this critique. 
Unsupported or Missing Areas: {{ evaluation.unsupported_or_missing_areas }}
{% endif %}

Instructions:
Perform a deep, constructive critique using the following structure:
1. Diagnosis of Existing Material (What does the current material show? Use specific quotes and citations [source_id/chunk_id])
2. Key Weaknesses or Missed Opportunities (Identify patterns, lack of depth, inconsistencies, or gaps)
3. Recommended Improvements (Actionable suggestions deeply grounded in the observed material, with an optional priority order)

Ensure every recommendation is linked back to a specific observation in the diagnosis.
"""

NARRATIVE_ANALYSIS_TEMPLATE = """
User Query: {{ query }}

Reasoning Mode: Narrative Analysis Mode (Creative and structural analysis of characters, pacing, emotion, and dynamics)

Source Evidence Provided:
{% for item in evidence %}
- [Source: {{ item.source_name }} (ID: {{ item.source_id }}, Chunk ID: {{ item.chunk_id }}), Label: {{ item.label or "N/A" }}]
  Content: "{{ item.chunk_text }}"
{% endfor %}

{% if evaluation.support_level == "partial support" %}
Note: The available evidence only partially covers this narrative analysis. 
Unsupported or Missing Areas: {{ evaluation.unsupported_or_missing_areas }}
{% endif %}

Instructions:
Analyze the provided chapters or passages as a creative work of literature. Follow this structure:
1. Current Portrayal / Status (What are the character traits, dynamics, or themes visible in the text?)
2. Strengths already visible (Citing scenes/dialogues with [source_id/chunk_id])
3. Weaknesses, flat areas, or missing emotional beats/transitions (e.g., romance progression feeling unearned or abrupt)
4. Relationship Dynamics / Chemistry observed in the chapters
5. Practical Suggestions for improvement in future chapters (deeply grounded in recurring behavior, motivations, or dialogue style found in the sources)

Avoid generic advice. Ground all commentary in specific source passages using [source_id/chunk_id] citations.
"""

SYNTHESIS_TEMPLATE = """
User Query: {{ query }}

Reasoning Mode: Synthesis Mode (Integrating multiple viewpoints, highlighting conflict and uncertainty)

Source Evidence Provided:
{% for item in evidence %}
- [Source: {{ item.source_name }} (ID: {{ item.source_id }}, Chunk ID: {{ item.chunk_id }}), Label: {{ item.label or "N/A" }}]
  Content: "{{ item.chunk_text }}"
{% endfor %}

{% if evaluation.support_level == "partial support" %}
Note: The available evidence only partially covers this synthesis. 
Unsupported or Missing Areas: {{ evaluation.unsupported_or_missing_areas }}
{% endif %}

Instructions:
Synthesize the provided material into a coherent, comprehensive answer. 
- If multiple sources disagree, present the conflicting views clearly (e.g. "Source A claims X while Source B claims Y"). Do not attempt to flatten or silently resolve conflicts.
- Explicitly separate what is clearly shown, what is reasonably inferred, and what remains uncertain or unsupported.
- Use [source_id/chunk_id] citations throughout.
"""

REFUSAL_TEMPLATE = """
User Query: {{ query }}

Reasoning Mode: Refusal / Gap Mode (Polite refusal highlighting missing information)

Source Evidence Provided: None or extremely insufficient.

Instructions:
State clearly and politely that the current sources do not provide enough support to answer the user's query or that the query is out of scope.
Highlight what information or types of documents would be required to fulfill this request.
"""

def get_template_for_mode(mode: str) -> str:
    m = mode.lower()
    if "evidence answer" in m:
        return EVIDENCE_ANSWER_TEMPLATE
    elif "report" in m:
        return REPORT_TEMPLATE
    elif "critique" in m:
        return CRITIQUE_TEMPLATE
    elif "narrative" in m:
        return NARRATIVE_ANALYSIS_TEMPLATE
    elif "synthesis" in m:
        return SYNTHESIS_TEMPLATE
    else:
        return REFUSAL_TEMPLATE
