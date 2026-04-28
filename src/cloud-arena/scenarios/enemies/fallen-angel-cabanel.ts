import { assault, doubleSlash, guard, singleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const fallenAngelCabanelEnemyPreset: CloudArenaEnemyPreset = {
  id: "fallen_angel_cabanel",
  definitionId: "enemy_fallen_angel_cabanel",
  name: "The Fallen Angel",
  health: 22,
  basePower: 4,
  cards: [guard(4), singleSlash(), doubleSlash(), assault(3, 1, 2)],
};
