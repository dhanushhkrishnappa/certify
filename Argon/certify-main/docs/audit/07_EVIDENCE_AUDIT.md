# CERTIFY — Evidence Collection & Traceability Audit
**Document ID:** `docs/audit/07_EVIDENCE_AUDIT.md`  
**Audit Date:** 2026-10-03  
**Auditor:** Antigravity Agentic Verification Engine  
**Classification:** Evidence Architecture & Certification Grounding Audit  

---

## 1. Executive Summary

CERTIFY's core brand promise is:
> *"Certification is based on accumulated evidence... Deterministic backend rules decide certification outcomes... Certification evidence must be traceable and auditable."*

**Actual Finding: CRITICAL SYSTEM BREAKDOWN (P0).**
While the Prisma schema provides sophisticated entities (`AssessmentAttempt`, `AssessmentAnswer`, `RubricEvaluation`, `MasteryEvidence`, `Certificate`), the certification issuance pipeline in `backend/src/modules/certificates/certificates.controller.ts:51-56` **fabricates 80% of the evidence components using hardcoded constants**.

```typescript
// backend/src/modules/certificates/certificates.controller.ts:51-56
// 2. Fetch or estimate other evidence components
const practicalScore = 0.92;   // Passed practical task unit tests (HARDCODED)
const vivaScore = 0.88;        // Strong oral defense score (HARDCODED)
const consistency = 0.86;      // Cross-chapter consistency (HARDCODED)
const interactionDepth = 0.82; // Questions probed trade-offs & mechanics (HARDCODED)
```

Only `chapterMasteryScore` (mean BKT mastery) is calculated from the database. Practical performance, oral viva defense, cross-chapter consistency, and interaction depth are completely fabricated. As a result, every certificate issued by the platform contains synthetic evidence claims.

---

## 2. Evidence Type Inventory & Audit Matrix

| Evidence Type | Claimed Source | Actual Storage in DB | Calculation Method | Validation & Security | Learner Ownership Verified? | Used in Certification? | Status |
|---|---|---|---|---|---|---|---|
| **1. Diagnostic Performance** | Pre-course adaptive diagnostic test | None. React state only (`DiagnosticView.tsx`). | Average of 5 multiple-choice questions. | None. Zero server validation. | No. Not persisted. | **No.** Ignored by certification pipeline. | **MISSING** |
| **2. Chapter Assessment Performance** | End-of-chapter formal evaluation | `AssessmentAttempt`, `AssessmentAnswer`, `RubricEvaluation` | Sum of rubric criteria demonstrated / total checked. | Keyword matching (`hasKeyword && length > 20`). | **No.** Vulnerable to BOLA/IDOR in submission. | Indirectly via BKT mastery updates. | **PARTIAL / INSECURE** |
| **3. Learning Dialogue Interaction** | Socratic conversation in Learning Studio | `ChatMessage`, `MasteryEvidence` (`DIALOGUE_PROBE`) | BKT increment on keyword match. | 11 keyword strings in lowercased text. | **No.** Vulnerable to IDOR in `streamMessage`. | Indirectly via BKT mastery updates. | **MOCKED** |
| **4. Practical Coding Demonstration** | In-browser Python sandbox execution | None. Endpoint `/api/v1/execute` does not exist. | Hardcoded fallback: `0 errors detected`. | None. No code execution environment. | No. | **Fake.** Hardcoded to `0.92` in `certificates.controller.ts`. | **HARDCODED (P0)** |
| **5. AI Viva Oral Defense** | Multi-turn Socratic oral defense | None. Endpoint `conductVivaTurn` does not write to DB. | Keyword check: `hasTradeoff ? 0.94 : 0.72`. | Purely transient JSON response. | No. Not persisted. | **Fake.** Hardcoded to `0.88` in `certificates.controller.ts`. | **HARDCODED (P0)** |
| **6. Cross-Chapter Consistency** | Variance of mastery progression over time | None. No statistical variance engine exists. | None. | N/A | N/A | **Fake.** Hardcoded to `0.86` in `certificates.controller.ts`. | **HARDCODED (P0)** |
| **7. Socratic Interaction Depth** | Depth of learner inquiry and reasoning | None. No dialogue complexity metric exists. | None. | N/A | N/A | **Fake.** Hardcoded to `0.82` in `certificates.controller.ts`. | **HARDCODED (P0)** |
| **8. Chapter Mastery Progression** | BKT probability over concepts | `ConceptMastery.pMastery` | $\frac{\sum P(Mastery)}{N}$ across enrollment concepts. | Deterministic BKT engine, but inputs are keyword-gamed. | **Yes.** Verified `enrollment.userId === req.user.id`. | **Yes.** Used as `chapterMasteryScore` in certification evaluator. | **PARTIAL** |
| **9. Remediation Drills** | Targeted drills on low-mastery concepts | None. React state only (`RemediationStudioView.tsx`). | Purely front-end state. | None. | No. | **No.** Ignored. | **MISSING** |
| **10. Course Completion** | Progression through all syllabus chapters | `Enrollment.status = "COMPLETED"` | All chapters marked advanced. | Checked in session context. | **Yes.** | **Yes.** Status updated on certificate issue. | **COMPLETE** |

