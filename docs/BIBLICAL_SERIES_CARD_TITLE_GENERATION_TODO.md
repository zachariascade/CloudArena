# Biblical Series Card Title Generation TODO

## 1. Purpose

This document turns the Biblical title-generation spec into an execution checklist.

It is meant to sit on top of:

- [BIBLICAL_SERIES_CARD_TITLE_GENERATION_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/BIBLICAL_SERIES_CARD_TITLE_GENERATION_SPEC.md)
- [CARD_STYLEGUIDE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/CARD_STYLEGUIDE.md)

The goal is to create a repeatable workflow for generating large numbers of Biblical card titles, grouped by set, with valid Magic-style type lines attached for later review and selection.

## 2. What This TODO Covers

- defining the Biblical set structure for title generation
- confirming the naming voice of each set
- building a complete MTG type inventory for naming support
- creating generation pools and prompts
- generating and reviewing large batches of candidate names
- identifying the creative decisions that require user direction

## 3. Key Decisions You Must Make

These decisions should be made before large-scale title generation starts.

### 3.1 Series Scope

- [ ] Decide whether the Biblical series should begin with only the existing `Book of Beginnings` set or with a multi-set roadmap
- [ ] Decide whether `Angels and Demons` is a standalone set or a cross-set support theme
- [ ] Decide whether the first title-generation pass should focus on Old Testament, New Testament, or both

Recommended starting choice:

- Start with a multi-set roadmap
- Keep `Book of Beginnings` as set 1
- Treat `Angels and Demons` as a flexible support set until the rest of the Biblical roadmap is clearer

### 3.2 Canon And Source Boundaries

- [ ] Decide how strict the project should be about sticking to directly Biblical material versus broader tradition
- [ ] Decide whether extra-biblical figures or traditions are allowed, such as named demonology, apocrypha, or later church tradition
- [ ] Decide whether cards may combine scriptural identity with fantasy-style epithets that are not directly taken from the text

Recommended starting choice:

- Use the Bible as the primary source
- Allow carefully labeled extra-biblical material only when it clearly supports a set
- Allow flavorful epithets as long as the identity remains recognizable

### 3.3 Christ And Sacred-Figure Treatment

- [ ] Decide whether Jesus Christ is represented directly as cards, indirectly through titles and events, or reserved for later
- [ ] Decide how reverent versus mythic the naming should be for Christ, apostles, prophets, and other sacred figures
- [ ] Decide whether some figures should be excluded entirely from card naming for tone or sensitivity reasons

Recommended starting choice:

- Make this explicit before any `Gospels` generation work begins

### 3.4 Set List

- [ ] Confirm the initial set map
- [ ] Decide whether the set names in the spec are placeholders or intended final set names
- [ ] Decide publishing order versus planning order

Suggested initial planning set list:

- `Book of Beginnings`
- `Exodus and Wilderness`
- `Judges and Kings`
- `Prophets and Exile`
- `Gospels`
- `Acts and the Early Church`
- `Revelation and the Last Things`
- `Angels and Demons`

### 3.5 Naming Voice

- [ ] Decide whether the overall style should lean more scriptural, mythic-fantasy, solemn, martial, poetic, or pulp-heroic
- [ ] Decide how ornate titles should be
- [ ] Decide whether common and uncommon cards should use simpler names than legendary cards

Recommended starting choice:

- Keep legendary titles vivid and elevated
- Keep nonlegendary names cleaner and more role-driven

### 3.6 Type-Line Philosophy

- [ ] Decide how conservative the type lines should be
- [ ] Decide whether the project should prefer familiar creature classes like `Cleric`, `Monk`, `Soldier`, and `Warrior` over more experimental mappings
- [ ] Decide whether some Biblical concepts should deliberately use artifact, enchantment, land, or saga frames more often than creature frames

Recommended starting choice:

- Be conservative at first
- Use broadly recognizable Magic type lines
- Expand into weirder mappings only after the first title pass is working

### 3.7 Output Format

- [ ] Decide where generated title candidates should live
- [ ] Decide whether the working format should be Markdown tables, JSON, CSV, or a mix
- [ ] Decide how much metadata each candidate needs before selection

Recommended starting choice:

- Use Markdown or JSON in-repo first
- Keep enough metadata to track set, source, role, and type line

## 4. Set Planning TODO

### 4.1 Confirm Biblical Series Structure

- [ ] Confirm the initial set list
- [ ] Confirm which set should be first for actual title generation
- [ ] Confirm whether existing `set_genesis` should remain the canonical anchor for set 1
- [ ] Decide whether additional set records should be created now or later

### 4.2 Write Set Briefs

- [ ] Create a one-page brief for `Book of Beginnings`
- [ ] Create a one-page brief for `Exodus and Wilderness`
- [ ] Create a one-page brief for `Judges and Kings`
- [ ] Create a one-page brief for `Prophets and Exile`
- [ ] Create a one-page brief for `Gospels`
- [ ] Create a one-page brief for `Acts and the Early Church`
- [ ] Create a one-page brief for `Revelation and the Last Things`
- [ ] Create a one-page brief for `Angels and Demons`

Each brief should define:

- tone
- source range
- named-character roster
- faction roster
- creature and monster roster
- key places
- key relics or sacred objects
- key story events

## 5. Type System TODO

