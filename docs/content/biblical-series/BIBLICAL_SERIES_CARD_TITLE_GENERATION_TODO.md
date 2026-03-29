# Biblical Series Card Title Generation TODO

## 1. Purpose

This document turns the Biblical title-generation spec into an execution checklist.

It is meant to sit on top of:

- [BIBLICAL_SERIES_CARD_TITLE_GENERATION_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/biblical-series/BIBLICAL_SERIES_CARD_TITLE_GENERATION_SPEC.md)
- [CARD_STYLEGUIDE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/CARD_STYLEGUIDE.md)
- [GREAT_ADVENTURE_BIBLE_TIMELINE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/biblical-series/GREAT_ADVENTURE_BIBLE_TIMELINE.md)

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

Confirmed decisions are marked complete below.

### 3.1 Series Scope

- [x] Use the full `GREAT_ADVENTURE_BIBLE_TIMELINE` roadmap as the overall set plan
- [x] Start title generation one timeline epoch at a time
- [x] Focus the first title-generation pass on Old Testament material

Recommended starting choice:

- Start with the full `GREAT_ADVENTURE_BIBLE_TIMELINE` roadmap
- Generate titles one epoch at a time
- Use support-material books from the timeline guide as flavor depth, not as a competing set structure

### 3.2 Canon And Source Boundaries

- [x] Use the Bible as the primary source boundary
- [x] Allow extra-biblical figures or traditions only as clearly labeled support material
- [x] Allow fantasy-style epithets when the underlying identity remains recognizable

Recommended starting choice:

- Use the Bible as the primary source
- Allow carefully labeled extra-biblical material only when it clearly supports a set
- Allow flavorful epithets as long as the identity remains recognizable

### 3.3 Christ And Sacred-Figure Treatment

- [x] Do not block current planning work on a sacred-figure policy
- [x] Allow title generation to proceed, with later manual filtering for anything you do not want to keep

### 3.4 Set List

- [x] Use `GREAT_ADVENTURE_BIBLE_TIMELINE` as the source of truth for which sets to make
- [x] Treat the timeline epoch names as planning labels for now
- [x] Keep publishing order aligned with timeline order for now

Current planning set list from `GREAT_ADVENTURE_BIBLE_TIMELINE`:

- `Early World`
- `Patriarchs`
- `Egypt & Exodus`
- `Desert Wanderings`
- `Conquest & Judges`
- `Kingdom`
- `Divided Kingdom`
- `Exile`
- `Return`
- `Maccabean Revolt`
- `Messianic Fulfillment`
- `Church`

### 3.5 Naming Voice

- [x] Use a scriptural-mythic naming voice overall
- [x] Keep titles elevated without becoming overly ornate
- [x] Keep common and uncommon names simpler than legendary-card names

Recommended starting choice:

- Keep legendary titles vivid and elevated
- Keep nonlegendary names cleaner and more role-driven

### 3.6 Type-Line Philosophy

- [x] Start with conservative type lines
- [x] Prefer familiar creature classes like `Cleric`, `Monk`, `Soldier`, and `Warrior` over experimental mappings in the first pass
- [x] Keep a non-exhaustive working list of possible type lines and expand it as new needs appear
- [x] Include noncreature frames from the start where they fit naturally, including artifact, enchantment, land, and saga frames

Recommended starting choice:

- Be conservative at first
- Use broadly recognizable Magic type lines
- Keep a growing working list of valid options as the project evolves
- Use noncreature frames freely for relics, places, doctrines, miracles, judgments, and major story events

### 3.7 Output Format

- [x] Use in-repo files for generated title candidates
- [x] Use Markdown first, with JSON added if batch volume grows
- [x] Keep enough metadata to track set, source, role, and type line before selection

Recommended starting choice:

- Use Markdown or JSON in-repo first
- Keep enough metadata to track set, source, role, and type line

## 4. Set Planning TODO

### 4.1 Confirm Biblical Series Structure

- [x] Confirm `GREAT_ADVENTURE_BIBLE_TIMELINE` as the set-planning source of truth
- [x] Start actual title generation with `Patriarchs`
- [x] Treat existing `set_genesis` as test content rather than a binding timeline mapping
- [x] Create additional set records only as work reaches each set, beginning with finishing `Patriarchs`

### 4.2 Write Set Briefs

- [x] Create a one-page brief for `Early World`
- [x] Create a one-page brief for `Patriarchs`
- [ ] Create a one-page brief for `Egypt & Exodus`
- [ ] Create a one-page brief for `Desert Wanderings`
- [ ] Create a one-page brief for `Conquest & Judges`
- [ ] Create a one-page brief for `Kingdom`
- [ ] Create a one-page brief for `Divided Kingdom`
- [ ] Create a one-page brief for `Exile`
- [ ] Create a one-page brief for `Return`
- [ ] Create a one-page brief for `Maccabean Revolt`
- [ ] Create a one-page brief for `Messianic Fulfillment`
- [ ] Create a one-page brief for `Church`

Each brief should define:

- matching timeline section
- core narrative books
- support books
- themes to mine
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

- [x] Create a dedicated working file for all possible type pools
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

- [ ] Build a named-figure pool for `Early World`
- [ ] Build a named-figure pool for `Patriarchs`
- [ ] Build a named-figure pool for `Egypt & Exodus`
- [ ] Build a named-figure pool for `Desert Wanderings`
- [ ] Build a named-figure pool for `Conquest & Judges`
- [ ] Build a named-figure pool for `Kingdom`
- [ ] Build a named-figure pool for `Divided Kingdom`
- [ ] Build a named-figure pool for `Exile`
- [ ] Build a named-figure pool for `Return`
- [ ] Build a named-figure pool for `Maccabean Revolt`
- [ ] Build a named-figure pool for `Messianic Fulfillment`
- [ ] Build a named-figure pool for `Church`

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
2. Confirm the Biblical set map from `GREAT_ADVENTURE_BIBLE_TIMELINE`
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

- [ ] Confirm `GREAT_ADVENTURE_BIBLE_TIMELINE` as the roadmap for which sets to make
- [ ] Decide the source boundary for extra-biblical material
- [ ] Choose the first timeline epoch for title generation, likely `Early World`, `Patriarchs`, or `Messianic Fulfillment`
