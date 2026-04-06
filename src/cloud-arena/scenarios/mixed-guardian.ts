import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { longBattleDemonEnemyPreset } from "./enemies/long-battle-demon.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const mixedGuardianScenarioPreset: CloudArenaScenarioPreset = {
  id: "mixed_guardian",
  label: "Mixed Guardian",
  notes: "Balanced deck intended to exercise both permanent attack and defend choices.",
  playerHealth: 100,
  deck: mixedGuardianDeckPreset.cards,
  enemy: longBattleDemonEnemyPreset,
  recommendedMaxSteps: 250,
};
