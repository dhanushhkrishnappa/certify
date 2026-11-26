# 05 — AI Pedagogy, Scoped RAG & BKT Mastery Engine

**Document Scope:** Stateful Socratic Pedagogical Director, 169-Chunk 4-Tier Section-Fenced Hybrid RAG, Topic Drift Firewall, Hybrid Rubric Evaluator, and Bayesian Knowledge Tracing Math  
**Platform Version:** CERTIFY v3.0.0

---

## 1. The Stateful Socratic Pedagogical & Progression Director

Unlike passive chat wrappers that dump wall-of-text answers or get stuck repeating generic follow-up questions, CERTIFY implements a **Stateful Pedagogical & Progression Director** (`backend/src/modules/ai/ai.provider.ts` and `backend/src/modules/sessions/sessions.hono.ts`).

### 1.1 Pre-Reply Evaluation & Inline Transition Architecture
When a learner submits a message in the Learning Studio, the backend **evaluates the learner's response in context of the tutor's previous question (`lastTutorQuestion`) and executes `ProgressionService.recordSectionTurn()` BEFORE generating the tutor's reply**.
- If the learner's response demonstrates the remaining rubric criteria for `S1 (CONCEPT_INTUITION)`, the backend advances `SectionProgress` from `S1` to `S2 (TECHNICAL_MECHANICS)` immediately and passes a `ProgressionTransitionNotice` into the tutor system prompt.
- The AI tutor congratulates the learner on the specific demonstrated criterion and seamlessly bridges into the newly unlocked section (`S2`, `S3`, or `S4 CHAPTER_CHECKPOINT`) on the **exact turn** the transition occurs.

### 1.2 Mandatory 3-Part Pedagogical Response Structure
Every Socratic tutor response (both live LLM and deterministic curriculum fallback) adheres to a strict 3-part structure:
1. **Part 1 — Direct Answer / Validation (2–3 sentences):** Directly answers the learner's question or validates their explanation of the previous probe, explicitly citing what they got right or gently correcting any detected misconception.
2. **Part 2 — Concrete Python Code Trace or Mental Model:** Provides a short, self-contained Python 3 code block (`4–8 lines`) from the active section's curriculum with a line-by-line runtime or memory trace.
3. **Part 3 — Single Targeted Conceptual Probe or Checkpoint Callout:** Ends with **one** focused Socratic question targeting the next unmastered `RubricCriterion` in the active section (or directs the learner to open the in-studio **Chapter Checkpoint** / **Module Practical** modal when `S4` or `S5` is reached).

### 1.3 Anti-Repetition Question Memory (`extractPreviousTutorQuestions`)
Before building the prompt, `extractPreviousTutorQuestions(history)` extracts all questions already asked by the assistant in recent turns and injects them into a `DO NOT REPEAT` guardrail block, guaranteeing forward pedagogical momentum.

---

## 2. 169-Chunk 4-Tier Section-Fenced Hybrid RAG Pipeline

### 2.1 Corpus Composition (`courses/python-fundamentals/` → `course_embeddings`)
The ingestion pipeline (`backend/scripts/ingest_python_rag.ts`) parses the authored Python Fundamentals curriculum into **169 section-tagged chunks**:

| Chunk Type | Count | Source Files | Section Tagging |
| :--- | :-: | :--- | :--- |
| `LESSON` | **116** | 29 lesson Markdown files (`lessons/lesson-*.md`) across Modules 01–10 | Sliced by heading into `S1` (Intuition), `S2` (Mechanics), `S3` (Pitfalls), and `S4` (Summary/Checkpoint) |
| `COMMON_MISTAKE` | **13** | 10 `common-mistakes/COMMON_MISTAKES.md` files | Linked to specific `concept_id` and tagged to `S3 (PITFALLS_AND_DEBUGGING)` |
| `EXAMPLE` | **40** | 10 `examples/EXAMPLES_GUIDE.md` + 20 runnable `examples/ex*.py` scripts (30 chunks) + 10 `exercises/EXERCISES.md` (10 chunks) | Tagged to `S2 (TECHNICAL_MECHANICS)` and `S3 (PITFALLS_AND_DEBUGGING)` |
| **Total** | **169** | **10 Modules · 29 Chapters · 126 Lesson Sections** | **1536-dim `gemini-embedding-001` + `tsvector` FTS** |

