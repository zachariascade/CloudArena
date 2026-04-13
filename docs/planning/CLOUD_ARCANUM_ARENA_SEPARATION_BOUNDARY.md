# Cloud Arcanum / Cloud Arena Separation Boundary

This document defines the intended product boundary between Cloud Arcanum and Cloud Arena.

Its purpose is to reduce architectural ambiguity before we move code, split apps, or extract repos.

It is also explicitly an AI-navigation document: the cleaner this boundary is, the smaller the working set an AI needs to load before making safe changes.

## Why This Split Exists

Cloud Arcanum and Cloud Arena are no longer one product with one primary interaction model.

They are becoming two separate games with different responsibilities:

- Cloud Arcanum is a content and deckbuilding game.
- Cloud Arena is a combat and simulation game.

Today, the repository still mixes some of those concerns in shared contracts, routes, view models, and UI helpers. That increases context load for both humans and AI agents.

The goal of this split is to make each game understandable, buildable, and editable from a much smaller subset of files.

## Product Ownership

### Cloud Arcanum Owns

Cloud Arcanum is the home for canonical collectible-game content and non-combat browsing flows.

It owns:

- card catalog browsing
- card detail display
- set browsing
- universe browsing
- deck browsing
- deckbuilding and deck editing
- canonical card, deck, set, and universe data
- validation of canonical content
- card image presentation for canonical cards
- catalog/search/filter APIs for cards, decks, sets, and universes

Cloud Arcanum should be understandable without loading combat engine rules, encounter scripting, session state, or tactical battle UI.

### Cloud Arena Owns

Cloud Arena is the home for battle simulation and combat gameplay.

It owns:

- combat engine rules
- battle state transitions
- enemy behavior and scenario presets
- session lifecycle
- legal action generation
- interactive battle UI
- replay and trace visualization
- simulation scripts and batch runs
- Arena-specific gameplay card definitions or battle entities

Cloud Arena should be understandable without loading catalog browsing pages, content normalization pipelines, or deck catalog query logic unless we explicitly choose an integration point.

### Important Content Decision

Cloud Arena owns its own cards.

Cloud Arcanum remains MTG-focused and owns its own canonical MTG-style card catalog.

Cloud Arcanum may later gain the ability to view Cloud Arena data, but that should be treated as an integration or read-only presentation feature rather than shared content ownership.

## Shared Surface

Shared code should stay intentionally small.

The default rule for this repo is:

- if code expresses canonical content structure, it can be shared
- if code is product behavior, it should belong to one game

Current default shared surface:

- `src/domain/**`

Notably, we are not creating `src/shared/**` yet.

If a helper feels shared but is not obviously canonical-schema-level, prefer duplicating it or leaving it product-owned until there is a strong concrete need.

### Allowed Shared Modules

The following are acceptable shared candidates:

- `src/domain/**` for canonical schemas and IDs
- tiny general-purpose utilities with no product knowledge
- presentation primitives that are fully domain-neutral

Until we explicitly approve a broader shared layer, only `src/domain/**` should be treated as shared-by-default.

### Not Shared By Default

The following should not live in a shared layer unless there is a very strong reason:

- route definitions that combine both games
- API contracts that combine both games
- view models shaped around one product's UI
- simulation state types
- session payloads
- product-specific constants
- product-specific derived data helpers

## Dependency Rules

These rules should guide refactors and future code review.

### Cloud Arcanum May Import

- `src/domain/**`
- Arcanum-owned modules

### Cloud Arena May Import

- `src/domain/**`
- Arena-owned modules

### Cloud Arcanum Must Not Import

- `src/cloud-arena/**`
- Arena session contracts
- Arena simulation helpers
- Arena UI view models

### Cloud Arena Should Avoid Importing

- Arcanum app routes
- Arcanum browsing view models
- Arcanum API composition layers

If Arena needs canonical content, that dependency should be explicit and narrow.

### Enforcement Intent

These rules should be enforced in code where practical:

- boundary tests should fail on direct `src/cloud-arcanum/** -> src/cloud-arena/**` imports
- boundary tests should fail on direct `src/cloud-arena/** -> src/cloud-arcanum/**` imports
- new shared utilities should require an explicit decision instead of silently appearing

## Data Ownership

### Canonical Content

Cloud Arcanum is the source of truth for:

- `data/cards/**`
- `data/decks/**`
- `data/sets/**`
- `data/universes/**`

### Arena Runtime Content

Cloud Arena owns:

- scenario presets
- enemy definitions
- encounter scripting
- Arena runtime card definitions

## Current Working Assumption

For the separation work, we should assume this intermediate target:

- one repo
- two backend apps
- two frontend apps
- one small shared domain layer

This gives us the AI-context reduction benefits now without forcing a repo split before the boundaries are proven.

We are explicitly choosing a monorepo-first approach for the separation work.

## Repo-Level Target Shape

The exact folder names can change, but the target architecture should look conceptually like this:

```text
apps/
  cloud-arcanum-api/
  cloud-arcanum-web/
  cloud-arena-api/
  cloud-arena-web/
src/
  domain/
  shared/                  # only if truly generic
  cloud-arcanum/           # Arcanum-owned modules only
  cloud-arena/             # Arena-owned modules only
data/
  cards/
  decks/
  sets/
  universes/
tests/
  cloud-arcanum/
  cloud-arena/
```

## AI-Friendly Boundary Goals

The split is successful when the following become true:

- an AI can work on deckbuilding without reading battle-engine files
- an AI can work on combat rules without reading catalog-query files
- changing one game rarely requires touching the other game's contracts
- top-level folders have obvious ownership
- accidental cross-product imports are rare and easy to spot

## Deferred Decisions

These decisions are still open, but they should not block the initial separation work:

- whether the long-term end state is one monorepo or two repos
- whether any UI primitives deserve a dedicated shared package

## Decision For Phase 1

Until we explicitly revise this document, use these defaults:

- treat Cloud Arcanum and Cloud Arena as separate products
- keep canonical content ownership in Cloud Arcanum
- keep combat ownership in Cloud Arena
- prefer duplication over premature sharing when a module is product-shaped
- optimize for smaller local context windows over maximal code reuse
