export interface SourceChunk {
  chunk_id: string;
  source_id: string;
  source_name: string;
  chunk_text: string;
  metadata?: Record<string, unknown>;
  label?: string;
}

export interface WorkflowInput {
  user_query: string;
  notebook_id?: string;
  project_scope?: string;
  source_documents?: Record<string, unknown>[];
  extracted_web_content?: Record<string, unknown>[];
  retrieved_chunks: SourceChunk[];
  conversation_history?: Record<string, unknown>[];
  selected_sources?: string[];
}

export interface EvidenceItem {
  source_id: string;
  source_name: string;
  chunk_id: string;
  chunk_text: string;
  label?: string;
  why_selected: string;
}

export interface WorkflowOutput {
  detected_intent: string;
  selected_reasoning_mode: string;
  support_level: string;
  answer: string;
  citations: Record<string, unknown>[];
  used_sources: string[];
  used_chunk_ids: string[];
  evidence_notes: string[];
  uncertainty_or_gaps?: string;
  internal_explanation: string;
}

export interface IntentAnalysis {
  intent_type: string;
  wants_information_retrieval: boolean;
  wants_analysis: boolean;
  wants_improvement_suggestions: boolean;
  wants_synthesis_across_sources: boolean;
  output_format_preference: string;
  explanation: string;
}

export interface SourceUsageStrategy {
  retrieval_scope: string;
  analysis_guidelines: string[];
  should_separate_inference_levels: boolean;
  requires_diagnosis_first: boolean;
  creative_narrative_focus: boolean;
}

export interface SufficiencyEvaluation {
  support_level: string;
  unsupported_or_missing_areas?: string;
  explanation: string;
}
