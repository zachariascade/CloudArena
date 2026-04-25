# Multi-Enemy Rules Model

This document defines the gameplay rules for a future multi-enemy engine in Cloud Arena.
It is intended to answer Item 1 from `docs/multi-enemy-engine-todo.md` before the data model
and turn engine are refactored.

## Goals

- Treat every scenario enemy preset as a real enemy actor.
- Let multiple enemies drive turn-by-turn enemy card behavior.
- Preserve the current feel of the single-enemy system where possible.
- Keep player targeting rules readable and consistent in the UI.

## Terms

- `Enemy actor`: a scenario enemy with its own stats, card plan, intent, and battlefield permanent.
- `Enemy permanent`: the battlefield creature that visually represents an enemy actor.
- `Primary enemy`: the first enemy listed in a scenario. This term should only be used where a
  temporary bridge is needed; it is not the long-term gameplay abstraction.
- `Enemy lineup order`: the order of `scenario.enemies` in the scenario definition.

## Core Model

1. Every entry in `scenario.enemies` is a full enemy actor.
2. Every enemy actor has:
   - `definitionId`
   - `name`
   - `health`
   - `maxHealth`
   - `block`
   - `basePower`
   - `cards` or `behavior`
   - `behaviorIndex`
   - `currentCard`
   - `currentCardId`
   - `intent`
   - `intentQueueLabels`
   - `permanentId`
3. Every enemy actor is represented on the enemy battlefield by one permanent.
4. Damage to an enemy actor and damage to its linked permanent are the same thing.
5. If an enemy actor dies, its battlefield permanent is removed and its future intent/card
   resolution stops immediately.

## Turn Structure

Enemy turns remain one shared phase, but all living enemy actors participate.

### Round Start

At the start of a new player round:

1. Player state resets as it does today.
2. All enemy battlefield permanents refresh as they do today.
3. Temporary counters and scheduled effects resolve as they do today.
4. Each living enemy actor advances its own plan by one step.
5. Each living enemy actor primes its own current card.
6. Each living enemy actor updates its own visible intent and queue.

### Enemy Resolution

During the enemy phase:

1. Enemy actors resolve in scenario lineup order, skipping dead actors.
2. Each enemy actor resolves its enemy card or fallback intent in full before the next actor starts.
3. After all actor cards/intents resolve, enemy battlefield creatures that still have rule-based
   attacks may act according to their own rules.

This means the default enemy action order is:

1. Enemy actor 1 resolves
2. Enemy actor 2 resolves
3. Enemy actor 3 resolves
4. Remaining rule-based enemy creature attacks resolve if still eligible

## Intent Rules

1. Every enemy actor has its own `intent`.
2. Every enemy actor has its own `intentQueueLabels`.
3. The UI should show per-enemy intent on that enemy’s battlefield card.
4. The top-level battle summary can still expose a compact enemy summary, but it should be derived
   from the living enemy actors rather than a singleton enemy object.

## Enemy Card Resolution Rules

1. Enemy cards belong to one actor and only mutate that actor unless an effect explicitly says
   otherwise.
2. Actor-local effects:
   - gain block
   - gain power
   - health-based block
   - immediate card state
   - scheduled next-turn actor effects
3. Global or cross-battlefield effects:
   - deal damage to player
   - spawn tokens
   - reduce all permanents power
   - reduce player permanents power
   - grant or remove player energy
4. Scheduled effects must remember which enemy actor created them.

## Stun Rules

1. Stun applies to one enemy actor, not all enemies.
2. A stunned actor skips its own card/intent resolution for that enemy phase.
3. A stunned actor still advances to its next plan step at the next round reset unless a card or
   rule later changes that behavior.
4. Other enemy actors resolve normally while one actor is stunned.

## Targeting Semantics

The current `"enemy"` abstraction is too broad for a multi-enemy engine, so these rules define the
desired meaning going forward.

### Player Cards

1. Effects that currently mean “damage the shared enemy” should become “choose an enemy actor”
   unless they are intentionally global.
2. If a player card is meant to hit a creature on the battlefield, it should target
   `enemy_battlefield`, not the abstract enemy actor.
3. If a player card is meant to hit the scenario’s boss specifically, that should become an
   explicit selector or rule, not an implicit `"enemy"` default.

### Enemy Cards

1. `target: "enemy"` on an enemy card means “the acting enemy actor”.
2. `target: "player"` still means the player.
3. Effects that touch all permanents or player permanents remain explicit and global.

## Death And Victory Rules

1. An enemy actor dies when its linked battlefield permanent dies.
2. A scenario is won when no living enemy actors remain.
3. If the current acting enemy dies during its own resolution, any unresolved remaining effects
   from that card stop unless the effect has already been placed into an explicit scheduled queue.
4. Dead enemy actors are removed from future intent queues, overlay rendering, and turn order.

## UI Rules

1. Each enemy battlefield creature should show its own:
   - current health
   - block
   - intent
   - telegraphed current card
   - sequence preview
2. Overlay cards should be driven by actor state, not by a single global enemy summary.
3. Inspector panels should open against the selected enemy actor/permanent and show that actor’s
   queue and current card.

## Bridge Plan

These rules are the long-term target, but implementation can land in phases:

### Phase 1

- Introduce multiple enemy actors in state.
- Instantiate all scenario enemies as real actors and permanents.
- Keep only the first actor driving enemy-turn card logic.
- Expose per-enemy actor snapshots and telegraphs in the UI.

### Phase 2

- Let every living enemy actor advance and expose its own plan.
- Render per-enemy intents and overlay cards everywhere.

### Phase 3

- Resolve every living enemy actor during the enemy phase.
- Remove remaining single-enemy assumptions.
- Replace ambiguous `"enemy"` targeting with actor-aware rules.

## Non-Goals For Item 1

This document does not yet specify:

- exact save-file migration behavior
- exact API field names for the final snapshot shape
- animation choreography for multiple simultaneous enemy actions
- whether future scenarios may support per-actor custom turn priorities

Those are follow-up implementation details once the engine model is in place.
