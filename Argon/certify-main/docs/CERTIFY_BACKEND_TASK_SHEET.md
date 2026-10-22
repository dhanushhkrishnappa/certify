# CERTIFY — COMPLETE ENGINEERING & BACKEND TASK SHEET

**Document Version:** 2.0 (Post-Audit & Controlled Remediation)  
**Date:** October 17, 2026  
**Scope:** End-to-End Task Breakdown (`P0` – `P3`) with All 16 Required Engineering Fields  

---

## Executive Summary Table

| Task ID | Title | Epic / Phase | Priority | Current Status | Verification Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TASK-001** | Production Secret Validation & Fail-Fast Boot Guard | Epic 1: Security & Auth | `P0` | `COMPLETED` | `backend/src/config/index.ts` + Suite 6 E2E |
| **TASK-002** | Cross-User Resource Ownership (IDOR / BOLA) Enforcement | Epic 1: Security & Auth | `P0` | `COMPLETED` | `auth.ts` (`verifyEnrollmentOwnership`), `app.test.ts` (`403` verified) |
| **TASK-003** | Role-Based Access Control (`requireRole`) & Admin Revocation Guard | Epic 1: Security & Auth | `P0` | `COMPLETED` | `auth.ts`, `certificates.routes.ts`, `app.test.ts` (`403` verified) |
| **TASK-004** | Sliding-Window Rate Limiting & Structured Redacted Logging | Epic 1: Security & Auth | `P1` | `COMPLETED` | `rateLimit.ts`, `logger.ts` (`X-Request-Id`, security headers) |
| **TASK-005** | Decouple Socratic Tutor Chat from BKT Mastery Mutation | Epic 2: Pedagogical Integrity | `P0` | `COMPLETED` | `sessions.controller.ts`, `app.test.ts` Step 7 |
| **TASK-006** | Vendor-Neutral AI Provider with Zod Validation & Anti-Gaming | Epic 2: Pedagogical Integrity | `P0` | `COMPLETED` | `ai.provider.ts`, `bkt.test.ts` Suite 4 |
| **TASK-007** | Baseline Diagnostic Calibration Engine ("Honest Skip" Support) | Epic 3: Assessment & BKT | `P0` | `COMPLETED` | `assessment.controller.ts`, `app.test.ts` Step 6 |
| **TASK-008** | Fix Chapter Assessment Nested-Loop Bug & Atomic Transactions | Epic 3: Assessment & BKT | `P0` | `COMPLETED` | `assessment.controller.ts`, `app.test.ts` Step 9 |
| **TASK-009** | Targeted Concept Remediation Plan & Recovery Check Loop | Epic 3: Assessment & BKT | `P1` | `COMPLETED` | `sessions.controller.ts`, `assessment.controller.ts`, `app.test.ts` Step 9 |
| **TASK-010** | Isolated Python 3 Subprocess Sandbox & Deterministic Unit Test Harness | Epic 4: Practical & Viva | `P0` | `COMPLETED` | `sandbox.service.ts`, `sandbox.routes.ts`, `bkt.test.ts` Suite 5 |
| **TASK-011** | Persisted Multi-Turn (3-Turn) Socratic Viva State Machine | Epic 4: Practical & Viva | `P0` | `COMPLETED` | `assessment.controller.ts`, `app.test.ts` Step 11 |
| **TASK-012** | Eliminate Hardcoded Certificate Scores & Enforce Evidence Gates | Epic 5: Credentials & Crypto | `P0` | `COMPLETED` | `certificates.controller.ts`, `app.test.ts` Steps 8 & 12 |
| **TASK-013** | Genuine Ed25519 (RFC 8032) Signing, Verification & Public Key API | Epic 5: Credentials & Crypto | `P0` | `COMPLETED` | `crypto.service.ts`, `bkt.test.ts` Suite 3, `app.test.ts` Steps 13–14 |
| **TASK-014** | Frontend Auth, Public Verification Route & Python Studio Wiring | Epic 6: Frontend Integration | `P0` | `COMPLETED` | `AuthView.tsx`, `PublicVerifyView.tsx`, `App.tsx`, `api.ts` + 19 TSX compiled |
| **TASK-015** | Containerization (`Dockerfile`, `docker-compose.yml`) & CI Workflow | Epic 7: Infrastructure & Ops | `P1` | `COMPLETED` | `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml` |
| **TASK-016** | Live Networked PostgreSQL 16 Migration & External LLM Smoke Run | Epic 7: Infrastructure & Ops | `P1` | `BLOCKED` (Env) | Blocked in offline VM sandbox; ready for CI/staging execution |

