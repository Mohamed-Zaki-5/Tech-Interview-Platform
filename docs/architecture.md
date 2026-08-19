# Backend Architecture

## Decision Status

### Locked Decisions

- Runtime: Node.js
- Language: JavaScript
- Web framework: Express.js
- Database: PostgreSQL
- ORM: Prisma
- API style: REST
- Architecture style: modular monolith
- Frontend: a separately developed React application
- Initial technology coverage: React and Node.js
- Delivery target: a realistic MVP within one week

The supported Phase 1 production runtime is Node.js 24.19.0 with npm 11. Source and configuration use modern ECMAScript modules. JavaScript is checked with TypeScript `allowJs`/`checkJs` in no-emit mode; TypeScript application files are not used.

### Confirmed Product Boundary

The MVP is a self-service technical interview preparation platform. Users start assessments for themselves, while Administrators manage assessment content.

The MVP does not include organizations, interviewer or recruiter accounts, invitations, assigned assessments, or assessment scheduling.

### Resolved MVP Scope

The one-week backend MVP includes:

- Public User registration plus login, refresh, logout, `USER` and `ADMIN` roles, and controlled account disabling.
- A reusable Track, Technology, Topic, and Question catalog initially seeded for React and Node.js.
- MCQ, True/False, Short Answer, and Long Answer Questions with private scoring configuration.
- Dynamic self-service Assessment creation with exact User-selected type counts, optional Topic filtering, balanced selection, seen-Question preference, immutable snapshots, expiration, abandonment, and one atomic final submission.
- Deterministic MCQ, True/False, and Short Answer evaluation.
- Optional provider-neutral asynchronous Long Answer AI evaluation that cannot block Assessment completion or the rest of the backend.
- Partial/final Results with score and coverage breakdowns by Question Type and Topic.
- Owned Assessment history, derived Progress by Technology, Topic, Level, and Type, aggregated Track views, and derived Weak Areas.
- Administrator catalog and Question-management APIs plus controlled Long Answer retry.
- PostgreSQL-backed Evaluation Jobs and shared rate limits within one modular-monolith deployment artifact.

Explicitly out of scope are code execution and code Questions, payments, subscriptions, mobile applications, adaptive selection, notifications and email workflows, organizations and recruitment workflows, Assessment templates, microservices, external message brokers, advanced analytics, server-side Answer drafts, public User administration, and advanced Question-bank anti-scraping.

### Remaining Decisions Requiring Confirmation

The domain and core architecture are resolved. Before the relevant later phase or production deployment, confirm:

- Long Answer provider/model choice, provider timeouts, immediate retry count, job lease duration, maximum attempts, and retry schedule.
- Exact Short Answer and Long Answer length limits, remaining catalog/profile field-length limits, and the final-submission idempotency-key syntax/canonical encoding.
- Password blocklist source, version, license, packaging, and update cadence.
- Administrator mutation and manual-Evaluation-retry rate limits.
- The complete aggregate Evaluation-status enum beyond the confirmed `PARTIAL` behavior.
- Production hosting vendors, database backup/restore targets, observability/log retention, and secret-management provider.
- Seed breadth: Topic list, Question counts per Level and Type, and authored rubric content for React and Node.js.

These open items must not be mistaken for changes to the locked stack or confirmed domain decisions.

## Proposed Module Boundaries

The backend is one modular monolith with one PostgreSQL database and one codebase that can start as an API process or Evaluation Worker. Modules communicate through in-process application interfaces, never internal HTTP.

- **Identity and Access** owns Users, password verification, roles, Account Status, access-token issuance, Refresh Sessions, registration, login, refresh, logout, and operational status changes.
- **Rate Limiting** owns shared token-bucket admission and trusted-client-IP derivation. It is infrastructure used by authentication and business operations.
- **Catalog** owns Tracks, Technologies, ordered Track Technology associations, Topics, lifecycle state, and Effective Eligibility.
- **Question Bank** owns source Questions, options, private Reference Answers, Rubric Criteria, type-specific validation, and Question lifecycle.
- **Assessments** owns start idempotency, selection, immutable Assessment Question snapshots, answering-session state, expiry, abandonment, final submission, and history.
- **Evaluation** owns deterministic evaluators, the Long Answer provider-neutral contract, Answer Evaluations, Evaluation Attempts, provider adapters, and active-attempt selection.
- **Evaluation Jobs** owns the PostgreSQL queue, leases, retry classification, and the Worker process role.
- **Results** owns score/coverage calculation and Topic/Type breakdowns derived on read. It owns no Result table; immutable snapshots, Answers, and active successful Evaluations are authoritative.
- **Progress** owns derived Technology, Topic, Level, Type, Track, and Weak-Area read models; it owns no mutable progress tables.
- **Administration** is an authorized application/API surface over Catalog, Question Bank, and Evaluation retry operations; it does not duplicate their data ownership.
- **Platform** contains narrow cross-cutting adapters for configuration, Prisma, HTTP errors, logging, time, randomness, and cryptography without absorbing domain rules.

Dependency direction follows source ownership: Assessments read Catalog and Question Bank but own their snapshots; Evaluation reads Answers and snapshots; Results read active Evaluations; Progress reads completed Assessments, snapshots, and active Evaluations. Provider-specific code depends inward on the Evaluation interface, never the reverse.

### Phase 1 Platform Contracts

