import { EvidenceItem, SufficiencyEvaluation } from "./models";

export const SYSTEM_PROMPT = `You are Mythrix AI, an advanced, highly intelligent source-grounded research and creation workspace. 
You are NOT a generic chatbot or a simple source scraper. Your purpose is to act as a brilliant, faithful project and writing assistant.

Core grounded rules:
1. NEVER silently answer from general knowledge when the corpus does not support it.
2. NEVER pretend scraped pages are enough if they are shallow.
3. NEVER output generic filler. Always produce deep, targeted, highly professional analysis.
4. NEVER treat all questions as mere summarization. Adapt your style entirely to the active reasoning mode.
5. ALWAYS preserve source traceability. You MUST cite relevant sources using the source name in brackets like [Source: filename.txt] to ground your analysis.
6. If multiple sources conflict, surface the conflict clearly instead of flattening or ignoring it.
7. If requested to make recommendations or suggest improvements, ground them deeply in observed evidence from the sources first (diagnose before suggesting).
8. If generating a report, gather broad evidence and write a structured, comprehensive document.
9. If analyzing character development or writing, analyze the source material as a creative literary work, examining behaviours, dialogues, pacing, emotions, and motivation, rather than treating it like a factual DB.

Formatting rules:
- Use markdown formatting with proper headers (##, ###), bullet points, and spacing.
- Add blank lines between sections for readability.
- Use **bold** for key terms and emphasis.
- Keep citations short: [Source: filename.txt] — NOT long UUIDs.
- Write concise, well-structured responses. Avoid repetition.`;

function renderEvidence(evidence: EvidenceItem[]): string {
  // Group evidence by source and show only source names
  const sourceMap = new Map<string, EvidenceItem[]>();
  for (const item of evidence) {
    const existing = sourceMap.get(item.source_name) || [];
    existing.push(item);
    sourceMap.set(item.source_name, existing);
  }

  return Array.from(sourceMap.entries())
    .map(([name, items]) => {
      const preview = items[0].chunk_text.slice(0, 200);
      return `- Source: ${name}\n  Preview: "${preview}${items[0].chunk_text.length > 200 ? "..." : ""}"`;
    })
    .join("\n\n");
}

function renderSupportNote(evaluation: SufficiencyEvaluation): string {
  if (evaluation.support_level === "partial support") {
    return `\nNote: The available evidence only partially supports this request. \nUnsupported or Missing Areas: ${evaluation.unsupported_or_missing_areas}`;
  }
  return "";
}

export function getTemplateForMode(mode: string): (args: { query: string; evidence: EvidenceItem[]; evaluation: SufficiencyEvaluation }) => string {
  const m = mode.toLowerCase();

  if (m.includes("evidence answer")) {
    return ({ query, evidence, evaluation }) => `User Query: ${query}

Reasoning Mode: Evidence Answer Mode (Concise, direct answer with clear supporting citations)

Source Evidence Provided:
${renderEvidence(evidence)}
${renderSupportNote(evaluation)}

Instructions:
Generate a direct, factual answer using ONLY the source evidence. Include citations using [Source: filename] format. Do not hallucinate. Keep the response concise and well-formatted with markdown.`;
  }

  if (m.includes("report")) {
    return ({ query, evidence, evaluation }) => `User Query: ${query}

Reasoning Mode: Report Mode (Comprehensive, structured report aggregating evidence across multiple topics)

Source Evidence Provided:
${renderEvidence(evidence)}
${renderSupportNote(evaluation)}

Instructions:
Generate a comprehensive, structured report using markdown:
## Title
### Executive Summary
### Key Findings (cite sources as [Source: filename])
### Sectioned Analysis
### Risks, Gaps, or Blockers
### Conclusion

Keep sections concise. Use bullet points and bold for key terms.`;
  }

  if (m.includes("critique")) {
    return ({ query, evidence, evaluation }) => `User Query: ${query}

Reasoning Mode: Critique Mode (Diagnosis followed by actionable, grounded suggestions)

Source Evidence Provided:
${renderEvidence(evidence)}
${renderSupportNote(evaluation)}

Instructions:
Perform a constructive critique using this structure:
### Diagnosis of Existing Material
(What does the current material show? Cite as [Source: filename])
### Key Weaknesses
### Recommended Improvements

Keep each section concise. Link recommendations to observations.`;
  }

  if (m.includes("narrative")) {
    return ({ query, evidence, evaluation }) => `User Query: ${query}

Reasoning Mode: Narrative Analysis Mode (Creative and structural analysis of characters, pacing, emotion, and dynamics)

Source Evidence Provided:
${renderEvidence(evidence)}
${renderSupportNote(evaluation)}

Instructions:
Analyze as a creative work of literature:
### Current Portrayal
### Strengths (cite as [Source: filename])
### Weaknesses & Flat Areas
### Relationship Dynamics
### Practical Suggestions

Ground all commentary in specific source passages. Keep concise.`;
  }

  if (m.includes("synthesis")) {
    return ({ query, evidence, evaluation }) => `User Query: ${query}

Reasoning Mode: Synthesis Mode (Integrating multiple viewpoints, highlighting conflict and uncertainty)

Source Evidence Provided:
${renderEvidence(evidence)}
${renderSupportNote(evaluation)}

Instructions:
Synthesize into a coherent answer:
- Present conflicting views clearly if sources disagree
- Separate: clearly shown facts, reasonable inferences, uncertain/unsupported areas
- Cite as [Source: filename]
- Keep well-formatted with markdown headers and bullet points`;
  }

  // Refusal / gap mode
  return ({ query }) => `User Query: ${query}

Reasoning Mode: Refusal / Gap Mode

Instructions:
Politely state that current sources do not provide enough support. Explain what information would be needed.`;
}
