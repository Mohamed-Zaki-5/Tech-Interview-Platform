# Technical Interview Platform

This context describes a self-service platform for preparing for technical interviews through structured assessments and progress feedback.

## People

**User**:
A registered person with an immediately active account who prepares for technical interviews by starting and completing their own assessments.
_Avoid_: Candidate, applicant, interviewee

**Account Status**:
The operational availability of a User account: `ACTIVE` may authenticate, while `DISABLED` cannot create or refresh sessions.
_Avoid_: Role, immediate access-token revocation

**Refresh Session**:
A User's independently revocable login relationship and its rotating Refresh Token family, bounded by a fixed absolute expiry.
_Avoid_: Access token, browser session state

**Refresh Token**:
A rotating opaque credential that proves control of one Refresh Session and can obtain a new access token.
_Avoid_: JWT, access token, stored raw token

**Administrator**:
A privileged user who manages the assessment content available to Users.
_Avoid_: Interviewer, recruiter

## Assessment

**Assessment**:
A User's fixed set of questions for one Technology, generated from selected criteria for one answering session. Completion closes the answering session but does not guarantee that every Answer has been evaluated.
_Avoid_: Quiz template, test template

**Assessment Question**:
An immutable snapshot of one source Question as selected for an Assessment, preserving the content and private scoring rules used by that Assessment.
_Avoid_: Live Question, Question revision

**Answer**:
A User's immutable final response to one Assessment Question, created when the complete Assessment is submitted.
_Avoid_: Draft answer, source Question response

**Expired Assessment**:
An Assessment whose answering window ended before a successful final submission. Its Question exposure remains part of the User's history.
_Avoid_: Deleted Assessment, failed submission

**Abandoned Assessment**:
An Assessment a User deliberately ended before final submission. It has no Result, but its Question exposure remains part of the User's history.
_Avoid_: Deleted Assessment, completed Assessment

**Answer Evaluation**:
The scoring outcome for one submitted Answer, produced independently of whether its Assessment answering session is complete.
_Avoid_: Assessment completion

**Result**:
A summary of an Assessment's evaluated performance and evaluation coverage. A Result is partial until every scorable Answer has been evaluated.
_Avoid_: Unqualified final score

**Evaluated Score**:
The percentage of available points earned among evaluated Answers only. It is not a final score while Evaluation Coverage is below 100%.
_Avoid_: Final score when coverage is incomplete

**Evaluation Coverage**:
The percentage of an Assessment's Questions whose Answers have been evaluated. It measures evaluation completeness, not User performance.
_Avoid_: Score, accuracy

**Reference Answer**:
A private example of a satisfactory free-text Answer that helps an Administrator author evaluation criteria.
_Avoid_: User-facing solution, scoring rule

**Rubric Criterion**:
A private, independently weighted expectation used to evaluate a free-text Answer.
_Avoid_: Keyword, public hint

**Evaluation Attempt**:
One auditable invocation of an evaluator for an Answer. Multiple attempts may exist, but only one successful attempt supplies the active evaluation outcome.
_Avoid_: Assessment attempt, retry counter

**Evaluation Job**:
A deferred unit of Long Answer evaluation work with exclusive processing and bounded retry state.
_Avoid_: General-purpose message, in-process task

## Content Catalog

**Track**:
A role-oriented discovery and learning path that presents an ordered collection of reusable Technologies.
_Avoid_: Technology category, assessment category

**Track Technology**:
The ordered association that places a reusable Technology within a Track without making the Track its exclusive parent.
_Avoid_: Technology ownership, parent Technology

**Technology**:
A technical subject in which Users can be assessed and for which progress is measured, such as React or Node.js.
_Avoid_: Track, framework category

**Topic**:
A focused subject area within exactly one Technology and the primary level at which strengths and weaknesses are identified.
_Avoid_: Tag, category

**Question**:
An Administrator-authored assessment item assigned to exactly one primary Topic, from which its Technology is derived.
_Avoid_: Multi-topic Question, Technology-owned Question

**Catalog Status**:
The stored lifecycle state of a Track, Technology, Topic, or Question: `DRAFT`, `ACTIVE`, or `ARCHIVED`.
_Avoid_: Effective Eligibility

**Effective Eligibility**:
Whether active catalog content and every required dependency currently permit the content to appear to Users or enter a new Assessment.
_Avoid_: Stored status, Track ownership

**Question Type Distribution**:
The exact number of Questions of each Question Type requested for an Assessment.
_Avoid_: Assessment template, approximate mix

**Seen Question**:
A source Question that has previously been included in an Assessment Question snapshot belonging to a User, whether or not that Assessment was completed.
_Avoid_: Answered Question, completed Question

**Level**:
The interview seniority targeted by a Question or Assessment: `JUNIOR`, `MID_LEVEL`, or `SENIOR`.
_Avoid_: Beginner, intermediate, advanced, Difficulty

**Difficulty**:
A Question's relative complexity on a scale from 1 to 5 within its assigned Level.
_Avoid_: Level, seniority

**Progress**:
A derived summary of a User's evaluated performance in completed Assessments, measured primarily for Topics and Technologies, optionally grouped by Level, and aggregated across a Track's Technologies.
_Avoid_: Separate track score

**Weak Area**:
An active Topic at a specific Level where a User has enough evaluated Question instances and an Evaluated Score below the configured threshold.
_Avoid_: Low-coverage Topic, insufficient-data Topic, adaptive recommendation

## Platform Operations

**Rate Limit Bucket**:
The admission allowance for one continuous-refill policy and one pseudonymous client, account, or Refresh Session dimension.
_Avoid_: Raw identifier log, fixed-window counter, process-local production limit
