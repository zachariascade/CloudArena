export {
  LEAN_V1_BOARD_SLOT_COUNT,
  LEAN_V1_DEFAULT_TURN_ENERGY,
  LEAN_V1_DEFAULT_RECOVERY_POLICY,
  LEAN_V1_DEFAULT_SUMMONING_SICKNESS_POLICY,
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
  isCardReady,
  isCardSelectableByPlayers,
  getCardDefinition,
  getCardDefinitionFromLibrary,
  hasCardType,
  isEquipmentCardDefinition,
  isPermanentCardDefinition,
} from "./cards/definitions.js";
export { discardHand, drawCards, drawUpToHandSize } from "./core/draw.js";
export {
  chooseOptionalEffect,
  choosePermanents,
  chooseSingleObject,
} from "./core/choices.js";
export {
  abilityCostsTap,
  canPayAbilityCosts,
  canPayAbilityCostBundle,
  formatAbilityCosts,
  formatActivatedAbilityLabel,
  getActivatedAbilities,
  getActivatedAbilityById,
  getAbilityActionAmount,
  getAbilityCostDisplayParts,
  getAbilityCosts,
  getAbilityEnergyCost,
  isActivatedAbility,
  payAbilityCostBundle,
  payAbilityCosts,
} from "./core/activated-abilities.js";
export {
  getDerivedPermanentActionAmount,
  getDerivedPermanentStat,
} from "./core/derived-stats.js";
export {
  getCounterDisplaySummary,
  getPermanentCounterAmount,
  getPermanentCounterCount,
  summarizePermanentCounters,
} from "./core/counters.js";
export {
  dealDamageToEnemy,
  dealDamageToPermanent,
  gainBlockToPermanent,
  gainBlockToPlayer,
  resolveEffect,
  resolveEffects,
  resolveLegacyCardEffects,
  resolvePendingTargetRequest,
} from "./core/effects.js";
export type { EffectResolutionContext } from "./core/effects.js";
export { emitRulesEvent } from "./core/rules-events.js";
export {
  findPermanentById,
  hasOpenBattlefieldSlot,
  selectObjects,
  selectPermanents,
} from "./core/selectors.js";
export type { SelectedObject, SelectorContext } from "./core/selectors.js";
export {
  attachPermanentToTarget,
  canAttachPermanentToTarget,
  detachPermanent,
  destroyPermanent,
  cleanupDefeatedPermanents,
  createPermanentForEnemyActor,
  getEnemyActorPermanent,
  getPrimaryEnemyPermanent,
  isEquipmentPermanent,
  permanentHasKeyword,
  permanentAttacksAllEnemyPermanents,
  summonPermanentFromCard,
  toPermanentInstanceId,
} from "./core/permanents.js";
export { processTriggeredAbilities } from "./core/triggers.js";
export { evaluateValueExpression } from "./core/value-expressions.js";
export type { ValueExpressionContext } from "./core/value-expressions.js";
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
  attackOnceWithBasePower,
  attackTwiceWithBasePower,
  crossSlash,
  doubleSlash,
  guard,
  gainBlockEqualToBasePower,
  gainBlockEqualToHealth,
  gainPower,
  multiSlash,
  singleSlash,
  spawnSimpleToken,
  tripleSlash,
  strike,
  weakenAllPermanents,
  getDeckPreset,
  getEnemyPreset,
  getScenarioPreset,
} from "./scenarios/index.js";
export { settleEnemyAttackDamage } from "./combat/settle-damage.js";
export { buildBattleSummary, formatBattleSummary } from "./core/summary.js";
export { usePermanentAction } from "./actions/use-permanent-action.js";
export {
  cloneCloudArenaSavedDeck,
  createCloudArenaDeckDetail,
  createCloudArenaDeckSummary,
  createCloudArenaDeckValidationIssue,
  expandCloudArenaDeckSource,
  expandCloudArenaSavedDeck,
  getCloudArenaDeckDetailByIdFromCollection,
  getCloudArenaPresetDeckDetail,
  getCloudArenaPresetDeckSummaries,
  listCloudArenaCardSummaries,
  listCloudArenaDeckSummariesFromCollection,
  normalizeCloudArenaSavedDeckDraft,
  resolveCloudArenaDeckSourceFromCollection,
  validateCloudArenaSavedDeckDraft,
  validateCloudArenaSavedDeckFile,
} from "./deck-content.js";
export {
  applyCloudArenaSessionAction,
  buildCloudArenaSessionSnapshot,
  createCloudArenaSessionRecord,
  createScenarioBattle,
  normalizeBattleAction,
  resetCloudArenaSessionRecord,
  resolveCloudArenaSessionScenario,
  validateCloudArenaBattleAction,
  CloudArenaFinishedBattleError,
  CloudArenaInvalidActionError,
} from "./session-core.js";

export type { BattleSummary } from "./core/summary.js";
export type {
  CloudArenaDeckValidationIssue,
  CloudArenaResolvedDeckSource,
  CloudArenaSavedDeck,
  CloudArenaSavedDeckCardEntry,
  CloudArenaSavedDeckCollection,
  CloudArenaSavedDeckDraft,
  CloudArenaSavedDeckRecord,
} from "./deck-content.js";
export type {
  CloudArenaResolvedPlayerDeck,
  CloudArenaSessionRecord,
} from "./session-core.js";
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
  Ability,
  AbilityKind,
  AbilityCost,
  ActivatedAbility,
  ActivatedAbilityActionId,
  ActionAbilityActivation,
  BattleAction,
  BattleEvent,
  BattlePhase,
  CardAvailabilityStatus,
  CardSet,
  BattleState,
  BehaviorEnemyConfig,
  CardDefinition,
  CardDefinitionLibrary,
  CardDefinitionId,
  CardEnemyConfig,
  CardType,
  Condition,
  ConditionOperator,
  CounterName,
  CardEffect,
  CardInstance,
  CreateBattleEnemyConfig,
  CreateBattleEnemyInput,
  CreateBattleInput,
  DamageOverflowPolicy,
  DerivedStatName,
  DefenderRecoveryPolicy,
  EnemyActorState,
  EnemyCardDefinition,
  Effect,
  EffectTarget,
  EnemyBehaviorStep,
  EnemyIntent,
  NonPermanentCardType,
  PermanentCardDefinition,
  PermanentCardType,
  PermanentState,
  PlayerState,
  SummoningSicknessPolicy,
  RulesEvent,
  RulesActionId,
  ReplacementAbility,
  Selector,
  SelectorCardType,
  SelectorController,
  SelectorRelation,
  SelectorSource,
  SpellCardDefinition,
  StatModifier,
  StaticAbility,
  Trigger,
  TriggeredAbility,
  UsePermanentAction,
  ValueExpression,
  ZoneName,
} from "./core/types.js";
export type { AbilityCostDisplayPart } from "./core/activated-abilities.js";
