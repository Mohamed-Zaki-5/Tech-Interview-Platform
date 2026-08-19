# Domain docs

This repository uses a single-context domain documentation layout.

## Before exploring

Read the following when they exist and are relevant to the active task:

- `CONTEXT.md` at the repository root.
- ADRs under `docs/adr/` that affect the area being changed.

If these files do not exist, proceed without creating placeholders. The domain-modeling workflows create them when terminology or architectural decisions are actually resolved.

## Expected structure

```text
/
|-- CONTEXT.md
|-- docs/
|   `-- adr/
`-- backend/
    `-- src/
```

## Vocabulary

Use terms as defined in the glossary in `CONTEXT.md`. Avoid introducing synonyms for established domain concepts.

If a required concept is missing from the glossary, reconsider whether new terminology is necessary and capture genuine gaps through the domain-modeling workflow.

## Architectural decisions

If proposed work contradicts an existing ADR, surface the conflict explicitly instead of silently overriding the recorded decision.
