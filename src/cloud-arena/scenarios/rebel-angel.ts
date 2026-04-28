import { mixedGuardianDeckPreset } from "./decks/mixed-guardian.js";
import { rebelAngelEnemyPreset } from "./enemies/rebel-angel.js";
import type { CloudArenaScenarioPreset } from "./types.js";

export const rebelAngelScenarioPreset: CloudArenaScenarioPreset = {
  id: "rebel_angel",
  label: "The Rebel Angel",
  notes:
    "A classical fallen-angel duel that alternates between guarded poise and violent retaliation.",
  playerHealth: 25,
  deck: mixedGuardianDeckPreset.cards,
  enemies: [rebelAngelEnemyPreset],
  recommendedMaxSteps: 180,
};
