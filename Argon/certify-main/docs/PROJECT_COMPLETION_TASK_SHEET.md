# CERTIFY PROJECT COMPLETION TASK SHEET

## Project Status

**Overall:** NOT COMPLETE (Prototype / Early Alpha)  
**Audit Date:** 2026-10-03  
**Repository Commit:** Local Working Tree (`main` branch)  
**Build:** PASS (`backend`: `tsc` clean; `frontend`: `vite build` clean)  
**Tests:** PASS (Backend: 9 unit tests passed across 2 files; Frontend: 0 tests)  
**E2E:** PARTIAL (31 UI interaction checks passed, but core features fall back to client mocks)  
**Security:** VULNERABLE (P0 IDOR on 4 endpoints, fake public verification on 404, missing rate limiting)  
**AI:** NOT IMPLEMENTED (100% simulated via 11 substring keywords and synthetic SSE timer)  
**Certification:** UNTRUSTWORTHY (80% of evidence scores are hardcoded constants; HMAC used instead of Ed25519)  
**Production Readiness:** NOT READY (Blocked by security vulnerabilities, fake AI, and missing sandbox)  

---

# 1. COMPLETED

*Only includes verified, genuinely working subsystems backed by code, tests, and persistence.*

| ID | Area | Feature | Evidence | Verification |
|---|---|---|---|---|
| **C-01** | Auth | User Registration | `backend/src/modules/auth/auth.controller.ts:10` | Created user `audit_student@certify.internal` in SQLite with `bcrypt` salt rounds = 10. |
| **C-02** | Auth | User Login & JWT Issuance | `backend/src/modules/auth/auth.controller.ts:38` | Issues signed HS256 JWT with 7-day expiration; authenticates against stored hash. |
| **C-03** | Auth | Profile Fetch (`/auth/me`) | `backend/src/modules/auth/auth.controller.ts:65` | Returns authenticated user profile, excluding `passwordHash`. |
| **C-04** | Courses | Public Course Catalog | `backend/src/modules/courses/courses.controller.ts:8` | Returns courses where `status = "PUBLISHED"`. Verified in browser and API. |
| **C-05** | Courses | Course Hierarchy Details | `backend/src/modules/courses/courses.controller.ts:31` | Deep-fetches course versions, modules, chapters, concepts, and rubrics. |
| **C-06** | Courses | Course Enrollment Lifecycle | `backend/src/modules/courses/courses.controller.ts:81` | Creates `Enrollment`, `LearningSession`, and initializes 8 `ConceptMastery` rows at $P(L_0) = 0.1500$. Idempotent. |
| **C-07** | Mastery | Mathematical BKT Engine | `backend/src/modules/mastery/bkt.ts:13-43` | Implements standard Bayesian update formulas. 4 unit tests in `bkt.test.ts` pass cleanly. |
| **C-08** | Build | Production Compilation | `backend/package.json`, `frontend/package.json` | `npm run build` succeeds cleanly for both backend (`dist/`) and frontend (`dist/`). |
| **C-09** | UI Shell | SPA Routing & View Management | `frontend/src/App.tsx:1-120` | Seamless navigation between 18 distinct views across authenticated, public, and admin states. |

---

# 2. PARTIALLY COMPLETE

