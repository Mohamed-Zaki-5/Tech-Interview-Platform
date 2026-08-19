# Database Design

This document describes the PostgreSQL/Prisma model implemented initially in `prisma/schema.prisma` and `prisma/migrations/20260819000000_phase_1_foundation/migration.sql`. Later phases add application workflows without weakening these persistence invariants.

## Proposed Entity Map

| Entity | Key relationships | Responsibility |
|---|---|---|
| `User` | Has many Refresh Sessions and Assessments | Identity, canonical email, Argon2id hash, display name, role, Account Status |
| `RefreshSession` | Belongs to User; has many Refresh Tokens | One independently revocable seven-day device-session family |
| `RefreshToken` | Belongs to Refresh Session; may reference its replacement | SHA-256 token hash and rotation/reuse metadata |
| `RateLimitBucket` | No domain parent | Shared continuous-refill policy state keyed by scope and HMAC pseudonym |
| `Track` | Many-to-many with Technology through Track Technology | Role-oriented discovery path and Catalog Status |
| `Technology` | Many-to-many with Track; has many Topics | Assessable technical subject and Catalog Status |
| `TrackTechnology` | Belongs to one Track and one Technology | Explicit membership and display order within the Track |
| `Topic` | Belongs to exactly one Technology; has many Questions | Focused subject and Catalog Status |
| `Question` | Belongs to exactly one Topic; has options and criteria | Mutable source content, Type, Level, Difficulty, status, Reference Answer, and private scoring configuration |
| `QuestionOption` | Belongs to Question | Ordered public MCQ option and stable option identity |
| `RubricCriterion` | Belongs to a Short or Long Answer Question | Stable private criterion, description, weight, and order |
| `RubricPattern` | Belongs to a Short Answer Rubric Criterion | Accepted alternative or rejection/contradiction phrase |
| `Assessment` | Belongs to User and one Technology; has snapshots | Selection request, Technology snapshot, lifecycle, timing, start idempotency, and requested distributions |
| `AssessmentTopicFilter` | Belongs to Assessment and references Topic identity | Explicit requested Topic filter; absence is represented by Assessment filter mode |
| `AssessmentQuestion` | Belongs to Assessment; references source Question identity | Immutable public/private Question snapshot and Question order |
| `AssessmentSubmission` | One-to-one with completed Assessment | Final-submission idempotency digest and canonical payload hash; this separation is proposed rather than required |
| `Answer` | Belongs to one Assessment Question | Immutable type-appropriate User response |
| `Evaluation` | One-to-one with Answer; may select an active attempt | Current evaluation status, awarded points, safe feedback, and deterministic audit metadata |
| `EvaluationAttempt` | Belongs to Evaluation; has criterion outcomes | Immutable Long Answer provider attempt and normalized audit metadata |
| `EvaluationAttemptCriterion` | Belongs to Evaluation Attempt | Criterion identifier, awarded fraction, and concise private evidence |
| `EvaluationJob` | Belongs to Answer and Evaluation | Private leased PostgreSQL queue work and retry state |

There are no Assessment Result, Assessment Template, mutable User Progress, User Question State, Question–Topic join, or Track Progress entities in the MVP. Results are fully derived on read from immutable snapshots, Answers, and active successful Evaluations. Administrator is a User role, not a separate entity.

## Relationship Summary

- `Track ↔ Technology` is many-to-many through ordered `TrackTechnology`; Track never owns Technology.
- `Technology → Topic → Question` is the exclusive one-to-many dependency chain.
- Question has no `technologyId`; Technology is derived through Topic.
- User owns many Assessments, with at most one `IN_PROGRESS` Assessment.
- Assessment owns immutable Assessment Questions; every Answer references a snapshot, never a source Question.
- Answer has one active Evaluation state; Long Answer Evaluation may have many immutable Attempts, at most one of which is active.
- Evaluation Job references Answer/Evaluation and resolves private inputs from the immutable snapshot instead of copying them into the job.
- Results and Progress aggregate active successful Evaluation outcomes and snapshot dimensions.

