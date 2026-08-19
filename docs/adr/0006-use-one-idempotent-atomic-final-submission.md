---
status: accepted
---

# Use one idempotent atomic final submission

The MVP accepts all Answers in one required-idempotency-key request and atomically creates immutable Answers, deterministic evaluations, Long Answer work, the completed Assessment, and its initial Result. This forgoes server-side drafts and cross-device continuity to keep a clear transaction boundary within one week, while canonical payload hashing, state locking, and uniqueness constraints make network and concurrency retries safe.
