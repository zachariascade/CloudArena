# Cloud Arena Engine Knobs Reference

This document lists the main Cloud Arena tuning knobs we currently have, what they do, and where to set them.

It is meant as a quick reference for battle setup, battlefield limits, card definition tuning, and combat-resolution behavior.

## Battle Setup Knobs

### `seed`

- What it does: controls deterministic shuffles and any other seeded battle behavior.
- Where to set it:
  - `src/cloud-arena/core/create-battle.ts`
  - `src/cloud-arena/api-contract.ts` via `CloudArenaCreateSessionRequest`
  - `apps/cloud-arena-web/src/routes/interactive-page.tsx` for the live UI entry point

### `shuffleDeck`

- What it does: decides whether the opening deck is shuffled before the starting hand is drawn.
- Values: `true` or `false`
- Where to set it:
  - `src/cloud-arena/core/types.ts` in `CreateBattleInput`
  - `src/cloud-arena/api-contract.ts` in `CloudArenaCreateSessionRequest`
  - `src/cloud-arena/core/create-battle.ts` consumes it
  - `apps/cloud-arena-web/src/routes/interactive-page.tsx` sets it for live sessions

### `playerHealth`

- What it does: sets the player's starting health for a battle.
- Where to set it:
  - `src/cloud-arena/core/types.ts` in `CreateBattleInput`
  - `src/cloud-arena/core/create-battle.ts`

### Enemy battle config

- What it does: chooses the enemy identity and how it acts.
- Fields:
  - `name`
  - `health`
  - `basePower`
  - `behavior` or `cards`
- Where to set it:
  - `src/cloud-arena/core/types.ts` in `CreateBattleInput["enemy"]`
  - `src/cloud-arena/core/create-battle.ts`
  - scenario presets under `src/cloud-arena/scenarios/`

## Battlefield / Core Rules Knobs

### `LEAN_V1_BOARD_SLOT_COUNT`

- What it does: sets the number of permanent slots on the battlefield.
- Where to set it:
  - `src/cloud-arena/core/constants.ts`
- Where it is used:
  - `src/cloud-arena/core/create-battle.ts` when initializing the battlefield
  - `src/cloud-arena/core/permanents.ts` when finding an open slot
  - `apps/cloud-arena-web/src/components/cloud-arena-battlefield-panel.tsx` and trace-viewer UI for display

### `LEAN_V1_HAND_SIZE`

- What it does: sets the maximum hand size at turn start.
- Where to set it:
  - `src/cloud-arena/core/constants.ts`

### `LEAN_V1_DEFAULT_TURN_ENERGY`

- What it does: sets the amount of energy restored at the start of a new round.
- Where to set it:
  - `src/cloud-arena/core/constants.ts`

## Permanent Definition Knobs

These are set on permanent card definitions and copied into live permanent state when the card is summoned.

### `power`

- What it does: sets the permanent's base attack power.
- Where to set it:
  - `src/cloud-arena/core/types.ts` in `PermanentCardDefinition`
  - individual permanent definitions in `src/cloud-arena/cards/definitions/*.ts`
  - copied into live state in `src/cloud-arena/core/permanents.ts`

### `health`

- What it does: sets the permanent's maximum health.
- Where to set it:
  - `src/cloud-arena/core/types.ts` in `PermanentCardDefinition`
  - individual permanent definitions in `src/cloud-arena/cards/definitions/*.ts`
  - copied into live state in `src/cloud-arena/core/permanents.ts`

### `recoveryPolicy`

- What it does: controls the engine's default healing behavior for permanents at the start of the next round.
- Current default: `full_heal`
- Where to set it:
  - `src/cloud-arena/core/constants.ts`
  - exported from `src/cloud-arena/index.ts` as `LEAN_V1_DEFAULT_RECOVERY_POLICY`
- Where it is applied:
  - `src/cloud-arena/core/permanents.ts` uses it when a card definition does not specify an override
  - `src/cloud-arena/core/reset-round.ts` checks it and restores health when it is `full_heal`

## Enemy Damage Knobs

These control how enemy attacks are resolved.

### `attackAmount`

- What it does: sets the base damage of an enemy attack.
- Where to set it:
  - `src/cloud-arena/core/types.ts` in `EnemyCardDefinition` and `EnemyIntent`
  - enemy card factories such as `src/cloud-arena/scenarios/enemy-cards/strike.ts` and `src/cloud-arena/scenarios/enemy-cards/assault.ts`
  - direct enemy behavior steps in scenario definitions

### `attackTimes`

- What it does: repeats the enemy attack multiple times.
- Where to set it:
  - `src/cloud-arena/core/types.ts`
  - enemy card factories under `src/cloud-arena/scenarios/enemy-cards/`

### `blockAmount`

- What it does: gives the enemy block during its intent.
- Where to set it:
  - `src/cloud-arena/core/types.ts`
  - enemy card factories under `src/cloud-arena/scenarios/enemy-cards/`

### `overflowPolicy`

- What it does: decides whether enemy attack damage can pass through defenders after a permanent blocks.
- Current values:
  - `stop_at_blocker`
  - `trample`
- Where to set it:
  - `src/cloud-arena/core/types.ts` in `EnemyCardDefinition` and `EnemyIntent`
  - enemy card factories such as `src/cloud-arena/scenarios/enemy-cards/strike.ts` and `src/cloud-arena/scenarios/enemy-cards/assault.ts`
  - direct enemy behavior steps if you build intents manually
- Where it is applied:
  - `src/cloud-arena/core/enemy-plan.ts` carries it onto the generated enemy intent
  - `src/cloud-arena/combat/settle-damage.ts` reads it when enemy damage hits defenders

## State Flags That Are Not Knobs

These are runtime state, not configuration:

- `hasActedThisTurn`
- `isDefending`
- `block`
- `health`
- `slotIndex`

They are important to the engine, but they are set by combat flow rather than by battle setup.

## Good Places To Start

If you want to add or tune a behavior, the usual order is:

1. define or extend the type in `src/cloud-arena/core/types.ts`
2. set the value in the relevant card definition, enemy scenario, or battle input
3. make sure the engine consumes it in the core rule path
4. add or update a test under `tests/cloud-arena/`
