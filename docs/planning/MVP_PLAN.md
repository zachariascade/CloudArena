# Cloud Arcanum MVP Plan

## 1. Purpose

This document defines the minimum viable product for Cloud Arcanum.

The MVP should focus on the fastest path to managing custom card content in a way that is easy to generate, edit, validate, and iterate on with AI-assisted tools such as Codex, Cursor, or similar editors.

The MVP is not the full long-term platform. It is the smallest useful system that allows rapid creation and organization of:

- Cards
- Decks
- Universes
- Sets

## 2. MVP Goal

The MVP should make it easy to:

- Create and edit custom cards as structured data
- Group cards into sets and universes using stable ID references
- Build decks from card IDs
- Validate data consistency
- Support fast iteration through AI-assisted generation and editing

The MVP should be optimized for content creation and internal organization, not external integrations.

## 3. MVP Principles

- JSON is the canonical source of truth
- Relationships are ID-based, not path-based
- The filesystem organizes storage only
- Filenames should be human-navigable while still beginning with the stable ID
- AI tools should be able to generate and edit records safely
- Incomplete gameplay fields should use explicit placeholders, not fake final values
- Validation should catch structural mistakes early
- Renaming universes or sets should not require moving card files

## 4. MVP Scope

### Included

- Card schema
- Deck schema
- Universe schema
- Set schema
- File-based storage
- Validation scripts
- Sample data
- AI-friendly authoring workflow
- Draft and approved content states

### Excluded

- Cockatrice export
- Scryfall integration
- React or Node Cloud Arcanum app UI
- Public sharing features
- Database-backed storage
- Multiplayer or gameplay engine features

## 5. Core Domain Model

### 5.1 Canonical Relationships

The canonical data model should use child-owned references:

- `card.setId`
- `set.universeId`
- `deck.cards[].cardId`

These references are the authoritative relationship layer.

The system should not depend on folder paths such as `cards/biblical/genesis/...` to determine ownership or membership.

### 5.2 Why This Model

This approach makes the system:

- Easier to query
- Safer to rename
- Easier to bulk-edit with AI
- Easier to migrate later if a database is added

## 6. Data Model

### 6.0 Authoring-State Fields

The MVP should support cards that are structurally valid but mechanically incomplete during early ideation.

Fields such as mana cost, mana value, power, toughness, loyalty, defense, and finalized rules text may not be known at initial creation time. Those fields should use explicit placeholder values so AI tools and future integrations can distinguish:

- intentionally incomplete fields
- truly missing or broken data
- finalized card values

Recommended approach:

- Use `null` for mechanics fields that are not yet decided
- Use `status` to indicate the card's authoring stage, such as `draft`, `templating`, `balanced`, or `approved`
- Let validators allow placeholders for draft-stage cards, but require finalized values for cards marked ready for export or balance comparison

This keeps the schema flexible during ideation while still making future integrations predictable.

### 6.1 Card Schema

The canonical runtime schema lives in [card.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/domain/card.ts).

For MVP authoring, `null` should mean "intentionally not finalized yet" for mechanical fields. Future integrations such as the Cloud Arcanum app or exports can interpret these placeholders and apply draft-safe defaults or warning templates rather than assuming the card is complete.

### 6.2 Deck Schema

The canonical runtime schema lives in [deck.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/domain/deck.ts).

### 6.3 Universe Schema

The canonical runtime schema lives in [universe.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/domain/universe.ts).

### 6.4 Set Schema

The canonical runtime schema lives in [set.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/domain/set.ts).

## 7. File Structure

This structure is intentionally organized by entity type, not by universe or set hierarchy. Relationships are defined inside the JSON records by ID reference.

Recommended filename convention:

- Start with the stable entity ID
- Append a readable slug for navigation
- Treat the ID inside the JSON as canonical, not the slug portion of the filename

Examples:

- `card_0123_messenger_of_dawn.json`
- `set_celestialwar_celestial_war.json`
- `universe_mythic_mythic_world.json`
- `deck_skypatrol_sky_patrol.json`

```text
cloud-arcanum/
  data/
    universes/
      universe_mythic_mythic_world.json
    sets/
      set_celestialwar_celestial_war.json
    cards/
      card_0123_messenger_of_dawn.json
      card_0124_herald_of_twilight.json
    decks/
      deck_skypatrol_sky_patrol.json
  images/
    cards/
      card_0123_messenger_of_dawn.png
      card_0124_herald_of_twilight.png
  scripts/
    validate.ts
  src/
    domain/
      card.ts
      deck.ts
      set.ts
      universe.ts
      types.ts
  tests/
    schema.test.ts
    validate.test.ts
  README.md
  docs/
    MVP_PLAN.md
    FUTURE_WORK.md
```

## 8. MVP Workflows

### 8.1 Manual Card Creation Workflow

1. Create a new card JSON file using the card schema
2. Attach or generate a card image
3. Populate unknown mechanical fields with explicit placeholders such as `null`
4. Validate the file against schema rules
5. Mark as draft or approved

### 8.2 AI-Assisted Card Generation Workflow

1. User provides a prompt such as "make 10 angel cards"
2. The AI tool generates draft card files in a staging area or directly in `data/cards/`
3. The generated cards can leave mechanical fields unfinished when the concept is still being explored
4. The user reviews names, quotes, thematic framing, and placeholders
5. The user approves, edits, or discards generated cards
6. Approved cards remain in the canonical inventory

### 8.3 Deck Building Workflow

1. Create or edit a deck file
2. Add cards by internal ID and quantity
3. Validate all referenced cards exist
4. Validate optional format-specific constraints

## 9. Tooling Approach

The MVP should remain tool-agnostic.

The system should work whether content is authored primarily in:

- Codex
- Cursor
- Another AI-assisted editor

Recommended implementation stack:

- TypeScript + Node.js
- Zod for runtime validation
- CLI scripts for validation and generation

This gives the project a stable, scriptable base without coupling it to a specific UI or editor.

## 10. Validation Rules

The validation layer should catch:

- Missing required fields
- Invalid mana formats when a field is not intentionally left as `null`
- Invalid card references in decks
- Duplicate IDs
- Duplicate names if disallowed by project rules
- Broken image paths
- Filenames whose ID prefix does not match the internal record ID
- Invalid universe/set relationships
- Export-ready cards that still contain unresolved placeholder mechanics

## 11. Suggested MVP Commands

```bash
npm run validate
npm run check
npm test
```

## 12. Suggested MVP Milestones

### Phase 1: Repository Foundation

- Initialize repository
- Add TypeScript and package configuration
- Define schemas for cards, decks, universes, and sets
- Create sample data

### Phase 2: Validation Layer

- Build schema validation
- Add relationship validation
- Add CLI commands for validation

### Phase 3: AI-Friendly Content Workflow

- Add draft-generation command or prompt template
- Establish review and approval workflow
- Document AI editing conventions

## 13. Recommended MVP Scope

To keep momentum high, the MVP should include only:

- File-based content storage
- Stable IDs and explicit references
- Core schemas
- Validation scripts
- AI-assisted content generation and editing workflow

This is enough to start building cards and decks immediately without overcommitting to integrations or UI.
