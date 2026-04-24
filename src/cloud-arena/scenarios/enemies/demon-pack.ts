import {
  crossSlash,
  gainBlockEqualToHealth,
  singleSlash,
} from "../enemy-cards.js";
import type { CloudArenaEnemyPreset } from "../types.js";

const demonPackImmediateBlockCard = gainBlockEqualToHealth();
demonPackImmediateBlockCard.effects = demonPackImmediateBlockCard.effects.map((effect) => ({
  ...effect,
  resolveTiming: "immediate",
}));

export const demonPackEnemyPreset: CloudArenaEnemyPreset = {
  id: "demon_pack",
  name: "Demon Pack",
  health: 24,
  basePower: 3,
  leaderDefinitionId: "enemy_pack_alpha",
  startingPermanents: ["enemy_husk", "enemy_brute"],
  cards: [
    singleSlash(),
    demonPackImmediateBlockCard,
    crossSlash(),
  ],
};