## Content Catalog

- `Track` represents a role-oriented discovery and learning path.
- `Technology` represents an assessable technical subject.
- `TrackTechnology` is the explicit many-to-many association between `Track` and `Technology`. It stores the Technology's display order within that Track.
- `Topic` belongs to exactly one `Technology`; a Technology may have many Topics.
- `Question` belongs to exactly one required `Topic` and does not store `technologyId`; its Technology is derived through the Topic.
- `Assessment` belongs to exactly one `Technology`.
- An Assessment may be associated with zero or more Topics, but only Topics belonging to its Technology are valid.

There is no Question–Topic join entity in the MVP. A Question spanning concepts records one primary Topic.

Once a Topic has Questions or is referenced by an Assessment Question snapshot, its `technologyId` cannot change. Archival plus creation of a replacement Topic preserves historical identity and prevents inconsistent derived Technology data.

### Catalog Lifecycle and Eligibility

`Track`, `Technology`, `Topic`, and `Question` use `DRAFT`, `ACTIVE`, and `ARCHIVED`, defaulting to `DRAFT`. The stored status is separate from Effective Eligibility, which is enforced by transactional application queries and dependency checks.

The strict eligibility chain is Technology, then Topic, then Question. An active descendant may keep its status when a dependency is archived but becomes ineligible until every required dependency is active again. Track status only controls that Track and its paths; it never globally changes a shared Technology's status or eligibility through another valid path.

Activation and reactivation lock or conditionally validate required dependencies so they cannot be archived concurrently. Question activation also validates its complete type-specific private scoring configuration.

Topic `technologyId` changes only while the Topic is draft and has neither Questions nor Assessment history. Question `topicId` changes only while the Question is draft and has no Assessment Question snapshot. Used identities are archived and replaced rather than moved.

No catalog hard-delete operation exists. Lifecycle mutation never cascades into snapshots, Answers, Evaluations, Results, exposure history, or derived Progress.

## Level and Difficulty

- `Level` is a fixed enum with stored values `JUNIOR`, `MID_LEVEL`, and `SENIOR`.
- Each `Question` has exactly one Level.
- Each `Assessment` has exactly one Level.
- Every Question selected for an Assessment must have the Assessment's Level.
- `Topic` has no Level and is reusable across all Levels.
- Each Question has an integer `difficulty` from 1 through 5.
- Difficulty is independent of Level, so an Assessment may include multiple Difficulty values.

Track progress aggregates raw completed-Assessment data across the Track's current Technologies and has no separately maintained progress record. Results and Progress may be grouped by Technology, Topic, and Level.

## Users

`User` stores identifier, canonical email, password hash, display name, role, and creation and update timestamps. Canonical email is the trimmed lowercase value used for login and display, with database-enforced uniqueness. Display name is not unique.

Role values include `USER` and `ADMIN`. Public registration always persists `USER`; Administrator creation is an operational concern. Passwords are stored only as Argon2id hashes with implementation-generated unique salts, never as plaintext or reversible normalized values.

Password creation and verification operate on UTF-8 bytes after the same validation and NFC-normalization pipeline. Hashes encode or otherwise retain the Argon2id parameters required for verification and later rehash decisions.

Production hashes are standard encoded Argon2id version 19 strings with a minimum 65,536 KiB memory cost, 3 passes, 4 lanes, at least 16 random salt bytes, and 32 output bytes. Salt and parameters are not duplicated into separately maintained columns.

After a successful login only, a hash below current policy may be atomically replaced using current parameters. Existing encoded hashes remain verifiable after parameter increases. Plaintext and normalized password values are never persisted.

New accounts are immediately active but have no verified-email claim because email verification is outside the MVP.

User status values are `ACTIVE` and `DISABLED`, applying to every role. Disabling records the status-change time and revokes all active Refresh Sessions and token families in the same transaction without deleting or anonymizing any User or assessment data. Re-enabling does not restore sessions.

