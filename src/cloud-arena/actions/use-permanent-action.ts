import {
  dealDamageToEnemy,
  dealDamageToPermanent,
  gainBlockToPlayer,
  resolveEffects,
} from "../core/effects.js";
import {
  getCardDefinitionFromLibrary,
  hasCardType,
} from "../cards/definitions.js";
import {
  getAbilityActionAmount,
  getActivatedAbilities,
  getActivatedAbilityById,
  payAbilityCostBundle,
} from "../core/activated-abilities.js";
import { evaluateCondition } from "../core/conditions.js";
import { getDerivedPermanentActionAmount } from "../core/derived-stats.js";
import { findPermanentById, selectPermanents } from "../core/selectors.js";
import {
  destroyPermanent,
  permanentAttacksAllEnemyPermanents,
  permanentHasKeyword,
  permanentHasSummoningSickness,
} from "../core/permanents.js";
import { emitRulesEvent } from "../core/rules-events.js";
import { markSagaChapterActivated } from "../core/sagas.js";
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

  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);
  const isCreature = hasCardType(definition, "creature");
  const hasNativeCombatActions = isCreature || hasCardType(definition, "saga");
  const isSummoningSick = isCreature && permanentHasSummoningSickness(state, permanent);

  const abilityId =
    actionSource === "ability"
      ? action.abilityId ??
        getActivatedAbilities(permanent.abilities).find(
          (ability) => ability.activation.actionId === action.action,
        )?.id
      : undefined;

  if (actionSource === "ability") {
    if (isSummoningSick) {
      throw new Error(`Permanent ${action.permanentId} has summoning sickness and cannot use abilities this turn.`);
    }

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
      markSagaChapterActivated(permanent, ability.id);
    }
  } else if (action.action === "attack") {
    if (isSummoningSick) {
      throw new Error(`Permanent ${action.permanentId} has summoning sickness and cannot attack this turn.`);
    }

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
        let killedByDeathtouch = false;
        for (const target of state.enemyBattlefield) {
          if (!target) {
            continue;
          }

          const attackBypassesBlock = permanentHasKeyword(permanent, "pierce");
          const damageDealt = dealDamageToPermanent(
            state,
            target,
            attackAmount,
            "permanent_action",
            permanent.instanceId,
            permanent.instanceId,
            attackBypassesBlock,
          );
          if (damageDealt > 0 && permanentHasKeyword(target, "deathtouch") && !killedByDeathtouch) {
            destroyPermanent(state, permanent.instanceId);
            killedByDeathtouch = true;
          }
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
          attackBypassesBlock: permanentHasKeyword(permanent, "pierce"),
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
    if (!hasNativeCombatActions) {
      throw new Error(`Permanent ${action.permanentId} cannot use defend because it is not a creature or Saga.`);
    }

    permanent.isDefending = true;
    permanent.blockingTargetPermanentId = null;
    if (!state.blockingQueue.includes(permanent.instanceId)) {
      state.blockingQueue.push(permanent.instanceId);
    }

    const selector = createEnemyBattlefieldAttackSelector();
    const legalBlockTargets = selectPermanents(state, selector);

    if (legalBlockTargets.length === 1) {
      permanent.blockingTargetPermanentId = legalBlockTargets[0]?.instanceId ?? null;
    } else if (legalBlockTargets.length > 1) {
      state.pendingTargetRequest = {
        id: `target_${state.turnNumber}_${state.nextTargetRequestIndex}`,
        prompt: "Choose an enemy to block for",
        optional: false,
        targetKind: "permanent",
        selector,
        effects: [],
        nextEffectIndex: 0,
        context: {
          defendingPermanentId: permanent.instanceId,
        },
      };
      state.nextTargetRequestIndex += 1;
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

  state.log.push({
    type: "permanent_acted",
    turnNumber: state.turnNumber,
    permanentId: action.permanentId,
    source: actionSource,
    action: action.action,
    abilityId,
  });

  permanent.hasActedThisTurn = true;

  return state;
}
