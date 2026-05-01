import type { CardDefinition } from "../../core/types.js";

export const guardianCardDefinition: CardDefinition = {
  id: "guardian",
  name: "Watcher at Eden's Gate",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    name: "Watcher at Eden's Gate",
    frameTone: "white",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg/960px-Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
    imageAlt: "A guardian standing watch before a sacred gate",
    flavorText: "A faithful body on the field buys time for every plan behind it.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "004",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 4,
  health: 4,
  keywords: ["halt", "hexproof"],
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
