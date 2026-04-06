import {
  strike,
} from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const longBattleDemonEnemyPreset: CloudArenaEnemyPreset = {
  id: "long_battle_demon",
  name: "Long Battle Demon",
  health: 100,
  basePower: 12,
  cards: [
    strike(10, 2),
    strike(14),
    strike(12),
  ],
};
