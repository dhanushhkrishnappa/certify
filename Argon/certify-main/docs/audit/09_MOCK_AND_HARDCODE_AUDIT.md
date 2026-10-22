# CERTIFY — Mock, Hardcode, Fake Logic & Simulation Audit
**Document ID:** `docs/audit/09_MOCK_AND_HARDCODE_AUDIT.md`  
**Audit Date:** 2026-10-03  
**Auditor:** Antigravity Agentic Verification Engine  
**Classification:** Codebase Hygiene, Authenticity, & Production Integrity Audit  

---

## 1. Executive Summary

This document catalogues every instance across `backend/` and `frontend/` where functionality is simulated, mocked, hardcoded, or bypassed using client-side fallbacks.

**Summary of Findings:**
- **Backend Fake Production Logic:** 7 instances (including 4 hardcoded certification scores, fake AI model metadata, and keyword-based assessment demonstration).
- **Frontend Fallbacks & Mock States:** 11 instances (including fake verified credential on 404, simulated code execution with 0 errors, unpersisted diagnostics, and unsubmitted chapter assessments).
- **Legitimate Seed Data:** Distinct from fake logic. Seed data in `backend/prisma/seed.ts` properly populates the course catalog, chapters, concepts, and rubrics for "Python Fundamentals".

---

## 2. Comprehensive Inventory of Mocks, Hardcodes & Fake Logic

