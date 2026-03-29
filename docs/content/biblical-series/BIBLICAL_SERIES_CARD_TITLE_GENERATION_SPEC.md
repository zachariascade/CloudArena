# Biblical Series Card Title Generation Spec

## 1. Purpose

This spec defines a plan for generating large volumes of candidate card titles for the Biblical World universe.

The immediate goal is not to finalize mechanics or write card JSON. The goal is to create a repeatable naming pipeline that can produce many strong title candidates, organized by set, so the best options can be creatively selected later.

Example target output:

`John, Beloved Disciple`  
`Legendary Creature - Human Monk`

## 2. Scope

This spec covers:

- organizing Biblical cards by set before naming begins
- compiling a complete reference list of valid Magic card types and subtypes
- generating large batches of title candidates for legendary and nonlegendary cards
- storing candidates in a structured format for later review and selection

This spec does not cover:

- final mana costs, rules text, rarity, or balance
- image generation
- immediate creation of canonical `data/cards/*.json` records

## 3. Naming Goal

The Biblical series should produce names that feel:

- recognizable to readers familiar with Biblical figures and stories
- flavorful and mythic rather than flat or generic
- consistent with Magic naming patterns
- aligned to the tone of the set they belong to

Named figures should generally follow the existing project style guide pattern:

`Name, Title`

Examples:

- `John, Beloved Disciple`
- `Deborah, Judge of Israel`
- `Elijah, Herald of Fire`

Type lines should be generated alongside names so each candidate has an identity frame:

- `Legendary Creature - Human Monk`
- `Creature - Angel`
- `Artifact - Equipment`
- `Enchantment - Saga`

## 4. Core Deliverables

The title-generation initiative should produce five planning artifacts.

### 4.1 Set Map

A set-level outline of the Biblical series, with set definitions anchored to [GREAT_ADVENTURE_BIBLE_TIMELINE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/biblical-series/GREAT_ADVENTURE_BIBLE_TIMELINE.md).

Each title-generation set should be derived from that timeline guide, with each set assigned:

- a time period or narrative focus
- a tone and naming voice
- a roster of likely named characters
- a roster of likely factions, creatures, relics, places, and events

### 4.2 Type Library

A complete reference of the card-type building blocks allowed for naming and later card design.

This must include:

- supertypes
- card types
- subtype families
- a practical shortlist of the subtypes most relevant to Biblical content

This is a required work item because title generation improves when each candidate already points toward a plausible Magic type line, whether that line is a creature frame or a noncreature frame.

### 4.3 Title Prompt System

A reusable set of prompt templates and generation rules for producing large title batches by set and by card role.

### 4.4 Candidate Catalog

A structured list, sheet, or JSON-like dataset that stores candidate names with enough metadata to sort and review them.

### 4.5 Editorial Selection Rubric

A lightweight review system for choosing the strongest names from large batches.

## 5. Set-First Organization

Names should not be generated as one giant undifferentiated pool. They should be generated per set, because each set needs its own voice, cast, and thematic vocabulary.

The authoritative planning source for which sets to make is [GREAT_ADVENTURE_BIBLE_TIMELINE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/biblical-series/GREAT_ADVENTURE_BIBLE_TIMELINE.md).

For title-generation planning, the current Biblical set structure should follow its 12-epoch sequence:

1. `Early World`
2. `Patriarchs`
3. `Egypt & Exodus`
4. `Desert Wanderings`
5. `Conquest & Judges`
6. `Kingdom`
7. `Divided Kingdom`
8. `Exile`
9. `Return`
10. `Maccabean Revolt`
11. `Messianic Fulfillment`
12. `Church`

Each set brief, naming pool, and title batch should reference the matching timeline section's core narrative books, support books, and themes to mine.

The existing `set_genesis` record maps naturally to the early portion of this roadmap, but future Biblical set records should be planned against the timeline document rather than an ad hoc list in this spec.

## 6. Complete Type Inventory Requirement

One required workstream is building a complete card-type reference so generated title candidates can be paired with valid Magic-style type lines.

The source of truth should be the official Magic Comprehensive Rules, effective February 27, 2026.

The type inventory should be split into two layers:

### 6.1 Authoritative Rules Layer

Capture the complete official lists for:

- supertypes: `basic`, `legendary`, `ongoing`, `snow`, `world`
- card types: `artifact`, `battle`, `conspiracy`, `creature`, `dungeon`, `enchantment`, `instant`, `kindred`, `land`, `phenomenon`, `plane`, `planeswalker`, `scheme`, `sorcery`, `vanguard`
- artifact types
- enchantment types
- land types
- spell types
- creature types
- battle types
- dungeon types

For this project, creature types are especially important because Biblical card names will often land on lines such as:

- `Human Monk`
- `Human Cleric`
- `Angel`
- `Demon`
- `Zombie`
- `Beast`
- `Assassin`
- `Warrior`
- `Wizard`
- `Soldier`

### 6.2 Project Relevance Layer

From the full official inventory, create a practical Biblical shortlist grouped by usage.

This shortlist should be treated as a non-exhaustive working list that can grow over time as new Biblical concepts, card roles, and set needs emerge:

- primary people types: `Human`, `Cleric`, `Monk`, `Prophet-like roles using existing Magic classes such as Cleric, Wizard, Warlock, Scout, Soldier`
- ruler and warrior types: `Soldier`, `Knight`, `Warrior`, `Archer`, `Assassin`
- spiritual beings: `Angel`, `Demon`, `Spirit`
- monsters and animals: `Beast`, `Serpent`, `Leviathan`, `Zombie`, `Horse`, `Bird`, `Sheep`
- object and relic frames: `Equipment`, `Treasure`, `Food`, `Vehicle`
- story and doctrine frames: `Saga`, `Aura`, `Shrine`, `Curse`, `Room`
- place and terrain frames: `Desert`, `Plains`, `Swamp`, `Mountain`, `Forest`, `Town`, `Cave`

