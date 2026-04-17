import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { gruntDemonEnemyPreset } from "./enemies/grunt-demon.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const gruntDemonScenarioPreset: CloudArenaScenarioPreset = {
  id: "grunt_demon",
  label: "Grunt Demon",
  notes: "A compact test battle against the baseline low-tier attacker.",
  playerHealth: 20,
  deck: mixedGuardianDeckPreset.cards,
  enemy: gruntDemonEnemyPreset,
  recommendedMaxSteps: 180,
};