Controlled status changes produce a structured operational audit log containing action, timestamp, operator context, target, and reason without secrets. A database audit entity is deferred.

User creation through public registration does not create any Refresh Session or Refresh Token record.

### Refresh Sessions and Tokens

Each successful login creates a separate Refresh Session and token family for independent device revocation. Persisted session metadata includes User, family identifier, status, creation time, fixed seven-day absolute expiry, revocation time, and revocation reason.

Each issued Refresh Token record stores only the SHA-256 hash of a random token with at least 256 bits of entropy, its session/family relationship, creation and use state, replacement relationship, and revocation metadata. Raw values are never persisted. Rotated hashes are retained until family expiry for reuse detection.

Refresh validation, old-token consumption, replacement creation, session checks, and reuse handling occur under row locking or conditional writes so one token cannot rotate successfully twice. Presenting a consumed or revoked token revokes the family.

Access tokens are not persisted, and there is no access-token denylist in the MVP.

### Rate-Limit Buckets

Small expiring PostgreSQL records implement atomic token-bucket or sliding-window policies shared across API instances. Bucket identity combines policy scope with a pseudonymous HMAC-SHA-256 key derived from an explicit identifier type and canonical identifier.

Raw emails, passwords, password hashes, Refresh Tokens, and cookies are never rate-limit keys. Indexes support unique bucket identity and expiration. Expired rows are ignored for correctness and removed lazily or in bounded periodic batches.

Each applicable independent bucket is atomically evaluated; login includes separate IP and normalized-email policies. A rate-limit storage failure cannot be treated as permission to proceed on authentication endpoints.

Token balance and last-refill time support continuous proportional refill up to configured capacity. Atomic evaluation can consume all permitting buckets and safely account for blocked requests without allowing any balance below zero. Production authentication policies and defaults are documented in the architecture rather than inferred from table contents.

Assessment-start policies independently key the authenticated User and trusted canonical client IP. Each admitted minimally valid attempt consumes both buckets before business queries and is not refunded after downstream failure.

### Assessment-Start Idempotency

Assessment stores a SHA-256 digest of the UUID v4 start idempotency key and a SHA-256 hash of the canonical validated semantic payload. A database uniqueness constraint covers User plus operation scope plus key digest. The metadata remains for the Assessment's lifetime.

Canonical payload fields are Technology identifier, Level, all four type counts, a stable Topic-filter mode, and sorted unique Topic identifiers when provided. Omission uses a sentinel and never expands into current catalog membership.

Assessment, Question snapshots, requested distribution, and both hashes commit atomically. A uniqueness loser fetches the winner and returns it only when payload hashes match; otherwise it conflicts. A rolled-back transaction leaves no durable idempotency record.

## Confirmed Persistence Requirements

An Assessment records the User's selection criteria and the questions selected by the backend. The selected question set is fixed when the Assessment is created so that subsequent content-management changes cannot alter an in-progress or completed Assessment.

Assessment start atomically creates every Assessment Question snapshot in the same transaction. Each Answer references an Assessment Question snapshot, never a source Question. Snapshots are immutable and have no update path.

The Assessment stores the requested count and actual selected count for each of `MCQ`, `TRUE_FALSE`, `SHORT_ANSWER`, and `LONG_ANSWER`. Its total size is derived from the requested counts, must be from 1 through the configurable MVP limit initially set to 50, and must equal the number of unique snapshots created.

The Assessment stores the requested Topic filter when one is supplied. Omission means all active Topics for its Technology; an explicitly empty filter is invalid. Actual Topic distribution is derived from Assessment Question snapshots and is not maintained as a separate mutable summary.

Each snapshot stores:

- Source Question identifier.
- Question Type and text.
- Level and Difficulty.
- Topic identifier and display label.
- Public option identifiers, text, and display order.
- Private correct-answer data.
- Private Reference Answer and complete rubric configuration.
- Rubric, normalization, evaluator, and snapshot-schema versions as applicable.
- `maxPoints = 1`.
- Assessment Question order.

