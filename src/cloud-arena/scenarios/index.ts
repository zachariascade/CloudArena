import { gruntDemonScenarioPreset } from "./grunt-demon.js";
import { impCallerScenarioPreset } from "./imp-caller.js";
import { mixedGuardianScenarioPreset } from "./mixed-guardian.js";

export { cloudArenaDeckPresets, getDeckPreset } from "./decks.js";
export {
  assault,
  attackOnceWithBasePower,
  attackTwiceWithBasePower,
  guard,
  gainBlockEqualToBasePower,
  gainPower,
  spawnSimpleToken,
  strike,
} from "./enemy-cards.js";
export { cloudArenaEnemyPresets, getEnemyPreset } from "./enemies.js";
export type {
  CloudArenaDeckPreset,
  CloudArenaDeckPresetId,
  CloudArenaEnemyPreset,
  CloudArenaEnemyPresetId,
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
  grunt_demon: gruntDemonScenarioPreset,
  imp_caller: impCallerScenarioPreset,
  mixed_guardian: mixedGuardianScenarioPreset,
};

export function getScenarioPreset(
  scenarioId: CloudArenaScenarioId,
): CloudArenaScenarioPreset {
  return cloudArenaScenarioPresets[scenarioId];
}
