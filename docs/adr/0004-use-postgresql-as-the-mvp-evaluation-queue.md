---
status: accepted
---

# Use PostgreSQL as the MVP evaluation queue

Long Answer evaluation runs asynchronously through explicit leased Evaluation Jobs stored in PostgreSQL, allowing job creation to commit atomically with Assessment submission. This avoids unreliable in-process work and a second infrastructure dependency during the one-week MVP; provider calls occur outside transactions, crashed-worker leases can be reclaimed, and the API and worker remain separate process roles within one modular-monolith artifact rather than introducing a general-purpose message broker.
