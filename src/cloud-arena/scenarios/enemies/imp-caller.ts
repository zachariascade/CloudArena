import { singleSlash, spawnSimpleToken } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const impCallerEnemyPreset: CloudArenaEnemyPreset = {
  id: "imp_caller",
  definitionId: "enemy_imp_caller",
  name: "Belzaphor, Swarm of the Pit",
  health: 20,
  basePower: 3,
  startingTokens: ["token_imp"],
  cards: [
    spawnSimpleToken("token_imp"),
    singleSlash(),
    spawnSimpleToken("token_imp", 2),
  ],
};
