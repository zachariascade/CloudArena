import { assault, gainPower, multiSlash, singleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const greatRedDragonDragonOfTheSunEnemyPreset: CloudArenaEnemyPreset = {
  id: "great_red_dragon_dragon_of_the_sun",
  definitionId: "enemy_great_red_dragon_dragon_of_the_sun",
  name: "Great Red Dragon, Dragon of the Sun",
  health: 28,
  basePower: 6,
  cards: [singleSlash(), gainPower(1), multiSlash(), assault(6, 1, 4)],
};
