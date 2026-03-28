# Cloud Arcanum Data Layout

This directory holds the canonical JSON content records for the MVP.

## Directory Structure

- `universes/`
- `sets/`
- `cards/`
- `decks/`

Each folder stores one entity type only. Relationships are defined inside the JSON records by ID, not by folder nesting.

## Filename Convention

Use this pattern for all canonical record files:

`<stable-id>_<readable-slug>.json`

Examples:

- `universe_biblical_biblical_world.json`
- `set_genesis_book_of_beginnings.json`
- `card_0001_seraph_of_the_seventh_flame.json`
- `deck_patriarchs_tribe_of_promise.json`

## Naming Rules

- The stable ID comes first
- The readable slug comes second
- The ID inside the JSON record is canonical
- The filename must begin with the same ID value stored in the file
- Renaming the slug portion is allowed as long as the ID prefix remains unchanged

## Why This Structure Exists

- it keeps files human-browsable
- it lets validators check filename-to-ID consistency
- it avoids path-based ownership rules
- it makes AI-assisted generation and editing safer
