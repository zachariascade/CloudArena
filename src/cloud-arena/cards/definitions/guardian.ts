import type { CardDefinition } from "../../core/types.js";

export const guardianCardDefinition: CardDefinition = {
  id: "guardian",
  name: "Guardian",
  type: "permanent",
  cost: 3,
  subtypes: ["Angel"],
  onPlay: [],
  health: 20,
  actions: [
    { attackAmount: 10 },
    { blockAmount: 5 },
  ],
};