Evaluations store decimal awarded points from 0 through the snapshot's `maxPoints`. Persisting the maximum preserves historical scoring rules if explicit weighting is added later. Provider credentials and provider-specific configuration are not snapshotted; provider and model identifiers belong to Evaluation Attempts.

Source Questions are archived instead of hard-deleted. Editing or archiving a source Question never changes an existing snapshot.

Assessment selection queries require active Question, Topic, and Technology records and match the Assessment's Technology, Level, requested Type, and eligible Difficulty through the `Question → Topic → Technology` path.

Inventory validation for all requested Question Types occurs before Assessment persistence. Snapshot creation is atomic and cannot leave a partially populated Assessment.

Selection balances each Question Type across eligible Topics as inventory permits, with randomized or fairly rotated tie-breaking and exhausted Topics skipped. The selection component accepts a controllable random source for deterministic tests.

Seen history is derived from `AssessmentQuestion.sourceQuestionId`, its creation time, and the owning Assessment's `userId`. A Question is seen even when its Assessment is abandoned, expired, or never submitted. `lastSeenAt` is the latest matching snapshot creation time.

No mutable `UserQuestionState` table is introduced. Indexes supporting exposure lookup include the Assessment owner and the Assessment Question source identity, Assessment relationship, and creation time. Previously seen inventory remains eligible as least-recently-seen fallback, while source Questions lacking Effective Eligibility are excluded.

## Derived Progress

There are no `UserTopicProgress`, `UserTechnologyProgress`, or `UserTrackProgress` tables. Progress queries aggregate completed Assessments, immutable Assessment Question snapshot columns, Answers, and each Answer's active successful Evaluation outcome.

Snapshot dimensions required for grouping—including Technology and Topic identifiers and labels, Level, Question Type, and `maxPoints`—are stored in queryable columns rather than only in private JSON. Indexes support User and Assessment status/completion time, snapshot dimensions, Answer relationships, and active Evaluation lookup.

Aggregations sum earned points and evaluated maximum points directly. Unevaluated Answers remain in total Question counts but have no awarded points and do not enter evaluated maximum points. A failed retry never clears an active successful attempt; a new successful attempt may atomically replace the active pointer.

Track views join completed Assessment data for the Technologies currently associated with the Track and aggregate raw totals. No Track-level progress record is stored. Materialized or cached summaries are deferred pending measured need.

### Weak-Area Query

Weak-area classification groups active successful Evaluation outcomes by snapshotted Technology, Topic, and Level. It counts evaluated Assessment Question instances, uses unrounded raw point totals, and joins current Technology and Topic state only when producing the actionable active-content view.

No classification record is persisted. Lifetime completed-assessment data is used, and successful changes to the active Evaluation Attempt naturally affect later queries.

There is no assessment-template entity in the MVP.

Assessment completion state is stored separately from Answer evaluation state. Long Answer evaluation records support `PENDING`, `EVALUATED`, `NOT_EVALUATED`, and `EVALUATION_FAILED` statuses.

Evaluation attempts must have an idempotency mechanism and preserve enough state to retry a pending or failed evaluation without reopening the Assessment. When an evaluation changes, the Result and any derived progress are recalculated.

Unevaluated Questions have no awarded-points value and are excluded from the evaluated score denominator; they are never persisted or interpreted as zero-point evaluations.

## Short Answer Rubrics

A Short Answer Question stores a private Reference Answer and one or more private Rubric Criteria. Each criterion stores:

- A stable identifier.
- An Administrator-facing description.
- A decimal weight from 0 through 1.
- One or more accepted bounded words or normalized phrases, including alternatives.
- Zero or more rejection or contradiction patterns.

The database and service invariants require at least one criterion and a total criterion weight of exactly 1. Short Answer evaluations store awarded points, the evaluator version such as `SHORT_RUBRIC_V1`, and the identifiers of matched criteria. Audit details and all rubric data are private.

