import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { impCallerEnemyPreset } from "./enemies/imp-caller.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const impCallerScenarioPreset: CloudArenaScenarioPreset = {
  id: "imp_caller",
  label: "Belzaphor, Swarm of the Pit",
  notes: "A token-pressure test battle that starts with an imp and can spawn more.",
  playerHealth: 20,
  deck: mixedGuardianDeckPreset.cards,
  enemies: [impCallerEnemyPreset],
  recommendedMaxSteps: 180,
};
