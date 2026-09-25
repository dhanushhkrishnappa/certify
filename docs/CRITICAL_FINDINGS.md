# Critical Findings & Technical Debt Register

## Priority Severity Classification

### Severity Levels:
* **CRITICAL**: Complete absence of core functionality, catastrophic security vulnerability, or fundamental architectural invalidation.
* **HIGH**: Major architectural divergence, mock data in critical path, or data corruption risk.
* **MEDIUM**: Missing production hardening, sub-optimal data access patterns, or incomplete coverage.
* **LOW**: Stylistic debt, minor performance improvements, or non-blocking features.

---

## Technical Debt & Defect Register

| ID | Area | Finding | Severity | Evidence in Code | Remediation Requirement |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CF-01** | **AI Layer** | Zero LLM integration; conversational tutor is entirely simulated via hardcoded string arrays and substring keyword checks. | **CRITICAL** | `src/modules/sessions/sessions.controller.ts:225-316` | Integrate official Anthropic/OpenAI SDK with real streaming and prompt templates. |
| **CF-02** | **Certification** | 4 out of 5 composite evidence parameters are hardcoded floating-point constants. | **CRITICAL** | `src/modules/certificates/certificates.controller.ts:52-55` (`practicalScore = 0.92`, `vivaScore = 0.88`, etc.) | Compute evidence dynamically from persisted assessment attempts and viva scores. |
| **CF-03** | **Security / IDOR** | Session messaging, chapter submission, and viva turn endpoints do not verify user ownership of the session or enrollment. | **CRITICAL** | `src/modules/sessions/sessions.controller.ts:170`, `src/modules/assessment/assessment.controller.ts:27` | Add strict ownership middleware verifying `session.enrollment.userId === req.user.id`. |
| **CF-04** | **Mastery Engine** | Keyword-based evidence evaluation causes false-positive mastery and double-counts across all concepts in a chapter. | **CRITICAL** | `src/modules/assessment/assessment.controller.ts:85-165` (evaluates single answer against all chapter concepts) | Route open-ended answers to a real LLM Rubric Evaluator with concept-criterion mappings. |
| **CF-05** | **RAG & Database** | Database is SQLite without vector support; RAG knowledge retrieval does not exist. | **HIGH** | `backend/prisma/schema.prisma:1-4` (`provider = "sqlite"`), zero embedding tables | Migrate to PostgreSQL 16 with `pgvector` or implement localized vector search. |
| **CF-06** | **Cryptography** | Ed25519 signing is not implemented (uses symmetric HMAC-SHA256); public verification endpoint never checks the signature. | **HIGH** | `src/modules/certificates/certificates.controller.ts:91-95, 149-182` | Implement asymmetric key signing and add cryptographic verification check in endpoint. |
| **CF-07** | **Auth Security** | JWT access tokens last 7 days and are stored in browser `localStorage`. No refresh token rotation or HttpOnly cookies. | **HIGH** | `src/modules/auth/auth.controller.ts:44, 79`, `frontend/src/services/api.ts:14` | Implement short-lived access tokens (15m) + secure rotating HttpOnly refresh cookies. |
| **CF-08** | **Frontend Auth** | UI auto-logs in as `learner@certify.edu` on initial page load with hardcoded password. | **HIGH** | `frontend/src/App.tsx:14-25` | Remove hardcoded auto-login and implement proper login/registration modals. |
| **CF-09** | **Practical Sandbox**| Claimed container sandbox for executing student code does not exist. | **HIGH** | `docs/SECURITY.md` vs zero sandbox runner in codebase | Implement isolated runner (Docker/Firecracker/Wasm) for capstone code execution. |
| **CF-10** | **AI Viva Defense**| Oral defense consists of 3 fixed static strings with no dynamic contextual interrogation. | **HIGH** | `src/modules/assessment/assessment.controller.ts:223-235` | Implement multi-turn conversational agent evaluating trade-offs against student code. |
| **CF-11** | **Diagnostic Flow** | Documented baseline diagnostic is completely missing in code. | **MEDIUM** | Zero references in `src/` or `frontend/` | Implement 3-5 adaptive diagnostic questions to initialize $P(L_0)$. |
| **CF-12** | **Test Quality** | Tests only verify isolated math formulas; zero HTTP integration tests, zero frontend tests, zero AI evals. | **MEDIUM** | `backend/src/app.test.ts:4-6` (`expect(app).toBeDefined()`) | Add Supertest integration test suite for all endpoints and Vitest for frontend. |
