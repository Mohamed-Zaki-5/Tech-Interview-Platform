# REST API

All domain routes are rooted at `/api/v1`. Process probes are `GET /health/live` and `GET /health/ready` outside the versioned domain prefix.

Public errors use RFC 9457-style Problem Details with content type `application/problem+json`. The safe envelope contains `type`, `title`, `status`, `code`, `detail`, `instance`, and `requestId`, plus `errors` only for safe validation details. It never contains stack traces, database details, secrets, private scoring configuration, provider payloads, or internal provider data.

The API is JSON over HTTPS. The route names below are the proposed `/api/v1` contract for approval before implementation; confirmed behavior and privacy rules remain binding even if a route name changes.

## Proposed API Groups

### Authentication and Profile

- `POST /api/v1/auth/register` — create an active `USER`; no tokens.
- `POST /api/v1/auth/login` — create one Refresh Session, set its cookie, and return an access token plus safe profile.
- `POST /api/v1/auth/refresh` — rotate the Refresh Token cookie and return a new access token.
- `POST /api/v1/auth/logout` — idempotently revoke the current family and clear the cookie.
- `GET /api/v1/me` — return the authenticated safe profile.

### User Catalog

- `GET /api/v1/tracks` — active Tracks with ordered effectively eligible Technologies.
- `GET /api/v1/tracks/:trackId` — one active Track and its ordered Technologies.
- `GET /api/v1/technologies` — active Technologies available through supported catalog paths.
- `GET /api/v1/technologies/:technologyId/topics` — active effectively eligible Topics.

### Assessments and Results

- `POST /api/v1/assessments` — idempotently start an Assessment.
- `GET /api/v1/assessments/active` — return the owned resumable Assessment or no active resource.
- `GET /api/v1/assessments` — filtered cursor-paginated owned history.
- `GET /api/v1/assessments/:assessmentId` — status-sensitive owned detail.
- `POST /api/v1/assessments/:assessmentId/submit` — one atomic idempotent final submission.
- `POST /api/v1/assessments/:assessmentId/abandon` — terminal owned abandonment.
- `GET /api/v1/assessments/:assessmentId/result` — current partial or final owned Result for a completed Assessment.

### Progress

- `GET /api/v1/progress/technologies` — derived Technology aggregates with filters.
- `GET /api/v1/progress/topics` — derived Topic aggregates with Level/Type filters.
- `GET /api/v1/progress/tracks/:trackId` — raw-total aggregation across current Track Technologies.
- `GET /api/v1/progress/weak-areas` — actionable active-content `WEAK` groups.

### Administration

- `GET|POST /api/v1/admin/tracks`
- `GET|PATCH /api/v1/admin/tracks/:trackId`
- `POST /api/v1/admin/tracks/:trackId/activate`
- `POST /api/v1/admin/tracks/:trackId/archive`
- `PUT /api/v1/admin/tracks/:trackId/technologies` — replace the ordered Track Technology membership transactionally.
- Equivalent list, create, detail, edit, activate, and archive operations for `/admin/technologies` and `/admin/topics`.
- `GET|POST /api/v1/admin/questions`
- `GET|PATCH /api/v1/admin/questions/:questionId`
- `POST /api/v1/admin/questions/:questionId/activate`
- `POST /api/v1/admin/questions/:questionId/archive`
- `POST /api/v1/admin/evaluations/:evaluationId/retry` — idempotent controlled Long Answer retry.

There are no public Administrator registration, general User-management, catalog delete, Assessment Template, Answer draft/edit, snapshot mutation, or worker-control endpoints. The Worker claims PostgreSQL jobs directly and is not driven by a public HTTP route.

## Authorization and Data Boundaries

- Registration and login are public but rate-limited. Refresh and logout additionally require the approved browser Origin and Refresh Token cookie.
- User Assessment, Result, history, and Progress operations require an access token and enforce ownership from `sub` rather than trusting a User identifier supplied by the client.
- Administration operations require the `ADMIN` role from a verified access token. The accepted stateless-token window after disabling applies equally to Administrators.
- User Catalog reads expose only effectively eligible active content.
- Administrator Question reads/writes may access private source scoring configuration as required for authoring, but User and Assessment responses never do.
- Unknown request fields are rejected on security- and scoring-sensitive writes.

## Authentication

