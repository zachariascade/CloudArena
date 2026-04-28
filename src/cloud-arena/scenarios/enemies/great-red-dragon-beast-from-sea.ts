import { assault, doubleSlash, gainPower, singleSlash, tripleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const greatRedDragonBeastFromSeaEnemyPreset: CloudArenaEnemyPreset = {
  id: "great_red_dragon_beast_from_sea",
  definitionId: "enemy_great_red_dragon_beast_from_sea",
  name: "Great Red Dragon, Beast from the Sea",
  health: 26,
  basePower: 5,
  cards: [singleSlash(), gainPower(1), doubleSlash(), tripleSlash(), assault(5, 1, 3)],
};
