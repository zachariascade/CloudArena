# Cloud Arena Rules Reference

This document captures the current Lean V1 combat rules implemented under `src/cloud-arena/`.

Its purpose is to make the active engine behavior easy to understand before adding more cards, mechanics, or heuristic logic.

## Scope

Lean V1 intentionally stays narrow.

The current engine supports:

- one player
- one enemy
- one enemy intent per round from a fixed repeating behavior list
- a small card pool: `attack`, `defend`, `guardian`
- battlefield permanents with `attack` and `defend` actions
- deterministic draw, discard, and reshuffle flow

The current engine does not support:

- multiple enemies
- targeting choices
- triggered abilities
- status effects
- timing windows beyond the player action phase and enemy resolution
- card text parsing
- randomness beyond seeded deck reshuffle order

## Battle Structure

Each round works like this:

1. Player action phase begins.
2. Player may play cards, use permanent actions, and eventually end turn.
3. Enemy intent resolves.
4. If both sides survive, the next round starts and blocks reset.

The battle ends immediately when either:

- enemy health is `0` or less
- player health is `0` or less

## Player State

The player currently has:

- `health`
- `maxHealth`
- `block`
- `energy`
- `drawPile`
- `hand`
- `discardPile`
- `graveyard`

### Energy

- player starts each round with `3` energy
- cards cost energy to play
- permanents do not cost energy to use once on the battlefield

### Hand / Draw / Discard

- opening hand draws up to `5` cards
- at the end of each round, unplayed cards in hand are moved to discard
- next round draws a fresh hand up to `5`
- if draw pile empties mid-draw, discard is shuffled into draw using the battle seed

## Enemy State

The enemy currently has:

- `health`
- `maxHealth`
- `block`
- `intent`
- `behavior`
- `behaviorIndex`

Enemy behavior is a repeating list of intents such as:

- `{ type: "attack", amount: 12 }`
- `{ type: "defend", amount: 8 }`

The next enemy intent is visible to the player at the start of each round.

## Card Model

The engine knows mechanics, not card names.

Cards are data-driven and currently have a small vocabulary:

- `deal_damage`
- `gain_block`
- `summon_permanent`

### Supported Lean V1 Cards

`attack`

- type: `instant`
- cost: `1`
- on play: deal `6` damage to enemy

`defend`

- type: `instant`
- cost: `1`
- on play: gain `7` player block

`guardian`

- type: `permanent`
- cost: `2`
- health: `10`
- actions:
  - `attack` for `4`
  - `defend` for `3`

## Permanents

Permanent cards enter the battlefield when played.

Each permanent currently tracks:

- `instanceId`
- `sourceCardInstanceId`
- `definitionId`
- `health`
- `maxHealth`
- `block`
- `actions`
- `hasActedThisTurn`
- `isDefending`
- `slotIndex`

### Permanent Rules

- permanents can act on the same turn they are played
- a permanent can act once per round
- battlefield has `3` fixed slots
- a permanent card does not go to discard when played
- when a permanent dies, the original card instance goes to graveyard

### Permanent Actions

`attack`

- deals its action amount to the enemy
- enemy block is removed before enemy health

`defend`

- grants that permanent block equal to the action amount
- adds the permanent to the blocking queue

## Damage Resolution

### Player Attacking Enemy

Card and permanent attack damage applies to:

1. enemy block
2. enemy health

### Enemy Attacking Player

Enemy attack damage applies in this order:

1. player block
2. defending permanents in blocking queue order
3. player health

If a defending permanent runs out of block and health, remaining damage spills to the next defender or to the player.

## Block Reset Rules

At the start of each new round:

- player block resets to `0`
- enemy block resets to `0`
- each permanent block resets to `0`
- each permanent is marked as not having acted
- each permanent is marked as not defending
- blocking queue is cleared

## Logging / Trace Behavior

The engine logs a readable event stream including:

- battle creation
- turn start
- each drawn card
- cards played
- block gained
- damage dealt
- permanent summon
- permanent action usage
- enemy intent resolution
- permanent destruction
- battle finish with final health snapshot

The simulator layer also records:

- action history
- final summary
- structured trace output

## Heuristic Assumptions

The current heuristic agent is still intentionally simple.

It currently prefers:

- lethal when available
- defense when projected incoming damage is meaningful relative to current health
- establishing permanents early
- attacks that convert into real enemy damage
- spending available energy rather than ending early

This policy should be treated as a baseline simulation policy, not as final gameplay AI.
