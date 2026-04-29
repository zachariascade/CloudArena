# Plan: Remove the Enemy Leader Concept

## What `state.enemy` actually is

Short answer: **`state.enemy` is a vestigial duplicate of `state.enemies[0]`.** It's the original single-enemy state object from before multi-enemy support existed. When the engine grew an `enemies[]` array, instead of removing `state.enemy`, it was kept as "the primary enemy" and a leader permanent was added to bridge it to the battlefield.

Concretely, compare the two types in [src/cloud-arena/core/types.ts:690–730](src/cloud-arena/core/types.ts):

| Field | `EnemyActorState` (in `state.enemies[]`) | `EnemyState` (`state.enemy`) |
|---|---|---|
| name, health, maxHealth, block, basePower | ✓ | ✓ |
| intent, intentQueueLabels, behavior, cards | ✓ | ✓ |
| behaviorIndex, currentCardId, currentCard | ✓ | ✓ |
| stunnedThisTurn | ✓ | ✓ |
| permanent link | `permanentId` | `leaderPermanentId` |
| definition link | (via actor) | `leaderDefinitionId` |

The fields are essentially identical. `state.enemy` ≈ `state.enemies[0]` with leader-flavored names. The "leader permanent" is just `state.enemies[0]`'s permanent, flagged with `isEnemyLeader: true` so the engine knows which battlefield permanent to bidirectionally sync with `state.enemy`.

So when we say "remove the leader concept," what we're really removing is **the special status of `state.enemies[0]` and the duplicate state object that mirrors it.** The leader permanent is not a separate entity — it's enemy #0's permanent wearing a flag.

### Why this matters for the plan

This means option (a) from Phase 1 — delete `state.enemy` entirely — is not as scary as it sounded. We aren't deleting a unique data structure; we're deleting a redundant one. Every read of `state.enemy.X` becomes a read of `state.enemies[i].X` (where `i` is the targeted enemy) or a read of the relevant permanent. There is no information in `state.enemy` that isn't already in `state.enemies[0]` + its permanent.

The bidirectional sync functions (`syncEnemyStateFromLeaderPermanent`, `syncEnemyLeaderPermanentFromState`) exist *only* to keep these two redundant copies in agreement. Once `state.enemy` is gone, both functions can be deleted outright with no replacement.

## Phase 1 — Decisions (agreed)

1. **Damage targeting:** `dealDamageToEnemy()` will take an explicit `targetPermanentId`. No implicit-leader fallback.
2. **`state.enemy`:** Delete entirely. The engine reads from `state.enemies[]` and their permanents. No derived view.
3. **Block reset:** All enemies reset block between rounds, uniformly. No persistence carve-out.

## Phase 2 — Engine changes

In rough dependency order:

1. **[src/cloud-arena/core/types.ts](src/cloud-arena/core/types.ts)**: delete `EnemyState` entirely. Remove `state.enemy` from the root state type. Drop `isEnemyLeader` from `PermanentState`. Drop `leaderDefinitionId` from `CreateBattleEnemyInput` (callers pass `definitionId`).
2. **[create-battle.ts:86–223](src/cloud-arena/core/create-battle.ts)**: stop initializing `state.enemy` and leader fields. Create every enemy's permanent the same way — no `isEnemyLeader: true` branch.
3. **[permanents.ts:578–673](src/cloud-arena/core/permanents.ts)**: delete `getEnemyLeaderPermanent`, `syncEnemyStateFromLeaderPermanent`, `syncEnemyLeaderPermanentFromState`. Each enemy actor's permanent is its single source of truth for health/block/power/intent.
4. **[effects.ts:177–241](src/cloud-arena/core/effects.ts)**: rewrite `dealDamageToEnemy` to take an explicit target permanent. Remove all the post-damage sync calls (lines 268, 311, 794, 877) — no sync needed when the permanent *is* the state.
5. **[reset-round.ts:51–145](src/cloud-arena/core/reset-round.ts)**: collapse the two code paths (primary vs. secondary) into one loop over `state.enemies`. Each enemy advances its own behavior index, resets its own block, syncs intent from its own permanent.
6. **[combat/enemy-turn.ts:83, 213](src/cloud-arena/combat/enemy-turn.ts)**: remove the `isEnemyLeader` skip in creature resolution; treat every enemy the same. Drop the leader sync after primary card resolution.
7. **[enemy-card-effects.ts:71, 86–87](src/cloud-arena/core/enemy-card-effects.ts)**: replace `state.enemy.leaderPermanentId` / `leaderDefinitionId` fallbacks with the actor's own `permanentId` / `definitionId`.

## Phase 3 — Surfaces (API, UI, AI)

8. **[api-contract.ts:138, 223](src/cloud-arena/api-contract.ts)**: drop `isEnemyLeader` and `leaderDefinitionId`. Remove the top-level `enemy` field from `CloudArenaSessionSnapshot`; clients read `enemies[]` only. Breaking change for any consumer.
9. **[apps/cloud-arena-web/src/components/cloud-arena-battle-state.tsx:64, 166, 176](apps/cloud-arena-web/src/components/cloud-arena-battle-state.tsx)** and other web components: stop reading `isEnemyLeader`. Render all enemies symmetrically. UI may need a "current target" concept distinct from "leader" if the player picks who to attack.
10. **[ai/heuristic-agent.ts:42](src/cloud-arena/ai/heuristic-agent.ts)**: replace the leader-comparison with the new targeting model (e.g., compare against the chosen attack target).

## Phase 4 — Tests and data

11. Tests under `tests/cloud-arena/` and `tests/display-card.test.ts` that use `.find(e => e?.isEnemyLeader)` switch to indexing or named lookup. The `multi-enemy-actors.test.ts:100` assertion on `leaderPermanentId` is deleted or rewritten to assert per-enemy permanents exist.
12. Any saved battle fixtures / JSON snapshots referencing `leaderDefinitionId` or `isEnemyLeader` need regeneration.

## Risks & open questions

- **Block-persistence:** today the leader's block carries between rounds. Worth grepping encounter configs for anything that relied on it before flipping to uniform reset.
- **Targeting UX:** today the player attacks "the enemy" implicitly. With N enemies, the UI needs a target picker — design work, not just refactor.
- **Save/replay compatibility:** persisted battle states with the old shape need a migration or invalidation.

## Suggested sequencing

Two PRs to keep diffs reviewable:
- **PR A** — engine + types + tests (Phases 1–2 + 4). `state.enemy` removed; engine reads from `state.enemies[]` only.
- **PR B** — API/UI/AI cutover (Phase 3 + finishing 4). Snapshot drops top-level `enemy`; UI renders all enemies symmetrically.

Single-PR is possible on a long-lived branch but expect wide blast radius across tests.
