import {
  dealDamageToEnemy,
  dealDamageToPermanent,
  gainBlockToPlayer,
  resolveEffects,
} from "../core/effects.js";
import {
  getAbilityActionAmount,
  getActivatedAbilities,
  getActivatedAbilityById,
  payAbilityCostBundle,
} from "../core/activated-abilities.js";
import { evaluateCondition } from "../core/conditions.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import { findPermanentById } from "../core/selectors.js";
import { permanentAttacksAllEnemyPermanents } from "../core/permanents.js";
import { emitRulesEvent } from "../core/rules-events.js";
import type {
  ActivatedAbility,
  BattleState,
  Selector,
  UsePermanentAction,
} from "../core/types.js";

function createEnemyBattlefieldAttackSelector(): Selector {
  return {
    zone: "enemy_battlefield",
    controller: "opponent",
    cardType: "permanent",
  };
}

function abilityRequiresTargetSelection(ability: ActivatedAbility): boolean {
  return ability.targeting !== undefined || ability.effects.some((effect) => "targeting" in effect && effect.targeting !== undefined);
}

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

  const actionSource = action.source ?? (action.action === "attack" || action.action === "defend" ? "rules" : "ability");
  if (permanent.hasActedThisTurn) {
    throw new Error(`Permanent ${action.permanentId} has already acted this turn.`);
  }

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

    if (
      !(ability.conditions ?? []).every((condition) =>
        evaluateCondition(state, condition, {
          abilitySourcePermanentId: permanent.instanceId,
          sourceCardInstanceId: permanent.sourceCardInstanceId,
        }),
      )
    ) {
      throw new Error(`Permanent ${action.permanentId} cannot use ability ${abilityId} right now.`);
    }

    if (action.action === "apply_block") {
      if (ability.costs && !abilityRequiresTargetSelection(ability)) {
        payAbilityCostBundle(state, permanent, ability.costs);
      }
      const blockAmount = getAbilityActionAmount(state, permanent, ability) ?? 0;
      gainBlockToPlayer(state, blockAmount);
    } else {
      if (!abilityRequiresTargetSelection(ability)) {
        payAbilityCostBundle(state, permanent, ability.costs ?? []);
      }

      resolveEffects(state, ability.effects, {
        abilitySourcePermanentId: permanent.instanceId,
        sourceCardInstanceId: permanent.sourceCardInstanceId,
        abilityTargeting: ability.targeting,
        abilityCosts: ability.costs,
      });
    }
  } else if (action.action === "attack") {
    const attackAmount = getDerivedPermanentActionAmount(state, permanent, "attack");
    const attackAllEnemyPermanents = permanentAttacksAllEnemyPermanents(state, permanent);

    emitRulesEvent(state, {
      type: "permanent_attacked",
      turnNumber: state.turnNumber,
      permanentId: permanent.instanceId,
      sourceCardInstanceId: permanent.sourceCardInstanceId,
      definitionId: permanent.definitionId,
      controllerId: permanent.controllerId ?? "player",
      slotIndex: permanent.slotIndex,
    });

    if (state.enemyBattlefield.some((slot) => slot !== null)) {
      if (attackAllEnemyPermanents) {
        for (const target of state.enemyBattlefield) {
          if (!target) {
            continue;
          }

          dealDamageToPermanent(state, target, attackAmount, "permanent_action", permanent.instanceId);
        }

        permanent.isDefending = false;
        permanent.hasActedThisTurn = true;
        return state;
      }

      const selector = createEnemyBattlefieldAttackSelector();
      state.pendingTargetRequest = {
        id: `target_${state.turnNumber}_${state.nextTargetRequestIndex}`,
        prompt: "Choose an enemy to attack",
        optional: false,
        targetKind: "permanent",
        selector,
        effects: [
          {
            type: "deal_damage",
            target: selector,
            amount: { type: "constant", value: attackAmount },
          },
        ],
        nextEffectIndex: 0,
        context: {
          abilitySourcePermanentId: permanent.instanceId,
          sourceCardInstanceId: permanent.sourceCardInstanceId,
        },
      };
      state.nextTargetRequestIndex += 1;
      permanent.isDefending = false;
      permanent.hasActedThisTurn = true;
      return state;
    }

    dealDamageToEnemy(state, attackAmount, "permanent_action", permanent.instanceId);
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
