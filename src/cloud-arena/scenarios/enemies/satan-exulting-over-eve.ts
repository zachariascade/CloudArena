import { assault, doubleSlash, gainPower, singleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const satanExultingOverEveEnemyPreset: CloudArenaEnemyPreset = {
  id: "satan_exulting_over_eve",
  definitionId: "enemy_satan_exulting_over_eve",
  name: "Satan Exulting over Eve",
  health: 20,
  basePower: 3,
  cards: [singleSlash(), gainPower(1), doubleSlash(), assault(3, 1, 2)],
};
