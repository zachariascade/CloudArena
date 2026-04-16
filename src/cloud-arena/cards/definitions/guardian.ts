import type { CardDefinition } from "../../core/types.js";

export const guardianCardDefinition: CardDefinition = {
  id: "guardian",
  name: "Guardian",
  cardTypes: ["creature"],
  cost: 3,
  subtypes: ["Angel"],
  onPlay: [],
  power: 4,
  health: 4,
  abilities: [
    {
      id: "guardian_apply_block",
      kind: "activated",
      activation: { type: "action", actionId: "apply_block" },
      costs: [{ type: "energy", amount: 1 }],
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 5 },
        },
      ],
    },
  ],
};
