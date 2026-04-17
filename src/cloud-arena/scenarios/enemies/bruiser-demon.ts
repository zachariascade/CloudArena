import { attackTwiceWithBasePower, gainPower } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const bruiserDemonEnemyPreset: CloudArenaEnemyPreset = {
  id: "bruiser_demon",
  name: "Bruiser Demon",
  health: 24,
  basePower: 6,
  cards: [
    attackTwiceWithBasePower(),
    gainPower(),
    attackTwiceWithBasePower(),
  ],
};
