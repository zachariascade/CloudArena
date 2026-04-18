import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { demonPackEnemyPreset } from "./enemies/demon-pack.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const demonPackScenarioPreset: CloudArenaScenarioPreset = {
  id: "demon_pack",
  label: "Demon Pack",
  notes: "A multi-enemy encounter with a leader and two distinct demon bodies on the field.",
  playerHealth: 20,
  deck: mixedGuardianDeckPreset.cards,
  enemy: demonPackEnemyPreset,
  recommendedMaxSteps: 220,
};
