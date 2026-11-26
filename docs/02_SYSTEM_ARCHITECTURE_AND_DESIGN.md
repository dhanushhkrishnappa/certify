# 02 — System Architecture & Engineering Design

**Document Scope:** End-to-End System Topology, Architectural Invariants, State Machines, and Real-Time Data Flows  
**Platform Version:** CERTIFY v3.0.0

---

## 1. Architectural Philosophy & Core Invariants

CERTIFY is architected around three non-negotiable engineering invariants:

1. **Invariant 1 — The LLM Never Grades Mastery or Unlocks Progression:**  
   Large Language Models are probabilistic text generators and are vulnerable to prompt injection, sycophancy, and hallucination. In CERTIFY, the LLM is strictly confined to **Socratic dialogue delivery** and **structured rubric evidence extraction**. All mastery probabilities ($P(L_t)$), progression locks (`LOCKED` / `UNLOCKED` / `COMPLETED`), skill classifications, and certificate issuance decisions are executed by **deterministic TypeScript state machines** on the backend.
2. **Invariant 2 — Hard Section & Module RAG Fencing (Zero Future-Topic Leakage):**  
   A Socratic tutor must never confuse a beginner in Module 1 with advanced metaclasses or async coroutines from later modules. Every RAG retrieval query is hard-fenced by SQL `WHERE` predicates to the learner's active `section_id`, `chapter_id`, and `module_order <= current_module_order`.
3. **Invariant 3 — Cryptographic Non-Repudiation:**  
   Issued credentials are signed over a canonicalized JSON payload using **RFC 8032 Ed25519** asymmetric cryptography. Verification checks both the database status (`VALID` vs. `REVOKED`) and the mathematical signature against the public key in `signing_key_registry`.

---

## 2. High-Level System Topology

```text
+---------------------------------------------------------------------------------------------------+
|                                  CLIENT TIER (React 19 + Vite SPA)                                |
|                                                                                                   |
|  +--------------------+  +------------------------+  +--------------------+  +-----------------+  |
|  | Editorial Landing  |  | Socratic Learning      |  | In-Studio Modals   |  | Public Verify & |  |
|  | (WebGL OGL + GSAP  |  | Studio (SSE Chat +     |  | (CheckpointPanel & |  | Analytics Views |  |
|  |  + Lenis Scroll)   |  |  S1-S5 Stepper + IDE)  |  |  PracticalPanel)   |  | (BKT + Skills)  |  |
|  +---------+----------+  +-----------+------------+  +---------+----------+  +--------+--------+  |
+------------|-------------------------|-------------------------|----------------------|-----------+
             | HTTPS / REST            | HTTPS / SSE Stream      | HTTPS / REST         | HTTPS
             v                         v                         v                      v
+---------------------------------------------------------------------------------------------------+
|                        EDGE API & CONTROL PLANE (Hono on Cloudflare Workers / Node)               |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | Security & Middleware Layer: CORS Origin Whitelist | Secure Headers | Better Auth Session   |  |
|  |                              Durable Object / Sliding-Window Rate Limiter (honoRateLimit)   |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  +----------------------+  +-----------------------+  +----------------------+  +--------------+  |
|  | ProgressionService   |  | Sessions & AI Tutor   |  | Assessment & Sandbox |  | Certificates |  |
|  | 4-Level State Machine|  | Drift Firewall +      |  | Hybrid Rubric Eval + |  | Ed25519 Sign |  |
|  | (Course->Mod->Ch->S) |  | 4-Tier Scoped RAG +   |  | Python Test Harness  |  | & Public     |  |
|  |                      |  | Pedagogical Director  |  | + 3-Turn Viva Engine |  | Ledger Verify|  |
|  +----------+-----------+  +-----------+-----------+  +----------+-----------+  +------+-------+  |
|             |                          |                         |                     |          |
|  +----------v--------------------------v-------------------------v---------------------v-------+  |
|  | Deterministic Math & Telemetry Engines: BayesianKnowledgeTracer (BKT) | AnalyticsService    |  |
|  +---------------------------------------------------------------------------------------------+  |
+-------------|--------------------------|-------------------------|---------------------|----------+
              |                          |                         |                     |
              v                          v                         v                     v
+--------------------------+  +-----------------------+  +------------------+  +--------------------+
| DATA PLANE               |  | AI PROVIDER GATEWAY   |  | ARTIFACT VAULT   |  | TRANSACTIONAL EMAIL|
| Neon Serverless Postgres |  | Primary: Gemini 2.5   |  | Cloudflare R2    |  | 1. Gmail TLS SMTP  |
| - 37 Relational Tables   |  | Failover: Groq Llama  |  | Private Bucket   |  | 2. Nodemailer      |
| - pgvector (1536-dim)    |  |   3.3 70B / Anthropic |  | (2MB MIME-gated  |  | 3. Resend HTTP API |
| - tsvector GIN FTS       |  |   Claude / OpenAI     |  |  Evidence Store) |  | + EmailLog Audit   |
| - Prisma Driver Adapter  |  | Embeddings: Gemini    |  +------------------+  +--------------------+
+--------------------------+  +-----------------------+
```

