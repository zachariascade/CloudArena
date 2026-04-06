# Lean V1 Combat Engine Checklist

## Purpose

This is the working checklist for finishing the Lean V1 combat engine in `src/cloud-arena/`.

It is intentionally more tactical than the broader planning docs. The goal is to show:

- what is already done
- what still needs to be implemented
- what should not be pulled into Lean V1

Primary references:

- [LEAN_V1_COMBAT_ENGINE_IMPLEMENTATION_PLAN.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/LEAN_V1_COMBAT_ENGINE_IMPLEMENTATION_PLAN.md)
- [COMBAT_ENGINE_IMPLEMENTATION_BRIEF.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/planning/COMBAT_ENGINE_IMPLEMENTATION_BRIEF.md)

## Current Status

### Done

- [x] Create shared engine folder in `src/cloud-arena/`
- [x] Add Lean V1 constants
- [x] Add core battle types
- [x] Add battle creation helper
- [x] Add fixed-sequence enemy intent model
- [x] Add legal action generation
- [x] Add `play_card`
- [x] Add `end_turn`
- [x] Add enemy turn resolution
- [x] Add round reset
- [x] Add permanent action handling
- [x] Add basic battle reducer entry point
- [x] Model cards as data-driven `instant` or `permanent`
- [x] Move permanent data onto the permanent card definition itself
- [x] Keep engine mechanic vocabulary small:
  - [x] `deal_damage`
  - [x] `gain_block`
  - [x] `summon_permanent`
  - [x] permanent `attack`
  - [x] permanent `defend`
- [x] Add deterministic basic combat scenario test
- [x] Add deterministic permanent combat scenario test

### Lean V1 Rules Locked In

- [x] One player only
- [x] One enemy only
- [x] Fixed-sequence enemy behavior only
- [x] Summoned permanents may act on the turn they are played
- [x] Player block resets each round
- [x] Enemy block resets each round
- [x] Permanent block resets each round
- [x] Guardian-style permanent defend grants block via the defend action amount

## Next Tasks

### High Priority

- [x] Add unit test: cannot play a card without enough energy
- [x] Add unit test: cannot use a permanent action twice in one round
- [x] Add unit test: cannot play a permanent when no board slot is open
- [x] Add unit test: illegal actions fail during the wrong phase
- [x] Add unit test: enemy damage spills from player block into defending permanent correctly
- [x] Add unit test: enemy damage spills from defending permanent into player health correctly when needed
- [x] Add unit test: battle ends when enemy health reaches `0`
- [x] Add unit test: battle ends when player health reaches `0`

### Medium Priority

- [x] Add a small script or helper that runs one deterministic battle and prints summary/log output
- [x] Improve battle log coverage so important state changes are always captured
- [x] Add one test that explicitly verifies a permanent card goes to battlefield, not discard
- [x] Add one test that verifies a dead permanent card goes to graveyard as the original card instance
- [x] Review whether `settle-damage.ts` should be simplified or split for clarity

### Nice To Have Before Simulator Work

- [x] Add a helper for building test battles more ergonomically
- [x] Add snapshot-style assertions for battle log output
- [x] Add a simple summary builder for:
  - [x] current turn
  - [x] player health
  - [x] enemy health
  - [x] battlefield state
  - [x] discard/graveyard counts

## Definition Of Done For Lean V1

Lean V1 is done when all of the following are true:

- [x] Basic non-permanent scenario test passes
- [x] Basic permanent scenario test passes
- [x] Illegal action edge cases are covered by tests
- [x] Slot overflow is covered by tests
- [x] Win/loss conditions are covered by tests
- [x] Damage spillover behavior is covered by tests
- [x] The engine can be used from a small local harness or script
- [ ] The supported mechanics remain intentionally narrow

## Lean V1 Guardrails

Do not add these yet:

- [ ] Multiple enemies
- [ ] Die-driven enemy behavior
- [ ] Mixed enemy intents
- [ ] Permanent `activate`
- [ ] Rich status systems
- [ ] Trigger engine
- [ ] Replay UI
- [ ] React battle screen
- [ ] AI agent integration
- [ ] Batch simulation loop

These are listed here as guardrails, not as near-term work.

## Suggested Working Order

1. Finish the missing edge-case tests.
2. Tighten any engine behavior the tests expose.
3. Add a tiny local battle runner or summary harness.
4. Re-evaluate whether Lean V1 is stable enough to support the trace-based simulator.

## Relevant Files

Engine:

- [constants.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/constants.ts)
- [types.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/types.ts)
- [definitions.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/definitions.ts)
- [create-battle.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/create-battle.ts)
- [legal-actions.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/legal-actions.ts)
- [play-card.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/play-card.ts)
- [use-permanent-action.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/use-permanent-action.ts)
- [settle-damage.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/settle-damage.ts)
- [enemy-turn.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/enemy-turn.ts)
- [end-turn.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/end-turn.ts)
- [reset-round.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/reset-round.ts)
- [engine.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/engine.ts)
- [index.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/src/cloud-arena/index.ts)

Tests:

- [combat-engine-basic.test.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/tests/cloud-arena/combat-engine-basic.test.ts)
- [combat-engine-permanent.test.ts](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/tests/cloud-arena/combat-engine-permanent.test.ts)
