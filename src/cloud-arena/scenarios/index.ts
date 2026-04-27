import { demonPackScenarioPreset } from "./demon-pack.js";
import { impCallerScenarioPreset } from "./imp-caller.js";
import { lakeOfIceScenarioPreset } from "./lake-of-ice.js";
import { malchiorBinderOfWillsScenarioPreset } from "./malchior-binder-of-wills.js";
import { viperShadeScenarioPreset } from "./viper-shade.js";

export { cloudArenaDeckPresets, getDeckPreset } from "./decks.js";
export {
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
} from "./enemy-cards.js";
export { cloudArenaEnemyPresets, getEnemyPreset } from "./enemies.js";
export type {
  CloudArenaDeckPreset,
  CloudArenaDeckPresetId,
  CloudArenaEnemyPreset,
  CloudArenaEnemyPresetId,
  CloudArenaScenarioEnemy,
  CloudArenaScenarioId,
  CloudArenaScenarioPreset,
} from "./types.js";
import type {
  CloudArenaScenarioId,
  CloudArenaScenarioPreset,
} from "./types.js";

export const cloudArenaScenarioPresets: Record<
  CloudArenaScenarioId,
  CloudArenaScenarioPreset
> = {
  demon_pack: demonPackScenarioPreset,
  lake_of_ice: lakeOfIceScenarioPreset,
  imp_caller: impCallerScenarioPreset,
  malchior_binder_of_wills: malchiorBinderOfWillsScenarioPreset,
  viper_shade: viperShadeScenarioPreset,
};

export function getScenarioPreset(
  scenarioId: CloudArenaScenarioId,
): CloudArenaScenarioPreset {
  return cloudArenaScenarioPresets[scenarioId];
}