| ID | Area | Feature | Implemented | Missing | Required Work | Priority |
|---|---|---|---|---|---|---|
| **PC-01** | AI Tutor | Socratic Chat Interaction | Express SSE headers, client reader, conversation UI, and SQLite persistence. | Real LLM SDK, prompt templates, RAG embeddings, structured tool calling. | Install `@anthropic-ai/sdk`, connect Claude 3.5 Sonnet streaming, pass syllabus context. | **P0** |
| **PC-02** | Mastery | Concept Mastery Tracking | Sound BKT mathematical formulas and database mutation logic. | Authentic observation signals; currently updates BKT via 11 substring keywords. | Connect BKT to structured LLM evaluation or automated test outcomes. | **P0** |
| **PC-03** | Assessment | Chapter Assessments | Prisma schema, attempt tracking, question retrieval API. | Submission endpoint is disconnected in UI; evaluator uses keyword heuristics. | Wire `ChapterAssessmentView` to `submitChapterAssessment`; implement real rubric grading. | **P0** |
| **PC-04** | Certification | Tier Evaluation Logic | Gating thresholds (0.70, 0.85, 0.92) and composite score formula. | Real multi-modal evidence inputs; currently 4 of 5 inputs are hardcoded constants. | Replace hardcoded 0.92/0.88 constants with live queries against stored attempts and viva logs. | **P0** |
| **PC-05** | Verification | Public Credential Lookup | Public lookup endpoint and rich credential verification UI. | Signature verification; catch-all error handling injects fake credential on 404. | Verify cryptographic signatures; remove fake credential fallback. | **P0** |
| **PC-06** | Curriculum | Flagship Course Content | Seeded syllabus with 8 chapters and concepts for Python Fundamentals. | Exercises, diagnostics, and remediation align with Distributed Systems instead of Python. | Replace Distributed Systems Raft/Quorum content with Python Fundamentals exercises. | **P1** |
| **PC-07** | Design | Stitch Design System | Editorial Ivory aesthetic on Landing, Catalog, Details, and Dashboard. | Consistent application; 8 views use conflicting Obsidian Dark aesthetic. | Refactor dark views to adhere to canonical Editorial Ivory design tokens. | **P2** |

---

# 3. NOT IMPLEMENTED

| ID | Area | Missing Feature | Why Needed | Dependencies | Priority |
|---|---|---|---|---|---|
| **NI-01** | Sandbox | Code Execution Sandbox (`/api/v1/execute`) | Required to evaluate practical programming tasks, unit tests, and demonstrations safely. | Docker / gVisor daemon, worker pool | **P0** |
| **NI-02** | AI | Real LLM Provider Integration | Core value proposition: AI tutor that teaches, explains, probes, and remediates. | Anthropic or Google GenAI API credentials | **P0** |
| **NI-03** | AI | Dynamic Viva Defense Generation | Generate customized follow-up oral defense questions based on student code. | LLM Provider, Practical Submission DB | **P0** |
| **NI-04** | Assessment | Diagnostic Assessment Backend | Baseline knowledge evaluation to set calibrated BKT priors ($P(L_0)$). | Assessment service, Diagnostic questions seed | **P1** |
| **NI-05** | Mastery | Remediation Workflow Backend | Targeted practice drills when concept mastery falls below threshold. | BKT Engine, Concept Mastery DB | **P1** |
| **NI-06** | Crypto | Asymmetric Ed25519 Credential Signatures | External tamper-proof credential verification with public key. | Node.js `crypto.generateKeyPairSync` | **P1** |
| **NI-07** | Admin | Course Authoring & Management APIs | Platform-owned course authoring, question editing, and syllabus publishing. | Admin auth middleware, course schema | **P2** |
| **NI-08** | Security | API Rate Limiting Middleware | Prevent brute-force password guessing and DoS on AI endpoints. | `express-rate-limit` | **P2** |

---

# 4. BROKEN

