# Cloud Arcanum Monorepo

This repo now contains two separate games with a shared monorepo boundary:

- `Cloud Arcanum`: the MTG-focused card catalog, browsing, printing, and deckbuilding product
- `Cloud Arena`: the combat, session, replay, and simulation product

The repo is intentionally split so humans and AI tools can work from a smaller local slice of files.

## Product Entry Points

Docs:

- [Cloud Arcanum Docs Index](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arcanum/DOCS_INDEX.md)
- [Cloud Arena Docs Index](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arena/DOCS_INDEX.md)

Core dev commands:

- `npm run dev:arcanum`
- `npm run dev:arena`
- `npm run dev`

Cloud Arcanum-specific commands:

- `npm run dev:arcanum:api`
- `npm run dev:arcanum:web`
- `npm run arcanum:validate`

Cloud Arena-specific commands:

- `npm run dev:arena:api`
- `npm run dev:arena:web`
- `npm run arena:demo`
- `npm run arena:simulate`

## Cloud Arcanum

Cloud Arcanum is a structured content system for custom MTG-style cards, decks, universes, and sets.

Its MVP is optimized for:

- file-based JSON content
- stable ID relationships
- Zod-backed runtime validation
- AI-assisted drafting and editing

## Project Docs

Active planning and archived project history are tracked separately so the working TODOs stay focused.

- Long-lived reference and archive docs live in [`docs/`](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs).
- The docs index lives in [docs/README.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/README.md).
- Product-specific doc entry points live in:
  - [docs/arcanum/DOCS_INDEX.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arcanum/DOCS_INDEX.md)
  - [docs/arena/DOCS_INDEX.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arena/DOCS_INDEX.md)
- Completed setup and planning work can be compressed into [PROJECT_HISTORY.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/archive/PROJECT_HISTORY.md).

## Setup

Requirements:

- Node 18+
- npm

Install dependencies:

```bash
npm install
```

## Core Commands

Typecheck the project:

```bash
npm run check
```

Build the TypeScript output:

```bash
npm run build
```

Run the automated tests:

```bash
npm test
```

Validate all canonical content files:

```bash
npm run validate
```

Run the Arcanum API app:

```bash
npm run dev:arcanum:api
```

Run the Arcanum web app:

```bash
npm run dev:arcanum:web
```

Run the Arcanum stack together:

```bash
npm run dev:arcanum
```

Run the Arena stack together:

```bash
npm run dev:arena
```

Run all local apps together:

```bash
npm run dev
```

## Data Model

Cloud Arcanum stores canonical content in JSON files under `data/`.

The authoritative runtime schemas live in `src/domain/` and are implemented with Zod.

The core relationships are ID-based:

- `card.setId -> set.id`
- `set.universeId -> universe.id`
- `deck.universeId -> universe.id`
- `deck.setIds[] -> set.id`
- `deck.cards[].cardId -> card.id`
- `deck.commander -> card.id` when present

This means folder paths are for organization only, not ownership.

## Repository Layout

```text
apps/
  cloud-arcanum-api/
  cloud-arcanum-web/
  cloud-arena-api/
  cloud-arena-web/
data/
  universes/
  sets/
  cards/
  decks/
images/
  cards/
scripts/
  dev-arcanum.ts
  dev-arena.ts
src/domain/
src/cloud-arcanum/
src/cloud-arena/
tests/
  cloud-arcanum/
  cloud-arena/
```

## App Structure

The repo is split into two product app pairs so browsing/content work stays separate from combat/simulation work.

- `apps/cloud-arcanum-api/` is the backend boundary. It owns data loading, normalization, validation integration, and HTTP responses.
- `apps/cloud-arcanum-web/` is the frontend boundary. It owns routes, layout, filters, and presentation for the browsing experience.
- `apps/cloud-arena-api/` is the backend boundary for sessions, actions, and Arena gameplay APIs.
- `apps/cloud-arena-web/` is the frontend boundary for battle and replay UI.
- `src/cloud-arcanum/` holds Arcanum-owned product logic.
- `src/cloud-arena/` holds Arena-owned product logic.
- `src/domain/` is the intentionally small shared schema layer.

## Examples

The examples below are illustrative only. Your actual IDs, names, and themes can differ.

Create a universe:

```json
{
  "id": "universe_mythic",
  "name": "Mythic World",
  "description": "A custom-card universe built around legendary figures, factions, and symbolic conflicts."
}
```

Create a set:

```json
{
  "id": "set_celestialwar",
  "universeId": "universe_mythic",
  "name": "Celestial War",
  "code": "CELEST",
  "description": "A set focused on divine factions, omens, and cosmic conflict."
}
```

Create a card:

```json
{
  "id": "card_0123",
  "name": "Messenger of Dawn",
  "slug": "messenger_of_dawn",
  "setId": "set_celestialwar",
  "typeLine": "Creature - Angel",
  "manaCost": null,
  "manaValue": null,
  "colors": ["W"],
  "colorIdentity": ["W"],
  "rarity": null,
  "oracleText": null,
  "flavorText": "Its coming is known before it is understood.",
  "power": null,
  "toughness": null,
  "loyalty": null,
  "defense": null,
  "artist": null,
  "image": {
    "type": "placeholder",
    "path": null
  },
  "mechanics": ["flying"],
  "tags": ["angel", "draft"],
  "status": "draft",
  "notes": "Mechanics intentionally incomplete.",
  "createdAt": "2026-03-27T21:00:00-05:00",
  "updatedAt": "2026-03-27T21:00:00-05:00"
}
```

Create a deck:

```json
{
  "id": "deck_patrol",
  "name": "Sky Patrol",
  "universeId": "universe_mythic",
  "setIds": ["set_celestialwar"],
  "format": "casual",
  "commander": null,
  "cards": [
    {
      "cardId": "card_0123",
      "quantity": 2
    }
  ],
  "tags": ["sample"],
  "notes": "Small example deck."
}
```

## Authoring Notes

- Use the canonical Zod schemas in `src/domain/` to determine required and nullable fields.
- Use `null` for intentionally unresolved mechanics on draft-stage cards.
- Keep filename ID prefixes aligned with each record’s `id`.
- Re-run `npm run validate` after content changes.

For the full workflow, see [AI_AUTHORING_WORKFLOW.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/AI_AUTHORING_WORKFLOW.md).
