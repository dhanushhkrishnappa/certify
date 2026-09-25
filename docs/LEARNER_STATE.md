# Learner State & Memory Architecture

## 1. Multi-Tiered Memory Hierarchy

The AI Tutor cannot rely on passing an ever-growing raw chat transcript to the LLM. Doing so causes:
* Rapid token budget exhaustion and excessive latency ($$$ and slow responses).
* The "lost in the middle" phenomenon where older instructions or student misconceptions are forgotten.
* Session fragility across device switches or disconnects.

Certify decomposes learner state into **4 specialized memory tiers**:

```
+----------------------------------------------------------------------------------------------------+
|                                    LEARNER STATE ARCHITECTURE                                      |
+----------------------------------------------------------------------------------------------------+
|  TIER 1: EPHEMERAL WORKING MEMORY (Redis - TTL 2h)                                                 |
|  - Active Chapter ID, Active Concept ID                                                            |
|  - Current Dialogue Phase (INTRODUCING | CHECKING | REMEDIATING | ASSESSING)                      |
|  - Sliding Window: Last 6-8 conversation turns                                                     |
|  - Real-time connection metadata (WebSocket/SSE connection ID)                                     |
+----------------------------------------------------------------------------------------------------+
|  TIER 2: CONCEPT MASTERY VECTOR (PostgreSQL - Indexed by User & Course)                            |
|  - Atomic Concept State: P(Mastery) per concept (0.0 to 1.0)                                       |
|  - Active Misconception Tags: ["assumes list mutability applies to tuples"]                        |
|  - Attempt Counters & Remediation Count per concept                                               |
+----------------------------------------------------------------------------------------------------+
|  TIER 3: EPISODIC INTERACTION SUMMARY (PostgreSQL - Compressed Chunks)                             |
|  - AI-generated semantic summary of completed chapters and key student breakthroughs               |
|  - Stored at chapter close: ~150 tokens per chapter                                                |
+----------------------------------------------------------------------------------------------------+
|  TIER 4: LONGITUDINAL BEHAVIORAL PROFILE (PostgreSQL Analytics)                                    |
|  - Consistency index across chapters                                                               |
|  - Average cognitive depth score (Recall vs Reason vs Apply)                                      |
|  - Remediation responsiveness rate                                                                 |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Concept Mastery Vector Specification

The Concept Mastery Vector represents the learner's real-time cognitive profile. Every enrolled user maintains a collection of concept states for the course:

```typescript
export interface ConceptMasteryRecord {
  userId: string;
  courseId: string;
  conceptId: string;
  pMastery: number;              // Bayesian Knowledge Tracing probability [0.0 - 1.0]
  confidence: number;            // Statistical confidence in the estimation [0.0 - 1.0]
  state: "UNENCOUNTERED" | "LEARNING" | "NEEDS_REMEDIATION" | "MASTERED" | "ADVANCED";
  demonstratedCriteriaIds: string[]; // Set of validated rubric criteria UUIDs
  activeMisconceptions: string[];    // Array of persistent misconception strings
  totalAttempts: number;
  successfulAssessments: number;
  lastAssessedAt: Date;
}
```

---

## 3. Session Rehydration & State Resumption

When a learner opens their laptop, switches browsers, or experiences a network drop:
1. **Handshake**: The client sends a `GET /api/v1/courses/:courseId/session` with the user's JWT.
2. **State Check**: The server checks Redis for an active `session:{userId}:{courseId}` key.
   * *If present*: The live sliding window and current phase are immediately returned.
   * *If expired / cold start*: The server loads the latest `learning_sessions` and `concept_mastery` rows from PostgreSQL, reconstructs the episodic summary, and initializes a fresh Redis working session in < 25ms.
3. **Prompt Injection**: Only the distilled `LearnerState` snippet is injected into the LLM system prompt, requiring **under 350 tokens** regardless of whether the user is on Chapter 1 or Chapter 20.
