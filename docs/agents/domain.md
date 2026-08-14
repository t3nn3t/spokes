# Domain Docs

This repository uses a single-context domain model.

## Before exploring

Read:

- `CONTEXT.md`
- ADRs under `docs/adr/` that affect the work

If a document does not exist, proceed silently. Domain documents are created lazily when terminology or architectural decisions are resolved.

## Vocabulary

Use canonical terms from `CONTEXT.md` in specifications, ticket titles, tests and code. Avoid synonyms that the glossary explicitly rejects.

If required terminology is missing or contradictory, invoke domain modeling rather than silently inventing a competing term.

## Architectural decisions

Surface any conflict with an existing ADR explicitly. Do not silently override accepted decisions.
