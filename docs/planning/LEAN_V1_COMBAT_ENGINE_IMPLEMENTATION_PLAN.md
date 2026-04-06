# Lean V1 Combat Engine Implementation Plan

## Purpose

This document turns the Lean V1 combat engine brief into a concrete implementation plan.

The goal is to build the smallest deterministic combat engine that can reproduce the current combat examples in code without over-generalizing too early.

Primary references:

- [COMBAT_ENGINE_IMPLEMENTATION_BRIEF.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/COMBAT_ENGINE_IMPLEMENTATION_BRIEF.md)
- [CORE_COMBAT_SPEC.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/CORE_COMBAT_SPEC.md)
- [COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/COMBAT_EXAMPLE.md)
- [PERMANENT_COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/PERMANENT_COMBAT_EXAMPLE.md)

## Lean V1 Goal

Lean V1 should prove only these things:

- the turn loop works
- immediate card resolution works
- enemy intent matters
- block settlement works
- summoning a permanent works
- a permanent can defend
- permanent damage persists
- a permanent can die and move to the graveyard

If those are true, Lean V1 is successful.

## Scope

### Included

- one player
- one enemy
- fixed-sequence enemy behavior
- `attack` enemy intent
- `defend` enemy intent
- `Attack` card effect
- `Defend` card effect
- `Guardian`
- one permanent with `attack` and `defend`
- player block
- enemy block
- one blocking queue
- deterministic tests

### Excluded

- die-driven enemy behavior
- multiple enemies
- mixed enemy intents
- permanent `activate`
- broad card effect support
- replay UI
- AI integration
- batch simulation
- content-driven card parsing

## Implementation Principles

- optimize for explicitness over extensibility
- prefer a few simple files over a deeply abstracted engine
- hard-code the small supported rules slice
- write deterministic tests before broadening scope
- use the example docs as acceptance fixtures

## Suggested File Layout

```text
src/cloud-arena/
  types.ts
  constants.ts
  create-battle.ts
  legal-actions.ts
  play-card.ts
  use-permanent-action.ts
  enemy-turn.ts
  settle-damage.ts
  end-turn.ts
  reset-round.ts
  engine.ts
tests/
  cloud-arena/
    combat-engine-basic.test.ts
    combat-engine-permanent.test.ts
```

This layout is intentionally direct. If the engine grows later, these files can be reorganized.

## Data Decisions For Lean V1

Lean V1 should hard-code or strongly constrain these values:

- hand size: `5`
- player starting health: `100`
- default turn energy: `3`
- board slots: `3`
- one enemy only
- one defender in blocking queue in normal test scenarios

The first implementation does not need these to be configurable.

## Proposed Types

### Core Types

The first pass should define:

- `BattleState`
- `BattlePhase`
- `BattleAction`
- `BattleEvent`
- `PlayerState`
- `EnemyState`
- `PermanentState`
- `CardDefinition`
- `CardInstance`

### BattlePhase

Lean V1 phases should be:

- `player_action`
- `enemy_resolution`
- `finished`

Even if the spec mentions more conceptual steps, the engine can collapse them into fewer executable phases for now.

### BattleAction

Lean V1 actions should be:

- `play_card`
- `use_permanent_action`
- `end_turn`

### CardDefinition

Lean V1 should not parse card text.

Instead, it should use a tiny hand-authored card definition layer for:

- `Attack`
- `Defend`
- `Guardian`

## Phase-by-Phase Plan

### Phase 1. State And Initialization

Build:

- core combat types
- battle creation helper
- initial player state
- initial enemy state
- fixed-sequence enemy behavior state
- deterministic deck order support

Implementation notes:

- use a direct in-memory state object
- allow tests to seed the exact opening deck order
- allow enemy behavior to be defined as a simple ordered array of intents

Definition of done:

- a battle can be created with player health, enemy health, draw pile, and initial intent

### Phase 2. Basic Turn Flow

Build:

- draw to hand at turn start
- refill player energy at turn start
- reveal current enemy intent
- legal action generation for hand cards
- `end_turn`

Implementation notes:

- keep turn start automatic inside battle creation or round reset helpers
- legal actions only need to consider energy and current phase

Definition of done:

- the player can begin a turn with a populated hand, energy, and visible enemy intent

### Phase 3. Basic Cards

Build:

- `Attack` card resolution
- `Defend` card resolution
- discard handling after play
- enemy block settlement
- player block gain

Implementation notes:

- `Attack` should always target the single enemy
- `Defend` should always affect the player
- effects should be encoded directly, not through a generic effect interpreter

Definition of done:

- the engine can reproduce the non-permanent combat example's main behaviors

