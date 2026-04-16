import type { CardDefinition } from "../../core/types.js";

export const attackCardDefinition: CardDefinition = {
  id: "attack",
  name: "Attack",
  cardTypes: ["instant"],
  cost: 1,
  onPlay: [{ attackAmount: 3, target: "enemy" }],
};
