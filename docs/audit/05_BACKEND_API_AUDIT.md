# CERTIFY — Backend API & Security Audit
**Document ID:** `docs/audit/05_BACKEND_API_AUDIT.md`  
**Audit Date:** 2026-10-03  
**Auditor:** Antigravity Agentic Verification Engine  
**Classification:** Complete API Layer & Authorization Vulnerability Audit  

---

## 1. Executive Summary

This audit performs an exhaustive review of every Express endpoint in `backend/src/app.ts`, examining authentication, role-based authorization, horizontal privilege escalation (IDOR/BOLA), database transaction safety, input validation, and cryptographic claims.

**Key Findings:**
1. **Critical IDOR / BOLA Vulnerabilities (P0):** In multiple authenticated endpoints (`sessions/:sessionId/messages`, `sessions/:sessionId/advance`, `assessments/chapters/:chapterId/submit`, and `assessments/final/viva`), the backend does NOT verify that the authenticated user (`req.user.id`) owns the requested session or enrollment. Any authenticated user can modify other students' learning sessions, advance their chapters, submit their assessments, and alter their BKT mastery states.
2. **Missing Controller Layer & Missing Services (P1):** Business logic, SQL mutations, BKT equations, and SSE chunking are packed directly into controller route handlers. There is no service layer (`courses.service.ts`, `sessions.service.ts`, `certificates.service.ts` do not exist).
3. **No Code Sandbox Endpoint (P1):** The frontend calls `/api/v1/execute` in `api.ts:218`, but this endpoint is completely absent from Express routes, falling back to a static client-side string `0 errors detected`.
4. **Missing Administrative APIs (P2):** Zero endpoints exist for course authoring, question management, learner progression monitoring, or credential revocation.

---

## 2. Complete API Endpoint Inventory & Status Matrix

