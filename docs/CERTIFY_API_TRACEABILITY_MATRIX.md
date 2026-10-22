# CERTIFY — API Traceability & Contract Matrix (Locked Target Stack)

**Document Version:** `2.0-LOCKED-TARGET`  
**Status:** `CANONICAL API SPECIFICATION`  
**Date:** October 22, 2026  
**Target Runtime:** Cloudflare Workers (Edge Routing) + Neon PostgreSQL + Better Auth  

---

## 1. API Architecture & Standards

All endpoints adhere to RESTful principles and Web Standards supported natively by Cloudflare Workers:
1. **Base URL:** `/api/v1`
2. **Authentication:** Better Auth Session Token (passed via secure `HttpOnly` cookie or `Authorization: Bearer <token>` header).
3. **HTTP Verb Safety:** All `GET` endpoints are strictly read-only and idempotent. State-creating actions require explicit `POST` or `PUT` methods.
4. **Rate Limiting:** Managed at edge via Cloudflare WAF or Worker KV token-bucket middleware.
5. **Idempotency:** State-changing assessment and credential mutations require an `Idempotency-Key: <UUID>` header.
6. **Payload Limit:** Maximum JSON body size of `64 KB`.

---

## 2. Master API Traceability Matrix

| Method | Path | Auth / Role | Rate Limit | Idempotent | Target Stack Handler & Data Layer |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | None | Yes | Worker healthcheck; returns service status, version, and AI mode. |
| `POST`| `/auth/sign-up/email` | Public | 15 / 15 min | Yes | **Better Auth**: Creates `User` and `Account`; dispatches **Resend** verification email. |
| `POST`| `/auth/sign-in/email` | Public | 15 / 15 min | No | **Better Auth**: Verifies password against `Account.password`; issues session cookie. |
| `POST`| `/auth/sign-out` | Authenticated | None | Yes | **Better Auth**: Revokes active `Session` in **Neon PostgreSQL**. |
| `POST`| `/auth/forgot-password`| Public | 5 / 15 min | Yes | **Better Auth**: Dispatches **Resend** password reset email with 1h signed link. |
| `POST`| `/auth/reset-password` | Public | 5 / 15 min | Yes | **Better Auth**: Updates password in `Account`; invalidates previous sessions. |
| `GET` | `/auth/me` | Authenticated | None | Yes | Better Auth session check; queries user profile and active enrollments in **Neon**. |
| `GET` | `/courses` | Public | None | Yes | Queries published courses and module counts from **Neon**. |
| `GET` | `/courses/:slug` | Public | None | Yes | Queries full curriculum hierarchy, chapters, concepts, and tier requirements. |
| `POST`| `/courses/:slug/enroll` | Authenticated | 10 / 1 min | Yes | **Refactored**: Explicit enrollment creation. Initializes BKT `ConceptMastery` rows at $p=0.15$. |
| `POST`| `/courses/:slug/sessions` | Authenticated | 10 / 1 min | Yes | **Refactored**: Explicit session creation. Initializes `LearningSession` on Chapter 1. |
| `GET` | `/courses/:slug/session` | Authenticated | None | Yes | **Refactored**: Read-only context query. Returns current session, messages, and curriculum state. |
| `POST`| `/sessions/:id/messages`| Authenticated (Owner)| 40 / 1 min | No | **Real AI Streaming**: SSE stream from **Anthropic/OpenAI**; aborts via `AbortController`. Does NOT mutate BKT. |
| `POST`| `/sessions/:id/advance` | Authenticated (Owner)| 10 / 1 min | Yes | Evaluates chapter concepts. Enforces $P(L) \ge 0.70$ and zero `NEEDS_REMEDIATION` before advancing. |
| `GET` | `/sessions/:id/remediation`| Authenticated (Owner)| None | Yes | Queries weak chapter concepts in **Neon**; returns targeted recovery prompt and criteria. |
| `GET` | `/assessments/diagnostic/:slug`| Authenticated | None | Yes | Returns calibrated diagnostic questions covering course concept domains. |
| `POST`| `/assessments/diagnostic/submit`| Authenticated (Owner)| 10 / 1 min | Yes | Evaluates diagnostic. Calibrates BKT priors ($0.15$ skip, $0.40$ correct). Creates `DIAGNOSTIC` attempt. |
| `GET` | `/assessments/chapters/:id`| Authenticated | None | Yes | Fetches formal chapter rubric assessment questions. |
| `POST`| `/assessments/chapters/:id/submit`| Authenticated (Owner)| 10 / 1 min | Yes (`Idempotency-Key`)| 1-to-1 concept rubric grading. Atomic `prisma.$transaction` updates BKT once per concept. |
| `POST`| `/assessments/remediation/submit`| Authenticated (Owner)| 10 / 1 min | Yes (`Idempotency-Key`)| Evaluates single-concept recovery. **Single-observation** BKT update removes `NEEDS_REMEDIATION`. |
| `POST`| `/assessments/practical/submit`| Authenticated (Owner)| 10 / 1 min | Yes (`Idempotency-Key`)| Dispatches code to **Cloudflare Sandbox**. Executes unit tests in isolated container; records score. |
| `POST`| `/assessments/final/viva`| Authenticated (Owner)| 20 / 1 min | No | Evaluates multi-turn viva response. Persists answers across 3 turns. Marks attempt `EVALUATED` on turn 3. |
| `GET` | `/certificates/public-key`| Public | None | Yes | Exports active Ed25519 SPKI public key and Key ID (`kid`). |
| `GET` | `/certificates/mine` | Authenticated | None | Yes | Returns all certificates owned by the authenticated learner. |
| `POST`| `/certificates/issue` | Authenticated (Owner)| 5 / 1 min | Yes (`Idempotency-Key`)| Aggregates persisted DB evidence; enforces 4 hard gates; signs canonical payload via **Web Crypto Ed25519**; stores SVG in **R2**. |
| `GET` | `/certificates/:id/verify`| Public | None | Yes | Rebuilds canonical payload; verifies Ed25519 signature. **Zero-PII**: blinds recipient name unless valid token provided. |
| `POST`| `/certificates/:id/revoke`| `ADMIN` or Scoped `INSTRUCTOR` | 5 / 1 min | Yes | **Scoped Revocation**: Verifies instructor is assigned to course; marks status `REVOKED` in Neon. |
| `GET` | `/certificates/:id/download`| Authenticated (Owner)| 20 / 1 min | Yes | Streams signed visual certificate SVG/PDF artifact from **Cloudflare R2**. |

