import type {
  CreateBattleInput,
  EnemyCardDefinition,
  EnemyIntent,
  EnemyState,
} from "./types.js";
import { formatEnemyIntent } from "./enemy-intent.js";

function getEnemyIntentFromCard(card: EnemyCardDefinition, basePower: number): EnemyIntent {
  let attackAmount = 0;
  let blockAmount = 0;
  let attackTimes: number | undefined;
  let overflowPolicy: EnemyIntent["overflowPolicy"] | undefined;
  let powerDelta = 0;
  let summonCardId: string | undefined;
  let summonCount = 0;

  for (const effect of card.effects) {
    if (effect.target === "player" && (effect.attackAmount !== undefined || effect.attackPowerMultiplier !== undefined)) {
      const baseAttackAmount =
        typeof effect.attackAmount === "number"
          ? effect.attackAmount
          : typeof effect.attackPowerMultiplier === "number"
            ? Math.max(0, Math.floor(basePower * effect.attackPowerMultiplier))
            : 0;
      attackAmount += baseAttackAmount * Math.max(1, effect.attackTimes ?? 1);
      attackTimes = effect.attackTimes;
      overflowPolicy = effect.overflowPolicy ?? overflowPolicy;
    }

    if (effect.target === "enemy" && (effect.blockAmount !== undefined || effect.blockPowerMultiplier !== undefined)) {
      const baseBlockAmount =
        typeof effect.blockAmount === "number"
          ? effect.blockAmount
          : typeof effect.blockPowerMultiplier === "number"
            ? Math.max(0, Math.floor(basePower * effect.blockPowerMultiplier))
            : 0;
      blockAmount += baseBlockAmount;
    }

    if (effect.target === "enemy" && typeof effect.powerDelta === "number") {
      powerDelta += effect.powerDelta;
    }

    if (effect.target === "enemy" && effect.spawnCardId) {
      summonCardId = effect.spawnCardId;
      summonCount += effect.spawnCount ?? 1;
    }
  }

  if (attackAmount <= 0 && blockAmount <= 0 && powerDelta <= 0 && !summonCardId) {
    return {};
  }

  return {
    attackAmount: attackAmount > 0 ? attackAmount : undefined,
    attackTimes: attackAmount > 0 ? attackTimes : undefined,
    blockAmount: blockAmount > 0 ? blockAmount : undefined,
    powerDelta: powerDelta > 0 ? powerDelta : powerDelta < 0 ? powerDelta : undefined,
    overflowPolicy,
    spawnCardId: summonCardId,
    spawnCount: summonCount > 0 ? summonCount : undefined,
  };
}

type EnemyPlanStep = {
  intent: EnemyIntent;
  card: EnemyCardDefinition | null;
};

function buildEnemyPlanStepFromInput(
  enemy: CreateBattleInput["enemy"],
  index: number,
): EnemyPlanStep | null {
  if ("behavior" in enemy && Array.isArray(enemy.behavior)) {
    const intent = enemy.behavior[index];
    return intent ? { intent, card: null } : null;
  }

  const card = enemy.cards?.[index];
  return card ? { intent: getEnemyIntentFromCard(card, enemy.basePower), card } : null;
}

export function getEnemyPlanLength(
  enemy: Pick<EnemyState, "behavior" | "cards"> | CreateBattleInput["enemy"],
): number {
  if ("cards" in enemy && Array.isArray(enemy.cards) && enemy.cards.length > 0) {
    return enemy.cards.length;
  }

  return Array.isArray(enemy.behavior) ? enemy.behavior.length : 0;
}

export function getEnemyPlanStepAtIndexFromInput(
  enemy: CreateBattleInput["enemy"],
  index: number,
): EnemyPlanStep | null {
  return buildEnemyPlanStepFromInput(enemy, index);
}

export function getEnemyPlanStepAtIndexFromState(
  enemy: Pick<EnemyState, "behavior" | "cards" | "basePower">,
  index: number,
): EnemyPlanStep | null {
  if (enemy.cards.length > 0) {
    const card = enemy.cards[index];
    return card ? { intent: getEnemyIntentFromCard(card, enemy.basePower), card } : null;
  }

  const intent = enemy.behavior[index];
  return intent ? { intent, card: null } : null;
}

export function getEnemyIntentQueueLabels(
  enemy: Pick<EnemyState, "behavior" | "cards" | "basePower" | "behaviorIndex">,
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
  enemy: CreateBattleInput["enemy"],
): CreateBattleInput["enemy"] {
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
