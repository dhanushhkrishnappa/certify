# CERTIFY — End-to-End Repository Audit & Verified Feature-Status Matrix

**Document Path:** `docs/CERTIFY_END_TO_END_AUDIT.md`  
**Audit Date:** 2026-10-17  
**Audited Inputs:**
1. `CERTIFY_End_to_End_Project_Context_and_Backend_Roadmap.docx` (23 sections, 32 tables)
2. `certify-main` repository snapshot (reconstructed from uploaded project folder `137ITkSfsz5UqzkX1nN8BfFWYhjIsyJzv`, commit lineage `5961664` + subsequent landing/auth edits)

**Overall Audit Status:** `AUDIT COMPLETE — PRODUCTION RELEASE BLOCKED PRIOR TO REMEDIATION`

---

## 1. Executive Summary & Evidence Standard

This document records the complete, evidence-backed audit of the CERTIFY codebase prior to our Phase 9 remediation milestones. Every finding is grounded in direct inspection of the actual source files across `backend/`, `frontend/`, `backend/prisma/`, and `docs/`.

### High-Level Verdict on Initial Repository State
Prior to remediation, CERTIFY functioned as an **interactive UI prototype backed by partial relational persistence and simulated core domain logic**:
- **Working Foundations:** Relational schema design (`backend/prisma/schema.prisma`, 16 models), Python Fundamentals curriculum seed (`backend/prisma/seed.ts`, 8 modules, 9 chapters, 10 concepts, 10 rubrics, 19 criteria, 15 questions), isolated BKT mathematical formula (`backend/src/modules/mastery/bkt.ts`), basic JWT registration/login endpoints (`backend/src/modules/auth/auth.controller.ts`), and course catalog/enrollment persistence (`backend/src/modules/courses/courses.controller.ts`).
- **Critical Production Blockers Confirmed in Code:**
  1. **Zero Real LLM Integration (`P0`):** Neither `@anthropic-ai/sdk` nor `openai` is installed in `backend/package.json`. `SessionsController.streamMessage` (`backend/src/modules/sessions/sessions.controller.ts:176-276`) uses an 11-word substring check (`pointer`, `reference`, `lazy`, `closure`, etc.) and `setTimeout(80ms)` loops while writing fake metadata `model: "claude-3-5-sonnet-pedagogical-v1"`.
  2. **Conversational Tutor Directly Grants Mastery (`P0`):** Violating Non-Negotiable Principle B, `SessionsController.streamMessage` directly updates `ConceptMastery` (`BayesianKnowledgeTracer.update(currentP, true)`) whenever a chat message contains any of the 11 keywords—even in negated statements like `"I do not understand what a pointer is"`.
  3. **Naive Keyword Grading & Nested-Loop Multiplication Bug (`P0`):** `AssessmentController.submitChapterAssessment` (`backend/src/modules/assessment/assessment.controller.ts:62-150`) checks a 15-keyword list (`answerLower.length > 20 && hasKeyword`) and iterates over *every* concept and criterion in the chapter for *every* submitted answer—multiplying BKT updates and grading unrelated concepts.
  4. **Hardcoded Certification Evidence Constants (`P0`):** `CertificatesController.issueCertificate` (`backend/src/modules/certificates/certificates.controller.ts:43-46`) hardcodes 4 of 5 composite score inputs (`practicalScore = 0.92`, `vivaScore = 0.88`, `consistency = 0.86`, `interactionDepth = 0.82`), fabricating 70% of the certification weight (`0.6170` fixed base score).
  5. **Horizontal Privilege Escalation / IDOR (`P0`):** `streamMessage`, `advanceChapter`, `submitChapterAssessment`, and `conductVivaTurn` never check `enrollment.userId === req.user.id`. Any authenticated user can mutate another learner's session, mastery, or assessment records.
  6. **Cryptographic Signing Mismatch (`P0`):** Frontend views and docs claim **Ed25519** asymmetric digital signatures, but `CertificatesController.issueCertificate` (`lines 79-82`) computes a symmetric `HMAC-SHA256` using `config.jwtSecret`, and `verifyPublicCredential` (`lines 112-160`) never verifies the signature hash on read.
  7. **Frontend Authentication & Routing Regressions (`P0/P1`):** `AuthView.tsx` (`lines 11-66`) replaced email/password inputs with a "1-Click instant access • Zero password required" form that logs everyone into `learner@certify.edu` (`Password123!`) and falls back to a fake client token `demo-token-${Date.now()}` if offline. Furthermore, `App.tsx` removed the `/verify` route from `CertifyView` and `validViews`, breaking public verification links, while `DiagnosticView.tsx`, `ChapterAssessmentView.tsx`, `RemediationStudioView.tsx`, `FinalAssessmentView.tsx`, `CertificationResultView.tsx`, `CredentialsListView.tsx`, and `CredentialDetailsView.tsx` operate on hardcoded React state (including Distributed Systems/Raft TypeScript code in a Python course).

