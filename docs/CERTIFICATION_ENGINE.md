# Certification Engine & Credential Verification Specification

## 1. Separation of AI Authority from Certification Authority

```
+----------------------------------------------------------------------------------------------------+
|                                     THE TRUST BOUNDARY                                              |
+----------------------------------------------------------------------------------------------------+
|  PROBABILISTIC COGNITIVE DOMAIN (AI / LLM)                                                         |
|  - Socratic Tutoring & Explanation                                                                 |
|  - Free-Text Rubric Evidence Extraction (Criterion boolean + quote + reasoning)                    |
|  - Viva Defense Probing                                                                            |
|                                                                                                    |
|  ============================== STRICT ARCHITECTURAL TRUST BOUNDARY ==============================  |
|                                                                                                    |
|  DETERMINISTIC VERIFICATION DOMAIN (Pure Code / Database)                                         |
|  - Aggregation of Atomic Rubric Criterion Vectors                                                  |
|  - Bayesian Knowledge Tracing Probability Computations                                             |
|  - Credential Tier Threshold Enforcement                                                           |
|  - Asymmetric Cryptographic Signing (Ed25519)                                                      |
|  - Public Verification Registry & Revocation Management                                            |
+----------------------------------------------------------------------------------------------------+
```
**Under no circumstances is an LLM allowed to execute `student.is_certified = true`.** The LLM is strictly an evidence extractor; the Certification Engine is a deterministic state machine.

---

## 2. Composite Evidence Model & Tier Formulation

A certificate is awarded based on a deterministic weighted composite score derived from 5 independent evidence streams:

```typescript
export interface EvidenceComposite {
  chapterMasteryScore: number;     // Weight: 30% - Mean P(L) across all chapters
  practicalPerformance: number;    // Weight: 25% - Practical code task AST & execution score
  vivaDefenseScore: number;        // Weight: 20% - Evaluated reasoning depth in defense turns
  consistencyIndex: number;        // Weight: 15% - Inverse variance of performance across journey
  interactionDepthScore: number;   // Weight: 10% - Quality & cognitive level of learner questions
}
```

$$\text{Composite Score} = 0.30 M_{\text{chap}} + 0.25 P_{\text{task}} + 0.20 V_{\text{viva}} + 0.15 C_{\text{consist}} + 0.10 I_{\text{depth}}$$

### Deterministic Tier Thresholds
* **No Certificate / Remediation**: Composite Score $< 0.70$ OR any Chapter Mastery $< 0.75$.
* **Foundation (Easy)**: Composite Score $\ge 0.70$ and all chapters completed.
* **Proficient (Medium)**: Composite Score $\ge 0.85$ with Practical Task $\ge 0.80$ and Viva $\ge 0.75$.
* **Advanced (Hard / Distinction)**: Composite Score $\ge 0.92$ with Practical Task $\ge 0.90$, Viva $\ge 0.90$, and Consistency Index $\ge 0.85$.

### Borderline State Handling
If a learner's composite score lands within $\pm 1.5\%$ of a tier threshold (e.g., $84.2\%$ when $85.0\%$ is required for Proficient), the engine:
1. Triggers an optional single **Cap-Stone Probe Question** focused on their lowest-scoring concept.
2. Flags the attempt in the instructor **Audit Queue** for optional human review.

---

## 3. Cryptographic Verification & Public Trust Architecture

Certificates are issued with an immutable, cryptographically signed payload:

```json
{
  "credentialId": "CERT-2026-PY-98124",
  "recipient": {
    "name": "Alex Chen",
    "hash": "sha256(userId + salt)"
  },
  "course": {
    "id": "python-fundamentals",
    "title": "Python Fundamentals",
    "version": "1.2.0"
  },
  "tier": "PROFICIENT",
  "issuedAt": "2026-09-22T12:00:00Z",
  "evidenceSummary": {
    "chaptersCompleted": 8,
    "conceptsMastered": 24,
    "practicalProjectPassed": true,
    "vivaDefenseScore": 0.88,
    "compositeScore": 0.874
  },
  "issuerSignature": "ed25519_signature_hex_over_canonical_claims"
}
```

### Public Verification Portal
* Public URL: `https://certify.domain/verify/:credentialId`
* **Zero PII Leakage**: Displays the learner's public display name, course name, issue date, status (`VALID`, `REVOKED`), and the high-level evidence summary.
* **Never exposed**: Private chat logs, raw failed attempts, or internal telemetry.
