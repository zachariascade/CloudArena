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
  const energyDelta = intent.energyDelta ?? 0;
  const powerDelta = intent.powerDelta ?? 0;
  const powerDeltaTargetPermanents = intent.powerDeltaTargetPermanents ?? 0;
  const powerDeltaAllPermanents = intent.powerDeltaAllPermanents ?? 0;
  const spawnCardId = intent.spawnCardId;
  const spawnCount = intent.spawnCount ?? 0;

  const spawnText =
    spawnCardId && spawnCount > 0 ? `spawn ${spawnCardId}${spawnCount > 1 ? ` x${spawnCount}` : ""}` : "";
  const powerText = powerDelta !== 0 ? `${powerDelta > 0 ? "+" : ""}${powerDelta} power` : "";
  const energyText =
    energyDelta !== 0
      ? `${energyDelta > 0 ? "+" : ""}${energyDelta} energy`
      : "";
  const targetBattlefieldPowerText =
    powerDeltaTargetPermanents !== 0
      ? `${powerDeltaTargetPermanents > 0 ? "+" : ""}${powerDeltaTargetPermanents} power to player permanents`
      : "";
  const battlefieldPowerText =
    powerDeltaAllPermanents !== 0
      ? `${powerDeltaAllPermanents > 0 ? "+" : ""}${powerDeltaAllPermanents} power to all permanents`
      : "";
  const isBattlefieldDebuffOnly =
    attackAmount <= 0 &&
    blockAmount <= 0 &&
    !spawnText &&
    !energyText &&
    !powerText &&
    !targetBattlefieldPowerText &&
    battlefieldPowerText.length > 0;

  if (attackAmount > 0 && blockAmount > 0 && (spawnText || energyText || powerText || targetBattlefieldPowerText || battlefieldPowerText)) {
    if (attackTimes > 1) {
      return `attack ${attackAmount} x${attackTimes}${intent.overflowPolicy === "trample" ? " trample" : ""} + block ${blockAmount}${spawnText ? ` + ${spawnText}` : ""}${energyText ? ` + ${energyText}` : ""}${powerText ? ` + ${powerText}` : ""}${targetBattlefieldPowerText ? ` + ${targetBattlefieldPowerText}` : ""}${battlefieldPowerText ? ` + ${battlefieldPowerText}` : ""}`;
    }

    return `attack ${attackAmount}${intent.overflowPolicy === "trample" ? " trample" : ""} + block ${blockAmount}${spawnText ? ` + ${spawnText}` : ""}${energyText ? ` + ${energyText}` : ""}${powerText ? ` + ${powerText}` : ""}${targetBattlefieldPowerText ? ` + ${targetBattlefieldPowerText}` : ""}${battlefieldPowerText ? ` + ${battlefieldPowerText}` : ""}`;
  }

  if (attackAmount > 0 && blockAmount > 0) {
    if (attackTimes > 1) {
      return `attack ${attackAmount} x${attackTimes}${intent.overflowPolicy === "trample" ? " trample" : ""} + block ${blockAmount}`;
    }

    return `attack ${attackAmount}${intent.overflowPolicy === "trample" ? " trample" : ""} + block ${blockAmount}`;
  }

  if (attackAmount > 0) {
    if (spawnText || energyText || powerText || targetBattlefieldPowerText || battlefieldPowerText) {
      if (attackTimes > 1) {
        return `attack ${attackAmount} x${attackTimes}${intent.overflowPolicy === "trample" ? " trample" : ""}${spawnText ? ` + ${spawnText}` : ""}${energyText ? ` + ${energyText}` : ""}${powerText ? ` + ${powerText}` : ""}${targetBattlefieldPowerText ? ` + ${targetBattlefieldPowerText}` : ""}${battlefieldPowerText ? ` + ${battlefieldPowerText}` : ""}`;
      }

      return `attack ${attackAmount}${intent.overflowPolicy === "trample" ? " trample" : ""}${spawnText ? ` + ${spawnText}` : ""}${energyText ? ` + ${energyText}` : ""}${powerText ? ` + ${powerText}` : ""}${targetBattlefieldPowerText ? ` + ${targetBattlefieldPowerText}` : ""}${battlefieldPowerText ? ` + ${battlefieldPowerText}` : ""}`;
    }

    if (attackTimes > 1) {
      return `attack ${attackAmount} x${attackTimes}${intent.overflowPolicy === "trample" ? " trample" : ""}`;
    }

    return `attack ${attackAmount}${intent.overflowPolicy === "trample" ? " trample" : ""}`;
  }

  if (blockAmount > 0) {
    if (spawnText || energyText || powerText || targetBattlefieldPowerText || battlefieldPowerText) {
      return `defend ${blockAmount}${spawnText ? ` + ${spawnText}` : ""}${energyText ? ` + ${energyText}` : ""}${powerText ? ` + ${powerText}` : ""}${targetBattlefieldPowerText ? ` + ${targetBattlefieldPowerText}` : ""}${battlefieldPowerText ? ` + ${battlefieldPowerText}` : ""}`;
    }

    return `defend ${blockAmount}`;
  }

  if (spawnText || energyText || powerText || targetBattlefieldPowerText || battlefieldPowerText) {
    if (isBattlefieldDebuffOnly) {
      return "Debuff";
    }

    return [spawnText, energyText, powerText, targetBattlefieldPowerText, battlefieldPowerText].filter(Boolean).join(" + ");
  }

  return "idle";
}
