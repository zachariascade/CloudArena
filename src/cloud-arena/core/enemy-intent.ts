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
  const powerDelta = intent.powerDelta ?? 0;
  const spawnCardId = intent.spawnCardId;
  const spawnCount = intent.spawnCount ?? 0;

  const spawnText =
    spawnCardId && spawnCount > 0 ? `spawn ${spawnCardId}${spawnCount > 1 ? ` x${spawnCount}` : ""}` : "";
  const powerText = powerDelta !== 0 ? `${powerDelta > 0 ? "+" : ""}${powerDelta} power` : "";

  if (attackAmount > 0 && blockAmount > 0 && (spawnText || powerText)) {
    if (attackTimes > 1) {
      return `attack ${attackAmount} x${attackTimes}${intent.overflowPolicy === "trample" ? " trample" : ""} + block ${blockAmount}${spawnText ? ` + ${spawnText}` : ""}${powerText ? ` + ${powerText}` : ""}`;
    }

    return `attack ${attackAmount}${intent.overflowPolicy === "trample" ? " trample" : ""} + block ${blockAmount}${spawnText ? ` + ${spawnText}` : ""}${powerText ? ` + ${powerText}` : ""}`;
  }

  if (attackAmount > 0 && blockAmount > 0) {
    if (attackTimes > 1) {
      return `attack ${attackAmount} x${attackTimes}${intent.overflowPolicy === "trample" ? " trample" : ""} + block ${blockAmount}`;
    }

    return `attack ${attackAmount}${intent.overflowPolicy === "trample" ? " trample" : ""} + block ${blockAmount}`;
  }

  if (attackAmount > 0) {
    if (spawnText || powerText) {
      if (attackTimes > 1) {
        return `attack ${attackAmount} x${attackTimes}${intent.overflowPolicy === "trample" ? " trample" : ""}${spawnText ? ` + ${spawnText}` : ""}${powerText ? ` + ${powerText}` : ""}`;
      }

      return `attack ${attackAmount}${intent.overflowPolicy === "trample" ? " trample" : ""}${spawnText ? ` + ${spawnText}` : ""}${powerText ? ` + ${powerText}` : ""}`;
    }

    if (attackTimes > 1) {
      return `attack ${attackAmount} x${attackTimes}${intent.overflowPolicy === "trample" ? " trample" : ""}`;
    }

    return `attack ${attackAmount}${intent.overflowPolicy === "trample" ? " trample" : ""}`;
  }

  if (blockAmount > 0) {
    if (spawnText || powerText) {
      return `defend ${blockAmount}${spawnText ? ` + ${spawnText}` : ""}${powerText ? ` + ${powerText}` : ""}`;
    }

    return `defend ${blockAmount}`;
  }

  if (spawnText || powerText) {
    return [spawnText, powerText].filter(Boolean).join(" + ");
  }

  return "idle";
}
