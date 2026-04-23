import { hasCardType, getCardDefinitionFromLibrary } from "../cards/definitions.js";
import {
  abilityCostsTap,
  getActivatedAbilities,
  getAbilityEnergyCost,
} from "../core/activated-abilities.js";
import { evaluateCondition } from "../core/conditions.js";
import {
  hasOpenBattlefieldSlotForCardDefinition,
  selectObjects,
  selectPermanents,
} from "../core/selectors.js";
import type { BattleAction, BattleState, Effect, Selector } from "../core/types.js";
import type { SelectedObject } from "../core/selectors.js";

function getEffectTargetSelector(effect: Effect): Selector | null {
  switch (effect.type) {
    case "sacrifice":
      return effect.selector;
    case "add_counter":
    case "remove_counter":
    case "deal_damage":
    case "gain_block":
    case "draw_card":
    case "attach_from_battlefield":
      return typeof effect.target === "string" ? null : effect.target;
    case "summon_permanent":
    case "attach_from_hand":
      return null;
  }

  return null;
}

function applyTargetingToSelector(
  selector: Selector,
  abilityTargeting: { allowSelfTarget?: boolean } | undefined,
  effectTargeting: { allowSelfTarget?: boolean } | undefined,
): Selector {
  const targeting = effectTargeting ?? abilityTargeting;

  if (targeting?.allowSelfTarget === false && !selector.relation) {
    return {
      ...selector,
      relation: "another",
    };
  }

  return selector;
}

function getEffectTargeting(
  effect: Effect,
): { allowSelfTarget?: boolean; optional?: boolean } | undefined {
  return "targeting" in effect
    ? (effect as {
        targeting?: { allowSelfTarget?: boolean; optional?: boolean };
      }).targeting
    : undefined;
}

export function getLegalActions(state: BattleState): BattleAction[] {
  if (state.phase !== "player_action") {
    return [];
  }

  if (state.pendingTargetRequest) {
    if (state.pendingTargetRequest.targetKind === "card") {
      return selectObjects(
        state,
        state.pendingTargetRequest.selector,
        state.pendingTargetRequest.context,
      )
        .filter((object): object is Extract<SelectedObject, { kind: "card" }> => object.kind === "card")
        .map((card) => ({
          type: "choose_card" as const,
          targetCardInstanceId: card.card.instanceId,
        }));
    }

    return selectPermanents(
      state,
      state.pendingTargetRequest.selector,
      state.pendingTargetRequest.context,
    ).map((permanent) => ({
      type: "choose_target" as const,
      targetPermanentId: permanent.instanceId,
    }));
  }

  const playCardActions: BattleAction[] = state.player.hand
    .filter(
      (card) =>
        state.player.energy >=
        getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId).cost,
    )
    .filter((card) => {
      const definition = getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId);

      if (hasCardType(definition, "instant") || hasCardType(definition, "sorcery")) {
        return true;
      }

      return hasOpenBattlefieldSlotForCardDefinition(state, definition);
    })
    .map((card) => ({
      type: "play_card" as const,
      cardInstanceId: card.instanceId,
    }));

  const permanentActions: BattleAction[] = state.battlefield
    .filter((permanent): permanent is NonNullable<typeof permanent> => permanent !== null)
    .flatMap((permanent) => {
      const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);
      const activatedAbilityActions = getActivatedAbilities(permanent.abilities)
        .filter((ability) => ability.activation.actionId !== "attack")
        .filter((ability) => !(permanent.disabledAbilityIds ?? []).includes(ability.id))
        .filter((ability) =>
          (ability.conditions ?? []).every((condition) =>
            evaluateCondition(state, condition, {
              abilitySourcePermanentId: permanent.instanceId,
              sourceCardInstanceId: permanent.sourceCardInstanceId,
            }),
          ),
        )
        .filter((ability) => {
          const energyCost = getAbilityEnergyCost(ability);

          if (energyCost > state.player.energy) {
            return false;
          }

          if (abilityCostsTap(ability) && permanent.isTapped) {
            return false;
          }

          return true;
        })
        .filter((ability) =>
          ability.effects.every((effect) => {
            const selector = getEffectTargetSelector(effect);

            if (!selector) {
              return true;
            }

            const legalTargets = selectPermanents(
              state,
              applyTargetingToSelector(selector, ability.targeting, getEffectTargeting(effect)),
              {
                abilitySourcePermanentId: permanent.instanceId,
              },
            );

            if (legalTargets.length > 0) {
              return true;
            }

            const effectTargeting = getEffectTargeting(effect);
            return effectTargeting?.optional === true || ability.targeting?.optional === true;
          }),
        )
        .map((ability) => ({
          type: "use_permanent_action" as const,
          permanentId: permanent.instanceId,
          source: "ability" as const,
          action: ability.activation.actionId,
          abilityId: ability.id,
        }))
        .filter(() => !permanent.hasActedThisTurn);
      const creatureRulesActions =
        hasCardType(definition, "creature") &&
        !permanent.hasActedThisTurn &&
        (permanent.disabledRulesActions ?? []).length < 2
          ? ([
              ...( !(permanent.disabledRulesActions ?? []).includes("attack")
                ? [{
                    type: "use_permanent_action" as const,
                    permanentId: permanent.instanceId,
                    source: "rules" as const,
                    action: "attack" as const,
                  }]
                : []),
              ...( !(permanent.disabledRulesActions ?? []).includes("defend")
                ? [{
                    type: "use_permanent_action" as const,
                    permanentId: permanent.instanceId,
                    source: "rules" as const,
                    action: "defend" as const,
                  }]
                : []),
            ])
          : [];

      return [...creatureRulesActions, ...activatedAbilityActions];
    });

  return [...playCardActions, ...permanentActions, { type: "end_turn" }];
}
