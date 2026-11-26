# 04 — Database Architecture & Schema Reference

**Document Scope:** Complete 37-Table PostgreSQL Data Dictionary, Entity-Relationship Architecture, Vector/FTS Indexing, and Migration Reference  
**Database Engine:** Neon Serverless PostgreSQL 16 + `pgvector` + Prisma ORM 5.22

---

## 1. Database Architecture Overview

The CERTIFY database schema is organized into **10 isolated domain boundaries** comprising **37 relational tables**. Every table uses UUID primary keys (`@id @default(uuid())`), explicit foreign-key cascade/restrict rules, and targeted B-Tree, HNSW (`pgvector`), and GIN (`tsvector`) indexes.

### Database Files in the Repository
| File Path | Purpose |
| :--- | :--- |
| `backend/prisma/schema.prisma` | Authoritative Prisma 5.22 schema defining all 37 models, relations, and indexes. |
| `backend/prisma/neon_init.sql` | Complete, self-contained PostgreSQL DDL script creating all 37 tables, `pgvector` extension, HNSW/GIN/B-Tree indexes, and foreign keys. |
| `backend/prisma/migrations/add_pgvector_rag.sql` | Dedicated migration script for `course_embeddings` with 1536-dim `vector(1536)` HNSW cosine index and `tsvector` GIN full-text index. |
| `backend/prisma/seed.ts` | Idempotent database seeder that creates the `python-fundamentals` track, 10 modules, 29 chapters, concepts, rubrics, questions, Ed25519 signing keys, and invokes `enrich_curriculum_and_progression.ts`. |
| `backend/scripts/enrich_curriculum_and_progression.ts` | Non-destructive curriculum enrichment script that slices all 29 chapters into 126 `LessonSection` rows (`S1`–`S5`), seeds 8 `SkillDimension` rows, maps 66 `RubricCriterion` records, and backfills progression state. |
| `backend/scripts/ingest_python_rag.ts` | Chunking and embedding ingestion pipeline that populates `course_embeddings` with 169 section-fenced chunks (`116 LESSON`, `13 COMMON_MISTAKE`, `40 EXAMPLE`). |

---

## 2. Entity-Relationship (ER) Domain Map

```text
[1. IDENTITY & AUTH]                 [2. VERSIONED CURRICULUM]                [9. HYBRID RAG (PGVECTOR)]
  users (User)                         courses (Course)                         course_embeddings
   ├── sessions (Session)               └── course_versions (CourseVersion)      ├── chapter_id -> chapters
   ├── accounts (Account)                    └── modules (Module) [10]           ├── section_id -> lesson_sections
   ├── verifications (Verification)               └── chapters (Chapter) [29]    └── concept_id -> concepts
   └── daily_activities (DailyActivity)                ├── lesson_sections [126]
                                                       ├── questions (Question)
                                                       └── concepts (Concept)
                                                            └── rubrics (Rubric)
                                                                 └── rubric_criteria [66]
                                                                      └── rubric_criterion_skill_map
                                                                           └── skill_dimensions [8]

[3. ENROLLMENT & 10. PROGRESSION STATE MACHINE]
  enrollments (Enrollment: userId x courseVersionId)
   ├── module_progress (ModuleProgress: LOCKED -> UNLOCKED -> IN_PROGRESS -> COMPLETED)
   ├── chapter_progress (ChapterProgress: LOCKED -> UNLOCKED -> IN_PROGRESS -> AWAITING_CHECKPOINT -> COMPLETED)
   ├── section_progress (SectionProgress: S1..S5 turnsCompleted & rubricPassRatio)
   ├── rubric_criterion_masteries (RubricCriterionMastery: per-criterion BKT & misconception counter)
   └── learner_skill_profiles (LearnerSkillProfile: 8 dimensions -> STRENGTH | DEVELOPING | WEAKPOINT)

[4. SOCRATIC SESSIONS]               [5. BKT MASTERY LEDGER]                  [6. ASSESSMENTS & VIVA]
  learning_sessions                    concept_masteries (pMastery P(L_t))      assessment_attempts
   ├── chat_messages                    └── mastery_evidences                    ├── assessment_answers
   └── topic_drift_events                    (DIALOGUE_PROBE | CHAPTER |         │    └── rubric_evaluations
                                              PRACTICAL_TASK | VIVA)             ├── practical_submissions
                                                                                 └── viva_defense_turns

[7. VERIFIABLE CREDENTIALS]          [8. VAULT & AUDIT LOGS]
  certificates (Ed25519 signed)        storage_artifacts (Cloudflare R2 metadata)
  signing_key_registry (Public keys)   email_logs (Idempotent transactional email audit)
```

