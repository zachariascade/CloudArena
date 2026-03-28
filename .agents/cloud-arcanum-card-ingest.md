# Cloud Arcanum Card Ingest

Use this local agent prompt when a user wants a photographed or scanned trading card converted into Cloud Arcanum JSON records.

## Goal

Extract all card information that Cloud Arcanum can represent, create any missing universe or set records, omit the image asset when requested, and explicitly note printed details the schema cannot represent.

## Workflow

1. Inspect the repository before editing anything.
2. Read the canonical schemas and at least one sample record from each of:
   - `src/domain/card.ts` or `schemas/card.schema.json`
   - `src/domain/set.ts` or `schemas/set.schema.json`
   - `src/domain/universe.ts` or `schemas/universe.schema.json`
   - `data/cards/*.json`
   - `data/sets/*.json`
   - `data/universes/*.json`
3. Read the provided card image.
4. If the source image is HEIC and cannot be opened directly, convert a temporary copy to PNG for inspection.
5. Transcribe the visible card fields:
   - card name
   - mana cost
   - type line
   - rules text
   - flavor text
   - power/toughness, loyalty, or defense as applicable
   - artist credit
   - franchise, game, or set clues
6. Determine whether the needed universe and set already exist.
7. Create missing `universe`, `set`, and `card` JSON records using the repo's existing naming and file conventions.
8. If the user wants no image imported, keep the card schema-valid with:

```json
"image": {
  "type": "placeholder",
  "path": null
}
```

9. Preserve any printed details that do not fit the schema in `notes`.
10. Run `npm run validate`.

## Mapping Rules

- Use the printed card name for `name`.
- Build `slug` as lowercase words joined by underscores.
- Use MTG brace notation for `manaCost`, for example `{3}{R}`.
- Set `manaValue` to the total mana value.
- Populate `colors` from the card's actual color.
- Populate `colorIdentity` from visible mana symbols and color indicators.
- Preserve the printed type line in `typeLine`.
- Put rules text into `oracleText` as plain text.
- Put italicized flavor text into `flavorText`.
- Use `power` and `toughness` for creatures.
- Use `loyalty` only for planeswalkers.
- Use `defense` only for battles.
- Use the printed illustrator for `artist` when visible.
- Keep `mechanics` short and reusable.
- Keep `tags` specific to character, franchise, creature type, or theme.

## Unsupported Printed Details

Cloud Arcanum does not currently model some printed-card details as first-class fields. Record them in `notes` when they are visible and relevant:

- collector number
- printed language
- expansion symbol presentation
- footer code line formatting
- legal or copyright line
- holofoil or security stamp treatment
- showcase or frame treatment
- multi-face layout metadata not supported by the schema

## Universe And Set Guidance

- Create a universe record when the franchise does not already exist.
- Create a set record when the specific game or release implied by the card does not already exist.
- Keep universe descriptions franchise-level.
- Keep set descriptions specific to the represented game or release.
- Use a short uppercase set code that satisfies schema rules.

## Final Response

Report:

- the files created or updated
- any assumptions made while reading the card
- any fields or printed details that were not representable
- whether `npm run validate` passed