---

## Detailed Task Specifications (All 16 Required Fields)

### TASK-001: Production Secret Validation & Fail-Fast Boot Guard
1. **Task ID:** `TASK-001`
2. **Title:** Production Secret Validation & Fail-Fast Boot Guard
3. **Phase / Epic:** Epic 1 — Security, Authentication & Runtime Configuration
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `backend/src/config/index.ts` defaulted `jwtSecret` to `"certify_super_secure_jwt_secret_dev_key_2026"` without checking `NODE_ENV === "production"`, enabling token forgery if deployed without environment variables.
7. **Evidence from Audit:** `backend/src/config/index.ts:1-10` (fallback string literal used unconditionally).
8. **Files to Create or Modify:** `backend/src/config/index.ts`
9. **Database Changes:** None.
10. **API Changes:** None (startup configuration guard).
11. **Frontend Changes:** None.
12. **Security Requirements:** Throw fatal startup error when `NODE_ENV === "production"` and `JWT_SECRET` is unset or matches known development defaults; configure explicit `ruleVersion`, `promptVersion`, and `Ed25519` key variables.
13. **Test Cases Required:** Verify startup throws under `NODE_ENV=production` with default secret and boots cleanly in development/test.
14. **Dependencies:** None.
15. **Acceptance Criteria:** Application refuses to start in production mode with weak/default `JWT_SECRET`.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs`

---

### TASK-002: Cross-User Resource Ownership (IDOR / BOLA) Enforcement
1. **Task ID:** `TASK-002`
2. **Title:** Cross-User Resource Ownership (IDOR / BOLA) Enforcement
3. **Phase / Epic:** Epic 1 — Security, Authentication & Runtime Configuration
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** Authenticated User B could pass User A's `sessionId` or `enrollmentId` to tutor chat, chapter advancement, assessments, or certificate issuance endpoints and mutate User A's state.
7. **Evidence from Audit:** `backend/src/modules/sessions/sessions.controller.ts:159-185`, `backend/src/modules/assessment/assessment.controller.ts:52-85`, `backend/src/modules/certificates/certificates.controller.ts:15-40`.
8. **Files to Create or Modify:** `backend/src/shared/middleware/auth.ts`, `backend/src/modules/sessions/sessions.controller.ts`, `backend/src/modules/assessment/assessment.controller.ts`, `backend/src/modules/certificates/certificates.controller.ts`.
9. **Database Changes:** None (`Enrollment.userId` already exists).
10. **API Changes:** Return `403 Forbidden` (`{ error: "Forbidden: You do not own this enrollment" }`) whenever `enrollment.userId !== req.user.id`.
11. **Frontend Changes:** Handle `403` responses cleanly in `api.ts`.
12. **Security Requirements:** Every state-reading or state-mutating route operating on `sessionId` or `enrollmentId` must verify ownership before executing business logic.
13. **Test Cases Required:** Register Learner A (`alice@certify.edu`) and Learner B (`mallory@certify.edu`); attempt to post messages, submit diagnostics, and issue certificates for Learner A using Learner B's JWT; assert `403 Forbidden`.
14. **Dependencies:** `TASK-001`.
15. **Acceptance Criteria:** 100% of cross-user IDOR attempts return `403 Forbidden` with zero state mutation.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 6, Step 5).

---

### TASK-003: Role-Based Access Control (`requireRole`) & Admin Revocation Guard
1. **Task ID:** `TASK-003`
2. **Title:** Role-Based Access Control (`requireRole`) & Admin Revocation Guard
3. **Phase / Epic:** Epic 1 — Security, Authentication & Runtime Configuration
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** No RBAC middleware existed to restrict administrative operations such as credential revocation (`POST /api/v1/certificates/:credentialId/revoke`) to `ADMIN` or `INSTRUCTOR` roles.
7. **Evidence from Audit:** `backend/src/shared/middleware/auth.ts:1-45` (only `requireAuth` existed; `req.user.role` was never checked).
8. **Files to Create or Modify:** `backend/src/shared/middleware/auth.ts`, `backend/src/modules/certificates/certificates.routes.ts`, `backend/src/modules/certificates/certificates.controller.ts`.
9. **Database Changes:** None (`User.role` and `Certificate.status` already exist in `schema.prisma`).
10. **API Changes:** Added `POST /api/v1/certificates/:credentialId/revoke` protected by `requireAuth` and `requireRole(["ADMIN", "INSTRUCTOR"])`.
11. **Frontend Changes:** Display `REVOKED` status banner in `PublicVerifyView.tsx`.
12. **Security Requirements:** Reject learners (`STUDENT`) with `403 Forbidden` on administrative endpoints.
13. **Test Cases Required:** Learner B (`STUDENT`) calls `POST /api/v1/certificates/:credentialId/revoke` -> receives `403 Forbidden`.
14. **Dependencies:** `TASK-002`.
15. **Acceptance Criteria:** Administrative endpoints enforce `requireRole(["ADMIN", "INSTRUCTOR"])`.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 6, Step 15).

---

### TASK-004: Sliding-Window Rate Limiting & Structured Redacted Logging
1. **Task ID:** `TASK-004`
2. **Title:** Sliding-Window Rate Limiting & Structured Redacted Logging
3. **Phase / Epic:** Epic 1 — Security, Authentication & Runtime Configuration
4. **Priority:** `P1`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** Auth endpoints, SSE tutor streaming, and code execution had no rate limiting (`429 Too Many Requests`), and logs had no correlation IDs or secret redaction.
7. **Evidence from Audit:** `backend/src/app.ts:1-35` (no rate limiter or request context middleware).
8. **Files to Create or Modify:** `backend/src/shared/middleware/rateLimit.ts`, `backend/src/shared/logger.ts`, `backend/src/app.ts`, `backend/src/modules/auth/auth.routes.ts`, `backend/src/modules/sessions/sessions.routes.ts`, `backend/src/modules/sandbox/sandbox.routes.ts`.
9. **Database Changes:** None.
10. **API Changes:** Emits `X-Request-Id`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, and `Retry-After` on `429`.
11. **Frontend Changes:** None.
12. **Security Requirements:** Redact `password`, `passwordHash`, `token`, `authorization`, `jwtSecret`, and API keys from structured logs; cap `express.json` payload size to `64kb`.
13. **Test Cases Required:** Verify security headers on API responses and rate limiter middleware integration.
14. **Dependencies:** `TASK-001`.
15. **Acceptance Criteria:** All auth, tutor stream, and sandbox routes enforce sliding-window rate limits.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs`

