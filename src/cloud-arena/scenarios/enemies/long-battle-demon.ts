import {
  strike,
} from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const longBattleDemonEnemyPreset: CloudArenaEnemyPreset = {
  id: "long_battle_demon",
  name: "Long Battle Demon",
  health: 60,
  basePower: 4,
  cards: [
    strike(5),
    strike(6),
    strike(4, 2),
  ],
};