| ID | Area | Bug | Reproduction | Root Cause | Fix | Priority |
|---|---|---|---|---|---|---|
| **B-01** | Verification | 404 Queries Return Verified "Sophia Chen" Credential | Navigate to `http://localhost:5173/verify/INVALID-1234`. Screen renders green verified badge. | `PublicVerifyView.tsx:28-54`: `.catch()` block injects hardcoded verified credential. | Remove fallback object in `.catch()`; set `verificationState: "NOT_FOUND"`. | **P0** |
| **B-02** | Assessment | Practical Tests Auto-Pass Without Code Execution | In `FinalAssessmentView.tsx`, click "Run Tests" with blank editor. Tests turn green. | `FinalAssessmentView.tsx:248`: maps test cases to `status: "passed"` unconditionally. | Require `api.executeCode()` response to contain exit code 0 and all assertions passing. | **P0** |
| **B-03** | Assessment | Chapter Assessment Does Not Submit to Backend | In `ChapterAssessmentView.tsx`, click "Submit Proof". Navigates without DB record. | `ChapterAssessmentView.tsx:67-71`: calls `onPassed()` instead of `api.submitChapterAssessment`. | Call `api.submitChapterAssessment`, await evaluated result, and handle pass/fail. | **P0** |
| **B-04** | Viva | Oral Viva Does Not Persist Attempts or Scores | Complete 3 turns of oral viva defense in `FinalAssessmentView.tsx`. Check DB: 0 rows written. | `AssessmentController.conductVivaTurn`: returns JSON without calling `prisma.assessmentAttempt.create`. | Create `AssessmentAttempt` (type: VIVA) and save turns to `AssessmentAnswer`. | **P0** |
| **B-05** | Learning | Diagnostic Submissions Discarded | Complete 4 probes in `DiagnosticView.tsx`. Answers are never sent to server. | `DiagnosticView.tsx:115-123`: `handleContinue` only increments React state counter. | Call backend diagnostic submission endpoint to record attempt and calibrate priors. | **P1** |
| **B-06** | Styling | Production Bundle Relies on CDN Tailwind | Disconnect internet or inspect production build network requests. | `index.html:10`: loads Tailwind via `https://cdn.tailwindcss.com`. | Install Tailwind CSS, PostCSS, and Autoprefixer locally; compile into CSS bundle. | **P1** |

---

# 5. SECURITY ISSUES

| ID | Vulnerability | Severity | Location | Exploit Scenario | Fix |
|---|---|---|---|---|---|
| **SEC-01** | Broken Object-Level Authorization (IDOR) | **P0 (Critical)** | `backend/src/modules/sessions/sessions.controller.ts:184-200` | Authenticated Attacker sends messages to `POST /api/v1/sessions/:sessionId/messages` with another student's `sessionId`, hijacking session and modifying BKT. | Verify `session.enrollment.userId === req.user.id`. Return `403 Forbidden` on mismatch. |
| **SEC-02** | Broken Object-Level Authorization (IDOR) | **P0 (Critical)** | `backend/src/modules/sessions/sessions.controller.ts:353-375` | Attacker calls `/sessions/:sessionId/advance` to prematurely advance another student's chapter. | Verify `session.enrollment.userId === req.user.id`. |
| **SEC-03** | Broken Object-Level Authorization (BOLA) | **P0 (Critical)** | `backend/src/modules/assessment/assessment.controller.ts:30-45` | Attacker passes another student's `enrollmentId` in body of `submitChapterAssessment`, corrupting mastery. | Verify `enrollment.userId === req.user.id` before creating attempts. |
| **SEC-04** | False Credential Forgery Bypass | **P0 (Critical)** | `frontend/src/components/PublicVerifyView.tsx:28-54` | Anyone can supply a fake credential ID and display a verified certificate for employment. | Delete catch-all fallback injection; render explicit 404 / Invalid Credential UI. |
| **SEC-05** | Broken Oral Defense Authorization | **P0 (Critical)** | `backend/src/modules/assessment/assessment.controller.ts:206-220` | Attacker calls `/assessments/final/viva` with victim's `enrollmentId`. | Verify `enrollment.userId === req.user.id`. |
| **SEC-06** | Insecure Cryptographic Architecture | **P1 (High)** | `backend/src/modules/certificates/certificates.controller.ts:91-96` | Shared secret HMAC used instead of public-key cryptography; lookup does not verify hash. | Implement asymmetric Ed25519 keypair signing and public key lookup verification. |
| **SEC-07** | Missing Rate Limiting | **P2 (Important)** | `backend/src/modules/auth/auth.routes.ts:7-9` | Attacker executes credential stuffing brute-force attack against `/auth/login`. | Add `express-rate-limit` middleware (max 5 attempts per IP per 15 minutes). |

---

# 6. AI / LLM WORK