---

## 3. Complete 37-Table Data Dictionary by Domain

### Domain 1: Identity & Better Auth (`4 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `User` | `id` (PK), `email` (UNIQUE), `fullName`, `role` (`STUDENT`\|`INSTRUCTOR`\|`ADMIN`), `emailVerified`, `dob`, `persona`, `primaryGoal`, `image`, `onboardingCompleted` | Core learner and administrator identity profile. |
| `sessions` | `Session` | `id` (PK), `userId` (FK → `users`), `token` (UNIQUE), `expiresAt`, `ipAddress`, `userAgent` | Active 7-day rolling Better Auth sessions. |
| `accounts` | `Account` | `id` (PK), `userId` (FK → `users`), `providerId`, `accountId`, `password` (scrypt/argon2 hash), `accessToken` | Credential and OAuth (`google`) provider bindings (`UNIQUE(providerId, accountId)`). |
| `verifications` | `Verification` | `id` (PK), `identifier` (email or `reset:<email>`), `value` (JSON with 6-digit OTP, attempts counter, pre-user registration payload), `expiresAt` | Pre-registration OTP gate and password reset OTP state with 5-attempt lockout. |

### Domain 2: Versioned Curriculum Hierarchy (`9 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `courses` | `Course` | `id` (PK), `slug` (UNIQUE, e.g., `python-fundamentals`), `title`, `level`, `durationHours`, `status` | Top-level qualification track metadata. |
| `course_versions` | `CourseVersion` | `id` (PK), `courseId` (FK), `versionNumber` (`1.0.0`), `isActive` | Immutable syllabus versioning so credentials remain tied to exact curriculum versions. |
| `modules` | `Module` | `id` (PK), `courseVersionId` (FK), `slug`, `title`, `sequenceOrder` (`1..10`), `prerequisiteModuleId`, `practicalTaskId`, `minMasteryThreshold` (`0.70`) | The 10 sequential modules of the Python Fundamentals track. |
| `chapters` | `Chapter` | `id` (PK), `moduleId` (FK), `title`, `sequenceOrder`, `teachingContent`, `estimatedMins` | The 29 pedagogical lessons across the 10 modules. |
| `lesson_sections` | `LessonSection` | `id` (PK), `chapterId` (FK), `sectionType` (`CONCEPT_INTUITION`, `TECHNICAL_MECHANICS`, `PITFALLS_AND_DEBUGGING`, `CHAPTER_CHECKPOINT`, `MODULE_PRACTICAL`), `sequenceOrder` (`1..5`), `objective`, `content`, `minTurns` | 126 fine-grained pedagogical slices controlling the Learning Studio stepper (`S1`–`S5`). |
| `concepts` | `Concept` | `id` (PK), `chapterId` (FK), `slug`, `name`, `description`, `defaultP0` (`0.1500`) | Atomic knowledge units tracked by Bayesian Knowledge Tracing (`UNIQUE(chapterId, slug)`). |
| `rubrics` | `Rubric` | `id` (PK), `conceptId` (FK), `title` | Evaluation container grouping rubric criteria for a concept. |
| `rubric_criteria` | `RubricCriterion` | `id` (PK), `rubricId` (FK), `criterionCode` (`M01-C01-R01`), `criterionStatement`, `weight`, `tierRequired`, `cognitiveLevel` (`RECALL`\|`EXPLAIN`\|`APPLY`\|`DEBUG`\|`REASON`), `passingThreshold` (`0.70`), `expectedConceptsJson`, `misconceptionsJson` | 66 explicit, machine-evaluable competency criteria with misconception pattern detectors. |
| `questions` | `Question` | `id` (PK), `chapterId` (FK), `conceptId` (FK), `questionType`, `prompt`, `tier`, `options` | Assessment bank items for chapter checkpoints, diagnostics, and Viva defense prompts. |

### Domain 3: Learner Enrollments & Habit Telemetry (`2 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `enrollments` | `Enrollment` | `id` (PK), `userId` (FK), `courseVersionId` (FK), `currentChapterId` (FK), `status` (`ACTIVE`\|`COMPLETED`\|`REMEDIATING`), `currentTier` (`EASY`\|`MEDIUM`\|`HARD`) | Binds a learner to an active course version (`UNIQUE(userId, courseVersionId)`). |
| `daily_activities` | `DailyActivity` | `id` (PK), `userId` (FK), `activityDate`, `minutesSpent`, `messagesCount`, `probesAnswered` | Tracks daily engagement for the 16-week contribution heatmap and streak counters. |

