# Cloud Arena AI Navigation

This guide is for AI-assisted work that should stay inside the Cloud Arena slice of the repo.

## Start Here

For most Arena tasks, load only these areas first:

- `apps/cloud-arena-api/`
- `apps/cloud-arena-web/`
- `src/cloud-arena/`
- `tests/cloud-arena/`
- `src/domain/`

## Load By Task

For engine and rules work:

- `src/cloud-arena/`
- `tests/cloud-arena/`
- `docs/planning/CLOUD_ARENA_RULES_REFERENCE.md`
- `docs/planning/CORE_COMBAT_SPEC.md`

For session API work:

- `apps/cloud-arena-api/src/routes/`
- `apps/cloud-arena-api/src/services/`
- `src/cloud-arena/api-contract.ts`
- `tests/cloud-arena/api-routes.test.ts`
- `tests/cloud-arena/session-service.test.ts`

For replay and interactive UI work:

- `apps/cloud-arena-web/src/routes/`
- `apps/cloud-arena-web/src/components/`
- `apps/cloud-arena-web/src/lib/`

Replay tooling is now legacy-only. Do not expand it.

## Usually Avoid

Unless the task is explicitly about a shared schema:

- legacy browsing folders
- legacy content folders

## Good Defaults

- prefer Arena-owned tests when verifying Arena changes
- prefer `dev`, `dev:api`, `dev:web`, `dev:arena`, and `arena:*` scripts for local work

## Related Index

- [Cloud Arena Docs Index](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arena/DOCS_INDEX.md)