### Registration

Public registration requires `email`, `password`, and `displayName`. It rejects unknown fields and any client-supplied role or privileged property. Email is trimmed and lowercased without provider-specific rewriting; display name is trimmed.

Password handling requires valid printable Unicode without control characters, applies NFC as the only normalization, preserves case and every space without trimming, and validates 15 through 128 normalized code points and at most 512 normalized UTF-8 bytes. The complete normalized value is checked against a runtime-local blocklist before its exact UTF-8 bytes are hashed. Login applies the identical pipeline before verification.

Passwords may contain printable Unicode and leading or trailing spaces. They are never truncated and have no composition or periodic-change rule. A blocklist rejection returns a safe reason without echoing the password.

Production password hashing uses the fixed Argon2id baseline documented in the architecture. Hashing concurrency and its waiting queue are bounded; overload returns a safe retryable response rather than exhausting memory. Unknown email, invalid password, and disabled account login paths use equivalent generic external failures, including baseline-cost dummy verification for unknown identities.

Authentication endpoints apply shared PostgreSQL rate limits after minimal shape validation and identifier normalization but before Argon2 admission. Every applicable independent bucket must pass. A block returns `429 Too Many Requests`, a coarse `Retry-After`, and a generic body that reveals neither the limiting dimension nor identity/session existence.

If the authoritative limiter is unavailable, authentication returns a safe temporary-service error rather than bypassing it. Client-IP policy trusts only explicitly configured proxy topology and canonicalized addresses.

Production defaults independently limit registration by IP and email HMAC, login by IP and email HMAC, and refresh/logout by IP and resolvable Refresh-family HMAC, using the capacities and continuous refill rates documented in the architecture. Every minimally valid attempt consumes capacity regardless of outcome; success never resets it.

When multiple policies block, the generic `429` uses a coarse rounded-up `Retry-After` sufficient for all applicable buckets. It never returns bucket identity, remaining capacity, precise refill state, or account/session existence.

Every public registration creates an active `USER`. A successful response uses `201 Created` and contains only `id`, canonical `email`, `displayName`, `role`, and `createdAt`. It returns no access token, sets no Refresh Token cookie, and creates no Refresh Session. The frontend authenticates through the normal login operation afterward. Duplicate canonical email returns a documented conflict without credential details.

Registration never returns password hashes or internal password fields and never claims the email is verified. Email verification, password reset, email change, social login, and public Administrator registration have no MVP endpoints.

### Login and Access Tokens

Every successful login creates an independent Refresh Session and returns a 15-minute JWT access token in the response body. Access tokens use minimal claims and are presented as Bearer tokens. Invalid credentials and unavailable account/session states return generic authentication failures.

Access tokens are HS256 JWTs with `typ = at+jwt` and only `sub`, `role`, `jti`, `iss`, `aud`, `iat`, and `exp`. Protected endpoints trust claims only after strict verification of HS256 signature, token type, 15-minute expiry, fixed issuer and audience, required claims, and expected claim shapes. Malformed and unexpected tokens receive a generic authentication error.

### Refresh

Refresh reads an opaque token only from a `Secure`, `HttpOnly`, host-only cookie restricted to the authentication route prefix. It never returns the Refresh Token in JSON. Success atomically rotates the token without extending the family's seven-day absolute lifetime, reloads current User role, sets the replacement cookie, and returns a new access token.

Reuse of a rotated or revoked token revokes the family. Concurrent refresh with the same token cannot succeed twice. Expired, revoked, reused, unknown, or disabled-User sessions return a generic failure.

### Logout

Logout revokes the current Refresh Session or family and clears the cookie using identical Path, SameSite, Secure, and Domain attributes. It is idempotent when no active session exists. Existing access tokens remain usable until their 15-minute expiry. Logout-all-devices is deferred.

### Account Status

Only `ACTIVE` accounts can log in, create or refresh a session, or receive new access tokens. Authentication failures remain generic and never reveal whether an account is absent, disabled, or has invalid credentials.

There are no public, self-service, or general Administrator account-status endpoints. Controlled operational tooling performs status changes. Disabling revokes all refresh families immediately but does not invalidate already issued stateless access tokens, which may remain usable for at most 15 minutes. Re-enabling requires a new normal login.

