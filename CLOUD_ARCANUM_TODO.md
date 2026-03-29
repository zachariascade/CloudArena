# Cloud Arcanum App TODO

## 1. Purpose

This document expands the `4.1 Cloud Arcanum App` idea from [FUTURE_WORK.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/FUTURE_WORK.md) into a practical planning and execution checklist.

For the execution-focused build checklist, see [CLOUD_ARCANUM_IMPLEMENTATION_TODO.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/CLOUD_ARCANUM_IMPLEMENTATION_TODO.md).

Completed baseline app work has been compressed into [PROJECT_HISTORY.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/archive/PROJECT_HISTORY.md) so this document can stay focused on remaining decisions and gaps.

The goal is to build a local visual layer for Cloud Arcanum that helps us inspect canonical content without changing the source-of-truth model:

- Browse cards by universe, set, and deck
- Search and filter content quickly
- Review draft-stage cards safely
- See images and structured metadata together
- Prepare for future editing and review workflows without requiring them on day one

## 2. Non-Goals

The first version of the Cloud Arcanum app should not:

- Replace JSON as the canonical source of truth
- Require a database
- Introduce multiplayer or gameplay simulation
- Depend on Cockatrice or Scryfall integration
- Require full editing or approval workflows before basic browsing works

## 3. Core Product Decisions We Must Make

These decisions should be made before implementation starts, because they shape the architecture and scope.

### 3.1 Runtime Model

- [x] Use a lightweight local Node API layer that reads the canonical JSON files rather than having the UI read from the filesystem directly
- [x] Keep React and Node as separate client and server packages within the same repository
- [x] Normalize canonical JSON into server-side view models before the UI consumes it

Recommended starting choice:

- Use a lightweight local Node API that reads the canonical JSON files
- Keep React as a separate frontend consuming that API
- Normalize card, set, universe, and deck data in the API layer so the UI stays simple

Why this is the best first step:

- It preserves JSON as source of truth
- It leaves room for a future database without rewriting the UI
- It centralizes draft-safe placeholder handling

### 3.2 UI Scope For Version 1

- [x] Keep V1 read-only rather than adding editing or record mutation actions
- [x] Include deck browsing and deck inspection in the first release
- [x] Start draft review inside the main browsing experience using filters, badges, and warning panels instead of a separate workflow screen

Recommended starting choice:

- V1 should be read-only
- Include card browsing and deck inspection in V1
- Treat draft review as a first-pass filtered browsing experience, not a full workflow system

### 3.3 Placeholder and Draft Rendering Rules

- [x] Render `null` mechanics as explicit draft placeholders rather than fake finalized values
- [x] Use clear badge and warning treatments for `draft`, `templating`, `balanced`, and `approved`
- [x] Show all cards by default and provide fast filters for approved-only, draft-only, and needs-review views

Recommended starting choice:

- Show `null` mechanics as explicit draft placeholders, never as fake finalized values
- Display visible status badges for `draft`, `templating`, `balanced`, and `approved`
- Default to showing all cards, with an easy filter for approved-only views

### 3.4 Image Strategy

- [x] Fall back to a clear placeholder preview when no image exists
- [x] Support mixed browser-friendly image formats such as SVG and PNG
- [x] Resolve image paths in the API layer rather than the UI

Recommended starting choice:

- Support local image references first
- Accept mixed image types as long as the browser can render them
- Fall back to a clear placeholder card preview when an image is missing

### 3.5 Navigation Model

- [x] Make cards the primary landing view
- [x] Treat sets, universes, and decks as secondary navigation paths around card exploration
- [x] Support deep-linkable routes from the first release

Recommended starting choice:

- Make cards the main landing view
- Use sets, universes, and decks as secondary navigation dimensions
- Add deep-linkable routes from the start

## 4. Functional Requirements

The Cloud Arcanum app should eventually support the following behaviors.

### 4.1 Content Browsing

Completed baseline browsing flows were compressed into project history.

- [ ] Open a detailed view for a single deck

### 4.2 Search and Filtering

Completed baseline card search and filter support were compressed into project history.

### 4.3 Draft Review Support

Completed first-pass draft visibility support was compressed into project history.

- [ ] Make it easy to review newly generated or recently changed cards

### 4.4 Metadata and Relationship Views

Completed card metadata and relationship rendering work was compressed into project history.

- [ ] Show deck composition summaries
- [ ] Show set and universe summaries with linked card lists

## 5. Technical Decisions We Must Make

### 5.1 Frontend Stack

The baseline frontend stack has been chosen and archived in project history.

