import { assault, guard, strike } from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

export const saturnDevouringHisSonGoyaEnemyPreset: CloudArenaEnemyPreset = {
  id: "saturn_devouring_his_son_goya",
  definitionId: "enemy_saturn_devouring_his_son_goya",
  name: "Saturn Devouring His Son",
  health: 24,
  basePower: 5,
  cards: [strike(5), guard(4), strike(6), assault(5, 1, 3)],
};
