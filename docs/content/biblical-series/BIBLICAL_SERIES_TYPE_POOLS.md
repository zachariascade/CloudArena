# Biblical Series Type Pools

## 1. Purpose

This document is the working reference for all possible MTG type pools relevant to the Biblical series.

It is intentionally broader than the first-pass shortlist in [BIBLICAL_SERIES_CARD_TITLE_GENERATION_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/biblical-series/BIBLICAL_SERIES_CARD_TITLE_GENERATION_SPEC.md).

Use this file to:

- collect official MTG terminology
- organize possible types into usable pools
- maintain a non-exhaustive working list for title generation
- expand type options as new sets and concepts require them

## 2. Source References

Primary sources:

- official Magic Comprehensive Rules
- [MAGIC_TYPE_TAXONOMY.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference/MAGIC_TYPE_TAXONOMY.md)
- MTG terminology and subtype documentation used by the project

## 3. Pool Structure

The file should ultimately track two layers:

### 3.1 Official Rules Layer

Complete authoritative lists for:

- supertypes
- card types
- artifact types
- enchantment types
- land types
- spell types
- creature types
- battle types
- dungeon types

### 3.2 Biblical Working Pools

Practical groupings for title-generation use:

- people and class types
- rulers and warriors
- angels, demons, and spirits
- monsters and animals
- relic and object frames
- miracles, laws, prophecies, and covenant frames
- locations and terrain frames
- event and story frames

## 4. Official Rules Layer

### 5.1 Supertypes

- `Basic`
- `Legendary`
- `Snow`
- `World`
- `Ongoing`

Notes:

- supertypes appear before card types
- a card may have multiple supertypes
- `Legendary` is expected to be the most common supertype for this Biblical project

### 5.2 Card Types

Primary gameplay card types:

- `Artifact`
- `Battle`
- `Creature`
- `Enchantment`
- `Instant`
- `Land`
- `Planeswalker`
- `Sorcery`

Additional or nonstandard types to keep in the long-range pool:

- `Conspiracy`
- `Dungeon`
- `Kindred`
- `Plane`
- `Phenomenon`
- `Scheme`
- `Vanguard`

Notes:

- every card has at least one card type
- some cards can have multiple types, such as `Artifact Creature`

### 5.3 Artifact Types

- `Equipment`
- `Fortification`
- `Vehicle`
- `Treasure`
- `Food`
- `Clue`
- `Map`
- `Powerstone`

### 5.4 Enchantment Types

- `Aura`
- `Background`
- `Class`
- `Saga`
- `Room`
- `Shrine`
- `Curse`

### 5.5 Land Types

- `Plains`
- `Cave`
- `Island`
- `Swamp`
- `Mountain`
- `Forest`
- `Desert`
- `Gate`
- `Town`

### 5.6 Spell Types

No additional spell subtypes are listed here.

For current Biblical title-generation work, treat `Instant` and `Sorcery` as the primary nonpermanent spell frames.

### 5.7 Creature Types

Creature subtype model:

- race + class is the most important working pattern

Example races:

- `Human`
- `Angel`
- `Demon`
- `Elf`
- `Spirit`
- `Zombie`
- `Dragon`
- `God`

Example classes:

- `Advisor`
- `Monk`
- `Cleric`
- `Noble`
- `Warrior`
- `Wizard`
- `Soldier`
- `Rogue`
- `Knight`
- `Shaman`

Combined examples:

- `Human Monk`
- `Angel Warrior`
- `Demon God`

### 5.8 Battle Types

- `Siege`

### 5.9 Dungeon Types

No dungeon subtypes are listed here.

## 5. Biblical Working Pools

### 6.1 People And Class Types

Starter working ideas:

- `Human`
- `Angel`
- `Demon`
- `Spirit`
- `God`
- `Advisor`
- `Cleric`
- `Monk`
- `Noble`
- `Soldier`
- `Warrior`
- `Knight`
- `Archer`
- `Scout`
- `Wizard`
- `Warlock`
- `Assassin`
- `Rogue`
- `Shaman`

### 6.2 Rulers And Warriors

Starter working ideas:

- `Human Soldier`
- `Human Warrior`
- `Human Knight`
- `Human Archer`
- `Human Assassin`
- `Human Cleric`
- `Human Monk`
- `Angel Warrior`

### 6.3 Angels, Demons, And Spirits

Starter working ideas:

- `Angel`
- `Demon`
- `Spirit`
- `God`
- `Angel Warrior`
- `Demon God`

### 6.4 Monsters And Animals

Starter working ideas:

- `Beast`
- `Serpent`
- `Zombie`
- `Horse`
- `Bird`
- `Sheep`
- `Dragon`

Note:

- this section is intentionally incomplete until the official terminology is loaded

### 6.5 Relic And Object Frames

Starter working ideas:

- `Artifact`
- `Legendary Artifact`
- `Artifact - Equipment`
- `Artifact - Fortification`
- `Artifact - Treasure`
- `Artifact - Food`
- `Artifact - Vehicle`
- `Artifact - Clue`
- `Artifact - Map`
- `Artifact - Powerstone`

### 6.6 Miracles, Laws, Prophecies, And Covenant Frames

Starter working ideas:

- `Enchantment`
- `Enchantment - Saga`
- `Enchantment - Aura`
- `Enchantment - Background`
- `Enchantment - Class`
- `Enchantment - Shrine`
- `Enchantment - Curse`
- `Enchantment - Room`
- `Instant`
- `Sorcery`

### 6.7 Locations And Terrain Frames

Starter working ideas:

- `Land`
- `Legendary Land`
- `Basic Land`
- `Legendary Land - Cave`
- `Legendary Land - Town`
- `Basic Land - Plains`
- `Basic Land - Swamp`
- `Basic Land - Mountain`
- `Basic Land - Forest`
- `Land - Desert`
- `Land - Gate`

### 6.8 Event And Story Frames

Starter working ideas:

- `Enchantment - Saga`
- `Instant`
- `Sorcery`
- `Battle`
- `Battle - Siege`

## 6. Card Header Reference

### 7.1 Core Header Structure

The terminology reference describes the visible classification format as:

```text
[Supertypes] [Card Types] — [Subtypes]
```

Examples:

- `Legendary Creature — Human Monk`
- `Artifact — Equipment`
- `Enchantment — Saga`

### 7.2 Naming Conventions To Keep In Mind

Useful naming patterns from the terminology reference:

- `Name`
- `Name, Title`
- `The [Object]`
- `Object of [Concept]`
- event names such as `Fall of Man` or `Divine Judgment`

### 7.3 Suggested Working Data Shape

The terminology reference also supports tracking card-header identity in a structured format like:

```json
{
  "name": "John, Beloved Disciple",
  "supertypes": ["Legendary"],
  "types": ["Creature"],
  "subtypes": ["Human", "Monk"],
  "mana_cost": "{1}{W}",
  "rarity": "Rare",
  "set": "BIB",
  "color_identity": ["W"]
}
```

## 7. Usage Notes

- treat this document as a working pool, not a frozen final list
- prefer official MTG terms when they exist
- add new options when a Biblical concept clearly needs them
- keep candidate type lines plausible for Magic even when the naming is highly flavorful