---

### TASK-005: Decouple Socratic Tutor Chat from BKT Mastery Mutation
1. **Task ID:** `TASK-005`
2. **Title:** Decouple Socratic Tutor Chat from BKT Mastery Mutation
3. **Phase / Epic:** Epic 2 — Pedagogical Integrity & AI Service Architecture
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `sessions.controller.ts` ran an 11-keyword substring check (`pointer`, `reference`, `lazy`, etc.) on chat messages (`length > 25`) and directly updated `ConceptMastery` (`pMastery >= 0.75 -> MASTERED`) during casual tutor chat, violating Non-Negotiable Principle B.
7. **Evidence from Audit:** `backend/src/modules/sessions/sessions.controller.ts:209-275`.
8. **Files to Create or Modify:** `backend/src/modules/sessions/sessions.controller.ts`.
9. **Database Changes:** Stopped writing `DIALOGUE_PROBE` mastery mutations inside `streamMessage`.
10. **API Changes:** `POST /api/v1/sessions/:sessionId/messages` streams Socratic tutor chunks (`event: token`, `event: done`) and records truthful `modelUsed` and `promptVersion` metadata without mutating `ConceptMastery`.
11. **Frontend Changes:** `LearningStudio.tsx` transitions to formal Chapter Assessment for mastery verification.
12. **Security Requirements:** Prevent learners from gaming certification mastery by pasting keywords into tutor chat.
13. **Test Cases Required:** Send multiple keyword-rich chat messages to `POST /api/v1/sessions/:sessionId/messages` and verify `POST /api/v1/sessions/:sessionId/advance` still rejects advancement until formal chapter assessment is passed.
14. **Dependencies:** `TASK-006`.
15. **Acceptance Criteria:** Tutor chat never mutates `ConceptMastery` or unlocks chapters.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 6, Steps 7 & 8).

---

