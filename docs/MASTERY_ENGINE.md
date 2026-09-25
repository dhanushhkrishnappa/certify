# Mastery & Evidence Engine Specification

## 1. Pedagogical Grounding & Mastery Modeling

A core requirement of Certify is that **mastery is not an arbitrary percentage derived from "time spent" or "message count"**. Asking 50 questions does not make a learner "Advanced". 

The Mastery Engine is a **100% deterministic mathematical module** that ingests atomic observations from assessments and interactive dialogues and continuously computes the posterior probability of concept mastery using an adapted **Bayesian Knowledge Tracing (BKT)** formulation coupled with **Rubric Evidence Accumulation**.

---

## 2. Bayesian Knowledge Tracing (BKT) Formulation

For each atomic concept $C_k$, the engine maintains the probability that the student has mastered the concept, $P(L_t)$, updated with each verified observation:

### Parameters
* $P(L_0)$: **Prior Knowledge** (initialized via the Course Baseline Diagnostic, typically 0.15 for novice, 0.45 for familiar, 0.75 for advanced).
* $P(T)$: **Probability of Learning Transition** (the probability the student transitions from unmastered to mastered state during a pedagogical explanation turn; default: 0.20).
* $P(G)$: **Probability of Guess** (the chance of a correct response despite lacking mastery; default: 0.10 for open-ended rubric evaluations, 0.25 for MCQs).
* $P(S)$: **Probability of Slip** (the chance an expert makes a minor typographical error or slip; default: 0.05).

### Update Equations

#### Step 1: Observation Update (Bayes' Rule)
If the observation is **Correct / Demonstrated** ($\text{Obs} = 1$):
$$P(L_t \mid \text{Obs}=1) = \frac{P(L_t) \cdot (1 - P(S))}{P(L_t) \cdot (1 - P(S)) + (1 - P(L_t)) \cdot P(G)}$$

If the observation is **Incorrect / Not Demonstrated** ($\text{Obs} = 0$):
$$P(L_t \mid \text{Obs}=0) = \frac{P(L_t) \cdot P(S)}{P(L_t) \cdot P(S) + (1 - P(L_t)) \cdot (1 - P(G))}$$

#### Step 2: Transition Update
Following the interaction or explanation:
$$P(L_{t+1}) = P(L_t \mid \text{Obs}) + (1 - P(L_t \mid \text{Obs})) \cdot P(T)$$

```typescript
export class BayesianKnowledgeTracer {
  public static update(
    pCurrent: number,
    isCorrect: boolean,
    params = { pT: 0.20, pG: 0.10, pS: 0.05 }
  ): number {
    const { pT, pG, pS } = params;
    
    // Step 1: Posterior given observation
    let pPosterior: number;
    if (isCorrect) {
      pPosterior = (pCurrent * (1 - pS)) / (pCurrent * (1 - pS) + (1 - pCurrent) * pG);
    } else {
      pPosterior = (pCurrent * pS) / (pCurrent * pS + (1 - pCurrent) * (1 - pG));
    }
    
    // Step 2: Learning transition
    const pNext = pPosterior + (1 - pPosterior) * pT;
    return Math.min(Math.max(pNext, 0.01), 0.99); // Clamped
  }
}
```

---

## 3. Evidence Sufficiency & Tier Thresholds

A concept is never marked "Mastered" from a single response. Mastery requires **Evidence Sufficiency** across multiple distinct observation contexts:

```
+----------------------------------------------------------------------------------------------------+
|                                    EVIDENCE SUFFICIENCY MODEL                                      |
+----------------------------------------------------------------------------------------------------+
|  OBSERVATION STREAM 1: Interactive Dialogue Micro-checks (Formative)                               |
|  OBSERVATION STREAM 2: End-of-Chapter Assessment Rubrics (Summative)                                |
|  OBSERVATION STREAM 3: Code Application / Debugging Tasks (Practical)                              |
|  OBSERVATION STREAM 4: Final AI Viva / Oral Defense Probes (Evaluative)                            |
+----------------------------------------------------------------------------------------------------+
```

### Credential Tier Requirements

| Credential Tier | Target Threshold | Required Competencies | Remediation Allowance |
| :--- | :--- | :--- | :--- |
| **Foundation (Easy)** | Overall $P(L) \ge 0.70$ | All foundational recall & basic application criteria demonstrated. | High remediation tolerance (multiple retry cycles permitted). |
| **Proficient (Medium)** | Overall $P(L) \ge 0.85$ | All foundational + scenario reasoning & debugging criteria demonstrated. | Moderate remediation (smooth progression on standard checks). |
| **Advanced (Hard)** | Overall $P(L) \ge 0.92$ | Foundational + complex transfer + oral defense justification under pressure. | Low remediation (< 2 cycles); demonstrates consistent first-attempt depth. |

---

## 4. Chapter Progression Gating
The Progression Gate prevents learners from skipping foundational material:
* To unlock Chapter $N+1$, all core concepts in Chapter $N$ must satisfy:
  $$P(L_{\text{concept}}) \ge 0.75 \quad \text{AND} \quad \text{Unresolved Misconceptions} = 0$$
* If a learner fails a chapter assessment, the state transitions to `NEEDS_REMEDIATION`. The AI Tutor enters a guided remediation loop targeting only the failed rubric criteria.