| ID | Capability | Current State | Required State | Priority |
|---|---|---|---|---|
| **AI-01** | LLM Provider Integration | Missing. No SDK in `package.json`. | Integrate `@anthropic-ai/sdk` (Claude 3.5 Sonnet) or `@google/genai` (Gemini 1.5 Pro). | **P0** |
| **AI-02** | Socratic Dialogue Engine | 11 keyword substrings; 3 static canned string arrays. | Dynamic prompt pipeline grounding tutor in chapter objectives, student BKT profile, and chat history. | **P0** |
| **AI-03** | Structured Rubric Evaluator | `hasKeyword && length > 20` heuristic. | LLM structured output / tool call evaluating learner explanation against rubric criteria. | **P0** |
| **AI-04** | Dynamic Viva Defense Probing | Static questions about LRU cache eviction and node pointers. | Dynamic oral defense probes generated by analyzing the student's actual submitted code. | **P0** |
| **AI-05** | Streaming Response Pipeline | Express timer emitting chunks via `setTimeout(80ms)`. | Pipe native LLM provider SSE stream directly to client reader. | **P0** |
| **AI-06** | Context Window Management | Zero context window management. | Sliding window of recent chat messages (last 10 turns) with chapter summary injection. | **P1** |
| **AI-07** | Prompt Injection Defense | Zero input filtering or prompt boundaries. | System prompt delimitation, input sanitization, and output schema validation. | **P1** |

---

# 7. CERTIFICATION / EVIDENCE WORK

| ID | Evidence | Current Implementation | Required Implementation | Priority |
|---|---|---|---|---|
| **EV-01** | Theory Chapter Mastery (30%) | Mean BKT calculated from DB, but inputs are keyword-gamed. | Mean BKT calculated from verified rubric-graded chapter assessments and dialogue probes. | **P0** |
| **EV-02** | Practical Performance (25%) | Hardcoded to constant `0.92`. | Unit test pass ratio executed inside Docker sandbox on practical project tasks. | **P0** |
| **EV-03** | Viva Defense Score (20%) | Hardcoded to constant `0.88`. | Mean evaluator score across 3 dynamic viva defense turns stored in database. | **P0** |
| **EV-04** | Consistency Index (15%) | Hardcoded to constant `0.86`. | Mathematically calculated from score variance across chapters: $\max(0, 1 - \sigma)$. | **P1** |
| **EV-05** | Interaction Depth Score (10%) | Hardcoded to constant `0.82`. | Calculated ratio of verified high-level dialogue probes demonstrated during learning. | **P1** |
| **EV-06** | Immutable Evidence Snapshot | Snapshot stores hardcoded constants in JSON string. | Snapshot links to foreign keys: `attemptIds`, `answerIds`, and git commit hashes. | **P1** |
| **EV-07** | Ed25519 Cryptographic Proof | HMAC-SHA256 with `jwtSecret`. | Ed25519 digital signature over canonicalized evidence summary, verifiable by public key. | **P1** |

---

# 8. FRONTEND WORK

| ID | Screen | Issue | Required Fix | Dependency | Priority |
|---|---|---|---|---|---|
| **FE-01** | `PublicVerifyView` | Fakes verified credential for "Sophia Chen" on 404. | Remove fallback in `.catch()`; render explicit "Credential Not Found" error state. | None | **P0** |
| **FE-02** | `FinalAssessmentView` | "Run Tests" button auto-marks all tests as passed. | Call `/api/v1/execute` and render genuine pass/fail badges based on stdout/stderr. | Backend NI-01 | **P0** |
| **FE-03** | `ChapterAssessmentView` | Does not submit to backend API; uses TypeScript Raft code. | Call `api.submitChapterAssessment`; load Python chapter assessment questions. | Backend PC-03 | **P0** |
| **FE-04** | `DiagnosticView` | Runs purely in React state; tests Raft consensus instead of Python. | Load Python diagnostic questions; submit answers to backend API. | Backend NI-04 | **P1** |
| **FE-05** | `RemediationStudioView` | Breadcrumbs hardcoded to Distributed Systems; unpersisted. | Bind to dynamic concept props; record remediation completion via API. | Backend NI-05 | **P1** |
| **FE-06** | Global Theme | Dual-theme clash: 8 views use Obsidian Dark, 10 use Editorial Ivory. | Unify all views on approved Stitch Editorial Ivory design system (`#F8F7F4`). | Design Tokens | **P1** |
| **FE-07** | Build Assets | Loads Tailwind CSS from CDN script in `index.html`. | Migrate to local PostCSS + Tailwind build pipeline. | NPM packages | **P1** |
| **FE-08** | `LearningStudio` | Simulated fallback response injected when session is null. | Display explicit error and retry prompt instead of fake chat. | None | **P2** |
| **FE-09** | Form Validation | Login and Register forms lack client-side regex format validation. | Add schema validation (Zod) and inline error hints. | Zod package | **P2** |

