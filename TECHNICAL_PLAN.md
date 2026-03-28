# MTG Codex Technical Plan

## 1. Project Summary

MTG Codex is a custom trading card game content platform built around Magic-style cards, themed universes, deck construction, and export pipelines for playtesting in Cockatrice. The system should support:

- Managing a canonical inventory of custom cards
- Organizing cards into universes, sets, and decks
- Storing all fields needed for a Magic-style card, including flavor text and custom art
- Exporting cards and decks into Cockatrice-compatible formats
- Supporting future integrations such as Scryfall-based cloning and comparison
- Accelerating card generation and iteration with AI-assisted workflows

The core design principle is that custom cards are usually "mechanical clones" of real Magic cards. Their mechanics remain unchanged while names, art, quotes, and setting-specific identity are customized. This preserves balance while allowing original worldbuilding.

## 2. Product Goals

### Primary Goals

- Maintain a clean source of truth for all custom cards
- Build and edit decks from owned or available card inventory
- Export card libraries and decks to Cockatrice
- Support multiple universes, sets, and themes
- Enable fast generation of candidate cards for review and iteration

### Secondary Goals

- Import or compare against Scryfall data
- Track a card's mechanical source and balancing reference
- Support alternative export targets later
- Create a workflow that works well with AI tools such as Cursor

### Non-Goals for V1

- Full rules engine
- Real-time multiplayer platform
- Public marketplace or community sharing
- Complex image hosting platform

## 3. Recommended Technical Approach

### Source of Truth

Use structured files as the canonical data source. Prefer JSON for machine-readability and automation, with optional support for YAML later if human editing becomes a priority.

The canonical model should be ID-based and relationship-driven. Files and folders should organize storage only, not define card membership in universes, sets, or decks.

### Recommended Stack

- Backend/data tooling: TypeScript + Node.js
- Validation: Zod or JSON Schema
- CLI tooling: TypeScript CLI scripts
- Local storage: file-based JSON for V1
- Optional future app UI: Next.js or Electron frontend backed by the same data layer

This stack is recommended because it works well with Cursor, file-system workflows, JSON processing, and future API integrations.

## 4. Core Requirements

### 4.1 Card Management

The system must support creating, editing, storing, and searching cards with all major MTG-style fields.

Each card should support:

- Internal ID
- Display name
- Universe
- Set
- Type line
- Mana cost
- Mana value
- Color identity
- Rules text
- Flavor text or quote
- Power/toughness when applicable
- Loyalty when applicable
- Rarity
- Artist credit
- Image reference
- Tags or mechanics
- Mechanical clone reference to an official card
- Status fields such as draft, approved, exported, archived

### 4.2 Deck Management

The system must support:

- Creating decks by referencing card IDs
- Setting quantity per card
- Storing deck metadata such as universe, format, notes, commander, and tags
- Validating deck contents against known card inventory
- Exporting decks to Cockatrice `.cod`

### 4.3 Universe and Set Organization

Cards must be grouped into:

- Universe: top-level fictional or thematic world such as Biblical
- Set or release: subdivision such as Genesis
- Optional deck or faction association such as Patriarchs

These relationships should be expressed with explicit references in the data model, such as `card.setId` and `set.universeId`, rather than inferred from the folder path. This makes the system easier to query and safer to rename over time.

### 4.4 Cockatrice Export

The system must export:

- A Cockatrice card database XML containing all custom cards intended for playtesting
- A Cockatrice deck file for each deck
- Image references using a stable naming convention compatible with the chosen Cockatrice image workflow

### 4.5 Future Integrations

The system must be designed to support:

- Scryfall API lookups
- Mapping custom cards to official card printings
- Validation that mana cost, power, toughness, and rules text match a selected source card
- Additional export targets later without rewriting core card storage

### 4.6 Fast Generation and Iteration

The system must support a workflow where a user can request bulk generation, review results, revise selected cards, and then export them.

Example prompt:

"Make 10 angel cards for the Genesis set based on white Angel cards from Magic."

The system should support storing both generated drafts and approved cards.

## 5. Proposed Architecture

Use a layered architecture with clean separation between canonical content, derived exports, and external integrations.

The filesystem layout should remain decoupled from the domain model. A card belongs to a set because its record references that set's ID, not because its file lives under a set-named directory.

### 5.1 Layers

1. Content Layer
   Stores cards, decks, universes, sets, and metadata as structured files.

2. Domain Layer
   Applies validation, linking, search, cloning constraints, and export preparation.

3. Integration Layer
   Handles Scryfall lookups, Cockatrice export, and future third-party targets.

4. Workflow Layer
   Supports generation, review, approval, and publishing steps.

## 6. Data Model

### 6.1 Card Schema

Suggested V1 card object:

