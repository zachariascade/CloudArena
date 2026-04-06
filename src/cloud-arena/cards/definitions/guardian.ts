import type { CardDefinition } from "../../core/types.js";

export const guardianCardDefinition: CardDefinition = {
  id: "guardian",
  name: "Guardian",
  type: "permanent",
  cost: 3,
  onPlay: [],
  health: 20,
  actions: [
    { attackAmount: 4 },
    { blockAmount: 6 },
  ],
};
