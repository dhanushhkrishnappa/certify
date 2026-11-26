-- ==============================================================================
-- CERTIFY PLATFORM v3.0.0 — COMPLETE NEON SERVERLESS POSTGRESQL DDL SCHEMA
-- ==============================================================================
-- Matches backend/prisma/schema.prisma across all 37 tables, indexes, and FKs.
-- Includes pgvector (1536-dim HNSW cosine index) and tsvector (GIN index).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS vector;

-- 1. IDENTITY & BETTER AUTH DOMAIN
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "fullName" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "bio" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "language" TEXT DEFAULT 'en',
    "dob" TEXT,
    "persona" TEXT,
    "primaryGoal" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- 2. VERSIONED CURRICULUM HIERARCHY
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'BEGINNER',
    "category" TEXT NOT NULL DEFAULT 'Software Engineering',
    "durationHours" INTEGER NOT NULL DEFAULT 20,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_versions" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL DEFAULT '1.0.0',
    "changelog" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "courseVersionId" TEXT NOT NULL,
    "slug" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sequenceOrder" INTEGER NOT NULL,
    "prerequisiteModuleId" TEXT,
    "practicalTaskId" TEXT,
    "minMasteryThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.70,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "teachingContent" TEXT NOT NULL,
    "estimatedMins" INTEGER NOT NULL DEFAULT 45,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lesson_sections" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "minTurns" INTEGER NOT NULL DEFAULT 1,
    "requiredForAdvance" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_sections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "concepts" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sequenceOrder" INTEGER NOT NULL,
    "defaultP0" DOUBLE PRECISION NOT NULL DEFAULT 0.1500,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rubrics" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rubric_criteria" (
    "id" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "criterionCode" TEXT,
    "criterionStatement" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tierRequired" TEXT NOT NULL DEFAULT 'EASY',
    "cognitiveLevel" TEXT NOT NULL DEFAULT 'EXPLAIN',
    "passingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.70,
    "expectedConceptsJson" TEXT,
    "misconceptionsJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "conceptId" TEXT,
    "questionType" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'EASY',
    "parameters" TEXT,
    "options" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- 3. LEARNER ENROLLMENTS & HABIT TELEMETRY
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseVersionId" TEXT NOT NULL,
    "currentChapterId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "currentTier" TEXT NOT NULL DEFAULT 'EASY',
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "daily_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "minutesSpent" INTEGER NOT NULL DEFAULT 0,
    "messagesCount" INTEGER NOT NULL DEFAULT 0,
    "probesAnswered" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_activities_pkey" PRIMARY KEY ("id")
);

-- 4. SOCRATIC AI LEARNING STUDIO & CONVERSATIONAL SESSIONS
CREATE TABLE "learning_sessions" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "currentSectionId" TEXT,
    "activeConceptId" TEXT,
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT NOT NULL DEFAULT 'TEACHING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- 5. DETERMINISTIC MASTERY & BAYESIAN KNOWLEDGE TRACING (BKT)
CREATE TABLE "concept_masteries" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "pMastery" DOUBLE PRECISION NOT NULL DEFAULT 0.1500,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.2000,
    "state" TEXT NOT NULL DEFAULT 'UNENCOUNTERED',
    "remediationCycles" INTEGER NOT NULL DEFAULT 0,
    "lastAssessedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concept_masteries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mastery_evidences" (
    "id" TEXT NOT NULL,
    "conceptMasteryId" TEXT NOT NULL,
    "rubricCriterionId" TEXT,
    "sectionId" TEXT,
    "evidenceType" TEXT NOT NULL,
    "isDemonstrated" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "misconceptionTag" TEXT,
    "evidenceQuote" TEXT,
    "evaluatorReasoning" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mastery_evidences_pkey" PRIMARY KEY ("id")
);

-- 6. ASSESSMENTS, PRACTICAL TASKS & ORAL VIVA DEFENSE
CREATE TABLE "assessment_attempts" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "assessmentType" TEXT NOT NULL,
    "targetId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "assessment_attempts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assessment_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "studentAnswer" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_answers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rubric_evaluations" (
    "id" TEXT NOT NULL,
    "answerId" TEXT NOT NULL,
    "rubricCriterionId" TEXT NOT NULL,
    "isDemonstrated" BOOLEAN NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "evidenceQuote" TEXT,
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubric_evaluations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "practical_submissions" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "submittedCode" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'python',
    "testsRun" INTEGER NOT NULL DEFAULT 0,
    "testsPassed" INTEGER NOT NULL DEFAULT 0,
    "testResults" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "executionTimeMs" INTEGER NOT NULL DEFAULT 0,
    "outputLog" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practical_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "viva_defense_turns" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "questionPrompt" TEXT NOT NULL,
    "studentAnswer" TEXT NOT NULL,
    "turnScore" DOUBLE PRECISION NOT NULL,
    "isDemonstrated" BOOLEAN NOT NULL,
    "feedback" TEXT NOT NULL,
    "followUpProbe" TEXT,
    "modelUsed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "viva_defense_turns_pkey" PRIMARY KEY ("id")
);

