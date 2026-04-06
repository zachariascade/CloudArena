# Gospels Concept Pipeline Handoff

## Goal

Continue the KJV concept-harvest workflow that was proven on Genesis and Exodus, but run it for the Gospels.

Target output:

- one rich intermediate CSV for the Gospels, not a flattened two-column export
- same column shape as the current book concept CSVs:
  - `simple_name`
  - `source_book`
  - `source_period`
  - `category`
  - `chapter_start`
  - `chapter_end`
  - `confidence`
  - `notes`

Recommended output file:

- `exports/card-concepts/gospels-concepts.csv`

## What Already Exists

- Exodus pipeline:
  - [src/biblical/exodus-pilot.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/biblical/exodus-pilot.ts)
  - [scripts/ingest-kjv-exodus.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/scripts/ingest-kjv-exodus.ts)
  - [scripts/export-exodus-card-concepts.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/scripts/export-exodus-card-concepts.ts)
  - [exports/card-concepts/exodus-concepts.csv](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/exports/card-concepts/exodus-concepts.csv)
- Genesis pipeline:
  - [src/biblical/genesis-pilot.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/biblical/genesis-pilot.ts)
  - [scripts/ingest-kjv-genesis.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/scripts/ingest-kjv-genesis.ts)
  - [scripts/export-genesis-concepts.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/scripts/export-genesis-concepts.ts)
  - [exports/card-concepts/genesis-concepts.csv](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/exports/card-concepts/genesis-concepts.csv)
- KJV source artifacts live in:
  - [data/sources/kjv](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/data/sources/kjv)

## Current Pattern

For each book or grouped corpus:

1. Download raw public-domain KJV text into `data/sources/kjv/<name>.raw.txt`.
2. Add a `<name>-pilot.ts` module under `src/biblical/`.
3. Parse Gutenberg verse lines into normalized chapter data.
4. Define chapter bands for parallel reader-agent extraction.
5. Create `<name>.concepts.json` as the canonical curated dataset.
6. Export one rich CSV only.
7. Add a focused Vitest file that checks:
   - chapter count
   - chapter-band coverage
   - required anchor concepts
   - concept count range

## Important Workflow Decisions

- We no longer emit a flattened final CSV for pilot books.
- The efficient entrypoint is the one-shot process command pattern:
  - build once
  - ingest
  - export
- The preferred extraction style for the Gospels is now hybrid, not pure scan:
  - start with a fast brainstorm of obvious high-signal concepts
  - use that list as a seed checklist during the structured Gospel pass
  - merge repeated retellings into one strongest card-facing concept
- Existing examples:
  - `npm run process:exodus-concepts`
  - `npm run process:genesis-concepts`

## Hybrid Workflow

Use this order:

1. Build a short first-pass list from obvious Gospel anchors, existing card docs, and prior design taste.
2. Scan each Gospel with that list in hand to catch misses, add long-tail concepts, and discard weak nouns.
3. Merge the four book outputs into one canonical `gospels.concepts.json`.
4. Export only the rich intermediate CSV.

This is more efficient than starting cold from a full scan, because the brainstorm catches the best 60-80% quickly and the scan mostly fills gaps instead of rediscovering the obvious.

## Gospels Scope Recommendation

Treat the Gospels as one grouped corpus for now:

- `Matthew`
- `Mark`
- `Luke`
- `John`

Use:

- `source_period = "Gospels"`

Recommended source strategy:

- store four raw text files:
  - `matthew.raw.txt`
  - `mark.raw.txt`
  - `luke.raw.txt`
  - `john.raw.txt`
- normalize each separately
- merge them into one curated `gospels.concepts.json`
- export one combined `gospels-concepts.csv`

## Gospels Extraction Rules

Keep only strong cardable concepts:

- people: Jesus, Mary, Joseph, John the Baptist, Peter, Judas, Pilate, Herod, Mary Magdalene, Lazarus
- places: Bethlehem, Nazareth, Galilee, Jordan, Cana, Capernaum, Golgotha, Gethsemane, Emmaus
- events: Nativity, Baptism of Jesus, Temptation in the Wilderness, Transfiguration, Triumphal Entry, Last Supper, Crucifixion, Resurrection, Ascension
- miracles: Water into Wine, Feeding of the Five Thousand, Walking on Water, Raising of Lazarus, Calming the Storm, Healing the Blind
- items/relics: Loaves and Fishes, Alabaster Jar, Crown of Thorns, Seamless Robe, Thirty Pieces of Silver
- themes/symbols: Kingdom of God, Good Shepherd, Bread of Life, Light of the World, Vine and Branches, Narrow Gate
- law/rite: Beatitudes should usually be `Theme/Symbol`, not `Law/Rite`; baptism and communion-adjacent concepts can be `Law/Rite` when they are clearly ritualized

Avoid:

- weak genealogy-only entries
- repetitive minor healings that do not produce distinct card concepts
- duplicate concept labels across multiple Gospels unless the merged label is stronger than the individual episode rows

## Suggested Gospels Chapter Bands

Use one lead per Gospel first, then split large books if needed:

- Matthew: 1-28
- Mark: 1-16
- Luke: 1-24
- John: 1-21

If a single Gospel pass is too noisy, split further:

- Matthew 1-10 / 11-20 / 21-28
- Luke 1-9 / 10-18 / 19-24

## Files To Add Next

- `src/biblical/gospels-pilot.ts`
- `scripts/ingest-kjv-gospels.ts`
- `scripts/export-gospels-concepts.ts`
- `tests/gospels-pilot.test.ts`
- `data/sources/kjv/gospels.concepts.json`

## Command Shape To Follow

Add package scripts mirroring the current pattern:

- `ingest:kjv-gospels`
- `export:gospels-concepts`
- `process:gospels-concepts`

## Prompt For The Next Thread

Use this as the starting ask:

```text
Implement the Gospels concept pipeline using the Genesis/Exodus pattern already in the repo.
I only want the rich intermediate CSV, not a flattened export.
Use Matthew, Mark, Luke, and John as one grouped corpus with source_period = "Gospels".
Download the KJV raw texts, normalize them, split extraction by Gospel, curate a canonical gospels.concepts.json, export exports/card-concepts/gospels-concepts.csv, and add focused tests for parser coverage and anchor concepts.
```