### 2.2 Hybrid Scoring Formula (`0.70 Vector + 0.30 FTS`)
For every query, `RAGService` (`backend/src/modules/ai/rag.service.ts`) generates a 1536-dimensional query vector via `gemini-embedding-001` and constructs an OR-weighted PostgreSQL `tsquery` (`buildOrTsQuery()`) that strips conversational stopwords so natural multi-word student questions match technical terms cleanly:

$$	ext{HybridScore}(c, q) = 0.70 	imes \left(1 - 	ext{cosine\_distance}(c.	ext{embedding}, ec{q})ight) + 0.30 	imes 	ext{ts\_rank}(c.	ext{fts}, 	ext{buildOrTsQuery}(q))$$

### 2.3 Hard 4-Tier Section & Module Fencing (`retrieveScopedContext`)
To prevent future-topic leakage, `RAGService.retrieveScopedContext()` queries `course_embeddings` in four strictly fenced tiers and never executes an unfiltered global query:

1. **Tier 1 (Exact Active Section):** `WHERE chapter_id = :activeChapterId AND section_id = :activeSectionId`
2. **Tier 2 (Current Chapter Context):** `WHERE chapter_id = :activeChapterId AND chunk_type IN ('LESSON', 'EXAMPLE')`
3. **Tier 3 (Current Module Pitfalls):** `WHERE module_slug = :activeModuleSlug AND chunk_type = 'COMMON_MISTAKE'`
4. **Tier 4 (Prerequisite Module Recall, Max 2 Chunks):** `WHERE module_order < :activeModuleOrder`
5. **Deterministic Curriculum Fallback:** If vector/FTS retrieval returns fewer than 3 chunks (or during offline mode), `RAGService` hydrates directly from the active `LessonSection.content` and `Chapter.teachingContent` in PostgreSQL.

---

## 3. Pre-RAG Topic Drift & Anti-Skip Firewall (`DriftService`)

Before calling RAG or the LLM, `DriftService.detectDrift()` (`backend/src/modules/ai/drift.service.ts`) inspects the learner's message:
- **`SKIP_ATTEMPT`:** Detects explicit requests to bypass locks (e.g., *"skip this chapter"*, *"unlock module 5"*, *"just give me the certificate"*).
- **`FUTURE_TOPIC`:** Cross-references technical terms in the message against `PYTHON_MODULE_TAXONOMY` for modules where `sequenceOrder > currentModuleOrder` (for example, asking about `asyncio`, `pytest fixtures`, or `@property` decorators while in Module 1).
- **`OFF_TOPIC`:** Detects non-programming or unrelated requests.

When drift is triggered, the backend logs a `TopicDriftEvent` in PostgreSQL, emits an SSE `event: drift_redirect` badge to the UI, and instructs the tutor to acknowledge the question's place in the broader syllabus while redirecting focus back to the active section's objective.

---

## 4. Two-Stage Hybrid Rubric & Misconception Evaluator (`RubricEvaluatorService`)

Each of the 29 chapters maps to explicit `RubricCriterion` records (66 total across the course), each annotated with `cognitiveLevel` (`RECALL`, `EXPLAIN`, `APPLY`, `DEBUG`, `REASON`), `expectedConceptsJson`, and `misconceptionsJson`.

`RubricEvaluatorService` (`backend/src/modules/ai/rubric.evaluator.ts`) evaluates learner responses in two stages:
1. **Stage 1 — Fast Deterministic Guardrails & Misconception Scanner:**
   - **Anti-Gaming / Keyword-Stuffing Filter (`isKeywordStuffing`):** Rejects low-effort single words, copy-pasted criterion statements, or high-density keyword lists lacking syntactic sentence structure.
   - **Negation & Misconception Regex Scanner:** Matches known conceptual errors defined in `misconceptionsJson` (e.g., claiming lists are immutable or that `=` copies an object in Python) and tags the exact `misconceptionTag`.
2. **Stage 2 — Structured LLM Rubric Extraction (Validated via Zod):**
   - Evaluates whether each criterion was genuinely demonstrated (`isDemonstrated: boolean`), assigns an evidence confidence score (`confidence: [0, 1]`), extracts a verbatim `evidenceQuote` from the learner's answer, and provides concise `reasoning`.

---

## 5. Mathematical Trust Boundary: Bayesian Knowledge Tracing (`bkt.ts`)

All mastery probabilities $P(L_t)$ are computed deterministically by `BayesianKnowledgeTracer` (`backend/src/modules/mastery/bkt.ts`).