-- 7. DETERMINISTIC VERIFIABLE CREDENTIALS & PUBLIC CRYPTOGRAPHIC LEDGER
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL,
    "evidenceSummary" TEXT NOT NULL,
    "signatureHash" TEXT NOT NULL,
    "keyId" TEXT NOT NULL DEFAULT 'certify-2026-key-1',
    "status" TEXT NOT NULL DEFAULT 'VALID',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revocationReason" TEXT,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "signing_key_registry" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'Ed25519',
    "publicKeyPem" TEXT NOT NULL,
    "keyFingerprint" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "signing_key_registry_pkey" PRIMARY KEY ("id")
);

-- 8. PRIVATE CLOUDFLARE R2 VAULT & AUDITABLE TRANSACTIONAL LOGS
CREATE TABLE "storage_artifacts" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "checksum" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storage_artifacts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "errorDetails" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- 9. RAG KNOWLEDGE BASE DOMAIN (PGVECTOR)
CREATE TABLE "course_embeddings" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT,
    "section_id" TEXT,
    "concept_id" TEXT,
    "module_slug" TEXT NOT NULL,
    "module_order" INTEGER NOT NULL DEFAULT 1,
    "chunk_type" TEXT NOT NULL,
    "embedding_model" TEXT NOT NULL DEFAULT 'gemini-embedding-001',
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "fts" tsvector GENERATED ALWAYS AS (to_tsvector('english', "content")) STORED,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_embeddings_pkey" PRIMARY KEY ("id")
);

-- 10. BACKEND-AUTHORITATIVE PROGRESSION STATE MACHINE & SKILL ANALYTICS
CREATE TABLE "module_progress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "chaptersCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalChapters" INTEGER NOT NULL DEFAULT 0,
    "practicalPassed" BOOLEAN NOT NULL DEFAULT false,
    "practicalScore" DOUBLE PRECISION,
    "moduleRubricScore" DOUBLE PRECISION,
    "unlockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "chapter_progress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "currentSectionOrder" INTEGER NOT NULL DEFAULT 1,
    "checkpointScore" DOUBLE PRECISION,
    "checkpointAttempts" INTEGER NOT NULL DEFAULT 0,
    "remediationCycles" INTEGER NOT NULL DEFAULT 0,
    "unlockedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapter_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "section_progress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "turnsCompleted" INTEGER NOT NULL DEFAULT 0,
    "rubricPassRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rubric_criterion_masteries" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "rubricCriterionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "pCriterion" DOUBLE PRECISION NOT NULL DEFAULT 0.1500,
    "bestScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "latestScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "demonstratedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "misconceptionCount" INTEGER NOT NULL DEFAULT 0,
    "lastMisconception" TEXT,
    "lastEvidenceQuote" TEXT,
    "lastEvaluatedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rubric_criterion_masteries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "skill_dimensions" (
    "id" TEXT NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "skill_dimensions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rubric_criterion_skill_map" (
    "id" TEXT NOT NULL,
    "rubricCriterionId" TEXT NOT NULL,
    "skillDimensionId" TEXT NOT NULL,
    "contributionWeight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "rubric_criterion_skill_map_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learner_skill_profiles" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "skillDimensionId" TEXT NOT NULL,
    "compositeScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "rubricPassRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "bktMeanMastery" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "practicalScore" DOUBLE PRECISION,
    "criteriaEvaluated" INTEGER NOT NULL DEFAULT 0,
    "criteriaTotal" INTEGER NOT NULL DEFAULT 0,
    "misconceptionCount" INTEGER NOT NULL DEFAULT 0,
    "classification" TEXT NOT NULL DEFAULT 'UNASSESSED',
    "weakestCriteriaJson" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learner_skill_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "topic_drift_events" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "activeChapterId" TEXT NOT NULL,
    "activeSectionId" TEXT,
    "driftType" TEXT NOT NULL,
    "detectedTargetSlug" TEXT,
    "learnerMessage" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_drift_events_pkey" PRIMARY KEY ("id")
);

