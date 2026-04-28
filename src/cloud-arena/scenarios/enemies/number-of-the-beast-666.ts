import { assault, gainPower, singleSlash, tripleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const numberOfTheBeast666EnemyPreset: CloudArenaEnemyPreset = {
  id: "number_of_the_beast_666",
  definitionId: "enemy_number_of_the_beast_666",
  name: "The Number of the Beast is 666",
  health: 28,
  basePower: 5,
  cards: [singleSlash(), tripleSlash(), gainPower(2), assault(6, 1, 4)],
};