---

# 9. BACKEND WORK

| ID | Module | Issue | Required Fix | Dependency | Priority |
|---|---|---|---|---|---|
| **BE-01** | `sessions` | IDOR on `streamMessage` and `advanceChapter`. | Check `session.enrollment.userId === req.user.id`. Return 403 on mismatch. | None | **P0** |
| **BE-02** | `assessment` | BOLA on `submitChapterAssessment` and `conductVivaTurn`. | Check `enrollment.userId === req.user.id`. Return 403 on mismatch. | None | **P0** |
| **BE-03** | `certificates` | Hardcoded evidence constants (0.92, 0.88, 0.86, 0.82) in `issueCertificate`. | Query database for real practical scores, viva scores, consistency, and depth. | DB schema | **P0** |
| **BE-04** | `sandbox` | Missing code execution endpoint `POST /api/v1/execute`. | Implement Docker/microVM worker pool executing code with timeouts and memory limits. | Docker daemon | **P0** |
| **BE-05** | `sessions` | Keyword substring matching used to trigger BKT updates. | Implement real LLM evaluator producing structured demonstration booleans. | AI SDK | **P0** |
| **BE-06** | `architecture` | Missing Service layer; controllers contain heavy business logic. | Refactor into `SessionsService`, `AssessmentService`, `CertificatesService`. | None | **P1** |
| **BE-07** | `transactions` | Multi-table writes executed without `prisma.$transaction`. | Wrap assessment evaluations and certificate issuance in database transactions. | Prisma | **P1** |
| **BE-08** | `validation` | Missing request body validation middleware. | Add `zod` schema validation middleware on all POST/PUT routes. | Zod package | **P1** |
| **BE-09** | `security` | Missing rate limiting middleware. | Implement `express-rate-limit` on `/auth` and `/sessions` routes. | NPM package | **P2** |

---

# 10. DATABASE WORK

| ID | Model/Migration | Issue | Required Fix | Priority |
|---|---|---|---|---|
| **DB-01** | Database Engine | Running on SQLite (`file:./dev.db`) instead of PostgreSQL. | Migrate datasource to PostgreSQL 16+ with connection pooling. | Docker / Postgres | **P1** |
| **DB-02** | `AssessmentAttempt` | Does not persist practical task submissions or test outputs. | Add `codeSubmission String?` and `testOutput String?` fields. | Prisma migration | **P1** |
| **DB-03** | `Certificate` | Missing public key ID and revocation audit fields. | Add `publicKeyId String?`, `revokedAt DateTime?`, `revocationReason String?`. | Prisma migration | **P1** |
| **DB-04** | `CourseVersion` | Content lacks version immutability constraints. | Add database constraint preventing edits to versions with active enrollments. | Prisma migration | **P2** |
| **DB-05** | Seed Data | Flagship course seed lacks practical challenge specifications. | Add practical coding task prompts and unit test assertions to seed script. | `seed.ts` | **P2** |

---

# 11. TESTING WORK

| ID | Test | Current State | Required | Priority |
|---|---|---|---|---|
| **TST-01** | Security Integration Tests | 0 tests. IDOR vulnerabilities undetected. | Integration tests verifying that Student A cannot access Student B's session or enrollment. | **P0** |
| **TST-02** | Certification Pipeline Tests | Unit test in `bkt.test.ts` only tests pure math. | End-to-end test verifying certificate issuance fails if practical or viva score is low. | **P0** |
| **TST-03** | AI Evaluator Mock Tests | 0 tests. | Test LLM response parser, JSON schema validation, and fallback handling. | **P0** |
| **TST-04** | API Route Integration Tests | 1 placeholder test (`app.test.ts`). | Supertest suite covering all 15 Express endpoints with success and error cases. | **P1** |
| **TST-05** | Code Sandbox Execution Tests | 0 tests. | Tests for sandbox timeout, memory limit enforcement, and error extraction. | **P1** |
| **TST-06** | Frontend Component & E2E Tests | 0 test files in frontend. | Vitest component tests and Playwright E2E tests for the complete learner journey. | **P1** |

