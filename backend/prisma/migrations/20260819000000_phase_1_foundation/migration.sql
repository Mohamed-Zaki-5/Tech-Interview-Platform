-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "RefreshSessionStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "RefreshTokenStatus" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CatalogStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Level" AS ENUM ('JUNIOR', 'MID_LEVEL', 'SENIOR');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER', 'LONG_ANSWER');

-- CreateEnum
CREATE TYPE "RubricPatternKind" AS ENUM ('ACCEPTED', 'REJECTION');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "TopicFilterMode" AS ENUM ('ALL_ACTIVE', 'EXPLICIT');

-- CreateEnum
CREATE TYPE "EvaluationStatus" AS ENUM ('PENDING', 'EVALUATED', 'NOT_EVALUATED', 'EVALUATION_FAILED');

-- CreateEnum
CREATE TYPE "EvaluationAttemptStatus" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "EvaluationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "passwordHash" VARCHAR(512) NOT NULL,
    "displayName" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "statusChangedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "familyId" UUID NOT NULL,
    "status" "RefreshSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "revokedAt" TIMESTAMPTZ(6),
    "revocationReason" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RefreshSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "tokenHash" BYTEA NOT NULL,
    "status" "RefreshTokenStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "usedAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "revocationReason" VARCHAR(100),
    "replacedById" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "id" UUID NOT NULL,
    "policyScope" VARCHAR(100) NOT NULL,
    "keyDigest" BYTEA NOT NULL,
    "tokens" DECIMAL(20,8) NOT NULL,
    "lastRefillAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Technology" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackTechnology" (
    "trackId" UUID NOT NULL,
    "technologyId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "TrackTechnology_pkey" PRIMARY KEY ("trackId","technologyId")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" UUID NOT NULL,
    "technologyId" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "status" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" UUID NOT NULL,
    "topicId" UUID NOT NULL,
    "type" "QuestionType" NOT NULL,
    "level" "Level" NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'DRAFT',
    "referenceAnswer" TEXT,
    "correctBoolean" BOOLEAN,
    "minimumAnswerLength" INTEGER,
    "maximumAnswerLength" INTEGER,
    "rubricVersion" VARCHAR(100),
    "evaluatorVersion" VARCHAR(100),
    "promptVersion" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "stableIdentifier" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "weight" DECIMAL(8,7) NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricPattern" (
    "id" UUID NOT NULL,
    "criterionId" UUID NOT NULL,
    "kind" "RubricPatternKind" NOT NULL,
    "phrase" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "RubricPattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "technologyId" UUID NOT NULL,
    "technologySnapshotLabel" VARCHAR(120) NOT NULL,
    "level" "Level" NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "topicFilterMode" "TopicFilterMode" NOT NULL,
    "requestedMcqCount" INTEGER NOT NULL,
    "requestedTrueFalseCount" INTEGER NOT NULL,
    "requestedShortAnswerCount" INTEGER NOT NULL,
    "requestedLongAnswerCount" INTEGER NOT NULL,
    "actualMcqCount" INTEGER NOT NULL,
    "actualTrueFalseCount" INTEGER NOT NULL,
    "actualShortAnswerCount" INTEGER NOT NULL,
    "actualLongAnswerCount" INTEGER NOT NULL,
    "startIdempotencyKeyDigest" BYTEA NOT NULL,
    "startCanonicalPayloadHash" BYTEA NOT NULL,
    "startedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "completedAt" TIMESTAMPTZ(6),
    "abandonedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentTopicFilter" (
    "assessmentId" UUID NOT NULL,
    "topicId" UUID NOT NULL,

    CONSTRAINT "AssessmentTopicFilter_pkey" PRIMARY KEY ("assessmentId","topicId")
);

