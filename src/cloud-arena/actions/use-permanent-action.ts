import type { BattleState, PermanentActionMode } from "../core/types.js";

function findPermanentIndex(state: BattleState, permanentId: string): number {
  return state.battlefield.findIndex((permanent) => permanent?.instanceId === permanentId);
}

export function usePermanentAction(
  state: BattleState,
  permanentId: string,
  action: PermanentActionMode,
): BattleState {
  if (state.phase !== "player_action") {
    throw new Error("Permanent actions can only be used during the player_action phase.");
  }

  const permanentIndex = findPermanentIndex(state, permanentId);

  if (permanentIndex === -1) {
    throw new Error(`Permanent ${permanentId} was not found on the battlefield.`);
  }

  const permanent = state.battlefield[permanentIndex];

  if (!permanent) {
    throw new Error(`Permanent ${permanentId} was not found on the battlefield.`);
  }

  if (permanent.hasActedThisTurn) {
    throw new Error(`Permanent ${permanentId} has already acted this turn.`);
  }

  const actionDefinition = permanent.actions.find((entry) =>
    action === "attack"
      ? typeof entry.attackAmount === "number" && entry.attackAmount > 0
      : typeof entry.blockAmount === "number" && entry.blockAmount > 0,
  );

  if (!actionDefinition) {
    throw new Error(`Permanent ${permanentId} cannot use action ${action}.`);
  }

  state.log.push({
    type: "permanent_acted",
    turnNumber: state.turnNumber,
    permanentId,
    action,
  });

  if (action === "attack" && typeof actionDefinition.attackAmount === "number") {
    const totalAttackAmount = actionDefinition.attackAmount * Math.max(1, actionDefinition.attackTimes ?? 1);
    const damageDealt = Math.max(
      0,
      Math.min(totalAttackAmount, state.enemy.block + state.enemy.health),
    );
    if (state.enemy.block >= totalAttackAmount) {
      state.enemy.block -= totalAttackAmount;
    } else {
      const remainingDamage = totalAttackAmount - state.enemy.block;
      state.enemy.block = 0;
      state.enemy.health -= remainingDamage;
    }
    if (damageDealt > 0) {
      state.log.push({
        type: "damage_dealt",
        turnNumber: state.turnNumber,
        source: "permanent_action",
        sourceId: permanentId,
        target: "enemy",
        amount: damageDealt,
      });
    }
    permanent.isDefending = false;
  }

  if (action === "defend" && typeof actionDefinition.blockAmount === "number") {
    permanent.block += actionDefinition.blockAmount;
    state.log.push({
      type: "block_gained",
      turnNumber: state.turnNumber,
      target: "permanent",
      targetId: permanentId,
      amount: actionDefinition.blockAmount,
    });
    permanent.isDefending = true;
    if (!state.blockingQueue.includes(permanent.instanceId)) {
      state.blockingQueue.push(permanent.instanceId);
    }
  }

  permanent.hasActedThisTurn = true;

  return state;
}
