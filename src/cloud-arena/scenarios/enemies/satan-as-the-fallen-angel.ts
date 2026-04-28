import { assault, doubleSlash, gainPower, guard, singleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const satanAsTheFallenAngelEnemyPreset: CloudArenaEnemyPreset = {
  id: "satan_as_the_fallen_angel",
  definitionId: "enemy_satan_as_the_fallen_angel",
  name: "Satan as the Fallen Angel",
  health: 24,
  basePower: 4,
  cards: [guard(3), singleSlash(), gainPower(1), doubleSlash(), assault(4, 1, 3)],
};
