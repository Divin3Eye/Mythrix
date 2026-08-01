# Mythrix AI Workflow Engine

An advanced, source-grounded research and creation workspace reasoning pipeline. 

Rather than acting as a generic "search top chunks and summarize" chatbot, **Mythrix AI** understands the user's real objective first, identifies the type of task, determines a specific source usage strategy, evaluates evidence sufficiency, routes to the most optimal reasoning mode, and generates highly-structured, fully-grounded responses.

---

## Architecture & Stages

```
[ User Query ]
      |
      v
+-----------------------------+
| STAGE 1: Understand Intent  | (Classifies request type & flags analysis preferences)
+-----------------------------+
      |
      v
+-----------------------------+
| STAGE 2: Source Strategy    | (Determines retrieval scope & analysis rules)
+-----------------------------+
      |
      v
+-----------------------------+
| STAGE 3: Gather Evidence    | (Filters, scopes, and marks select evidence items)
+-----------------------------+
      |
      v
+-----------------------------+
| STAGE 4: Evaluate Support   | (Assesses sufficiency: strong, partial, weak, none)
+-----------------------------+
      |
      v
+-----------------------------+
| STAGE 5: Reasoning Mode     | (Routes to: Answer, Report, Critique, Narrative, etc.)
+-----------------------------+
      |
      v
+-----------------------------+
| STAGES 6, 7 & 8: Generate   | (Applies system guards & generates structured output)
+-----------------------------+
      |
      v
[ Structured Workflow Output ]
```

### Stage details

1. **STAGE 1: Understand user intent**
   - Classifies query into specific types (e.g. `direct factual answer`, `project status report`, `critique`, `narrative analysis`, `recommendation`, etc.).
   - Detects informational, synthesis, or recommendation preferences.

2. **STAGE 2: Determine source usage strategy**
   - Configures retrieval scope (`narrow`, `broad`, `pattern`, or `cross-source`).
   - Adapts analysis guidelines, creative narrative focus, and diagnosis requirement flags.

3. **STAGE 3: Gather evidence**
   - Tracks `source_id`, `source_name`, `chunk_id`, and `chunk_text` with precise selection reasoning.
   - Constrains search to user-selected sources when specified.

4. **STAGE 4: Evaluate source sufficiency**
   - Assesses if text volume and pattern density are enough for the selected intent.
   - Flags missing, unsupported, or incomplete coverage instead of silently hallucinating.

5. **STAGE 5: Choose reasoning mode**
   - Routes to one of 6 specialized reasoning modes:
     - **Evidence answer mode**
     - **Report mode**
     - **Critique mode**
     - **Narrative analysis mode**
     - **Synthesis mode**
     - **Refusal / gap mode**

6. **STAGE 6, 7 & 8: Response Generation & Execution**
   - Formulates deep context-rich prompts leveraging specialized Jinga2 reasoning mode templates.
   - Strictly enforces grounding principles (never hallucinate, avoid generic filler, surface contradictions instead of flattening them).
   - Generates fully structured output matching the requested schema.

---

## Installation & Setup

1. **Install Dependencies:**
   ```bash
   pip install pydantic openai jinja2 pytest
   ```

2. **Run Tests:**
   ```bash
   python -m pytest
   ```

3. **Environment Setup (Optional for LLM integration):**
   ```bash
   export OPENROUTER_API_KEY="your-openrouter-key"
   # OR
   export NVIDIA_API_KEY="your-nvidia-key"
   ```

---

## Usage Example

```python
from mythrix_workflow.models import SourceChunk, WorkflowInput
from mythrix_workflow.pipeline import execute_workflow

# 1. Define input parameters
input_data = WorkflowInput(
    user_query="How can I improve the love interest personality and character development in the series?",
    retrieved_chunks=[
        SourceChunk(
            chunk_id="ch1_chunk_1", 
            source_id="ch1", 
            source_name="Chapter 1", 
            chunk_text="He barely looked at her, his posture stiff as a board.", 
            label="Chapter 1"
        ),
        SourceChunk(
            chunk_id="ch2_chunk_1", 
            source_id="ch2", 
            source_name="Chapter 2", 
            chunk_text="He muttered a quick thank you before walking away.", 
            label="Chapter 2"
        )
    ]
)

# 2. Run the advanced workflow
output = execute_workflow(input_data)

# 3. Access structured results
print(output.detected_intent)           # 'narrative analysis'
print(output.selected_reasoning_mode)   # 'Narrative analysis mode'
print(output.support_level)             # 'partial support'
print(output.answer)                    # [Detailed diagnostic response]
```
