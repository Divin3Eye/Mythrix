import pytest
from mythrix_workflow.models import SourceChunk, WorkflowInput
from mythrix_workflow.pipeline import execute_workflow

def test_project_status_report_workflow():
    inp = WorkflowInput(
        user_query="Give me a complete report on the project right now.",
        retrieved_chunks=[
            SourceChunk(
                chunk_id="chunk_1", 
                source_id="src_doc", 
                source_name="Project Plan", 
                chunk_text="Milestone 1 completed. Active development on stage 2 is ongoing. We have finished implementing all front-end mock views and started back-end integration of the API endpoints. Deployment pipeline is ready and tested successfully.", 
                label="Section 1"
            ),
            SourceChunk(
                chunk_id="chunk_2", 
                source_id="src_doc", 
                source_name="Project Plan", 
                chunk_text="Blocker identified: Database migration is taking longer than expected. The team needs to optimize the index schema before going live, which might shift the final deadline by up to five days. We are scheduling an emergency triage meeting to review the performance bottlenecks.", 
                label="Section 2"
            ),
            SourceChunk(
                chunk_id="chunk_3", 
                source_id="src_web", 
                source_name="API Spec Webpage", 
                chunk_text="REST endpoints defined and approved. Security assessment is still pending. All active API paths are fully documented with response formats and error schemas. Swagger UI is hosted locally and accessible to external partner teams.", 
                label="Appendix A"
            )
        ]
    )
    
    out = execute_workflow(inp, use_llm_if_available=False)
    
    assert out.detected_intent == "project status report"
    assert out.selected_reasoning_mode == "Report mode"
    assert out.support_level == "strong support"
    assert "Project Status Report" in out.answer
    assert "chunk_1" in out.used_chunk_ids
    assert "chunk_2" in out.used_chunk_ids
    assert "chunk_3" in out.used_chunk_ids
    assert len(out.citations) == 3

def test_narrative_analysis_workflow():
    inp = WorkflowInput(
        user_query="How can I improve the love interest personality and character development in the series?",
        retrieved_chunks=[
            SourceChunk(chunk_id="ch1_chunk", source_id="ch1", source_name="Chapter 1", chunk_text="He barely looked at her, his posture stiff as a board.", label="Chapter 1"),
            SourceChunk(chunk_id="ch2_chunk", source_id="ch2", source_name="Chapter 2", chunk_text="He muttered a quick thank you before walking away.", label="Chapter 2")
        ]
    )
    
    out = execute_workflow(inp, use_llm_if_available=False)
    
    assert out.detected_intent == "narrative analysis"
    assert out.selected_reasoning_mode == "Narrative analysis mode"
    assert out.support_level == "partial support" # small chunks trigger partial
    assert "Creative Portrayal Analysis" in out.answer
    assert "ch1_chunk" in out.used_chunk_ids
    assert "ch2_chunk" in out.used_chunk_ids
    assert out.uncertainty_or_gaps is not None

def test_refusal_mode_workflow():
    # If no support/evidence is available
    inp = WorkflowInput(
        user_query="What is the weather like in Paris right now?",
        retrieved_chunks=[]
    )
    
    out = execute_workflow(inp, use_llm_if_available=False)
    
    assert out.selected_reasoning_mode == "Refusal / gap mode"
    assert out.support_level == "no support"
    assert "sufficient evidence to answer" in out.answer
