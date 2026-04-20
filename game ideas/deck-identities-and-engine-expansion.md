# Deck Identities And Engine Expansion

## Purpose

This note captures the deck identities we can already support with the current mechanics, plus the engine improvements that would unlock cleaner and more expressive archetypes later.

It is intended to keep theme, card design, and engine work pointed at the same long-term goals.

## Design Framing

The best deck identities in this project should feel like they belong to a specific biblical pool or era, not just a generic strategy with a biblical coat of paint.

That means each pool should have:
- a primary identity
- a small set of signature mechanics
- a few enablers
- a few payoffs
- only limited cross-pool bridges

This fits the broader archetype direction in the game ideas docs and keeps the card pool readable.

## Deck Identities We Can Build Now

These identities already fit the current engine reasonably well.

### Go Wide / Anthem

Many small units, shared buffs, token pressure, and collective growth.

Why it works now:
- the engine supports token creation
- board-wide counters and stat buffs already exist
- static bonuses and triggered growth are easy to express

Good homes:
- Patriarchs
- Acts / early church
- Goblin- or swarm-style pools

### Voltron / Go Tall

One or two primary threats get stacked with buffs, equipment, protection, and counters.

Why it works now:
- equipment and attachment support already exist
- counter growth already exists
- targetable protection and combat buffs are already in the system

Good homes:
- Kings and kingdoms
- Heroic or champion-style subthemes

### Sacrifice / Aristocrats

Turn deaths, sacrifices, and expendable bodies into resources.

Why it works now:
- sacrifice effects already exist
- death triggers already exist
- counters and token bodies create good fodder and payoffs

Good homes:
- Temple / priesthood
- Black-aligned pools
- Martyr or offering subthemes

### Graveyard Recursion

Replay lost pieces, recover value from the graveyard, and treat the yard as a second resource zone.

Why it works now:
- card return and recursion patterns already exist in the card pool
- discard and draw effects are available
- death-triggered value is supported

Good homes:
- Prophets and exile
- Black recursion
- Resurrection-adjacent gospel cards

### Control / Tempo

Use removal, bounce, tapdown, discard, and counters to stay ahead and win on efficiency.

Why it works now:
- direct damage and targeted removal already exist
- bounce and discard are already present in the card pool
- the engine can support simple denial and tempo lines

Good homes:
- Prophets and exile
- Judges and conquest
- Blue-aligned pools

### Ramp / Big Summons

Build resources early, then land oversized permanents or token bursts.

Why it works now:
- mana-ramp and mana-production patterns already exist in the data
- summon effects are supported
- large stat monsters already fit the permanent model

Good homes:
- Exodus and wilderness
- Creation / early world
- Green-aligned pools

### Lifegain / Sustain

Stabilize, recover, and outlast the opponent.

Why it works now:
- lifelink and life gain already exist
- defensive bodies and block are supported
- healing and sustain are natural to the current board model

Good homes:
- Gospels
- White-aligned pools
- Mercy and restoration themes

### Draw-Go / Spells-Matter Lite

Cast cheap interaction, keep cards flowing, and reward precision turns.

Why it works now:
- draw, discard, and cantrips are available
- spell-like instants and sorceries are already common in the pool
- the engine can already reward trigger-based value from card play patterns

Good homes:
- Blue-aligned pools
- Prophets
- Wizard and insight themes

## Engine Expansions That Would Unlock More Identities

These are the highest-value places to expand the rules engine if we want more distinct deck identities.

### 1. Spell-Cast And Card-Played Triggers

Add explicit triggers for:
- `card_played`
- `spell_cast`

What this unlocks:
- true spells-matter decks
- miracle-style timing
- magecraft-style repeat value
- cast-count engines
- more expressive draw-go decks

Why this matters:
- current triggers are strong for board events, but they do not fully cover “I cast a spell” identities

### 2. Role, Tag, Or Faction Selectors

Add selectors for card roles or tags, not just controller, zone, type, and subtype.

What this unlocks:
- Angel-matters
- Priest-matters
- Demon-matters
- Healer-matters
- tribe- or faction-specific payoffs without brittle special cases

Why this matters:
- a lot of the best deck identities are not just about creature type
- role-based synergy makes era design cleaner and easier to balance

### 3. Named Status Counters

Add persistent named statuses such as:
- bless
- corruption
- fear
- zeal
- wound
- exhausted

What this unlocks:
- affliction decks
- buff/debuff tension
- pressure-over-time control shells
- more flavorful priest, prophet, and demon mechanics

Why this matters:
- counters already exist, but named status counters create a clearer gameplay language than generic stat boosts alone

### 4. Formation Or Adjacency Rules

Let board position matter more than just slot occupancy.

What this unlocks:
- frontline / backline decks
- protector and support formations
- party-style tactical play
- guard, shielding, and escort identities

Why this matters:
- the board already has slots, so adjacency or row logic would be a natural extension
- formation identity is a strong fit for Acts, military, and guardian themes

### 5. Attachment And Equipment Depth

Expand attachment rules so equipment and aura-like play patterns feel richer and more reliable.

What this unlocks:
- relic decks
- sacred item builds
- aura-based support
- more meaningful voltron and temple-style engines

Why this matters:
- attachment exists, but more lifecycle rules would make it a real archetype pillar rather than a narrow feature

### 6. Exhaust, Delay, Or Burst Windows

Add mechanics that let cards store power and cash it in later.

What this unlocks:
- burst-turn decks
- delayed miracle turns
- combo windows
- “prepare, then unleash” gameplay

Why this matters:
- this would give the game a cleaner way to support dramatic payoff turns without needing a full combo engine

### 7. Extra Resource Axes

Let decks spend something besides energy for payoff.

Possible resource axes:
- life as resource
- discard as resource
- sacrifice as resource
- counters as resource

What this unlocks:
- martyr decks
- offering decks
- black-style power-at-a-cost strategies
- tighter identity between theme and cost structure

## Strong Era Mappings

These are the clearest long-term identity lanes.

- Early World Genesis: creation into corruption, remnant after judgment, board reset and rebuild
- Patriarchs: go wide, lineage, covenant scaling, tribe-matters
- Exodus and Wilderness: ramp, provision, survival, plagues, stance switching
- Conquest and Judges: tempo, battlefield pressure, ambush, risk-reward plays
- Kings and Kingdoms: go tall, leadership combat, equipment, fortification
- Prophets and Exile: control, inevitability, hand cycling, affliction
- Priests, Tabernacle, and Temple: relic synergy, ritual engines, sacrifice, cleansing
- Jesus and the Gospels: healing, sustain, resurrection, formation support
- Acts and the Early Church: party synergy, mission tempo, communal sacrifice, resilience

## Recommended Priority

If we want the biggest jump in deck identity quality, the best order is:

1. Add spell-cast and card-played triggers
2. Add role/tag/faction selectors
3. Add named status counters
4. Add formation or adjacency rules
5. Deepen attachment and equipment lifecycle

That order gives the most new archetypes per unit of engine effort.

## Short Version

The current engine already supports several strong identities:
- go wide
- go tall
- sacrifice
- recursion
- control
- ramp
- lifegain
- spells-matter lite

The biggest future unlocks are:
- explicit cast triggers
- richer selectors
- named status systems
- formation logic
- deeper attachments

Those additions would make the biblical pools feel more distinct and would let each era have a stronger mechanical personality.
