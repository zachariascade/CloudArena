import { getCardDefinitionFromLibrary } from "../cards/definitions.js";
import type { BattleAction, BattleState } from "../core/types.js";

function getPermanentActionMode(action: NonNullable<BattleState["battlefield"][number]>["actions"][number]) {
  if (typeof action.attackAmount === "number" && action.attackAmount > 0) {
    return "attack" as const;
  }

  if (typeof action.blockAmount === "number" && action.blockAmount > 0) {
    return "defend" as const;
  }

  throw new Error("Permanent action must define attackAmount or blockAmount.");
}

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
    .flatMap((permanent) =>
      permanent.actions.map((action) => ({
        type: "use_permanent_action" as const,
        permanentId: permanent.instanceId,
        action: getPermanentActionMode(action),
      })),
    );

  return [...playCardActions, ...permanentActions, { type: "end_turn" }];
}