-- ==============================================================================
-- INDEXES & UNIQUE CONSTRAINTS
-- ==============================================================================
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");

CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");

CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");
CREATE INDEX "courses_slug_idx" ON "courses"("slug");
CREATE INDEX "courses_status_idx" ON "courses"("status");

CREATE INDEX "course_versions_courseId_idx" ON "course_versions"("courseId");
CREATE INDEX "course_versions_isActive_idx" ON "course_versions"("isActive");
CREATE UNIQUE INDEX "course_versions_courseId_versionNumber_key" ON "course_versions"("courseId", "versionNumber");

CREATE INDEX "modules_courseVersionId_idx" ON "modules"("courseVersionId");
CREATE INDEX "modules_courseVersionId_sequenceOrder_idx" ON "modules"("courseVersionId", "sequenceOrder");
CREATE INDEX "modules_courseVersionId_slug_idx" ON "modules"("courseVersionId", "slug");

CREATE INDEX "chapters_moduleId_idx" ON "chapters"("moduleId");
CREATE INDEX "chapters_moduleId_sequenceOrder_idx" ON "chapters"("moduleId", "sequenceOrder");

CREATE UNIQUE INDEX "lesson_sections_chapterId_sequenceOrder_key" ON "lesson_sections"("chapterId", "sequenceOrder");
CREATE INDEX "lesson_sections_chapterId_idx" ON "lesson_sections"("chapterId");

CREATE INDEX "concepts_chapterId_idx" ON "concepts"("chapterId");
CREATE UNIQUE INDEX "concepts_chapterId_slug_key" ON "concepts"("chapterId", "slug");

CREATE INDEX "rubrics_conceptId_idx" ON "rubrics"("conceptId");

CREATE INDEX "rubric_criteria_rubricId_idx" ON "rubric_criteria"("rubricId");
CREATE INDEX "rubric_criteria_cognitiveLevel_idx" ON "rubric_criteria"("cognitiveLevel");

CREATE INDEX "questions_chapterId_idx" ON "questions"("chapterId");
CREATE INDEX "questions_conceptId_idx" ON "questions"("conceptId");
CREATE INDEX "questions_chapterId_questionType_idx" ON "questions"("chapterId", "questionType");

CREATE INDEX "enrollments_userId_idx" ON "enrollments"("userId");
CREATE INDEX "enrollments_courseVersionId_idx" ON "enrollments"("courseVersionId");
CREATE INDEX "enrollments_currentChapterId_idx" ON "enrollments"("currentChapterId");
CREATE INDEX "enrollments_status_idx" ON "enrollments"("status");
CREATE UNIQUE INDEX "enrollments_userId_courseVersionId_key" ON "enrollments"("userId", "courseVersionId");

CREATE INDEX "daily_activities_userId_idx" ON "daily_activities"("userId");
CREATE UNIQUE INDEX "daily_activities_userId_activityDate_key" ON "daily_activities"("userId", "activityDate");

CREATE INDEX "learning_sessions_enrollmentId_idx" ON "learning_sessions"("enrollmentId");
CREATE INDEX "learning_sessions_chapterId_idx" ON "learning_sessions"("chapterId");
CREATE INDEX "learning_sessions_enrollmentId_isActive_idx" ON "learning_sessions"("enrollmentId", "isActive");

CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");
CREATE INDEX "chat_messages_sessionId_createdAt_idx" ON "chat_messages"("sessionId", "createdAt");

CREATE INDEX "concept_masteries_enrollmentId_idx" ON "concept_masteries"("enrollmentId");
CREATE INDEX "concept_masteries_conceptId_idx" ON "concept_masteries"("conceptId");
CREATE INDEX "concept_masteries_state_idx" ON "concept_masteries"("state");
CREATE UNIQUE INDEX "concept_masteries_enrollmentId_conceptId_key" ON "concept_masteries"("enrollmentId", "conceptId");

CREATE INDEX "mastery_evidences_conceptMasteryId_idx" ON "mastery_evidences"("conceptMasteryId");
CREATE INDEX "mastery_evidences_rubricCriterionId_idx" ON "mastery_evidences"("rubricCriterionId");
CREATE INDEX "mastery_evidences_evidenceType_idx" ON "mastery_evidences"("evidenceType");