## Long Answer Rubrics and Attempts

A Long Answer Question stores a private Reference Answer, a rubric version, and one or more private weighted Rubric Criteria whose weights total exactly 1.

Every provider invocation creates an auditable Evaluation Attempt containing:

- Provider identifier.
- Model identifier.
- Provider request identifier when available.
- Rubric version.
- Evaluator version and prompt version.
- Per-criterion awarded fractions and concise private evidence.
- Backend-calculated final points.
- Evaluation status and attempt timestamp.
- Optional usage metadata.

Multiple attempts may belong to one Answer evaluation. The backend explicitly identifies which successful attempt is active; retrying never overwrites prior attempts. Raw provider payloads and chain-of-thought are not persisted.

## Evaluation Jobs

`EvaluationJob` is a private PostgreSQL-backed work record associated with an Answer and its Evaluation. It references private evaluation inputs rather than duplicating Reference Answers or Rubrics in a job payload.

The model includes:

- `id`
- `answerId`
- `status`
- `attemptCount`
- `maxAttempts`
- `availableAt`
- `lockedAt`
- `lockExpiresAt`
- `lockToken`
- `lastErrorCode`
- `createdAt`
- `updatedAt`
- A unique idempotency or deduplication key

Job status values are `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, and `CANCELLED`.

Assessment completion, Answer persistence, initial Long Answer Evaluation status, and any required Evaluation Job are committed atomically in one Prisma transaction. Provider calls never occur while a database transaction is open.

Workers claim eligible jobs atomically with a short transaction and a lease. Completion or rescheduling occurs in a separate transaction after the provider call. Expired leases allow abandoned jobs to be reclaimed safely.

Errors are stored as sanitized codes and messages without secrets, prompts, or private rubric content. Evaluation Jobs do not duplicate private evaluation material; workers resolve the associated immutable Question or rubric snapshot when processing.

## Answers and Final Submission

Each immutable `Answer` references exactly one `AssessmentQuestion`. A uniqueness constraint permits at most one Answer per Assessment Question. The Answer stores only the value appropriate to its snapshotted Question Type; the client does not persist an authoritative type discriminator.

Final submission stores a secure representation of the required idempotency key and a canonical hash of the validated payload. Uniqueness constraints cover the submission identity, one Answer per Assessment Question, and one active Evaluation and job identity per Long Answer.

The owning Assessment is atomically transitioned from `IN_PROGRESS` while all Answers, deterministic evaluations, initial Long Answer Evaluations and jobs, `COMPLETED` status, and initial Result state are written in one transaction. No provider request occurs during that transaction.

After commit, Answers cannot be updated or deleted through application workflows. An identical retry resolves to the existing Result; a conflicting key or payload is rejected without mutation.

## Assessment Expiration

`startedAt` and `expiresAt` are immutable UTC timestamps set from authoritative server or database time when the Assessment starts. `expiresAt` uses the configured session duration, initially 24 hours.

Submission conditionally transitions only an owned `IN_PROGRESS` Assessment whose deadline has not passed. At or after the deadline, the same transactional condition changes it to terminal `EXPIRED`, preventing races with completion. Expiration never removes Assessment Question snapshots or their exposure history.

Lazy materialization of expiry is sufficient. Idempotency records distinguish a submission committed before the deadline from a first attempt arriving after it, allowing an identical late retry of the former to resolve to its existing Result.

## Active Assessment Constraint

At most one Assessment per User may have status `IN_PROGRESS`. PostgreSQL enforces this with a partial unique index equivalent to a unique `userId` where status is `IN_PROGRESS`. If Prisma cannot declare the partial index, a reviewed SQL migration adds it and the data model documentation records it.

Start transactions expire a stale active Assessment before creating another and rely on the partial index to resolve concurrent creation. Conditional terminal transitions ensure that submission, expiration, and abandonment cannot each win for the same Assessment.

`ABANDONED` is terminal, has no Answers or Result, and retains all Assessment Question snapshots. Expiration takes precedence over abandonment after the deadline.

## Assessment History Read Model

Assessment stores a snapshotted Technology identifier and display label at creation for stable historical display and filtering. It also stores `startedAt`, `expiresAt`, `completedAt`, and `abandonedAt` as applicable. For an expired Assessment, `terminalAt` is derived from `expiresAt` rather than lazy update time.

History actual Topic distribution is grouped from immutable Assessment Question snapshot columns. Completed score summaries use current active successful Evaluation outcomes; expired and abandoned Assessments have no Result.

Indexes support owned history ordered by `startedAt` and identifier, plus optional status, snapshotted Technology identifier, Level, and UTC date-range filters. The opaque cursor contains the two ordering values and is bound to a stable representation of the filter set.

## Critical Constraints

- Canonical User email is unique at the database level.
- Track Technology membership is unique per Track and Technology and has an unambiguous order within each Track.
- Topic requires one Technology; Question requires one Topic and has no redundant Technology foreign key.
- Rubric Criterion weights use exact decimal storage and total exactly 1 under transactional validation.
- Difficulty is constrained to integers 1 through 5; snapshot `maxPoints` is exactly 1 in the MVP.
- Assessment start idempotency is unique by User, operation scope, and key digest.
- A partial unique PostgreSQL index permits at most one `IN_PROGRESS` Assessment per User.
- Assessment Question source identity and order are unique within one Assessment; snapshot rows have no update workflow.
- Answer is unique by Assessment Question.
- Evaluation is unique by Answer; active successful Attempt selection is explicit and cannot be erased by a failed retry.
- Evaluation Job deduplication prevents more than one active logical job for the same Long Answer Evaluation.
- Refresh Token hash is unique, and rotation/revocation writes are conditional or locked.
- Rate-limit bucket scope/key identity is unique and updated atomically.

## Index Plan

Indexes must support:

- Catalog administration by status and User catalog Effective Eligibility through Technology, Topic, Question, Level, Type, and Difficulty.
- Ordered Track Technology and Question Option reads.
- Eligible-inventory counts and selection by Topic, Type, Level, status, and random/fair tie-breaking inputs.
- Seen history by owning User, source Question, and snapshot creation time.
- Owned Assessment history by User, `startedAt`, identifier, status, snapshotted Technology, and Level.
- Completed Progress aggregation by User, Assessment status/completion time, snapshot Technology/Topic/Level/Type, Answer, and active Evaluation.
- Evaluation Job claims by status and `availableAt`, plus expired lease reclamation.
- Refresh Token lookup by SHA-256 hash and session/family status.
- Rate-limit bucket identity and bounded expiration cleanup.

Exact index definitions must be validated against generated SQL and query plans. Partial indexes or constraints unsupported by the Prisma schema are added through reviewed SQL migrations rather than weakened in application code.

### PostgreSQL-Specific Initial-Migration Constraints

The reviewed initial SQL migration supplements Prisma schema syntax with partial unique indexes for one `IN_PROGRESS` Assessment per User, one active Evaluation Job per Evaluation, and at most one correct MCQ option per source Question. It also adds exact value, digest-length, timestamp, lease, score, and range checks.

Deferred PostgreSQL constraint triggers validate the final transactional configuration of an `ACTIVE` Question across Question, Option, Rubric Criterion, and Rubric Pattern rows. This allows draft authoring to be incomplete while preventing an active MCQ, True/False, Short Answer, or Long Answer from committing with invalid private scoring configuration.

## Private Data Boundary

Private source and snapshot data includes correct answers, Reference Answers, Rubrics, criterion weights and patterns, evaluator configuration, matched criteria, private criterion evidence, and sanitized provider audit metadata. These values remain queryable only by the owning internal module or explicitly authorized Administrator/audit operations.

Public API projections use explicit field allowlists and must not serialize private JSON or related entities accidentally. Provider credentials, raw Refresh Tokens, plaintext or normalized passwords, chain-of-thought, and raw provider payloads are never persisted in these models.
