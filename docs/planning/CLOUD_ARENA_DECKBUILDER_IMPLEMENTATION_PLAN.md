# Cloud Arena Deckbuilder Implementation Plan

## 1. Purpose

This document turns the Cloud Arena deckbuilder idea into a phased implementation plan that can be followed step by step.

The goal is to add a deckbuilding workflow to Cloud Arena where a player can:

- browse and search the full card catalog
- create a named deck
- add and remove cards from that deck
- save the deck for later use
- select the saved deck when starting a scenario

The deckbuilder should feel like part of Cloud Arena, not a separate admin tool.

## 2. Core Product Decision

Saved deck data should live in the repository-backed data directory, most likely under:

- `data/cloud-arena/decks/`

That keeps Cloud Arena decks separate from the main Cloud Arcanum deck catalog in `data/decks/` while still using the same filesystem-backed JSON model already used elsewhere in the repo.

Recommended saved deck shape:

- one JSON file per saved deck
- stable deck id
- display name
- optional notes and tags
- ordered card list or quantity-based card entries

The battle engine should continue to consume expanded card ids, but the saved deck model should be the source of truth for deckbuilding and persistence.

## 3. Non-Goals For V1

The first version of the deckbuilder should not try to solve everything at once.

Avoid these until the basic loop works:

- multiplayer deck sharing
- live collaboration
- cloud sync
- full rules enforcement for every MTG edge case
- advanced analytics like curve charts or matchup graphs
- deck import/export from external formats

## 4. Phase 0: Confirm The Data Model

Goal: decide exactly what a saved Cloud Arena deck means before building UI.

- Define the saved deck JSON schema
- Decide whether the deck stores:
  - expanded card ids
  - quantity-based entries
  - or both
- Decide whether duplicate copies are allowed and what the max copy rule is
- Decide whether sideboards exist in V1
- Decide whether the deckbuilder supports only Cloud Arena cards or the broader Cloud Arcanum catalog
- Decide how deck ids are generated
- Decide whether built-in presets remain distinct from user-saved decks

Definition of done:

- the file format is documented
- the deck shape is compatible with filesystem loading
- the engine knows how to expand the saved form into a play-ready list

## 5. Phase 1: Add Backend Storage And Loading

Goal: make saved decks loadable and persistable from disk.

- Add a new deck directory loader for Cloud Arena decks
- Add create, update, and delete operations for saved decks
- Add validation for:
  - id uniqueness
  - valid card ids
  - positive quantities
  - minimum deck size
  - any copy-limit rules chosen in Phase 0
- Decide how to handle missing or malformed deck files
- Add a helper that expands a saved deck into a battle-ready `CardDefinitionId[]`
- Add a helper that resolves a deck source by id regardless of whether it is built-in or saved

Recommended storage behavior:

- built-in scenario decks stay in TypeScript for now
- user-saved decks live in `data/cloud-arena/decks/`
- the API loads both into one unified deck list for selection

Definition of done:

- a saved deck can be read from disk
- a new deck can be written to disk
- an edited deck round-trips correctly
- invalid deck files are rejected clearly

## 6. Phase 2: Expose Deck APIs

Goal: give the web app typed endpoints for deck listing, search, and persistence.

- Add deck list endpoints
- Add deck detail endpoints
- Add deck create/update/delete endpoints
- Add a card catalog summary endpoint suitable for deckbuilder search
- Add query support for card search, card type filtering, and deck search
- Extend the arena session creation contract so it can accept user-saved deck ids as well as built-in preset ids
- Ensure the API distinguishes between:
  - built-in preset decks
  - user-saved decks
  - scenario-provided starter decks

Recommended API behavior:

- deckbuilder operations should return concise deck metadata by default
- the card search endpoint should return enough data for fast deck assembly
- session creation should resolve the chosen deck into the final play deck before battle starts

Definition of done:

- the frontend can search cards without calling battle endpoints
- the frontend can fetch saved decks
- the frontend can save deck changes
- the battle start flow accepts a saved deck id

## 7. Phase 3: Build The Deckbuilder Screen

Goal: create the user-facing editor.

- Add a dedicated deckbuilder route or page in the Cloud Arena web app
- Build a two-pane layout:
  - searchable master card list
  - current deck contents
- Add deck metadata controls:
  - deck name
  - optional notes
  - save button
  - new deck button
  - delete deck button
- Add card interaction controls:
  - click to add
  - click to remove
  - quantity controls if duplicates are supported
- Add live deck counts:
  - total cards
  - unique cards
  - invalid cards
  - over-limit warnings
- Add unsaved-changes state

Recommended UI behavior:

- search should feel instant and forgiving
- deck changes should update immediately in local state
- save should be explicit rather than automatic
- the selected deck should remain visible while searching the master list

Definition of done:

- a user can assemble a deck from the full card list
- a user can remove cards from the deck
- a user can save a deck and reload it later
- the layout works on both desktop and smaller screens

## 8. Phase 4: Hook Decks Into Scenario Start

Goal: let saved decks be used when starting a battle.

- Replace the current preset-only deck chooser with a unified deck chooser
- Allow the chooser to list:
  - built-in presets
  - saved user decks
- Update the battle setup flow so a saved deck can be selected and passed into session creation
- Keep the existing preset decks as defaults and fallbacks
- Make the current deck selection visible in the battle setup UI

Definition of done:

- a saved deck can be selected from the scenario start screen
- the battle starts using that saved deck
- existing preset decks still work

## 9. Phase 5: Add Quality-Of-Life Features

Goal: reduce friction and make the deckbuilder pleasant to use.

- Add deck duplicate detection
- Add card search helpers like set, type, color, or cost filters if needed
- Add quick-add shortcuts for frequently used cards
- Add deck import/export if the saved JSON format is stable enough
- Add better empty states and error states
- Add confirm dialogs for destructive actions like delete
- Add deck preview summaries in the chooser

Definition of done:

- the deckbuilder feels usable for repeated iteration
- it is easy to tell what changed before saving
- destructive actions are hard to do accidentally

## 10. Phase 6: Testing And Regression Coverage

Goal: protect the new workflow from breaking as the battle system evolves.

- Add tests for saved deck loading and validation
- Add tests for deck save/update/delete flows
- Add tests for card search and deck search behavior
- Add tests that confirm a saved deck can be used to create a battle session
- Add UI tests for:
  - adding a card
  - removing a card
  - saving a deck
  - selecting a saved deck
- Add regression coverage to ensure the existing preset deck flow still works

Definition of done:

- the deckbuilder has coverage for the main happy path
- invalid input fails cleanly
- battle startup still works for old and new deck sources

## 11. Suggested Build Order

The safest implementation order is:

1. Confirm the saved deck model
2. Add filesystem storage and deck resolution
3. Add typed deck and card APIs
4. Build the deckbuilder screen
5. Wire the saved deck into scenario start
6. Add quality-of-life improvements
7. Add tests and regression coverage

## 12. Done Criteria For The First Usable Version

The first usable version is done when:

- a user can search the card catalog
- a user can assemble a deck from cards in that catalog
- a user can save the deck to disk
- a user can reopen and edit the saved deck
- a user can start a Cloud Arena battle using that deck
- the existing preset deck flow still works

## 13. Follow-Up Questions After Phase 1

After the storage and API work land, the next decisions to revisit are:

- whether duplicates should be modeled as quantity entries or expanded ids in the saved file
- whether sideboards matter for this game mode
- whether deck sharing belongs in the next milestone
- whether the deckbuilder should live inside Cloud Arena only or be reused in the broader Cloud Arcanum app
