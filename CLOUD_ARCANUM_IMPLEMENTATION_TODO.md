# Cloud Arcanum App Implementation TODO

## 1. Purpose

This document turns the Cloud Arcanum app planning work into an execution checklist.

It is meant to sit on top of:

- [CLOUD_ARCANUM_TODO.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/CLOUD_ARCANUM_TODO.md)
- [CLOUD_ARCANUM_API_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/CLOUD_ARCANUM_API_SPEC.md)
- [api-contract.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arcanum/api-contract.ts)

This checklist is intentionally split into shared, backend, and frontend work so we preserve a clear separation between the API and the UI.

## 2. Target Repository Shape

- [x] Use `apps/cloud-arcanum-api/` as the backend application root
- [x] Use `apps/cloud-arcanum-web/` as the frontend application root
- [x] Keep `src/cloud-arcanum/` as the temporary shared contract location for now, with a planned later move to a dedicated `packages/cloud-arcanum-contracts/` package if shared code grows

Recommended initial separation:

- `apps/cloud-arcanum-api/` owns filesystem access, normalization, validation integration, and HTTP routes
- `apps/cloud-arcanum-web/` owns UI routes, layout, filters, and rendering
- `src/cloud-arcanum/` temporarily owns shared API contracts until a dedicated shared package is justified

Recommended initial tree:

```text
cloud-arcanum/
  apps/
    cloud-arcanum-api/
      src/
        server.ts
        routes/
        services/
        loaders/
    cloud-arcanum-web/
      src/
        app/
        routes/
        components/
        lib/
  src/
    domain/
    cloud-arcanum/
      api-contract.ts
```

Recommended follow-up rule:

- Keep contracts in `src/cloud-arcanum/` during initial scaffolding to avoid premature package overhead
- Move those contracts into `packages/cloud-arcanum-contracts/` only after both apps are in place and the shared surface becomes large enough to justify a dedicated package boundary

## 3. Shared Foundation

### 3.1 Contracts and Types

- [x] Create shared API contract types in [api-contract.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arcanum/api-contract.ts)
- [x] Review the contract file for any types that should be split into domain-facing vs UI-facing types
- [x] Add route param types for `cardId`, `deckId`, `setId`, and `universeId`
- [x] Add shared helpers for building route URLs from canonical IDs
- [x] Decide that contract types should remain in `src/cloud-arcanum/` for now and only move to `packages/cloud-arcanum-contracts/` later if the shared surface grows substantially

### 3.2 Shared Utilities

- [x] Add a shared list of unresolved-mechanics fields used by draft review logic
- [x] Add a shared helper for deriving `DraftStatusSummary`
- [x] Add a shared helper for deriving `ValidationSummary`
- [x] Add a shared helper for building `ImagePreview`
- [x] Add shared sort-key enums or parser helpers if route handlers and UI filters both need them

### 3.3 Developer Workflow

- [x] Add scripts for running the API locally
- [x] Add scripts for running the web app locally
- [x] Add a combined local dev script for both apps
- [x] Add a short README section explaining how the two apps relate

## 4. Backend TODO

The backend is responsible for reading canonical records, joining relationships, and exposing UI-friendly responses.

### 4.1 App Scaffolding

- [x] Scaffold `apps/cloud-arcanum-api/`
- [x] Add Fastify setup
- [x] Add TypeScript config for the API app
- [x] Add API entry point
- [x] Add route registration structure
- [x] Add static file serving for local images

### 4.2 Filesystem Data Access

- [x] Implement readers for `data/cards/`
- [x] Implement readers for `data/decks/`
- [x] Implement readers for `data/sets/`
- [x] Implement readers for `data/universes/`
- [x] Implement readers for card images under `images/cards/`
- [x] Add safe handling for missing directories and malformed files

### 4.3 Record Normalization

- [x] Build normalized in-memory indexes by card ID, deck ID, set ID, and universe ID
- [x] Resolve card to set relationships
- [x] Resolve set to universe relationships
- [x] Resolve deck to referenced cards, sets, and universe
- [x] Compute reverse deck membership for cards
- [x] Compute counts by status for sets and universes

### 4.4 Derived View Models

- [x] Implement `ImagePreview` derivation
- [x] Implement `DraftStatusSummary` derivation
- [x] Implement list-item builders for cards
- [x] Implement detail builders for cards
- [x] Implement list-item builders for decks
- [x] Implement detail builders for decks
- [x] Implement list-item builders for sets
- [x] Implement detail builders for sets
- [x] Implement list-item builders for universes
- [x] Implement detail builders for universes

### 4.5 Query and Filtering Logic

- [x] Add free-text search for cards
- [x] Add card filtering by universe
- [x] Add card filtering by set
- [x] Add card filtering by status
- [x] Add card filtering by colors
- [x] Add card filtering by rarity
- [x] Add card filtering by `hasImage`
- [x] Add card filtering by `hasUnresolvedMechanics`
- [x] Add card filtering by `deckId`
- [x] Add sorting for cards
- [x] Add deck search and filtering
- [x] Add set search and filtering
- [x] Add universe search

### 4.6 API Routes

- [x] Implement `GET /api/health`
- [x] Implement `GET /api/meta/filters`
- [x] Implement `GET /api/cards`
- [x] Implement `GET /api/cards/:cardId`
- [x] Implement `GET /api/decks`
- [x] Implement `GET /api/decks/:deckId`
- [x] Implement `GET /api/sets`
- [x] Implement `GET /api/sets/:setId`
- [x] Implement `GET /api/universes`
- [x] Implement `GET /api/universes/:universeId`
- [x] Implement `GET /api/validation/summary`
- [x] Decide whether to defer `GET /api/validation/entities/:entityId` or include it in the first pass

