import { getTotalAttackAmount, hasAttackAmount, hasBlockAmount } from "./combat-values.js";
import type {
  CreateBattleInput,
  EnemyCardDefinition,
  EnemyIntent,
  EnemyState,
} from "./types.js";

function getEnemyIntentFromCard(card: EnemyCardDefinition): EnemyIntent {
  const attackEffects = card.effects.filter(
    (effect) => effect.target === "player" && hasAttackAmount(effect),
  );
  let attackAmount = 0;
  let blockAmount = 0;
  let attackTimes: number | undefined;

  for (const effect of card.effects) {
    if (effect.target === "player" && hasAttackAmount(effect)) {
      attackAmount += getTotalAttackAmount(effect);
    }

    if (effect.target === "enemy" && hasBlockAmount(effect)) {
      blockAmount += effect.blockAmount ?? 0;
    }
  }

  if (attackEffects.length === 1) {
    attackAmount = attackEffects[0]?.attackAmount ?? attackAmount;
    attackTimes = attackEffects[0]?.attackTimes;
  }

  if (attackAmount <= 0 && blockAmount <= 0) {
    return {};
  }

  return {
    attackAmount: attackAmount > 0 ? attackAmount : undefined,
    attackTimes: attackAmount > 0 ? attackTimes : undefined,
    blockAmount: blockAmount > 0 ? blockAmount : undefined,
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
  return card ? { intent: getEnemyIntentFromCard(card), card } : null;
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
  enemy: Pick<EnemyState, "behavior" | "cards">,
  index: number,
): EnemyPlanStep | null {
  if (enemy.cards.length > 0) {
    const card = enemy.cards[index];
    return card ? { intent: getEnemyIntentFromCard(card), card } : null;
  }

  const intent = enemy.behavior[index];
  return intent ? { intent, card: null } : null;
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
    };
  }

  return {
    name: enemy.name,
    health: enemy.health,
    basePower: enemy.basePower,
    cards: (enemy.cards ?? []).map((card) => ({
      ...card,
      effects: card.effects.map((effect) => ({ ...effect })),
    })),
  };
}
