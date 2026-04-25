import { gainBlockEqualToBasePower, singleSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const warderDemonEnemyPreset: CloudArenaEnemyPreset = {
  id: "warder_demon",
  definitionId: "enemy_husk",
  name: "Warder Demon",
  health: 22,
  basePower: 4,
  cards: [
    gainBlockEqualToBasePower(),
    singleSlash(),
    gainBlockEqualToBasePower(),
  ],
};