-- CreateTable
CREATE TABLE "AssessmentQuestion" (
    "id" UUID NOT NULL,
    "assessmentId" UUID NOT NULL,
    "sourceQuestionId" UUID NOT NULL,
    "type" "QuestionType" NOT NULL,
    "text" TEXT NOT NULL,
    "level" "Level" NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "technologySnapshotId" UUID NOT NULL,
    "technologySnapshotLabel" VARCHAR(120) NOT NULL,
    "topicSnapshotId" UUID NOT NULL,
    "topicSnapshotLabel" VARCHAR(120) NOT NULL,
    "publicOptions" JSONB,
    "privateCorrectAnswer" JSONB,
    "privateReferenceAnswer" TEXT,
    "privateRubric" JSONB,
    "rubricVersion" VARCHAR(100),
    "normalizationVersion" VARCHAR(100),
    "evaluatorVersion" VARCHAR(100),
    "promptVersion" VARCHAR(100),
    "snapshotSchemaVersion" INTEGER NOT NULL,
    "maxPoints" DECIMAL(8,4) NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentSubmission" (
    "id" UUID NOT NULL,
    "assessmentId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "idempotencyKeyDigest" BYTEA NOT NULL,
    "canonicalPayloadHash" BYTEA NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssessmentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" UUID NOT NULL,
    "assessmentQuestionId" UUID NOT NULL,
    "selectedOptionId" UUID,
    "booleanValue" BOOLEAN,
    "textValue" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" UUID NOT NULL,
    "answerId" UUID NOT NULL,
    "status" "EvaluationStatus" NOT NULL,
    "awardedPoints" DECIMAL(8,4),
    "safeFeedback" TEXT,
    "evaluatorVersion" VARCHAR(100),
    "matchedCriterionIdentifiers" JSONB,
    "activeAttemptId" UUID,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationAttempt" (
    "id" UUID NOT NULL,
    "evaluationId" UUID NOT NULL,
    "status" "EvaluationAttemptStatus" NOT NULL,
    "providerIdentifier" VARCHAR(100) NOT NULL,
    "modelIdentifier" VARCHAR(200) NOT NULL,
    "providerRequestIdentifier" VARCHAR(255),
    "rubricVersion" VARCHAR(100) NOT NULL,
    "evaluatorVersion" VARCHAR(100) NOT NULL,
    "promptVersion" VARCHAR(100) NOT NULL,
    "finalPoints" DECIMAL(8,4),
    "errorCode" VARCHAR(100),
    "sanitizedErrorMessage" TEXT,
    "usageMetadata" JSONB,
    "attemptedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationAttemptCriterion" (
    "id" UUID NOT NULL,
    "evaluationAttemptId" UUID NOT NULL,
    "criterionIdentifier" VARCHAR(100) NOT NULL,
    "awardedFraction" DECIMAL(8,7) NOT NULL,
    "privateEvidence" TEXT NOT NULL,
    "safeFeedback" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationAttemptCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationJob" (
    "id" UUID NOT NULL,
    "answerId" UUID NOT NULL,
    "evaluationId" UUID NOT NULL,
    "status" "EvaluationJobStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL,
    "availableAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" TIMESTAMPTZ(6),
    "lockExpiresAt" TIMESTAMPTZ(6),
    "lockToken" UUID,
    "lastErrorCode" VARCHAR(100),
    "sanitizedErrorMessage" TEXT,
    "deduplicationKey" BYTEA NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "EvaluationJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshSession_familyId_key" ON "RefreshSession"("familyId");

-- CreateIndex
CREATE INDEX "RefreshSession_userId_status_expiresAt_idx" ON "RefreshSession"("userId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "RefreshSession_status_expiresAt_idx" ON "RefreshSession"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_replacedById_key" ON "RefreshToken"("replacedById");

-- CreateIndex
CREATE INDEX "RefreshToken_sessionId_status_expiresAt_idx" ON "RefreshToken"("sessionId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_status_expiresAt_idx" ON "RefreshToken"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "RateLimitBucket_policyScope_keyDigest_key" ON "RateLimitBucket"("policyScope", "keyDigest");

-- CreateIndex
CREATE UNIQUE INDEX "Track_slug_key" ON "Track"("slug");

-- CreateIndex
CREATE INDEX "Track_status_name_idx" ON "Track"("status", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Technology_slug_key" ON "Technology"("slug");

-- CreateIndex
CREATE INDEX "Technology_status_name_idx" ON "Technology"("status", "name");

-- CreateIndex
CREATE INDEX "TrackTechnology_technologyId_idx" ON "TrackTechnology"("technologyId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackTechnology_trackId_position_key" ON "TrackTechnology"("trackId", "position");

-- CreateIndex
CREATE INDEX "Topic_technologyId_status_name_idx" ON "Topic"("technologyId", "status", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_technologyId_slug_key" ON "Topic"("technologyId", "slug");

-- CreateIndex
CREATE INDEX "Question_topicId_status_level_type_difficulty_idx" ON "Question"("topicId", "status", "level", "type", "difficulty");

-- CreateIndex
CREATE INDEX "Question_status_type_level_difficulty_idx" ON "Question"("status", "type", "level", "difficulty");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_isCorrect_idx" ON "QuestionOption"("questionId", "isCorrect");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_position_key" ON "QuestionOption"("questionId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "RubricCriterion_questionId_stableIdentifier_key" ON "RubricCriterion"("questionId", "stableIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "RubricCriterion_questionId_position_key" ON "RubricCriterion"("questionId", "position");

-- CreateIndex
CREATE INDEX "RubricPattern_criterionId_kind_idx" ON "RubricPattern"("criterionId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "RubricPattern_criterionId_kind_position_key" ON "RubricPattern"("criterionId", "kind", "position");

-- CreateIndex
CREATE INDEX "Assessment_userId_startedAt_id_idx" ON "Assessment"("userId", "startedAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Assessment_userId_status_startedAt_idx" ON "Assessment"("userId", "status", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "Assessment_userId_technologyId_level_startedAt_idx" ON "Assessment"("userId", "technologyId", "level", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "Assessment_userId_status_completedAt_idx" ON "Assessment"("userId", "status", "completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_userId_startIdempotencyKeyDigest_key" ON "Assessment"("userId", "startIdempotencyKeyDigest");

-- CreateIndex
CREATE UNIQUE INDEX "Assessment_id_userId_key" ON "Assessment"("id", "userId");

-- CreateIndex
CREATE INDEX "AssessmentTopicFilter_topicId_idx" ON "AssessmentTopicFilter"("topicId");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_sourceQuestionId_createdAt_idx" ON "AssessmentQuestion"("sourceQuestionId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AssessmentQuestion_assessmentId_type_topicSnapshotId_idx" ON "AssessmentQuestion"("assessmentId", "type", "topicSnapshotId");

-- CreateIndex
CREATE INDEX "AssessmentQuestion_technologySnapshotId_topicSnapshotId_lev_idx" ON "AssessmentQuestion"("technologySnapshotId", "topicSnapshotId", "level", "type");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_assessmentId_sourceQuestionId_key" ON "AssessmentQuestion"("assessmentId", "sourceQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentQuestion_assessmentId_position_key" ON "AssessmentQuestion"("assessmentId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSubmission_assessmentId_key" ON "AssessmentSubmission"("assessmentId");

-- CreateIndex
CREATE INDEX "AssessmentSubmission_userId_createdAt_idx" ON "AssessmentSubmission"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSubmission_userId_idempotencyKeyDigest_key" ON "AssessmentSubmission"("userId", "idempotencyKeyDigest");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSubmission_assessmentId_userId_key" ON "AssessmentSubmission"("assessmentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Answer_assessmentQuestionId_key" ON "Answer"("assessmentQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_answerId_key" ON "Evaluation"("answerId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_activeAttemptId_key" ON "Evaluation"("activeAttemptId");

-- CreateIndex
CREATE INDEX "Evaluation_status_idx" ON "Evaluation"("status");

-- CreateIndex
CREATE INDEX "Evaluation_activeAttemptId_idx" ON "Evaluation"("activeAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_activeAttemptId_id_key" ON "Evaluation"("activeAttemptId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_id_answerId_key" ON "Evaluation"("id", "answerId");

-- CreateIndex
CREATE INDEX "EvaluationAttempt_evaluationId_attemptedAt_idx" ON "EvaluationAttempt"("evaluationId", "attemptedAt" DESC);

-- CreateIndex
CREATE INDEX "EvaluationAttempt_providerRequestIdentifier_idx" ON "EvaluationAttempt"("providerRequestIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationAttempt_id_evaluationId_key" ON "EvaluationAttempt"("id", "evaluationId");

-- CreateIndex
CREATE INDEX "EvaluationAttemptCriterion_evaluationAttemptId_idx" ON "EvaluationAttemptCriterion"("evaluationAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationAttemptCriterion_evaluationAttemptId_criterionIde_key" ON "EvaluationAttemptCriterion"("evaluationAttemptId", "criterionIdentifier");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationJob_deduplicationKey_key" ON "EvaluationJob"("deduplicationKey");

-- CreateIndex
CREATE INDEX "EvaluationJob_status_availableAt_idx" ON "EvaluationJob"("status", "availableAt");

-- CreateIndex
CREATE INDEX "EvaluationJob_status_lockExpiresAt_idx" ON "EvaluationJob"("status", "lockExpiresAt");

-- CreateIndex
CREATE INDEX "EvaluationJob_evaluationId_createdAt_idx" ON "EvaluationJob"("evaluationId", "createdAt");

-- CreateIndex
CREATE INDEX "EvaluationJob_answerId_createdAt_idx" ON "EvaluationJob"("answerId", "createdAt");

-- AddForeignKey
ALTER TABLE "RefreshSession" ADD CONSTRAINT "RefreshSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "RefreshSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "RefreshToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackTechnology" ADD CONSTRAINT "TrackTechnology_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackTechnology" ADD CONSTRAINT "TrackTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricPattern" ADD CONSTRAINT "RubricPattern_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentTopicFilter" ADD CONSTRAINT "AssessmentTopicFilter_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentTopicFilter" ADD CONSTRAINT "AssessmentTopicFilter_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentQuestion" ADD CONSTRAINT "AssessmentQuestion_sourceQuestionId_fkey" FOREIGN KEY ("sourceQuestionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSubmission" ADD CONSTRAINT "AssessmentSubmission_assessmentId_userId_fkey" FOREIGN KEY ("assessmentId", "userId") REFERENCES "Assessment"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_assessmentQuestionId_fkey" FOREIGN KEY ("assessmentQuestionId") REFERENCES "AssessmentQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_activeAttemptId_id_fkey" FOREIGN KEY ("activeAttemptId", "id") REFERENCES "EvaluationAttempt"("id", "evaluationId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationAttempt" ADD CONSTRAINT "EvaluationAttempt_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationAttemptCriterion" ADD CONSTRAINT "EvaluationAttemptCriterion_evaluationAttemptId_fkey" FOREIGN KEY ("evaluationAttemptId") REFERENCES "EvaluationAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationJob" ADD CONSTRAINT "EvaluationJob_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "Answer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationJob" ADD CONSTRAINT "EvaluationJob_evaluationId_answerId_fkey" FOREIGN KEY ("evaluationId", "answerId") REFERENCES "Evaluation"("id", "answerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- PostgreSQL-specific invariants that Prisma schema syntax cannot express.

-- A user can own at most one live assessment session.
CREATE UNIQUE INDEX "Assessment_one_in_progress_per_user"
ON "Assessment"("userId")
WHERE "status" = 'IN_PROGRESS';

-- Only one pending or leased job may represent an evaluation at a time.
CREATE UNIQUE INDEX "EvaluationJob_one_active_per_evaluation"
ON "EvaluationJob"("evaluationId")
WHERE "status" IN ('PENDING', 'PROCESSING');

-- Draft MCQ content may be incomplete, but it can never contain two correct options.
CREATE UNIQUE INDEX "QuestionOption_one_correct_per_question"
ON "QuestionOption"("questionId")
WHERE "isCorrect" = true;

ALTER TABLE "User"
ADD CONSTRAINT "User_canonical_email"
CHECK ("email" = lower("email") AND "email" = btrim("email")),
ADD CONSTRAINT "User_non_empty_display_name"
CHECK (length(btrim("displayName")) > 0);

ALTER TABLE "RefreshSession"
ADD CONSTRAINT "RefreshSession_expiry_after_creation"
CHECK ("expiresAt" > "createdAt");

ALTER TABLE "RefreshToken"
ADD CONSTRAINT "RefreshToken_hash_sha256_length"
CHECK (octet_length("tokenHash") = 32),
ADD CONSTRAINT "RefreshToken_expiry_after_creation"
CHECK ("expiresAt" > "createdAt");

ALTER TABLE "RateLimitBucket"
ADD CONSTRAINT "RateLimitBucket_key_hmac_length"
CHECK (octet_length("keyDigest") = 32),
ADD CONSTRAINT "RateLimitBucket_non_negative_tokens"
CHECK ("tokens" >= 0),
ADD CONSTRAINT "RateLimitBucket_expiry_after_refill"
CHECK ("expiresAt" > "lastRefillAt");

ALTER TABLE "TrackTechnology"
ADD CONSTRAINT "TrackTechnology_non_negative_position"
CHECK ("position" >= 0);

ALTER TABLE "Question"
ADD CONSTRAINT "Question_difficulty_range"
CHECK ("difficulty" BETWEEN 1 AND 5),
ADD CONSTRAINT "Question_answer_length_range"
CHECK (
  ("minimumAnswerLength" IS NULL OR "minimumAnswerLength" > 0)
  AND ("maximumAnswerLength" IS NULL OR "maximumAnswerLength" > 0)
  AND (
    "minimumAnswerLength" IS NULL
    OR "maximumAnswerLength" IS NULL
    OR "maximumAnswerLength" >= "minimumAnswerLength"
  )
);

ALTER TABLE "QuestionOption"
ADD CONSTRAINT "QuestionOption_non_negative_position"
CHECK ("position" >= 0);

ALTER TABLE "RubricCriterion"
ADD CONSTRAINT "RubricCriterion_weight_range"
CHECK ("weight" > 0 AND "weight" <= 1),
ADD CONSTRAINT "RubricCriterion_non_negative_position"
CHECK ("position" >= 0);

ALTER TABLE "RubricPattern"
ADD CONSTRAINT "RubricPattern_non_negative_position"
CHECK ("position" >= 0),
ADD CONSTRAINT "RubricPattern_non_empty_phrase"
CHECK (length(btrim("phrase")) > 0);

ALTER TABLE "Assessment"
ADD CONSTRAINT "Assessment_requested_counts"
CHECK (
  "requestedMcqCount" >= 0
  AND "requestedTrueFalseCount" >= 0
  AND "requestedShortAnswerCount" >= 0
  AND "requestedLongAnswerCount" >= 0
  AND (
    "requestedMcqCount"
    + "requestedTrueFalseCount"
    + "requestedShortAnswerCount"
    + "requestedLongAnswerCount"
  ) BETWEEN 1 AND 50
),
ADD CONSTRAINT "Assessment_actual_counts_match_request"
CHECK (
  "actualMcqCount" = "requestedMcqCount"
  AND "actualTrueFalseCount" = "requestedTrueFalseCount"
  AND "actualShortAnswerCount" = "requestedShortAnswerCount"
  AND "actualLongAnswerCount" = "requestedLongAnswerCount"
),
ADD CONSTRAINT "Assessment_expiry_after_start"
CHECK ("expiresAt" > "startedAt"),
ADD CONSTRAINT "Assessment_start_idempotency_digest_length"
CHECK (octet_length("startIdempotencyKeyDigest") = 32),
ADD CONSTRAINT "Assessment_start_payload_hash_length"
CHECK (octet_length("startCanonicalPayloadHash") = 32),
ADD CONSTRAINT "Assessment_terminal_timestamps"
CHECK (
  ("status" = 'IN_PROGRESS' AND "completedAt" IS NULL AND "abandonedAt" IS NULL)
  OR ("status" = 'COMPLETED' AND "completedAt" IS NOT NULL AND "abandonedAt" IS NULL)
  OR ("status" = 'ABANDONED' AND "completedAt" IS NULL AND "abandonedAt" IS NOT NULL)
  OR ("status" = 'EXPIRED' AND "completedAt" IS NULL AND "abandonedAt" IS NULL)
);

ALTER TABLE "AssessmentQuestion"
ADD CONSTRAINT "AssessmentQuestion_difficulty_range"
CHECK ("difficulty" BETWEEN 1 AND 5),
ADD CONSTRAINT "AssessmentQuestion_snapshot_version_positive"
CHECK ("snapshotSchemaVersion" > 0),
ADD CONSTRAINT "AssessmentQuestion_max_points_mvp"
CHECK ("maxPoints" = 1),
ADD CONSTRAINT "AssessmentQuestion_non_negative_position"
CHECK ("position" >= 0);

ALTER TABLE "AssessmentSubmission"
ADD CONSTRAINT "AssessmentSubmission_idempotency_digest_length"
CHECK (octet_length("idempotencyKeyDigest") = 32),
ADD CONSTRAINT "AssessmentSubmission_payload_hash_length"
CHECK (octet_length("canonicalPayloadHash") = 32);

ALTER TABLE "Evaluation"
ADD CONSTRAINT "Evaluation_awarded_points_state"
CHECK (
  ("status" = 'EVALUATED' AND "awardedPoints" IS NOT NULL AND "awardedPoints" BETWEEN 0 AND 1)
  OR ("status" <> 'EVALUATED' AND "awardedPoints" IS NULL)
),
ADD CONSTRAINT "Evaluation_active_attempt_state"
CHECK ("activeAttemptId" IS NULL OR "status" = 'EVALUATED');

ALTER TABLE "EvaluationAttempt"
ADD CONSTRAINT "EvaluationAttempt_outcome_state"
CHECK (
  ("status" = 'SUCCEEDED' AND "finalPoints" IS NOT NULL AND "finalPoints" BETWEEN 0 AND 1 AND "errorCode" IS NULL)
  OR ("status" = 'FAILED' AND "finalPoints" IS NULL)
);

ALTER TABLE "EvaluationAttemptCriterion"
ADD CONSTRAINT "EvaluationAttemptCriterion_awarded_fraction_range"
CHECK ("awardedFraction" BETWEEN 0 AND 1);

ALTER TABLE "EvaluationJob"
ADD CONSTRAINT "EvaluationJob_deduplication_key_length"
CHECK (octet_length("deduplicationKey") = 32),
ADD CONSTRAINT "EvaluationJob_attempt_range"
CHECK ("maxAttempts" > 0 AND "attemptCount" BETWEEN 0 AND "maxAttempts"),
ADD CONSTRAINT "EvaluationJob_lease_state"
CHECK (
  (
    "status" = 'PROCESSING'
    AND "lockedAt" IS NOT NULL
    AND "lockExpiresAt" IS NOT NULL
    AND "lockToken" IS NOT NULL
    AND "lockExpiresAt" > "lockedAt"
  )
  OR (
    "status" <> 'PROCESSING'
    AND "lockedAt" IS NULL
    AND "lockExpiresAt" IS NULL
    AND "lockToken" IS NULL
  )
);

-- Active Question validity spans several rows, so deferred constraint triggers validate the
-- final transactional state used by activation and reactivation operations.
CREATE FUNCTION "validate_active_question_configuration"(question_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  question_record RECORD;
  criterion_count INTEGER;
  criterion_weight NUMERIC;
  option_count INTEGER;
  correct_option_count INTEGER;
BEGIN
  SELECT * INTO question_record
  FROM "Question"
  WHERE "id" = question_id;

  IF NOT FOUND OR question_record."status" <> 'ACTIVE' THEN
    RETURN;
  END IF;

  IF question_record."type" = 'MCQ' THEN
    SELECT count(*), count(*) FILTER (WHERE "isCorrect")
    INTO option_count, correct_option_count
    FROM "QuestionOption"
    WHERE "questionId" = question_id;

    IF option_count < 2 OR correct_option_count <> 1 THEN
      RAISE EXCEPTION 'Active MCQ configuration is invalid'
        USING ERRCODE = '23514', CONSTRAINT = 'Question_active_configuration';
    END IF;
  ELSIF question_record."type" = 'TRUE_FALSE' THEN
    IF question_record."correctBoolean" IS NULL THEN
      RAISE EXCEPTION 'Active True/False configuration is invalid'
        USING ERRCODE = '23514', CONSTRAINT = 'Question_active_configuration';
    END IF;
  ELSE
    SELECT count(*), coalesce(sum("weight"), 0)
    INTO criterion_count, criterion_weight
    FROM "RubricCriterion"
    WHERE "questionId" = question_id;

    IF question_record."referenceAnswer" IS NULL
      OR length(btrim(question_record."referenceAnswer")) = 0
      OR question_record."minimumAnswerLength" IS NULL
      OR question_record."maximumAnswerLength" IS NULL
      OR criterion_count = 0
      OR criterion_weight <> 1
      OR question_record."rubricVersion" IS NULL
      OR question_record."evaluatorVersion" IS NULL
    THEN
      RAISE EXCEPTION 'Active rubric configuration is invalid'
        USING ERRCODE = '23514', CONSTRAINT = 'Question_active_configuration';
    END IF;

    IF question_record."type" = 'SHORT_ANSWER' AND EXISTS (
      SELECT 1
      FROM "RubricCriterion" criterion
      WHERE criterion."questionId" = question_id
        AND NOT EXISTS (
          SELECT 1
          FROM "RubricPattern" pattern
          WHERE pattern."criterionId" = criterion."id"
            AND pattern."kind" = 'ACCEPTED'
        )
    ) THEN
      RAISE EXCEPTION 'Active Short Answer accepted-pattern configuration is invalid'
        USING ERRCODE = '23514', CONSTRAINT = 'Question_active_configuration';
    END IF;

    IF question_record."type" = 'LONG_ANSWER'
      AND question_record."promptVersion" IS NULL
    THEN
      RAISE EXCEPTION 'Active Long Answer prompt configuration is invalid'
        USING ERRCODE = '23514', CONSTRAINT = 'Question_active_configuration';
    END IF;
  END IF;
END;
$$;

CREATE FUNCTION "check_question_configuration_from_question"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM "validate_active_question_configuration"(NEW."id");
  RETURN NEW;
END;
$$;

CREATE FUNCTION "check_question_configuration_from_option"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM "validate_active_question_configuration"(OLD."questionId");
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM "validate_active_question_configuration"(NEW."questionId");
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION "check_question_configuration_from_criterion"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    PERFORM "validate_active_question_configuration"(OLD."questionId");
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    PERFORM "validate_active_question_configuration"(NEW."questionId");
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION "check_question_configuration_from_pattern"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  affected_question_id UUID;
BEGIN
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    SELECT "questionId" INTO affected_question_id
    FROM "RubricCriterion"
    WHERE "id" = OLD."criterionId";
    PERFORM "validate_active_question_configuration"(affected_question_id);
  END IF;
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT "questionId" INTO affected_question_id
    FROM "RubricCriterion"
    WHERE "id" = NEW."criterionId";
    PERFORM "validate_active_question_configuration"(affected_question_id);
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER "Question_active_configuration_check"
AFTER INSERT OR UPDATE
ON "Question"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION "check_question_configuration_from_question"();

CREATE CONSTRAINT TRIGGER "QuestionOption_active_configuration_check"
AFTER INSERT OR UPDATE OR DELETE ON "QuestionOption"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION "check_question_configuration_from_option"();

CREATE CONSTRAINT TRIGGER "RubricCriterion_active_configuration_check"
AFTER INSERT OR UPDATE OR DELETE ON "RubricCriterion"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION "check_question_configuration_from_criterion"();

CREATE CONSTRAINT TRIGGER "RubricPattern_active_configuration_check"
AFTER INSERT OR UPDATE OR DELETE ON "RubricPattern"
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION "check_question_configuration_from_pattern"();