---

# 12. PRODUCTION READINESS

| ID | Area | Current State | Required Work | Priority |
|---|---|---|---|---|
| **PR-01** | Containerization | No `Dockerfile` or `docker-compose.yml`. | Create multi-stage production Dockerfile for backend and Nginx for frontend. | **P1** |
| **PR-02** | Environment Variables | Minimal validation; missing AI API keys. | Strict environment validation using Zod (`process.env.ANTHROPIC_API_KEY`, etc.). | **P1** |
| **PR-03** | Security Headers | Basic CORS enabled; no Helmet.js. | Add `helmet` middleware for CSP, HSTS, frameguard, and X-Content-Type-Options. | **P1** |
| **PR-04** | Logging & Observability | `console.log` and `console.error` throughout. | Integrate structured JSON logging (`pino` or `winston`) with request correlation IDs. | **P2** |
| **PR-05** | CI/CD Pipeline | Missing GitHub Actions workflow. | Configure CI pipeline running linter, typecheck, tests, and build on pull requests. | **P2** |

---

# 13. DOCUMENTATION WORK

| ID | Document | Current State | Action | Priority |
|---|---|---|---|---|
| **DOC-01** | `README.md` | Generic template or outdated setup. | **UPDATE:** Document actual architecture, environment setup, and verification. | **P1** |
| **DOC-02** | `docs/STITCH_FIDELITY_FINAL_REPORT.md` | Claims 100% fidelity despite unresolved theme conflicts. | **UPDATE:** Note dual-theme transition and ongoing unification plan. | **P2** |
| **DOC-03** | `docs/system-qa/` | Outdated test runs from previous iterations. | **REPLACE:** Supersede with reports from `docs/audit/`. | **P2** |
| **DOC-04** | API Reference Document | No OpenAPI / Swagger specification. | **CREATE:** Generate OpenAPI 3.0 spec for backend API routes. | **P3** |

---

# 14. FINAL EXECUTION ROADMAP

A dependency-aware, 12-phase implementation sequence to take CERTIFY from prototype to production.

```
PHASE 0 (Blockers & Security)
       │
       ▼
PHASE 1 (Sandbox Engine) ──────► PHASE 2 (AI Provider Integration)
       │                                     │
       ▼                                     ▼
PHASE 3 (Assessment Wiring) ◄────────────────┘
       │
       ▼
PHASE 4 (Evidence & Certification Grounding)
       │
       ▼
PHASE 5 (Frontend Unification & Design)
       │
       ▼
PHASE 6 (Curriculum Alignment)
       │
       ▼
PHASE 7 (Database Migration & Transactions)
       │
       ▼
PHASE 8 (Testing & Verification Suite)
       │
       ▼
PHASE 9 (Production Hardening & CI/CD)
```

---

### PHASE 0 — Critical Blockers & Security Hardening (P0)
- **Objective:** Eliminate active security vulnerabilities and remove deceptive fallback behavior.
- **Tasks:**
  1. Add ownership verification in `sessions.controller.ts:streamMessage` and `advanceChapter` (`session.enrollment.userId === req.user.id`).
  2. Add ownership verification in `assessment.controller.ts:submitChapterAssessment` and `conductVivaTurn`.
  3. Remove synthetic credential injection in `PublicVerifyView.tsx:28-54`; display genuine 404 UI.
  4. Remove unconditional `status: "passed"` mapping in `FinalAssessmentView.tsx:248`.
- **Affected Files:** `sessions.controller.ts`, `assessment.controller.ts`, `PublicVerifyView.tsx`, `FinalAssessmentView.tsx`.
- **Acceptance Criteria:** Student A receives 403 when sending messages to Student B's session. Querying an invalid credential ID in UI renders "Credential Not Found". Clicking "Run Tests" with empty code does not pass.
- **Tests Required:** Supertest IDOR tests for all authenticated endpoints.

