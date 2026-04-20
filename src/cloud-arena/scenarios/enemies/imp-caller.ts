import { attackOnceWithBasePower, spawnSimpleToken } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const impCallerEnemyPreset: CloudArenaEnemyPreset = {
  id: "imp_caller",
  name: "Imp Caller",
  health: 20,
  basePower: 3,
  leaderDefinitionId: "enemy_imp_caller",
  startingTokens: ["token_imp"],
  cards: [
    spawnSimpleToken("token_imp"),
    attackOnceWithBasePower(),
    spawnSimpleToken("token_imp", 2),
  ],
};