### 5.1 Build The Complete MTG Type Inventory

- [ ] Create a reference file for supertypes
- [ ] Create a reference file for card types
- [ ] Create a reference file for artifact types
- [ ] Create a reference file for enchantment types
- [ ] Create a reference file for land types
- [ ] Create a reference file for spell types
- [ ] Create a reference file for creature types
- [ ] Create a reference file for battle types
- [ ] Create a reference file for dungeon types
- [ ] Cite the official Magic Comprehensive Rules as the source of truth

### 5.2 Build The Biblical Relevance Shortlist

- [ ] Identify the most useful creature types for Biblical humans and nations
- [ ] Identify the most useful creature types for angels, demons, monsters, and animals
- [ ] Identify the most useful noncreature type lines for relics, places, doctrines, miracles, plagues, and prophecies
- [ ] Define preferred type-line templates for named figures
- [ ] Define preferred type-line templates for nonlegendary characters
- [ ] Define preferred type-line templates for events, relics, and locations

## 6. Naming Pool TODO

### 6.1 Build Character And Concept Pools

- [ ] Build a named-figure pool for `Book of Beginnings`
- [ ] Build a named-figure pool for `Exodus and Wilderness`
- [ ] Build a named-figure pool for `Judges and Kings`
- [ ] Build a named-figure pool for `Prophets and Exile`
- [ ] Build a named-figure pool for `Gospels`
- [ ] Build a named-figure pool for `Acts and the Early Church`
- [ ] Build a named-figure pool for `Revelation and the Last Things`
- [ ] Build a named-figure pool for `Angels and Demons`

- [ ] Build nonlegendary role pools by set
- [ ] Build relic and sacred-object pools by set
- [ ] Build event and miracle pools by set
- [ ] Build place and terrain pools by set
- [ ] Build faction and tribe pools by set
- [ ] Build token and minor-concept pools by set

### 6.2 Attach Likely Type Lines

- [ ] Assign likely type lines to every named-figure pool
- [ ] Assign likely type lines to every nonlegendary role pool
- [ ] Assign likely type lines to every relic pool
- [ ] Assign likely type lines to every event pool
- [ ] Assign likely type lines to every location pool

## 7. Prompting TODO

### 7.1 Build Prompt Templates

- [ ] Write a prompt template for named legendary figures
- [ ] Write a prompt template for nonlegendary humans
- [ ] Write a prompt template for angels and demons
- [ ] Write a prompt template for relics and sacred objects
- [ ] Write a prompt template for miracles, judgments, and story events
- [ ] Write a prompt template for places and lands

### 7.2 Lock Prompt Rules

- [ ] Require prompts to specify set, role, tone, source anchor, and target type line
- [ ] Require prompts to preserve known identities for named figures
- [ ] Require prompts to avoid vague generic subtitles unless intentional
- [ ] Require prompts to return multiple candidates per request
- [ ] Require prompts to keep titles aligned with the set voice

## 8. Candidate Generation TODO

### 8.1 Create The Working Catalog

- [ ] Create a file or folder for generated title batches
- [ ] Define the standard row or object format for each candidate
- [ ] Include fields for set, source, role, name, type line, and status
- [ ] Include a way to track shortlist and final selections

### 8.2 Generate First-Pass Batches

- [ ] Generate 15-30 titles for each major legendary figure in the first target set
- [ ] Generate 8-20 titles for each secondary named figure in the first target set
- [ ] Generate 20-50 titles for each nonlegendary role bucket in the first target set
- [ ] Generate 20-40 titles for each event or relic bucket in the first target set

### 8.3 Expand To Later Sets

- [ ] Repeat first-pass generation for the second target set
- [ ] Repeat first-pass generation for the third target set
- [ ] Continue until all confirmed sets have working title pools

## 9. Review And Selection TODO

### 9.1 Build The Editorial Rubric

- [ ] Finalize the shortlist criteria for strong names
- [ ] Define what makes a name too generic
- [ ] Define what makes a type line implausible
- [ ] Define how much Biblical literacy is assumed in the naming
- [ ] Define when two candidate names are too similar to both keep

### 9.2 Review Generated Batches

- [ ] Review names for identity clarity
- [ ] Review names for set-tone consistency
- [ ] Review names for Magic flavor fit
- [ ] Review names for reverence and sensitivity where needed
- [ ] Shortlist the strongest names
- [ ] Mark rejected names clearly so dead options do not keep resurfacing

### 9.3 Prepare For Later Card Design

- [ ] Promote selected titles into a later card-design queue
- [ ] Decide when shortlisted titles are ready to become canonical card records
- [ ] Keep rejected names out of canonical `data/cards/` files

## 10. Suggested Order Of Work

1. Confirm the creative decisions in Section 3
2. Confirm the Biblical set map
3. Build the complete MTG type inventory
4. Build the Biblical relevance shortlist
5. Write set briefs
6. Build naming pools
7. Build prompt templates
8. Generate first-pass title batches for one set
9. Review and shortlist
10. Repeat for the next set

## 11. Best First Next Steps

If we want to move efficiently, the next three concrete tasks should be:

- [ ] Confirm the initial set list and whether `Angels and Demons` is standalone
- [ ] Decide the source boundary for extra-biblical material
- [ ] Choose the first set for title generation, likely `Book of Beginnings` or `Gospels`
