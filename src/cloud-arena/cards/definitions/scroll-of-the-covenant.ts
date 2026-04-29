import type { CardDefinition } from "../../core/types.js";

export const scrollOfTheCovenanCardDefinition: CardDefinition = {
  id: "scroll_of_the_covenant",
  name: "Scroll of the Covenant",
  cardTypes: ["artifact"],
  cost: 3,
  display: {
    name: "Scroll of the Covenant",
    frameTone: "colorless",
    imagePath: "classics/card_0052_tower_of_babel.jpg",
    imageAlt: "An ancient scroll unrolling to reveal the full weight of binding words",
    flavorText: "Every word written in covenant opens the mind to what must come next.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "028",
  },
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [
    {
      id: "scroll_of_the_covenant_draw",
      kind: "activated",
      activation: { type: "action", actionId: "draw_cards" },
      costs: [{ type: "tap" }],
      effects: [
        {
          type: "draw_card",
          target: "player",
          amount: { type: "constant", value: 3 },
        },
      ],
    },
  ],
};