REST module composition uses the documented route names under `/api/v1`. Process health is outside the versioned domain API: `GET /health/live` reports process liveness without dependency checks, while `GET /health/ready` checks PostgreSQL through the database adapter and returns `503` without exposing connection details when unavailable.

Public errors use RFC 9457-style Problem Details with `application/problem+json`. Safe fields are `type`, `title`, `status`, `code`, `detail`, `instance`, and `requestId`; `errors` appears only for safe field-validation details. Stack traces, database details, secrets, private scoring data, provider data, and raw internal errors are never serialized.

Structured operational logging is the MVP audit sink for controlled account-status changes. No database audit entity exists in Phase 1. Logs use request identifiers and redact Authorization, Cookie, token, password, and secret fields.

## Content Catalog

A Track is a role-oriented discovery and learning path. Tracks group Technologies for navigation and present them in an Administrator-controlled order. Technologies are reusable across Tracks.

Each Topic belongs to exactly one Technology. Each Assessment is anchored to exactly one Technology and may filter or distribute its questions across Topics from that Technology.

Each source Question belongs to exactly one required Topic. Its Technology is derived exclusively through `Question → Topic → Technology`; a Question cannot independently store or select a Technology. Questions covering several concepts receive one primary Topic in the MVP. Multi-Topic Questions are deferred.

Level is a global interview-seniority classification with the fixed stored values `JUNIOR`, `MID_LEVEL`, and `SENIOR`. Topics are reusable across Levels and therefore have no Level of their own. Each Question and Assessment has exactly one Level, and all Questions selected for an Assessment must match it.

Difficulty is distinct from Level. Every Question has an integer Difficulty from 1 through 5. An Assessment may mix Difficulty values while remaining within one Level.

The initial catalog is:

- Frontend Track → React
- Backend Track → Node.js

The model permits a future Full-Stack Track to reuse both React and Node.js without duplicating either Technology.

Assessment start validates every candidate Question's Topic, derived Technology, Question status, Level, Type, and Difficulty. Archived or inactive Questions, Topics, and Technologies are ineligible for new Assessments. Existing Assessment Question snapshots remain unaffected by later archival.

A Topic that has Questions or has appeared in an Assessment cannot move to another Technology. An Administrator must archive it and create a new Topic under the correct Technology.

### Catalog Lifecycle and Effective Eligibility

Tracks, Technologies, Topics, and Questions share stored statuses `DRAFT`, `ACTIVE`, and `ARCHIVED`; creation defaults to `DRAFT`. Only effectively eligible active content appears to Users or enters new Assessments. Draft and archived content remains Administrator-only, and the MVP exposes no catalog hard-delete operation.

Stored status is not Effective Eligibility. The strict dependency chain is `Technology → Topic → Question`. An active Topic is eligible only while its Technology is active; an active Question is eligible only while its Topic and derived Technology are active and its type-specific configuration remains valid. Archiving a parent leaves descendant statuses unchanged but makes them ineligible. Valid reactivation can restore eligibility.

Track membership is not part of that exclusive dependency chain. Archiving a Track hides that Track and its catalog paths but does not globally disable a reusable active Technology that remains available through another active Track or a supported Technology catalog path.

Activation and reactivation validate required fields and dependencies transactionally:

- Track: valid required fields and ordered Track Technology relationships required by the catalog contract.
- Technology: complete valid Technology fields.
- Topic: complete valid fields and an active Technology.
- Question: complete common fields, an active Topic and effectively active Technology, plus a valid type-specific private scoring configuration.

Question activation requires ordered public options and exactly one private correct option for MCQ; one private Boolean answer for True/False; a private Reference Answer, criteria totaling 1, accepted alternatives, optional rejection rules, and evaluator version for Short Answer; or a private Reference Answer, stable weighted criteria totaling 1, rubric version, and evaluator/prompt contract version for Long Answer.

A Topic can change Technology only while draft and unused by any Question or Assessment snapshot. A Question can change Topic only while draft and absent from all Assessment snapshots. Once used, either move is forbidden regardless of later status; Administrators archive the old identity and create a new one. This preserves seen history and deterministic historical attribution.

Every selection query evaluates Effective Eligibility, not only the Question's stored status. Lifecycle changes never mutate snapshots, Answers, Evaluations, Results, seen history, or historical Progress.

## Assessment Creation

Assessments are generated dynamically; the MVP has no Administrator-defined assessment templates. A User supplies one Technology, one Level, an optional Topic filter, and exact counts for all four Question Types. The backend selects eligible Questions and fixes that selection for the lifetime of the Assessment.

The backend owns question selection. The resulting Assessment must not change if an Administrator later edits or archives source questions.

### Question Type Distribution

The User explicitly requests a non-negative integer count for each Question Type: `MCQ`, `TRUE_FALSE`, `SHORT_ANSWER`, and `LONG_ANSWER`. The Assessment size is derived from their sum; there is no separate authoritative total. Each type may have zero Questions, but the total must be between 1 and the configurable MVP limit, initially 50.

Selection is all-or-nothing. The backend creates exactly the requested count for every type, never substitutes types, and never creates a partially populated Assessment. Questions are unique within an Assessment.

Before creating any record, the backend verifies the eligible inventory for every requested type after applying Technology, Level, active Topic and Question status, and supported Topic filters. Insufficient inventory causes the entire operation to fail with requested and available counts for every insufficient type.

The requested distribution and actual selected counts are retained for validation and auditing. Frontend presets may construct a distribution but have no backend identity and are not Assessment templates.

### Topic Filtering and Balance