### 5.1 Canonical BKT Parameters
- **Initial Prior Mastery ($P(L_0)$):** `0.1500` (concept default)
- **Probability of Learning / Transition ($P(T)$):** `0.1500`
- **Probability of Slip ($P(S)$):** `0.1000` (mastered learner makes a careless error)
- **Probability of Guess ($P(G)$):** `0.2000` (unmastered learner guesses correctly)

### 5.2 Posterior Mastery Update Equations
Given prior mastery $P(L_{t-1})$ and an observed rubric evaluation outcome (`isDemonstrated`):

1. **If `isDemonstrated == true` (Positive Evidence):**
   $$P(L_t \mid 	ext{obs}=1) = rac{P(L_{t-1}) \cdot (1 - P(S))}{P(L_{t-1}) \cdot (1 - P(S)) + (1 - P(L_{t-1})) \cdot P(G)}$$

2. **If `isDemonstrated == false` (Negative Evidence / Misconception):**
   $$P(L_t \mid 	ext{obs}=0) = rac{P(L_{t-1}) \cdot P(S)}{P(L_{t-1}) \cdot P(S) + (1 - P(L_{t-1})) \cdot (1 - P(G))}$$

3. **Learning Transition Step (Weighted by Evaluator Confidence $c \in [0, 1]$):**
   $$P(L_t) = P(L_t \mid 	ext{obs}) + \left(1 - P(L_t \mid 	ext{obs})ight) \cdot P(T) \cdot c$$

4. **Bounds Clamping & State Classification:**
   $P(L_t)$ is clamped to $[0.0100, 0.9900]$ and mapped to deterministic states:
   - $P(L_t) \ge 0.92 \implies 	ext{ADVANCED}$
   - $P(L_t) \ge 0.78 \implies 	ext{MASTERED}$
   - $P(L_t) < 0.45 	ext{ (after failures)} \implies 	ext{NEEDS\_REMEDIATION}$
   - $	ext{Otherwise} \implies 	ext{LEARNING}$

---

## 6. Deterministic 8-Dimension Skill Analytics & Final Credential Scoring

### 6.1 The 8 Canonical Python Skill Dimensions (`AnalyticsService`)
Every rubric criterion maps with a `contributionWeight` to one or more of 8 skill dimensions:
1. `execution-and-memory-model` (*Execution Model, References & Mutability*)
2. `control-flow-and-boolean-logic` (*Boolean Logic, Branching & Short-Circuiting*)
3. `iteration-and-comprehensions` (*Loops, Iterators & Comprehensions*)
4. `modular-functions-and-scope` (*Functions, LEGB Scope & Recursion*)
5. `defensive-error-handling` (*Exceptions, Tracebacks & Defensive Debugging*)
6. `standard-library-and-tooling` (*Modules, Standard Library, CLI & Virtual Environments*)
7. `automated-testing-and-quality` (*Unit Testing, Pytest & Edge-Case Verification*)
8. `data-pipelines-regex-and-oop` (*File I/O, Generators, Regular Expressions & OOP*)

For each dimension, `AnalyticsService.recomputeSkillProfiles()` calculates:
$$	ext{DimensionScore} = 0.50 	imes 	ext{RubricPassRate} + 0.30 	imes 	ext{BKTMeanMastery} + 0.20 	imes 	ext{PracticalScore}$$
and classifies the dimension as:
- `STRENGTH` ($\ge 0.80$)
- `DEVELOPING` ($0.60 – 0.79$)
- `WEAKPOINT` ($< 0.60$ or $\ge 2$ repeated misconceptions)

### 6.2 Five-Component Final Qualification Score (`CertificationEvaluator`)
To earn a verifiable credential, a learner's enrollment is evaluated across 5 weighted evidence signals:

$$	ext{CompositeScore} = 0.25 \cdot S_{	ext{BKT}} + 0.20 \cdot S_{	ext{Chapters}} + 0.25 \cdot S_{	ext{Practicals}} + 0.15 \cdot S_{	ext{Dialogue}} + 0.15 \cdot S_{	ext{Viva}}$$

- **Minimum Issuance Gate:** $	ext{CompositeScore} \ge 0.70$, all 10 modules completed, and $S_{	ext{Viva}} \ge 0.60$.
- **Qualification Tiers:**
  - `ADVANCED`: $	ext{CompositeScore} \ge 0.90$
  - `PROFICIENT`: $	ext{CompositeScore} \ge 0.80$
  - `FOUNDATION`: $	ext{CompositeScore} \ge 0.70$
