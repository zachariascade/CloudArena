import {
  doubleSlash,
  singleSlash,
  tripleSlash,
  weakenAllPermanents,
} from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const lakeOfIceEnemyPreset: CloudArenaEnemyPreset = {
  id: "lake_of_ice",
  name: "Cocytus, Lake of Ice",
  health: 28,
  basePower: 4,
  leaderDefinitionId: "enemy_cocytus",
  cards: [
    singleSlash(),
    doubleSlash(),
    tripleSlash(),
    weakenAllPermanents(),
  ],
};
