# Low Tier Enemy Implementation Plan

## Purpose

This document turns the enemy progression direction into a concrete first implementation plan for low-tier enemies.

The goal is to build a small but expandable enemy set that:

- is easy for players to read
- establishes the combat language early
- supports future progression
- works with the current `base power` plus reusable action template model
- can eventually translate cleanly into a physical card game

Primary reference:

- [Enemy Progressions And Player Growth](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/ENEMY_PROGRESSIONS_AND_PLAYER_GROWTH.md)

## Design Goal

Low-tier enemies should feel like:

- the first real encounter layer
- simple enough to teach the rules
- varied enough to avoid feeling identical
- scalable enough to become stronger later without changing the whole system

They should not yet be:

- full boss puzzles
- complex phase enemies
- heavy summoner encounters
- mirrored MTG-style opponents

## Core Low-Tier Enemy Rules

The preferred low-tier model is:

- enemies have a health bar
- enemies may have a base power value
- enemies mainly use reusable action templates
- most actions reference base power
- some actions may use fixed numbers when needed
- tokens are simple and usually attack-only

For low-tier enemies, the core enemy language should be:

- `Attack with base power`
- `Attack twice with base power`
- `Gain block equal to base power`
- `Spawn a simple token`
- `Add +1 power`

## What Low-Tier Enemies Are Supposed To Teach

Early enemies should teach the player:

- the meaning of enemy health
- how visible intent works
- how base power scales enemy pressure
- how tokens change target priority
- how to respond to a simple attack pattern

If the player understands one or two low-tier enemies, they should be ready to understand the rest of the system.

## Recommended Low-Tier Enemy Ladder

### Tier 1: Grunts

Grunts are the simplest possible enemy type.

Characteristics:

- low health
- one base power number
- one repeating attack move
- optional fixed token at battle start

Example:

- `Grunt Demon 5/18`
- `Attack once with base power`

Purpose:

- teach baseline damage pressure
- create fast, readable fights

### Tier 2: Bruisers

Bruisers hit harder, but still stay simple.

Characteristics:

- moderate health
- higher base power than grunts
- may alternate between one strong attack and one small setup move

Example:

- `Bruiser Demon 6/24`
- `Attack twice with base power`
- `Gain block equal to base power`

Purpose:

- teach heavier pressure
- create obvious “survive the hit” encounters

### Tier 3: Warders

Warder enemies are defensive early enemies.

Characteristics:

- modest damage
- some defensive turn content
- may buy time for a follow-up attack

Example:

- `Warder Demon 4/22`
- `Gain block equal to base power`
- `Attack once with base power`

Purpose:

- teach that enemies can stall or set up
- give the player a reason to push damage before the defense lands

### Tier 4: Spawners

Spawner enemies introduce battlefield pressure.

Characteristics:

- moderate health
- can spawn simple attack-only tokens
- the spawned tokens are usually weaker than the main enemy

Example:

- `Spawn 2/4 Imp`
- `Attack once with base power`
- `Attack once with base power`

Purpose:

- teach token management
- create the first “main enemy versus adds” pattern

## Implementation Strategy

### Phase 1: Lock The Low-Tier Rules

Define the low-tier enemy contract clearly.

Decisions to lock:

- enemy health is the primary life total
- base power is the main scaling stat
- action templates should reference base power
- fixed numeric actions are reserved for special cases
- tokens are simple unless explicitly promoted later

Definition of done:

- we can describe low-tier enemies using one shared model
- the model supports both generic actions and special-case values

### Phase 2: Add Reusable Action Templates

Add or standardize a small low-tier action set.

Recommended starter templates:

- `attack_once_base_power`
- `attack_twice_base_power`
- `gain_block_equal_base_power`
- `spawn_simple_token`
- `gain_power`

These templates should be easy to reuse across multiple enemy families.

Implementation notes:

- templates should be readable in battle logs
- templates should be small enough to print on a physical card
- templates should not require a large rules engine

Definition of done:

- low-tier enemies can be authored from a small reusable action vocabulary

### Phase 3: Create Token Rules