Refresh and logout require an exactly approved Origin in production. The same-site production deployment uses a host-only `Secure`, `HttpOnly`, `SameSite=Lax` cookie restricted to the authentication route prefix. Exact credentialed CORS origins, required methods and headers only, and `Vary: Origin` are mandatory; wildcard and suffix matching are forbidden.

Localhost origins and development-only cookie differences require explicit environment configuration. Production on unrelated domains is unsupported without pausing for an explicit `SameSite=None; Secure` and CSRF-token redesign.

## Catalog

The public catalog API exposes Tracks with their ordered Technologies, Technologies, and the Topics belonging to each Technology. A Technology may appear in more than one Track.

Administrator catalog operations manage Tracks, Technologies, their ordered `TrackTechnology` associations, and Topics. Topic writes must enforce that each Topic belongs to exactly one Technology.

All catalog entities default to `DRAFT` and use explicit activate/archive transitions. Administrator list operations can filter `DRAFT`, `ACTIVE`, and `ARCHIVED`; User operations return only effectively eligible active data.

Archiving a Track hides that Track without disabling a shared Technology elsewhere. Topic and Question eligibility follows `Technology → Topic → Question`. Activation and reactivation validate dependencies transactionally. No catalog endpoint hard-deletes content.

A Topic that already has Questions or has been used by an Assessment cannot be reassigned to another Technology. Administrators archive it and create a replacement instead.

A Question can change Topic only while draft and absent from every Assessment snapshot. Once snapshotted, it must be archived and replaced to change Topic. Question activation validates all common and type-specific public/private configuration.

Level is exposed using the stable values `JUNIOR`, `MID_LEVEL`, and `SENIOR`. Human-readable labels are a frontend concern and may change without altering these API values.

## Assessments

The assessment-start operation accepts one Technology, one Level, optional Topic filters, and explicit non-negative integer counts for `MCQ`, `TRUE_FALSE`, `SHORT_ANSWER`, and `LONG_ANSWER`. The total is derived from those counts and must be from 1 through the configurable MVP limit, initially 50; the request has no separate authoritative total.

The operation returns the newly created Assessment with its fixed Question set, excluding all correct answers, Reference Answers, evaluation criteria, and private scoring data.

Every supplied Topic must belong to the selected Technology.

Omitting `topicIds` selects from all active Topics under the Technology. Supplying `topicIds` requires a non-empty list of unique identifiers; an explicit empty array is invalid.

All selected Questions must match the Assessment's Level. Their Difficulty values may vary from 1 through 5.

Every selected Question must have exactly one Topic under the selected Technology and must satisfy Effective Eligibility through the complete Technology, Topic, and Question chain. Draft, archived, or dependency-ineligible content is never used for new Assessments.

The backend selects exactly the requested number of unique Questions for every type and never substitutes types. It persists the requested and actual distributions. If any eligible type pool is insufficient, the whole operation fails without creating an Assessment and reports the requested and available count for every insufficient type.

Topic filters define an eligible combined pool rather than per-Topic quotas. The backend balances each Question Type across eligible Topics as inventory permits, may fill one Topic's shortage from another, and does not guarantee representation of every Topic. The Assessment response returns the actual Topic distribution derived from its immutable snapshots.

Selection prefers source Questions the User has never received in any Assessment, then falls back to least-recently-seen Questions with randomized tie-breaking. Correctness and performance never influence selection. Seen history and ordering are internal selection details and need not be exposed in Question responses.

Assessment start applies independent production token buckets of 10 attempts per User per hour and 30 attempts per client IP per hour. After authentication and minimal shape validation, each admitted request consumes both tokens before business validation and selection; failures, completion, expiration, and abandonment never refund or reset capacity. Blocking follows the generic `429` contract.

Assessment start requires a UUID v4 `Idempotency-Key`. Unknown body fields are rejected, Topic identifiers are canonicalized as a sorted unique list, and omitted Topics retain a stable “all eligible” meaning for payload hashing.

After rate-limit consumption, the same User, key, and semantic payload returns the existing safe Assessment state without reselection, optionally indicating an idempotent replay. The same key with different semantics returns a conflict. Different keys are distinct attempts. Raw keys are never echoed or logged.

Question responses are rendered from immutable Assessment Question snapshots. There are no User or Administrator endpoints for modifying snapshots. Source Question edits and archival affect only future Assessments.

