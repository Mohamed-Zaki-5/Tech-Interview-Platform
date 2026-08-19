---
status: accepted
---

# Establish the Phase 1 platform contract

The backend supports Node.js 24.19.0 with npm 11, JavaScript ECMAScript modules, and no TypeScript application source; `checkJs` provides no-emit static checking. REST composition remains under `/api/v1`, public failures use safe RFC 9457-style Problem Details, and `/health/live` plus PostgreSQL-aware `/health/ready` separate liveness from readiness. Results remain fully derived rather than persisted, while structured operational logging is the initial account-status audit sink. PostgreSQL-specific partial indexes, checks, and deferred Question-configuration triggers live in the reviewed initial migration where Prisma schema syntax cannot express the accepted invariants.
