---
status: accepted
---

# Separate Catalog Status from Effective Eligibility

Tracks, Technologies, Topics, and Questions retain their own `DRAFT`, `ACTIVE`, or `ARCHIVED` status, while new-Assessment eligibility is derived from the strict `Technology → Topic → Question` dependency chain and type-specific validity. This avoids destructive status cascades and preserves reusable Technologies when a Track is archived; used Topic and Question identities cannot move across parents, so archival plus replacement protects seen history and deterministic historical attribution.
