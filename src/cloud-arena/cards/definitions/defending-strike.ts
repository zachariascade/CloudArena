import type { CardDefinition } from "../../core/types.js";

export const defendingStrikeCardDefinition: CardDefinition = {
  id: "defending_strike",
  name: "Defending Strike",
  type: "instant",
  cost: 2,
  onPlay: [
    { attackAmount: 10, target: "enemy" },
    { blockAmount: 5, target: "player" },
  ],
};
