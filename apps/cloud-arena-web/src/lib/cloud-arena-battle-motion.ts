import type { CloudArenaPermanentSnapshot } from "../../../../src/cloud-arena/api-contract.js";

import type { CloudArenaBattleViewModel } from "./cloud-arena-battle-view-model.js";

export type CloudArenaBattleMotionOverlay = {
  zoneKeyPrefix: "battlefield" | "enemy_battlefield";
  slotIndex: number;
  permanent: CloudArenaPermanentSnapshot;
};

export type CloudArenaBattleMotionState = {
  attackIds: Record<string, true>;
  hitIds: Record<string, true>;
  healthIncreaseIds: Record<string, true>;
  healthDecreaseIds: Record<string, true>;
  deathOverlays: Record<string, CloudArenaBattleMotionOverlay>;
};

export type CloudArenaBattleMotionDiff = {
  attackIds: string[];
  hitIds: string[];
  healthIncreaseIds: string[];
  healthDecreaseIds: string[];
  deathOverlays: CloudArenaBattleMotionOverlay[];
};

function getSlotKey(zoneKeyPrefix: CloudArenaBattleMotionOverlay["zoneKeyPrefix"], slotIndex: number): string {
  return `${zoneKeyPrefix}:${slotIndex}`;
}

function getBattlefieldDiff(
  zoneKeyPrefix: CloudArenaBattleMotionOverlay["zoneKeyPrefix"],
  previousSlots: Array<CloudArenaPermanentSnapshot | null> | undefined,
  currentSlots: Array<CloudArenaPermanentSnapshot | null> | undefined,
): CloudArenaBattleMotionDiff {
  const previous = previousSlots ?? [];
  const current = currentSlots ?? [];
  const maxSlotCount = Math.max(previous.length, current.length);
  const attackIds = new Set<string>();
  const hitIds = new Set<string>();
  const healthIncreaseIds = new Set<string>();
  const healthDecreaseIds = new Set<string>();
  const deathOverlays: CloudArenaBattleMotionOverlay[] = [];

  for (let slotIndex = 0; slotIndex < maxSlotCount; slotIndex += 1) {
    const previousPermanent = previous[slotIndex] ?? null;
    const currentPermanent = current[slotIndex] ?? null;

    if (previousPermanent && !currentPermanent) {
      deathOverlays.push({
        zoneKeyPrefix,
        slotIndex,
        permanent: previousPermanent,
      });
      continue;
    }

    if (!previousPermanent || !currentPermanent) {
      continue;
    }

    if (
      currentPermanent.isCreature &&
      !currentPermanent.isDefending &&
      currentPermanent.isTapped &&
      !previousPermanent.isTapped &&
      currentPermanent.hasActedThisTurn &&
      !previousPermanent.hasActedThisTurn
    ) {
      attackIds.add(currentPermanent.instanceId);
    }

    if (
      currentPermanent.health < previousPermanent.health ||
      currentPermanent.block < previousPermanent.block
    ) {
      hitIds.add(currentPermanent.instanceId);
    }

    if (currentPermanent.health > previousPermanent.health) {
      healthIncreaseIds.add(currentPermanent.instanceId);
    } else if (currentPermanent.health < previousPermanent.health) {
      healthDecreaseIds.add(currentPermanent.instanceId);
    }
  }

  return {
    attackIds: [...attackIds],
    hitIds: [...hitIds],
    healthIncreaseIds: [...healthIncreaseIds],
    healthDecreaseIds: [...healthDecreaseIds],
    deathOverlays,
  };
}

export function getBattleMotionDiff(
  previousBattle: CloudArenaBattleViewModel,
  currentBattle: CloudArenaBattleViewModel,
): CloudArenaBattleMotionDiff {
  const battlefieldDiff = getBattlefieldDiff(
    "battlefield",
    previousBattle.battlefield,
    currentBattle.battlefield,
  );
  const enemyBattlefieldDiff = getBattlefieldDiff(
    "enemy_battlefield",
    previousBattle.enemyBattlefield,
    currentBattle.enemyBattlefield,
  );

  return {
    attackIds: [...battlefieldDiff.attackIds, ...enemyBattlefieldDiff.attackIds],
    hitIds: [...battlefieldDiff.hitIds, ...enemyBattlefieldDiff.hitIds],
    healthIncreaseIds: [
      ...battlefieldDiff.healthIncreaseIds,
      ...enemyBattlefieldDiff.healthIncreaseIds,
    ],
    healthDecreaseIds: [
      ...battlefieldDiff.healthDecreaseIds,
      ...enemyBattlefieldDiff.healthDecreaseIds,
    ],
    deathOverlays: [...battlefieldDiff.deathOverlays, ...enemyBattlefieldDiff.deathOverlays],
  };
}

export function getBattleMotionOverlayKey(overlay: CloudArenaBattleMotionOverlay): string {
  return getSlotKey(overlay.zoneKeyPrefix, overlay.slotIndex);
}
