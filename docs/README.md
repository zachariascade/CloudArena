# Cloud Arcanum Docs

This folder is organized both by purpose and by product so active work, reference material, and AI navigation are easier to scan.

## Product Entry Points

- [Cloud Arcanum Docs Index](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arcanum/DOCS_INDEX.md)
- [Cloud Arena Docs Index](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arena/DOCS_INDEX.md)

If you are starting fresh:

- use `docs/arcanum/` for MTG-style catalog, deckbuilding, and content work
- use `docs/arena/` for combat, simulation, and session work
- treat replay and trace-viewer material in `docs/arena/` as legacy scaffolding

## Folders

### `arcanum/`

Product-specific architecture and navigation docs for Cloud Arcanum.

- `ARCHITECTURE.md`
- `AI_NAVIGATION.md`
- `DOCS_INDEX.md`

### `arena/`

Product-specific architecture and navigation docs for Cloud Arena.

- `ARCHITECTURE.md`
- `AI_NAVIGATION.md`
- `DOCS_INDEX.md`

### `planning/`

Core project direction and longer-range roadmap docs. This folder still contains both Arcanum and Arena planning docs, but the product indexes above now point to the right subset.

- `LOW_TIER_ENEMY_IMPLEMENTATION_PLAN.md`
- `ENEMY_PROGRESSIONS_AND_PLAYER_GROWTH.md`
- `CLOUD_ARCANUM_ARENA_SEPARATION_BOUNDARY.md`
- `CLOUD_ARCANUM_ARENA_SEPARATION_TODO.md`
- `COMBAT_ENGINE_IMPLEMENTATION_BRIEF.md`
- `CLOUD_ARENA_RULES_REFERENCE.md`
- `LEAN_V1_COMBAT_ENGINE_CHECKLIST.md`
- `LEAN_V1_COMBAT_ENGINE_IMPLEMENTATION_PLAN.md`
- `LEAN_V1_TRACE_SIMULATOR_TODO.md`
- `TRACE_VIEWER_UI_IMPLEMENTATION_PLAN.md`
- `BATTLE_SANDBOX_MVP_DESIGN.md`
- `TRACE_BASED_SIMULATOR_DESIGN.md`
- `MVP_PLAN.md`
- `FUTURE_WORK.md`

### `product/`

UI and product-focused implementation plans and TODOs.

- `APP_SHELL_UI_REFRESH_TODO.md`
- `CARDS_GRID_IMPLEMENTATION_PLAN.md`

### `engineering/`

API and system-level technical design notes.

- `CLOUD_ARCANUM_API_SPEC.md`
- `AI_NAVIGATION_AND_BULK_EDIT_OPTIMIZATION_SPEC.md`
- `AI_NAVIGATION_BASELINE.md`
- `AI_NAVIGATION_INCREMENTAL_TODO.md`

### `content/`

Authoring guidance and editorial references.

- `AI_AUTHORING_WORKFLOW.md`
- `CARD_STYLEGUIDE.md`

### `content/biblical-series/`

Biblical-series-specific planning and source references.

- `BIBLICAL_SERIES_CARD_TITLE_GENERATION_SPEC.md`
- `BIBLICAL_SERIES_CARD_TITLE_GENERATION_TODO.md`
- `BIBLICAL_SERIES_TYPE_POOLS.md`
- `GREAT_ADVENTURE_BIBLE_TIMELINE.md`

### `archive/`

Compressed history and retired planning context.

- `PROJECT_HISTORY.md`

## Suggested Conventions

- Put active project-wide plans in `planning/`.
- Put product-specific "start here" docs in `arcanum/` or `arena/`.
- Put feature or UI execution docs in `product/`.
- Put API, performance, and systems design in `engineering/`.
- Put editorial or worldbuilding references in `content/`.
- Move completed or replaced docs into `archive/` once they are no longer active.
