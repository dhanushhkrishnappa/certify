# CERTIFY — Product Requirements Audit Matrix

**Audit Date:** October 3, 2026  
**Commit:** `5961664`  
**Reference Document:** Canonical Product Definition (Section 0)  

---

## 1. Product Requirements Matrix

| ID | Requirement | Expected Behavior | Actual Implementation | Status | Evidence | Gap |
|:---|:---|:---|:---|:---|:---|:---|
| **REQ-01** | Platform-Curated Course Selection | Learner selects from platform-owned courses with versioning and verified syllabi. | Seed script creates `Python Fundamentals` v1.0.0. `CatalogView.tsx` shows 6 courses, but 5 are client-side hardcoded stubs. | **PARTIAL** | `prisma/seed.ts:52-70`, `CatalogView.tsx:25-101` | Only Python Fundamentals exists in DB. Other 5 courses 404 on click. |
| **REQ-02** | Baseline Diagnostic Assessment | Learner takes a non-punitive diagnostic pre-assessment to calibrate initial knowledge priors $P(L_0)$. | `DiagnosticView.tsx` renders 4 hardcoded questions (Raft, Asyncio, Memory). Progressing simply triggers client-side state increment. | **HARDCODED** | `DiagnosticView.tsx:28-101`, `115-123` | Does not call any backend API, does not save answers, does not update concept mastery priors. Questions are from Distributed Systems, not Python. |
| **REQ-03** | Interactive Socratic AI Tutor | AI Tutor teaches concepts interactively via dialogue, guiding rather than giving answers. | `SessionsController.streamMessage` uses regex keyword matching on 11 words (`pointer`, `lazy`, etc.) and streams canned strings with `setTimeout(80ms)`. | **MOCKED** | `sessions.controller.ts:226-335`, `LearningStudio.tsx:597-679` | No actual LLM inference exists. Zero AI SDKs installed. Permanent fake chat exchange rendered at top of studio. |
| **REQ-04** | Adaptive Explanation & Misconception Remediation | Tutor detects learner misconceptions and shifts explanatory strategy (analogy, first principles, counterexamples). | Keywords like `explain` or `don't understand` return a single pre-written text snippet embedding `currentChapter.teachingContent`. | **HARDCODED** | `sessions.controller.ts:292-301` | No adaptive semantic reasoning. Identical text returned for any query containing "explain". |
| **REQ-05** | Chapter-Based Curriculum Progression | Course structured as Modules $\rightarrow$ Chapters $\rightarrow$ Concepts $\rightarrow$ Objectives. | Relational hierarchy implemented in Prisma and seeded in SQLite with 8 modules, 9 chapters, 10 concepts. | **COMPLETE** | `schema.prisma:47-83`, `seed.ts:73-379` | Full relational schema and Python curriculum seeded. |
| **REQ-06** | Learn $\rightarrow$ Practice $\rightarrow$ Check $\rightarrow$ Remediate $\rightarrow$ Advance Loop | Each chapter enforces this pedagogical cycle before unlocking the next chapter. | `SessionsController.advanceChapter` checks $P(\text{Mastery}) \ge 0.70$ for chapter concepts. However, in frontend, user can click directly to any view. | **PARTIAL** | `sessions.controller.ts:388-401`, `App.tsx:51-91` | Server enforces gate on `/advance`, but frontend allows direct navigation to `/final-assessment`, `/result`, or `/credentials` without completing chapters. |
| **REQ-07** | Chapter Assessments with Stored Evidence | Assessments evaluate chapter concepts and persist rubric-linked evidence. | `submitChapterAssessment` creates `AssessmentAttempt` and `MasteryEvidence`, but scoring uses `hasKeyword && length > 20`. Frontend `ChapterAssessmentView` displays Quorum/TS code and doesn't call submit API. | **BROKEN** | `assessment.controller.ts:108-161`, `ChapterAssessmentView.tsx:21-47` | Keyword-based evaluation is fake. Frontend UI shows wrong course (Distributed Systems) and doesn't submit to backend. |
| **REQ-08** | Practical Code Demonstration Sandbox | Learner implements real code solutions evaluated against unit tests and runtime invariants. | `executeCode` in `api.ts` attempts `POST /api/v1/execute` which does not exist on backend, falling back to hardcoded string. `LearningStudio` regex-extracts `print()`. | **MOCKED** | `api.ts:215-233`, `LearningStudio.tsx:213-221` | No backend execution sandbox exists. Code execution is completely simulated in frontend. |
| **REQ-09** | Course-Level Final Assessment | Comprehensive exam evaluating course mastery across conceptual and applied tasks. | `FinalAssessmentView.tsx` hardcodes 12 questions in React state. Running tests unconditionally marks all test cases as "passed". Submitting does not call backend. | **HARDCODED** | `FinalAssessmentView.tsx:29-176`, `240-268`, `287-295` | Final assessment is completely disconnected from backend database. |
| **REQ-10** | AI Viva / Oral Defense Probing | Multi-turn oral examination probing learner design choices and algorithmic trade-offs. | `conductVivaTurn` in backend uses canned strings based on `turnNumber === 1 \|\| 2`. Frontend `VivaChamberView` does not even call backend; uses `setTimeout(700ms)`. | **MOCKED** | `assessment.controller.ts:206-245`, `VivaChamberView.tsx:22-36` | Pure frontend simulation. No speech, no dynamic LLM questioning, no persistence. |
| **REQ-11** | Accumulated Evidence Model | Certification decisions depend on accumulated multi-modal evidence across learning history. | `CertificationEvaluator.evaluateCredential` defines 5 components. However, 4 of 5 components (`practicalPerformance`, `vivaDefenseScore`, `consistencyIndex`, `interactionDepthScore`) are hardcoded constants. | **HARDCODED** | `certificates.controller.ts:51-56`, `bkt.ts:66-74` | Only mean chapter mastery is pulled from DB. The other 4 evidence streams are fake numbers (0.92, 0.88, 0.86, 0.82). |
| **REQ-12** | Deterministic Backend Authority | Backend rules, NOT the LLM, authoritatively decide pass/fail and certificate tier. | `CertificationEvaluator.evaluateCredential` applies deterministic formulas and thresholds ($0.70, 0.85, 0.92$) without LLM interference. | **COMPLETE** | `bkt.ts:60-111`, `bkt.test.ts:34-90` | Correctly separated. The LLM has zero authority over certification outcomes. |
| **REQ-13** | Unique Credential ID & Public Verification | Credentials receive unique IDs verifiable publicly without authentication or PII leakage. | Backend generates `CERT-YYYY-PY-XXXXXX` and serves `GET /api/v1/certificates/:credentialId/verify`. However, verification ignores HMAC signature, and frontend fakes invalid lookups. | **INSECURE** | `certificates.controller.ts:78-106`, `132-179`, `PublicVerifyView.tsx:28-54` | Backend does not verify signature. Frontend silently replaces 404s with a fake valid certificate for "Sophia Chen". |
| **REQ-14** | Traceable & Auditable Evidence | Stored evidence records exact quotes, criteria, timestamps, and course versions. | Schema stores `MasteryEvidence` and `evidenceSummary` JSON in `Certificate`. | **PARTIAL** | `schema.prisma:176-187`, `certificates.controller.ts:80-89` | Summary JSON is stored, but because 4 of 5 scores are hardcoded, the stored evidence snapshot is fabricated. |
| **REQ-15** | Flagship Course: Python Fundamentals | Full Python curriculum with working chapters, exercises, and assessments. | Backend seeded with 8 modules of Python. Frontend views (`ChapterAssessment`, `Diagnostic`, `Remediation`) contain mismatched Distributed Systems content. | **PARTIAL** | `seed.ts:73-379`, `ChapterAssessmentView.tsx:21-47` | Backend has Python curriculum; frontend views display Distributed Systems content. |
| **REQ-16** | Out-of-Scope Quarantine | Platform must not include marketplaces, proctoring, webcam tracking, or external course certification. | Codebase is free from webcam surveillance, blockchain tokens, recruiter job boards, and third-party course imports. | **COMPLETE** | Full repository inspection | Strict scope adherence maintained. |

---

## 2. Quantitative Summary

- **Total Requirements Audited:** 16
- **COMPLETE:** 3 (18.75%)
- **PARTIAL:** 4 (25.0%)
- **MOCKED:** 3 (18.75%)
- **HARDCODED:** 4 (25.0%)
- **BROKEN:** 1 (6.25%)
- **INSECURE:** 1 (6.25%)
- **MISSING:** 0 (0%)
- **UNVERIFIED:** 0 (0%)

**Verified Core Completion:** **3 of 16** requirements fully verified end-to-end.
