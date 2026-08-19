---
status: accepted
---

# Snapshot Questions per Assessment

Assessment start atomically creates immutable Assessment Question snapshots containing both public content and the private versioned scoring configuration required to reproduce evaluation. This intentionally duplicates data but prevents later Question edits from changing active or historical Assessments and is smaller than building Question revision management for the MVP; Answers and all evaluation workflows therefore reference snapshots, while provider configuration remains on individual Evaluation Attempts.
