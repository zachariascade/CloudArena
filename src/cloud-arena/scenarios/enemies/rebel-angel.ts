import { assault, gainPower, guard, singleSlash, doubleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const rebelAngelEnemyPreset: CloudArenaEnemyPreset = {
  id: "rebel_angel",
  definitionId: "enemy_rebel_angel",
  name: "The Rebel Angel",
  health: 24,
  basePower: 4,
  cards: [guard(5), singleSlash(), gainPower(1), doubleSlash(), assault(3, 1, 3)],
};
