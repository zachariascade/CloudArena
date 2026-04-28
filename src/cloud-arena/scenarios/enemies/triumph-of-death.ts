import { assault, gainPower, singleSlash, weakenAllPermanents } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const triumphOfDeathEnemyPreset: CloudArenaEnemyPreset = {
  id: "triumph_of_death",
  definitionId: "enemy_triumph_of_death",
  name: "The Triumph of Death",
  health: 30,
  basePower: 5,
  cards: [weakenAllPermanents(), singleSlash(), gainPower(1), assault(4, 1, 4)],
};
