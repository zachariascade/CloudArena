# Cloud Arena

Cloud Arena is the combat, session, replay, and simulation product in this repository.

Cloud Arcanum now lives in its own repository at [CloudArcanum](https://github.com/zachariascade/CloudArcanum).

This repo is intentionally focused so humans and AI tools can work from a smaller local slice of files.

## Product Entry Points

Docs:

- [Cloud Arena Docs Index](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/arena/DOCS_INDEX.md)

Core dev commands:

- `npm run dev`
- `npm run dev:api`
- `npm run dev:web`

Cloud Arena-specific commands:

- `npm run dev:arena`
- `npm run dev:arena:api`
- `npm run dev:arena:web`
- `npm run arena:demo`
- `npm run arena:simulate`

## Project Docs

Active planning and archived project history are tracked separately so the working TODOs stay focused.

- Long-lived reference and archive docs live in [`docs/`](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs).
- The docs index lives in [docs/README.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/README.md).
- Product-specific doc entry point lives in:
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

Run the validation alias:

```bash
npm run validate
```

Run the Arena stack together:

```bash
npm run dev
```

## Data Model

Cloud Arena stores its battle content and simulation assets in the repository.

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
  cloud-arena-api/
  cloud-arena-web/
scripts/
  dev-arena.ts
src/domain/
src/cloud-arena/
tests/
  cloud-arena/
```

## App Structure

The repo is split into Arena app boundaries so combat, sessions, and simulations stay together.

- `apps/cloud-arena-api/` is the backend boundary for sessions, actions, and Arena gameplay APIs.
- `apps/cloud-arena-web/` is the frontend boundary for battle and replay UI.
- `src/cloud-arena/` holds Arena-owned product logic.
- `src/domain/` is the intentionally small shared schema layer.
