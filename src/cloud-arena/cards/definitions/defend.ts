import type { CardDefinition } from "../../core/types.js";

export const defendCardDefinition: CardDefinition = {
  id: "defend",
  name: "Defend",
  type: "instant",
  cost: 1,
  onPlay: [{ blockAmount: 5, target: "player" }],
};
