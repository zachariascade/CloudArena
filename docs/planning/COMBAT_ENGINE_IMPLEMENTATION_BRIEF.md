# Combat Engine Implementation Brief

## Purpose

This document is a concise build brief for the first Cloud Arcanum combat engine.

It is derived from:

- [CORE_COMBAT_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CORE_COMBAT_SPEC.md)
- [COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/COMBAT_EXAMPLE.md)
- [PERMANENT_COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/PERMANENT_COMBAT_EXAMPLE.md)

The goal is to define the smallest credible engine that can run prototype battles consistently.

## Core Rule Summary

The first engine should implement this combat loop:

1. Start player turn
2. Draw `5` cards
3. Gain turn energy
4. Reveal enemy intent
5. Player plays cards and uses permanent actions
6. Player ends turn
7. Enemy resolves its intent
8. Damage settles
9. Check death and victory
10. Start next round

Current prototype assumptions:

- one player
- one enemy
- immediate card resolution
- enemy intents limited to `attack`, `defend`, or ordered combinations of both
- player cards resolve in written order
- one permanent action per round
- permanents may `Attack`, `Defend`, or `Activate`
- a permanent cannot both attack and defend in the same round

## Engine Responsibilities

The engine should own:

- battle state
- turn progression
- draw and shuffle
- energy spending
- legal action generation
- immediate card resolution
- permanent action usage tracking
- enemy intent selection and resolution
- block and damage settlement
- death handling
- win and loss checks
- battle logging or trace hooks

The engine should not initially own:

- polished UI
- AI rules interpretation
- full deckbuilding progression
- multi-enemy combat
- full MTG stack and timing windows

## First Playable Scope

The first playable engine should support:

- player health
- player block
- enemy health
- enemy block
- hand
- draw pile
- discard pile
- graveyard
- battlefield
- board slots
- one enemy intent per round
- one permanent in play
- basic attack/defend cards
- one permanent card
- one permanent with `Attack` and `Defend`

That scope is enough to reproduce the current example docs in code.

## Lean V1

The initial engine should be even narrower than the full first-playable scope above.

Lean V1 should be treated as example-reproduction software, not as a general combat engine.

The goal is simply to prove that the current combat model works in code with the least possible abstraction and the fewest moving parts.

### Lean V1 Rules

Lean V1 should include only:

- one player
- one enemy
- fixed-sequence enemy behavior only
- `attack` and `defend` enemy intents only
- `Attack` card
- `Defend` card
- `Guardian`
- one permanent with `attack` and `defend`
- player block
- enemy block
- one blocking queue with at most one defender in practice
- permanent health persistence
- permanent death to graveyard

### Lean V1 Explicit Cuts

Lean V1 should not include:

- die-driven enemy behavior
- multiple enemies
- permanent `activate` actions
- mixed enemy intents like `attack_then_defend`
- generic card effect parsing
- configurable board sizes
- undo
- replay UI
- batch simulation
- broad mechanic support
- advanced timing windows

### Lean V1 Implementation Bias

For Lean V1, prefer:

- hard-coded supported effect types
- explicit state transitions
- fixed board slot count of `3`
- deterministic tests tied to the example docs
- simple code over flexible abstractions

### Lean V1 Success Condition

Lean V1 is successful if it can reliably reproduce:

- [COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/COMBAT_EXAMPLE.md)
- the basic Guardian defend flow in [PERMANENT_COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/PERMANENT_COMBAT_EXAMPLE.md)

If it can do that cleanly, the engine is ready for the next layer of complexity.

## Required State Model

The engine should have explicit types for:

- `BattleState`
- `PlayerState`
- `EnemyState`
- `PermanentState`
- `CardInstance`
- `Intent`
- `BattleAction`
- `BattleEvent`

Minimum `BattleState` fields:

- `turnNumber`
- `phase`
- `seed`
- `player`
- `enemy`
- `battlefield`
- `blockingQueue`
- `log`

Minimum `PlayerState` fields:

- `health`
- `block`
- `energy`
- `drawPile`
- `hand`
- `discardPile`
- `graveyard`

Minimum `EnemyState` fields:

- `health`
- `block`
- `basePower`
- `intent`
- `behavior`

Minimum `PermanentState` fields:

- `instanceId`
- `cardId`
- `name`
- `power`
- `health`
- `maxHealth`
- `block`
- `availableActions`
- `hasActedThisTurn`
- `isDefending`
- `slotIndex`

