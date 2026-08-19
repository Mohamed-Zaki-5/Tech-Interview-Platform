---
status: accepted
---

# Use the RFC 9106 Argon2id baseline

Production password hashing uses Argon2id version 19 with 64 MiB memory, three passes, four lanes, at least 16 random salt bytes, and 32 output bytes, stored in the standard encoded form. This [RFC 9106 lower-memory profile](https://www.rfc-editor.org/rfc/rfc9106.html#section-4) is a deliberate security and hosting-capacity floor: asynchronous work and queues are bounded and benchmarked, old hashes migrate only after successful verification, and undersized production hosting must be fixed rather than weakening the parameters.