CREATE INDEX "assessment_attempts_enrollmentId_idx" ON "assessment_attempts"("enrollmentId");
CREATE INDEX "assessment_attempts_enrollmentId_assessmentType_idx" ON "assessment_attempts"("enrollmentId", "assessmentType");

CREATE INDEX "assessment_answers_attemptId_idx" ON "assessment_answers"("attemptId");
CREATE INDEX "assessment_answers_questionId_idx" ON "assessment_answers"("questionId");

CREATE INDEX "rubric_evaluations_answerId_idx" ON "rubric_evaluations"("answerId");
CREATE INDEX "rubric_evaluations_rubricCriterionId_idx" ON "rubric_evaluations"("rubricCriterionId");

CREATE INDEX "practical_submissions_attemptId_idx" ON "practical_submissions"("attemptId");

CREATE INDEX "viva_defense_turns_attemptId_idx" ON "viva_defense_turns"("attemptId");
CREATE UNIQUE INDEX "viva_defense_turns_attemptId_turnNumber_key" ON "viva_defense_turns"("attemptId", "turnNumber");

CREATE UNIQUE INDEX "certificates_credentialId_key" ON "certificates"("credentialId");
CREATE UNIQUE INDEX "certificates_enrollmentId_key" ON "certificates"("enrollmentId");
CREATE INDEX "certificates_credentialId_idx" ON "certificates"("credentialId");
CREATE INDEX "certificates_status_idx" ON "certificates"("status");
CREATE INDEX "certificates_tier_idx" ON "certificates"("tier");

CREATE UNIQUE INDEX "signing_key_registry_keyId_key" ON "signing_key_registry"("keyId");
CREATE INDEX "signing_key_registry_keyId_idx" ON "signing_key_registry"("keyId");
CREATE INDEX "signing_key_registry_status_idx" ON "signing_key_registry"("status");

CREATE UNIQUE INDEX "storage_artifacts_storageKey_key" ON "storage_artifacts"("storageKey");
CREATE INDEX "storage_artifacts_enrollmentId_idx" ON "storage_artifacts"("enrollmentId");
CREATE INDEX "storage_artifacts_userId_idx" ON "storage_artifacts"("userId");

CREATE UNIQUE INDEX "email_logs_idempotencyKey_key" ON "email_logs"("idempotencyKey");
CREATE INDEX "email_logs_recipient_idx" ON "email_logs"("recipient");
CREATE INDEX "email_logs_idempotencyKey_idx" ON "email_logs"("idempotencyKey");

CREATE INDEX "course_embeddings_embedding_hnsw_idx" ON "course_embeddings" USING hnsw ("embedding" vector_cosine_ops);
CREATE INDEX "course_embeddings_fts_gin_idx" ON "course_embeddings" USING gin ("fts");
CREATE INDEX "course_embeddings_chapter_id_idx" ON "course_embeddings"("chapter_id");
CREATE INDEX "course_embeddings_section_id_idx" ON "course_embeddings"("section_id");
CREATE INDEX "course_embeddings_concept_id_idx" ON "course_embeddings"("concept_id");
CREATE INDEX "course_embeddings_module_slug_idx" ON "course_embeddings"("module_slug");
CREATE INDEX "course_embeddings_module_slug_module_order_idx" ON "course_embeddings"("module_slug", "module_order");
CREATE INDEX "course_embeddings_chunk_type_idx" ON "course_embeddings"("chunk_type");

CREATE UNIQUE INDEX "module_progress_enrollmentId_moduleId_key" ON "module_progress"("enrollmentId", "moduleId");
CREATE INDEX "module_progress_enrollmentId_status_idx" ON "module_progress"("enrollmentId", "status");

CREATE UNIQUE INDEX "chapter_progress_enrollmentId_chapterId_key" ON "chapter_progress"("enrollmentId", "chapterId");
CREATE INDEX "chapter_progress_enrollmentId_status_idx" ON "chapter_progress"("enrollmentId", "status");

CREATE UNIQUE INDEX "section_progress_enrollmentId_sectionId_key" ON "section_progress"("enrollmentId", "sectionId");
CREATE INDEX "section_progress_enrollmentId_status_idx" ON "section_progress"("enrollmentId", "status");

