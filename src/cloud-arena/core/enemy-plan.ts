import type {
  CreateBattleEnemyInput,
  CreateBattleInput,
  EnemyCardDefinition,
  EnemyCardEffect,
  EnemyEffectResolveTiming,
  EnemyIntent,
  EnemyState,
} from "./types.js";
import { formatEnemyIntent } from "./enemy-intent.js";
import { getEnemyEffectResolveTiming } from "./enemy-card-effects.js";

function effectMatchesAnyResolveTiming(
  effect: EnemyCardEffect,
  resolveTimings: EnemyEffectResolveTiming[],
): boolean {
  return resolveTimings.includes(getEnemyEffectResolveTiming(effect));
}

function getEnemyIntentFromCard(
  card: EnemyCardDefinition,
  basePower: number,
  health: number,
  resolveTimings: EnemyEffectResolveTiming[] = ["end_of_player_turn"],
): EnemyIntent {
  let attackAmount = 0;
  let blockAmount = 0;
  let attackTimes: number | undefined;
  let overflowPolicy: EnemyIntent["overflowPolicy"] | undefined;
  let blockHealthMultiplier: number | undefined;
  let energyDelta = 0;
  let powerDelta = 0;
  let powerDeltaTargetPermanents = 0;
  let powerDeltaAllPermanents = 0;
  let summonCardId: string | undefined;
  let summonCount = 0;

  for (const effect of card.effects) {
    if (!effectMatchesAnyResolveTiming(effect, resolveTimings)) {
      continue;
    }

    if (effect.target === "player" && (effect.attackAmount !== undefined || effect.attackPowerMultiplier !== undefined)) {
      const baseAttackAmount =
        typeof effect.attackAmount === "number"
          ? effect.attackAmount
          : typeof effect.attackPowerMultiplier === "number"
            ? Math.max(0, Math.floor(basePower * effect.attackPowerMultiplier))
            : 0;
      attackAmount += baseAttackAmount;
      attackTimes = effect.attackTimes;
      overflowPolicy = effect.overflowPolicy ?? overflowPolicy;
    }

    if (
      effect.target === "enemy" &&
      (effect.blockAmount !== undefined ||
        effect.blockPowerMultiplier !== undefined ||
        effect.blockHealthMultiplier !== undefined)
    ) {
      const baseBlockAmount =
        typeof effect.blockAmount === "number"
          ? effect.blockAmount
          : typeof effect.blockPowerMultiplier === "number"
            ? Math.max(0, Math.floor(basePower * effect.blockPowerMultiplier))
            : typeof effect.blockHealthMultiplier === "number"
              ? Math.max(0, Math.floor(health * effect.blockHealthMultiplier))
            : 0;
      blockAmount += baseBlockAmount;
      blockHealthMultiplier = effect.blockHealthMultiplier ?? blockHealthMultiplier;
    }

    if (effect.target === "enemy" && typeof effect.powerDelta === "number") {
      powerDelta += effect.powerDelta;
    }

    if (typeof effect.energyDelta === "number") {
      energyDelta += effect.energyDelta;
    }

    if (typeof effect.powerDeltaTargetPermanents === "number") {
      powerDeltaTargetPermanents += effect.powerDeltaTargetPermanents;
    }

    if (effect.target === "enemy" && typeof effect.powerDeltaAllPermanents === "number") {
      powerDeltaAllPermanents += effect.powerDeltaAllPermanents;
    }

    if (effect.target === "enemy" && effect.spawnCardId) {
      summonCardId = effect.spawnCardId;
      summonCount += effect.spawnCount ?? 1;
    }
  }

  if (
    attackAmount === 0 &&
    blockAmount === 0 &&
    energyDelta === 0 &&
    powerDelta === 0 &&
    powerDeltaTargetPermanents === 0 &&
    powerDeltaAllPermanents === 0 &&
    !summonCardId
  ) {
    return {};
  }

  return {
    attackAmount: attackAmount > 0 ? attackAmount : undefined,
    attackTimes: attackAmount > 0 ? attackTimes : undefined,
    blockAmount: blockAmount > 0 ? blockAmount : undefined,
    blockHealthMultiplier,
    energyDelta: energyDelta !== 0 ? energyDelta : undefined,
    powerDelta: powerDelta > 0 ? powerDelta : powerDelta < 0 ? powerDelta : undefined,
    powerDeltaTargetPermanents:
      powerDeltaTargetPermanents > 0
        ? powerDeltaTargetPermanents
        : powerDeltaTargetPermanents < 0
          ? powerDeltaTargetPermanents
          : undefined,
    powerDeltaAllPermanents:
      powerDeltaAllPermanents > 0
        ? powerDeltaAllPermanents
        : powerDeltaAllPermanents < 0
          ? powerDeltaAllPermanents
          : undefined,
    overflowPolicy,
    spawnCardId: summonCardId,
    spawnCount: summonCount > 0 ? summonCount : undefined,
  };
}

