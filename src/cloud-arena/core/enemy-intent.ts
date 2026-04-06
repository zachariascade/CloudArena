import type { EnemyIntent } from "./types.js";

export function getEnemyIntentAttackTimes(intent: EnemyIntent): number {
  if (typeof intent.attackAmount === "number" && intent.attackAmount > 0) {
    return Math.max(1, intent.attackTimes ?? 1);
  }

  return 0;
}

export function getEnemyIntentAttackHitAmount(intent: EnemyIntent): number {
  return intent.attackAmount ?? 0;
}

export function getEnemyIntentAttackAmount(intent: EnemyIntent): number {
  return getEnemyIntentAttackHitAmount(intent) * getEnemyIntentAttackTimes(intent);
}

export function getEnemyIntentBlockAmount(intent: EnemyIntent): number {
  return intent.blockAmount ?? 0;
}

export function formatEnemyIntent(intent: EnemyIntent): string {
  const attackAmount = getEnemyIntentAttackHitAmount(intent);
  const attackTimes = getEnemyIntentAttackTimes(intent);
  const blockAmount = getEnemyIntentBlockAmount(intent);

  if (attackAmount > 0 && blockAmount > 0) {
    if (attackTimes > 1) {
      return `attack ${attackAmount} x${attackTimes} + block ${blockAmount}`;
    }

    return `attack ${attackAmount} + block ${blockAmount}`;
  }

  if (attackAmount > 0) {
    if (attackTimes > 1) {
      return `attack ${attackAmount} x${attackTimes}`;
    }

    return `attack ${attackAmount}`;
  }

  if (blockAmount > 0) {
    return `defend ${blockAmount}`;
  }

  return "idle";
}
