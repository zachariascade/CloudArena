# Cloud Arcanum App TODO

## 1. Purpose

This document expands the `4.1 Cloud Arcanum App` idea from [FUTURE_WORK.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/FUTURE_WORK.md) into a practical planning and execution checklist.

For the execution-focused build checklist, see [CLOUD_ARCANUM_IMPLEMENTATION_TODO.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/CLOUD_ARCANUM_IMPLEMENTATION_TODO.md).

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

- [ ] Browse all cards
- [ ] Browse cards within a set
- [ ] Browse cards within a universe
- [ ] Browse cards used by a deck
- [ ] Open a detailed view for a single card
- [ ] Open a detailed view for a single deck

### 4.2 Search and Filtering

- [ ] Search by card name
- [ ] Filter by universe
- [ ] Filter by set
- [ ] Filter by status
- [ ] Filter by colors
- [ ] Filter by rarity
- [ ] Filter for cards with missing mechanics
- [ ] Filter for cards with or without local images

### 4.3 Draft Review Support

- [ ] Highlight draft-stage cards clearly
- [ ] Surface unresolved mechanical placeholders
- [ ] Show validation warnings if available
- [ ] Make it easy to review newly generated or recently changed cards

### 4.4 Metadata and Relationship Views

- [ ] Show the card image beside the structured metadata
- [ ] Show the card's set and universe links
- [ ] Show which decks include a card
- [ ] Show deck composition summaries
- [ ] Show set and universe summaries with linked card lists

## 5. Technical Decisions We Must Make

### 5.1 Frontend Stack

- [ ] Choose frontend framework details
- [ ] Choose routing library
- [ ] Choose state-management approach
- [ ] Choose styling strategy
- [ ] Choose table or virtualized-list support if content grows

Recommended starting point:

- React with TypeScript
- React Router
- Minimal client state, leaning on route loaders or fetch hooks
- Simple CSS or a lightweight styling layer, not a heavy design system yet

### 5.2 Backend or Local API

- [x] Use Fastify as the lightweight Node framework for the local API
- [ ] Define endpoints or loader functions for cards, decks, sets, and universes
- [x] Treat validation as cached or on-demand API data rather than running full validation on every page load

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

- [x] Load all records eagerly in V1
- [ ] Decide when pagination, virtualization, or indexing becomes necessary
- [x] Start with client-side search and filtering

Recommended starting point:

- Load small datasets eagerly in V1
- Use client-side search and filtering initially
- Revisit API-side indexing only after dataset growth makes it necessary

## 6. Suggested Information Architecture

Recommended screens for the first usable release:

### 6.1 Cards View

- [ ] Card gallery or list
- [ ] Search bar
- [ ] Filter panel
- [ ] Status badges
- [ ] Quick preview

### 6.2 Card Detail View

- [ ] Large image preview
- [ ] Canonical metadata section
- [ ] Mechanics section
- [ ] Draft-warning section for placeholder fields
- [ ] Relationship links to set, universe, and decks

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

- [ ] Choose app folder layout
- [ ] Create a future-proof app structure such as `apps/cloud-arcanum-web/` and `apps/cloud-arcanum-api/`
- [ ] Add build and dev scripts
- [ ] Add a local run path for frontend plus API

### 7.2 Data Loading Layer

- [ ] Build filesystem readers for cards, decks, sets, and universes
- [ ] Normalize canonical records into UI-friendly server-side view models and resolved relationships
- [ ] Resolve image references for preview use
- [ ] Add safe handling for missing files or broken references

### 7.3 API Layer

- [ ] Add endpoints for list and detail views
- [ ] Add query support for filters
- [ ] Add response shapes for card detail, deck detail, set detail, and universe detail
- [ ] Add endpoint or adapter for validation issues

### 7.4 UI Foundation

- [ ] Add layout shell
- [ ] Add navigation
- [ ] Add route structure
- [ ] Add empty, loading, and error states
- [ ] Add a visual language for draft versus approved content

### 7.5 Card Browser

- [ ] Build cards page
- [ ] Add search
- [ ] Add filtering
- [ ] Add sorting
- [ ] Add card tiles or table rows

### 7.6 Card Detail Experience

- [ ] Build detail page
- [ ] Render image
- [ ] Render mechanics and metadata
- [ ] Render placeholder-safe warnings
- [ ] Render related deck, set, and universe links

### 7.7 Deck Inspection

- [ ] Build deck list page
- [ ] Build deck detail page
- [ ] Expand card references into readable deck contents
- [ ] Add totals and summaries

### 7.8 Validation Visibility

- [x] Do not run full validation on every page load
- [x] Expose validation issues as cached or on-demand API data
- [ ] Expose validator errors in a readable UI
- [x] Distinguish structural validation errors from expected draft-state placeholders

### 7.9 Testing

- [ ] Add tests for filesystem loading
- [ ] Add tests for relationship expansion
- [ ] Add tests for placeholder rendering behavior
- [ ] Add tests for key routes or components

## 8. Phased Delivery Plan

### Phase 1: Foundation

- [ ] Choose architecture and folder structure
- [ ] Scaffold React app and Fastify-based local Node API
- [ ] Reuse domain models from the existing repo
- [ ] Read canonical JSON records successfully

Exit criteria:

- The app starts locally
- The API can return cards, sets, universes, and decks
- The UI can render a basic cards list

### Phase 2: Browsing and Detail Views

- [ ] Add cards page
- [ ] Add card detail page
- [ ] Add set and universe linking
- [ ] Add image preview and fallback behavior

Exit criteria:

- A user can browse cards and open details
- A user can move from a card to its set and universe
- Missing images and draft placeholders render safely

### Phase 3: Search, Filters, and Decks

- [ ] Add search
- [ ] Add filters
- [ ] Add deck list and detail pages
- [ ] Add relationship summaries

Exit criteria:

- A user can find cards by name and status
- A user can inspect a deck and its included cards

### Phase 4: Draft Review Quality Pass

- [ ] Surface validation issues
- [ ] Improve draft-state highlighting
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

The Cloud Arcanum app reaches its first meaningful milestone when:

- [ ] It runs locally with a documented startup command
- [ ] It reads canonical data without changing the source-of-truth model
- [ ] It supports card browsing, card detail, and deck inspection
- [ ] It supports search and basic filters
- [ ] It renders images and metadata together
- [ ] It handles draft placeholders safely and clearly
- [ ] It exposes enough relationship context to navigate cards, sets, universes, and decks
- [ ] It has basic automated test coverage for its data-loading and placeholder behavior

## 11. Immediate Next Steps

If we want to start this feature soon, the next planning actions should be:

- [x] Confirm the V1 scope is read-only browsing plus deck inspection
- [x] Confirm we want a lightweight Node API between the filesystem and React
- [ ] Choose the Cloud Arcanum app folder structure in this repo around separate web and API apps
- [x] Define the initial API response shapes in [CLOUD_ARCANUM_API_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/CLOUD_ARCANUM_API_SPEC.md)
- [ ] Pick the first three screens: cards list, card detail, and deck detail
