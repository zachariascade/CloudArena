export {
  LEAN_V1_BOARD_SLOT_COUNT,
  LEAN_V1_DEFAULT_TURN_ENERGY,
  LEAN_V1_HAND_SIZE,
  LEAN_V1_STARTING_PLAYER_HEALTH,
} from "./core/constants.js";
export { createBattle } from "./core/create-battle.js";
export {
  cloneEnemyConfig,
  getEnemyPlanLength,
  getEnemyPlanStepAtIndexFromInput,
  getEnemyPlanStepAtIndexFromState,
} from "./core/enemy-plan.js";
export {
  getTotalAttackAmount,
  hasAttackAmount,
  hasBlockAmount,
} from "./core/combat-values.js";
export {
  asPermanentCardDefinition,
  cardDefinitions,
  getCardDefinition,
  getCardDefinitionFromLibrary,
} from "./cards/definitions.js";
export { discardHand, drawUpToHandSize } from "./core/draw.js";
export {
  formatEnemyIntent,
  getEnemyIntentAttackAmount,
  getEnemyIntentAttackHitAmount,
  getEnemyIntentAttackTimes,
  getEnemyIntentBlockAmount,
} from "./core/enemy-intent.js";
export { chooseHeuristicAction, chooseHeuristicDecision } from "./ai/heuristic-agent.js";
export { applyBattleAction } from "./core/engine.js";
export { endTurn } from "./core/end-turn.js";
export { resolveEnemyTurn } from "./combat/enemy-turn.js";
export { getLegalActions } from "./actions/legal-actions.js";
export { playCard } from "./actions/play-card.js";
export { resetRound } from "./core/reset-round.js";
export { runBatchSimulations } from "./simulation/run-batch-simulations.js";
export { runSimulation } from "./simulation/run-simulation.js";
export {
  cloudArenaDeckPresets,
  cloudArenaEnemyPresets,
  cloudArenaScenarioPresets,
  assault,
  guard,
  strike,
  getDeckPreset,
  getEnemyPreset,
  getScenarioPreset,
} from "./scenarios/index.js";
export { settleEnemyAttackDamage } from "./combat/settle-damage.js";
export { buildBattleSummary, formatBattleSummary } from "./core/summary.js";
export { usePermanentAction } from "./actions/use-permanent-action.js";

export type { BattleSummary } from "./core/summary.js";
export type {
  BatchSimulationInput,
  BatchSimulationResult,
  BatchSimulationRunResult,
  BatchSimulationSummary,
} from "./simulation/run-batch-simulations.js";
export type {
  CloudArenaDeckPreset,
  CloudArenaDeckPresetId,
  CloudArenaEnemyPreset,
  CloudArenaEnemyPresetId,
  CloudArenaScenarioId,
  CloudArenaScenarioPreset,
} from "./scenarios/index.js";

export type {
  SimulationActionRecord,
  SimulationDecision,
  SimulationAgent,
  SimulationInput,
  SimulationResult,
  SimulationTrace,
} from "./simulation/run-simulation.js";

export type {
  BattleAction,
  BattleEvent,
  BattlePhase,
  BattleState,
  BehaviorEnemyConfig,
  CardDefinition,
  CardDefinitionLibrary,
  CardDefinitionId,
  CardEnemyConfig,
  CardType,
  CardEffect,
  CardInstance,
  CreateBattleEnemyConfig,
  CreateBattleInput,
  EnemyCardDefinition,
  EffectTarget,
  EnemyBehaviorStep,
  EnemyIntent,
  EnemyState,
  PermanentActionDefinition,
  PermanentCardDefinition,
  PermanentActionMode,
  PermanentState,
  PlayerState,
  UsePermanentAction,
} from "./core/types.js";
