import type { CardDefinition } from "../../core/types.js";

export const sacrificialSeraphCardDefinition: CardDefinition = {
  id: "sacrificial_seraph",
  name: "Seraph of the Altar",
  cardTypes: ["creature"],
  cost: 2,
  display: {
    name: "Seraph of the Altar",
    frameTone: "white",
    imagePath: "card_0003_michael.avif",
    imageAlt: "An angel descending over a battlefield altar",
    flavorText: "Every offering leaves it brighter, sharper, and harder to oppose.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "006",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 3,
  health: 8,
  preSummonEffects: [
    {
      type: "sacrifice",
      selector: {
        zone: "battlefield",
        controller: "you",
        cardType: "creature",
        relation: "another",
      },
      targeting: {
        prompt: "Choose a creature to sacrifice",
      },
      amount: 1,
      choice: "controller",
    },
  ],
  abilities: [
    {
      kind: "triggered",
      trigger: {
        event: "permanent_died",
        selector: {
          controller: "you",
          cardType: "creature",
          relation: "another",
        },
      },
      effects: [
        {
          type: "add_counter",
          target: "self",
          powerDelta: 1,
          healthDelta: 1,
        },
        {
          type: "restore_health",
          target: "self",
        },
      ],
    },
  ],
};