Omitting `topicIds` makes every active Topic under the selected Technology eligible. Providing `topicIds` requires a non-empty list of unique active Topics belonging to that Technology; an explicit empty list is invalid. The Topic filter is evaluated together with Question status, Assessment Level, and requested Question Type.

The filter defines eligibility rather than exact quotas. A shortage in one Topic may be filled from another eligible Topic, and creation fails only when the combined pool cannot satisfy a requested Question Type. Representation of every eligible Topic is not guaranteed when fewer Questions are requested than there are Topics.

Within each Question Type, selection:

1. Randomizes or fairly rotates eligible Topics so the first Topic is not consistently favored.
2. Prefers the Topic with the fewest Questions of that type already selected.
3. Selects one unique eligible Question from that Topic.
4. Skips exhausted Topics and continues until the exact requested count is reached.

The random source is injectable or otherwise controllable in tests. Question-Type-by-Topic quota matrices and guaranteed representation of every filtered Topic are outside the MVP.

The Assessment persists the requested Topic filter. Its immutable Assessment Question snapshots are authoritative for the actual Topic distribution, avoiding a separately maintained summary.

### User Exposure and Repeat Selection

A source Question becomes seen by a User when it is included in one of the User's Assessment Question snapshots. Exposure is identified by `sourceQuestionId` and snapshot creation time, regardless of whether the Assessment is submitted, abandoned, or expired. Substantial content changes that should count as a new Question require archiving the source Question and creating another source record.

Selection priority is:

1. Satisfy the exact count requested for each Question Type.
2. Preserve balanced distribution across eligible Topics.
3. For each Topic and type slot, prefer an unseen eligible source Question.
4. Randomize among equally eligible unseen Questions.
5. When no unseen Question is available for a slot, use the least recently seen eligible Question.
6. Randomize ties with the same last-seen time.
7. Never duplicate a source Question within one Assessment.

`lastSeenAt` is the most recent snapshot creation time for the User and source Question. Seen history is derived from immutable snapshots rather than a mutable User Question State record.

Correctness, score, weak Topics, and prior performance never affect selection in the MVP. Previously seen Questions remain valid fallback inventory; creation fails only if total eligible unique inventory cannot meet an exact type count. Archived or inactive Questions remain ineligible.

## Immutable Assessment Question Snapshots

Starting an Assessment atomically creates all of its immutable Assessment Question snapshots in the same transaction. Answers reference these snapshots rather than source Questions. Snapshots have no Administrator update operations and cannot change after the Assessment starts.

Each snapshot preserves:

- Source Question identifier.
- Question Type and text.
- Level and Difficulty.
- Topic identifier and display label.
- Public option identifiers, text, and fixed display order.
- Private correct-answer data for MCQ and True/False.
- Private Reference Answer.
- Complete private Short Answer or Long Answer rubric configuration.
- Rubric version.
- Deterministic normalization or evaluator version where applicable.
- Snapshot schema version.
- `maxPoints`, fixed to 1 in the MVP.
- Question order within the Assessment.

All evaluation, retries, score recalculation, Result breakdowns, and audit views use the snapshot exclusively. Source Question edits or archival affect only future Assessments. Source Questions are archived rather than hard-deleted in the MVP.

The snapshot excludes provider credentials and provider-specific configuration. Each Long Answer Evaluation Attempt separately records the actual provider and model used.

Duplicating private evaluation data per Assessment is accepted for the MVP because it preserves historical behavior without introducing a complete Question revision-management system.

## Assessment Completion and Evaluation

Assessment status and evaluation status are separate concepts. An Assessment becomes `COMPLETED` when the User submits all required Answers; this closes the answering session and does not imply that every Answer has been evaluated.

MCQ, True/False, and available Short Answer evaluations continue independently of Long Answer AI availability. Long Answer evaluation uses a replaceable provider interface, but no AI provider is required for the rest of the backend.

A Long Answer evaluation has one of these statuses:

- `PENDING`: waiting for an evaluation attempt.
- `EVALUATED`: evaluated successfully.
- `NOT_EVALUATED`: AI evaluation is disabled or no provider is configured.
- `EVALUATION_FAILED`: a configured provider was called but failed after its allowed immediate retries.

Pending and failed evaluations may be retried without reopening the Assessment. Retries must be idempotent. A successful retry recalculates the Result and progress derived from it.

An unevaluated Long Answer is excluded from the evaluated score denominator. If any scorable Answer remains unevaluated, the Result is `PARTIAL`; a final overall score exists only at 100% evaluation coverage. The API must never present a partial numeric score as final.

## Scoring Model

Every Assessment Question has `maxPoints = 1`, regardless of Question Type or Difficulty. MCQ and True/False Answers earn either 0 or 1 point. Short Answer and Long Answer evaluations may award any decimal value from 0 through 1 according to their rubric.

Question Type and Difficulty do not implicitly modify score weight. Difficulty remains metadata for selection, progression, filtering, and analytics.

Unevaluated Questions are excluded rather than scored as zero:

```text
evaluatedScorePercentage = earned evaluated points / maximum evaluated points * 100
evaluationCoveragePercentage = evaluated question count / total question count * 100
```

A final score is available only at 100% evaluation coverage. Results include both score and evaluation-coverage breakdowns by Question Type and Topic. Consequently, the Question Type distribution selected for an Assessment determines each type's contribution to its total Result.

## Short Answer Evaluation