```json
{
  "id": "card_0001",
  "name": "Seraph of the Seventh Flame",
  "slug": "seraph-of-the-seventh-flame",
  "setId": "set_genesis",
  "typeLine": "Creature — Angel",
  "manaCost": "{3}{W}{W}",
  "manaValue": 5,
  "colors": ["W"],
  "colorIdentity": ["W"],
  "rarity": "rare",
  "oracleText": "Flying, vigilance",
  "flavorText": "\"Holy, holy, holy.\"",
  "power": "4",
  "toughness": "5",
  "loyalty": null,
  "defense": null,
  "artist": "Cade Zacharias",
  "image": {
    "type": "local",
    "path": "images/cards/card_0001.png"
  },
  "mechanics": ["flying", "vigilance"],
  "tags": ["angel", "genesis", "holy"],
  "mechanicalClone": {
    "source": "scryfall",
    "oracleId": "example-oracle-id",
    "cardName": "Baneslayer Angel",
    "strict": true
  },
  "status": "draft",
  "notes": "Initial angel cycle candidate",
  "createdAt": "2026-03-27T00:00:00Z",
  "updatedAt": "2026-03-27T00:00:00Z"
}
```

### 6.2 Deck Schema

```json
{
  "id": "deck_patriarchs",
  "name": "Patriarchs",
  "universeId": "universe_biblical",
  "setIds": ["set_genesis"],
  "format": "custom-commander",
  "commander": "card_0002",
  "cards": [
    { "cardId": "card_0002", "quantity": 1 },
    { "cardId": "card_0001", "quantity": 2 }
  ],
  "tags": ["midrange", "legendary", "tribal"],
  "notes": "First Biblical test deck"
}
```

### 6.3 Universe Schema

```json
{
  "id": "universe_biblical",
  "name": "Biblical",
  "description": "A mythic world based on scriptural themes and figures."
}
```

### 6.4 Set Schema

```json
{
  "id": "set_genesis",
  "universeId": "universe_biblical",
  "name": "Genesis",
  "code": "GEN",
  "description": "Foundational stories, angelic visitations, and patriarch-era themes."
}
```

## 7. Recommended File Structure

This structure is intentionally organized by entity type, not by universe or set hierarchy. Relationships are defined inside the JSON records by ID reference.

```text
mtg-codex/
  data/
    universes/
      universe_biblical.json
    sets/
      set_genesis.json
    cards/
      card_0001.json
      card_0002.json
    decks/
      deck_patriarchs.json
  images/
    cards/
      card_0001.png
      card_0002.png
  exports/
    cockatrice/
      cards.xml
      decks/
        deck_patriarchs.cod
  scripts/
    validate.ts
    export-cockatrice.ts
    sync-scryfall.ts
    generate-card-drafts.ts
  schemas/
    card.schema.ts
    deck.schema.ts
    universe.schema.ts
    set.schema.ts
  TECHNICAL_PLAN.md
```

## 8. System Workflows

### 8.1 Manual Card Creation Workflow

1. Create a new card JSON file using the card schema
2. Attach or generate a card image
3. Validate the file against schema rules
4. Link the card to an official mechanical clone if applicable
5. Mark as draft or approved
6. Export for Cockatrice

### 8.2 AI-Assisted Card Generation Workflow

1. User provides a prompt such as "make 10 angel cards"
2. System generates draft card files in a staging area
3. User reviews names, quotes, and thematic framing
4. User approves, edits, or discards generated cards
5. Approved cards move into the canonical card inventory
6. Export step regenerates downstream Cockatrice files

### 8.3 Scryfall Clone Workflow

1. Search Scryfall by criteria such as tribe, color, mana value, or type
2. Select an official card as the mechanical template
3. Copy rules text and stats exactly
4. Replace name, flavor text, image, universe, and tags
5. Save the source card reference in `mechanicalClone`
6. Validate strict equality for mechanics-critical fields

### 8.4 Deck Building Workflow

1. Create or edit a deck file
2. Add cards by internal ID and quantity
3. Validate all referenced cards exist
4. Validate optional format-specific constraints
5. Export to Cockatrice `.cod`

## 9. Cockatrice Export Plan

### 9.1 Export Outputs

Generate:

- `cards.xml` for the custom card database
- One `.cod` file per deck

### 9.2 Required Card Mapping

Map internal card fields into Cockatrice-compatible fields:

- `name`
- `text`
- `type`
- `manacost`
- `cmc` or equivalent derived fields where needed
- `colors`
- `pt` for creatures
- loyalty-related fields when applicable

### 9.3 Image Strategy

Choose one image strategy early and keep it stable:

- Local image files named by card ID
- Local image files named by card name
- Hosted URLs if Cockatrice setup supports it

