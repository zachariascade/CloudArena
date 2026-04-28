import { gainPower, spawnSimpleToken, multiSlash } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const satanCallingUpHisLegionsEnemyPreset: CloudArenaEnemyPreset = {
  id: "satan_calling_up_his_legions",
  definitionId: "enemy_satan_calling_up_his_legions",
  name: "Satan Calling Up His Legions",
  health: 26,
  basePower: 4,
  startingTokens: ["token_imp"],
  cards: [
    spawnSimpleToken("token_imp"),
    gainPower(1),
    spawnSimpleToken("token_imp", 2),
    multiSlash(),
  ],
};
