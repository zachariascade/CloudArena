# Data And Asset Ownership

This document locks the current ownership model for canonical data, Arena runtime content, and visual assets.

## Cloud Arcanum Owns

Cloud Arcanum is the source of truth for canonical MTG-style content under:

- `data/cards/`
- `data/decks/`
- `data/sets/`
- `data/universes/`

Cloud Arcanum also owns canonical card presentation assets under:

- `images/cards/`

## Cloud Arena Owns

Cloud Arena owns:

- runtime card definitions in `src/cloud-arena/cards/`
- scenario presets and encounter content in `src/cloud-arena/scenarios/`
- battle and simulation logic in `src/cloud-arena/`

Cloud Arena should treat its gameplay content as product-owned, not derived from Arcanum's canonical card catalog.

## Arena Viewer In Arcanum

Arcanum rendering Arena content is deferred.

If it happens later, it should be a read-only viewer or linked integration, not shared data ownership.

## Arena Visual Assets

Arena should move toward owning its own visual assets over time.

Recommended direction:

- keep Arena-specific UI assets in `apps/cloud-arena-web/src/assets/`
- add product-owned Arena card or encounter art under an Arena-owned asset path when needed
- avoid treating Arcanum card art as Arena-owned source material

## Shared Read-Only Asset Usage

Current shared read-only asset usage should be treated as transitional only.

If Arena reuses an Arcanum-derived visual for presentation, that should be:

- explicitly documented
- read-only from Arena's perspective
- easy to replace with Arena-owned assets later

## Current Policy

- Arcanum owns canonical MTG-style content and its associated images
- Arena owns combat content, runtime definitions, and its future art pipeline
- `src/domain/**` remains the only shared-by-default schema surface
