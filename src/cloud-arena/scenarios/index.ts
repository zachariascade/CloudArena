import { mixedGuardianScenarioPreset } from "./mixed-guardian.js";

export { cloudArenaDeckPresets, getDeckPreset } from "./decks.js";
export {
  assault,
  guard,
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
  mixed_guardian: mixedGuardianScenarioPreset,
};

export function getScenarioPreset(
  scenarioId: CloudArenaScenarioId,
): CloudArenaScenarioPreset {
  return cloudArenaScenarioPresets[scenarioId];
}
