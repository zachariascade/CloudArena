# Set Theme System TODO

## 1. Purpose

This document turns the set-attached theme system into an implementation checklist.

The goal is to support multiple art variants for the same card, let a set choose which theme is active, and gracefully fall back when a card does not have art for the selected theme.

Example outcomes:

- A set can be viewed in a `default`, `classics`, or `anime` theme
- Cards can provide zero, one, or many theme-specific images
- The UI can show the selected theme without breaking when a card is missing art for that theme

## 2. Product Rules

- [ ] Attach theme selection to the set rather than the card
- [ ] Allow each set to define a list of supported themes
- [ ] Give each theme a stable ID and human-readable name
- [ ] Allow each set to declare its active theme
- [ ] Allow each card to store multiple image variants keyed by theme ID
- [ ] Preserve support for cards that only have one image during migration
- [ ] Fall back to another available image when the active theme image is missing
- [ ] Expose enough metadata for the UI to show whether an image is exact-match art or fallback art

## 3. Data Model TODO

### 3.1 Set Schema

- [ ] Extend the set schema with `themes`
- [ ] Extend the set schema with `activeThemeId`
- [ ] Decide whether sets also need `defaultThemeId`
- [ ] Validate that `activeThemeId` refers to a declared theme
- [ ] Validate that theme IDs are slug-safe and unique within a set

Recommended direction:

- `themes` should be a set-owned list of theme definitions
- `defaultThemeId` should define the canonical baseline theme for the set
- `activeThemeId` should only live in set data if it represents editorial truth rather than temporary browsing state
- If theme switching is primarily a UI preference, keep the active selection in client state or URL state instead of canonical JSON

### 3.2 Card Schema

- [ ] Decide whether to replace `image` with `images` or support both temporarily
- [ ] Add a theme-keyed image map for cards
- [ ] Reuse the existing image reference shape for each theme variant
- [ ] Validate that image theme keys are unique and non-empty
- [ ] Decide whether cards should reserve `default` as the baseline image key

Recommended direction:

- Keep image ownership on the card
- Use a shape like `images.<themeId> = ImageReference`
- Treat `default` as the baseline theme for migration and fallback

## 4. Fallback Behavior TODO

- [ ] Define the exact fallback order in one shared place
- [ ] Use the set's active theme as the first lookup
- [ ] Fall back to the set default theme if different from the active theme
- [ ] Fall back to the card's `default` image if present
- [ ] Fall back to the first renderable image on the card if needed
- [ ] Fall back to the existing missing-image placeholder if no renderable image exists
- [ ] Decide whether remote, local, generated, and placeholder images should all participate equally in fallback

Recommended fallback order:

1. Exact image for the set's active theme
2. Image for the set's default theme
3. Card `default` image
4. First renderable card image
5. Missing-image placeholder

## 5. Backend TODO

### 5.1 Domain and Validation

- [ ] Update [src/domain/set.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/domain/set.ts)
- [ ] Update [src/domain/card.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/domain/card.ts)
- [ ] Update [src/domain/types.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/domain/types.ts) with shared theme-related schemas if helpful
- [ ] Update [schemas/set.schema.json](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/schemas/set.schema.json)
- [ ] Update [schemas/card.schema.json](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/schemas/card.schema.json)
- [ ] Add tests covering valid and invalid theme configurations

### 5.2 Loaders and Normalization

- [ ] Confirm loaders can read the new set and card shapes without breaking existing data
- [ ] Decide whether normalization should precompute theme lookup maps
- [ ] Preserve compatibility for legacy cards that still only provide `image`
- [ ] Make sure available image path detection still works for theme-specific local assets

### 5.3 View Models and Image Resolution

- [ ] Extract a shared image resolution helper that takes card, set, and available image paths
- [ ] Stop reading `card.image` directly inside view-model builders
- [ ] Return the resolved image preview for the set's active theme
- [ ] Include `requestedThemeId`, `resolvedThemeId`, and `fellBack` metadata in the preview model
- [ ] Decide whether to include a non-renderable fallback reason for debugging and UI messaging