### Domain 4: Socratic AI Learning Studio & Sessions (`2 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `learning_sessions` | `LearningSession` | `id` (PK), `enrollmentId` (FK), `chapterId` (FK), `currentSectionId`, `activeConceptId`, `turnCount`, `phase` (`TEACHING`\|`CHECKING`\|`REMEDIATING`\|`COMPLETED`), `isActive` | Stateful Socratic tutoring session for a specific chapter. |
| `chat_messages` | `ChatMessage` | `id` (PK), `sessionId` (FK), `sender` (`USER`\|`AI_TUTOR`\|`SYSTEM`), `role`, `content`, `metadata` (JSON latency, model, progression notice) | Full chronological transcript of every Socratic dialogue turn. |

### Domain 5: Deterministic Mastery & Bayesian Knowledge Tracing (`2 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `concept_masteries` | `ConceptMastery` | `id` (PK), `enrollmentId` (FK), `conceptId` (FK), `pMastery` ($P(L_t) \in [0.01, 0.99]$), `confidence`, `state` (`UNENCOUNTERED`\|`LEARNING`\|`NEEDS_REMEDIATION`\|`MASTERED`\|`ADVANCED`), `remediationCycles` | Stores live Bayesian posterior mastery probability per learner and concept. |
| `mastery_evidences` | `MasteryEvidence` | `id` (PK), `conceptMasteryId` (FK), `rubricCriterionId` (FK), `sectionId`, `evidenceType` (`DIALOGUE_PROBE`\|`CHAPTER_ASSESSMENT`\|`PRACTICAL_TASK`\|`VIVA`), `isDemonstrated`, `score`, `confidence`, `misconceptionTag`, `evidenceQuote`, `evaluatorReasoning` | Immutable audit log of every positive or negative mastery observation and verbatim student quote. |

### Domain 6: Assessments, Practical Tasks & Viva Defense (`5 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `assessment_attempts` | `AssessmentAttempt` | `id` (PK), `enrollmentId` (FK), `assessmentType` (`DIAGNOSTIC`\|`CHAPTER`\|`PRACTICAL`\|`VIVA`), `targetId`, `status`, `score` | Tracks each chapter checkpoint, module practical, or final Viva attempt. |
| `assessment_answers` | `AssessmentAnswer` | `id` (PK), `attemptId` (FK), `questionId` (FK), `studentAnswer`, `score` | Stores the learner's response to individual checkpoint questions. |
| `rubric_evaluations` | `RubricEvaluation` | `id` (PK), `answerId` (FK), `rubricCriterionId` (FK), `isDemonstrated`, `confidence`, `evidenceQuote`, `reasoning` | Links an assessment answer to specific rubric criteria verdicts. |
| `practical_submissions` | `PracticalSubmission` | `id` (PK), `attemptId` (FK), `taskId`, `submittedCode`, `testsRun`, `testsPassed`, `testResults` (JSON), `score`, `passed`, `executionTimeMs` | Stores submitted Python code and unit-test harness execution results for `MODULE_PRACTICAL`. |
| `viva_defense_turns` | `VivaDefenseTurn` | `id` (PK), `attemptId` (FK), `turnNumber` (`1..3`), `questionPrompt`, `studentAnswer`, `turnScore`, `isDemonstrated`, `feedback`, `followUpProbe` | Records the 3-turn oral Viva Voce architectural defense (`UNIQUE(attemptId, turnNumber)`). |

### Domain 7: Verifiable Credentials & Cryptographic Ledger (`2 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `certificates` | `Certificate` | `id` (PK), `credentialId` (UNIQUE, e.g., `CERT-2026-PY-XXXXX`), `enrollmentId` (UNIQUE FK), `tier` (`FOUNDATION`\|`PROFICIENT`\|`ADVANCED`), `compositeScore`, `evidenceSummary` (canonical JSON), `signatureHash` (Ed25519 hex), `keyId`, `status` (`VALID`\|`REVOKED`) | Publicly verifiable qualification certificate signed with Ed25519. |
| `signing_key_registry` | `SigningKeyRegistry` | `id` (PK), `keyId` (UNIQUE, `certify-2026-key-1`), `algorithm` (`Ed25519`), `publicKeyPem`, `keyFingerprint`, `status` (`ACTIVE`\|`HISTORICAL`\|`REVOKED`) | Public key ledger enabling third-party cryptographic verification and key rotation. |

