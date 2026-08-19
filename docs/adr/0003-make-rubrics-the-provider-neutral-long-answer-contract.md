---
status: accepted
---

# Make rubrics the provider-neutral Long Answer contract

Long Answer providers return strictly validated per-criterion fractions, while the backend calculates the score from the versioned private rubric and selects the active successful Evaluation Attempt. Keeping provider-specific formats behind adapters prevents vendor lock-in and untrusted provider totals from becoming domain truth, while auditable normalized outcomes preserve reproducibility without storing chain-of-thought or exposing private scoring data.
