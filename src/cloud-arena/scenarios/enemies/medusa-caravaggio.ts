import { demonPierce, gainPower, singleSlash, strike } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const medusaCaravaggioEnemyPreset: CloudArenaEnemyPreset = {
  id: "medusa_caravaggio",
  definitionId: "enemy_medusa_caravaggio",
  name: "Medusa",
  health: 18,
  basePower: 3,
  cards: [singleSlash(), demonPierce(), gainPower(1), strike(4)],
};
