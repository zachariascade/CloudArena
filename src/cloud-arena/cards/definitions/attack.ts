import type { CardDefinition } from "../../core/types.js";

export const attackCardDefinition: CardDefinition = {
  id: "attack",
  name: "Attack",
  type: "instant",
  cost: 1,
  onPlay: [{ attackAmount: 6, target: "enemy" }],
};