### TASK-006: Vendor-Neutral AI Provider with Zod Validation & Anti-Gaming
1. **Task ID:** `TASK-006`
2. **Title:** Vendor-Neutral AI Provider with Zod Validation & Anti-Gaming
3. **Phase / Epic:** Epic 2 — Pedagogical Integrity & AI Service Architecture
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** No AI provider module existed; controllers used naive keyword matching without negation detection or schema validation, and logged fake `"claude-3-5-sonnet-pedagogical-v1"` strings.
7. **Evidence from Audit:** `backend/src/modules/sessions/sessions.controller.ts:276`, `backend/src/modules/assessment/assessment.controller.ts:87-105`.
8. **Files to Create or Modify:** `backend/src/modules/ai/ai.provider.ts`.
9. **Database Changes:** None.
10. **API Changes:** Exposes `AIProvider.streamTutorReply`, `AIProvider.evaluateRubricCriteria`, and `AIProvider.evaluateVivaTurn` validated via `RubricEvaluationOutputSchema` (`zod`).
11. **Frontend Changes:** None.
12. **Security Requirements:** Detect conceptual negations (`hasNegationOrConfusion`, e.g., `"variables are NOT references"`) and keyword stuffing (`isKeywordStuffing`, unique word ratio `< 0.42`); record truthful model metadata.
13. **Test Cases Required:** Unit test valid explanation (`overallPassed: true`), negated misconception (`overallPassed: false`), and keyword-stuffed string (`overallPassed: false`).
14. **Dependencies:** `TASK-001`.
15. **Acceptance Criteria:** Negated and keyword-stuffed answers are rejected deterministically; all evaluator outputs pass Zod schema validation.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 4).

---

### TASK-007: Baseline Diagnostic Calibration Engine ("Honest Skip" Support)
1. **Task ID:** `TASK-007`
2. **Title:** Baseline Diagnostic Calibration Engine ("Honest Skip" Support)
3. **Phase / Epic:** Epic 3 — Assessment, BKT Mastery & Remediation Engine
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `DiagnosticView.tsx` was a static Distributed Systems/Raft mockup with no backend endpoints to fetch or submit Python Fundamentals diagnostic probes or calibrate initial BKT `pMastery`.
7. **Evidence from Audit:** `frontend/src/components/DiagnosticView.tsx:28-110`, `backend/src/modules/assessment/assessment.routes.ts:1-15`.
8. **Files to Create or Modify:** `backend/src/modules/assessment/assessment.controller.ts`, `backend/src/modules/assessment/assessment.routes.ts`, `frontend/src/components/DiagnosticView.tsx`, `frontend/src/services/api.ts`.
9. **Database Changes:** Creates `AssessmentAttempt (DIAGNOSTIC)` and updates `ConceptMastery.pMastery` (`0.05` on Honest Skip, `0.35` on demonstrated prior knowledge, `0.15` on incorrect guess) inside `prisma.$transaction`.
10. **API Changes:** Added `GET /api/v1/assessments/diagnostic/:slug` and `POST /api/v1/assessments/diagnostic/submit`.
11. **Frontend Changes:** Rewired `DiagnosticView.tsx` to load Python Fundamentals diagnostic probes from the backend and submit learner answers or "Honest Skip" (`I haven't learned this yet`).
12. **Security Requirements:** Enforce `verifyEnrollmentOwnership` (`403` on cross-user access); cap diagnostic prior at `0.35` so diagnostic alone can never grant mastery (`0.75`).
13. **Test Cases Required:** Submit Honest Skip and correct answer in `app.test.ts` Step 6 and verify BKT priors.
14. **Dependencies:** `TASK-002`, `TASK-006`.
15. **Acceptance Criteria:** Diagnostic calibrates priors without bypassing learning or assessment gates.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 6, Step 6).

---

### TASK-008: Fix Chapter Assessment Nested-Loop Bug & Atomic Transactions
1. **Task ID:** `TASK-008`
2. **Title:** Fix Chapter Assessment Nested-Loop Bug & Atomic Transactions
3. **Phase / Epic:** Epic 3 — Assessment, BKT Mastery & Remediation Engine
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `submitChapterAssessment` iterated `for (const ans of answers)` and nested `for (const concept of chapter.concepts)` inside it, evaluating every concept against every answer (`N * M` duplicate `RubricEvaluation`, `MasteryEvidence`, and BKT updates) without a database transaction, and also duplicated `answers[primaryAnswerIndex]` when concatenating multi-question answers.
7. **Evidence from Audit:** `backend/src/modules/assessment/assessment.controller.ts:81-170`.
8. **Files to Create or Modify:** `backend/src/modules/assessment/assessment.controller.ts`.
9. **Database Changes:** Wrapped `AssessmentAttempt`, `AssessmentAnswer`, `RubricEvaluation`, `ConceptMastery`, and `MasteryEvidence` writes inside `prisma.$transaction`.
10. **API Changes:** `POST /api/v1/assessments/chapters/:chapterId/submit` evaluates each chapter concept once per attempt and returns accurate `isPassed`, `needsRemediation`, and `needsRemediationConcepts`.
11. **Frontend Changes:** Updated `ChapterAssessmentView.tsx` to render chapter concepts/questions and route failed gates to `RemediationStudioView.tsx`.
12. **Security Requirements:** Enforce `verifyEnrollmentOwnership` (`403 Forbidden` on IDOR).
13. **Test Cases Required:** Submit chapter assessments across multi-concept chapters in `app.test.ts` Step 9 and verify exact BKT transitions.
14. **Dependencies:** `TASK-006`.
15. **Acceptance Criteria:** Each concept in a chapter is evaluated and updated in BKT once per submission inside an atomic transaction.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 6, Step 9).