Short Answer evaluation is deterministic and has no AI dependency. Each Short Answer Question has a private Reference Answer and one or more private Rubric Criteria. Each criterion has a stable identifier, an Administrator-facing description, a decimal weight from 0 through 1, one or more accepted bounded words or normalized phrases including alternatives, and optional rejection or contradiction patterns. Criterion weights must total exactly 1.

The `SHORT_RUBRIC_V1` algorithm:

1. Reject an Answer that violates its configured minimum or maximum length.
2. Normalize Unicode, letter case, whitespace, and punctuation.
3. Match complete bounded words or normalized phrases, never arbitrary substrings.
4. Award a criterion's weight at most once if an accepted alternative matches.
5. Do not award that criterion if one of its rejection or contradiction patterns also matches.
6. Sum awarded weights and clamp the result to the inclusive range from 0 through 1.

The evaluator is intentionally conservative and does not claim full natural-language understanding. Repeated phrases and keyword stuffing cannot award a criterion more than once. Known reversed or contradictory Answers should be handled with rejection patterns where practical.

Every Short Answer evaluation records the evaluator version and identifiers of matched criteria for reproducibility and auditing. These details remain private. User-facing feedback may provide safe general guidance but must not reveal the rubric or make it easy to game.

## Long Answer Evaluation

Long Answer evaluation uses a replaceable provider interface. The private rubric, not an AI provider, is the source of truth. Each Long Answer Question has a private Reference Answer, private weighted Rubric Criteria totaling exactly 1, and a rubric version.

The provider-neutral request contains the Question text, submitted User Answer, private Reference Answer, Rubric Criteria, and evaluation and prompt versions. The submitted Answer is untrusted content and must be isolated from system evaluation instructions so it cannot override them.

For every criterion, the provider must return:

- The exact criterion identifier.
- An `awardedFraction` from 0 through 1.
- A concise evidence-based rationale.
- Optional safe User-facing feedback.

The response is validated with a strict runtime schema. Every expected criterion identifier must occur exactly once; unknown, duplicated, or missing identifiers invalidate the response. Awarded fractions outside the inclusive 0-through-1 range also invalidate it. Invalid structured responses are evaluation failures.

The backend ignores any provider-suggested total and calculates:

```text
finalScore = sum(criterion.weight * criterion.awardedFraction)
```

The result is clamped to the inclusive range from 0 through 1. The backend selects which successful Evaluation Attempt supplies the active result.

Provider adapters may translate provider-specific requests and responses, but those formats cannot leak into the Assessment, Question, or Result modules. The system neither requests nor stores chain-of-thought or hidden reasoning. It retains only normalized outcomes and concise criterion evidence required for auditing.

User responses may contain awarded points, public result status, and safe normalized feedback. They never contain Reference Answers, private Rubric Criteria or weights, prompts, private criterion evidence, or provider-specific payloads.

## Evaluation Queue and Worker

The MVP uses a deliberately small PostgreSQL-backed asynchronous queue, not a general-purpose message broker. Redis, RabbitMQ, Kafka, and other external brokers are excluded.

Assessment submission and Answer creation occur in one database transaction. For each Long Answer, submission creates an Evaluation status. If an AI provider is configured, the transaction also creates a `PENDING` private Evaluation Job. If no provider is configured, the Evaluation becomes `NOT_EVALUATED` and no job is created. The same transaction completes the Assessment, and the HTTP response returns its current partial Result without waiting for AI.

The API and worker are separate process roles in the same modular-monolith codebase and deployment artifact, with entry points such as `npm run start:api` and `npm run start:worker`. The API process never performs in-process fire-and-forget evaluation.

The worker lifecycle is:

1. Atomically claim eligible jobs using PostgreSQL row locking such as `FOR UPDATE SKIP LOCKED`.
2. Mark claimed jobs `PROCESSING`, assign a unique lock token, and give each lock a lease expiration.
3. Commit the short claim transaction.
4. Fetch the immutable Question and rubric data and call the provider outside any database transaction.
5. Validate and normalize the provider response.
6. In a new transaction, create an immutable Evaluation Attempt, update the active Evaluation, update the job, and recalculate the Result when applicable.

Expired leases make work abandoned by a crashed worker eligible for reclamation. Retries are bounded and configurable, use exponential or scheduled delay, and distinguish transient failures from permanent validation or configuration errors. Retry exhaustion marks the job `FAILED` and its Evaluation `EVALUATION_FAILED`.

Authenticated Administrator or internal operations may request an idempotent manual retry without reopening the Assessment or deleting prior Evaluation Attempts. When supported, provider requests receive a stable job or attempt idempotency key.

## Final Answer Submission

The MVP has no server-side draft or autosave API. The frontend may retain unfinished Answers in memory or local storage, but that state is non-authoritative and does not synchronize across devices.

Final submission contains exactly one Answer for every Assessment Question snapshot. Missing, extra, foreign, or duplicate snapshot identifiers reject the entire request. The backend obtains Question Type and all validation and scoring rules from the snapshot and never trusts a client-supplied type.

Answer shapes are:

- MCQ: exactly one valid snapshotted option identifier.
- True/False: one boolean.
- Short Answer: one non-empty trimmed string within configured length limits.
- Long Answer: one non-empty trimmed string within configured length limits.

The final submission transaction:

1. Locks or atomically transitions the owned Assessment from `IN_PROGRESS`.
2. Validates the complete Answer set.
3. Creates all immutable Answers referencing Assessment Question snapshots.
4. Performs and persists deterministic MCQ, True/False, and Short Answer evaluations.
5. Creates Long Answer Evaluations and Evaluation Jobs when a provider is configured, or marks them `NOT_EVALUATED` without jobs otherwise.
6. Marks the Assessment `COMPLETED`.
7. Establishes the initial Result state.