### Phase 4. Enemy Turn Resolution

Build:

- enemy `attack` intent resolution
- enemy `defend` intent resolution
- damage settlement order:
  - player block
  - defending permanents
  - player health
- block reduction behavior
- victory and loss checks

Implementation notes:

- enemy intents should resolve exactly as their fixed script says
- block should be consumed before health everywhere

Definition of done:

- a complete round can be played from player turn to enemy turn and back

### Phase 5. Playing Permanent Cards

Build:

- battlefield state with fixed slot count
- `Guardian` as a permanent card
- permanent state insertion into an open slot
- permanent per-turn action flag

Implementation notes:

- fail the action if no open slot exists
- do not add summon sickness unless it becomes necessary

Definition of done:

- a Guardian can enter play and persist into the next round

### Phase 6. Permanent Defend Flow

Build:

- permanent action: `defend`
- blocking queue
- `isDefending` flag
- damage settlement onto permanent block, then permanent health
- permanent death and graveyard transfer

Implementation notes:

- Lean V1 only needs one defender to work cleanly
- queue structure can still be an array to avoid repainting the data model later

Definition of done:

- the Guardian defend example can be reproduced deterministically

### Phase 7. Permanent Attack Flow

Build:

- permanent action: `attack`
- immediate permanent attack damage to enemy
- one action per permanent per round enforcement

Implementation notes:

- this is useful even if the main acceptance target is the defend flow
- it completes the minimum Guardian behavior surface

Definition of done:

- a permanent can attack on the player turn and cannot also defend in the same round

### Phase 8. Round Reset

Build:

- clear temporary player block if it should not persist
- clear enemy block if it should not persist
- clear `hasActedThisTurn`
- clear `isDefending`
- advance enemy intent pointer
- start next turn draw and energy refill

Implementation notes:

- if permanent block should persist only when tracked on the permanent, keep that rule explicit in tests

Definition of done:

- a second and third round behave predictably without manual cleanup logic in tests

## Testing Plan

### Test Layer 1. Small Unit Tests

Add focused tests for:

- damage consumes block before health
- card play spends energy
- played cards move to discard
- summon fails if no board slot exists
- permanent death moves to graveyard
- permanents cannot act twice in one round

### Test Layer 2. Scenario Tests

Add deterministic scenario tests that mirror the docs:

- basic attack/defend combat from [COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/COMBAT_EXAMPLE.md)
- Guardian defending against enemy attack from [PERMANENT_COMBAT_EXAMPLE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/PERMANENT_COMBAT_EXAMPLE.md)

These are the most important tests because they prove the engine matches the intended gameplay examples.

## Build Order Recommendation

Build in this order:

1. Types and battle creation
2. Turn start draw and energy
3. `Attack` and `Defend`
4. Enemy attack and defend
5. Scenario test for non-permanent combat
6. Battlefield and `Guardian`
7. Permanent defend and damage settlement
8. Scenario test for Guardian combat
9. Permanent attack
10. Round reset cleanup

This order keeps the engine playable almost the whole way through implementation.

## Known Simplifications

These are intentional Lean V1 shortcuts:

- card support is hand-authored rather than content-driven
- there is only one valid enemy target
- there is only one player
- there is only one enemy behavior style
- no advanced effect stack exists
- no trigger engine exists beyond explicit built-in rules

These are not flaws for Lean V1. They are the point.

## Risks

### Over-Abstraction

Risk:

- building a flexible engine before proving the narrow loop

Mitigation:

- hard-code the tiny card set
- keep effect handling direct

### Ambiguous Rules

Risk:

- unresolved details creating churn in code structure

Mitigation:

- default to the simplest behavior that reproduces the examples
- write that behavior into tests

### Premature Integration

Risk:

- trying to connect UI, AI agents, or simulator batching too early

Mitigation:

- keep Lean V1 as a local deterministic engine plus tests only

## Acceptance Checklist

Lean V1 is done when:

- a battle can be initialized deterministically
- the player draws `5` and gains `3` energy at turn start
- `Attack` damages enemy block before enemy health
- `Defend` adds player block
- enemy `attack` damages player block before player health
- enemy `defend` adds enemy block
- `Guardian` places a permanent into an open slot
- Guardian `defend` places it into the blocking queue
- enemy damage hits Guardian block before Guardian health
- Guardian can die and move to graveyard
- scenario tests reproducing both example docs pass

## Recommended Next Step After Lean V1

After Lean V1 passes its scenario tests, the next step should be to choose one direction:

- extend the engine toward the trace-based simulator, or
- extend the engine toward a simple battle viewer

That choice should happen only after the Lean V1 core is proven stable.
