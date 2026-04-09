import type { BattleState, RulesEvent } from "./types.js";

export function emitRulesEvent(state: BattleState, event: RulesEvent): void {
  state.rules.push(event);
}