---

## 2. Phase 0 & Phase 2 Complete Repository Inventory

### 2.1 Directory & Entry Point Inventory

| Area | Path | Role & Actual State |
| :--- | :--- | :--- |
| **Root Manifests** | `README.md`, `DESIGN.md`, `.gitignore` | Project overview and Stitch design tokens. No root `package.json`, `docker-compose.yml`, or `.github/workflows/` CI files exist. |
| **Backend Entry** | `backend/src/server.ts`, `backend/src/app.ts` | Express 4.21 HTTP server listening on `config.port` (`5000`), mounting `/api/v1/health`, `/api/v1/auth`, `/api/v1/courses`, `/api/v1` (sessions), `/api/v1/assessments`, and `/api/v1/certificates`. |
| **Backend Config** | `backend/src/config/index.ts`, `backend/.env.example` | Reads `PORT`, `DATABASE_URL` (`file:./dev.db`), `JWT_SECRET` (with hardcoded fallback `"certify_super_secure_jwt_secret_dev_key_2026"`), `NODE_ENV`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`. |
| **Database & ORM** | `backend/prisma/schema.prisma`, `backend/prisma/seed.ts` | Prisma 5.20 with `provider = "sqlite"`. 16 models (`User`, `Course`, `CourseVersion`, `Module`, `Chapter`, `Concept`, `Rubric`, `RubricCriterion`, `Question`, `Enrollment`, `LearningSession`, `ChatMessage`, `ConceptMastery`, `MasteryEvidence`, `AssessmentAttempt`, `AssessmentAnswer`, `RubricEvaluation`, `Certificate`). No `prisma/migrations/` folder exists (uses `prisma db push`). |
| **Backend Modules** | `backend/src/modules/{auth,courses,sessions,assessment,mastery,certificates}` | 5 Express route/controller pairs + 1 math module (`mastery/bkt.ts`). No separate service layer (`*.service.ts`) exists in the initial checkout. |
| **Backend Tests** | `backend/src/modules/mastery/bkt.test.ts`, `backend/src/app.test.ts`, `backend/test-client.ts` | `bkt.test.ts` has 8 unit tests for `BayesianKnowledgeTracer` and `CertificationEvaluator`. `app.test.ts` only checks `expect(app).toBeDefined()`. `test-client.ts` is a manual script that directly mutates SQLite via `prisma.conceptMastery.updateMany` to bypass chapter progression. |
| **Frontend Entry** | `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/App.tsx` | React 19.2.8 + Vite 8.3.0 SPA. Uses custom `window.location.pathname` + `history.pushState` routing in `App.tsx`. |
| **Frontend API Client** | `frontend/src/services/api.ts`, `frontend/src/types/index.ts` | Wraps `fetch` against `http://localhost:5000/api/v1`. Includes silent mock fallback in `executeCode()` returning `0 errors detected` when `POST /api/v1/execute` 404s. |
| **Frontend Learner Views** | `frontend/src/components/*.tsx` (16 view/modal files + 4 `common/` + 27 `landing/` files) | Visually rich components; however, 8 core learner views (`DiagnosticView`, `ChapterAssessmentView`, `RemediationStudioView`, `FinalAssessmentView`, `CertificationResultView`, `CredentialsListView`, `CredentialDetailsView`, `ProgressView`) do not call backend APIs for their primary data or submissions. |

