# Production Remediation & Hardening Plan

This engineering plan outlines the sequential phases required to transition the Certify codebase from an **interactive prototype demonstrator** to a **production-grade educational platform**.

---

## Phase 1: Security Hardening & Authorization Fixes (Immediate)

1. **Fix Insecure Direct Object References (IDOR)**:
   * Create an ownership verification middleware:
     ```typescript
     export async function requireEnrollmentOwner(req, res, next) {
       const enrollment = await prisma.enrollment.findUnique({ where: { id: req.body.enrollmentId } });
       if (!enrollment || enrollment.userId !== req.user.id) {
         return res.status(403).json({ error: "Forbidden: Not your enrollment" });
       }
       next();
     }
     ```
   * Enforce ownership on `/sessions/:id/messages`, `/assessments/chapters/:id/submit`, and `/assessments/final/viva`.
2. **Harden Authentication**:
   * Migrate JWT access token expiration from 7 days down to 15 minutes.
   * Implement `/api/v1/auth/refresh` endpoint using secure `HttpOnly`, `SameSite=Strict` cookies.
   * Remove auto-login hardcoded credentials from `frontend/src/App.tsx` and render proper login/registration views.
3. **Cryptographic Signature Verification**:
   * Update `CertificatesController.verifyPublicCredential` to re-compute and assert the signature hash against the canonical claims payload, rejecting tampered records.

---

## Phase 2: Real LLM Integration & Prompt Pipelines

1. **Install Official AI SDKs**:
   ```bash
   npm install @anthropic-ai/sdk openai
   ```
2. **Build Socratic Tutor Prompt Pipeline**:
   * Replace the hardcoded string arrays in `SessionsController.streamMessage` with a true Anthropic streaming call using `claude-3-5-sonnet-20241022`.
   * Feed real conversation history (last 6 turns from `ChatMessage`), chapter teaching content, and active concept learning objectives into the context window.
   * Enable prompt caching on the static course instructions.
3. **Build Structured Rubric Evaluator**:
   * Replace naive keyword matching in `AssessmentController.submitChapterAssessment` with an isolated call to `claude-3-5-haiku-20241022` using structured outputs (`tools` or JSON schema).
   * Evaluate student answers specifically against the rubric criteria mapped to that specific question, eliminating cross-concept corruption.

---

## Phase 3: Real Evidence Aggregation & Database Migration

1. **Dynamic Evidence Aggregation for Certification**:
   * Eliminate hardcoded constants (`practicalScore = 0.92`, `vivaScore = 0.88`, etc.).
   * In `CertificatesController.issueCertificate`, dynamically query the student's actual `AssessmentAttempt` scores and compute the true longitudinal consistency variance.
2. **PostgreSQL 16 + pgvector Migration**:
   * Update `prisma/schema.prisma` datasource to `postgresql`.
   * Add `CourseEmbedding` model with vector column for chapter teaching chunks.
   * Implement vector similarity search for grounded Socratic retrieval.

---

## Phase 4: Capstone Execution & AI Viva

1. **Practical Code Execution**:
   * Implement isolated execution runner (ephemeral Docker container or Wasm runtime) with strict CPU, RAM, and network quotas.
   * Run automated test suites against student capstone implementations.
2. **Dynamic AI Viva Defense**:
   * Replace static viva turns with a multi-turn conversational agent that reads the student's submitted code and challenges their specific algorithmic decisions and trade-offs.

---

## Phase 5: Comprehensive Test Coverage

1. **Integration Test Suite**:
   * Add Supertest suite covering all API endpoints (auth, sessions, assessments, certification).
2. **Golden AI Evaluation Suite**:
   * Build golden dataset of 50+ benchmark answers to continuously calibrate rubric evaluation agreement ($\kappa \ge 0.85$).
3. **Frontend E2E Testing**:
   * Add Playwright tests verifying the end-to-end learner journey in browser.
