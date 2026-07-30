# Mythrix AI — Product Requirements Document

**Version:** 2.0
**Date:** 2026-07-28
**Supersedes:** v1.0 (2026-07-28)
**Status:** Pre-launch — core retrieval loop not yet functional (see §3, Current State Audit)
**Owner:** Founder / Product
**Target Domain:** app.mythrixai.xyz

---

## 0. How to read this document

v1.0 was an architecture specification labelled as a PRD. It described what had been built but never stated who it was for, what problem it solved, what was deliberately out of scope, or how anyone would know a phase was done. That gap allowed the project to report "Phases 1–9.5 complete" while the retrieval pipeline that defines the product did not run at all.

v2.0 fixes that. It is organised so that every engineering task traces back to a user problem and forward to a testable acceptance criterion.

| Section | Answers |
|---|---|
| §1–§2 | Who is this for and what problem does it solve |
| §3 | What is actually true today, honestly baselined |
| §4 | What we are explicitly not building |
| §5 | How we measure success |
| §6–§7 | Product principles and design system |
| §8 | Functional requirements with acceptance criteria |
| §9–§13 | Technical specification |
| §14 | Phase plan with exit gates |
| §15–§17 | Debt, risks, open questions |

**Definition of Done (applies to every requirement in §8):** a requirement is complete only when its acceptance criteria pass in the production environment, against a real user account, with no manual intervention. Code merged is not done. Deployed is not done. Verified against criteria is done.

---

## 1. Product overview

### 1.1 What Mythrix is

Mythrix is an AI research workspace for people who work with their own documents. Users collect sources into notebooks, ask questions grounded in those sources, and generate artifacts — reports, summaries, study guides, flashcards, timelines — that remain traceable to the passages they came from.

### 1.2 Positioning statement

> For researchers, analysts, and graduate students who cannot trust a general chatbot with source-critical work, Mythrix is an AI workspace that answers only from the documents you give it and shows you exactly where every claim came from. Unlike ChatGPT with file upload, which forgets your corpus between sessions, and unlike NotebookLM, which locks you into one model and one workflow, Mythrix keeps a persistent, organised, citable knowledge base you own.

### 1.3 The three-sentence differentiation

- Chat tools answer questions but forget your corpus.
- Storage tools hold documents but cannot reason over them.
- Mythrix turns a document collection into a working research system where every output is traceable.

### 1.4 Core value proposition

1. **Grounded** — answers derive from user sources, with inline citations to specific chunks
2. **Organised** — notebooks scope both storage and retrieval; nothing leaks across projects
3. **Productive** — artifacts convert research into deliverables without leaving the workspace
4. **Owned** — user data is isolated per tenant, exportable, and deletable

**The non-negotiable:** citation traceability. If a user cannot click a sentence and see the passage behind it, Mythrix is a chat app with file upload and has no reason to exist. Every roadmap decision defers to this.

---

## 2. Users and problems

### 2.1 Primary persona — Priya, the independent researcher

- **Context:** 29, policy researcher at a small think tank, 3-person team, no research-ops budget
- **Corpus:** 40–200 PDFs per project — government reports, academic papers, scanned filings
- **Current workflow:** Zotero for storage, ChatGPT for synthesis, manual re-upload every session, Notion for notes
- **Jobs to be done:**
  - When I start a project, I want to load my whole corpus once so I can query it for weeks without re-uploading
  - When I get an answer, I want to verify it against the original passage so I can cite it in published work
  - When I finish a research phase, I want a structured draft so I do not start writing from a blank page
- **Pain being solved:** she cannot publish anything derived from an AI answer she cannot verify. Verification currently costs more time than the AI saved.
- **Success for Priya:** she cites a Mythrix-generated passage in a published brief, having verified it in one click.

### 2.2 Secondary persona — Arjun, the graduate student

- **Context:** 23, master's coursework plus thesis, price-sensitive, on free tiers of six tools
- **Corpus:** 10–30 sources per module — lecture slides, book chapters, papers
- **Jobs to be done:**
  - When exams approach, I want study guides and flashcards from my own reading list, not generic internet content
  - When I skim a dense paper, I want a summary that tells me whether it is worth reading fully
- **Pain being solved:** generic AI study material does not match what his professor will actually examine.
- **Success for Arjun:** he generates a study guide from his real syllabus sources and uses it as his primary revision material.

### 2.3 Tertiary persona — Meera, the analyst-consultant

- **Context:** 34, independent strategy consultant, bills by the hour
- **Corpus:** client-supplied decks, market reports, transcripts — often confidential
- **Jobs to be done:**
  - When a client engagement starts, I want a per-client workspace with hard separation
  - When I deliver, I want an export that looks like my work, not an AI tool's output
- **Pain being solved:** she cannot put confidential client material into a tool without tenancy and retention guarantees.
- **Success for Meera:** she runs two client engagements in parallel with zero cross-contamination and exports a branded PDF.
- **Note:** Meera drives the Phase 12 requirements (workspaces, RBAC, retention policy). She is not a launch persona but her needs shape the schema now so we avoid a migration later.

### 2.4 Explicit anti-personas

We are not building for these users and should decline feature requests that only serve them:

- **The general chatbot user** who wants Mythrix to answer questions with no sources loaded. Ungrounded chat is a different product with different economics.
- **The enterprise buyer** needing SSO, SOC 2, audit export, and procurement review. Revisit no earlier than Phase 13.
- **The developer** who wants Mythrix as an API-first RAG backend. That is a platform business, not this one.
- **The team collaborating in real time** on the same document. Multiplayer editing is a large engineering surface serving a small share of the launch audience.

---

## 3. Current state audit

v1.0 claimed "Phases 1–9.5 Complete." Re-baselined against the acceptance criteria in §8, that claim does not hold. The table below is the honest state.

| Capability | v1.0 claim | Verified reality | Real status |
|---|---|---|---|
| Auth and sessions | Complete | Working | ✅ Done |
| Notebook CRUD and soft delete | Complete | Working; no purge job for expired records | 🟡 Partial |
| File upload to storage | Complete | Working | ✅ Done |
| Text extraction and chunking | Complete | Code exists at `/api/process-source`; never invoked from client | ❌ Not functional |
| Embedding generation | Complete | Never runs, because processing never runs | ❌ Not functional |
| RAG retrieval | Complete | `match_document_chunks()` exists but queries an empty `document_chunks` table | ❌ Not functional |
| Grounded chat | Complete | Runs, but retrieves nothing — answers come from base model weights | ❌ Misleading |
| Citations | Not mentioned | No schema, no UI, no plumbing | ❌ Absent |
| Artifact generation | Complete | Generates from ungrounded context | 🟡 Wrong output |
| Source status display | Complete | Sets `ready` on upload confirm, before processing — the UI reports success for unusable files | ❌ Incorrect |
| Multimodal support | Complete | Images/audio/video stored but never extracted; `@file` mention contributes nothing | ❌ Overclaimed |
| Streaming responses | Not mentioned | Absent — full completion awaited before display | ❌ Absent |
| Usage metering and quotas | Not mentioned | Absent; `profiles.plan` defaults to `free` and is unenforced | ❌ Absent |

### 3.1 The critical path

Three defects compound into one product-level failure:

1. **Processing is never triggered.** `confirmSourceUpload()` completes the upload and stops. `POST /api/process-source` is dead code.
2. **Status lies.** Because `confirmSourceUpload()` sets `status: "ready"`, the UI shows a green badge on a file with zero chunks.
3. **Retrieval fails silently.** `match_document_chunks()` returns an empty set, the prompt gets no context, and the model answers from its own weights — confidently and unverifiably.

The user-visible result is the worst possible failure mode for a research tool: it appears to work while producing ungrounded output. **No new feature ships until §14 Phase A closes.**

### 3.2 Corrections to the v1.0 technical spec