No external provider call occurs inside the transaction. After commit, Answers and snapshots are immutable. Later Long Answer Evaluation Attempts may change evaluation status and recalculate the Result but cannot modify Answers or reopen the Assessment.

Final submission requires an idempotency key. The backend persists a secure representation of the key and a canonical hash of the validated payload. The same key and payload, or an identical retry against the completed Assessment, returns the existing Result. Reusing the key with a different payload or sending any conflicting post-completion submission returns a conflict.

Concurrent submissions are controlled by the Assessment state transition and database uniqueness constraints. Server-side drafts, autosave, Answer editing, and cross-device draft synchronization are deferred.

## Assessment Expiration

Each Assessment receives immutable `startedAt` and `expiresAt` timestamps when it starts. The backend calculates `expiresAt` from authoritative server or database UTC time plus a configured session duration, defaulting to 24 hours. Users cannot select a duration in the MVP.

Expiration is an operational session rule only and never changes selection, Difficulty, evaluation, or score. At or after `expiresAt`, an `IN_PROGRESS` Assessment cannot be submitted. A transactional or conditional transition verifies both status and deadline, atomically changes it to `EXPIRED`, and prevents submission/expiration races.

`COMPLETED` and `EXPIRED` are terminal. An expired Assessment cannot be reopened or submitted; the User starts another Assessment. Expiration retains all snapshots, and their source Questions continue to count as seen.

Lazy expiry on relevant reads and submission is sufficient for correctness. A future background sweep may materialize stale statuses but is not required in the MVP.

Idempotent replay is checked before rejecting on the current deadline: if the original matching submission committed before `expiresAt`, an identical later retry returns the existing Result even after expiration. If no submission committed in time, the Assessment expires and rejects the payload.

## Active Assessment and Abandonment

A User may own at most one `IN_PROGRESS` Assessment. Starting another first atomically expires a stale active Assessment when its deadline has passed. If a non-expired one remains, the operation returns a conflict containing only its identifier, `startedAt`, and `expiresAt`.

An authenticated owning User may abandon an `IN_PROGRESS` Assessment. Abandonment atomically transitions it to terminal `ABANDONED`, creates no Result, retains every snapshot, and leaves the Questions counted as seen. Repeating abandonment of an already abandoned Assessment returns the existing state. Requests against completed or expired Assessments return their current terminal state without mutation.

Expiration takes precedence when the deadline has already passed. Conditional state transitions ensure that concurrent submit and abandon operations cannot both succeed.

A database partial unique constraint enforcing one `IN_PROGRESS` Assessment per `userId` is the final protection against concurrent starts. If one request loses the creation race, it returns the winning active Assessment. Normal authenticated endpoint rate limits apply, while advanced Question-bank abuse prevention remains outside the MVP.

## Assessment History

History includes every Assessment owned by the authenticated User with status `IN_PROGRESS`, `COMPLETED`, `EXPIRED`, or `ABANDONED`. Before reading history, stale owned in-progress Assessments are lazily expired so they are never presented as resumable.

Assessment creation snapshots the Technology identifier and display label at the Assessment level. Historical presentation and filtering use that snapshot rather than the current mutable Technology label. Actual Topic distribution comes from Assessment Question snapshots.

`terminalAt` is `completedAt` for completed Assessments, `abandonedAt` for abandoned Assessments, the authoritative `expiresAt` for expired Assessments regardless of lazy persistence time, and null while in progress.

History is ordered by `startedAt` descending and Assessment identifier descending. Opaque cursors encode both values and are valid only with the same filter set. The default page size is 20 and maximum is 100.

Assessment detail varies by status:

- `IN_PROGRESS`: public Question content required to resume before expiry.
- `COMPLETED`: public Questions, submitted Answers, awarded points, evaluation state and coverage, safe feedback, and Topic, Type, and evaluation breakdowns.
- `EXPIRED` or `ABANDONED`: historical public Question snapshots, with no fabricated Answers or Result.

All history and detail queries enforce ownership. No response exposes private correct-answer or rubric data, private evidence, prompts or sensitive evaluator versions, provider metadata or payloads, credentials, usage, or internal errors.

## Authentication and Accounts

### Public Registration

Public registration requires email, password, and display name and creates one immediately active User with backend-assigned role `USER`. The input rejects role, privileged fields, and unknown fields rather than accepting or ignoring them. Public `ADMIN` registration does not exist; Administrator accounts come only from controlled seed or operational tooling with securely supplied credentials and no hard-coded production password.

Email is trimmed and lowercased for both identity and display. No provider-specific dot removal or plus-address rewriting occurs. Normalized email uniqueness is enforced by the database. Display name is trimmed and length-validated but not unique.

Passwords preserve spaces and case, are never trimmed, and use NFC as their only normalization. Registration, controlled Administrator creation, and login apply the identical pipeline:

1. Require a string and reject malformed Unicode, including unpaired surrogate code units.
2. Reject Unicode control characters.
3. Apply Unicode NFC normalization.
4. Count normalized Unicode code points and require 15 through 128.
5. Require at most 512 UTF-8 bytes after normalization.
6. Compare the complete normalized value against the local password blocklist.
7. Hash or verify the exact normalized UTF-8 bytes with Argon2id.

