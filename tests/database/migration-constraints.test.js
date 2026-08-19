import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const migrationPath = fileURLToPath(
  new URL(
    "../../prisma/migrations/20260819000000_phase_1_foundation/migration.sql",
    import.meta.url,
  ),
);

describe("initial PostgreSQL migration", () => {
  it("contains the reviewed partial uniqueness constraints", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain('CREATE UNIQUE INDEX "Assessment_one_in_progress_per_user"');
    expect(sql).toContain("WHERE \"status\" = 'IN_PROGRESS'");
    expect(sql).toContain('CREATE UNIQUE INDEX "EvaluationJob_one_active_per_evaluation"');
    expect(sql).toContain("WHERE \"status\" IN ('PENDING', 'PROCESSING')");
    expect(sql).toContain('CREATE UNIQUE INDEX "QuestionOption_one_correct_per_question"');
    expect(sql).toContain('WHERE "isCorrect" = true');
  });

  it("enforces essential value and digest constraints in the migration", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).toContain('CONSTRAINT "Question_difficulty_range"');
    expect(sql).toContain('CONSTRAINT "Assessment_requested_counts"');
    expect(sql).toContain('CONSTRAINT "AssessmentQuestion_max_points_mvp"');
    expect(sql).toContain('CONSTRAINT "EvaluationAttemptCriterion_awarded_fraction_range"');
    expect(sql).toContain('octet_length("startIdempotencyKeyDigest") = 32');
  });

  it("does not create deferred result or mutable progress tables", async () => {
    const sql = await readFile(migrationPath, "utf8");

    expect(sql).not.toContain('CREATE TABLE "AssessmentResult"');
    expect(sql).not.toContain('CREATE TABLE "UserTopicProgress"');
    expect(sql).not.toContain('CREATE TABLE "UserQuestionState"');
  });
});