| v1.0 statement | Correction |
|---|---|
| "Reciprocal rank fusion (alpha=0.7 vector, 0.3 keyword)" | RRF is rank-based — `Σ 1/(k + rank)` — and takes no similarity weights. v1.0 described **weighted score fusion**. v2.0 specifies true RRF (§11.3), because the two scoring scales (cosine vs trigram) are not comparable and weighted fusion on incomparable scales is unstable. |
| "`p_min_similarity` default 0.5" | Too aggressive. `text-embedding-3-small` routinely scores relevant chunks at 0.30–0.45. A 0.5 floor silently returns nothing. New default: **0.25**, with top-K and reranking doing the quality work. |
| "Indexes: ivfflat (lists=100) + HNSW" | Two ANN indexes on one column: only one is used by the planner, both are maintained on write. **Keep HNSW, drop ivfflat.** |
| "RLS on all tables" listed as a security control, while "service role bypasses RLS for writes" | These cancel out. RLS protects reads only. Every service-layer write requires an explicit ownership assertion (§12.2). This is the highest-likelihood cross-tenant leak path. |
| "OPENROUTER (`openai/text-embedding-3-small`)" flagged as risky | **Confirmed viable.** OpenRouter ships an OpenAI-compatible `/embeddings` endpoint with `openai/text-embedding-3-small` at $0.02 per million input tokens, 8K context ([OpenRouter embeddings documentation](https://openrouter.ai/docs/api_reference/embeddings), [model page](https://openrouter.ai/openai/text-embedding-3-small)). Third-party guides claiming OpenRouter has no embeddings API predate the October 2025 launch and should be disregarded. |
| 50MB upload limit with synchronous processing | A 50MB PDF exceeds serverless execution limits during extract → chunk → embed. Requires a job queue (§10.3). Interim: lower the limit to 25MB until the queue lands. |
| `shares.permission` allows `comment` and `edit` | No comments table exists and no authorisation path exists for an anonymous editor. Constrain to `view` until the supporting features exist. |

---

## 4. Non-goals

Stating these prevents scope creep and gives a defensible answer to feature requests.

### 4.1 Not building, ever

- **Ungrounded general-purpose chat.** If a notebook has no ready sources, chat is disabled with an explanatory empty state. We will not add a "chat without sources" toggle.
- **Dark mode.** Light theme only. A deliberate identity choice, not an unfinished task.
- **Model training on user data.** No user content is used to train or fine-tune anything, ever. This is a marketing asset, not just a policy.
- **Web search inside answers.** Mythrix answers from user sources. Blending web results destroys the traceability guarantee.

### 4.2 Not building before Phase 13

- Real-time collaborative editing (CRDT/OT, presence, cursors)
- SSO, SAML, SCIM provisioning
- SOC 2 / ISO 27001 certification
- Native mobile applications (responsive web only)
- Desktop application
- Browser extension for web clipping
- Plugin or extension system
- Localisation beyond English
- White-label or on-premise deployment

### 4.3 Deliberately deferred, with rationale

| Deferred | Rationale | Earliest |
|---|---|---|
| OCR for scanned PDFs | Adds a heavy dependency and per-page cost. Ship with clear detection and an honest error message first, measure real demand. | Phase C |
| Audio/video transcription | Whisper-class transcription is expensive relative to free-tier economics. Remove the claim until funded. | Phase C |
| Image understanding via vision models | Same cost logic. Images remain storable and previewable, not queryable. | Phase C |
| Artifact versioning | Users must first generate artifacts worth versioning. | Phase D |
| PDF export | Markdown export unblocks the workflow. PDF is polish that Meera needs and Arjun does not. | Phase D |
| Multi-hop and query-expansion RAG | Single-hop retrieval must be measurably good before adding complexity. | Phase E |

**Important:** §4.3 items currently appear in the UI as supported. They must be removed from the supported-file-type list and marketing copy in Phase A. Shipping a claim you cannot honour costs more trust than shipping fewer features.

---

## 5. Success metrics

### 5.1 North star

**Weekly Verified Research Actions (WVRA)** — the count of weeks in which a user either (a) expands a citation to inspect its source passage, or (b) exports or shares an artifact.

This metric is chosen because it only increments when the product delivers its actual promise: grounded output that a user trusts enough to inspect or ship. Message count would reward chatter. Upload count would reward hoarding. WVRA rewards verified usefulness.

### 5.2 Product metrics

| Metric | Definition | Launch target | 90-day target |
|---|---|---|---|
| Activation rate | Signups completing upload → ready → grounded answer within 24h | 40% | 60% |
| Time to first grounded answer | Signup → first cited assistant message, median | < 6 min | < 3 min |
| Citation inspection rate | Assistant messages with ≥1 citation expanded | 25% | 35% |
| Grounding rate | Assistant messages citing ≥1 retrieved chunk | 90% | 95% |
| Artifact completion rate | Generations reaching `ready` without error | 95% | 98% |
| Week-4 retention | Users active in week 4 after signup | 20% | 30% |
| Corpus depth | Median ready sources per active notebook | 8 | 15 |

### 5.3 Quality metrics

These gate release. A phase does not ship if any red-line is breached.

| Metric | Definition | Target | Red line |
|---|---|---|---|
| Retrieval recall@10 | On a 50-question golden set, share where a known-correct chunk appears in top 10 | ≥ 85% | < 70% |
| Citation precision | Sampled citations where the cited chunk genuinely supports the claim | ≥ 90% | < 80% |
| Hallucination rate | Sampled answers containing a claim unsupported by any retrieved chunk | ≤ 5% | > 10% |
| Processing success rate | Uploads reaching `ready` with `chunk_count > 0` | ≥ 97% | < 90% |
| Status accuracy | Sources marked `ready` that actually have chunks | 100% | < 100% |

**The golden set is a Phase A deliverable, not an afterthought.** 50 questions across 10 documents with hand-labelled correct chunks, versioned in `tests/golden/`. Without it, every retrieval change is a guess.

### 5.4 Technical metrics

| Metric | Target | Red line |
|---|---|---|
| Time to first streamed token | < 1.5s p95 | > 4s |
| Retrieval query latency | < 400ms p95 | > 1s |
| Processing throughput | < 90s p95 for a 20-page PDF | > 300s |
| Uptime | 99.5% | < 99% |
| Cross-tenant data leaks | 0 | any |

### 5.5 Business metrics

| Metric | Launch target |
|---|---|
| Gross AI cost per active user per month | < $0.60 |
| Free-tier cost ceiling per user per month | Hard cap $1.00, enforced |
| Free → paid conversion | 3% (measure only from Phase D) |

Cost per active user under $0.60 is achievable: indexing 100 documents at roughly 8K tokens each is about 800K tokens, or $0.016 at `text-embedding-3-small` pricing ([OpenRouter](https://openrouter.ai/openai/text-embedding-3-small)). Chat and artifact generation on `gpt-4o-mini` dominate the remainder. This is a monitored budget, not an assumption — §13 defines enforcement.

---

## 6. Product principles

1. **Never fake grounding.** If retrieval returns nothing, say so. Do not fall back to an ungrounded answer without labelling it.
2. **Status must be true.** A badge that says `ready` means queryable, always. Trust in state is trust in the product.
3. **Every claim is traceable.** Citations are infrastructure, not a feature flag.
4. **Fail visibly and recoverably.** Errors state what happened, why, and the next action. Every failed job is retryable by the user.
5. **The corpus is the moat.** Investment goes to making a large personal corpus fast, organised, and reliable — not to breadth of file types.
6. **Cost is a product constraint.** A feature that cannot be metered cannot ship on a free tier.
7. **Calm interface.** Research is cognitively expensive. The tool contributes no additional load.

---

## 7. Design system

Carried forward from v1.0 with additions for citation and job-state surfaces.

### 7.1 Colors

| Token | Value | Usage |
|---|---|---|
| `--bg-page` | `#ffffff` | Page background |
| `--bg-primary` | `#fafafa` | Sidebar, cards |
| `--bg-secondary` | `#f5f5f5` | Input areas |
| `--bg-elevated` | `#ffffff` | Popovers, modals |
| `--border-default` | `#e5e5e5` | Standard borders |
| `--border-subtle` | `#f0f0f0` | Dividers |
| `--text-primary` | `#171717` | Headings |
| `--text-secondary` | `#525252` | Body text |
| `--text-tertiary` | `#a3a3a3` | Hints, labels |
| `--accent-primary` | `#171717` | Primary actions |
| `--accent-surface` | `#f5f5f5` | Hover states |
| `--citation-bg` | `#f0f4ff` | **New** — citation pill background |
| `--citation-border` | `#c7d2fe` | **New** — citation pill border |
| `--citation-text` | `#3730a3` | **New** — citation pill text, contrast 7.8:1 on `--citation-bg` |
| `--status-ready` | `#16a34a` | Ready state |
| `--status-processing` | `#ca8a04` | Processing state |
| `--status-error` | `#dc2626` | Error state |

### 7.2 Typography

- **UI:** Inter (400, 500, 600) — `font-sans`
- **AI prose:** Newsreader (400, 500, 600) — `font-serif`
- **Code:** JetBrains Mono — `font-mono`

### 7.3 Spacing and layout

- 8px spacing grid (`--spacing-unit: 8px`)
- Sidebar width 280px; citation drawer width 400px
- Radii: 8px cards, 6px inputs, 12px modals, 4px citation pills
- Max content width: 768px prose, 1200px workspace

### 7.4 Component standards

- Buttons 36px height, 8px radius, minimal
- Cards 1px border, subtle shadow, no gradients
- Inputs light gray background, 1px border, visible focus ring
- Citation pills inline, superscript-adjacent, keyboard focusable, expand into the citation drawer
- Job-state indicators show a determinate progress bar when total chunk count is known, indeterminate otherwise

### 7.5 Accessibility requirements

- WCAG AA contrast minimum throughout — verified, not assumed
- Full keyboard navigation, including the mention dropdown and the citation drawer
- Visible focus indicators; no focus traps
- Streaming responses announced to screen readers via a polite live region
- **No nested interactive elements.** See §15 — approximately 50 nested-button instances remain and are both a hydration bug and an accessibility defect.

---

## 8. Functional requirements

Requirement IDs are stable and referenced by the phase plan in §14. Priority: **P0** blocks launch, **P1** is needed for a credible launch, **P2** is post-launch.

### 8.1 Authentication — `AUTH`

| ID | Requirement | Priority |
|---|---|---|
| AUTH-1 | Email/password signup and login via Supabase Auth | P0 |
| AUTH-2 | Session in HttpOnly, Secure cookies; middleware protects all routes except `/login`, `/signup`, `/auth/callback`, `/share/[token]` | P0 |
| AUTH-3 | Profile row auto-created on first login via DB trigger | P0 |
| AUTH-4 | Rate limiting on auth routes: 5 attempts per 15 min per IP | P0 |
| AUTH-5 | Password reset by email | P1 |
| AUTH-6 | Google OAuth | P2 |

**Acceptance criteria**
- Signup with a valid email creates `auth.users` and `profiles` rows and lands on `/dashboard`
- An unauthenticated request to any `/dashboard/*` path redirects to `/login` with no data in the response body
- Six failed logins from one IP within 15 minutes return HTTP 429
- Session persists across browser restart; logout invalidates it server-side
- Session cookie carries `HttpOnly`, `Secure`, and `SameSite=Lax`, verified in browser devtools

### 8.2 Notebooks — `NB`

| ID | Requirement | Priority |
|---|---|---|
| NB-1 | Create notebook with title, optional description, color, icon | P0 |
| NB-2 | List notebooks in a grid with source and artifact counts | P0 |
| NB-3 | Update notebook metadata | P0 |
| NB-4 | Soft delete with 30-day retention and restore | P0 |
| NB-5 | Scheduled purge of records past retention, including storage objects | P0 |
| NB-6 | Permanent delete on demand, cascading to sources, chunks, conversations, artifacts, and storage | P0 |
| NB-7 | Notebook search by title and description | P1 |

**Acceptance criteria**
- A created notebook appears in the grid without a manual page refresh
- Counts shown on a card match `SELECT count(*)` for that notebook's sources and artifacts
- Soft delete removes the notebook from the default grid, keeps the row with `deleted_at` set, and preserves all children
- Restore within 30 days returns the notebook with all sources still `ready` and queryable
- A pg_cron job runs daily and hard-deletes notebooks with `deleted_at < now() - interval '30 days'`, including their storage objects; verified by seeding an expired record and confirming both row and object are gone
- Permanent delete leaves zero orphaned rows in `document_chunks` and zero orphaned objects in the `documents` bucket

### 8.3 Source ingestion — `SRC`

This is the module whose failure defines the current state. Requirements are written to make the failure impossible to reproduce.

| ID | Requirement | Priority |
|---|---|---|
| SRC-1 | Upload via drag-drop or file picker, multiple files at once | P0 |
| SRC-2 | Upload direct to Supabase Storage via signed URL; metadata row created first | P0 |
| SRC-3 | **Processing job enqueued automatically on upload confirmation.** No client action required, no manual trigger. | P0 |
| SRC-4 | **Status reflects true processing state:** `pending` → `processing` → `ready` \| `error`. `ready` is set only when `chunk_count > 0`. | P0 |
| SRC-5 | Text extraction: PDF (`pdf-parse`), DOCX (`mammoth`), TXT, MD, CSV | P0 |
| SRC-6 | Chunking at 1000 characters with 200-character overlap, preserving page or section metadata where the parser exposes it | P0 |
| SRC-7 | Embedding via OpenRouter `openai/text-embedding-3-small`, batched, 1536 dimensions | P0 |
| SRC-8 | Idempotent processing — re-running a job for the same source does not duplicate chunks | P0 |
| SRC-9 | Retry with exponential backoff, max 3 attempts, then terminal `error` with a human-readable message | P0 |
| SRC-10 | User-initiated retry on any errored source | P0 |
| SRC-11 | Live status updates via Supabase Realtime or 3-second polling | P0 |
| SRC-12 | Scanned-PDF detection: zero extractable text produces a specific error — "This PDF appears to be a scan. Text extraction requires OCR, which Mythrix does not yet support." | P0 |
| SRC-13 | **Remove images, audio, and video from the accepted-type list** until extraction exists | P0 |
| SRC-14 | Sortable and filterable source list with bulk delete | P1 |
| SRC-15 | Source preview with a chunk inspector | P1 |
| SRC-16 | Tagging | P2 |

**Acceptance criteria**
- Uploading a 10-page text PDF results, with no further user action, in `status = 'ready'` and `chunk_count > 0` within 90 seconds
- During processing the card shows `processing`; it never shows `ready` before chunks exist. Verified by polling the DB every 500ms through a full upload and asserting no row is ever `ready` with `chunk_count = 0`
- `SELECT count(*) FROM source_files WHERE status = 'ready' AND chunk_count = 0` returns 0 across the entire production table
- Uploading the same file twice produces two independent sources, each with its own chunks; re-running the job for one source leaves its chunk count unchanged
- A source whose embedding call fails three times reaches `status = 'error'` with a populated `error_message`, and the retry button re-enqueues successfully
- A scanned PDF produces the SRC-12 message, not a generic failure
- A 25MB, 400-page PDF completes without a function timeout
- Attempting to upload a `.png` is rejected client-side with a clear message; no accepted-type list in the UI or marketing copy mentions images, audio, or video
- Deleting a source removes its storage object, its rows in `document_chunks`, and decrements nothing that is now stale

### 8.4 Grounded chat — `CHAT`

| ID | Requirement | Priority |
|---|---|---|
| CHAT-1 | Create conversations scoped to a notebook | P0 |
| CHAT-2 | Send a message and receive an assistant reply grounded in notebook sources | P0 |
| CHAT-3 | **Response streams token by token** | P0 |
| CHAT-4 | **Every assistant message stores the chunk IDs used to produce it** | P0 |
| CHAT-5 | **Inline citation pills render in assistant prose and open a drawer showing the source passage, filename, and page or chunk index** | P0 |
| CHAT-6 | When retrieval returns no chunks above threshold, the assistant states that the sources do not cover the question. It does not answer from base-model knowledge. | P0 |
| CHAT-7 | Chat is disabled with an explanatory empty state when a notebook has zero `ready` sources | P0 |
| CHAT-8 | `@file` mention autocomplete scopes retrieval to the mentioned sources | P1 |
| CHAT-9 | Model selection per conversation from the approved list | P1 |
| CHAT-10 | Context-window management: summarise or window older turns before exceeding the model limit | P1 |
| CHAT-11 | Conversation auto-titling from the first exchange | P2 |
| CHAT-12 | Regenerate response | P2 |

**Acceptance criteria**
- Asking a question answerable from an uploaded document yields an answer containing at least one citation pill
- First token renders within 1.5s p95, measured over 50 requests
- Clicking a citation opens the drawer showing verbatim chunk text; the text is present in the original document, confirmed by string search
- `messages.metadata.citations` contains chunk IDs matching the pills rendered, one to one
- Asking a question with no support in the corpus returns a refusal referencing the source gap, with zero citation pills — verified across 10 deliberately off-corpus questions
- A notebook with zero ready sources shows a disabled composer and guidance to upload
- On the 50-question golden set, recall@10 ≥ 85% and citation precision ≥ 90% on a 20-answer manual sample
- A 60-turn conversation still responds without a context-length error
- A user cannot load, by any route or API call, a conversation belonging to another user — verified by direct request with a valid session and a foreign conversation ID

### 8.5 Retrieval engine — `RAG`

| ID | Requirement | Priority |
|---|---|---|
| RAG-1 | Hybrid retrieval combining pgvector cosine similarity and pg_trgm keyword similarity | P0 |
| RAG-2 | **True reciprocal rank fusion**, `Σ 1/(60 + rank)`, replacing weighted score fusion | P0 |
| RAG-3 | Notebook and user scoping enforced inside the SQL function, not the caller | P0 |
| RAG-4 | Optional `source_ids` filter for mention-scoped retrieval | P0 |
| RAG-5 | Similarity floor default 0.25, top-K default 10 | P0 |
| RAG-6 | Return chunk ID, content, source filename, and chunk index for citation rendering | P0 |
| RAG-7 | Golden-set evaluation harness runnable as one command | P0 |
| RAG-8 | HNSW index on `document_chunks.embedding`; ivfflat dropped | P0 |
| RAG-9 | Cross-encoder reranking of the top 30 down to top 10 | P2 |
| RAG-10 | Query expansion and multi-hop | P2 |

**Acceptance criteria**
- `match_document_chunks()` given a foreign `p_user_id` returns zero rows regardless of `p_notebook_id`
- Retrieval p95 latency under 400ms on a corpus of 50,000 chunks
- Fusion is verifiably rank-based: two runs where score scales differ but ranks are identical produce identical result ordering
- `\d document_chunks` shows one HNSW index on `embedding` and no ivfflat index
- `npm run eval:rag` prints recall@1, recall@5, recall@10, and MRR against the versioned golden set and exits non-zero below the red lines in §5.3
- Passing `p_source_ids` restricts results to those sources exclusively

### 8.6 Artifacts — `ART`

| ID | Requirement | Priority |
|---|---|---|
| ART-1 | Generate typed artifacts: `report`, `summary`, `flashcard`, `faq`, `study_guide`, `timeline`, `draft` | P0 |
| ART-2 | Generation grounded in retrieved chunks with citations preserved in output | P0 |
| ART-3 | Status lifecycle `generating` → `ready` \| `error`, with user-initiated retry | P0 |
| ART-4 | Store structured JSONB content plus rendered markdown | P0 |
| ART-5 | Markdown export | P0 |
| ART-6 | Source selection before generation, defaulting to all ready sources | P1 |
| ART-7 | Post-generation editing with edits preserved across reloads | P1 |
| ART-8 | Folders and tags | P1 |
| ART-9 | Duplicate | P2 |
| ART-10 | PDF export | P2 |
| ART-11 | Versioning with diff view | P2 |

**Acceptance criteria**
- Each of the seven types generates from a 5-source notebook and reaches `ready`
- Generated reports contain citations resolvable to real chunks; a 10-citation sample verifies at 100%
- A generation interrupted by a server restart is either resumed or marked `error` — never stuck in `generating` indefinitely, enforced by a 10-minute watchdog
- Markdown export opens correctly in Obsidian and Typora with intact headings, lists, and tables
- Flashcard output parses into discrete front/back pairs, not prose
- Generation failure surfaces a retry that succeeds on a transient error

### 8.7 Write panel — `WRITE`

| ID | Requirement | Priority |
|---|---|---|
| WRITE-1 | Markdown editor with live preview | P1 |
| WRITE-2 | `@source`, `@artifact`, `@conversation` mention autocomplete with keyboard navigation | P1 |
| WRITE-3 | Insert artifact content inline | P1 |
| WRITE-4 | Autosave drafts every 5 seconds and on blur | P1 |
| WRITE-5 | Export to markdown | P1 |

**Acceptance criteria**
- Typing `@` opens the dropdown within 200ms; arrow keys navigate, Enter selects, Escape dismisses without inserting
- Mentions render as chips and resolve to the correct entity on save and reload
- A draft survives an unexpected tab close with at most 5 seconds of loss
- The dropdown is fully operable by keyboard alone and announces the active option to screen readers

### 8.8 Sharing — `SHARE`

| ID | Requirement | Priority |
|---|---|---|
| SHARE-1 | Generate a public view-only link for an artifact via a 32-character token | P1 |
| SHARE-2 | Public share page renders without authentication, read-only | P1 |
| SHARE-3 | Optional expiry; expired tokens return 404, not the content | P1 |
| SHARE-4 | Revoke a share | P1 |
| SHARE-5 | **Constrain `permission` to `view` only** until comments and collaborative edit exist | P0 |
| SHARE-6 | Comment permission | P2 |
| SHARE-7 | Edit permission | P2 |

**Acceptance criteria**
- A share link opens in a logged-out incognito window and displays the artifact
- The share page exposes no other artifact, notebook, or user data; verified by inspecting the full network response payload
- An expired or revoked token returns 404 with no content leakage
- The `permission` CHECK constraint rejects `comment` and `edit` at the database level
- Share tokens are unguessable: 32 characters from a cryptographically secure source, verified by inspecting `generate_share_token()`

### 8.9 Usage metering and quotas — `METER`

New in v2.0. v1.0 defaulted `profiles.plan` to `free` and enforced nothing.

| ID | Requirement | Priority |
|---|---|---|
| METER-1 | Record every AI call — embedding, chat, artifact — with model, token counts, and computed cost | P0 |
| METER-2 | Enforce free-tier quotas before dispatching any AI call | P0 |
| METER-3 | Surface remaining quota in the UI | P0 |
| METER-4 | Quota-exceeded state blocks the action with a clear, non-punitive message | P0 |
| METER-5 | Monthly quota reset | P0 |
| METER-6 | Admin view of aggregate spend by day and by user | P1 |
| METER-7 | Stripe billing and paid tiers | P2 |

**Free tier limits (launch)**

| Resource | Limit |
|---|---|
| Notebooks | 5 |
| Sources per notebook | 25 |
| Total storage | 250 MB |
| Chat messages | 100 / month |
| Artifact generations | 20 / month |
| Hard cost ceiling | $1.00 / month |

**Acceptance criteria**
- Every OpenRouter call writes a `usage_events` row with prompt tokens, completion tokens, and cost before returning to the caller
- A user at 100/100 messages is blocked before the API call is dispatched — verified by asserting zero OpenRouter requests in logs for the blocked attempt
- Reaching the $1.00 ceiling blocks further AI calls even if per-resource limits remain
- The UI shows accurate remaining counts, matching a direct database query
- Quotas reset on the first of the month; verified by clock manipulation in staging
- Aggregate daily spend is queryable in one SQL statement

---

## 9. Technical architecture

### 9.1 Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.10 (App Router, Server Actions, `proxy.ts` middleware) |
| React | 19.2.4 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript, strict mode |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth, email/password, cookie sessions |
| Storage | Supabase Storage, `documents` bucket, private |
| Job queue | Supabase Queues (pgmq) — **new in v2.0** |
| Scheduling | pg_cron — **new in v2.0** |
| LLM gateway | OpenRouter (`openrouter.ai/api/v1`) |
| Chat models | `openai/gpt-4o-mini` (default), Gemini Flash 2.5, Gemini Pro 2.5, NVIDIA Llama 3.3 70B |
| Embeddings | OpenRouter `openai/text-embedding-3-small`, 1536 dims, 8K context ([docs](https://openrouter.ai/docs/api_reference/embeddings)) |
| Vector search | pgvector with HNSW |
| Keyword search | pg_trgm |
| Validation | Zod v4.4.3 (note: `z.record()` requires two arguments) |
| Markdown | react-markdown + remark-gfm |
| Icons | lucide-react |

### 9.2 Layers

```
UI Layer (Server Components + Client Components)
    ↓
Server Actions / Route Handlers (src/features/*/actions.ts, src/app/api/*)
    ↓
Service Layer (src/services/*.ts)  ← ownership assertions + quota checks live here
    ↓
Repository Layer (src/repositories/*.ts)
    ↓
Supabase (PostgreSQL + Storage + Queues)
```

Rules:
- No direct Supabase calls from UI components
- `createClient()` for RLS-aware reads; `createServiceClient()` for writes
- **Every service-layer method taking an entity ID asserts ownership before acting** (§12.2)
- **Every service-layer method dispatching an AI call checks quota first** (§13.2)
- Server Components by default; `'use client'` only where interactivity requires it
- `React.cache()` for per-request deduplication

### 9.3 Request flow — grounded chat

```
1. Client POSTs to /api/chat (route handler, streaming)
2. assertConversationOwnership(conversationId, userId)
3. checkQuota(userId, 'chat_message')  → 429 if exceeded
4. Persist user message
5. Embed the query           → OpenRouter /embeddings
6. match_document_chunks()   → top 10 chunks via RRF
7. If zero chunks: stream the "not covered by your sources" response, stop
8. Build prompt with numbered context blocks
9. Stream completion         → OpenRouter /chat/completions
10. Parse [1][2] markers into citation objects
11. Persist assistant message with metadata.citations
12. Record usage_events
13. Log activity
```

Step 7 is what makes CHAT-6 real. Step 10 is what makes citations real. Neither existed in v1.0.

---

## 10. Data model

### 10.1 Tables carried forward

`profiles`, `notebooks`, `source_files`, `document_chunks`, `conversations`, `messages`, `tags`, `source_file_tags`, `artifacts`, `artifact_folders`, `artifact_tags`, `shares`, `activities` — schemas as specified in v1.0 §5.1, with the modifications below.

### 10.2 Modifications

**`source_files`**
- Add `processing_started_at timestamptz`
- Add `processing_attempts integer NOT NULL DEFAULT 0`
- Add `page_count integer` (nullable, where the parser reports it)
- Add constraint: `CHECK (status <> 'ready' OR chunk_count > 0)` — makes the v1.0 status bug structurally impossible
- Lower storage bucket limit to 25MB until the queue is proven, then restore 50MB

**`document_chunks`**
- `metadata` jsonb gains a documented shape: `{ page: number | null, section: string | null, char_start: number, char_end: number }`
- Drop the ivfflat index; retain HNSW `(embedding vector_cosine_ops)`
- Add GIN trigram index on `content` for the keyword arm of hybrid search

**`messages`**
- `metadata` jsonb gains a documented shape:
  `{ citations: [{ marker: number, chunk_id: uuid, source_file_id: uuid, filename: string, chunk_index: number, page: number | null }], retrieval: { query_embedding_model: string, chunk_count: number, min_similarity: number, grounded: boolean } }`
- `grounded: false` marks a CHAT-6 refusal and is excluded from grounding-rate numerators

**`shares`**
- Tighten CHECK to `permission IN ('view')`

**`artifacts`**
- `metadata` gains `{ citations: [...], source_file_ids: uuid[], model: string }`

### 10.3 New tables

**`processing_jobs`** — durable ingestion state

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| source_file_id | uuid FK → source_files ON DELETE CASCADE | |
| user_id | uuid FK → profiles | |
| status | text | CHECK: `queued`, `running`, `succeeded`, `failed` |
| attempts | integer | DEFAULT 0 |
| last_error | text | Nullable |
| started_at | timestamptz | Nullable |
| finished_at | timestamptz | Nullable |
| created_at | timestamptz | |

Unique partial index on `(source_file_id)` where `status IN ('queued','running')` — guarantees one active job per source, which is what makes SRC-8 idempotency enforceable rather than aspirational.

**`usage_events`** — cost ledger

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → profiles | |
| notebook_id | uuid FK → notebooks | Nullable |
| kind | text | CHECK: `embedding`, `chat`, `artifact` |
| model | text | |
| prompt_tokens | integer | DEFAULT 0 |
| completion_tokens | integer | DEFAULT 0 |
| cost_usd | numeric(10,6) | Computed at write time |
| metadata | jsonb | DEFAULT `'{}'` |
| created_at | timestamptz | |

Index on `(user_id, created_at DESC)` and on `(created_at)` for daily rollups.

**`quota_periods`** — enforced counters

| Column | Type | Notes |
|---|---|---|
| user_id | uuid PK part, FK → profiles | |
| period_start | date PK part | First of month |
| messages_used | integer | DEFAULT 0 |
| artifacts_used | integer | DEFAULT 0 |
| cost_usd | numeric(10,6) | DEFAULT 0 |
| updated_at | timestamptz | |

Primary key `(user_id, period_start)`. Increments happen in the same transaction as the usage-event write, so a crash cannot bill without counting or count without billing.

### 10.4 Database functions

Carried forward: `search_source_files`, `increment_source_chunk_counts`, `decrement_source_chunk_counts`, `generate_share_token`, `search_artifacts`, `duplicate_artifact`, `update_updated_at_column`.

Modified: `match_document_chunks(p_query_embedding, p_notebook_id, p_user_id, p_match_count, p_min_similarity, p_source_ids)` — reimplemented with true RRF per §11.3, returning chunk ID, content, source filename, chunk index, page, and fused score.

New:
- `purge_expired_notebooks()` — hard-deletes past-retention notebooks and their storage objects; invoked daily by pg_cron
- `reclaim_stuck_jobs()` — resets `running` jobs older than 10 minutes to `queued`, or to `failed` at max attempts; invoked every 5 minutes
- `increment_quota(p_user_id, p_kind, p_cost)` — atomic upsert into `quota_periods`

### 10.5 Migrations

```
supabase/migrations/
├── 00001_initial_schema.sql          (applied)
├── 00002_rls_policies.sql            (applied)
├── 00003_knowledge_engine.sql        (apply in Phase A)
├── 00004_artifact_engine.sql         (apply in Phase A)
├── 00005_fix_soft_delete_counts.sql  (apply in Phase A)
├── 00006_processing_jobs.sql         (new — queue, status constraint, attempt tracking)
├── 00007_rag_rrf.sql                 (new — RRF rewrite, drop ivfflat, add trigram GIN)
├── 00008_usage_metering.sql          (new — usage_events, quota_periods, increment_quota)
├── 00009_message_citations.sql       (new — metadata shape, backfill grounded=false)
└── 00010_cron_jobs.sql               (new — purge_expired_notebooks, reclaim_stuck_jobs)
```

Migrations 00003–00005 were pending in v1.0. Applying them is a Phase A prerequisite — later migrations assume their objects exist.

---

## 11. Retrieval specification

### 11.1 Indexing pipeline

1. Job dequeued from pgmq; `processing_jobs.status = 'running'`, `source_files.status = 'processing'`
2. Download from Storage via signed URL
3. Extract text by MIME type. Zero extractable characters from a PDF triggers the SRC-12 scanned-document error
4. Normalise whitespace; preserve page boundaries where available
5. Chunk at 1000 characters with 200-character overlap, splitting on paragraph then sentence boundaries before falling back to hard character splits
6. Embed in batches of 96 inputs per request against `openai/text-embedding-3-small`
7. Insert chunks with embeddings and metadata in a single transaction
8. Update `chunk_count`; set `status = 'ready'` — the CHECK constraint rejects this if chunk count is zero
9. Write `usage_events`; mark job `succeeded`; log activity

### 11.2 Query pipeline

1. Embed the user query with the same model
2. Call `match_document_chunks()` with notebook and user scope, `p_min_similarity = 0.25`, `p_match_count = 10`
3. Return zero results → CHAT-6 refusal path
4. Assemble numbered context blocks with filename and page for each chunk
5. Instruct the model to cite using `[n]` markers referencing the block numbers
6. Stream the completion; parse markers into citation objects post-stream
7. Persist message with citation metadata

### 11.3 Fusion — true RRF

Two ranked lists are produced independently:

- **Vector arm:** `1 - (embedding <=> p_query_embedding)` as cosine similarity, filtered to `>= p_min_similarity`, ordered descending, limited to 30
- **Keyword arm:** `similarity(content, p_query_text)` via pg_trgm, ordered descending, limited to 30

Fused score for chunk *c*:

\[
\text{RRF}(c) = \frac{1}{60 + \text{rank}_{\text{vector}}(c)} + \frac{1}{60 + \text{rank}_{\text{keyword}}(c)}
\]

A chunk absent from an arm contributes nothing from that arm. Results are ordered by fused score descending and truncated to `p_match_count`.

The constant 60 is the standard RRF damping value. Rank-based fusion is used specifically because cosine similarity and trigram similarity occupy different, non-comparable ranges — the weighted-score approach in v1.0 let whichever arm happened to produce larger raw numbers dominate, independent of actual relevance.

### 11.4 Constants

| Constant | Value | Rationale |
|---|---|---|
| Chunk size | 1000 chars | Balance of context and precision |
| Chunk overlap | 200 chars | Prevents boundary loss |
| Embedding dimensions | 1536 | `text-embedding-3-small` native |
| Embedding batch size | 96 | Under the 8K context limit per input |
| `p_min_similarity` | 0.25 | Lowered from 0.5; see §3.2 |
| `p_match_count` | 10 | Fits comfortably in a `gpt-4o-mini` context |
| Per-arm candidate limit | 30 | Fusion headroom, and the rerank input size for RAG-9 |
| RRF constant *k* | 60 | Standard |
| Max attempts | 3 | |
| Stuck-job timeout | 10 min | |

### 11.5 Evaluation harness

`npm run eval:rag` reads `tests/golden/questions.jsonl` — 50 questions across 10 documents, each with hand-labelled correct chunk IDs — and reports recall@1, recall@5, recall@10, and MRR. It exits non-zero if recall@10 falls below 70% or citation precision below 80%.

This harness is a Phase A deliverable. Retrieval tuning without it is guesswork, and every future change to chunking, fusion, or thresholds must be justified by its output.

---

## 12. Security and privacy

### 12.1 Baseline

- RLS enabled on every table, scoped by `auth.uid()`
- Service role key server-side only, never in a client bundle
- HttpOnly, Secure, SameSite session cookies
- Zod validation on every server action and route handler input
- MIME type and extension validation on upload
- File size limits enforced at the bucket and the application layer
- CSP headers; CORS restricted to the production origin
- Rate limiting on auth routes and AI-dispatching routes
- Private storage bucket; all access via short-lived signed URLs

### 12.2 Ownership assertions — the critical control

Because writes use the service role and bypass RLS, RLS protects reads only. Every service method accepting an entity ID must assert ownership before acting:

```ts
async function assertOwnership(
  table: 'notebooks' | 'source_files' | 'conversations' | 'artifacts',
  id: string,
  userId: string
): Promise<void>
```

Requirements:
- Called at the top of every service method that reads or mutates by ID
- Throws a typed `ForbiddenError` mapped to HTTP 403
- Covered by an integration test per entity type asserting that a foreign ID is rejected
- **A lint rule or code-review checklist item flags any service method taking an `id` parameter without a preceding assertion**

This is the highest-severity open risk in the system. It gets a dedicated Phase A task and a dedicated test suite.

### 12.3 Data handling commitments

- User content is never used to train or fine-tune models
- OpenRouter requests are sent with training and logging opt-out headers where the gateway supports them
- Deletion is real: permanent delete removes database rows and storage objects within 24 hours
- Soft-deleted data is purged after 30 days by an automated job, not on request
- Users can export all notebook content as markdown plus original files

### 12.4 Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=      # server-only, bypasses RLS
OPENROUTER_API_KEY=             # all AI calls
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_EMBEDDING_MODEL=openai/text-embedding-3-small
```

Remove `GEMINI_API_KEY` and `NVIDIA_API_KEY`. v1.0 documented both as "not used (routed through OpenRouter)". Unused secrets in an environment are a liability with no upside.

---

## 13. Cost model and enforcement

### 13.1 Unit economics

| Operation | Model | Approximate cost |
|---|---|---|
| Index one 20-page PDF (~10K tokens) | `text-embedding-3-small` @ $0.02/M | ~$0.0002 |
| Index a 100-document corpus | same | ~$0.02 |
| One grounded chat turn (~4K in, 600 out) | `gpt-4o-mini` | ~$0.001 |
| One report artifact (~8K in, 2K out) | `gpt-4o-mini` | ~$0.003 |

Embedding pricing per [OpenRouter's model page](https://openrouter.ai/openai/text-embedding-3-small).

A free-tier user at full quota — 25 sources, 100 messages, 20 artifacts — costs roughly $0.19 per month. The $1.00 ceiling therefore provides a 5× safety margin against pathological usage while remaining far below the point where a single user threatens the budget.

### 13.2 Enforcement points

Quota is checked in the service layer immediately before any AI dispatch, never in the UI alone:

```ts
async function checkQuota(
  userId: string,
  kind: 'embedding' | 'chat' | 'artifact'
): Promise<void>  // throws QuotaExceededError → HTTP 429
```

- Checked before the OpenRouter call, so a blocked action costs nothing
- `usage_events` insert and `increment_quota()` run in the same transaction as the response persist
- The $1.00 ceiling is evaluated independently of per-resource counts and overrides them
- Bulk uploads pre-compute estimated embedding cost and reject the batch upfront rather than failing halfway through

### 13.3 Monitoring

- Daily aggregate spend query, alerting above $10/day during pre-launch
- Per-user top-20 spend leaderboard, reviewed weekly
- Alert on any single user exceeding $2 in a day regardless of tier

---

## 14. Phase plan

Phases are lettered to break continuity with v1.0's numbering, which encoded a false completion state. Each phase has a hard exit gate. **A phase does not close until every criterion passes in production.**

### Phase A — Make the product true (P0, blocking)

Nothing else ships until this closes. The product currently misrepresents its own core function.

**Scope**
1. Apply pending migrations 00003–00005
2. Migration 00006: `processing_jobs`, attempt tracking, and the `CHECK (status <> 'ready' OR chunk_count > 0)` constraint
3. Wire `confirmSourceUpload()` to enqueue a processing job (SRC-3)
4. Implement the queue worker: extract → chunk → embed → insert → mark ready (SRC-5 to SRC-8)
5. Correct status lifecycle and live status UI (SRC-4, SRC-11)
6. Retry with backoff, terminal errors, user-initiated retry (SRC-9, SRC-10)
7. Scanned-PDF detection and message (SRC-12)
8. Remove image, audio, and video from accepted types and all copy (SRC-13)
9. Migration 00007: RRF rewrite, drop ivfflat, add trigram GIN, threshold to 0.25 (RAG-1 to RAG-6, RAG-8)
10. Build the 50-question golden set and `npm run eval:rag` (RAG-7)
11. `assertOwnership()` implemented and applied across every service method, with tests (§12.2)
12. Constrain `shares.permission` to `view` (SHARE-5)
13. `reclaim_stuck_jobs()` and `purge_expired_notebooks()` via pg_cron (NB-5)
14. Lower the upload limit to 25MB pending queue validation

**Exit gate — all must pass**
- [ ] `SELECT count(*) FROM source_files WHERE status='ready' AND chunk_count=0` returns 0
- [ ] Uploading a 10-page PDF reaches `ready` with chunks in under 90s, with no manual step
- [ ] A 400-page, 25MB PDF completes without timeout
- [ ] `npm run eval:rag` reports recall@10 ≥ 85%
- [ ] Retrieval p95 under 400ms at 50K chunks
- [ ] `match_document_chunks()` returns zero rows for a foreign `user_id`
- [ ] An integration test per entity type confirms foreign-ID access is rejected with 403
- [ ] No service method taking an entity ID lacks an ownership assertion (reviewed line by line)
- [ ] `\d document_chunks` shows HNSW only, plus the trigram GIN
- [ ] A seeded expired notebook is purged by the cron job, rows and storage objects both gone
- [ ] A job killed mid-run is reclaimed within 10 minutes
- [ ] No UI surface or marketing page lists images, audio, or video as supported
- [ ] The `permission` CHECK rejects `comment` and `edit`

### Phase B — Make it trustworthy (P0)

Citations and streaming. This is where Mythrix becomes distinguishable from a chat app with file upload.

**Scope**
1. Migration 00009: `messages.metadata` citation shape
2. Streaming chat route handler replacing the blocking server action (CHAT-3)
3. Numbered context blocks and citation-marker instructions in the prompt (CHAT-4)
4. Marker parsing into structured citations, persisted on the message
5. Inline citation pills and the citation drawer (CHAT-5)
6. Ungrounded-question refusal path with `grounded: false` (CHAT-6)
7. Chat disabled on notebooks with zero ready sources (CHAT-7)
8. Citations carried into artifact generation (ART-2)
9. Fix the ~50 nested-button hydration and accessibility defects (§15)

**Exit gate**
- [ ] 20 consecutive corpus-answerable questions each produce ≥1 citation pill
- [ ] All 20 citations resolve to chunk text verifiably present in the source document
- [ ] 10 deliberately off-corpus questions all produce a refusal with zero pills and `grounded: false`
- [ ] Time to first token under 1.5s p95 across 50 requests
- [ ] Citation precision ≥ 90% on a 20-answer manual review
- [ ] Hallucination rate ≤ 5% on the same sample
- [ ] Generated reports contain resolvable citations at 100% on a 10-citation sample
- [ ] Zero React hydration warnings in the production console across all primary routes
- [ ] Citation drawer fully keyboard operable; streaming announced via a live region
- [ ] All citation-surface color pairs pass WCAG AA, measured

### Phase C — Make it sustainable (P0)

Metering before any public launch. An unmetered free tier with server-side API keys is an open invoice.

**Scope**
1. Migration 00008: `usage_events`, `quota_periods`, `increment_quota()`
2. Usage recording on every AI call (METER-1)
3. Pre-dispatch quota enforcement (METER-2, METER-4)
4. Quota display in the UI (METER-3)
5. Monthly reset (METER-5)
6. Bulk-upload cost pre-check (§13.2)
7. Admin spend dashboard (METER-6)
8. Cost alerting (§13.3)
9. Restore the 50MB limit if Phase A queue metrics support it

**Exit gate**
- [ ] Every AI call produces a `usage_events` row with accurate token counts
- [ ] A user at quota is blocked with zero OpenRouter requests logged for the attempt
- [ ] The $1.00 ceiling blocks calls even when per-resource limits remain
- [ ] UI counters match direct database queries exactly
- [ ] Quota resets correctly under staging clock manipulation
- [ ] A 30-file bulk upload exceeding remaining quota is rejected before any file is processed
- [ ] Daily spend is queryable in one statement; the $10/day alert fires in a test
- [ ] Measured cost per active test user is under $0.60/month

### Phase D — Make it complete (P1)

Launch-credible feature surface.

**Scope**
- `@file` mention-scoped retrieval (CHAT-8)
- Model selection per conversation (CHAT-9)
- Context-window management (CHAT-10)
- Source selection before generation (ART-6)
- Artifact editing with persistence (ART-7)
- Folders and tags (ART-8, SRC-16)
- Write panel: editor, mentions, autosave, export (WRITE-1 to WRITE-5)
- Sharing: create, public page, expiry, revoke (SHARE-1 to SHARE-4)
- Source preview with chunk inspector (SRC-15)
- Sortable, filterable source list with bulk operations (SRC-14)
- Notebook search (NB-7)
- Password reset (AUTH-5)

**Exit gate**
- [ ] Mention-scoped retrieval returns results only from mentioned sources
- [ ] A 60-turn conversation responds without a context-length error
- [ ] Artifact edits persist across reload and export
- [ ] A share link renders in incognito and leaks no other data in the response payload
- [ ] Expired and revoked tokens return 404
- [ ] Drafts survive an unexpected tab close with ≤5s loss
- [ ] Activation rate ≥ 40% and time to first grounded answer <6min median, on ≥20 real signups
- [ ] All P1 acceptance criteria in §8 pass

### Phase E — Make it better (P2)

Post-launch, prioritised by measured behaviour rather than the v1.0 wish list.

- Cross-encoder reranking, top 30 → top 10 (RAG-9)
- PDF export (ART-10)
- Artifact versioning with diff (ART-11)
- OCR for scanned PDFs, gated on measured demand
- Audio transcription, gated on funded unit economics
- Image understanding via vision models
- Stripe billing and paid tiers (METER-7)
- Google OAuth (AUTH-6)
- Conversation auto-titling and regenerate (CHAT-11, CHAT-12)
- Artifact duplication (ART-9)

**Prioritisation rule:** no Phase E item starts before the metric it is meant to move is instrumented and has a baseline. Reranking, for example, does not begin until recall@10 is tracked continuously and a specific deficit is identified.

### Phase F — Team and enterprise (P2+, Meera's phase)

- Workspace and organisation entity above notebooks
- Membership and RBAC
- Configurable retention policies
- Branded export templates
- Audit log export

Explicitly gated behind three paying customers who have asked for it. Building multi-tenancy speculatively is how solo products die.

---

## 15. Technical debt register

| ID | Item | Severity | Phase |
|---|---|---|---|
| TD-1 | Processing pipeline never invoked; RAG non-functional | Critical | A |
| TD-2 | Status set to `ready` before processing | Critical | A |
| TD-3 | Service-role writes with no ownership assertions | Critical | A |
| TD-4 | Migrations 00003–00005 unapplied | High | A |
| TD-5 | ~50 nested-button hydration and a11y defects across composer, conversation-sidebar, message-bubble, notebook-card, sidebar, topnav | High | B |
| TD-6 | No usage metering or quota enforcement | High | C |
| TD-7 | Unbounded conversation context sent to the model | Medium | D |
| TD-8 | Multimodal types accepted but never extracted | Medium | A (remove) / E (implement) |
| TD-9 | `shares.permission` allows unimplemented modes | Medium | A |
| TD-10 | No soft-delete purge job | Medium | A |
| TD-11 | Unused `GEMINI_API_KEY` and `NVIDIA_API_KEY` in the environment | Low | A |
| TD-12 | No PDF export | Low | E |
| TD-13 | No analytics or telemetry beyond the activity log | Medium | C |
| TD-14 | No automated test suite; all verification manual | High | A |

TD-14 deserves emphasis. Every acceptance criterion in this document should be automated where automation is feasible. Manual verification does not survive a solo founder's pace.

---

## 16. Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Cross-tenant leak via unguarded service-role write | Fatal — product and reputation | Medium | §12.2 assertions, per-entity tests, review checklist. Phase A blocker. |
| Retrieval quality too low to be trusted | Fatal — the differentiator fails | Medium | Golden set from Phase A; recall@10 as a release gate |
| Unmetered free tier generates unpayable bills | Severe | High without Phase C | Pre-dispatch quota checks, hard cost ceiling, daily alerting |
| Serverless timeouts on large documents | High | High without a queue | pgmq worker, chunked processing, stuck-job reclamation |
| OpenRouter outage or model deprecation | High | Medium | Model list is configuration, not code; embedding model change requires reindexing, so document that runbook now |
| Scanned PDFs are a large share of real corpora | Medium | Medium | Honest detection in Phase A; measure the rejection rate to size OCR demand |
| NotebookLM ships persistent citable notebooks | High | Medium | Compete on model choice, data ownership, and export freedom — not feature parity |
| Solo-founder bandwidth against a five-phase plan | High | High | Strict phase gating; §4 non-goals are a refusal tool, not a wish list |

---

## 17. Open questions

1. **Embedding model lock-in.** Changing embedding models invalidates every stored vector. Do we accept `text-embedding-3-small` as effectively permanent, or build a reindexing path in Phase A? *Recommendation: document the runbook now, build it in Phase E.*
2. **Refusal tone.** How firm should CHAT-6 refusals be? Strict refusal maximises trust; a labelled general-knowledge fallback may feel more useful. *Recommendation: strict at launch — trust compounds, convenience does not.*
3. **Chunk size.** 1000/200 is a default, not a measured choice. The golden set should resolve this empirically in Phase A.
4. **Free-tier generosity.** 25 sources may be too tight for Priya's 40–200 document corpus, making the free tier unable to demonstrate the core value. *Recommendation: 25 at launch, revisit against activation data within four weeks.*
5. **Artifact citation format.** Inline `[n]` markers, footnotes, or an appendix? Affects export readability materially.
6. **Launch gate.** Do we open signups after Phase C or Phase D? *Recommendation: closed beta of 20 users after Phase C, public after Phase D.*

---

## 18. Appendix A — File structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── auth/callback/route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       ├── page.tsx
│   │       └── [notebookId]/
│   │           ├── layout.tsx
│   │           ├── page.tsx
│   │           ├── sources/page.tsx
│   │           ├── conversations/page.tsx
│   │           ├── conversations/[conversationId]/page.tsx
│   │           ├── artifacts/page.tsx
│   │           ├── artifacts/[artifactId]/page.tsx
│   │           └── write/page.tsx
│   ├── share/[token]/page.tsx
│   ├── api/
│   │   ├── chat/route.ts              # NEW — streaming chat
│   │   ├── process-source/route.ts    # queue worker entry
│   │   ├── upload/route.ts
│   │   ├── og/route.tsx
│   │   └── admin/usage/route.ts       # NEW — spend dashboard
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx
├── components/
│   ├── dashboard/     (NotebookGrid, NotebookCard, QuickStats, SearchBar)
│   ├── sources/       (SourceList, SourceCard, FileDropZone, FileUploadProgress,
│   │                   ProcessingStatus*, ChunkInspector*)
│   ├── conversations/ (ConversationList, MessageList, MessageBubble, ChatInput,
│   │                   MentionDropdown, CitationPill*, CitationDrawer*)
│   ├── artifacts/     (ArtifactList, ArtifactSidebar, ArtifactEditor, ArtifactCard)
│   ├── write/         (WritePanel, MentionChip)
│   ├── workspace/     (WorkspaceLayout)
│   ├── usage/         (QuotaBadge*, QuotaExceededDialog*)
│   └── ui/            (Button, Input, Modal, Tooltip, Badge, DropdownMenu,
│                       AlertDialog, Toast)
├── features/
│   ├── notebook/actions.ts
│   ├── sources/actions.ts
│   ├── conversations/actions.ts
│   └── artifacts/actions.ts
├── lib/
│   ├── supabase/      (client.ts, server.ts)
│   ├── ai/            (index.ts, openrouter.ts, embedding.ts, streaming.ts*,
│   │                   citations.ts*)
│   ├── queue/         (enqueue.ts*, worker.ts*)
│   ├── auth/          (ownership.ts*)
│   ├── quota/         (check.ts*, record.ts*)
│   ├── store/         (auth.ts, notebook.ts, ui.ts, write.ts)
│   ├── validators/    (index.ts)
│   └── utils.ts
├── repositories/      (notebook, source, conversation, message, artifact, tag,
│                       share, activity, usage*, job*)
├── services/          (notebook, source, conversation, message, artifact, tag,
│                       share, activity, processing, rag, quota*)
└── types/
    └── database.types.ts

tests/
├── golden/
│   ├── questions.jsonl*      # 50 labelled retrieval questions
│   └── documents/*
├── integration/
│   ├── ownership.test.ts*    # foreign-ID rejection per entity
│   ├── processing.test.ts*   # upload → ready invariants
│   └── quota.test.ts*        # pre-dispatch enforcement
└── eval/
    └── rag.ts*               # npm run eval:rag
```

`*` denotes new in v2.0.

---

## 19. Appendix B — Change log from v1.0

**Added**
- Personas with jobs-to-be-done, plus explicit anti-personas (§2)
- Honest current-state audit reclassifying "Phases 1–9.5 complete" (§3)
- Non-goals in three tiers with rationale (§4)
- North star metric and five metric families with red lines (§5)
- Product principles (§6)
- Acceptance criteria for every requirement (§8)
- Citation requirements as first-class infrastructure (CHAT-4, CHAT-5, ART-2)
- Streaming requirement (CHAT-3)
- Usage metering and quota module (§8.9, §13)
- `processing_jobs`, `usage_events`, `quota_periods` tables (§10.3)
- Ownership-assertion security control (§12.2)
- Golden-set evaluation harness (§11.5)
- Phase plan with hard exit gates (§14)
- Risk register and open questions (§16, §17)

**Corrected**
- RRF described accurately and reimplemented as rank-based (§11.3)
- Similarity threshold lowered 0.5 → 0.25 (§11.4)
- ivfflat index dropped in favour of HNSW alone (§10.2)
- RLS-vs-service-role contradiction resolved (§12.2)
- OpenRouter embeddings confirmed viable, contrary to stale third-party guidance (§3.2)
- `shares.permission` constrained to implemented modes (§10.2)
- Upload limit temporarily lowered pending queue validation (§10.2)

**Removed**
- Images, audio, and video from supported types until extraction exists (SRC-13)
- Unused `GEMINI_API_KEY` and `NVIDIA_API_KEY` (§12.4)
- Phase numbering that encoded a false completion state (§14)

---

## 20. Appendix C — Sources

- OpenRouter embeddings API, OpenAI-compatible `/embeddings` endpoint and available models — https://openrouter.ai/docs/api_reference/embeddings
- `openai/text-embedding-3-small` pricing ($0.02/M input tokens), 1536 dimensions, 8K context — https://openrouter.ai/openai/text-embedding-3-small
- OpenRouter embedding model collection — https://openrouter.ai/collections/embedding-models
