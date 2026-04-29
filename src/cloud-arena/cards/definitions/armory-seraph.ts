import type { CardDefinition } from "../../core/types.js";

export const armorySeraphCardDefinition: CardDefinition = {
  id: "armory_seraph",
  name: "Gabriel, Herald of the Armory",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    name: "Gabriel, Herald of the Armory",
    title: "Gabriel, Herald of the Armory",
    frameTone: "white",
    imagePath: "https://commons.wikimedia.org/wiki/Special:FilePath/Annonciation%20Nardo%20di%20Cione.jpg",
    imageAlt: "Nardo di Cione's Annunciation with the Archangel Gabriel",
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
