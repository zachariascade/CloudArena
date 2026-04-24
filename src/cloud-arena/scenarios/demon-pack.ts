import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { bruiserDemonEnemyPreset } from "./enemies/bruiser-demon.js";
import { demonPackEnemyPreset } from "./enemies/demon-pack.js";
import { lakeOfIceEnemyPreset } from "./enemies/lake-of-ice.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const demonPackScenarioPreset: CloudArenaScenarioPreset = {
  id: "demon_pack",
  label: "Demon Pack",
  notes: "A multi-enemy encounter with a leader and two distinct demon bodies on the field.",
  playerHealth: 100,
  deck: mixedGuardianDeckPreset.cards,
  enemies: [demonPackEnemyPreset, lakeOfIceEnemyPreset, bruiserDemonEnemyPreset],
  recommendedMaxSteps: 220,
};
