---
status: accepted
---

# Decouple Assessment completion from Answer evaluation

An Assessment becomes complete when its answering session is submitted, even if some Long Answers have not been evaluated. Evaluation has its own status and may be retried idempotently because requiring an AI provider for completion would make the core assessment workflow unavailable when an optional external dependency is absent or failing; Results remain explicitly partial until evaluation coverage reaches 100%.
