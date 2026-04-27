import { doubleSlash, singleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const viperShadeEnemyPreset: CloudArenaEnemyPreset = {
  id: "viper_shade",
  definitionId: "enemy_viper_shade",
  name: "Viper Shade",
  health: 14,
  basePower: 2,
  cards: [
    singleSlash(),
    singleSlash(),
    doubleSlash(),
  ],
};