---

### TASK-009: Targeted Concept Remediation Plan & Recovery Check Loop
1. **Task ID:** `TASK-009`
2. **Title:** Targeted Concept Remediation Plan & Recovery Check Loop
3. **Phase / Epic:** Epic 3 — Assessment, BKT Mastery & Remediation Engine
4. **Priority:** `P1`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `RemediationStudioView.tsx` was a hardcoded UI mockup with no backend endpoint to fetch concepts in `NEEDS_REMEDIATION` state or verify concept recovery.
7. **Evidence from Audit:** `frontend/src/components/RemediationStudioView.tsx:1-95`.
8. **Files to Create or Modify:** `backend/src/modules/sessions/sessions.controller.ts`, `backend/src/modules/sessions/sessions.routes.ts`, `backend/src/modules/assessment/assessment.controller.ts`, `backend/src/modules/assessment/assessment.routes.ts`, `frontend/src/components/RemediationStudioView.tsx`.
9. **Database Changes:** Persists `MasteryEvidence (REMEDIATION_CHECK)` and updates `ConceptMastery` state inside `prisma.$transaction`.
10. **API Changes:** Added `GET /api/v1/sessions/:sessionId/remediation` and `POST /api/v1/assessments/remediation/submit`.
11. **Frontend Changes:** Wired `RemediationStudioView.tsx` to `api.getRemediationPlan` and `api.submitRemediationCheck`.
12. **Security Requirements:** Enforce session/enrollment ownership (`403` on IDOR).
13. **Test Cases Required:** Resolve a `NEEDS_REMEDIATION` concept via `POST /api/v1/assessments/remediation/submit` in `app.test.ts` Step 9.
14. **Dependencies:** `TASK-008`.
15. **Acceptance Criteria:** Concepts flagged `NEEDS_REMEDIATION` block progression until resolved through remediation and re-assessment.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 6, Step 9).

---

### TASK-010: Isolated Python 3 Subprocess Sandbox & Deterministic Unit Test Harness
1. **Task ID:** `TASK-010`
2. **Title:** Isolated Python 3 Subprocess Sandbox & Deterministic Unit Test Harness
3. **Phase / Epic:** Epic 4 — Practical Code Execution & Multi-Turn Viva Defense
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `api.executeCode` called `POST /api/v1/execute` which returned `404 Not Found` on the backend, and the frontend fell back to a fake string (`"[Simulated Output] Execution successful"`). No practical code evaluation existed.
7. **Evidence from Audit:** `frontend/src/services/api.ts:276-291`, `backend/src/app.ts:1-35`.
8. **Files to Create or Modify:** `backend/src/modules/sandbox/sandbox.service.ts`, `backend/src/modules/sandbox/sandbox.routes.ts`, `backend/src/modules/assessment/assessment.controller.ts`, `backend/src/modules/assessment/assessment.routes.ts`, `frontend/src/services/api.ts`, `frontend/src/components/FinalAssessmentView.tsx`.
9. **Database Changes:** Persists `AssessmentAttempt (PRACTICAL)` with real unit test score (`testsPassed / testsRun`).
10. **API Changes:** Added `POST /api/v1/execute` and `POST /api/v1/assessments/practical/submit`.
11. **Frontend Changes:** Removed fake execution fallback in `api.ts`; wired `FinalAssessmentView.tsx` to `api.submitPracticalAssessment`.
12. **Security Requirements:** Never execute learner code in the main Node process; enforce static import/syscall policy (`socket`, `subprocess`, `shutil`, `urllib`, `http`, `ctypes`, `os.system`, `open`, `eval`, `exec`), POSIX `resource.setrlimit` (`RLIMIT_CPU=2s`, `RLIMIT_FSIZE=1MB`, `RLIMIT_NPROC=0`), stripped `env`, isolated temporary directory cleanup, `16KB` output cap, and `SIGKILL` timeout.
13. **Test Cases Required:** Test valid Python execution (`42`), blocked `import socket` (`SecurityPolicyViolation`), infinite loop `while True: pass` (`timedOut: true`), and 4-test practical evaluation (`score: 1.0`).
14. **Dependencies:** `TASK-002`.
15. **Acceptance Criteria:** Learner code runs in an isolated Python 3 child process and produces real persisted unit test scores.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 5 & Suite 6 Step 10).

