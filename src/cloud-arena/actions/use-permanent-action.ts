import {
  dealDamageToEnemy,
  gainBlockToPlayer,
  resolveEffects,
} from "../core/effects.js";
import { getAbilityActionAmount, getActivatedAbilities, getActivatedAbilityById } from "../core/activated-abilities.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import { findPermanentById } from "../core/selectors.js";
import { emitRulesEvent } from "../core/rules-events.js";
import type { BattleState, UsePermanentAction } from "../core/types.js";

export function usePermanentAction(
  state: BattleState,
  action: UsePermanentAction,
): BattleState {
  if (state.phase !== "player_action") {
    throw new Error("Permanent actions can only be used during the player_action phase.");
  }

  const permanent = findPermanentById(state, action.permanentId);

  if (!permanent) {
    throw new Error(`Permanent ${action.permanentId} was not found on the battlefield.`);
  }

  if (permanent.hasActedThisTurn) {
    throw new Error(`Permanent ${action.permanentId} has already acted this turn.`);
  }

  const actionSource = action.source ?? (action.action === "attack" || action.action === "defend" ? "rules" : "ability");
  const abilityId =
    actionSource === "ability"
      ? action.abilityId ??
        getActivatedAbilities(permanent.abilities).find(
          (ability) => ability.activation.actionId === action.action,
        )?.id
      : undefined;

  state.log.push({
    type: "permanent_acted",
    turnNumber: state.turnNumber,
    permanentId: action.permanentId,
    source: actionSource,
    action: action.action,
    abilityId,
  });

  if (actionSource === "ability") {
    if (!abilityId) {
      throw new Error(`Permanent ${action.permanentId} cannot use action ${action.action}.`);
    }

    const ability = getActivatedAbilityById(permanent.abilities, abilityId);

    if (!ability) {
      throw new Error(`Permanent ${action.permanentId} cannot use ability ${abilityId}.`);
    }

    if (action.action === "apply_block") {
      const blockAmount = getAbilityActionAmount(state, permanent, ability) ?? 0;
      gainBlockToPlayer(state, blockAmount);
    } else {
      resolveEffects(state, ability.effects, {
        abilitySourcePermanentId: permanent.instanceId,
        sourceCardInstanceId: permanent.sourceCardInstanceId,
        abilityTargeting: ability.targeting,
      });
    }
    permanent.isDefending = false;
  } else if (action.action === "attack") {
    const attackAmount = getDerivedPermanentActionAmount(state, permanent, "attack");
    dealDamageToEnemy(state, attackAmount, "permanent_action", permanent.instanceId);
    emitRulesEvent(state, {
      type: "permanent_attacked",
      turnNumber: state.turnNumber,
      permanentId: permanent.instanceId,
      sourceCardInstanceId: permanent.sourceCardInstanceId,
      definitionId: permanent.definitionId,
      controllerId: permanent.controllerId ?? "player",
      slotIndex: permanent.slotIndex,
    });
    permanent.isDefending = false;
  } else if (action.action === "defend") {
    permanent.isDefending = true;
    if (!state.blockingQueue.includes(permanent.instanceId)) {
      state.blockingQueue.push(permanent.instanceId);
    }
    emitRulesEvent(state, {
      type: "permanent_blocked",
      turnNumber: state.turnNumber,
      permanentId: permanent.instanceId,
      sourceCardInstanceId: permanent.sourceCardInstanceId,
      definitionId: permanent.definitionId,
      controllerId: permanent.controllerId ?? "player",
      slotIndex: permanent.slotIndex,
    });
  }

  permanent.hasActedThisTurn = true;

  return state;
}
