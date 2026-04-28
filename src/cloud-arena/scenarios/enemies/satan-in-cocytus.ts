import { doubleSlash, guard, singleSlash, weakenAllPermanents } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const satanInCocytusEnemyPreset: CloudArenaEnemyPreset = {
  id: "satan_in_cocytus",
  definitionId: "enemy_satan_in_cocytus",
  name: "Satan in Cocytus",
  health: 22,
  basePower: 4,
  cards: [guard(4), singleSlash(), weakenAllPermanents(), doubleSlash()],
};
