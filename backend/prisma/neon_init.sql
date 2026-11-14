-- CreateTable
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
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "course_versions" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL DEFAULT '1.0.0',
    "changelog" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "courseVersionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sequenceOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "rubrics" (
    "id" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rubric_criteria" (
    "id" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "criterionStatement" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "tierRequired" TEXT NOT NULL DEFAULT 'EASY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubric_criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "learning_sessions" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "phase" TEXT NOT NULL DEFAULT 'TEACHING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
CREATE TABLE "mastery_evidences" (
    "id" TEXT NOT NULL,
    "conceptMasteryId" TEXT NOT NULL,
    "rubricCriterionId" TEXT,
    "evidenceType" TEXT NOT NULL,
    "isDemonstrated" BOOLEAN NOT NULL,
    "evidenceQuote" TEXT,
    "evaluatorReasoning" TEXT,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mastery_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
CREATE TABLE "assessment_answers" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "studentAnswer" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assessment_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_slug_idx" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "courses"("status");

-- CreateIndex
CREATE INDEX "course_versions_courseId_idx" ON "course_versions"("courseId");

-- CreateIndex
CREATE INDEX "course_versions_isActive_idx" ON "course_versions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "course_versions_courseId_versionNumber_key" ON "course_versions"("courseId", "versionNumber");

-- CreateIndex
CREATE INDEX "modules_courseVersionId_idx" ON "modules"("courseVersionId");

-- CreateIndex
CREATE INDEX "modules_courseVersionId_sequenceOrder_idx" ON "modules"("courseVersionId", "sequenceOrder");

-- CreateIndex
CREATE INDEX "chapters_moduleId_idx" ON "chapters"("moduleId");

-- CreateIndex
CREATE INDEX "chapters_moduleId_sequenceOrder_idx" ON "chapters"("moduleId", "sequenceOrder");

-- CreateIndex
CREATE INDEX "concepts_chapterId_idx" ON "concepts"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "concepts_chapterId_slug_key" ON "concepts"("chapterId", "slug");

-- CreateIndex
CREATE INDEX "rubrics_conceptId_idx" ON "rubrics"("conceptId");

-- CreateIndex
CREATE INDEX "rubric_criteria_rubricId_idx" ON "rubric_criteria"("rubricId");

-- CreateIndex
CREATE INDEX "questions_chapterId_idx" ON "questions"("chapterId");

-- CreateIndex
CREATE INDEX "questions_conceptId_idx" ON "questions"("conceptId");

-- CreateIndex
CREATE INDEX "questions_chapterId_questionType_idx" ON "questions"("chapterId", "questionType");

-- CreateIndex
CREATE INDEX "enrollments_userId_idx" ON "enrollments"("userId");

-- CreateIndex
CREATE INDEX "enrollments_courseVersionId_idx" ON "enrollments"("courseVersionId");

-- CreateIndex
CREATE INDEX "enrollments_currentChapterId_idx" ON "enrollments"("currentChapterId");

-- CreateIndex
CREATE INDEX "enrollments_status_idx" ON "enrollments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_userId_courseVersionId_key" ON "enrollments"("userId", "courseVersionId");

-- CreateIndex
CREATE INDEX "daily_activities_userId_idx" ON "daily_activities"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_activities_userId_activityDate_key" ON "daily_activities"("userId", "activityDate");

-- CreateIndex
CREATE INDEX "learning_sessions_enrollmentId_idx" ON "learning_sessions"("enrollmentId");

-- CreateIndex
CREATE INDEX "learning_sessions_chapterId_idx" ON "learning_sessions"("chapterId");

-- CreateIndex
CREATE INDEX "learning_sessions_enrollmentId_isActive_idx" ON "learning_sessions"("enrollmentId", "isActive");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_idx" ON "chat_messages"("sessionId");

-- CreateIndex
CREATE INDEX "chat_messages_sessionId_createdAt_idx" ON "chat_messages"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "concept_masteries_enrollmentId_idx" ON "concept_masteries"("enrollmentId");

-- CreateIndex
CREATE INDEX "concept_masteries_conceptId_idx" ON "concept_masteries"("conceptId");

-- CreateIndex
CREATE INDEX "concept_masteries_state_idx" ON "concept_masteries"("state");

-- CreateIndex
CREATE UNIQUE INDEX "concept_masteries_enrollmentId_conceptId_key" ON "concept_masteries"("enrollmentId", "conceptId");

-- CreateIndex
CREATE INDEX "mastery_evidences_conceptMasteryId_idx" ON "mastery_evidences"("conceptMasteryId");

-- CreateIndex
CREATE INDEX "mastery_evidences_rubricCriterionId_idx" ON "mastery_evidences"("rubricCriterionId");

-- CreateIndex
CREATE INDEX "mastery_evidences_evidenceType_idx" ON "mastery_evidences"("evidenceType");

-- CreateIndex
CREATE INDEX "assessment_attempts_enrollmentId_idx" ON "assessment_attempts"("enrollmentId");

-- CreateIndex
CREATE INDEX "assessment_attempts_enrollmentId_assessmentType_idx" ON "assessment_attempts"("enrollmentId", "assessmentType");

-- CreateIndex
CREATE INDEX "assessment_answers_attemptId_idx" ON "assessment_answers"("attemptId");

-- CreateIndex
CREATE INDEX "assessment_answers_questionId_idx" ON "assessment_answers"("questionId");

-- CreateIndex
CREATE INDEX "rubric_evaluations_answerId_idx" ON "rubric_evaluations"("answerId");

-- CreateIndex
CREATE INDEX "rubric_evaluations_rubricCriterionId_idx" ON "rubric_evaluations"("rubricCriterionId");

-- CreateIndex
CREATE INDEX "practical_submissions_attemptId_idx" ON "practical_submissions"("attemptId");

-- CreateIndex
CREATE INDEX "viva_defense_turns_attemptId_idx" ON "viva_defense_turns"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "viva_defense_turns_attemptId_turnNumber_key" ON "viva_defense_turns"("attemptId", "turnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_credentialId_key" ON "certificates"("credentialId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_enrollmentId_key" ON "certificates"("enrollmentId");

-- CreateIndex
CREATE INDEX "certificates_credentialId_idx" ON "certificates"("credentialId");

-- CreateIndex
CREATE INDEX "certificates_status_idx" ON "certificates"("status");

-- CreateIndex
CREATE INDEX "certificates_tier_idx" ON "certificates"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "signing_key_registry_keyId_key" ON "signing_key_registry"("keyId");

-- CreateIndex
CREATE INDEX "signing_key_registry_keyId_idx" ON "signing_key_registry"("keyId");

-- CreateIndex
CREATE INDEX "signing_key_registry_status_idx" ON "signing_key_registry"("status");

-- CreateIndex
CREATE UNIQUE INDEX "storage_artifacts_storageKey_key" ON "storage_artifacts"("storageKey");

-- CreateIndex
CREATE INDEX "storage_artifacts_enrollmentId_idx" ON "storage_artifacts"("enrollmentId");

-- CreateIndex
CREATE INDEX "storage_artifacts_userId_idx" ON "storage_artifacts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_logs_idempotencyKey_key" ON "email_logs"("idempotencyKey");

-- CreateIndex
CREATE INDEX "email_logs_recipient_idx" ON "email_logs"("recipient");

-- CreateIndex
CREATE INDEX "email_logs_idempotencyKey_idx" ON "email_logs"("idempotencyKey");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_versions" ADD CONSTRAINT "course_versions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "course_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrics" ADD CONSTRAINT "rubrics_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "rubrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_courseVersionId_fkey" FOREIGN KEY ("courseVersionId") REFERENCES "course_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_currentChapterId_fkey" FOREIGN KEY ("currentChapterId") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_activities" ADD CONSTRAINT "daily_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "learning_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_masteries" ADD CONSTRAINT "concept_masteries_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concept_masteries" ADD CONSTRAINT "concept_masteries_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_evidences" ADD CONSTRAINT "mastery_evidences_conceptMasteryId_fkey" FOREIGN KEY ("conceptMasteryId") REFERENCES "concept_masteries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mastery_evidences" ADD CONSTRAINT "mastery_evidences_rubricCriterionId_fkey" FOREIGN KEY ("rubricCriterionId") REFERENCES "rubric_criteria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_attempts" ADD CONSTRAINT "assessment_attempts_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_evaluations" ADD CONSTRAINT "rubric_evaluations_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "assessment_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubric_evaluations" ADD CONSTRAINT "rubric_evaluations_rubricCriterionId_fkey" FOREIGN KEY ("rubricCriterionId") REFERENCES "rubric_criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practical_submissions" ADD CONSTRAINT "practical_submissions_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viva_defense_turns" ADD CONSTRAINT "viva_defense_turns_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "assessment_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_artifacts" ADD CONSTRAINT "storage_artifacts_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_artifacts" ADD CONSTRAINT "storage_artifacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