## Phases

The first engine should keep phases simple and explicit:

- `turn_start`
- `player_action`
- `enemy_resolution`
- `round_end`
- `finished`

That is enough for the current combat model and keeps legal action generation straightforward.

## Action Model

All player choices should go through explicit action objects.

Recommended initial actions:

- `play_card`
- `use_permanent_action`
- `end_turn`

Recommended permanent action modes:

- `attack`
- `defend`
- `activate`

The engine should reject illegal actions rather than silently fixing them.

## Resolution Rules

### Card Resolution

- cards resolve immediately when played
- card effects resolve in written order
- energy is spent when the play is accepted

### Block Settlement

Damage always hits block first.

Unused block does not carry over unless a future effect says otherwise.

### Enemy Attack Settlement

Current settlement order:

1. player block
2. defending permanents in blocking queue order
3. player health

### Permanent Damage Settlement

When damage hits a defending permanent:

1. permanent block
2. permanent health

If permanent health reaches `0`, it dies and moves to the graveyard.

### Permanent Round Rules

- each permanent gets one action per round
- defending places it into the blocking queue
- attacking deals immediate damage during the player turn
- acting does not remove the permanent from the battlefield
- at round reset, `hasActedThisTurn` and `isDefending` are cleared

## Enemy Model

The first engine should support only two behavior styles:

- fixed sequence
- die-driven or RNG-driven table

The enemy should expose one resolved intent per round, such as:

- `attack`
- `defend`
- `attack_then_defend`
- `defend_then_attack`

For the first implementation, the engine can normalize these into ordered effect lists internally.

## Logging

The engine should emit structured events for:

- turn start
- cards drawn
- energy gained
- intent revealed
- card played
- permanent summoned
- permanent acted
- damage dealt
- block gained
- health changed
- permanent died
- turn ended
- battle ended

This can start as an in-memory event list and later become a fuller trace system.

## Staged Build Plan

### Stage 1. Non-Permanent Combat

Build enough to reproduce [COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/COMBAT_EXAMPLE.md):

- attack cards
- defend cards
- player block
- enemy block
- intent reveal
- enemy attack and defend

Success condition:

- the basic three-round example can be reproduced deterministically

### Stage 2. Summoning And Board State

Build enough to reproduce the start of [PERMANENT_COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/PERMANENT_COMBAT_EXAMPLE.md):

- summon permanent
- board slots
- permanent state tracking
- one action per permanent

Success condition:

- a summoned permanent persists across rounds with tracked health and block

### Stage 3. Defensive Permanents

Add:

- defend action for permanents
- blocking queue
- permanent damage settlement
- death and graveyard transfer

Success condition:

- the Guardian-style defend flow from the permanent example works cleanly

### Stage 4. Offensive And Activated Permanents

Add:

- permanent attacks
- simple activated actions
- more card-defined ordered effects

Success condition:

- permanents can contribute in multiple modes without breaking turn clarity

## Suggested Module Layout

```text
src/cloud-arena/
  state.ts
  actions.ts
  engine.ts
  phases.ts
  resolution.ts
  enemy-behavior.ts
  legal-actions.ts
  events.ts
  adapters/
```

## Testing Priorities

The engine should be tested mostly through deterministic state transitions.

High-priority tests:

- draw and energy at turn start
- playing an attack card damages enemy block before health
- playing a defend card adds player block
- enemy defend adds enemy block
- enemy attack consumes player block before health
- summoning creates a permanent in an open slot
- permanent defend inserts into blocking queue
- enemy damage consumes defending permanent block before health
- permanent death moves it to graveyard
- round reset clears per-turn action flags

## Current Open Questions

These do not block the first engine, but should stay explicit:

- exact per-turn energy amount
- whether permanents can act on the same turn they are summoned
- exact blocking queue ordering once there are multiple defenders
- whether permanent block refreshes automatically or only when granted
- whether enemy defend resolves before or after attack for mixed actions by default, or only by explicit card script

For the first implementation, these should be hard-coded in the most conservative and easy-to-test way possible.

## Bottom Line

The first combat engine should be built to reproduce the current examples, not to solve the entire game.

If it can cleanly handle:

- attack
- defend
- play a permanent
- one permanent action
- enemy intent
- block and damage settlement
- permanent death

then it is already good enough to become the foundation for the simulator and later battle UI.
