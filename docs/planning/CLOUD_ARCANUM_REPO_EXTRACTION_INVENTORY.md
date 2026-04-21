# Cloud Arcanum Repo Extraction Inventory

This document captures the first-phase extraction inventory for moving Cloud Arcanum into its own GitHub repository named `CloudArcanum`.

The goal here is not to redesign anything yet. The goal is to freeze the boundary, list the files that belong in the new repo, and identify the few remaining surfaces that need to be copied or adjusted during the move.

## Confirmed Extraction Decisions

- new repo name: `CloudArcanum`
- preserve git history: no
- `src/domain/` strategy: copy it into the new repo for now
- post-split relationship: fully independent repos
- issue migration: no
- workflow strategy: copy existing workflows and adjust them
- old monorepo role: keep it active for Cloud Arena only

## Arcanum-Owned Surface To Move

These paths should be copied into the new repo as the starting point for Cloud Arcanum.

### Apps

- `apps/cloud-arcanum-api/`
- `apps/cloud-arcanum-web/`

### Product Logic

- `src/cloud-arcanum/`
- `src/biblical/`

### Shared Schema Layer

- `src/domain/`

### Canonical Data

- `data/cards/`
- `data/decks/`
- `data/sets/`
- `data/universes/`
- `data/sources/kjv/`

### Card Assets

- `images/cards/`

### Tests

- `tests/cloud-arcanum/`

### Scripts

Arcanum-specific scripts to copy:

- `scripts/dev.ts`
- `scripts/dev-arcanum.ts`
- `scripts/dev-api.ts`
- `scripts/dev-web.ts`
- `scripts/build-web-client.ts`
- `scripts/validate.ts`
- `scripts/benchmark-api.ts`
- `scripts/ingest-kjv-genesis.ts`
- `scripts/ingest-kjv-exodus.ts`
- `scripts/ingest-kjv-gospels.ts`
- `scripts/export-card-concepts.ts`
- `scripts/export-exodus-card-concepts.ts`
- `scripts/export-genesis-card-concepts.ts`
- `scripts/export-gospels-card-concepts.ts`
- `scripts/export-bible-wiki-people.ts`
- `scripts/export-bible-wiki-places.ts`
- `scripts/export-bible-wiki-spirits.ts`
- `scripts/node18.sh`

### Docs

The new repo should carry the Arcanum docs surface, including:

- `docs/arcanum/`
- `docs/content/`
- `docs/engineering/CLOUD_ARCANUM_API_SPEC.md`
- `docs/planning/CLOUD_ARCANUM_ARENA_SEPARATION_BOUNDARY.md`
- `docs/planning/CLOUD_ARCANUM_ARENA_SEPARATION_TODO.md`
- `docs/planning/CLOUD_ARCANUM_REPO_EXTRACTION_PLAN.md`
- `docs/planning/CLOUD_ARCANUM_REPO_EXTRACTION_INVENTORY.md`
- `docs/planning/REPO_EXTRACTION_READINESS.md`
- `docs/planning/PRINTABLE_CARDS_PLAN.md`
- `docs/planning/FLEXIBLE_CARD_PRESENTATION_PLAN.md`
- `docs/planning/MVP_PLAN.md`
- `docs/planning/FUTURE_WORK.md`
- `docs/planning/DATA_AND_ASSET_OWNERSHIP.md`

## Workspace Files To Recreate

These files are not product logic, but they will need to be recreated or adapted in the new repo.

- `package.json`
- `tsconfig.json` and any TypeScript configs
- `README.md`
- `.gitignore`
- root test/build/validation wiring
- any CI workflows that exist in the current GitHub repo

## Current Shared Dependency Surface

These are the main items that are still shared in the monorepo and will need attention during the extraction.

### `src/domain/`

This is the one intentionally shared schema layer.

Because we decided to copy it for the first pass, the new repo should treat it as local code instead of a cross-repo dependency.

### Mixed Documentation

Some docs still talk about both games together. Those should be rewritten so the new repo reads as a Cloud Arcanum-only project.

### Cross-Product Scripts

The current root scripts include both Arcanum and Arena commands. In the new repo, only the Arcanum commands should remain.

### Boundary Tests

`tests/separation-boundary.test.ts` currently verifies that `src/domain/` remains shared and that Arcanum and Arena do not cross-import each other.

That logic will need to be rewritten for the new standalone repo so it reflects the new local ownership model.

## Arena-Owned Surface To Leave Behind

These paths should stay in the old monorepo and remain owned by Cloud Arena.

### Apps

- `apps/cloud-arena-api/`
- `apps/cloud-arena-web/`

### Product Logic

- `src/cloud-arena/`

### Tests

- `tests/cloud-arena/`

### Scripts

Arena-specific scripts to keep in the old repo:

- `scripts/dev-arena.ts`
- `scripts/dev-arena-api.ts`
- `scripts/dev-arena-web.ts`
- `scripts/build-arena-web-client.ts`
- `scripts/build-arena-static-site.ts`
- `scripts/preview-arena-static-site.ts`

### Docs

The old repo can keep Arena docs and any mixed historical planning notes, but it should stop presenting Arcanum as an active ownership area once the extraction is complete.

## Files That Need Review Before Copying

These files are likely to need a light rewrite when the new repo is created.

- `README.md`
- `docs/README.md`
- `docs/arcanum/ARCHITECTURE.md`
- `docs/arcanum/AI_NAVIGATION.md`
- `docs/arcanum/DOCS_INDEX.md`
- `apps/cloud-arcanum-api/README.md`
- `apps/cloud-arcanum-web/README.md`
- `scripts/README.md`
- `tests/README.md`

## Immediate Phase 1 Output

This phase is complete when we have:

- a frozen list of Arcanum-owned directories
- a copy strategy for `src/domain/`
- a clear list of files that stay in the old repo
- a clear list of scripts and docs that must be rewritten for standalone GitHub use

## Next Phase Trigger

The next phase can start once the inventory above is accepted.

At that point we can begin constructing the `CloudArcanum` repo shape and start copying the Arcanum-owned tree into it.