### 4.7 Validation Integration

- [x] Reuse the existing validator from [validate.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/scripts/validate.ts)
- [x] Add a short-lived in-memory cache for validation output
- [x] Distinguish validator errors from expected draft placeholders in API responses
- [x] Decide how entity-level validation lookup maps from file paths to canonical IDs

### 4.8 Backend Testing

- [x] Add tests for filesystem readers
- [x] Add tests for normalization and relationship expansion
- [x] Add tests for `ImagePreview` derivation
- [x] Add tests for `DraftStatusSummary` derivation
- [x] Add tests for card filter behavior
- [x] Add tests for route responses
- [x] Add tests for missing-image and missing-reference edge cases

## 5. Frontend TODO

The frontend is responsible for consuming API responses and rendering the visual browsing experience.

### 5.1 App Scaffolding

- [x] Scaffold `apps/cloud-arcanum-web/`
- [x] Add React with TypeScript
- [x] Add React Router
- [x] Add frontend entry point
- [x] Add app shell layout
- [x] Add shared page layout and navigation

### 5.2 Data Access

- [x] Add typed API client wrappers based on [api-contract.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arcanum/api-contract.ts)
- [x] Add route loaders or fetch hooks for list and detail pages
- [x] Add query-string helpers for filters and sort state
- [x] Add loading and error handling primitives

### 5.3 Global UI Structure

- [x] Add top-level navigation for Cards, Decks, Sets, and Universes
- [x] Add deep-linkable routes
- [x] Add empty states
- [x] Add not-found states
- [x] Add error states for failed API requests

### 5.4 Cards Experience

- [x] Build cards list page
- [x] Add card search UI
- [x] Add filter controls for universe, set, status, colors, rarity, image presence, and unresolved mechanics
- [x] Add sort controls
- [x] Add card gallery or list item component
- [x] Add visible status badges
- [x] Add image preview fallback rendering
- [x] Add quick signals for unresolved mechanics and validation issues

### 5.5 Card Detail Experience

- [x] Build card detail page
- [x] Render image preview
- [x] Render canonical metadata
- [x] Render mechanics fields including unresolved placeholders
- [x] Render set and universe links
- [x] Render deck usage list
- [x] Render validation summary

### 5.6 Deck Experience

- [x] Build decks list page
- [x] Build deck detail page
- [x] Render commander summary
- [x] Render expanded deck contents
- [x] Render deck totals and counts by status
- [x] Add links from deck cards back to card detail pages

### 5.7 Set and Universe Experience

- [x] Build sets list page
- [x] Build set detail page
- [x] Build universes list page
- [x] Build universe detail page
- [x] Render counts by status and linked child records

### 5.8 Visual Language

- [x] Define badge styles for `draft`, `templating`, `balanced`, and `approved`
- [x] Define warning treatment for unresolved mechanics
- [x] Define display treatment for validation issues
- [x] Define missing-image placeholder treatment
- [x] Ensure cards remain readable on desktop and mobile

### 5.9 Frontend Testing

- [ ] Add tests for key route rendering
- [ ] Add tests for filter UI behavior
- [ ] Add tests for placeholder rendering states
- [ ] Add tests for validation-warning visibility
- [ ] Add tests for empty and error states

## 6. Integration TODO

This section covers the work that proves frontend and backend are cleanly separated but working together.

### 6.1 End-to-End Wiring

- [x] Connect the frontend API client to the local Fastify server
- [ ] Verify image URLs resolve correctly in the browser
- [x] Verify deep links work for card, deck, set, and universe detail pages
- [x] Verify filter state stays reflected in the URL

### 6.2 Separation Checks

- [x] Confirm the frontend does not read from `data/` or `images/` directly
- [x] Confirm the frontend does not perform canonical relationship joining that belongs in the API
- [ ] Confirm the backend does not contain UI-only presentation logic beyond agreed shared helpers
- [x] Confirm shared contracts are imported by both sides instead of duplicated

### 6.3 Acceptance Checks

- [x] A user can browse all cards
- [x] A user can search and filter cards
- [x] A user can open a card detail page
- [x] A user can inspect a deck and its cards
- [x] A user can navigate to related sets and universes
- [x] Draft placeholders are clear and never look like finalized values
- [x] Validation issues are visible but distinct from normal draft incompleteness

## 7. Suggested Build Order

### Phase 1: Shared and Structure

- [x] Create `apps/cloud-arcanum-api/`
- [x] Create `apps/cloud-arcanum-web/`
- [ ] Finalize shared contract utilities
- [x] Add dev scripts

### Phase 2: Backend Core

- [x] Build filesystem readers and indexes
- [x] Build normalized view-model derivation
- [x] Implement health, filters, cards, and card detail routes
- [x] Add validation summary route

### Phase 3: Frontend Core

- [x] Build app shell and routes
- [x] Build cards list page
- [x] Build card detail page
- [x] Connect filters to API

### Phase 4: Decks, Sets, Universes

- [x] Implement remaining list and detail routes
- [x] Build deck pages
- [x] Build set pages
- [x] Build universe pages

### Phase 5: Quality Pass

- [ ] Add tests across backend and frontend
- [ ] Tighten mobile layout
- [ ] Improve empty, loading, and error states
- [ ] Review whether the shared contract should move into its own package

## 8. Definition of Done

The first implementation milestone is complete when:

- [x] The repo contains separate `cloud-arcanum-api` and `cloud-arcanum-web` app folders
- [x] The API reads canonical JSON and serves the agreed route set
- [x] The web app consumes the API rather than the filesystem
- [x] Cards and decks are fully browsable in the UI
- [x] Sets and universes are navigable from the UI
- [x] Draft placeholders and validation issues render clearly
- [ ] Basic tests cover the main data and UI paths