Define the simplest enemy token profile.

Recommended token rules:

- tokens usually attack only
- tokens have fixed health and attack values
- tokens can start on the battlefield or be spawned by a main enemy
- tokens should be disposable and easy to clear

Recommended token examples:

- `Imp 2/4`
- `Minion 3/3`
- `Hound 1/2`

Definition of done:

- token enemies are simple enough to understand at a glance
- the game can support starting tokens or spawned tokens

### Phase 4: Build First Enemy Presets

Implement a small low-tier enemy roster.

Recommended first roster:

- `Grunt Demon`
- `Bruiser Demon`
- `Warder Demon`
- `Imp Caller`

Each one should test a different early-game skill:

- raw damage
- heavy hit timing
- defense timing
- token cleanup

Definition of done:

- we have at least 4 distinct low-tier enemy presets
- each preset is meaningfully different but still simple

### Phase 5: Wire Into Scenarios

Connect the low-tier enemies to the scenario registry.

Implementation targets:

- `src/cloud-arena/scenarios/enemies.ts`
- `src/cloud-arena/scenarios/enemy-cards.ts`
- `src/cloud-arena/scenarios/enemies/*.ts`
- `src/cloud-arena/scenarios/enemy-cards/*.ts`

Notes:

- keep the current `long_battle_demon` higher-tier encounter separate
- add low-tier enemies as their own category rather than replacing the existing demo enemy
- preserve the ability to use behavior-based or card-based enemy definitions

Definition of done:

- the game can load low-tier enemies by preset
- tests can instantiate them directly

### Phase 6: Add Balance Tests And Simulations

Use tests and simulations to check whether the new enemies actually play well.

Test goals:

- the enemy intent is readable
- base power scales the expected damage correctly
- tokens spawn or start in the right place
- low-tier enemies remain beatable by starter decks
- low-tier enemies are distinct from each other

Simulation goals:

- confirm grunts feel weaker than bruisers
- confirm spawners create more board pressure than grunts
- confirm warders slow the player down without stalling forever

Definition of done:

- at least one deterministic test exists for each low-tier enemy family
- at least one simulation pass can compare the families

## Recommended First Enemy Set

### Grunt Demon

- health: low
- base power: low
- main move: `Attack once with base power`

Use this as the baseline enemy.

### Bruiser Demon

- health: slightly higher
- base power: medium
- main move: `Attack twice with base power`

Use this as the “big hit” enemy.

### Warder Demon

- health: moderate
- base power: low-to-medium
- main move: `Gain block equal to base power`

Use this as the early defensive enemy.

### Imp Caller

- health: moderate
- base power: medium
- main move: `Spawn a simple token`

Use this as the first enemy that changes board texture.

## Balance Guidelines

When tuning low-tier enemies, prefer the following order:

1. adjust health first
2. adjust base power second
3. adjust pattern timing third
4. adjust token count last

This keeps the enemy identity stable while tuning difficulty.

Avoid tuning low-tier enemies by:

- adding too many special rules
- adding complicated phase changes too early
- making tokens too strong
- using block as a universal second health layer

## Printing And Physical Game Considerations

Because the eventual goal includes a physical card game, low-tier enemies should be printable in a compact form.

That means:

- reuse a small set of action templates
- keep token cards simple
- keep the main enemy card focused on health, base power, and rank
- avoid bespoke scripting for every early enemy

If a card must be unique, make it unique for a clear reason:

- boss identity
- token identity
- threshold phase
- set piece encounter

## Open Questions

- How many action templates should be printed on the enemy card itself?
- Should low-tier enemies reveal just one upcoming move, or a short sequence?
- Should simple tokens use exact numbers or scale from a weaker base power?
- Should early enemies ever have a defend action, or should defense appear only on specific families?
- Should the first physical enemy set include rank markers or a separate difficulty tier card?

## Practical Recommendation

Start with four low-tier enemies and keep them deliberately simple:

- one raw attacker
- one heavier attacker
- one defensive enemy
- one token spawner

That set will give the player early variety while keeping the enemy system small enough to print, test, and balance.
