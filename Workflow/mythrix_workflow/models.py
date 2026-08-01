from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SourceChunk(BaseModel):
    chunk_id: str
    source_id: str
    source_name: str
    chunk_text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    # Optional page, section, chapter label
    label: Optional[str] = None

class WorkflowInput(BaseModel):
    user_query: str
    notebook_id: Optional[str] = None
    project_scope: Optional[str] = None
    source_documents: List[Dict[str, Any]] = Field(default_factory=list)
    extracted_web_content: List[Dict[str, Any]] = Field(default_factory=list)
    retrieved_chunks: List[SourceChunk] = Field(default_factory=list)
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)
    selected_sources: Optional[List[str]] = None

class EvidenceItem(BaseModel):
    source_id: str
    source_name: str
    chunk_id: str
    chunk_text: str
    label: Optional[str] = None
    why_selected: str

class WorkflowOutput(BaseModel):
    detected_intent: str
    selected_reasoning_mode: str
    support_level: str
    answer: str
    citations: List[Dict[str, Any]] = Field(default_factory=list)
    used_sources: List[str] = Field(default_factory=list)
    used_chunk_ids: List[str] = Field(default_factory=list)
    evidence_notes: List[str] = Field(default_factory=list)
    uncertainty_or_gaps: Optional[str] = None
    internal_explanation: str