---

## 3. Backend Domain Module Architecture

The backend (`backend/src/`) is organized as a clean, domain-isolated modular monolith built on **Hono**:

| Module Path | Core Responsibility |
| :--- | :--- |
| `src/app.ts` / `src/worker.ts` / `src/server.ts` | Universal Hono application factory supporting both Cloudflare Workers (`worker.ts` with Durable Object bindings) and Node.js (`server.ts` via `@hono/node-server`). |
| `src/config/index.ts` | Centralized runtime configuration, retired-model guardrails, Gemini model normalizer, and environment-aware security flags. |
| `src/lib/auth.ts` & `src/modules/auth/` | Better Auth integration with Prisma adapter, 6-digit CSPRNG OTP pre-verification registration flow, password reset OTP flow, Google OAuth, and 16-week activity matrix aggregation. |
| `src/modules/courses/` | Public course catalog listing, full syllabus hierarchy inspection, guest Socratic preview chat, and idempotent learner enrollment initialization. |
| `src/modules/progression/` | **Authoritative 4-Level State Machine (`ProgressionService`)** and canonical Python curriculum taxonomy (`curriculum.taxonomy.ts`). Enforces all section, chapter, module, and practical locks. |
| `src/modules/sessions/` | Real-time Socratic session controller (`sessions.hono.ts`). Orchestrates topic drift detection, pre-reply rubric evaluation, section auto-advancement, scoped RAG retrieval, and SSE token streaming. |
| `src/modules/ai/` | Multi-provider LLM gateway (`ai.provider.ts`), 1536-dim embedding client (`embedding.service.ts`), 4-tier section-fenced hybrid RAG (`rag.service.ts`), topic drift firewall (`drift.service.ts`), and 2-stage hybrid rubric evaluator (`rubric.evaluator.ts`). |
| `src/modules/mastery/` | Deterministic **Bayesian Knowledge Tracing (`bkt.ts`)** engine and 5-component **CertificationEvaluator** composite scoring engine. |
| `src/modules/assessment/` | Chapter checkpoint question delivery & submission (`CHAPTER_CHECKPOINT`), module practical evaluation (`MODULE_PRACTICAL`), and 3-turn final Viva Voce oral defense (`VIVA`). |
| `src/modules/sandbox/` | Isolated Python 3 execution service (`sandbox.service.ts`) with AST/regex security blacklisting, 10 module-specific unit test harnesses, and deterministic edge runtime evaluator fallback. |
| `src/modules/analytics/` | Deterministic **Skill Analytics Engine (`analytics.service.ts`)** computing weighted mastery across 8 canonical Python skill dimensions (`STRENGTH` / `DEVELOPING` / `WEAKPOINT`). |
| `src/modules/certificates/` | **Ed25519 Cryptographic Service (`crypto.service.ts`)** for canonical JSON signing, key rotation registry lookup, credential issuance, and public verification. |
| `src/modules/storage/` | Private Cloudflare R2 object storage vault (`r2.service.ts`) with strict MIME magic-byte inspection, 2 MB size cap, and enrollment ownership checks. |
| `src/modules/email/` | Triple-transport transactional email engine (`email.service.ts` + `cloudflareSmtp.ts`) with raw Cloudflare Worker TCP/TLS SMTP sockets, Nodemailer, Resend fallback, and `EmailLog` idempotency. |

---

## 4. The 4-Level Backend-Authoritative Progression State Machine

Every learner enrollment is governed by a hierarchical 4-level state machine stored in PostgreSQL:

```text
Level 1: Course Enrollment (Enrollment.status: ACTIVE -> REMEDIATING -> COMPLETED)
  │
  └── Level 2: Module Sequence (10 Modules: ModuleProgress.status)
        │      States: LOCKED -> UNLOCKED -> IN_PROGRESS -> COMPLETED
        │      Gate to Unlock Module M_{k+1}:
        │        1. All Chapters in Module M_k == COMPLETED
        │        2. Module M_k Practical Task (practicalPassed == true, score >= 0.70)
        │        3. Module M_k Rubric Pass Ratio >= 0.70
        │
        └── Level 3: Chapter Sequence (29 Chapters: ChapterProgress.status)
              │      States: LOCKED -> UNLOCKED -> IN_PROGRESS -> AWAITING_CHECKPOINT -> REMEDIATING -> COMPLETED
              │      Gate to Unlock Chapter C_{j+1}:
              │        1. Sections S1, S2, S3 in Chapter C_j == COMPLETED
              │        2. Section S4 (CHAPTER_CHECKPOINT) submitted with score >= 0.70
              │
              └── Level 4: Lesson Sections (4-5 Sections per Chapter: SectionProgress.status)
                     States: LOCKED -> UNLOCKED -> IN_PROGRESS -> COMPLETED
                     ├── S1: CONCEPT_INTUITION      (Core mental model & motivation)
                     ├── S2: TECHNICAL_MECHANICS    (Execution model, syntax & memory trace)
                     ├── S3: PITFALLS_AND_DEBUGGING (Common bugs, edge cases & defensive patterns)
                     ├── S4: CHAPTER_CHECKPOINT     (In-studio rubric-graded checkpoint modal)
                     └── S5: MODULE_PRACTICAL       (On final chapter of each module: unit-tested code lab)
```

### Strict Anti-Skip Enforcement
If a client attempts to start a session on a locked chapter, advance a section before completing its minimum dialogue turns and rubric criteria, or submit a module practical before finishing all chapter checkpoints in that module, `ProgressionService` throws a `ProgressionLockedError` returning **HTTP 403** with a structured error code:
- `PROGRESSION_LOCKED`
- `SECTION_INCOMPLETE`
- `CHECKPOINT_REQUIRED`
- `PRACTICAL_REQUIRED`

---

## 5. Real-Time Socratic Turn Lifecycle (SSE Streaming Pipeline)

When a learner sends a message inside the Learning Studio (`POST /api/v1/sessions/:sessionId/messages`), the backend executes a 7-stage deterministic pipeline before and during the Server-Sent Events (SSE) stream:

```text
Learner Message ("When I do b = a on a list, both variables point to the same heap list...")
  │
  ├─► Stage 1: Ownership & Session Validation
  │     Verify Bearer/cookie session, enrollment ownership, and active ChapterProgress / SectionProgress.
  │
  ├─► Stage 2: Topic Drift Firewall (DriftService.detectDrift)
  │     Scan message against future module keyword taxonomy & skip-intent regexes.
  │     - If FUTURE_TOPIC / SKIP_ATTEMPT / OFF_TOPIC:
  │       Log TopicDriftEvent -> Emit SSE `event: drift_redirect` -> Stream Socratic redirect back to active section.
  │
  ├─► Stage 3: Pre-Reply Hybrid Rubric & BKT Evaluation (RubricEvaluatorService + BKT)
  │     Evaluate learner's message in context of the assistant's `lastTutorQuestion` against active chapter RubricCriteria:
  │     - Stage 3a: Fast deterministic keyword, anti-stuffing, and misconception regex scan.
  │     - Stage 3b: Structured LLM rubric extraction (if ambiguous).
  │     - Stage 3c: Update RubricCriterionMastery, record MasteryEvidence, and update ConceptMastery P(L_t) via Bayes' Rule.
  │
  ├─► Stage 4: Pre-Reply Progression Transition (ProgressionService.recordSectionTurn)
  │     Increment SectionProgress.turnsCompleted and recompute rubricPassRatio.
  │     - If active section (e.g. S1) meets completion threshold, automatically unlock and transition to S2 (or S3 -> S4 Checkpoint)
  │       BEFORE generating the tutor reply, producing a `transitionNotice` so the tutor congratulates and bridges inline.
  │
  ├─► Stage 5: 4-Tier Section-Fenced Hybrid RAG Retrieval (RAGService.retrieveScopedContext)
  │     Retrieve top-3 curriculum chunks using 0.70 * pgvector_cosine + 0.30 * tsvector_rank:
  │     - Tier 1: Exact active `section_id`
  │     - Tier 2: Same `chapter_id` (LESSON + EXAMPLE chunks)
  │     - Tier 3: Same `module_slug` (`COMMON_MISTAKE` chunks)
  │     - Tier 4: Prerequisite modules (`module_order < current`, cap 2 chunks)
  │     - Deterministic fallback: Active LessonSection.content & Chapter.teachingContent.
  │
  ├─► Stage 6: Stateful Pedagogical Director Prompt Construction (buildSocraticSystemPrompt)
  │     Inject active section slice, demonstrated vs. pending rubric criteria, `transitionNotice`,
  │     and `extractPreviousTutorQuestions(history)` anti-repetition memory.
  │     Enforce 3-part response contract: [1. Direct Validation] -> [2. Concrete Python Trace] -> [3. Single Targeted Probe].
  │
  └─► Stage 7: Multi-Event SSE Stream to Frontend
        - `event: token`          (Real-time streamed markdown chunks)
        - `event: rubric_update`  (Criterion verdicts, confidence, evidence quotes)
        - `event: state_update`   (Updated BKT P(L_t) posterior mastery & concept state)
        - `event: section_status` (Live S1->S5 stepper snapshot, unlocks Checkpoint/Practical modal)
        - `event: done`           (Persisted assistant ChatMessage ID & latency telemetry)
```