---

### TASK-011: Persisted Multi-Turn (3-Turn) Socratic Viva State Machine
1. **Task ID:** `TASK-011`
2. **Title:** Persisted Multi-Turn (3-Turn) Socratic Viva State Machine
3. **Phase / Epic:** Epic 4 — Practical Code Execution & Multi-Turn Viva Defense
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `conductVivaTurn` in `assessment.controller.ts:207-245` did not import or call `prisma` at all—it checked `studentAnswer.length > 25` and returned a stateless JSON object while `certificates.controller.ts` hardcoded `vivaScore = 0.88`.
7. **Evidence from Audit:** `backend/src/modules/assessment/assessment.controller.ts:207-245`.
8. **Files to Create or Modify:** `backend/src/modules/assessment/assessment.controller.ts`, `backend/src/modules/ai/ai.provider.ts`, `frontend/src/components/FinalAssessmentView.tsx`.
9. **Database Changes:** Creates and updates `AssessmentAttempt (VIVA)` (`IN_PROGRESS` -> `EVALUATED` after 3 turns) and `AssessmentAnswer` rows for each turn.
10. **API Changes:** `POST /api/v1/assessments/final/viva` persists each turn, returns `turnsRecorded`, `isDefenseSatisfied` (`turnNumber >= 3 && allAnswers.length >= 3`), `vivaScore`, and `followUpProbe`.
11. **Frontend Changes:** Wired `FinalAssessmentView.tsx` to conduct 3 persisted Viva turns before enabling certificate issuance.
12. **Security Requirements:** Enforce `verifyEnrollmentOwnership` (`403` on IDOR) and negation/anti-gaming checks on every Viva turn.
13. **Test Cases Required:** Execute 3 sequential Viva turns in `app.test.ts` Step 11 and verify `isDefenseSatisfied === true` only on Turn 3.
14. **Dependencies:** `TASK-006`.
15. **Acceptance Criteria:** Viva defense requires 3 persisted turns in the database and computes `vivaScore` from real turn evaluations.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 6, Step 11).

---

### TASK-012: Eliminate Hardcoded Certificate Scores & Enforce Evidence Gates
1. **Task ID:** `TASK-012`
2. **Title:** Eliminate Hardcoded Certificate Scores & Enforce Evidence Gates
3. **Phase / Epic:** Epic 5 — Deterministic Certification & Ed25519 Cryptography
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `certificates.controller.ts:43-50` hardcoded `practicalScore = 0.92`, `vivaScore = 0.88`, `consistency = 0.86`, and `interactionDepth = 0.82`, allowing certificates to be issued with fabricated scores.
7. **Evidence from Audit:** `backend/src/modules/certificates/certificates.controller.ts:43-50`.
8. **Files to Create or Modify:** `backend/src/modules/certificates/certificates.controller.ts`.
9. **Database Changes:** Computes all 5 inputs strictly from persisted `ConceptMastery`, `AssessmentAttempt (CHAPTER, PRACTICAL, VIVA)`, `ChatMessage`, and `MasteryEvidence` rows, and writes `Certificate` + `Enrollment (COMPLETED)` atomically inside `prisma.$transaction`.
10. **API Changes:** `POST /api/v1/certificates/issue` returns `400 Bad Request` with explicit `reasons` and `evidenceBreakdown` if any concept is `< 0.70` or in `NEEDS_REMEDIATION`, or if chapter, practical (`>= 0.70`), or 3-turn viva (`>= 0.70`) evidence is missing.
11. **Frontend Changes:** Updated `CertificationResultView.tsx` to display real evidence scores or missing gate reasons.
12. **Security Requirements:** Enforce `enrollment.userId === req.user.id` (`403` on IDOR); zero hardcoded score constants.
13. **Test Cases Required:** Verify premature issuance fails (`400`) in `app.test.ts` Step 8 and succeeds (`201`) in Step 12 after all gates are met.
14. **Dependencies:** `TASK-008`, `TASK-010`, `TASK-011`.
15. **Acceptance Criteria:** Zero hardcoded certification scores remain; all 5 score components are derived from persisted DB evidence.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 6, Steps 8 & 12).