---

## 3. Detailed Audit by Layer (Phase 2.1 – 2.5)

### 3.1 Frontend Audit (Screen-by-Screen Verification)

| Screen / Component | File Path | Backend Integration Status | Confirmed Defects & Hardcoded Behavior |
| :--- | :--- | :--- | :--- |
| **Public Landing Page** | `frontend/src/components/LandingPageView.tsx` + `landing/*` | **PARTIAL** (`DraggableCurriculumCarousel` imports `api`, other sections static) | `AnimatedStatsSection.tsx:38`, `LandingFooter.tsx:41,119`, `ChooseYourPathSection.tsx:117`, and `FaqSection.tsx:26` make unverified `Ed25519` cryptographic ledger claims; `FaqSection.tsx:26` falsely claims public verifiers can read candidate oral defense transcripts. |
| **Auth / Login / Register** | `frontend/src/components/AuthView.tsx` | **BROKEN / HARDCODED** | Only renders a `Learner Display Name` input (`"Dhanush K"`). Clicking submit (`handleInstantLogin`, lines 17-66) runs `setTimeout` animations and calls `api.login("learner@certify.edu", "Password123!")`. If the backend is unreachable, it fabricates `demo-token-${Date.now()}` in `localStorage`. No email/password fields or registration flow exist in the UI. |
| **Dashboard** | `frontend/src/components/DashboardView.tsx` | **PARTIAL** | Calls `api.listCourses()` and `api.getSessionContext(activeSlug)`, but learning streak (`12 days`), skill radar (`Application 62%`, `Consistency 85%`), and activity feed are hardcoded static telemetry. |
| **Course Catalog** | `frontend/src/components/CatalogView.tsx` | **PARTIAL** | Calls `api.listCourses()`, but merges/falls back to 5 hardcoded non-existent courses (`web-development-foundations`, `data-structures-problem-solving`, `generative-ai-developers`, `databases-sql`, `devops-cloud-essentials`) that 404 on backend lookup. |
| **Course Details** | `frontend/src/components/CourseDetailsView.tsx` | **PARTIAL** | Calls `api.getCourseBySlug(courseSlug)` and `api.getSessionContext(courseSlug)`. However, clicking "Start Course" navigates directly to `studio` without calling `api.enrollCourse(slug)` first. |
| **My Learning** | `frontend/src/components/MyLearningView.tsx` | **PARTIAL** | Calls `api.getSessionContext` and `api.listCourses`, but displays hardcoded secondary tabs, habit trackers, and completed course stubs. |
| **Baseline Diagnostic** | `frontend/src/components/DiagnosticView.tsx` | **MOCKED / HARDCODED** | Zero API calls. Hardcodes 4 probes (`DIAG-PROBE-01-MEM`, `DIAG-PROBE-02-RAFT`, `DIAG-PROBE-03-CONC`, `DIAG-PROBE-04-QUORUM` — 2 of 4 are Distributed Systems Raft/Quorum probes, not Python Fundamentals). Clicking Complete calls `onComplete()` locally without persisting anything. |
| **AI Learning Studio** | `frontend/src/components/LearningStudio.tsx` | **PARTIAL** | Calls `api.getSessionContext(courseSlug)`, `api.streamMessage(...)`, and `api.executeCode(...)`. However, renders a hardcoded initial exchange (`greet("Dhanush")`) above real messages, displays hardcoded OS concepts (`Epoll Multiplexing`) in telemetry panels, and falls back to local simulated chat if session context is null. |
| **Chapter Assessment (View)** | `frontend/src/components/ChapterAssessmentView.tsx` | **MOCKED / HARDCODED** | Displays hardcoded TypeScript code (`QuorumCoordinator<T>` from `@certify/distributed-core`) for `"Distributed Systems Architecture"`. `handleSubmitProof` (line 67) calls `onComplete()` without calling `api.submitChapterAssessment`. (Note: `ChapterAssessmentModal.tsx` *does* call `api.getChapterQuestions` and `api.submitChapterAssessment`, but the standalone route `/chapter-assessment` mounts `ChapterAssessmentView.tsx`). |
| **Remediation Studio** | `frontend/src/components/RemediationStudioView.tsx` | **MOCKED / HARDCODED** | Zero API calls. Hardcoded to `"Distributed Systems Architecture / Chapter 2: Quorum Systems / Remediation: Vector Clocks & Causality"` with hardcoded user `"Alex Rivera"` and `"Ed25519: 98a4...e210"`. |
| **Final Assessment & Practical** | `frontend/src/components/FinalAssessmentView.tsx` | **MOCKED / HARDCODED** | Hardcodes 12 questions in TSX. Clicking "Run Tests" calls `api.executeCode` (which 404s and returns fake success) and unconditionally sets all test cases to `status: "passed"`. Clicking Submit navigates to `result` without persisting an assessment attempt. |
| **AI Viva / Defense** | `frontend/src/App.tsx` / `api.ts` | **MISSING IN ROUTER / MOCKED API** | `api.conductVivaTurn` exists in `api.ts`, but `VivaChamberView` / `VivaDefenseModal` are not mounted in `App.tsx` (`onSubmitForViva` in `App.tsx:266` routes directly to `"result"`). |
| **Certification Result** | `frontend/src/components/CertificationResultView.tsx` | **MOCKED / HARDCODED** | Zero API calls. Never calls `api.issueCertificate`. Hardcodes `credentialId = "CERT-PY-2026-001842"`, `87% Overall`, `92% Conceptual`, `84% Practical`, `81% Reasoning`. |
| **My Credentials** | `frontend/src/components/CredentialsListView.tsx` | **MOCKED / HARDCODED** | Zero API calls. Hardcodes 2 credentials (`CERT-PY-2026-88914` and `CERT-WEB-2026-44012`). |
| **Credential Details** | `frontend/src/components/CredentialDetailsView.tsx` | **MOCKED / HARDCODED** | Zero API calls. Hardcodes `CERT-PY-2026-001842` and issue date `"23 September 2026"`. |
| **Public Verification** | `frontend/src/App.tsx` (`verify` route) | **MISSING / UNMOUNTED** | `api.verifyPublicCredential` exists in `api.ts`, but `App.tsx` removed `"verify"` from `CertifyView` and `validViews`, so `/verify/:id` redirects to `"landing"`. |
| **Progress / Profile / Settings** | `ProgressView.tsx`, `ProfileView.tsx`, `SettingsView.tsx` | **MOCKED / HARDCODED** | All three render static hardcoded charts/toggles with zero backend persistence. |