The rules layer keeps the project complete. The relevance layer keeps naming practical, and it should support creature and noncreature naming from the beginning of the project.

## 7. Candidate Data Shape

Each generated title candidate should be stored with consistent metadata.

Recommended fields:

- `setName`
- `setCodeOrId`
- `characterOrConcept`
- `sourceReference`
- `cardName`
- `typeLine`
- `legendary` (`yes` or `no`)
- `role`
- `themeTags`
- `toneTags`
- `status` (`generated`, `shortlisted`, `selected`, `rejected`)
- `notes`

Example row:

```json
{
  "setName": "Messianic Fulfillment",
  "setCodeOrId": "set_messianic_fulfillment",
  "characterOrConcept": "John son of Zebedee",
  "sourceReference": "New Testament",
  "cardName": "John, Beloved Disciple",
  "typeLine": "Legendary Creature - Human Monk",
  "legendary": "yes",
  "role": "apostle",
  "themeTags": ["disciple", "witness", "devotion"],
  "toneTags": ["gentle", "holy", "intimate"],
  "status": "generated",
  "notes": "Strong for a support-oriented legendary design."
}
```

## 8. Generation Workflow

### 8.1 Build Set Briefs

For each set, define:

- core story beats
- named characters
- factions or peoples
- important objects
- key places
- signature moods and vocabulary

### 8.2 Build Name Pools

For each set, break source material into naming pools:

- legendary people
- nonlegendary people
- angels and demons
- nations, tribes, and factions
- relics and sacred objects
- miracles, disasters, and events
- locations
- token-worthy minor concepts

### 8.3 Assign Likely Type Lines

Before mass title generation, assign each pool a small list of plausible type lines.

Noncreature frames should be included from the first pass whenever they are the best fit for the concept rather than treated as a later expansion.

Examples:

- apostle pool -> `Legendary Creature - Human Cleric`, `Legendary Creature - Human Monk`
- judge or king pool -> `Legendary Creature - Human Soldier`, `Legendary Creature - Human Warrior`
- infernal adversary pool -> `Legendary Creature - Demon`
- sacred object pool -> `Legendary Artifact - Equipment`, `Artifact - Treasure`
- story event pool -> `Enchantment - Saga`, `Instant`, `Sorcery`
- place pool -> `Land`, `Legendary Land`
- covenant or law pool -> `Enchantment`, `Enchantment - Saga`

### 8.4 Generate In Batches

For each set and pool, generate large candidate batches instead of one name at a time.

Recommended generation targets:

- major legendary figure: 15-30 candidate titles each
- secondary named figure: 8-20 candidate titles each
- nonlegendary role bucket: 20-50 titles per bucket
- event or relic bucket: 20-40 titles per bucket

This should create a large enough pool to allow creative curation rather than first-draft acceptance.

### 8.5 Score And Shortlist

Each batch should be reviewed for:

- identity clarity
- Biblical resonance
- Magic flavor fit
- set voice consistency
- distinctiveness from other titles
- plausibility of the attached type line

### 8.6 Promote Winners

Only after shortlist review should names move forward into card design or canonical records.

## 9. Prompt Design Rules

Prompts used for generation should always specify:

- the set
- the narrative role
- whether the card is legendary
- the likely type line
- the tone
- the source material anchor
- the desired number of candidates

Prompt instructions should also say:

- preserve canonical identities for known figures
- prefer `Name, Title` for named people
- avoid modern slang
- avoid vague titles like `Angel of Light` unless the genericness is intentional
- keep the title aligned with story role or mechanical identity

## 10. Editorial Rubric

The best names usually do four things at once:

- preserve recognition
- sound like real Magic cards
- imply a role or mood
- belong clearly to one set

Reject or demote names when they:

- are too generic
- sound interchangeable with many unrelated cards
- hide a well-known Biblical figure behind a vague label
- use a type line that does not feel plausible
- clash with the tone of the set

## 11. Suggested Execution Order

1. Confirm the Biblical series set map from [GREAT_ADVENTURE_BIBLE_TIMELINE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/biblical-series/GREAT_ADVENTURE_BIBLE_TIMELINE.md)
2. Build the full official type inventory from Magic rules
3. Derive the Biblical relevance shortlist from that inventory
4. Write one brief per set
5. Build naming pools for each set
6. Generate candidate batches with attached type lines
7. Shortlist the strongest titles
8. Move selected names into later card-design work

## 12. Success Criteria

This spec is successful when the project has:

- a clear Biblical set structure
- a complete and current type reference for naming support
- a repeatable process for producing hundreds of candidate titles
- candidate titles tagged by set and role
- enough variety to choose creatively rather than settle early

## 13. Source Note

The type-system work in this spec should use the official Magic rules page and Comprehensive Rules text as the source of truth for completeness.

Relevant references:

- [Magic Rules page](https://magic.wizards.com/en/rules)
- [Magic Comprehensive Rules TXT, effective February 27, 2026](https://media.wizards.com/2026/downloads/MagicCompRules%2020260227.txt)

Key rules sections for the type inventory:

- `205.2a` for card types
- `205.3g-205.3q` for subtype families
- `205.3m` for creature types
- `205.4a` for supertypes