---

### TASK-013: Genuine Ed25519 (RFC 8032) Signing, Verification & Public Key API
1. **Task ID:** `TASK-013`
2. **Title:** Genuine Ed25519 (RFC 8032) Signing, Verification & Public Key API
3. **Phase / Epic:** Epic 5 — Deterministic Certification & Ed25519 Cryptography
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `certificates.controller.ts:95-102` used `crypto.createHmac("sha256", config.jwtSecret)` while claiming `Ed25519` in the UI, and `verifyPublicCredential` never verified `signatureHash` at all.
7. **Evidence from Audit:** `backend/src/modules/certificates/certificates.controller.ts:95-160`.
8. **Files to Create or Modify:** `backend/src/modules/certificates/crypto.service.ts`, `backend/src/modules/certificates/certificates.controller.ts`, `backend/src/modules/certificates/certificates.routes.ts`.
9. **Database Changes:** Stores real 64-byte hex-encoded `Ed25519` signature in `Certificate.signatureHash` and key fingerprint in `evidenceSummary`.
10. **API Changes:** Added `GET /api/v1/certificates/public-key`, `GET /api/v1/certificates/mine`, and updated `GET /api/v1/certificates/:credentialId/verify` to recompute the canonical payload and verify the `Ed25519` signature (`signatureVerified: boolean`).
11. **Frontend Changes:** Updated `PublicVerifyView.tsx`, `CredentialsListView.tsx`, and `CredentialDetailsView.tsx` to display real `Ed25519` verification status.
12. **Security Requirements:** Use Node native `crypto.sign(null, canonicalBuffer, privateKey)` and `crypto.verify(null, canonicalBuffer, publicKey, sigBuffer)` (`Ed25519`); detect any payload tampering (`compositeScore`, `tier`, `recipientName`).
13. **Test Cases Required:** Suite 3 (`bkt.test.ts`) verifies signing and tamper detection (`+0.01` score modification -> `false`); Suite 6 Steps 13–14 verify public verification and public key endpoint.
14. **Dependencies:** `TASK-012`.
15. **Acceptance Criteria:** Every issued certificate is signed and verified with genuine `Ed25519` asymmetric cryptography.
16. **Verification Command or Procedure:** `node backend/scripts/run-offline-tests.cjs` (Suite 3 & Suite 6 Steps 13–14).

---

### TASK-014: Frontend Auth, Public Verification Route & Python Studio Wiring
1. **Task ID:** `TASK-014`
2. **Title:** Frontend Auth, Public Verification Route & Python Studio Wiring
3. **Phase / Epic:** Epic 6 — Frontend Integration & Honesty Remediation
4. **Priority:** `P0`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** `AuthView.tsx` bypassed email/password authentication with a 1-click display-name form and `demo-token` fallback; `App.tsx` removed `"verify"` from `CertifyView` breaking `/verify/:credentialId`; and assessment/credential views used hardcoded Distributed Systems/Sophia Chen mock data.
7. **Evidence from Audit:** `frontend/src/components/AuthView.tsx:22-72`, `frontend/src/App.tsx:20-55`, `frontend/src/components/DiagnosticView.tsx`, `frontend/src/components/ChapterAssessmentView.tsx`, `frontend/src/components/FinalAssessmentView.tsx`, `frontend/src/components/CredentialsListView.tsx`.
8. **Files to Create or Modify:** `frontend/src/App.tsx`, `frontend/src/services/api.ts`, `frontend/src/components/AuthView.tsx`, `frontend/src/components/PublicVerifyView.tsx`, `frontend/src/components/DiagnosticView.tsx`, `frontend/src/components/ChapterAssessmentView.tsx`, `frontend/src/components/RemediationStudioView.tsx`, `frontend/src/components/FinalAssessmentView.tsx`, `frontend/src/components/CertificationResultView.tsx`, `frontend/src/components/CredentialsListView.tsx`, `frontend/src/components/CredentialDetailsView.tsx`.
9. **Database Changes:** None.
10. **API Changes:** Wired `api.ts` methods to all backend endpoints without fake fallback tokens or fake credentials.
11. **Frontend Changes:** Restored real Sign In / Create Account tabs in `AuthView.tsx`, mounted `/verify/:credentialId` in `App.tsx`, created honest `PublicVerifyView.tsx`, and connected all 7 learner journey views to the backend API.
12. **Security Requirements:** Never fabricate auth tokens or verification results on API errors.
13. **Test Cases Required:** Compile all 19 frontend `.ts`/`.tsx` files via `@babel/preset-typescript` and `@babel/preset-react`.
14. **Dependencies:** `TASK-007` through `TASK-013`.
15. **Acceptance Criteria:** All 19 frontend TypeScript/TSX modules compile with 0 errors and use real backend API calls.
16. **Verification Command or Procedure:** Frontend Babel TypeScript/React verification script (`19/19 modules compiled with 0 errors`).

