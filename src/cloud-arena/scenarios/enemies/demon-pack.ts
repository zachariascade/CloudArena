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
  definitionId: "enemy_pack_alpha",
  name: "Demon Pack",
  health: 24,
  basePower: 3,
  cards: [
    singleSlash(),
    demonPackImmediateBlockCard,
    crossSlash(),
  ],
};
