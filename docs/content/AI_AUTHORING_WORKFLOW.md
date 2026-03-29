# Cloud Arcanum AI Authoring Workflow

This document explains how AI tools should create, edit, review, and reject content in the MVP.

## 1. Goal

AI-assisted authoring should help us move faster without weakening the quality of the canonical records.

The core rule is simple:

- AI may help draft and edit records
- the canonical files in `data/` remain the source of truth
- every accepted change should still pass `npm run validate`

## 2. Safe Record Creation

When using Codex, Cursor, or another AI editor to create records:

- create JSON files directly in the canonical `data/` folders
- use the correct entity folder for the record type
- start each filename with the stable entity ID
- keep the JSON record ID equal to the filename ID prefix
- refer to the canonical Zod schemas in `src/domain/` to determine required fields, allowed values, and which fields are nullable
- treat fields present in a schema object shape as required unless the schema explicitly marks them optional
- treat nullable fields as still required when the key must be present but the value may be `null`
- check any `superRefine` logic for conditional requirements before finalizing a record
- use existing universe, set, and card IDs instead of inventing ad hoc references
- validate after adding or editing records

Recommended workflow:

1. Decide which entity is being created
2. Choose the stable ID first
3. Create the file in the correct `data/` directory
4. Fill in all required structural fields from the relevant schema
5. Use explicit placeholders for unresolved mechanics when the card is still exploratory
6. Run `npm run validate`
7. Review the record before treating it as accepted content

## 3. Fields That May Be `null` During Ideation

For draft-stage cards, `null` means "intentionally not finalized yet."

AI tools should consult the canonical schemas in `src/domain/` when deciding whether a field may be `null`. They should not guess nullable behavior from examples alone.

The current card model allows `null` for:

- `manaCost`
- `manaValue`
- `rarity`
- `oracleText`
- `flavorText`
- `power`
- `toughness`
- `loyalty`
- `defense`
- `artist`
- `notes`
- `image.path`
- `imagePrompt`

AI tools should use `null` instead of fake final values when mechanics are unknown.

This is an important distinction:

- required means the field key must be present in the JSON record
- nullable means the field value may be `null`

AI tools should not confuse these two rules.

AI tools should not:

- invent fake mana costs just to satisfy completeness
- invent fake power and toughness for unresolved designs
- use placeholder text that looks final unless the card is actually ready
- omit required fields entirely when `null` is the intended placeholder

## 4. Record Status Progression

Cards should move through status values intentionally:

- `draft`
- `templating`
- `balanced`
- `approved`

Recommended meaning:

### `draft`

Use when:

- the concept exists
- mechanics may be incomplete
- placeholder `null` fields are still expected

### `templating`

Use when:

- the concept is mostly known
- rules text is being cleaned up
- the card is structurally close to final but may still need iteration

### `balanced`

Use when:

- the card has a finalized mechanical package
- mana cost, mana value, rarity, and oracle text are filled in
- the design is ready for comparison and tuning

### `approved`

Use when:

- the card is accepted into the canonical set inventory
- it should be treated as finalized for MVP content purposes

When `card.status` is `balanced` or `approved`, the current `cardSchema` requires:

- `manaCost` to be non-null and non-empty
- `manaValue` to be non-null
- `rarity` to be non-null
- `oracleText` to be non-null

These are conditional schema requirements, not just editorial preferences.

## 5. Review Process For AI-Generated Drafts

AI-generated content should always be reviewed before it is treated as accepted set content.

Review should check:

- does the card concept fit the set and universe
- does the name feel intentional
- does the type line make sense
- are references correct
- do all IDs resolve through the canonical relationships
- are placeholders used honestly
- is the status correct for the card’s real maturity
- does the file pass validation

Canonical relationships to check:

- `card.setId -> set.id`
- `set.universeId -> universe.id`
- `deck.universeId -> universe.id`
- `deck.setIds[] -> set.id`
- `deck.cards[].cardId -> card.id`
- `deck.commander -> card.id` when present

Recommended approval flow:

1. Generate or edit the draft
2. Run `npm run validate`
3. Review names, flavor, tags, and status
4. Fix structural or thematic issues
5. Promote the status only when the card actually meets that stage

## 6. How To Reject Or Remove Drafts

Not every AI-generated draft should survive.

When a draft is rejected:

- remove it from the canonical `data/` inventory if it should not be part of the project
- remove or ignore any related placeholder image that should not stay in use
- re-run `npm run validate` if references may have changed

For the MVP, rejected drafts do not need a dedicated archive system.

The simplest rule is:

- if a generated draft is not wanted, delete it rather than letting low-quality dead records accumulate

If we later want richer editorial history, we can add an archive or drafts area after the MVP.

## 7. Practical Prompting Guidance For AI Tools

When asking an AI tool to create or edit content, specify:

- the target universe ID
- the target set ID
- the desired card count
- the intended status
- whether unresolved mechanics should remain `null`
- whether the output should update canonical files directly

Good example:

`Create 3 draft angel cards for set_celestialwar in universe_mythic. Use valid Cloud Arcanum card JSON, keep unresolved mechanics as null, and write them into data/cards/ with stable card IDs.`

## 8. Acceptance Rule

Before accepting AI-authored content into the repo:

- the file should be structurally valid
- references should be valid
- the status should be honest
- placeholder fields should be intentional
- the repo should pass `npm run validate`

For editorial consistency on names, titles, and slugs, follow `docs/content/CARD_STYLEGUIDE.md` when creating or revising card records.
