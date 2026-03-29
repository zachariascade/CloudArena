# Cloud Arcanum Project History

This document is a compressed archive of completed project TODOs, checklists, and setup plans.

When a planning document is fully complete and no longer needs to stay in the active working set, its key outcomes can be summarized here and the original file can be removed.

## Compressed History

### 2026-03-28: Cloud Arcanum App Baseline Progress Compressed

Compressed from completed items in `CLOUD_ARCANUM_TODO.md` so the active TODO can focus on remaining work.

Summary:

- Confirmed the V1 product direction around a read-only local browsing app with cards as the primary landing view, secondary deck/set/universe navigation, deep links, and explicit draft-safe placeholder rendering.
- Locked in the two-app architecture: a Fastify-backed local Node API over canonical JSON plus a separate React web client, with shared route and payload contracts in `src/cloud-arcanum/api-contract.ts`.
- Implemented the app repository structure under `apps/cloud-arcanum-api/` and `apps/cloud-arcanum-web/`, along with documented local startup commands and combined API/web dev scripts.
- Built filesystem loaders for cards, decks, sets, universes, and card images, including normalization, relationship expansion, image resolution, and safe handling for malformed data, missing files, and broken references.
- Added API support for list/detail browsing across cards, decks, sets, and universes, along with card query filters, metadata filter options, validation summary access, and entity-level validation lookups.
- Delivered the main web UI foundation: shell layout, navigation, route structure, deep-linkable cards/decks/sets/universes screens, loading states, error states, and empty states.
- Shipped the card browser with search, filtering, sorting, status badges, quick previews, draft highlighting, unresolved-mechanics visibility, validation signals, and image-availability filtering.
- Shipped the card detail experience with image preview/fallback rendering, canonical metadata, mechanics display, placeholder-safe warnings, set/universe links, and deck usage links.
- Added baseline test coverage for filesystem loading, normalization and relationship expansion, placeholder-oriented rendering behavior, API routes, and shared view-model behavior.
- Reached the first useful local-app milestone: the project runs locally, reads canonical data without mutating source-of-truth files, supports core card browsing/detail flows, and exposes enough relationship context for navigation.

### 2026-03-27: Initial Project Setup Completed

Compressed from the retired `PROJECT_SETUP_CHECKLIST.md`.

Summary:

- Established the repository foundation, local TypeScript tooling, Node 18+ workflow, and base project scripts.
- Created the core domain model for cards, decks, sets, and universes under `src/domain/`.
- Chose the Zod-based schema strategy as the canonical runtime source of truth and documented that decision.
- Added canonical schemas plus relationship rules for cards, decks, sets, and universes.
- Created the `data/` and `images/` folder structure with filename conventions based on stable IDs.
- Added representative sample content across universes, sets, cards, decks, and placeholder imagery.
- Implemented validation tooling for schema correctness, relationships, duplicate IDs, filename alignment, and draft-stage rules.
- Preserved the core CLI workflow with `npm run check`, `npm run build`, `npm run validate`, and automated tests.
- Documented the AI authoring workflow, contributor setup, and repository usage guidance.

Delivered milestone:

- The repository became ready for TS-based schema evolution, AI-assisted content creation, and safe validation-backed authoring.

### 2026-03-27 to 2026-03-28: App Implementation Milestone

Compressed from the active implementation checklist as the backend and frontend core moved into a substantially complete state.

Summary:

- Established the split application structure under `apps/cloud-arcanum-api/` and `apps/cloud-arcanum-web/` with shared contracts in `src/cloud-arcanum/api-contract.ts`.
- Implemented backend filesystem readers, normalization, relationship expansion, validation integration, and UI-oriented list/detail view models.
- Added API routes for health, filters, cards, decks, sets, universes, validation summary, and entity validation, backed by live canonical JSON data.
- Built the React web app shell, route structure, query-string driven filters, API client layer, and reusable loading, error, and empty-state primitives.
- Implemented cards, decks, sets, and universes browsing/detail flows with deep links, status badges, draft placeholder treatment, validation signals, and missing-image fallbacks.
- Fixed browser-to-API connectivity by enabling local CORS support and fixed a frontend fetch binding bug that prevented live data loading.
- Improved the local workflow with a combined watch-mode dev loop and explicit one-shot dev scripts.

Delivered milestone:

- Cloud Arcanum advanced from planning and scaffolding into a working API-backed two-app implementation with live browsing flows across cards, decks, sets, and universes.