---

### TASK-015: Containerization (`Dockerfile`, `docker-compose.yml`) & CI Workflow
1. **Task ID:** `TASK-015`
2. **Title:** Containerization (`Dockerfile`, `docker-compose.yml`) & CI Workflow
3. **Phase / Epic:** Epic 7 — Infrastructure, Deployment & Operational Readiness
4. **Priority:** `P1`
5. **Current Status:** `COMPLETED`
6. **Problem Statement:** The repository contained zero containerization files (`Dockerfile`, `docker-compose.yml`) and zero CI/CD pipelines (`.github/workflows/ci.yml`).
7. **Evidence from Audit:** Root directory inventory in Phase 0/Phase 2.5.
8. **Files to Create or Modify:** `Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`.
9. **Database Changes:** Configures `postgres:16-alpine` and `redis:7-alpine` health-checked containers in `docker-compose.yml`.
10. **API Changes:** None.
11. **Frontend Changes:** Added `frontend-verify` build job in `.github/workflows/ci.yml`.
12. **Security Requirements:** Run container runtime as non-root `USER node`; install `python3` in slim runtime image for isolated sandbox execution.
13. **Test Cases Required:** Inspect generated `Dockerfile`, `docker-compose.yml`, and `.github/workflows/ci.yml`.
14. **Dependencies:** `TASK-001` through `TASK-014`.
15. **Acceptance Criteria:** Reproducible multi-stage container build and GitHub Actions CI workflow exist in repository root.
16. **Verification Command or Procedure:** Inspect `/Dockerfile`, `/docker-compose.yml`, and `/.github/workflows/ci.yml`.

---

### TASK-016: Live Networked PostgreSQL 16 Migration & External LLM Smoke Run
1. **Task ID:** `TASK-016`
2. **Title:** Live Networked PostgreSQL 16 Migration & External LLM Smoke Run
3. **Phase / Epic:** Epic 7 — Infrastructure, Deployment & Operational Readiness
4. **Priority:** `P1`
5. **Current Status:** `BLOCKED` (Environment Constraint in Offline Audit VM)
6. **Problem Statement:** The audit VM sandbox has outbound internet access disabled (`npm install` blocked, `node_modules/` omitted from Drive upload by `.gitignore`, no external Anthropic/OpenAI API connectivity, and no running PostgreSQL 16 daemon).
7. **Evidence from Audit:** Phase 0/Phase 2.5 environment inspection.
8. **Files to Create or Modify:** `backend/prisma/schema.prisma` (switch `provider = "postgresql"` when deploying to staging/CI with `postgres:16-alpine`).
9. **Database Changes:** Run `npx prisma migrate deploy` and `npx prisma db seed` against PostgreSQL 16.
10. **API Changes:** Set `AI_PROVIDER=anthropic` and `ANTHROPIC_API_KEY` in staging/production environment.
11. **Frontend Changes:** Run `npm ci && npm run build` in `frontend/` on networked CI runner.
12. **Security Requirements:** Store `DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`, and `ED25519_PRIVATE_KEY_PEM` in secret manager.
13. **Test Cases Required:** Execute `.github/workflows/ci.yml` on GitHub Actions or networked staging host.
14. **Dependencies:** `TASK-015`.
15. **Acceptance Criteria:** `npm ci`, `npx prisma migrate deploy`, `npm test`, and live LLM SSE/rubric smoke tests pass on a networked staging host.
16. **Verification Command or Procedure:** `docker compose up --build -d && cd backend && npx prisma db push && npm test`