| Method | Endpoint | Auth Required | Role Required | Controller File & Method | DB Mutations | Status | Issues & Vulnerabilities |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/health` | None | Public | Inline handler (`app.ts:15`) | None | **COMPLETE** | None. Returns service name, version, and ISO timestamp. |
| `POST` | `/api/v1/auth/register` | None | Public | `AuthController.register` (`auth.controller.ts:10`) | `prisma.user.create` | **COMPLETE** | Weak password policy: accepts any string without complexity requirements. No email format validation (regex). |
| `POST` | `/api/v1/auth/login` | None | Public | `AuthController.login` (`auth.controller.ts:38`) | None | **COMPLETE** | No rate limiting against brute force. Returns 7-day JWT without refresh token rotation. |
| `GET` | `/api/v1/auth/me` | `requireAuth` | Any | `AuthController.getMe` (`auth.controller.ts:65`) | None | **COMPLETE** | None. Returns current authenticated user record excluding `passwordHash`. |
| `GET` | `/api/v1/courses` | None | Public | `CoursesController.listCourses` (`courses.controller.ts:8`) | None | **COMPLETE** | Returns all courses marked `PUBLISHED`. No pagination. |
| `GET` | `/api/v1/courses/:slug` | None | Public | `CoursesController.getCourseBySlug` (`courses.controller.ts:31`) | None | **COMPLETE** | Returns full course hierarchy (modules, chapters, concepts, rubrics). No caching. |
| `POST` | `/api/v1/courses/:slug/enroll` | `requireAuth` | Any | `CoursesController.enroll` (`courses.controller.ts:81`) | `prisma.enrollment.create`, `prisma.conceptMastery.createMany`, `prisma.learningSession.create` | **COMPLETE** | Good idempotency: returns existing enrollment if already active. Initializes BKT records at `pMastery = 0.15`. |
| `GET` | `/api/v1/courses/:slug/session` | `requireAuth` | Any | `SessionsController.getSessionContext` (`sessions.controller.ts:16`) | None | **COMPLETE** | Correctly filters `enrollment.userId === req.user.id`. |
| `POST` | `/api/v1/sessions/:sessionId/messages` | `requireAuth` | Any | `SessionsController.streamMessage` (`sessions.controller.ts:182`) | `prisma.chatMessage.create`, `prisma.conceptMastery.update`, `prisma.masteryEvidence.create` | **INSECURE (P0)** | **IDOR Vulnerability:** Does NOT verify `session.enrollment.userId === req.user.id`. Any user can chat into another user's session and trigger BKT updates. Also uses canned responses instead of real LLM. |
| `POST` | `/api/v1/sessions/:sessionId/advance` | `requireAuth` | Any | `SessionsController.advanceChapter` (`sessions.controller.ts:353`) | `prisma.learningSession.update` | **INSECURE (P0)** | **IDOR Vulnerability:** Does NOT verify session ownership. Any user can advance another user's chapter. |
| `GET` | `/api/v1/assessments/chapters/:chapterId` | `requireAuth` | Any | `AssessmentController.getChapterQuestions` (`assessment.controller.ts:7`) | None | **COMPLETE** | Filters questions by `chapterId`. Does not expose correct answers. |
| `POST` | `/api/v1/assessments/chapters/:chapterId/submit` | `requireAuth` | Any | `AssessmentController.submitChapterAssessment` (`assessment.controller.ts:27`) | `prisma.assessmentAttempt.create`, `prisma.assessmentAnswer.create`, `prisma.rubricEvaluation.create`, `prisma.conceptMastery.update`, `prisma.masteryEvidence.create` | **INSECURE (P0)** | **BOLA / IDOR Vulnerability:** Takes `enrollmentId` directly from `req.body` without checking if `enrollment.userId === req.user.id`. Any authenticated user can submit answers on behalf of another student. |
| `POST` | `/api/v1/assessments/final/viva` | `requireAuth` | Any | `AssessmentController.conductVivaTurn` (`assessment.controller.ts:206`) | None | **BROKEN / INSECURE (P0)** | Takes `enrollmentId` from body without ownership verification. Does NOT persist attempts or answers. Static LRU cache questions. |
| `POST` | `/api/v1/certificates/issue` | `requireAuth` | Any | `CertificatesController.issueCertificate` (`certificates.controller.ts:13`) | `prisma.certificate.create`, `prisma.enrollment.update` | **HARDCODED (P0)** | Properly checks `enrollment.userId === req.user.id`. HOWEVER, 4 out of 5 evaluation components (`practicalScore`, `vivaScore`, `consistency`, `interactionDepth`) are hardcoded constants (0.92, 0.88, 0.86, 0.82). Issues certificates based on fabricated data. |
| `GET` | `/api/v1/certificates/:credentialId/verify` | None | Public | `CertificatesController.verifyPublicCredential` (`certificates.controller.ts:132`) | None | **INSECURE (P1)** | Claims cryptographic verification, but never validates `signatureHash`. Only checks `certificate.status === "VALID"`. |

---

## 3. Critical Security & Vulnerability Analysis

### 3.1. Vulnerability SEC-01: Session Hijacking via IDOR in `streamMessage`
- **Location:** `backend/src/modules/sessions/sessions.controller.ts:182-200`
- **Severity:** **P0 (Critical)**
- **Flaw:**
  ```typescript
  // sessions.controller.ts:184-188
  const { sessionId } = req.params;
  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: { enrollment: true, chapter: { include: { concepts: true } } },
  });
  // MISSING: if (session.enrollment.userId !== req.user.id) return 403 Forbidden!
  ```
- **Exploit Scenario:** Attacker creates an account, gets a valid JWT, and iterates over UUIDs or reads another student's `sessionId`. Attacker sends keyword-stuffed payloads to `POST /api/v1/sessions/:sessionId/messages`, corrupting the victim's learning history and triggering illegitimate BKT updates on their enrollment.

### 3.2. Vulnerability SEC-02: BOLA in Assessment Submission
- **Location:** `backend/src/modules/assessment/assessment.controller.ts:27-45`
- **Severity:** **P0 (Critical)**
- **Flaw:**
  ```typescript
  const { chapterId } = req.params;
  const { enrollmentId, answers } = req.body;
  // Does not verify that prisma.enrollment.findUnique({ where: { id: enrollmentId, userId: req.user.id } }) exists!
  ```
- **Exploit Scenario:** Attacker submits assessment answers for any target student's `enrollmentId`, forcing their BKT state to `NEEDS_REMEDIATION` (denial of service) or artificially boosting their scores with keywords.

### 3.3. Vulnerability SEC-03: Fake Credential Injection on 404 in Frontend
- **Location:** `frontend/src/components/PublicVerifyView.tsx:28-54`
- **Severity:** **P0 (Critical)**
- **Flaw:**
  ```typescript
  api.verifyPublicCredential(credentialId.trim())
    .catch(() => {
      setVerification({
        id: credentialId.trim(),
        credentialId: credentialId.trim(),
        courseTitle: "Distributed Systems & Consensus Architecture",
        learnerName: "Sophia Chen",
        verified: true, // FAKE POSITIVE!
        ...
      });
    });
  ```
- **Exploit Scenario:** Any employer or verifier checking a non-existent or revoked credential (`/verify/INVALID-FAKE-ID`) will receive a screen claiming the credential is 100% genuine and verified for "Sophia Chen". This completely destroys the integrity of the platform.

### 3.4. Vulnerability SEC-04: Symmetric HMAC masquerading as Asymmetric Ed25519
- **Location:** `backend/src/modules/certificates/certificates.controller.ts:91-96`
- **Severity:** **P1 (High)**
- **Flaw:**
  Architecture documentation and skill guidelines promise an Ed25519 digital signature verifiable with a public key. The code actually uses:
  ```typescript
  const signatureHash = crypto
    .createHmac("sha256", config.jwtSecret)
    .update(signaturePayload)
    .digest("hex");
  ```
  HMAC requires sharing the private `jwtSecret` to verify signatures externally. Furthermore, the verification endpoint `verifyPublicCredential` never calculates or validates this hash anyway.

---

## 4. Authentication & Authorization Matrix

| User Role | Endpoint Tested | Expected Outcome | Actual Outcome | Security Pass? |
|---|---|---|---|---|
| **Anonymous** | `GET /api/v1/courses` | 200 OK | 200 OK | **PASS** |
| **Anonymous** | `GET /api/v1/auth/me` | 401 Unauthorized | 401 Unauthorized | **PASS** |
| **Anonymous** | `POST /api/v1/courses/:slug/enroll` | 401 Unauthorized | 401 Unauthorized | **PASS** |
| **Anonymous** | `POST /api/v1/sessions/:id/messages` | 401 Unauthorized | 401 Unauthorized | **PASS** |
| **Anonymous** | `GET /api/v1/certificates/:id/verify` | 200 OK | 200 OK | **PASS** |
| **Student A** | `POST /api/v1/sessions/[Student B Session]/messages` | 403 Forbidden | **200 OK (Allowed!)** | **FAIL (IDOR)** |
| **Student A** | `POST /api/v1/sessions/[Student B Session]/advance` | 403 Forbidden | **200 OK (Allowed!)** | **FAIL (IDOR)** |
| **Student A** | `POST /api/v1/assessments/chapters/:id/submit` (with Student B `enrollmentId`) | 403 Forbidden | **200 OK (Allowed!)** | **FAIL (IDOR)** |
| **Student A** | `POST /api/v1/certificates/issue` (with Student B `enrollmentId`) | 404/403 Forbidden | 404 Unauthorized | **PASS** |
| **Student** | Admin endpoints (Course creation, user ban) | 403 Forbidden | Endpoints do not exist | **N/A** |

---

## 5. Input Validation, Database Transactions & Error Handling

1. **Input Validation:**
   - No schema validation library (`zod`, `joi`, or `yup`) is installed in the backend.
   - Controllers manually inspect `if (!email || !password)`.
   - String lengths, email formats, and unexpected fields are unvalidated.
2. **Database Transactions:**
   - Multi-table writes (e.g. `submitChapterAssessment`, which writes `AssessmentAttempt`, `AssessmentAnswer`, `RubricEvaluation`, `ConceptMastery`, and `MasteryEvidence`) are executed as individual sequential queries without `prisma.$transaction`.
   - If an error occurs midway, partial state is left orphaned in SQLite.
3. **HTTP Status Code Discipline:**
   - Appropriate status codes are generally used (200, 201, 400, 401, 404, 500), but `500 Internal Server Error` is often returned where `400 Bad Request` or `422 Unprocessable Entity` would be appropriate.
4. **Rate Limiting:**
   - Zero rate limiting middleware (`express-rate-limit`) installed.
   - Authentication and message endpoints are vulnerable to DoS and brute-force credential stuffing.

---

## 6. Required API Remediation Tasks

1. **[P0] Fix IDOR in Sessions Controller:** Enforce `if (session.enrollment.userId !== req.user.id) return res.status(403).json({ error: "Unauthorized access to session" })` in both `streamMessage` and `advanceChapter`.
2. **[P0] Fix BOLA in Assessment Controller:** Look up `enrollment` by ID and verify `enrollment.userId === req.user.id` before allowing attempts, answer submissions, or viva turns.
3. **[P0] Remove Fake Credential Catch Block:** Remove fake "Sophia Chen" fallback in `PublicVerifyView.tsx:28-54`. Display an authentic error state when a credential is not found.
4. **[P0] Implement Real Code Execution Sandbox Endpoint:** Create `POST /api/v1/execute` running isolated Python code via Docker / WebAssembly / microVM, with timeout and memory constraints.
5. **[P1] Implement Ed25519 Credential Signatures:** Replace symmetric HMAC with genuine Ed25519 keypair signing. Store public keys and verify signatures during lookup.
6. **[P1] Wrap Multi-Table Mutations in `prisma.$transaction`:** Ensure atomicity across assessment evaluations and certificate issuance.
7. **[P1] Install `zod` and Request Validation Middleware:** Validate request bodies and query parameters with strict Zod schemas.
8. **[P2] Install `express-rate-limit`:** Protect `/api/v1/auth/login` and `/api/v1/sessions/:id/messages`.