type EnemyPlanStep = {
  intent: EnemyIntent;
  card: EnemyCardDefinition | null;
};

type EnemyPlanStateSource = Pick<
  EnemyState,
  "behavior" | "cards" | "basePower" | "health" | "behaviorIndex"
>;

function buildEnemyPlanStepFromInput(
  enemy: CreateBattleEnemyInput,
  index: number,
): EnemyPlanStep | null {
  if ("behavior" in enemy && Array.isArray(enemy.behavior)) {
    const intent = enemy.behavior[index];
    return intent ? { intent, card: null } : null;
  }

  const card = enemy.cards?.[index];
  return card ? { intent: getEnemyIntentFromCard(card, enemy.basePower, enemy.health), card } : null;
}

export function getEnemyPlanLength(
  enemy: Pick<EnemyState, "behavior" | "cards"> | CreateBattleEnemyInput | EnemyPlanStateSource,
): number {
  if ("cards" in enemy && Array.isArray(enemy.cards) && enemy.cards.length > 0) {
    return enemy.cards.length;
  }

  return Array.isArray(enemy.behavior) ? enemy.behavior.length : 0;
}

export function getEnemyPlanStepAtIndexFromInput(
  enemy: CreateBattleEnemyInput,
  index: number,
): EnemyPlanStep | null {
  return buildEnemyPlanStepFromInput(enemy, index);
}

export function getEnemyPlanStepAtIndexFromState(
  enemy: EnemyPlanStateSource,
  index: number,
): EnemyPlanStep | null {
  if (enemy.cards.length > 0) {
    const card = enemy.cards[index];
    return card ? { intent: getEnemyIntentFromCard(card, enemy.basePower, enemy.health), card } : null;
  }

  const intent = enemy.behavior[index];
  return intent ? { intent, card: null } : null;
}

export function getEnemyIntentQueueLabels(
  enemy: EnemyPlanStateSource,
  count = 2,
): string[] {
  if (count <= 0) {
    return [];
  }

  const planLength = getEnemyPlanLength(enemy);

  if (planLength <= 0) {
    return [];
  }

  const labels: string[] = [];

  for (let offset = 0; offset < count; offset += 1) {
    const step = getEnemyPlanStepAtIndexFromState(enemy, (enemy.behaviorIndex + offset) % planLength);

    if (!step) {
      break;
    }

    labels.push(formatEnemyIntent(step.intent));
  }

  return labels;
}

export function cloneEnemyConfig(
  enemy: CreateBattleEnemyInput,
): CreateBattleEnemyInput {
  if ("behavior" in enemy && Array.isArray(enemy.behavior)) {
    return {
      name: enemy.name,
      health: enemy.health,
      basePower: enemy.basePower,
      behavior: enemy.behavior.map((step) => ({ ...step })),
      leaderDefinitionId: enemy.leaderDefinitionId,
      startingTokens: enemy.startingTokens ? [...enemy.startingTokens] : undefined,
      startingPermanents: enemy.startingPermanents ? [...enemy.startingPermanents] : undefined,
    };
  }

  return {
    name: enemy.name,
    health: enemy.health,
    basePower: enemy.basePower,
    leaderDefinitionId: enemy.leaderDefinitionId,
    startingTokens: enemy.startingTokens ? [...enemy.startingTokens] : undefined,
    startingPermanents: enemy.startingPermanents ? [...enemy.startingPermanents] : undefined,
    cards: (enemy.cards ?? []).map((card) => ({
      ...card,
      effects: card.effects.map((effect) => ({ ...effect })),
    })),
  };
}