User-facing responses expose only public snapshot fields. Private correct answers, Reference Answers, Rubrics, accepted phrases, rejection patterns, evaluator configuration, and internal scoring data are always omitted.

Administrator-defined assessment-template endpoints are out of scope for the MVP.

Submitting all required Answers completes the Assessment even when one or more Long Answers cannot be evaluated. Assessment status and evaluation status are exposed separately.

## Results

Every Result exposes:

- `evaluatedScorePercentage`
- `evaluationCoveragePercentage`
- `evaluatedQuestionCount`
- `totalQuestionCount`
- `unscoredQuestionCount`
- `evaluationStatus`

When evaluation coverage is below 100%, `evaluationStatus` is `PARTIAL` and no final overall score is presented. The frontend can describe this as a provisional or partial Result.

Score calculations use:

```text
evaluatedScorePercentage = earned evaluated points / maximum evaluated points * 100
evaluationCoveragePercentage = evaluated question count / total question count * 100
```

Each Assessment Question contributes one maximum point. MCQ and True/False evaluations award 0 or 1; Short Answer and Long Answer evaluations may award a decimal from 0 through 1. Unevaluated Questions are excluded from both earned and maximum evaluated points.

Results provide score and evaluation-coverage breakdowns by Question Type and Topic. Partial breakdowns must be labelled consistently with the overall Result.

Long Answer evaluations expose `PENDING`, `EVALUATED`, `NOT_EVALUATED`, or `EVALUATION_FAILED`. Retrying a pending or failed evaluation is idempotent and does not reopen the Assessment. `NOT_EVALUATED` means no provider is configured or AI evaluation is disabled; `EVALUATION_FAILED` means a configured provider was called and exhausted its allowed immediate retries.

## Short Answer Evaluation

Short Answer submission enforces configured minimum and maximum lengths and is evaluated synchronously using the versioned deterministic private rubric. User-facing Results may include awarded points and safe general feedback.

User-facing Question, Assessment, and Result responses never expose Reference Answers, Rubric Criteria, criterion weights, accepted alternatives, rejection patterns, matched criterion identifiers, evaluator versions, or exact internal matching details. These fields are available only through appropriately protected Administrator or internal audit operations where explicitly required.

## Long Answer Evaluation

Long Answer provider responses are accepted only after strict structural validation. Expected criterion identifiers must each appear exactly once, unknown identifiers are rejected, and every `awardedFraction` must be between 0 and 1. The backend calculates awarded points from the versioned rubric and never trusts a provider-suggested total.

Provider request and response formats are internal to provider adapters. Public APIs never expose provider prompts, provider-specific payloads, private Reference Answers or rubrics, criterion weights, chain-of-thought, or private audit evidence. User-facing Results may expose only awarded points, safe normalized feedback, and public evaluation status.

## Evaluation Operations

Assessment submission returns immediately after the Assessment, Answers, initial Evaluation states, and required Evaluation Jobs are committed. It may therefore return a partial Result while Long Answers are `PENDING`.

Manual retry is an authenticated Administrator or internal operation. It is idempotent, preserves all previous Evaluation Attempts, and never reopens the Assessment. Evaluation Job fields, lock state, internal attempt evidence, sanitized internal errors, and provider metadata are not part of User-facing responses.

## Final Submission

Final submission requires an `Idempotency-Key` header and exactly one Answer for every Assessment Question. Missing, extra, foreign, or duplicate identifiers reject the full request.

Answer payloads are type-specific: MCQ supplies one snapshotted option identifier, True/False supplies one boolean, and Short and Long Answers supply non-empty trimmed strings within configured limits. The client does not supply authoritative Question Type or scoring information.

The same idempotency key and canonical payload returns the existing completed Result. The same key with a different payload, or a different submission after completion, returns a conflict. Concurrent requests cannot create duplicate Answers, Evaluations, or jobs.

There are no server-side draft, autosave, or post-submission Answer-editing endpoints in the MVP.

## Assessment Expiration

Assessment responses expose authoritative `startedAt`, `expiresAt`, and `status`, and may include a derived `remainingSeconds` convenience value. All timestamps are UTC.