### 3.2 Backend Audit (Endpoint-by-Endpoint Trace)

| Method & Route | Controller Symbol | Auth / Ownership Check | Persistence & Domain Behavior | Audit Verdict |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/v1/health` | `app.ts:15` | Public | Returns `{ status: "ok", service: "certify-backend", version: "1.0.0", timestamp }`. | `VERIFIED COMPLETE` |
| `POST /api/v1/auth/register` | `AuthController.register` (`auth.controller.ts:19`) | Public | Validates `RegisterSchema` (Zod), hashes password with `bcryptjs.hash(password, 10)`, creates `User`, signs 7d HS256 JWT. | `PARTIALLY IMPLEMENTED` (No rate limit, 7d token) |
| `POST /api/v1/auth/login` | `AuthController.login` (`auth.controller.ts:58`) | Public | Validates `LoginSchema` (Zod), verifies bcrypt hash, signs 7d HS256 JWT. | `PARTIALLY IMPLEMENTED` (No rate limit) |
| `GET /api/v1/auth/me` | `AuthController.getMe` (`auth.controller.ts:91`) | `requireAuth` (Self) | Queries `User` by `req.user.id` including `enrollments`, `courseVersion.course`, and `certificate`. | `VERIFIED COMPLETE` |
| `GET /api/v1/courses` | `CoursesController.listCourses` (`courses.controller.ts:6`) | Public | Queries `Course` (`status: "PUBLISHED"`) with active `CourseVersion`, modules, and chapter counts. | `VERIFIED COMPLETE` |
| `GET /api/v1/courses/:slug` | `CoursesController.getCourseBySlug` (`courses.controller.ts:44`) | Public | Queries `Course` by `slug` with ordered modules, chapters, and concepts. | `VERIFIED COMPLETE` |
| `POST /api/v1/courses/:slug/enroll` | `CoursesController.enroll` (`courses.controller.ts:94`) | `requireAuth` (Self) | Idempotently creates `Enrollment` for `(userId, courseVersionId)`, initializes `ConceptMastery` (`pMastery: 0.15`), and creates first `LearningSession`. Not wrapped in `$transaction`. | `PARTIALLY IMPLEMENTED` |
| `GET /api/v1/courses/:slug/session` | `SessionsController.getSessionContext` (`sessions.controller.ts:7`) | `requireAuth` (Self) | Loads or auto-creates `Enrollment`, active `LearningSession`, last 30 `ChatMessage` rows, and `ConceptMastery` rows. | `VERIFIED COMPLETE` |
| `POST /api/v1/sessions/:sessionId/messages` | `SessionsController.streamMessage` (`sessions.controller.ts:154`) | **BROKEN (`IDOR`)** | **No ownership check on `sessionId`**. Uses 11-keyword substring check instead of an LLM, directly mutates `ConceptMastery` during tutoring chat, writes fake model `"claude-3-5-sonnet-pedagogical-v1"`. | `MOCKED / HARDCODED` + `P0 IDOR` |
| `POST /api/v1/sessions/:sessionId/advance` | `SessionsController.advanceChapter` (`sessions.controller.ts:297`) | **BROKEN (`IDOR`)** | **No ownership check on `sessionId`**. Checks `pMastery >= 0.70` on chapter concepts and advances `session.chapterId`. Comment says `>= 0.75`, code checks `< 0.70`. | `PARTIALLY IMPLEMENTED` + `P0 IDOR` |
| `GET /api/v1/assessments/chapters/:chapterId` | `AssessmentController.getChapterQuestions` (`assessment.controller.ts:7`) | `requireAuth` | Queries `Question` rows for `chapterId`. | `VERIFIED COMPLETE` |
| `POST /api/v1/assessments/chapters/:chapterId/submit` | `AssessmentController.submitChapterAssessment` (`assessment.controller.ts:25`) | **BROKEN (`IDOR`)** | **No ownership check on `enrollmentId`**. Uses 15-keyword substring check (`length > 20`). Loops over all chapter concepts/criteria per answer (multiplying BKT updates). Non-transactional. | `MOCKED / HARDCODED` + `P0 IDOR` |
| `POST /api/v1/assessments/final/viva` | `AssessmentController.conductVivaTurn` (`assessment.controller.ts:181`) | **BROKEN (`IDOR`)** | **No ownership check on `enrollmentId`**. Zero DB reads/writes. Returns hardcoded LRU cache strings and keyword-based `0.94`/`0.72` score. | `MOCKED / HARDCODED` + `P0 IDOR` |
| `POST /api/v1/certificates/issue` | `CertificatesController.issueCertificate` (`certificates.controller.ts:13`) | `requireAuth` + Owner check | Verifies `enrollment.userId === userId`. **Hardcodes** `practicalScore = 0.92`, `vivaScore = 0.88`, `consistency = 0.86`, `interactionDepth = 0.82`. Signs with `HMAC-SHA256` using `jwtSecret`. Non-transactional. | `MOCKED / HARDCODED` |
| `GET /api/v1/certificates/:credentialId/verify` | `CertificatesController.verifyPublicCredential` (`certificates.controller.ts:112`) | Public | Queries `Certificate` by `credentialId`. Returns `signatureHash` without verifying it. | `PARTIALLY IMPLEMENTED` |

### 3.3 Database Audit (`backend/prisma/schema.prisma`)
- **Engine & Version:** Configured with `provider = "sqlite"` (`DATABASE_URL="file:./dev.db"`) via `@prisma/client` `^5.20.0`.
- **Models Present (16):** `User`, `Course`, `CourseVersion`, `Module`, `Chapter`, `Concept`, `Rubric`, `RubricCriterion`, `Question`, `Enrollment`, `LearningSession`, `ChatMessage`, `ConceptMastery`, `MasteryEvidence`, `AssessmentAttempt`, `AssessmentAnswer`, `RubricEvaluation`, `Certificate`.
- **Schema Strengths:** Clean relational hierarchy (`Course -> CourseVersion -> Module -> Chapter -> Concept -> Rubric -> RubricCriterion`), uniqueness constraints on `User.email`, `Course.slug`, `(courseId, versionNumber)`, `(chapterId, slug)`, `(userId, courseVersionId)`, `(enrollmentId, conceptId)`, `Certificate.credentialId`, and `Certificate.enrollmentId`.
- **Schema Gaps Identified:**
  1. `Question` is linked only to `chapterId`, not `conceptId`, which contributed to `submitChapterAssessment` grading every answer against all concepts in the chapter.
  2. `Certificate` stores `signatureHash` (named as a hash rather than a digital signature + algorithm + public key ID or canonical signed payload), making independent signature verification impossible unless the exact signing timestamp/payload is reconstructed.
  3. Missing composite performance indexes on `ChatMessage(sessionId, createdAt)`, `AssessmentAttempt(enrollmentId, assessmentType, status)`, and `MasteryEvidence(conceptMasteryId, evidenceType)`.
  4. No `prisma/migrations/` history directory exists (`db:push` was used instead of repeatable migrations).

### 3.4 Test Audit
- **Existing Tests Inspected:**
  - `backend/src/modules/mastery/bkt.test.ts`: 8 unit tests covering `BayesianKnowledgeTracer.update()` and `CertificationEvaluator.evaluateCredential()`.
  - `backend/src/app.test.ts`: 1 stub test (`expect(app).toBeDefined()`), making zero HTTP requests.
  - `backend/test-client.ts`: Manual script that tests happy-path endpoints but **cheats on step 8** (`await prisma.conceptMastery.updateMany({ where: { enrollmentId }, data: { pMastery: 0.92, state: "MASTERED" } })`) because the learner journey could not legitimately complete all chapters, practicals, and viva.
- **Missing Test Coverage Prior to Remediation:**
  - 0 cross-user IDOR/BOLA negative authorization tests.
  - 0 evaluator negation/adversarial input tests.
  - 0 practical sandbox isolation/timeout/malicious code tests.
  - 0 cryptographic signature tamper-detection tests.
  - 0 diagnostic or remediation integration tests.

### 3.5 Infrastructure Audit
- **Container & Deployment Config:** No `Dockerfile`, `docker-compose.yml`, `.dockerignore`, or `.github/workflows/ci.yml` exist in the root repository.
- **Secret Handling:** `backend/src/config/index.ts` falls back to a hardcoded `jwtSecret` (`"certify_super_secure_jwt_secret_dev_key_2026"`) even if `NODE_ENV === "production"`.
- **Security Headers & Rate Limiting:** `cors()` is called with default wildcard `*` (`app.use(cors())`), `express.json()` has no payload size limit, no security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) are set, and no rate limiting exists on `/auth` or `/sessions/:id/messages`.

---

## 4. Phase 3 Verified Feature-Status Matrix (Pre-Remediation Baseline)

Status categories used strictly as defined in Phase 3:
- `VERIFIED COMPLETE`
- `PARTIALLY IMPLEMENTED`
- `MOCKED / HARDCODED`
- `MISSING`
- `BLOCKED`
- `NOT REQUIRED FOR V1`

| # | Feature Name | Product Requirement | Frontend Implementation | Backend Implementation | Database Persistence | API Contract | Auth & Ownership | Test Coverage | Pre-Remediation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Account Registration & Login** | Learners register and sign in securely with email & password. | `AuthView.tsx` has only a display name box; auto-logs in as `learner@certify.edu` or fake token. | `AuthController.register`, `login`, `getMe` with bcrypt & JWT. | `User` table in SQLite. | `POST /api/v1/auth/{register,login}`, `GET /api/v1/auth/me` | JWT middleware works; no rate limit; 7d expiry. | None in Vitest. | `PARTIALLY IMPLEMENTED` |
| **2** | **Curated Course Catalog & Details** | Browse published platform courses and inspect syllabus/objectives. | `CatalogView.tsx` (1 real + 5 fake courses), `CourseDetailsView.tsx`. | `CoursesController.listCourses`, `getCourseBySlug`. | `Course`, `CourseVersion`, `Module`, `Chapter`, `Concept`. | `GET /api/v1/courses`, `GET /api/v1/courses/:slug` | Public read. | Manual `test-client.ts` only. | `PARTIALLY IMPLEMENTED` |
| **3** | **Course Enrollment & State Init** | Enroll in a course version idempotently and initialize mastery priors. | `CourseDetailsView.tsx` skips `/enroll` and relies on `/session` auto-enrollment. | `CoursesController.enroll` & `SessionsController.getSessionContext`. | `Enrollment`, `ConceptMastery` (`0.15`), `LearningSession`. | `POST /api/v1/courses/:slug/enroll` | `requireAuth` (`req.user.id`). | Manual `test-client.ts` only. | `VERIFIED COMPLETE` (Backend) / `PARTIALLY IMPLEMENTED` (UI) |
| **4** | **Baseline Diagnostic** | Short non-punitive diagnostic calibrates initial mastery priors. | `DiagnosticView.tsx` has 4 hardcoded Raft/CPython probes in local state. | No diagnostic endpoints exist in `assessment.routes.ts`. | `AssessmentAttempt` supports `DIAGNOSTIC`, but unused. | None. | None. | None. | `MOCKED / HARDCODED` |
| **5** | **Interactive AI Tutor & SSE Streaming** | Socratic AI tutor teaches concepts, streams via SSE, and persists turns. | `LearningStudio.tsx` streams SSE tokens (`api.streamMessage`), plus 1 static fake message. | `SessionsController.streamMessage` streams 3 hardcoded string arrays via `setTimeout(80ms)`. | `ChatMessage` persisted with fake model metadata. | `POST /api/v1/sessions/:sessionId/messages` | **Missing ownership check (`IDOR`)**. | None. | `MOCKED / HARDCODED` |
| **6** | **Concept Probes & Formative Evidence** | Tutor probes understanding without directly granting certification credit. | Handled inside `LearningStudio.tsx` chat stream. | `streamMessage` uses 11-word substring check and directly mutates BKT `ConceptMastery`. | `MasteryEvidence` (`DIALOGUE_PROBE`). | Same as SSE endpoint. | **Missing ownership check (`IDOR`)**. | None. | `MOCKED / HARDCODED` |
| **7** | **Chapter Assessments & Rubric Evaluator** | Criterion-level evaluation grounded in chapter rubrics, immune to negation. | `ChapterAssessmentView.tsx` shows hardcoded TypeScript Quorum code and doesn't submit. | `AssessmentController.submitChapterAssessment` uses 15-word substring check and nested loop bug. | `AssessmentAttempt`, `AssessmentAnswer`, `RubricEvaluation`. | `GET/POST /api/v1/assessments/chapters/:chapterId(/submit)` | **Missing ownership check (`IDOR`)**. | None. | `MOCKED / HARDCODED` |
| **8** | **Targeted Remediation** | Diagnose weak concepts (`NEEDS_REMEDIATION`), offer alternative teaching, re-check. | `RemediationStudioView.tsx` is 100% static Distributed Systems UI. | No remediation endpoints or recovery gates exist. | `ConceptMastery.remediationCycles` column exists, never incremented. | None. | None. | None. | `MOCKED / HARDCODED` |
| **9** | **Mastery Calculation & Progression Gates** | BKT updates from valid observations; unlock next chapter when mastery >= threshold. | `LearningStudio.tsx` displays BKT probabilities and chapter unlock button. | `BayesianKnowledgeTracer.update()` + `SessionsController.advanceChapter` (`pMastery >= 0.70`). | `ConceptMastery` (`pMastery`, `state`). | `POST /api/v1/sessions/:sessionId/advance` | **Missing ownership check (`IDOR`)**. | 4 unit tests in `bkt.test.ts`. | `PARTIALLY IMPLEMENTED` |
| **10** | **Practical Code Execution Sandbox** | Execute learner Python submissions in an isolated, resource-limited runner. | `LearningStudio.tsx` & `FinalAssessmentView.tsx` call `api.executeCode`. | Endpoint `/api/v1/execute` does not exist; frontend returns fake `0 errors detected`. | No practical attempt persistence. | `/api/v1/execute` (404s). | None. | None. | `MISSING` (Backend) / `MOCKED / HARDCODED` (UI) |
| **11** | **AI Viva / Oral Defense** | Multi-turn persisted defense probing trade-offs and reasoning. | Unmounted in `App.tsx`; `FinalAssessmentView` skips straight to `result`. | `AssessmentController.conductVivaTurn` returns 2 static LRU cache strings, zero DB writes. | None. | `POST /api/v1/assessments/final/viva` | **Missing ownership check (`IDOR`)**. | None. | `MOCKED / HARDCODED` |
| **12** | **Deterministic Certification Authority** | Compute eligibility & tier from persisted, attributable evidence snapshots. | `CertificationResultView.tsx` displays static hardcoded `87%` result. | `CertificationEvaluator` math is deterministic, but `issueCertificate` passes hardcoded `0.92, 0.88, 0.86, 0.82`. | `Certificate` table in SQLite. | `POST /api/v1/certificates/issue` | Checks `enrollment.userId === req.user.id`. | 4 unit tests on pure formula only. | `MOCKED / HARDCODED` |
| **13** | **Credential Signing & Public Verification** | Unique ID, public verification endpoint, truthful cryptographic verification. | `App.tsx` removed `/verify` route; `CredentialDetailsView.tsx` is static. | `verifyPublicCredential` returns DB row; uses `HMAC-SHA256` with `jwtSecret` and never verifies hash. | `Certificate` (`credentialId`, `signatureHash`, `status`). | `GET /api/v1/certificates/:credentialId/verify` | Public read (no PII leaked). | Manual `test-client.ts` only. | `PARTIALLY IMPLEMENTED` |
| **14** | **Admin Course & Rubric Authoring** | Minimum operational tools to maintain curated courses and revoke credentials. | None. | None. | Schema supports versions/status. | None. | No RBAC middleware. | None. | `MISSING` |
| **15** | **Voice / BYO Courses / Proctoring / Blockchain** | Explicitly deferred / out-of-scope features. | Not present. | Not present. | Not present. | Not present. | N/A | N/A | `NOT REQUIRED FOR V1` |