- [ ] Choose table or virtualized-list support if content grows

Recommended starting point:

- React with TypeScript
- React Router
- Minimal client state, leaning on route loaders or fetch hooks
- Simple CSS or a lightweight styling layer, not a heavy design system yet

### 5.2 Backend or Local API

The baseline Fastify API direction, entity loading endpoints, and validation caching approach have been archived in project history.

Recommended starting point:

- Small Fastify-based Node API
- Read canonical JSON from `data/`
- Optionally expose validation output from the existing validator as a separate endpoint

### 5.3 Shared Types

- [ ] Decide whether the Cloud Arcanum app imports the existing domain models directly from `src/domain/`
- [ ] Decide whether the Cloud Arcanum app needs UI-specific derived types
- [ ] Decide how to keep API response types aligned with canonical types

Recommended starting point:

- Reuse current domain types where possible
- Add explicit view-model types for denormalized UI payloads

### 5.4 Performance and Scale

The initial eager-loading approach for V1 has been archived in project history.

- [ ] Decide when pagination, virtualization, or indexing becomes necessary

Recommended starting point:

- Load small datasets eagerly in V1
- Use client-side search and filtering initially
- Revisit API-side indexing only after dataset growth makes it necessary

## 6. Suggested Information Architecture

Recommended screens for the first usable release:

### 6.1 Cards View

The baseline cards view has been implemented and compressed into project history.

### 6.2 Card Detail View

The baseline card detail view has been implemented and compressed into project history.

### 6.3 Deck View

- [ ] Deck metadata header
- [ ] Card list with quantities
- [ ] Mana curve or color summary if useful later
- [ ] Click-through to included cards

### 6.4 Set and Universe Views

- [ ] Summary metadata
- [ ] Linked child records
- [ ] Counts by status

## 7. Implementation Workstreams

### 7.1 Repository and App Structure

Completed app structure and local workflow setup were compressed into project history.

### 7.2 Data Loading Layer

Completed filesystem loading, normalization, image resolution, and defensive error handling were compressed into project history.

### 7.3 API Layer

Completed list/detail endpoints, filter query support, response contracts, and validation API work were compressed into project history.

### 7.4 UI Foundation

Completed shell, navigation, route, state, and draft-visual-language work were compressed into project history.

### 7.5 Card Browser

Completed card-browser work was compressed into project history.

### 7.6 Card Detail Experience

Completed card-detail work was compressed into project history.

### 7.7 Deck Inspection

- [ ] Build deck detail page
- [ ] Expand card references into readable deck contents
- [ ] Add totals and summaries in the deck detail experience

### 7.8 Validation Visibility

- [ ] Expose validator errors in a readable UI

### 7.9 Testing

Baseline data-loading, normalization, route, and component coverage were compressed into project history.

## 8. Phased Delivery Plan

### Phase 1: Foundation

Completed phase-1 foundation work was compressed into project history.

Exit criteria:

- The app starts locally
- The API can return cards, sets, universes, and decks
- The UI can render a basic cards list

### Phase 2: Browsing and Detail Views

Completed phase-2 browsing and card-detail work was compressed into project history.

Exit criteria:

- A user can browse cards and open details
- A user can move from a card to its set and universe
- Missing images and draft placeholders render safely

### Phase 3: Search, Filters, and Decks

- [ ] Add deck list and detail pages
- [ ] Add relationship summaries

Exit criteria:

- A user can find cards by name and status
- A user can inspect a deck and its included cards

### Phase 4: Draft Review Quality Pass

- [ ] Add recently changed or newly generated review aids if desired

Exit criteria:

- The app helps distinguish incomplete draft content from finalized content
- Reviewing new card batches is faster than reading raw JSON files

## 9. Risks and Questions

- [ ] Do we want the Cloud Arcanum app to show invalid records, hide them, or show them in a dedicated error state?
- [ ] Should validation be part of every load path or treated as a separate review action?
- [ ] Will the Cloud Arcanum app eventually support editing, and if so, should current architecture protect that path now?
- [ ] What should the first-pass server-side view models look like for card detail, deck detail, set detail, and list responses?
- [ ] How far should server-side denormalization go before API payloads become too coupled to one UI?

## 10. Definition of Done For The First Useful Release

The Cloud Arcanum app reached its first local browsing milestone; the completed baseline definition of done has been compressed into project history. Remaining release gaps are now tracked above.

## 11. Immediate Next Steps

If we want to start this feature soon, the next planning actions should be:

- [ ] Pick the first three screens: cards list, card detail, and deck detail
