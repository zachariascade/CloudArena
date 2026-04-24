import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { malchiorBinderOfWillsEnemyPreset } from "./enemies/malchior-binder-of-wills.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const malchiorBinderOfWillsScenarioPreset: CloudArenaScenarioPreset = {
  id: "malchior_binder_of_wills",
  label: "Malchior, Binder of Wills",
  notes: "A straightforward duel against a controlling demon lord testing single and double base-power strikes.",
  playerHealth: 20,
  deck: mixedGuardianDeckPreset.cards,
  enemy: malchiorBinderOfWillsEnemyPreset,
  recommendedMaxSteps: 180,
};
