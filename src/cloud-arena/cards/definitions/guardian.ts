import type { CardDefinition } from "../../core/types.js";

export const guardianCardDefinition: CardDefinition = {
  id: "guardian",
  name: "Guardian",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Keeper of the Gate",
    subtitle: "Creature - Angel",
    frameTone: "white",
    manaCost: "{3}",
    imagePath: "card_0036_watcher_at_edens_gate.jpg",
    imageAlt: "A guardian standing watch before a sacred gate",
    flavorText: "A faithful body on the field buys time for every plan behind it.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "004",
    footerStat: "4/4",
  },
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