---

## 6. Frontend Application Architecture

The frontend (`frontend/src/`) is a modular React 19 + TypeScript application using custom View Transition routing (`App.tsx`) across 14 dedicated views:

1. **Public Acquisition & Editorial Story (`LandingPageView.tsx`):**
   - `LogoPreloader.tsx` (One-time session entry animation)
   - `Silk.tsx` (Custom OGL/Three.js GPU fragment shader background)
   - `ManifestoSection.tsx` (Scroll-triggered typography with `SplitText` and `BlurText`)
   - `HeroSection.tsx` (Dual-mode interactive video narrative comparing passive vs. practical learning across 4 story slides)
   - `ProofBentoSection.tsx` & `AccordionGallery.tsx` (6-pillar interactive proof gallery)
   - `DraggableCurriculumCarousel.tsx`, `AnimatedStatsSection.tsx`, `TestimonialsSection.tsx`, `FaqSection.tsx`, `LandingFooter.tsx`
2. **Authentication Gateway (`AuthView.tsx`):**
   - Multi-step registration with persona/goal onboarding, curated zero-network SVG avatars (`constants/avatars.ts`), interactive 6-digit OTP verification (`CodeSlots.tsx`), password reset OTP flow, and Google OAuth.
3. **Learner Workspace & Telemetry Views:**
   - `DashboardView.tsx` (Active track card, BKT mastery summary, 16-week daily activity heatmap, quick resume)
   - `CatalogView.tsx` & `CourseDetailsView.tsx` (10-module syllabus explorer with live lock badges and direct launch into unlocked chapters/checkpoints/practicals)
   - `MyLearningView.tsx` & `ProgressView.tsx` (Granular module/chapter/section progress and 8-dimension Skill Radar & Weakpoint breakdown)
4. **Socratic AI Learning Studio (`LearningStudio.tsx` & `ai/AiChat9.tsx`):**
   - Live top progression stepper (`S1 Intuition` → `S2 Mechanics` → `S3 Pitfalls` → `S4 Checkpoint` → `S5 Practical`)
   - Real-time rubric mastery counter and concept BKT meters
   - Integrated Python Sandbox IDE drawer (`POST /api/v1/execute`)
   - In-studio `studio/CheckpointPanel.tsx` and `studio/PracticalPanel.tsx` evaluation modals
5. **Final Qualification & Cryptographic Credentials:**
   - `FinalAssessmentView.tsx` (Comprehensive coding, conceptual, and application assessment)
   - `CertificationResultView.tsx` (Qualification outcome and composite score breakdown)
   - `CredentialsListView.tsx` & `CredentialDetailsView.tsx` (Publicly verifiable certificate display with Ed25519 signature hash, key fingerprint, and evidence ledger)
   - `ProfileView.tsx` & `SettingsView.tsx` (Learner profile, light/dark theme persistence via `ThemeContext.tsx`)