Recommended V1 choice:

- Store local images by card ID
- Maintain a generated lookup file if Cockatrice expects name-based resolution

This keeps image references stable even if card names, set names, or universe names change later.

## 10. Scryfall Integration Plan

### 10.1 V1 Scryfall Features

- Search official cards by query
- Save selected Scryfall metadata
- Store oracle ID and source card name
- Validate clone fidelity for protected fields

### 10.2 Protected Fields for Clone Validation

These fields should match the source card exactly when strict clone mode is enabled:

- Mana cost
- Mana value
- Color identity
- Type line
- Oracle text
- Power
- Toughness
- Loyalty

### 10.3 Mutable Fields for Reskinning

These fields can differ:

- Name
- Flavor text
- Image
- Universe
- Set
- Tags
- Internal notes

## 11. Tooling Recommendations

### Best Overall Authoring Setup

- Cursor for editing structured content, bulk generation, and repository-aware iteration
- Node.js scripts for validation and export
- Cockatrice for playtesting
- Optional image generation workflow through a separate art pipeline

### Why Cursor Fits Well

- Works directly against the file system
- Good for batch edits and schema-based generation
- Lets you review and revise generated content quickly

### Alternative Tooling

- VS Code + Claude Code or Codex for a more script-driven workflow
- Airtable or Notion only if you later want a friendlier non-technical content editor

Recommended V1 approach:

- Keep everything file-based
- Avoid introducing databases or SaaS dependencies too early

## 12. Validation Rules

The validation layer should catch:

- Missing required fields
- Invalid mana formats
- Invalid card references in decks
- Duplicate IDs
- Duplicate names if disallowed by project rules
- Broken image paths
- Clone mismatches against Scryfall source data
- Invalid universe/set relationships

## 13. CLI Commands To Build

Suggested commands:

```bash
pnpm validate
pnpm export:cockatrice
pnpm sync:scryfall
pnpm generate:cards --prompt "make 10 angel cards"
pnpm deck:validate --deck patriarchs-deck
```

## 14. Suggested Milestones

### Phase 1: Core Content Foundation

- Initialize repository
- Define schemas for cards, decks, universes, and sets
- Create validation scripts
- Create sample data for one universe, one set, and one deck

### Phase 2: Cockatrice Export

- Build XML export for card database
- Build `.cod` deck export
- Test import into Cockatrice
- Confirm custom images resolve correctly

### Phase 3: Scryfall Clone Support

- Add Scryfall search and fetch tooling
- Save clone references on cards
- Add strict clone validation

### Phase 4: AI Generation Workflow

- Build draft-generation command
- Create review and approval workflow
- Separate draft cards from approved cards if needed

### Phase 5: Lightweight UI or Admin Layer

- Add a local app or web UI for easier browsing and editing
- Add search, filtering, and deck assembly interfaces

## 15. Recommended V1 Scope

To avoid overbuilding, V1 should include only:

- File-based storage
- Card, deck, universe, and set schemas
- Validation scripts
- Cockatrice export
- Basic Scryfall lookup and clone metadata support
- Manual or AI-assisted generation into draft files

Do not block V1 on:

- Full GUI
- Database
- Multiplayer features
- Advanced collaboration

## 16. Key Technical Decisions

These decisions should be locked early:

1. JSON as the canonical source format
2. TypeScript/Node as the automation stack
3. Child-owned relationships in canonical data: `card.setId`, `set.universeId`
4. Card ID-based image naming
5. Strict clone validation for balance-sensitive cards
6. File-based repository structure organized by entity type, not by relationship hierarchy

## 17. Initial Build Checklist

- Create repository structure
- Add package manager and TypeScript config
- Define schemas
- Add sample data
- Implement validation command
- Implement Cockatrice export command
- Test a sample deck in Cockatrice
- Add Scryfall reference fields
- Add first generation workflow prompt template

## 18. Open Questions

These are the main design questions that may affect implementation detail but do not block starting:

- Will inventory track ownership counts, or only card definitions?
- Will multiple decks share the same global card pool?
- Do you want cards stored as singletons with deck quantities, or inventory copies?
- Should generated drafts live in a separate `drafts/` directory?
- Do you want one Cockatrice export containing all cards, or one per universe/set?
- Will custom cards use only exact mechanical clones, or also lightly modified variants later?

## 19. Final Recommendation

Build this as a content-first pipeline, not as a UI-first app.

Use structured files as the source of truth, TypeScript scripts as the operational layer, Cockatrice as the playtest target, and Scryfall as the balance authority. Add AI generation as a draft-creation workflow rather than letting AI write directly into final production data.

That approach gives you:

- A stable foundation
- Easy iteration
- Strong compatibility with Cursor
- Clean future expansion into new universes, decks, and exports