| # | File | Line(s) | Type | What It Does | Production Impact | Replacement Required |
|---|---|---|---|---|---|---|
| **1** | `backend/src/modules/certificates/certificates.controller.ts` | 51-56 | **HARDCODED** | Hardcodes `practicalScore = 0.92`, `vivaScore = 0.88`, `consistency = 0.86`, `interactionDepth = 0.82`. | **Critical (P0):** 80% of certification evidence is fabricated. Certificates are issued on fictitious data. | Query actual `AssessmentAttempt` (PRACTICAL, VIVA), variance of chapter scores, and dialogue evidence count. |
| **2** | `backend/src/modules/sessions/sessions.controller.ts` | 226-237 | **KEYWORD HACK** | Scans lowercased learner message for 11 substring keywords (`pointer`, `lazy`, `closure`, etc.) to trigger BKT updates. | **Critical (P0):** Learner can achieve 99% mastery by typing arbitrary keyword strings. Zero semantic understanding. | Replace with genuine streaming LLM structured rubric evaluation call. |
| **3** | `backend/src/modules/sessions/sessions.controller.ts` | 311-316 | **SIMULATION** | Emits canned array strings over SSE using `setTimeout(resolve, 80)`. | **Critical (P0):** Simulates AI streaming without any real model inference. | Pipe native SSE stream from Anthropic Claude / Google Gemini SDK. |
| **4** | `backend/src/modules/sessions/sessions.controller.ts` | 332 | **FAKE METADATA** | Injects `model: "claude-3-5-sonnet-pedagogical-v1"` into SQLite JSON metadata. | **High (P1):** Falsely claims to verifiers and auditors that Claude 3.5 Sonnet generated the message. | Record actual model ID returned by provider SDK response headers. |
| **5** | `backend/src/modules/assessment/assessment.controller.ts` | 91-108 | **KEYWORD HACK** | Awards rubric criteria demonstration if `hasKeyword && answerLower.length > 20`. | **Critical (P0):** Students pass formal chapter assessments without demonstrating real understanding. | Implement LLM-assisted rubric grading with structured schema output. |
| **6** | `backend/src/modules/assessment/assessment.controller.ts` | 212-243 | **CANNED LOGIC** | Generates static viva probes (LRU cache eviction) and returns `vivaScore = 0.94` if text includes `"memory"` or `"overhead"`. | **Critical (P0):** Oral viva defense is completely fake; does not persist attempts or verify understanding. | Persist viva turns in DB, generate dynamic probes based on student's practical code, evaluate defense via LLM. |
| **7** | `backend/src/modules/certificates/certificates.controller.ts` | 92-95 | **CRYPTOGRAPHIC MISMATCH** | Claims Ed25519 signature in docs, but uses symmetric HMAC-SHA256 with `jwtSecret`. | **High (P1):** Credentials cannot be verified independently with a public key. | Implement genuine Ed25519 keypair signing and public key exposure. |
| **8** | `frontend/src/components/PublicVerifyView.tsx` | 28-54 | **FAKE FALLBACK** | When `api.verifyPublicCredential` throws or 404s, `.catch()` sets a fake verified credential for "Sophia Chen" (94.8%). | **Critical (P0):** Any invalid, forged, or revoked credential ID is presented as authentic. | Remove catch block injection; render authentic 404 / Invalid Credential UI. |
| **9** | `frontend/src/services/api.ts` | 215-233 | **FALLBACK MOCK** | Calls `/api/v1/execute` (which 404s) and returns hardcoded string `0 errors detected. Status: Verified`. | **High (P1):** Every code execution succeeds regardless of syntax errors or failed tests. | Implement genuine Docker / gVisor sandbox endpoint `POST /api/v1/execute`. |
| **10** | `frontend/src/components/FinalAssessmentView.tsx` | 243-250 | **HARDCODED** | Clicking "Run Tests" unconditionally sets all question test cases to `status: "passed"`. | **Critical (P0):** Final practical assessment can be passed by clicking "Run Tests" with blank code. | Validate code execution output against test runner exit codes and test assertions. |
| **11** | `frontend/src/components/LearningStudio.tsx` | 148-175 | **SIMULATION** | When session is uninitialized, uses `setTimeout(r, 600)` to inject hardcoded assistant string into React state. | **Medium (P2):** Silently bypasses backend failures with simulated chat. | Display explicit network error and retry button. |
| **12** | `frontend/src/components/DiagnosticView.tsx` | 28-101 | **HARDCODED** | Hardcodes 4 Distributed Systems / Raft consensus multiple-choice probes. | **High (P1):** Course is Python Fundamentals, but diagnostic tests Raft consensus. | Pull course-specific diagnostic questions from backend API. |
| **13** | `frontend/src/components/DiagnosticView.tsx` | 115-123 | **UNPERSISTED** | `handleContinue` increments local state and calls `onComplete()` without sending answers to backend. | **High (P1):** Diagnostic calibration is completely fake; zero impact on BKT prior. | Submit answers to `POST /api/v1/assessments/diagnostic/submit` and calibrate priors. |
| **14** | `frontend/src/components/ChapterAssessmentView.tsx` | 21-47 | **HARDCODED** | Hardcodes TypeScript `QuorumCoordinator<T>` code and `@certify/distributed-core` import. | **High (P1):** Mismatch with Python Fundamentals curriculum. | Dynamically load chapter assessment challenge and language from backend. |
| **15** | `frontend/src/components/ChapterAssessmentView.tsx` | 67-71 | **UNPERSISTED** | `handleSubmitProof` calls `onPassed()` without calling `api.submitChapterAssessment`. | **Critical (P0):** Student can complete chapter assessment on frontend without creating database record. | Invoke `api.submitChapterAssessment` and await backend response before navigating. |
| **16** | `frontend/src/components/RemediationStudioView.tsx` | 41-54 | **HARDCODED** | Hardcodes breadcrumbs and concept title: "Distributed Systems / Chapter 2: Quorum Systems / Vector Clocks". | **Medium (P2):** Static text does not reflect learner's actual remediation concept. | Bind to dynamic concept and chapter props passed from Learning Studio. |
| **17** | `frontend/src/components/CatalogView.tsx` | 128 | **MOCK FALLBACK** | Displays hardcoded curriculum modal if course is not found in backend. | **Low (P3):** Masking missing courses with dummy modal. | Display empty state or redirect to explore courses. |
| **18** | `backend/prisma/seed.ts` | 1-280 | **SEED DATA** | Seeds initial Python Fundamentals course, modules, chapters, concepts, rubrics, and questions. | **Legitimate:** Standard database seed for local development and initial testing. | KEEP. Extend to cover multi-tier rubrics and practical tasks. |

---

## 3. Distinction: Production Deception vs Legitimate Development Mocking

1. **Legitimate Development Mocking:**
   - Seed scripts (`prisma/seed.ts`) that populate initial schema rows.
   - Unit test fixtures in `tests/bkt.test.ts`.
2. **Production Deception (Must Be Eliminated):**
   - The fake catch block in `PublicVerifyView.tsx` returning a verified state on 404.
   - Injecting `"claude-3-5-sonnet"` model names into database records when no AI was called.
   - Claiming Ed25519 digital signatures when using HMAC-SHA256.
   - Hardcoding 0.92 and 0.88 scores into issued certificates.
   - Unconditionally setting test cases to "passed" in `FinalAssessmentView.tsx`.

Every item in Category 2 must be replaced with genuine implementations before CERTIFY can be certified as complete.
