import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { lakeOfIceEnemyPreset } from "./enemies/lake-of-ice.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const lakeOfIceScenarioPreset: CloudArenaScenarioPreset = {
  id: "lake_of_ice",
  label: "Cocytus, Lake of Ice",
  notes: "A frozen demon leader with a steady rhythm of base-power attacks and a field-wide chill.",
  playerHealth: 90,
  deck: mixedGuardianDeckPreset.cards,
  enemies: [lakeOfIceEnemyPreset],
  recommendedMaxSteps: 200,
};
