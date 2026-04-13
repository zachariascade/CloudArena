import { hasCardType, getCardDefinitionFromLibrary } from "../cards/definitions.js";
import { getActivatedAbilities } from "../core/activated-abilities.js";
import type { BattleAction, BattleState } from "../core/types.js";

export function getLegalActions(state: BattleState): BattleAction[] {
  if (state.phase !== "player_action") {
    return [];
  }

  const playCardActions: BattleAction[] = state.player.hand
    .filter(
      (card) =>
        state.player.energy >=
        getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId).cost,
    )
    .map((card) => ({
      type: "play_card" as const,
      cardInstanceId: card.instanceId,
    }));

  const permanentActions: BattleAction[] = state.battlefield
    .filter((permanent): permanent is NonNullable<typeof permanent> => permanent !== null)
    .filter((permanent) => !permanent.hasActedThisTurn)
    .flatMap((permanent) => {
      const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);
      const activatedAbilityActions = getActivatedAbilities(permanent.abilities)
        .filter((ability) => ability.activation.actionId !== "attack")
        .filter((ability) => !(permanent.disabledAbilityIds ?? []).includes(ability.id))
        .map((ability) => ({
          type: "use_permanent_action" as const,
          permanentId: permanent.instanceId,
          source: "ability" as const,
          action: ability.activation.actionId,
          abilityId: ability.id,
        }));
      const creatureRulesActions =
        hasCardType(definition, "creature") &&
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
