import {
  dealDamageToEnemy,
  gainBlockToPermanent,
} from "../core/effects.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import { findPermanentById } from "../core/selectors.js";
import type { BattleState, PermanentActionMode } from "../core/types.js";

export function usePermanentAction(
  state: BattleState,
  permanentId: string,
  action: PermanentActionMode,
): BattleState {
  if (state.phase !== "player_action") {
    throw new Error("Permanent actions can only be used during the player_action phase.");
  }

  const permanent = findPermanentById(state, permanentId);

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
    const totalAttackAmount = getDerivedPermanentActionAmount(state, permanent, actionDefinition);
    dealDamageToEnemy(state, totalAttackAmount, "permanent_action", permanentId);
    permanent.isDefending = false;
  }

  if (action === "defend" && typeof actionDefinition.blockAmount === "number") {
    gainBlockToPermanent(state, permanent, actionDefinition.blockAmount);
    permanent.isDefending = true;
    if (!state.blockingQueue.includes(permanent.instanceId)) {
      state.blockingQueue.push(permanent.instanceId);
    }
  }

  permanent.hasActedThisTurn = true;

  return state;
}
