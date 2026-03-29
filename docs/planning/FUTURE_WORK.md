# Cloud Arcanum Future Work

## 1. Purpose

This document captures work that is valuable but not required for the MVP.

These items should be designed to build on top of the MVP's canonical content model rather than changing it. The MVP remains the source of truth for cards, sets, universes, and decks.

## 2. Guiding Principle

Future features should treat the content layer as stable:

- JSON remains the canonical source of truth
- Relationships remain ID-based
- Integrations and visual tools should consume canonical records rather than redefine them

## 3. Future Integrations

### 3.1 Cockatrice Export

Add export support for:

- Custom card database XML
- Deck `.cod` files
- Stable image mapping for custom card art
- Draft-aware fallback behavior when cards still contain placeholder mechanics

Cockatrice should be treated as an export target, not the system of record.

### 3.2 Scryfall Inclusion

Add tooling to:

- Search official cards by query
- Save source metadata from Scryfall
- Record oracle IDs and source card names
- Compare custom cards against official cards
- Validate strict mechanical clone fidelity

Protected clone fields should include:

- Mana cost
- Mana value
- Color identity
- Type line
- Oracle text
- Power
- Toughness
- Loyalty

Mutable reskin fields should include:

- Name
- Flavor text
- Image
- Universe
- Set
- Tags
- Notes

### 3.3 Additional Export Targets

Possible future export targets may include:

- Other playtesting platforms
- Print-oriented formats
- Static website data feeds
- Shareable deck/package bundles

## 4. Future Product Features

### 4.1 Cloud Arcanum App

Build the Cloud Arcanum app in React and Node.js to support:

- Browsing cards by universe or set
- Viewing deck contents
- Filtering and search
- Reviewing generated drafts
- Previewing images and metadata together
- Rendering draft placeholders safely when mechanics are not finalized yet

This should sit on top of the existing file-based content layer or a future API wrapper around it.

Expanded planning and implementation TODOs for this feature live in [CLOUD_ARCANUM_TODO.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/CLOUD_ARCANUM_TODO.md).

### 4.2 Admin or Editing UI

A lightweight local UI could later support:

- Card creation forms
- Deck editing
- Batch approvals
- Search and tagging
- Universe and set management

### 4.3 Rich Draft Review Workflow

Possible future improvements:

- Separate `drafts/` storage area
- Approval queues
- Diff views between revisions
- Prompt history for generated cards
- Bulk accept/reject tooling

### 4.4 Database Support

If scale or collaboration demands it later, add:

- SQLite or Postgres storage
- API layer for querying content
- Sync workflows between file-based and database-backed storage

This should only happen after the file-based MVP proves limiting.

## 5. Future Cockatrice Plan

### 5.1 Export Outputs

Generate:

- `cards.xml` for the custom card database
- One `.cod` file per deck

### 5.2 Required Card Mapping

Map internal card fields into Cockatrice-compatible fields:

- `name`
- `text`
- `type`
- `manacost`
- `cmc`
- `colors`
- `pt`
- loyalty-related fields when applicable

### 5.3 Image Strategy

Recommended approach:

- Store local images with the stable card ID followed by a readable slug
- Generate any name-based lookup files required by Cockatrice

This keeps image references stable even if card names, sets, or universes change.

## 6. Future Tooling Notes

The long-term implementation should remain tool-agnostic.

Likely authoring environments include:

- Codex
- Cursor
- Other AI-assisted editors

Future UI work, exports, and integrations should not depend on a single authoring tool being present.

## 7. Future Milestones

### Phase 4: Cockatrice Integration

- Build XML export for card database
- Build `.cod` deck export
- Test imports in Cockatrice
- Validate custom image resolution

### Phase 5: Scryfall Support

- Add Scryfall search and fetch tooling
- Save clone references on cards
- Add strict clone validation

### Phase 6: Visual Layer

- Build the local React/Node Cloud Arcanum app
- Add browsing, filtering, and deck inspection
- Add draft review screens

### Phase 7: Expanded Platform Features

- Add broader export support
- Add optional database support
- Add richer editorial workflows

## 8. Open Questions

- Should Cockatrice exports be generated globally or per universe/set?
- Should strict clone validation be mandatory or optional per card?
- Should drafts live in the canonical card store or in a separate drafts area?
- When should the local Cloud Arcanum app be introduced relative to export work?
- At what scale would a database become worthwhile?