---

## 3. Detailed Request / Response Contracts for Critical Endpoints

### 3.1 Course Enrollment (`POST /api/v1/courses/:slug/enroll`)
- **Headers:** `Authorization: Bearer <session_token>` or Cookie
- **Request Body:** None
- **Response (`201 Created`):**
  ```json
  {
    "enrollmentId": "enr-7890-uuid",
    "courseSlug": "python-fundamentals",
    "status": "ACTIVE",
    "currentTier": "EASY",
    "conceptsInitialized": 10,
    "enrolledAt": "2026-10-22T22:00:00.000Z"
  }
  ```
- **Error Codes:** `401 Unauthorized`, `404 Course Not Found`, `409 Already Enrolled`.

### 3.2 Real Socratic Tutor Streaming (`POST /api/v1/sessions/:id/messages`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "content": "Why does mutating a list in a function change it outside the function in Python?"
  }
  ```
- **Response:** `text/event-stream`
  ```
  event: token
  data: {"chunk": "In Python, arguments are passed"}

  event: token
  data: {"chunk": " by object reference on the heap..."}

  event: done
  data: {"messageId": "msg-123", "model": "claude-3-5-sonnet-20241022"}
  ```
- **Pedagogical Invariant:** The SSE stream does **not** mutate `ConceptMastery`.

### 3.3 Practical Sandbox Submission (`POST /api/v1/assessments/practical/submit`)
- **Headers:** `Idempotency-Key: <UUID>`
- **Request Body:**
  ```json
  {
    "enrollmentId": "enr-7890-uuid",
    "taskId": "practical-summarize-scores",
    "code": "def summarize_scores(records):\n    return {r['name']: round(sum(r['scores'])/len(r['scores']), 2) for r in records if r.get('active') and r.get('scores')}"
  }
  ```
- **Response (`200 OK`):**
  ```json
  {
    "attemptId": "att-456",
    "status": "PASSED",
    "score": 1.0,
    "isPassed": true,
    "testsRun": 4,
    "testsPassed": 4,
    "executionTimeMs": 48,
    "testResults": [
      { "name": "Filters inactive records & computes mean", "passed": true, "details": "Got {'Alice': 90.0, 'Cara': 72.5}" },
      { "name": "Handles empty scores list safely", "passed": true, "details": "Verified 0.0" },
      { "name": "Rounds floating-point average to 2 decimals", "passed": true, "details": "Verified 10.33" },
      { "name": "Preserves caller input without side-effects", "passed": true, "details": "Verified non-mutating" }
    ]
  }
  ```

### 3.4 Public Zero-PII Credential Verification (`GET /api/v1/certificates/:id/verify`)
- **Query Parameters:** `token` (Optional, recipient-generated token to unmask full legal name)
- **Response (`200 OK` - Blinded Public View):**
  ```json
  {
    "isValid": true,
    "verified": true,
    "signatureVerified": true,
    "signatureAlgorithm": "Ed25519",
    "keyId": "certify-2026-key-1",
    "publicKeyFingerprint": "ed25519:7a8b9c...",
    "credentialId": "CERT-2026-PY-100001",
    "recipientDisplayName": "A***e L.",
    "isIdentityBlinded": true,
    "courseTitle": "Python Fundamentals",
    "courseSlug": "python-fundamentals",
    "tier": "PROFICIENT",
    "compositeScore": 0.89,
    "status": "VALID",
    "issuedAt": "2026-10-22T20:00:00.000Z",
    "r2ArtifactUrl": "/api/v1/certificates/CERT-2026-PY-100001/download"
  }
  ```
- **Response (`200 OK` - Unmasked View with Authorized Token):**
  ```json
  {
    "isValid": true,
    "recipientName": "Alice Learner",
    "isIdentityBlinded": false,
    ...
  }
  ```
- **Response (`200 OK` - Tampered Record):**
  ```json
  {
    "isValid": false,
    "verified": false,
    "signatureVerified": false,
    "status": "TAMPERED_INVALID",
    "trustNotice": "Cryptographic signature verification failed: the credential record does not match its signed Ed25519 payload."
  }
  ```
