# Multi-Enemy Engine Todo

1. Define the multi-enemy rules model.
Decide turn order, whether all enemies act every enemy turn, how intents queue, and what `"enemy"` means for effects and targeting.
Status: done in `docs/multi-enemy-rules-model.md`

2. Introduce an `EnemyActorState` type.
Refactor `src/cloud-arena/core/types.ts` so battle state can hold multiple enemy actors instead of one singleton `EnemyState`.
Status: done in `src/cloud-arena/core/types.ts`, with initial creation wired through `src/cloud-arena/core/create-battle.ts`

3. Add scenario lineup as first-class battle input.
Make `createBattle()` accept the full scenario enemy lineup directly and keep each listed enemy as a distinct actor from battle creation onward.
Status: done in `src/cloud-arena/core/types.ts`, `src/cloud-arena/core/create-battle.ts`, and `src/cloud-arena/session-core.ts`

4. Create battlefield permanents for every enemy actor.
Give each enemy actor its own permanent link and instantiate all scenario enemies from preset stats and card definitions.
Status: done in `src/cloud-arena/core/permanents.ts` and `src/cloud-arena/core/create-battle.ts`

5. Keep one primary enemy for behavior, expose all enemies in state.
Phase 1 bridge:
Only the first enemy drives actual enemy-turn logic, but every enemy gets durable actor state, snapshot presence, and frontend identity.

6. Replace singleton snapshot fields with multi-enemy snapshots.
Update `src/cloud-arena/api-contract.ts` and `src/cloud-arena/session-core.ts` to expose enemy actors instead of a single top-level enemy summary.

7. Update frontend view models for multiple enemies.
Refactor `apps/cloud-arena-web/src/lib/cloud-arena-battle-view-model.ts` and related helpers so UI reads enemy actor data per battlefield enemy.

8. Render per-enemy telegraphs and inspector state from actor data.
Make overlays, intent labels, and sequence previews follow each enemy actor rather than relying on one global enemy card/intent.

9. Refactor enemy planning to be actor-scoped.
Update `src/cloud-arena/core/enemy-plan.ts` so each enemy actor advances its own card queue or behavior queue.

10. Refactor enemy-card effects to target a specific actor.
Update `src/cloud-arena/core/enemy-card-effects.ts` and `src/cloud-arena/combat/enemy-turn.ts` so block, power, scheduling, and spawned tokens belong to the acting enemy.

11. Refactor round reset for multiple enemies.
Update `src/cloud-arena/core/reset-round.ts` so every enemy actor primes its next card and updates its own intent state each round.

12. Refine targeting semantics for player cards and enemy effects.
Audit any effect using `"enemy"` to determine whether it should hit the primary actor, all enemy actors, or enemy battlefield permanents.

13. Remove the remaining single-leader assumptions.
Replace helpers like “primary enemy” and “leader permanent” where they are no longer the right abstraction.

14. Expand test coverage phase by phase.
Add tests for:
- battle creation with multiple real enemy actors
- snapshot/view-model serialization
- per-enemy overlays/intents
- multi-enemy turn resolution order
- actor-specific block/power/effect scheduling
- player targeting against multiple enemy actors

15. Cut over fully from single-enemy engine behavior.
When multi-enemy turns and effects are stable, remove the temporary “primary enemy only” bridge logic.