---

### PHASE 1 — Isolated Code Sandbox Execution (P0)
- **Objective:** Create a secure, isolated sandbox for running learner code and unit tests.
- **Tasks:**
  1. Create backend service `backend/src/modules/sandbox/sandbox.service.ts`.
  2. Implement endpoint `POST /api/v1/execute` running code inside isolated subprocess / Docker container with 5s timeout and 128MB RAM limit.
  3. Wire frontend `api.ts:executeCode` to the new endpoint, removing the `0 errors detected` fallback.
- **Affected Files:** `backend/src/modules/sandbox/*`, `backend/src/app.ts`, `frontend/src/services/api.ts`.
- **Acceptance Criteria:** Running syntax errors returns stderr and exit code 1; infinite loops terminate cleanly after 5 seconds with timeout error.
- **Tests Required:** Sandbox unit tests with valid code, syntax errors, timeouts, and restricted syscalls.

---

### PHASE 2 — Real AI Provider Integration (P0)
- **Objective:** Replace keyword matching with genuine LLM inference.
- **Tasks:**
  1. Install `@anthropic-ai/sdk` in `backend/package.json`; configure `ANTHROPIC_API_KEY` in environment.
  2. Implement `SocraticTutorService`: construct prompts with chapter teaching content, BKT mastery state, and recent conversation turns.
  3. Stream native SSE tokens to client in `SessionsController.streamMessage`.
  4. Implement structured tool call `evaluateConceptDemonstration` to evaluate learner understanding against `RubricCriterion`.
  5. Delete 11 hardcoded substring keywords in `sessions.controller.ts`.
- **Affected Files:** `backend/package.json`, `backend/src/modules/sessions/*`, `backend/src/config/index.ts`.
- **Acceptance Criteria:** Tutor streams intelligent pedagogical responses to arbitrary learner questions. Keyword stuffing does not artificially trigger BKT updates.
- **Tests Required:** LLM service integration tests with mocked API responses.

---

### PHASE 3 — Assessment & Viva Pipeline Wiring (P0)
- **Objective:** Connect assessments, practical tasks, and viva turns to the backend database.
- **Tasks:**
  1. Wire `ChapterAssessmentView.tsx` to call `api.submitChapterAssessment`.
  2. Implement dynamic viva defense: generate personalized questions using LLM based on student's practical submission.
  3. Persist viva turns and scores in `AssessmentAttempt` (type: `VIVA`) and `AssessmentAnswer`.
  4. Delete static LRU cache questions in `assessment.controller.ts:226-235`.
- **Affected Files:** `ChapterAssessmentView.tsx`, `assessment.controller.ts`, `FinalAssessmentView.tsx`.
- **Acceptance Criteria:** Submitting a chapter assessment creates DB records and updates BKT. Completing viva defense records 3 turns in SQLite.
- **Tests Required:** Assessment submission integration tests.

---

### PHASE 4 — Evidence Grounding & Cryptographic Certification (P0/P1)
- **Objective:** Ensure certification is strictly grounded in real accumulated evidence.
- **Tasks:**
  1. Delete hardcoded constants (0.92, 0.88, 0.86, 0.82) in `certificates.controller.ts:51-56`.
  2. Calculate `practicalPerformance` from stored practical assessment test pass ratios.
  3. Calculate `vivaDefenseScore` from stored viva evaluations.
  4. Calculate `consistencyIndex` from chapter score variance: $\max(0, 1 - \sigma)$.
  5. Calculate `interactionDepthScore` from dialogue evidence counts.
  6. Implement Ed25519 digital signatures: sign evidence summary using private key; expose public key; verify signature on lookup.
- **Affected Files:** `certificates.controller.ts`, `bkt.ts`, `schema.prisma`.
- **Acceptance Criteria:** Certificate issuance fails if student has not completed practical or viva assessments. Issued certificates verify cryptographically using Ed25519 public key.
- **Tests Required:** End-to-end certification issuance test with gating assertions.

