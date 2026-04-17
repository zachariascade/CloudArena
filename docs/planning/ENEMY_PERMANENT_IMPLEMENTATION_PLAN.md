# Enemy Permanent Implementation Plan

## Purpose

This document records the longer-term direction to make enemies first-class battlefield permanents instead of a separate special-case pool.

The goal is to unify combat around a single permanent model so that:

- enemy bodies use the same health and targeting flow as player permanents
- tokens, grunts, elites, and bosses can all live on the battlefield
- multi-enemy encounters are natural instead of bolted on
- enemy telegraphs can be shown per permanent for deck-based or scripted attacks
- the system translates more cleanly to a physical card game

Primary references:

- [Low Tier Enemy Implementation Plan](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/LOW_TIER_ENEMY_IMPLEMENTATION_PLAN.md)
- [Enemy Progressions And Player Growth](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/ENEMY_PROGRESSIONS_AND_PLAYER_GROWTH.md)

## Design Goal

The enemy-permanent model should feel like:

- a clean extension of the board, not a parallel rules system
- a way to represent both simple tokens and complex enemies
- a better home for targeting, damage tracking, and recovery policy
- a path toward enemies with decks, intent queues, or phase-based behavior

It should not feel like:

- a second player deck disguised as an enemy
- a hidden separate health pool that only sometimes matters
- an overly autonomous simulation layer the player cannot read

## Core Model

The core idea is:

- every enemy body on the battlefield is a permanent
- the encounter layer decides which permanent acts and when
- the permanent stores its own health, power, and recovery policy
- more advanced enemies may carry a behavior deck or scripted pattern

That yields three broad classes:

- `Enemy token`
  - a simple permanent
  - usually one attack routine
  - low rules overhead

- `Standard enemy`
  - a permanent with a small action pattern
  - may attack, defend, spawn, or scale

- `Boss enemy`
  - a permanent with a deck, phase thresholds, or queued intents
  - telegraphs upcoming moves in the UI

## Implementation Phases

### Phase 1: Unify Enemy Bodies With Permanents

Make enemy bodies use the permanent layer as the source of truth.

Tasks:

- represent enemy bodies as battlefield permanents
- keep player and enemy permanents compatible at the rules layer
- make damage, destruction, and targeting operate the same way for both sides
- keep recovery policy on the permanent

Definition of done:

- an enemy body can be damaged and removed like any other permanent
- enemy tokens and enemy leaders share the same battlefield representation

### Phase 2: Preserve The Encounter Layer

Keep encounter logic separate from the permanent object itself.

Tasks:

- choose which enemy permanent acts each enemy turn
- define whether the battle ends when one leader dies or when all enemy permanents die
- support boss thresholds and phase changes
- support simple token routines without requiring a deck

Definition of done:

- permanent data remains simple
- encounter rules decide turn order and win conditions

### Phase 3: Add Enemy Behavior Packages

Allow enemy permanents to have different behavior styles.

Recommended packages:

- `behaviorDeck`
  - used for bosses or complex elites
  - produces intents or queued actions

- `behaviorPattern`
  - small reusable routines for ordinary enemies
  - can alternate between a few common actions

- `simpleRoutine`
  - for tokens and very low-tier bodies
  - usually attack-only

Definition of done:

- enemies can be authored as deck-based, pattern-based, or simple-routine bodies

## UI Changes

### Battlefield Rendering

The live battle UI should render enemy permanents directly in the battlefield lane.

Each enemy permanent card should show:

- name
- current health and max health
- power
- block or other temporary defense, if applicable
- current status such as tapped, defended, or enraged

### Telegraphing

For enemies with decks or patterns, the UI should show telegraphing clearly.

Recommended baseline:

- normal enemies show one intent at a time
- elites can show a short upcoming queue
- bosses can show a richer pattern strip or phase badge

Telegraph content can include:

- attack amount
- repeated hits
- spawn actions
- defense actions
- scaling actions like power gain

### Targeting

Player attacks and targeted spells should be able to pick enemy permanents directly.

UI requirements:

- hover highlights legal enemy targets
- clicked enemy permanent is visually selected
- damage appears on the chosen permanent
- dead permanents disappear from the lane cleanly

### Damage Readability

Enemy health should visibly decrease on the card or lane tile when hit.

The UI should make it easy to tell:

- how much damage was dealt
- whether damage was absorbed by block
- whether the enemy will heal back at end of round
- whether the enemy is a full-heal permanent or a persistent damage permanent

## Migration Strategy

The refactor should be gradual.

### Step A
- Keep the current enemy pool working while introducing enemy permanents as the primary battlefield object.

### Step B
- Convert tokens and low-tier enemies first.

### Step C
- Map the current main enemy display onto a permanent-backed enemy leader.

### Step D
- Move boss and multi-enemy battles onto the same permanent model.

### Step E
- Remove remaining special-case enemy-only code once the permanent model fully covers combat.

## Tests

Add tests for:

- enemy permanents taking damage and dying correctly
- recovery policy on enemy permanents
- targeted attacks against enemy permanents
- multiple enemy permanents on the battlefield
- turn resolution for simple routines versus deck-based enemies
- telegraph display for enemies with queued behaviors
- victory conditions when the primary enemy dies or all enemy bodies die

## Recommended First Slice

The smallest useful first step is:

1. make the main enemy optionally backed by a permanent
2. keep tokens as full enemy permanents
3. render the enemy permanent in the battlefield lane
4. add per-enemy telegraphing for deck-based enemies
5. expand to multiple enemies after the single-enemy path is stable

That gives us a good transition path without forcing a full rewrite all at once.