### 5.4 Query and API Surface

- [ ] Update [src/cloud-arcanum/api-contract.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arcanum/api-contract.ts) with theme-aware contracts
- [ ] Add set theme metadata to set list/detail responses
- [ ] Add image theme resolution metadata to card list/detail responses
- [ ] Decide whether card routes should accept an optional `themeId` query parameter in addition to set-based resolution
- [ ] Decide whether deck responses should resolve images using each card's owning set theme

## 6. Frontend TODO

### 6.1 Set Theme Controls

- [ ] Add a visible theme selector on the set detail page
- [ ] Decide whether theme switching is persistent authoring behavior or local browsing state in the first version
- [ ] If theme switching is local browsing state, store it in client state or the URL rather than writing it into set JSON
- [ ] Show the active theme clearly in the set header
- [ ] Disable or hide theme controls when a set only has one theme

### 6.2 Card Rendering

- [ ] Update card tile rendering to consume theme-aware image preview data
- [ ] Update card detail rendering to consume theme-aware image preview data
- [ ] Show a small fallback indicator when the requested theme image is missing
- [ ] Avoid noisy UI when exact-match art is available
- [ ] Confirm cards still render correctly when no images exist at all

### 6.3 Navigation and State

- [ ] Decide where theme state lives in the UI
- [ ] Decide whether theme selection should be encoded in the URL
- [ ] Decide whether cards and decks pages need set-scoped theme context
- [ ] Keep the initial implementation simple enough that theme state does not spread through unrelated routes

## 7. Content and File Organization TODO

- [ ] Define a standard path convention for theme-specific assets under `images/cards/`
- [ ] Decide whether theme folders should be global or nested by set
- [ ] Document naming conventions for image files and theme IDs
- [ ] Add at least one sample set with multiple declared themes
- [ ] Add at least one sample card with multiple theme images
- [ ] Add at least one sample card that intentionally relies on fallback behavior

Recommended starting convention:

- `images/cards/default/...`
- `images/cards/classics/...`
- `images/cards/anime/...`

## 8. Migration TODO

- [ ] Decide whether migration should be code-assisted or manual JSON edits
- [ ] Support legacy `image` reads while new `images` data is being introduced
- [ ] Map legacy `image` into `images.default` during the transition period
- [ ] Migrate existing sample cards to the new structure
- [ ] Remove legacy compatibility only after tests and data migration are complete

## 9. Testing TODO

- [ ] Add schema tests for set theme declarations
- [ ] Add schema tests for multi-image card records
- [ ] Add view-model tests for exact theme hits
- [ ] Add view-model tests for fallback to set default theme
- [ ] Add view-model tests for fallback to card default image
- [ ] Add view-model tests for fully missing-image behavior
- [ ] Add API route tests confirming theme metadata appears in responses
- [ ] Add frontend tests for theme switching and fallback indicators

## 10. Suggested Implementation Order

- [ ] Finalize data shapes for set themes and card image variants
- [ ] Implement schema and domain changes
- [ ] Add shared backend image resolution logic
- [ ] Update API contracts and view-model builders
- [ ] Migrate sample data with legacy compatibility still enabled
- [ ] Add set-level theme UI
- [ ] Add tests for fallback edge cases
- [ ] Remove temporary compatibility code if the migration is complete

## 11. Open Questions

- [ ] Should theme selection be editable in-app, or only through JSON for now?
- [ ] Is `activeThemeId` canonical content metadata or only a viewer preference?
- [ ] Should theme IDs be global conventions across the repo, or only meaningful within a set?
- [ ] Should decks spanning multiple sets show mixed art themes based on each card's set, or support a deck-wide override later?
- [ ] Should the API resolve images strictly from the set's active theme, or allow an override query param for previewing alternate themes?
- [ ] Do we want per-theme artist metadata later, or is one card-level `artist` field sufficient for now?
