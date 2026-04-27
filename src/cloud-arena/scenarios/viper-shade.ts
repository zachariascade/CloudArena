import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { viperShadeEnemyPreset } from "./enemies/viper-shade.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const viperShadeScenarioPreset: CloudArenaScenarioPreset = {
  id: "viper_shade",
  label: "Viper Shade",
  notes: "A deathtouch demon that destroys any creature that dares to block or attack it.",
  playerHealth: 25,
  deck: mixedGuardianDeckPreset.cards,
  enemies: [viperShadeEnemyPreset],
  recommendedMaxSteps: 180,
};
