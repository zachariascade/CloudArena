import type { CardDefinition } from "../../core/types.js";

export const armorySeraphCardDefinition: CardDefinition = {
  id: "armory_seraph",
  name: "Gabriel, Herald of the Armory",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Gabriel, Herald of the Armory",
    subtitle: "Creature - Angel",
    frameTone: "white",
    manaCost: "{3}",
    imagePath: "card_0004_gabriel.svg",
    imageAlt: "An angel watching over the tools of battle",
    flavorText: "Every steel edge arriving on the field is another line of sight.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "021",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 2,
  health: 4,
  abilities: [
    {
      kind: "triggered",
      trigger: {
        event: "permanent_enters_battlefield",
        selector: {
          zone: "battlefield",
          controller: "you",
          cardType: "equipment",
        },
      },
      effects: [
        {
          type: "draw_card",
          target: "self",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
  ],
};
