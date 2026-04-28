import {
  doubleSlash,
  demonPierce,
  singleSlash,
  tripleSlash,
  weakenAllPermanents,
} from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const lakeOfIceEnemyPreset: CloudArenaEnemyPreset = {
  id: "lake_of_ice",
  definitionId: "enemy_cocytus",
  name: "Cocytus, Lake of Ice",
  health: 28,
  basePower: 4,
  cards: [
    singleSlash(),
    doubleSlash(),
    tripleSlash(),
    demonPierce(),
    weakenAllPermanents(),
  ],
};
