import { endTurn } from "./end-turn.js";
import { playCard } from "../actions/play-card.js";
import { usePermanentAction } from "../actions/use-permanent-action.js";
import { resolveEnemyTurn } from "../combat/enemy-turn.js";
import { cleanupDefeatedPermanents } from "./permanents.js";
import { resetRound } from "./reset-round.js";
import { processTriggeredAbilities } from "./triggers.js";
import type { BattleAction, BattleState } from "./types.js";

function createBattleFinishedEvent(
  state: BattleState,
  winner: "player" | "enemy",
) {
  return {
    type: "battle_finished" as const,
    turnNumber: state.turnNumber,
    winner,
    playerHealth: state.player.health,
    enemyHealth: state.enemy.health,
    permanents: state.battlefield.flatMap((permanent) =>
      permanent
        ? [
            {
              permanentId: permanent.instanceId,
              health: permanent.health,
              maxHealth: permanent.maxHealth,
            },
          ]
        : [],
    ),
  };
}

function checkBattleFinished(state: BattleState): BattleState {
  if (state.enemy.health <= 0) {
    state.phase = "finished";
    state.log.push(createBattleFinishedEvent(state, "player"));
    return state;
  }

  if (state.player.health <= 0) {
    state.phase = "finished";
    state.log.push(createBattleFinishedEvent(state, "enemy"));
  }

  return state;
}

function cleanupDeadPermanents(state: BattleState): BattleState {
  return cleanupDefeatedPermanents(state);
}

export function applyBattleAction(state: BattleState, action: BattleAction): BattleState {
  if (state.phase === "finished") {
    throw new Error("Cannot apply actions to a finished battle.");
  }

  switch (action.type) {
    case "play_card":
      playCard(state, action.cardInstanceId);
      cleanupDeadPermanents(state);
      processTriggeredAbilities(state);
      cleanupDeadPermanents(state);
      return checkBattleFinished(state);
    case "use_permanent_action":
      usePermanentAction(state, action);
      cleanupDeadPermanents(state);
      processTriggeredAbilities(state);
      cleanupDeadPermanents(state);
      return checkBattleFinished(state);
    case "end_turn":
      endTurn(state);
      resolveEnemyTurn(state);
      cleanupDeadPermanents(state);
      processTriggeredAbilities(state);
      cleanupDeadPermanents(state);
      checkBattleFinished(state);
      if (state.player.health > 0 && state.enemy.health > 0) {
        resetRound(state);
      }
      return state;
  }
}