### Domain 8: Private Cloudflare R2 Vault & Email Audit Logs (`2 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `storage_artifacts` | `StorageArtifact` | `id` (PK), `storageKey` (UNIQUE), `enrollmentId` (FK), `userId` (FK), `fileSize`, `mimeType`, `checksum` | Relational metadata and ownership tracking for private R2 object storage artifacts. |
| `email_logs` | `EmailLog` | `id` (PK), `recipient`, `template`, `idempotencyKey` (UNIQUE), `status` (`SENT`\|`FAILED`\|`DUPLICATE`), `errorDetails` | Audit trail and idempotency lock for all outgoing transactional emails. |

### Domain 9: Hybrid RAG Knowledge Base (`1 table`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `course_embeddings` | `CourseEmbedding` | `id` (PK), `chapter_id` (FK), `section_id` (FK), `concept_id` (FK), `module_slug`, `module_order`, `chunk_type` (`LESSON`\|`COMMON_MISTAKE`\|`EXAMPLE`), `embedding_model` (`gemini-embedding-001`), `content`, `embedding` (`vector(1536)`), `fts` (`tsvector`) | Stores the 169 section-fenced curriculum chunks with HNSW cosine and GIN FTS indexes. |

### Domain 10: Progression State Machine & Skill Analytics (`8 tables`)

| Table Name (`@@map`) | Prisma Model | Key Columns & Constraints | Purpose |
| :--- | :--- | :--- | :--- |
| `module_progress` | `ModuleProgress` | `id` (PK), `enrollmentId` (FK), `moduleId` (FK), `status` (`LOCKED`\|`UNLOCKED`\|`IN_PROGRESS`\|`COMPLETED`), `chaptersCompleted`, `totalChapters`, `practicalPassed`, `practicalScore`, `moduleRubricScore` | Enforces sequential module unlocking and module practical gates (`UNIQUE(enrollmentId, moduleId)`). |
| `chapter_progress` | `ChapterProgress` | `id` (PK), `enrollmentId` (FK), `chapterId` (FK), `status` (`LOCKED`\|`UNLOCKED`\|`IN_PROGRESS`\|`AWAITING_CHECKPOINT`\|`REMEDIATING`\|`COMPLETED`), `currentSectionOrder`, `checkpointScore`, `checkpointAttempts`, `remediationCycles` | Enforces sequential chapter unlocking and checkpoint pass gates (`UNIQUE(enrollmentId, chapterId)`). |
| `section_progress` | `SectionProgress` | `id` (PK), `enrollmentId` (FK), `sectionId` (FK), `status` (`LOCKED`\|`UNLOCKED`\|`IN_PROGRESS`\|`COMPLETED`), `turnsCompleted`, `rubricPassRatio` | Tracks completion of each chapter's `S1`–`S5` lesson sections (`UNIQUE(enrollmentId, sectionId)`). |
| `rubric_criterion_masteries` | `RubricCriterionMastery` | `id` (PK), `enrollmentId` (FK), `rubricCriterionId` (FK), `status` (`NOT_STARTED`\|`ATTEMPTED`\|`PARTIAL`\|`DEMONSTRATED`\|`MASTERED`), `pCriterion`, `bestScore`, `demonstratedCount`, `misconceptionCount`, `lastMisconception`, `lastEvidenceQuote` | Criterion-level mastery tracking and misconception counter (`UNIQUE(enrollmentId, rubricCriterionId)`). |
| `skill_dimensions` | `SkillDimension` | `id` (PK), `courseSlug`, `slug`, `name`, `description`, `displayOrder` | Defines the 8 canonical engineering skill dimensions for the Python track. |
| `rubric_criterion_skill_map` | `RubricCriterionSkillMap` | `id` (PK), `rubricCriterionId` (FK), `skillDimensionId` (FK), `contributionWeight` | Many-to-many weighted mapping between the 66 rubric criteria and 8 skill dimensions. |
| `learner_skill_profiles` | `LearnerSkillProfile` | `id` (PK), `enrollmentId` (FK), `skillDimensionId` (FK), `compositeScore`, `rubricPassRate`, `bktMeanMastery`, `practicalScore`, `classification` (`UNASSESSED`\|`WEAKPOINT`\|`DEVELOPING`\|`STRENGTH`), `weakestCriteriaJson` | Precomputed per-dimension analytics profile powering the learner Skills Report & Weakpoints UI. |
| `topic_drift_events` | `TopicDriftEvent` | `id` (PK), `sessionId` (FK), `enrollmentId` (FK), `activeChapterId`, `activeSectionId`, `driftType` (`FUTURE_TOPIC`\|`SKIP_ATTEMPT`\|`OFF_TOPIC`), `detectedTargetSlug`, `learnerMessage` | Telemetry table recording intercepted attempts to skip ahead or drift off-curriculum. |
