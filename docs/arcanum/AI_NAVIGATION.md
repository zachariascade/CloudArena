# Cloud Arcanum AI Navigation

This guide is for AI-assisted work that should stay inside the Cloud Arcanum slice of the repo.

## Start Here

For most Arcanum tasks, load only these areas first:

- `apps/cloud-arcanum-web/`
- `apps/cloud-arcanum-api/`
- `src/cloud-arcanum/`
- `src/domain/`
- `tests/cloud-arcanum/`
- `data/`

## Load By Task

For card browsing or display work:

- `apps/cloud-arcanum-web/src/routes/`
- `apps/cloud-arcanum-web/src/components/`
- `apps/cloud-arcanum-web/src/lib/`

For catalog API or filters:

- `apps/cloud-arcanum-api/src/routes/`
- `apps/cloud-arcanum-api/src/services/`
- `apps/cloud-arcanum-api/src/loaders/`
- `src/cloud-arcanum/api-contract.ts`

For content validation or canonical schema changes:

- `src/domain/`
- `scripts/validate.ts`
- `tests/cloud-arcanum/validate.test.ts`
- `tests/cloud-arcanum/schema.test.ts`

For deckbuilding or content-authoring tasks:

- `data/decks/`
- `data/cards/`
- `docs/content/`
- `docs/reference/`

## Usually Avoid

Unless the task is explicitly about cross-product integration, avoid loading:

- `apps/cloud-arena-api/`
- `apps/cloud-arena-web/`
- `src/cloud-arena/`
- `tests/cloud-arena/`

## Good Defaults

- treat `src/domain/` as shared schema, not product behavior
- prefer Arcanum-owned tests when verifying Arcanum changes
- prefer product-local scripts such as `dev:arcanum`, `arcanum:validate`, and `arcanum:process:*`

## Related Index

- [Cloud Arcanum Docs Index](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arcanum/DOCS_INDEX.md)