---

## 3. Evidence Snapshot in Issued Credentials

When a certificate is issued, an `evidenceSummary` JSON payload is serialized into `Certificate.evidenceSummary`:

```typescript
// backend/src/modules/certificates/certificates.controller.ts:80-89
const evidenceSummary = JSON.stringify({
  courseTitle: enrollment.courseVersion.course.title,
  version: enrollment.courseVersion.versionNumber,
  chapterMastery: meanMastery,
  practicalPerformance: practicalScore, // Always 0.92!
  vivaDefenseScore: vivaScore,           // Always 0.88!
  consistencyIndex: consistency,         // Always 0.86!
  compositeScore: evaluation.compositeScore,
  evaluatedAt: new Date().toISOString(),
});
```

### Traceability Audit Findings:
1. **Zero Raw Evidence Traceability:** The snapshot does not link to specific `AssessmentAttempt` IDs, `ChatMessage` IDs, or code repository commits. An external verifier cannot trace *why* a student scored 0.92 on practical performance because the underlying assessment attempts do not exist.
2. **False Audit Trail:** The public verification endpoint claims:
   ```
   "trustNotice": "This credential was deterministically issued based on continuous chapter-level evidence, practical execution, and verified AI Viva oral defense."
   ```
   This notice is factually untrue under the current implementation.

---

## 4. Required Evidence System Architecture

To fulfill the canonical promise of traceable, auditable certification, evidence must be collected and aggregated across real, distinct subsystems:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ACTUAL EVIDENCE STREAMS                         │
├────────────────────────────────┬───────────────────────────────────────┤
│ Theory Mastery (Weight: 30%)   │ Mean BKT pMastery across all concepts │
│ Practical Tasks (Weight: 25%)  │ Unit tests passed in Docker Sandbox   │
│ AI Viva Defense (Weight: 20%)  │ Rubric scores across 3 viva turns     │
│ Consistency Index (Weight: 15%)│ 1 - StdDev(Chapter Scores)            │
│ Interaction Depth (Weight: 10%)│ Rubric dialogue probes demonstrated   │
└────────────────────────────────┴───────────────────────────────────────┘
                                 │
                                 ▼
                 [ Evidence Aggregation Service ]
                                 │
                 ├─ Gating: Chapter Mastery >= 0.70
                 ├─ Gating: Practical Tests >= 0.80
                 ├─ Gating: Viva Defense >= 0.75
                                 │
                                 ▼
                [ Deterministic Tier Award Engine ]
                                 │
                 ▼               ▼                ▼
            FOUNDATION       PROFICIENT       ADVANCED
```

---

## 5. Prioritized Evidence Remediation Tasks

1. **[P0] Eradicate Hardcoded Evidence Constants:** Delete lines 51-56 in `certificates.controller.ts`. Replace them with dynamic queries against stored assessment attempts and viva logs.
2. **[P0] Implement Practical Assessment Evidence Ingestion:**
   - Store practical challenge files in database/filesystem.
   - Run learner code submissions against test suites in an isolated sandbox.
   - Record genuine `AssessmentAttempt` rows of type `PRACTICAL` with real test pass percentages.
3. **[P0] Persist AI Viva Oral Defense Evidence:**
   - Record `AssessmentAttempt` of type `VIVA`.
   - Save learner audio/text turns and AI rubric evaluations to `AssessmentAnswer` and `RubricEvaluation`.
   - Calculate genuine mean viva score from evaluated criteria.
4. **[P1] Implement Mathematical Consistency Index:**
   - Compute the statistical standard deviation or variance of chapter assessment scores:
     $$\text{Consistency} = \max\left(0, 1 - \sqrt{\frac{1}{N}\sum_{i=1}^N (S_i - \bar{S})^2}\right)$$
5. **[P1] Implement Real Interaction Depth Score:**
   - Calculate the ratio of high-tier `DIALOGUE_PROBE` evidence rows created vs total chapters.
6. **[P1] Link Evidence Snapshot to Database Foreign Keys:**
   - In `Certificate.evidenceSummary`, include arrays of `attemptIds` and `evidenceIds` so verification records link to immutable database rows.