At or after `expiresAt`, submitting an unsubmitted `IN_PROGRESS` Assessment atomically changes it to `EXPIRED` and returns a clear expiration error. Expired Assessments cannot be reopened or submitted. An identical replay of a submission that committed before the deadline still returns the existing Result even when the replay arrives after the deadline.

## Active Assessment and Abandonment

Starting an Assessment while the User owns a non-expired `IN_PROGRESS` Assessment returns a conflict with only its identifier, `startedAt`, and `expiresAt`. A stale active session is expired before creation is attempted. Concurrent starts return the active Assessment created by the winning request.

The authenticated owning User may abandon an Assessment. `IN_PROGRESS` becomes terminal `ABANDONED`; repeated abandonment returns that state idempotently. Completed or expired Assessments return their existing terminal state without mutation, and expiry takes precedence once the deadline passes. Abandonment creates no Result and deletes no snapshots.

## Assessment History

History includes all owned Assessments and lazily expires stale `IN_PROGRESS` records before returning them. Optional filters are status, snapshotted Technology identifier, Level, and a validated UTC `startedAt` range with documented inclusive and exclusive boundaries.

Each summary returns the Assessment identifier, status, snapshotted Technology identifier and label, Level, requested Question Type distribution, actual Topic distribution, total Question count, `startedAt`, `expiresAt`, `terminalAt`, and `resumable`.

For completed Assessments, the summary also returns current aggregate evaluation status, `earnedPoints`, `evaluatedMaxPoints`, `evaluatedScorePercentage` marked provisional below full coverage, `evaluatedQuestionCount`, `totalQuestionCount`, `unscoredQuestionCount`, `evaluationCoveragePercentage`, and `finalScorePercentage` only at exactly 100% coverage. Otherwise final score is null.

Stable cursor pagination orders by `startedAt` descending then Assessment identifier descending. The opaque cursor contains both values, is reusable only with the same filters, and has a default page size of 20 and maximum of 100. `nextCursor` is returned when another page exists.

The separate owned-detail operation follows status-sensitive behavior: resumable public Questions for in-progress sessions; public Questions, Answers, awarded points, state, coverage, safe feedback, and breakdowns for completed sessions; and public historical snapshots without Result or fabricated Answers for expired or abandoned sessions.

Every query enforces authenticated ownership. History and detail never expose correct-answer data, Reference Answers, private Rubrics or patterns, internal criterion evidence, sensitive evaluator versions or prompts, provider payloads or metadata, credentials, request identifiers, usage, or internal errors.

## Progress

Progress endpoints derive performance from completed Assessments and active successful Evaluations. They expose raw `earnedPoints`, `evaluatedMaxPoints`, `evaluatedQuestionCount`, `totalQuestionCount`, and `unscoredQuestionCount`, plus evaluated score and evaluation coverage percentages.

Breakdowns support Technology, Topic, Level, and Question Type using immutable snapshot identifiers and labels, including for archived source records. A zero denominator returns a documented null percentage.

Track progress aggregates raw totals for Technologies currently associated with that Track and never averages Technology percentages. Partial evaluation remains explicit in every aggregate.

### Weak Areas

Each Technology, Topic, and Level group is classified as `INSUFFICIENT_DATA`, `WEAK`, or `NOT_WEAK` using configurable values initially set to 5 evaluated Questions and a 60% score threshold. The unrounded score determines classification; rounding is presentation-only.

Each classified group returns:

- Snapshotted Technology identifier and display label.
- Snapshotted Topic identifier and display label.
- Level and classification.
- `earnedPoints` and `evaluatedMaxPoints`.
- `evaluatedScorePercentage`.
- `evaluatedQuestionCount` and `totalQuestionCount`.
- `unscoredQuestionCount` and `evaluationCoveragePercentage`.
- `minimumEvaluatedQuestions` and `weakScoreThresholdPercentage` used.

The actionable weak-area operation returns only `WEAK` groups whose current Technology and Topic are active, ordered by lowest unrounded score, highest evaluated Question count, then Topic identifier. Progress reporting retains insufficient-data and archived-content groups.

## API Conventions Still Requiring Confirmation

The Phase 1 route map, Problem Details envelope, safe validation-error shape, and health/readiness routes are confirmed above. Percentage rounding precision and Administrator/manual-retry rate limits remain to be confirmed before their respective endpoints are implemented. Error responses must remain safe, stable, and non-enumerating.
