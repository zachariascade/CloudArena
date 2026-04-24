import { singleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const gruntDemonEnemyPreset: CloudArenaEnemyPreset = {
  id: "grunt_demon",
  definitionId: "enemy_grunt_demon",
  name: "Grunt Demon",
  health: 18,
  basePower: 5,
  cards: [
    singleSlash(),
    singleSlash(),
    singleSlash(),
  ],
};