Printable Unicode and leading, internal, and trailing spaces are accepted. Passwords are never truncated, subjected to composition rules, or periodically expired. User interfaces allow password-manager autofill and paste.

The Argon2id implementation generates a unique salt per password. Plaintext and normalized passwords are never stored, returned, or logged, and password hashes or related internal fields never leave the authentication boundary. Argon2id parameters are a separate security configuration decision.

The runtime-local blocklist contains common, compromised, and platform-specific complete values; matching never searches arbitrary substrings. It is loaded and validated at startup and has a documented source, version, license, and update process. Registration does not depend on an external breach API. A match returns a safe message such as “Choose a less common password” without echoing the input.

This policy follows the current [NIST SP 800-63B password guidance](https://pages.nist.gov/800-63-4/sp800-63b.html), with the repository-specific upper bounds and local-blocklist operational details stated above.

#### Argon2id Security Configuration

Production uses Argon2id version 1.3/19 with a minimum baseline of 65,536 KiB memory, 3 passes, 4 lanes, at least 16 independently random salt bytes, and a 32-byte hash output. The input is the validated NFC-normalized UTF-8 password bytes. A maintained asynchronous library produces the standard encoded Argon2 string containing variant, version, parameters, salt, and output.

The baseline is the lower-memory recommended profile in [RFC 9106](https://www.rfc-editor.org/rfc/rfc9106.html#section-4).

Production startup rejects missing or below-baseline configuration. Request data can never choose hashing parameters. Older encoded hashes remain verifiable; after successful verification only, a weaker hash is safely replaced with one using current parameters. Parameter upgrades apply to new hashes and migrate old hashes gradually without breaking verification.

Before production, registration, successful and failed login, rehashing, and representative concurrent load are benchmarked on production-class hardware. Individual and concurrent latency and memory behavior are documented. Hosting unable to support the baseline is a deployment-capacity problem, not justification to reduce parameters.

Argon2 work has an explicit memory budget and a bounded concurrency limit derived from roughly 64 MiB plus process overhead per active operation. Excess work enters a bounded short-timeout queue or receives a safe retryable response; work and queue sizes are never unbounded. Authentication rate limits complement this control. The asynchronous library API prevents event-loop blocking.

Unknown login emails are verified against a fixed valid dummy hash using the same baseline before the generic failure. Disabled accounts and invalid credentials remain externally indistinguishable. Only an isolated automated-test environment may use reduced parameters, and production rejects test configuration and hashes.

#### Authentication Rate-Limit Store

Production uses an atomic PostgreSQL token-bucket or sliding-window limiter as the authoritative shared application-level control. Redis is not introduced, and process-local limiting is restricted to isolated tests or local development. Optional hosting or reverse-proxy IP limits remain defense in depth.

Each request must pass every independent endpoint-appropriate bucket, such as IP plus normalized-email identity for login rather than one combined key. Other dimensions may include authenticated User, Refresh Session or family, and policy scope.

Bucket identities are HMAC-SHA-256 values over an unambiguous key type and canonical identifier. They never use raw email, password data, Refresh Tokens, or cookies. The dedicated rate-limit key contains at least 32 random bytes, is unique to the environment and purpose, lives only in deployment secret management, and is validated at startup without logging or frontend exposure.

Authentication processing performs minimal shape validation and safe identifier normalization, then evaluates all applicable buckets before admitting Argon2 work. Blocking returns a generic `429` with coarse `Retry-After`; it reveals neither the exceeded bucket nor account/session existence. Failure of the authoritative limiter returns a safe temporary-service error rather than bypassing protection.

Expired records stop affecting correctness without deletion. Lazy deletion and small bounded periodic batches prevent unbounded transactions or locks. Bucket identity and expiration are indexed.

Client IP derives only from the explicitly configured trusted reverse-proxy topology. Express never blindly trusts arbitrary forwarding headers; the trusted proxy must overwrite or sanitize them, and the resulting IP is canonicalized before HMAC derivation.

Authentication uses continuous-refill token buckets with these production defaults:

| Endpoint | Independent key | Capacity | Refill |
|---|---|---:|---:|
| Registration | Client IP | 10 | 10 per hour |
| Registration | Normalized-email HMAC | 3 | 3 per hour |
| Login | Client IP | 20 | 20 per 15 minutes |
| Login | Normalized-email HMAC | 5 | 5 per 15 minutes |
| Refresh | Client IP | 60 | 60 per 15 minutes |
| Refresh | Refresh-family HMAC | 10 | 10 per 15 minutes |
| Logout | Client IP | 60 | 60 per 15 minutes |
| Logout | Refresh-family HMAC | 10 | 10 per 15 minutes |

Buckets start full, consume one token for every minimally valid attempt regardless of final outcome, and refill proportionally with elapsed time up to capacity. Success does not reset a bucket. All applicable buckets are evaluated atomically; a blocked attempt contributes to other safely evaluable policies without making a balance negative.

Unknown email values use the same normalized-email HMAC policy. Refresh-family policy applies only after safe resolution from the presented token hash; unknown tokens remain under IP policy. Raw tokens never become limiter keys, and logout without a resolvable session remains idempotent but IP-limited.

When several policies block, `Retry-After` is the coarsely rounded-up time until all can permit an attempt. Responses expose no counts, bucket identities, account/session existence, or precise refill state.

Environment configuration may vary thresholds, but production cannot disable a policy or use non-positive capacity or refill. Production changes require review and documentation; development and test values are explicit. Defaults are reviewed after legitimate traffic, especially shared-NAT behavior, but never auto-adjusted.

#### Assessment-Start Rate Limits

Assessment start uses independent continuous-refill production buckets: per authenticated User capacity 10 with 10 tokens per hour, and per trusted client IP capacity 30 with 30 tokens per hour. Both must permit the request.

Processing authenticates the access token, performs minimal request-shape validation, then consumes both tokens before active-session checks, catalog and relationship validation, inventory or seen-history queries, balancing, selection, and snapshot creation. Shape validation covers required identifiers, enum shapes, unique Topic identifiers, non-negative type counts, and a derived total from 1 through 50.

Capacity is consumed even when later work fails due to active Assessment, invalid or inactive catalog state, insufficient inventory, or a concurrent winner. It is never refunded or reset by failure, creation, completion, expiration, or abandonment. Generic `429` behavior and HMAC-protected User/IP keys follow the shared limiter policy.

The MVP intentionally has no weighted Question-exposure budget, per-Topic exposure limit, or advanced scraping detector. Ten maximum-size Assessments can expose 500 snapshots per User per hour through creation and abandonment. Safe metrics therefore track creation, abandonment, expiration, requested size, and repeated-account behavior; stronger protection is required before treating a large private bank as strongly protected.

#### Assessment-Start Idempotency

Every Assessment-start request requires a syntactically valid UUID v4 `Idempotency-Key`. The frontend creates a fresh key for an intentional start and reuses it with the identical semantic payload only for network retry. The key is neither a credential nor a replacement for the access token, and raw values are never logged.

After authentication, minimal header/payload validation, and Assessment-start rate-limit consumption, the backend hashes the key with SHA-256 and builds a deterministic SHA-256 hash of canonical validated fields: Technology identifier, Level, all four type counts, Topic-filter mode, and sorted unique Topic identifiers when supplied. Omission uses a stable “all eligible active Topics” sentinel rather than expanding the current catalog. Unknown fields are rejected.

The Assessment stores both digests for its lifetime with uniqueness scoped to User and start operation. Matching User, key, and payload returns the existing safe Assessment state without reselection in every status. Matching key with a different payload conflicts; a new key is a distinct attempt governed by the active-Assessment constraint.

Assessment, snapshots, distributions, and idempotency metadata commit together. Concurrent identical requests create one resource; uniqueness losers fetch the winner and compare payload hashes. If no transaction commits, a later retry can attempt creation again. Replays still consume rate-limit capacity.

Because email delivery is outside the MVP, accounts are active without verification and the system never claims their email is verified. Email verification, password reset, password change, email change, social authentication, and public Administrator registration are deferred. Any future password-setting workflow must reuse the same policy.

Registration and authentication are separate transaction boundaries. Successful registration creates no Refresh Session, returns no access token, and sets no Refresh Token cookie. The frontend uses the normal login operation afterward.

### Access Tokens

Protected APIs accept a signed JWT access token through `Authorization: Bearer <token>`. Access tokens last 15 minutes, are returned in login and refresh response bodies, and should remain only in frontend memory rather than browser storage.

Claims are limited to `sub`, `role`, `jti`, `iss`, `aud`, `iat`, and `exp`. Every protected request validates the signature, explicitly allowed algorithm, issuer, audience, and expiration. Signing keys or secrets remain outside source control. Access tokens are neither stored nor denylisted; revocation therefore takes effect for an issued access token no later than its remaining 15-minute lifetime.

Access tokens use HS256 because issuance and verification remain inside one modular-monolith trust boundary. The secret is a Base64-encoded value representing at least 32 cryptographically random bytes, unique per environment and distinct from every other application secret. Production startup decodes and validates it and refuses to run when it is absent, malformed, too short, or a documented placeholder.

Issuance uses a maintained JWT library, sets `typ = at+jwt`, generates an unpredictable unique `jti`, and signs only the allowed minimal claims. Verification explicitly permits only HS256 regardless of the header, rejects `none` and every other algorithm, and validates signature, token type, expiration, fixed configured issuer and audience, required claims, and claim shapes before trusting any value.

JWTs are signed rather than encrypted and therefore contain no private data. The secret is never committed, logged, exposed to the frontend, placed as a real value in example configuration, or reused for cookies, database access, Refresh Tokens, AI, or another purpose.

Changing the production secret may invalidate current access tokens immediately; valid Refresh Sessions can issue replacements. Multiple signing keys, `kid` lookup, overlapping rotation, and asymmetric signing are deferred until independent verifiers need verification without signing authority.

### Refresh Sessions and Rotation

Each successful login creates an independent Refresh Session and token family with a fixed seven-day absolute expiry that rotation cannot extend. Refresh Tokens are opaque random values with at least 256 bits of entropy, returned only in a `Secure`, `HttpOnly`, host-only cookie restricted to the authentication route prefix. Raw tokens are never exposed to JavaScript, JSON responses, or logs.

PostgreSQL stores only SHA-256 token hashes plus family, session, expiry, status, replacement, and revocation metadata. Every refresh atomically validates and consumes the current token, checks its session, creates its replacement, and reloads the User and current role before issuing a new access token. Database locking or conditional updates prevent one token from succeeding twice concurrently.

Rotated token hashes remain until family expiry for reuse detection. Presenting a rotated or revoked token revokes the entire family and requires login. Unknown, expired, revoked, reused, or disabled-User sessions produce the same generic authentication failure. Frontends must serialize refresh calls.

Logout idempotently revokes the current Refresh Session or family and clears the cookie with exactly matching attributes. It cannot immediately invalidate an issued access token. Logout across all devices is deferred.

### Account Status

Account status is `ACTIVE` or `DISABLED` for both Users and Administrators. Registration creates `ACTIVE`. Active status is required to log in, create a Refresh Session, refresh a session, or obtain a new access token.

A controlled operational transaction disables an account, records the change time, and revokes every active Refresh Session and token family for that account. It preserves all identity and assessment history. Re-enabling changes the status to `ACTIVE` but restores no session and issues no token; normal login is required.

Access-token authorization remains stateless and does not perform a mandatory account-status lookup. Consequently, an access token issued before disabling can remain usable for at most its remaining 15-minute lifetime. Immediate invalidation would require a denylist, token-version lookup, or per-request account lookup and is deferred.

Authentication failures do not distinguish missing, disabled, or invalid-credential accounts. Public account deletion, public or self-service status changes, and general Administrator User-management APIs are outside the MVP. Status changes require controlled operational tooling, an explicit target, and an audit record or controlled structured log with action, time, operator context, and reason but no secrets.

### Cookie, CORS, and CSRF Deployment Constraint

Production requires a same-site HTTPS deployment even when frontend and backend use separate origins, such as `https://app.example.com` and `https://api.example.com`. Both origins share one registrable domain. Unrelated default hosting domains do not satisfy this requirement; deployments use custom sibling subdomains or a same-origin reverse proxy such as `/api`.

The production Refresh Token cookie is `Secure`, `HttpOnly`, host-only, and `SameSite=Lax`, with no broad `Domain` attribute and a Path restricted to the authentication route prefix. Production never disables `Secure`.

CORS uses one or more explicit approved frontend origins with exact matching, credentials enabled only for approved origins, required methods and headers only, and correct `Vary: Origin` behavior. Wildcards and suffix matching are forbidden. Browser refresh and logout require a present, exactly approved Origin header in production. A separate CSRF token is not used under this same-site policy.

Environment configuration defines the public frontend origin, public API origin, exact CORS allowlist, and cookie Secure, SameSite, and Path values. Local development may explicitly allow configured localhost origins and development-only cookie attributes.

Production must never silently switch to `SameSite=None`. If unrelated public domains become unavoidable, deployment pauses for an explicit redesign using `SameSite=None; Secure`, strict Origin checks, exact credentialed CORS, and a separate CSRF token.

## Progress Ownership

Progress is calculated on demand; there are no mutable User Topic, Technology, or Track progress records in the MVP. Immutable Assessment Question snapshots, Answers, and the currently active successful Evaluation outcomes are the source of truth.

Performance aggregates include only `COMPLETED` Assessments. `IN_PROGRESS`, `ABANDONED`, and `EXPIRED` Assessments are excluded, although their snapshots still count toward seen-Question history. An Answer contributes numeric points only when it has an active successful Evaluation. `PENDING`, `NOT_EVALUATED`, and `EVALUATION_FAILED` Answers remain in coverage totals but not the evaluated score denominator.

A failed retry cannot replace an existing active successful Evaluation outcome. A new successful attempt may become active, and all later progress reads automatically reflect it. Every grouping dimension comes from the immutable snapshot.

Aggregates use raw totals rather than averaging percentages:

```text
earnedPoints = sum(included awarded points)
evaluatedMaxPoints = sum(included evaluated maxPoints)
evaluatedScorePercentage = earnedPoints / evaluatedMaxPoints * 100
evaluatedQuestionCount = count(included evaluated Answers)
totalQuestionCount = count(relevant Questions in completed Assessments)
evaluationCoveragePercentage = evaluatedQuestionCount / totalQuestionCount * 100
unscoredQuestionCount = totalQuestionCount - evaluatedQuestionCount
```

A zero denominator produces a documented null percentage, not a misleading zero. Breakdowns support Technology, Topic, Level, and Question Type. Archived Technology and Topic history remains reportable from snapshot identifiers and labels.

Track progress aggregates raw totals across completed Assessment data for the Technologies currently associated with that Track; it never averages Technology percentages. A Technology reused by several Tracks appears in each relevant Track view without duplicated progress storage.

Materialized views, cached summaries, and mutable progress tables are deferred until measured query performance requires them.

### Weak-Area Classification

Weak areas are derived for each distinct Technology, Topic, and Level group using lifetime data from completed Assessments. There is no recency weighting, decay, persistence, adaptive selection effect, or remediation recommendation in the MVP.

Initial configurable values are:

- `minimumEvaluatedQuestions = 5`
- `weakScoreThresholdPercentage = 60`

Classification uses active successful Evaluation outcomes:

- `INSUFFICIENT_DATA`: fewer than the configured minimum evaluated Question instances.
- `WEAK`: minimum sample satisfied and unrounded Evaluated Score strictly below the configured threshold.
- `NOT_WEAK`: minimum sample satisfied and unrounded Evaluated Score equal to or above the threshold.

Unevaluated Answers remain in total and coverage counts but not the evaluated sample or score denominator. Display values may be rounded only after classification. A newly active successful Long Answer attempt automatically affects the next read.

The actionable weak-area view includes only `WEAK` groups whose current Technology and Topic are active. It sorts by lowest unrounded score, highest evaluated Question count, then stable Topic identifier. Historical Progress continues to include archived content, and insufficient-data groups remain visible without being called weak.
