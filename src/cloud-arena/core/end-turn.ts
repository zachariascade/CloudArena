import type { BattleState } from "./types.js";

export function endTurn(state: BattleState): BattleState {
  if (state.phase !== "player_action") {
    throw new Error("Only the player_action phase can end the turn.");
  }

  state.phase = "enemy_resolution";
  state.log.push({
    type: "turn_ended",
    turnNumber: state.turnNumber,
  });

  return state;
}

