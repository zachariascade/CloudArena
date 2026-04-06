# Core Combat Spec

## Table of Contents

- ✓ [Purpose](#purpose)
- ✓ [Design Direction](#design-direction)
- ✓ [Core Loop](#core-loop)
- ✓ [Current Default Assumptions](#current-default-assumptions)
- ✓ [Hand Size](#hand-size)
- [Resources](#resources)
- ✓ [Enemy Intent](#enemy-intent)
- ✓ [Enemy Behavior Model](#enemy-behavior-model)
- ✓ [Enemy Power](#enemy-power)
- ✓ [Card Resolution](#card-resolution)
- ✓ [Targets](#targets)
- [Multiple Enemies](#multiple-enemies)
- ✓ [Permanents](#permanents)
- ✓ [Current Permanent Model](#current-permanent-model)
- ✓ [Current Use Timing](#current-use-timing)
- [Board Slots](#board-slots)
- ✓ [Action System](#action-system)
- ✓ [Permanent Action Rules](#permanent-action-rules)
- ✓ [Defense and Damage](#defense-and-damage)
- ✓ [Defensive Model](#defensive-model)
- ✓ [Current Damage Rules](#current-damage-rules)
- ✓ [Damage Settlement Order](#damage-settlement-order)
- ✓ [Chosen Toughness Model](#chosen-toughness-model)
- ✓ [Tracking Note](#tracking-note)
- [Deckbuilding Progression](#deckbuilding-progression)
- ✓ [Current Minimal Combat Taxonomy](#current-minimal-combat-taxonomy)
- ✓ [Prototype Complexity Budget](#prototype-complexity-budget)
- ✓ [Example Combat Flow](#example-combat-flow)
- ✓ [Why This Model Currently Works](#why-this-model-currently-works)
- [Major Open Questions](#major-open-questions)
- [Recommended Next Design Step](#recommended-next-design-step)

## Purpose

This document captures the current first-pass combat model for the biblical card game exploration.

The goal is to preserve the parts that feel exciting:

- strong biblical card flavor
- big swing moments like board wipes and resurrection effects
- build-around permanent heroes
- deckbuilding progression

while avoiding the thematic awkwardness of sacred figures simply fighting each other as standard MTG creatures.

This spec is intentionally early, but it is meant to reflect the current prototype direction rather than preserve discarded branches.

## Design Direction

The current combat model is closest to:

- Slay the Spire-style turn flow
- deckbuilder progression between combats
- on-board permanents that add tactical decisions
- biblical/spiritual theme expressed through enemies, permanent heroes, events, and powers

Instead of players targeting other biblical heroes, players primarily target:

- demons
- spiritual warfare entities
- enemy forces aligned with corruption, sin, death, or similar adversarial themes

This keeps combat focused on a more natural enemy and avoids the core thematic contradiction of sacred-figure mirror matches.

## Core Loop

Each combat currently works like this:

1. Player turn begins.
2. Player draws a base number of cards.
3. Player gains a pool of resources for the turn.
4. Enemy intents are visible before the player acts.
5. Player plays cards up to available energy/resources.
6. Played cards resolve immediately when chosen.
7. Permanents on the field can also use their actions during the player's turn.
8. Player ends the turn.
9. Enemy attacks and intent resolution settle.
10. Round resets and the next player turn begins.

This means the pacing is meant to feel readable and tactical rather than stack-heavy or timing-window-heavy.

## Current Default Assumptions

These are the working assumptions currently on the table.

### Hand Size

Players draw `5` cards at the start of a turn.

This is currently a default prototype number, not a final rule.

### Resources

Players have an energy/resource total each turn.

Cards are played by spending that energy. The exact name of the resource is not yet finalized. For now it can be thought of as a generic energy system similar to Slay the Spire.


### Enemy Intent

Enemies telegraph their intent before the player acts.

The initial prototype intent categories are intentionally minimal, but they are card-defined and may be combined:

- attack
- defend

This means an enemy action may:

- attack only
- defend only
- attack and defend in the same turn

For current prototype purposes, `defend` means the enemy gains Block.

These can be expanded later, but the first prototype should stay minimal and easy to track.

### Enemy Behavior Model

Each enemy card has a behavior script printed on the back.

That script determines what the enemy will do each round.

The current prototype supports two main behavior models:

#### 1. Routine Enemies

Some enemies follow a fixed sequence of actions.

Examples:

- Attack, then Defend, then Attack, then Defend
- Attack, then Attack plus Defend, then Defend, then repeat

This creates predictable enemies that players can learn and plan around.

#### 2. Die-Driven Enemies

Some enemies use a die roll to determine their next action.

Example mapping:

- `1-2`: Attack
- `3-4`: Defend
- `5-6`: Attack and Defend

This creates more uncertainty while still keeping the action space small and readable.

### Enemy Power

Enemies have a `base power` value.

That base power is used when resolving enemy actions and can be modified by:

- scaling rules
- buffs
- debuffs
- encounter effects
- difficulty adjustments

For example, an enemy with base power `8` might:

- Attack for `8`
- Defend for `8 Block`
- Attack for `8` and Defend for `8 Block`

Modifiers can then increase or reduce those values as needed.

This gives the game a simple numerical anchor for tuning enemy behavior without requiring every action to be hand-authored from scratch.

### Enemy Resolution Order

When an enemy action combines multiple effects, the order is defined by the enemy card.

For example, an enemy card may specify:

- Defend, then Attack
- Attack, then Defend
- Attack, then apply another effect

This allows enemy behaviors to be expressive without requiring one universal mixed-action order.

### Card Resolution

Cards resolve immediately when played.

This is an important current decision. It means:

- the player sees results as they make choices
- tracking is easier than if everything settles at end of turn
- enemy intent still resolves afterward during the enemy phase

Player cards may also be card-defined combinations, including cards that both deal damage and grant Block in the same play.

When a player card combines multiple effects, those effects resolve in the order written on the card.

### Targets

The player targets enemy demons or spiritual warfare entities directly.

This means the game does not need a framing where biblical heroes are attacking each other.

### Multiple Enemies

Combat can include multiple enemies.

This allows encounters involving:

- multiple demons
- enemy mobs
- layered threats
- bosses with supporting entities

This is part of the broader system direction, but not part of the initial prototype scope.

The initial prototype should assume one enemy per battle.

## Permanents

Permanents are a major part of the system and one of the defining layers of combat.

### Current Permanent Model

Permanents will likely have:

- Power
- Health
- effects

Power is used for attack.

Health is persistent and is used to track how much damage a permanent can survive before dying.

Some permanents may:

- have a single defined activation
- have a choice between multiple activations
- include attack, defend, attack plus defend, or other custom effects in those activations
- have card-defined limits on how often abilities may be used

### Current Use Timing

Permanents act during the player's turn, at the speed of the player.

That means:

- the player chooses when to use them
- their effects happen during the same phase as played cards
- their decisions are part of the tactical player phase rather than a separate complicated subsystem

Permanents do not exhaust after acting.

They perform their role during the player turn, then remain available to matter during the enemy turn according to the blocking/protection rules.

Under the current model, a permanent's role for the round is determined by the activation it uses.

Some activations may:

- attack only
- defend only
- attack and defend
- provide another custom effect

This creates a useful tactical tradeoff without requiring tap/exhaust bookkeeping.

### Board Slots

The player has a low number of permanent slots on the board.

This is an important current design choice because it makes permanents a commitment rather than automatic value.

The intended feel is:

- playing a permanent now may help stabilize immediately
- holding a slot open may allow a stronger permanent later
- players must choose whether to invest in current protection, current offense, or future board quality

The exact number of slots is not yet finalized, but the prototype should stay intentionally low to keep board state readable.

### Action System

Permanents use a fixed action model.

Under the current prototype:

- a fixed action model for permanents
- one activation per permanent each turn
- an activation set defined by the card
- permanents acting independently of the player's energy pool unless a card specifically says otherwise

This gives permanents stronger board presence and makes board-slot decisions more meaningful.

It also helps separate two different kinds of choices:

- hand and energy decisions
- board and permanent-action decisions

The hybrid model remains a strong future option if later testing suggests that some premium activations should also cost player energy.

For the initial prototype:

- permanents should not have passive abilities
- complexity should live in their activation choice, not in layered triggered text

### Permanent Action Rules

Each permanent gets `one activation` during the player's turn.

Permanents may take their activation at any point during the player's turn.

Permanents have `summoning sickness`.

A permanent summoned this turn cannot use its activation on the same turn it enters play.

Once a permanent uses its activation:

- move it forward and tap it to indicate the activation has been selected
- a tapped permanent has used its activation for the round

The specific activation rules are:

#### Attack Activation

If a permanent uses an attack activation:

- tap it
- move it into an attacking position
- settle its damage immediately

#### Defend Activation

If a permanent uses a defend activation:

- tap it
- move it into a defending position
- place it into the blocking queue

Defending permanents do not settle damage immediately. They wait for enemy damage settlement during the enemy turn.

#### Mixed Or Custom Activation

If a permanent uses a mixed or custom activation:

- tap it
- resolve the instructions written on the card immediately

Some cards may define activations that:

- attack and defend in the same round
- defend and apply another effect
- attack and apply another effect
- perform a fully custom action

These activations resolve in the order written on the card.

## Defense and Damage

For now, player survivability is visualized as ordinary `health`.

### Player Health Persistence

Player health is persistent between enemy encounters.

This means damage taken in one battle carries forward into future battles unless restored by some out-of-combat system that may be designed later.

### Defensive Model

Defense currently draws from the "Osty" style idea from Slay the Spire 2:

- permanents can be assigned to defensive roles during the player turn
- permanents that defend may absorb or intercept incoming damage during the enemy phase
- the player may choose how to allocate incoming damage among eligible defending permanents
- shields/wards can be applied to prevent incoming damage

This creates a defensive ecosystem where the player can:

- protect self directly with shields/wards
- use permanents as defensive bodies
- decide whether a permanent attacks, defends, or provides utility for the round

Because enemy intent is telegraphed, the player can plan protection in advance and assign damage among permanents based on how they chose to use those permanents during the turn.

Under the current model:

- a permanent is eligible to defend only if its activation places it into the blocking queue
- a permanent that defends puts its persistent health at risk
- if a defending permanent is reduced to zero health, it dies and goes to the graveyard

This makes defense an explicit commitment rather than passive board value.

### Current Damage Rules

Currently decided:

- permanents do not exhaust after acting
- players may assign incoming damage among permanents based on protection choices and board state
- stronger hero permanents are played by paying an energy cost like other cards

### Damage Settlement Order

When enemy damage resolves, it settles in this order:

1. the player's Block
2. defending permanents in player-chosen order
3. the player's health

This means the player first absorbs as much damage as possible with Block. Any remaining damage is then assigned across eligible defending permanents in whatever order the player chooses. Any damage still remaining after that hits the player's health.

When damage settles on a defending permanent, it settles in this order:

1. that permanent's Block
2. that permanent's health

If a permanent's health reaches zero, it dies and goes to the graveyard.

### Chosen Toughness Model

Permanents use `persistent health`.

This means:

- damage on permanents remains marked across rounds
- permanents do not automatically refresh back to full between turns
- using a permanent to defend is a real long-term tradeoff

If a permanent's health is reduced to zero or below, it dies and is sent to the graveyard.

This creates natural room for later mechanics such as:

- resurrection
- return from graveyard
- martyrdom or sacrifice payoffs

This is the default model for permanents. Some keywords or card abilities may allow certain permanents to prevent or reduce a portion of incoming damage each round.

This creates room for specialized defensive archetypes without changing the baseline rule that permanent damage persists.

For the initial prototype, keyword variety should remain small.

### Tracking Note

Each permanent will use a die to track its current health.

For current prototype purposes:

- the die represents remaining health
- damage reduces the shown value
- if the value reaches zero or below, the permanent dies and goes to the graveyard

This gives the game a simple physical tracking method without needing a separate custom component system.

## Deckbuilding Progression

Decks improve after combat victories.

The current assumption is:

- after each combat, the player adds new cards into their deck
- special events may also modify the deck later

This is intentionally close to Slay the Spire structure for now.

Open progression details still to define later:

- how many card rewards appear after combat
- whether cards can be removed/purified from the deck
- whether relic/blessing systems exist
- whether scriptural eras or scenarios affect reward pools

## Current Minimal Combat Taxonomy

To keep the first prototype focused, the current minimal gameplay verbs are:

- attack
- defend
- summon
- block

These are not separate permanent action types. They are the basic verbs that cards and permanent activations can combine in card-defined ways.

This is enough to start designing sample cards without introducing too many subsystems too early.

Both player cards and enemy actions may combine these basic verbs in a single resolution.

## Prototype Complexity Budget

To keep cognitive load under control, the initial prototype should follow these constraints:

- low board slots
- one action per permanent per turn
- each permanent's available action set is defined by the card
- no passive abilities to start
- enemy intents built from attack and defend
- small keyword variety
- one enemy per battle

These are prototype constraints, not permanent design limits. They can be expanded later once the core loop feels good.

## Example Combat Flow

A first-pass example round could look like this:

1. Start turn.
Draw 5 cards and gain energy.

2. Reveal enemy intents.
The enemy shows its card-defined action, such as attack, defend, or attack plus defend.

3. Player phase.
The player plays cards one at a time, resolving each immediately.
The player may summon permanents, use permanent actions, deal damage, create defenses, or play cards that combine multiple effects such as attack plus Block.

4. End turn.
When the player finishes acting, the enemy phase begins.

5. Enemy phase.
The enemy performs its telegraphed card-defined intent.
Shields and wards apply first.
Any remaining unblocked damage may be absorbed by permanents or taken by the player, according to the final blocking/allocation rules.

6. Cleanup and next round.
The next turn begins and the cycle repeats.

## Why This Model Currently Works

This model already solves several important design needs:

- it preserves deckbuilder clarity
- it supports visible enemy pressure and meaningful player response
- it allows powerful biblical event cards to feel dramatic
- it gives permanents meaningful tactical presence
- it avoids requiring biblical figures to behave like random dueling monsters

It also leaves plenty of room for later thematic layering:

- corruption
- judgment
- prophecy
- resurrection
- covenant
- apocalyptic escalation

## Major Open Questions

The biggest unresolved items to flesh out next are:

1. exact resource naming and scaling
2. how stronger hero permanents should be costed and tuned relative to ordinary permanents
3. encounter structure for multiple enemies beyond the one-enemy prototype baseline
4. number of permanent board slots
5. what defensive keywords should exist to reduce or prevent damage each round
6. how post-combat rewards should be structured
7. how often mixed attack-and-defend actions should appear on player cards and enemies

## Recommended Next Design Step

The natural next step after this spec is to define a `first-pass enemy and balance framework`.

The combat rules are now concrete enough that the main remaining uncertainty is not how turns work, but how to tune encounters and scale the game cleanly.

The next most useful deliverables are:

1. an enemy card template
2. a first-pass balance framework
3. a post-combat reward structure
4. sample stronger hero permanent templates

An enemy card template should define:

- health
- base power
- behavior type
- behavior script or die table
- scaling hooks
- any special rule text

A first-pass balance framework should define:

- expected player output per turn
- expected Block generation per turn
- expected enemy pressure per turn
- expected survivability of ordinary permanents
- expected survivability and impact of stronger hero permanents
- expected combat length

These systems will make it much easier to prototype cards and encounters without balancing each one from scratch.
