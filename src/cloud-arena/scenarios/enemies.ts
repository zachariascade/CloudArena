import { longBattleDemonEnemyPreset } from "./enemies/long-battle-demon.js";

import type { CloudArenaEnemyPreset, CloudArenaEnemyPresetId } from "./types.js";

export const cloudArenaEnemyPresets: Record<CloudArenaEnemyPresetId, CloudArenaEnemyPreset> = {
  long_battle_demon: longBattleDemonEnemyPreset,
};

export function getEnemyPreset(enemyId: CloudArenaEnemyPresetId): CloudArenaEnemyPreset {
  return cloudArenaEnemyPresets[enemyId];
}
