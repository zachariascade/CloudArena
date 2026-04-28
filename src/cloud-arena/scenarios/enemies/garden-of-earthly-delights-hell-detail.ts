import { gainPower, spawnSimpleToken, tripleSlash, weakenAllPermanents } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const gardenOfEarthlyDelightsHellDetailEnemyPreset: CloudArenaEnemyPreset = {
  id: "garden_of_earthly_delights_hell_detail",
  definitionId: "enemy_garden_of_earthly_delights_hell_detail",
  name: "Garden of Earthly Delights - Hell Detail",
  health: 24,
  basePower: 4,
  startingTokens: ["token_imp"],
  cards: [
    spawnSimpleToken("token_imp", 2),
    weakenAllPermanents(),
    gainPower(1),
    tripleSlash(),
  ],
};
