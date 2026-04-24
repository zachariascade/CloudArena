import { demonPackEnemyPreset } from "./enemies/demon-pack.js";
import { bruiserDemonEnemyPreset } from "./enemies/bruiser-demon.js";
import { gruntDemonEnemyPreset } from "./enemies/grunt-demon.js";
import { lakeOfIceEnemyPreset } from "./enemies/lake-of-ice.js";
import { impCallerEnemyPreset } from "./enemies/imp-caller.js";
import { malchiorBinderOfWillsEnemyPreset } from "./enemies/malchior-binder-of-wills.js";
import { longBattleDemonEnemyPreset } from "./enemies/long-battle-demon.js";
import { warderDemonEnemyPreset } from "./enemies/warder-demon.js";

import type { CloudArenaEnemyPreset, CloudArenaEnemyPresetId } from "./types.js";

export const cloudArenaEnemyPresets: Record<CloudArenaEnemyPresetId, CloudArenaEnemyPreset> = {
  demon_pack: demonPackEnemyPreset,
  lake_of_ice: lakeOfIceEnemyPreset,
  grunt_demon: gruntDemonEnemyPreset,
  bruiser_demon: bruiserDemonEnemyPreset,
  warder_demon: warderDemonEnemyPreset,
  imp_caller: impCallerEnemyPreset,
  malchior_binder_of_wills: malchiorBinderOfWillsEnemyPreset,
  long_battle_demon: longBattleDemonEnemyPreset,
};

export function getEnemyPreset(enemyId: CloudArenaEnemyPresetId): CloudArenaEnemyPreset {
  return cloudArenaEnemyPresets[enemyId];
}