---

### PHASE 5 — Frontend Design System Unification (P1/P2)
- **Objective:** Resolve dual-theme conflict and eliminate CDN dependencies.
- **Tasks:**
  1. Remove runtime Tailwind CDN script in `index.html`; install local PostCSS and Tailwind.
  2. Refactor 8 dark-themed views (`DiagnosticView`, `RemediationStudioView`, `ChapterAssessmentView`, `FinalAssessmentView`, `DashboardView`, `CredentialsView`, `ProfileView`, `AdminView`) to use the approved Stitch Editorial Ivory palette (`#F8F7F4`, `#1B1917`, `#57534E`).
  3. Standardize typography on `Plus Jakarta Sans` / `Newsreader` and remove inline ad-hoc hex colors.
- **Affected Files:** `frontend/index.html`, `frontend/package.json`, `frontend/src/components/*`.
- **Acceptance Criteria:** Zero network requests to `cdn.tailwindcss.com`. Visual inspection confirms harmonious Editorial Ivory design across all 18 views.
- **Tests Required:** Visual regression testing and linting (`npm run lint`).

---

### PHASE 6 — Curriculum Content Alignment (P1)
- **Objective:** Ensure all course material aligns with Python Fundamentals.
- **Tasks:**
  1. Update `DiagnosticView.tsx` with 5 Python Fundamentals diagnostic probes (variables, memory model, loops, functions, data structures).
  2. Update `ChapterAssessmentView.tsx` with Python exercises instead of TypeScript Quorum Coordinator.
  3. Update `RemediationStudioView.tsx` with dynamic concept bindings.
  4. Update `seed.ts` with comprehensive Python practical tasks and unit test suites.
- **Affected Files:** `DiagnosticView.tsx`, `ChapterAssessmentView.tsx`, `RemediationStudioView.tsx`, `seed.ts`.
- **Acceptance Criteria:** All questions, code snippets, and error messages throughout the learner journey relate to Python.
- **Tests Required:** Seed verification test.

---

### PHASE 7 — Database Architecture & Transactions (P1)
- **Objective:** Ensure data integrity and production-ready persistence.
- **Tasks:**
  1. Wrap multi-table operations in `assessment.controller.ts` and `certificates.controller.ts` in `prisma.$transaction`.
  2. Configure PostgreSQL 16+ datasource for staging and production environments.
  3. Add missing fields (`codeSubmission`, `testOutput`, `publicKeyId`) to Prisma schema and run migrations.
- **Affected Files:** `backend/prisma/schema.prisma`, `backend/prisma/migrations/*`, controllers.
- **Acceptance Criteria:** Database rollback cleanly prevents orphaned records if a multi-step evaluation fails midway.
- **Tests Required:** Database transaction failure rollback tests.

---

### PHASE 8 — Full Test Suite Authoring (P1)
- **Objective:** Achieve comprehensive test coverage across critical pathways.
- **Tasks:**
  1. Author API integration test suite using Supertest covering all 15 endpoints.
  2. Author security tests covering IDOR, authentication bypass, and rate limiting.
  3. Author Playwright E2E test verifying the complete unauthenticated-to-certified user journey.
- **Affected Files:** `backend/tests/*`, `frontend/e2e/*`.
- **Acceptance Criteria:** `npm test` executes $> 50$ automated tests with 100% pass rate.
- **Tests Required:** Unit, integration, and E2E suites.

---

### PHASE 9 — Production Hardening & CI/CD (P1/P2)
- **Objective:** Prepare CERTIFY for secure, reliable cloud deployment.
- **Tasks:**
  1. Create multi-stage `Dockerfile` for backend and Nginx configuration for frontend.
  2. Add `helmet` security headers and `express-rate-limit` middleware.
  3. Configure GitHub Actions workflow for linting, testing, and Docker builds.
  4. Implement structured JSON logging with request correlation IDs.
- **Affected Files:** `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`, `app.ts`.
- **Acceptance Criteria:** Automated CI pipeline passes on GitHub; Docker containers build and start with clean health check responses.
- **Tests Required:** Container health check verification.