CREATE UNIQUE INDEX "rubric_criterion_masteries_enrollmentId_rubricCriterionId_key" ON "rubric_criterion_masteries"("enrollmentId", "rubricCriterionId");
CREATE INDEX "rubric_criterion_masteries_enrollmentId_status_idx" ON "rubric_criterion_masteries"("enrollmentId", "status");
CREATE INDEX "rubric_criterion_masteries_rubricCriterionId_idx" ON "rubric_criterion_masteries"("rubricCriterionId");

CREATE UNIQUE INDEX "skill_dimensions_courseSlug_slug_key" ON "skill_dimensions"("courseSlug", "slug");

CREATE UNIQUE INDEX "rubric_criterion_skill_map_rubricCriterionId_skillDimensionId_key" ON "rubric_criterion_skill_map"("rubricCriterionId", "skillDimensionId");
CREATE INDEX "rubric_criterion_skill_map_skillDimensionId_idx" ON "rubric_criterion_skill_map"("skillDimensionId");

CREATE UNIQUE INDEX "learner_skill_profiles_enrollmentId_skillDimensionId_key" ON "learner_skill_profiles"("enrollmentId", "skillDimensionId");
CREATE INDEX "learner_skill_profiles_enrollmentId_classification_idx" ON "learner_skill_profiles"("enrollmentId", "classification");

CREATE INDEX "topic_drift_events_enrollmentId_idx" ON "topic_drift_events"("enrollmentId");
CREATE INDEX "topic_drift_events_sessionId_idx" ON "topic_drift_events"("sessionId");

-- ==============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ==============================================================================
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_versions" ADD CONSTRAINT "course_versions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "modules" ADD CONSTRAINT "modules_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "course_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lesson_sections" ADD CONSTRAINT "lesson_sections_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "questions" ADD CONSTRAINT "questions_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "course_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_currentChapterId_fkey" FOREIGN KEY ("currentChapterId") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "concept_masteries" ADD CONSTRAINT "concept_masteries_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "concept_masteries" ADD CONSTRAINT "concept_masteries_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mastery_evidences" ADD CONSTRAINT "mastery_evidences_conceptMasteryId_fkey" FOREIGN KEY ("conceptMasteryId") REFERENCES "concept_masteries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mastery_evidences" ADD CONSTRAINT "mastery_evidences_rubricCriterionId_fkey" FOREIGN KEY ("rubricCriterionId") REFERENCES "rubric_criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_evaluations" ADD CONSTRAINT "rubric_evaluations_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "assessment_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_evaluations" ADD CONSTRAINT "rubric_evaluations_rubricCriterionId_fkey" FOREIGN KEY ("rubricCriterionId") REFERENCES "rubric_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "practical_submissions" ADD CONSTRAINT "practical_submissions_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "viva_defense_turns" ADD CONSTRAINT "viva_defense_turns_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "storage_artifacts" ADD CONSTRAINT "storage_artifacts_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "storage_artifacts" ADD CONSTRAINT "storage_artifacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_embeddings" ADD CONSTRAINT "course_embeddings_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "course_embeddings" ADD CONSTRAINT "course_embeddings_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "lesson_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "course_embeddings" ADD CONSTRAINT "course_embeddings_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "module_progress" ADD CONSTRAINT "module_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "module_progress" ADD CONSTRAINT "module_progress_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chapter_progress" ADD CONSTRAINT "chapter_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chapter_progress" ADD CONSTRAINT "chapter_progress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "section_progress" ADD CONSTRAINT "section_progress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "section_progress" ADD CONSTRAINT "section_progress_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "lesson_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_criterion_masteries" ADD CONSTRAINT "rubric_criterion_masteries_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_criterion_masteries" ADD CONSTRAINT "rubric_criterion_masteries_rubricCriterionId_fkey" FOREIGN KEY ("rubricCriterionId") REFERENCES "rubric_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_criterion_skill_map" ADD CONSTRAINT "rubric_criterion_skill_map_rubricCriterionId_fkey" FOREIGN KEY ("rubricCriterionId") REFERENCES "rubric_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rubric_criterion_skill_map" ADD CONSTRAINT "rubric_criterion_skill_map_skillDimensionId_fkey" FOREIGN KEY ("skillDimensionId") REFERENCES "skill_dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learner_skill_profiles" ADD CONSTRAINT "learner_skill_profiles_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learner_skill_profiles" ADD CONSTRAINT "learner_skill_profiles_skillDimensionId_fkey" FOREIGN KEY ("skillDimensionId") REFERENCES "skill_dimensions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_drift_events" ADD CONSTRAINT "topic_drift_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "topic_drift_events" ADD CONSTRAINT "topic_drift_events_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
