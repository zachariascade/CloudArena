# Cloud Arcanum Architecture

This document is the high-level architecture guide for the Cloud Arcanum side of the repo.

Cloud Arcanum is the MTG-focused content, catalog, and deckbuilding product.

## Product Responsibility

Cloud Arcanum owns:

- canonical card, deck, set, and universe data
- content validation
- catalog and filter APIs
- card browsing and card detail views
- set and universe browsing
- deck browsing and deckbuilding-oriented UI
- printable and presentation-oriented card views

Cloud Arcanum does not own combat simulation, session state, replay logic, or Arena battle rules.

## Main Code Areas

- `apps/cloud-arcanum-api/`
  - Fastify app for catalog, metadata, and validation responses
- `apps/cloud-arcanum-web/`
  - React app for browsing cards, decks, sets, and universes
- `src/cloud-arcanum/`
  - Arcanum-owned shared contract and product-specific logic
- `src/domain/`
  - canonical shared schema layer used by both products
- `data/`
  - source of truth for canonical content
- `images/cards/`
  - card image assets for canonical content
- `tests/cloud-arcanum/`
  - Arcanum-owned test coverage

## Dependency Boundary

Cloud Arcanum may depend on:

- `src/domain/**`
- Arcanum-owned apps and modules

Cloud Arcanum must not depend on:

- `src/cloud-arena/**`
- `apps/cloud-arena-api/**`
- `apps/cloud-arena-web/**`

If Arcanum ever shows Arena content, that should be a narrow read-only integration rather than shared ownership.

## Runtime Shape

Typical local flow:

- `dev:arcanum:api` runs the catalog API
- `dev:arcanum:web` runs the Arcanum frontend
- `dev:arcanum` runs both together

## Key Docs

- [Cloud Arcanum API Spec](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/engineering/CLOUD_ARCANUM_API_SPEC.md)
- [Printable Cards Plan](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/PRINTABLE_CARDS_PLAN.md)
- [AI Authoring Workflow](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/AI_AUTHORING_WORKFLOW.md)
- [Set Creation Reference](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/SET_CREATION_REFERENCE.md)
- [Cloud Arcanum / Cloud Arena Separation Boundary](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CLOUD_ARCANUM_ARENA_SEPARATION_BOUNDARY.md)
