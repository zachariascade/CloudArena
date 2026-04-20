import type { CardDefinition } from "../../core/types.js";

export const gardenOfEarthlyDelightsCardDefinition: CardDefinition = {
  id: "garden_of_earthly_delights",
  name: "Garden of Earthly Delights",
  cardTypes: ["enchantment"],
  cost: 3,
  display: {
    title: "Garden of Earthly Delights",
    subtitle: "Legendary Enchantment",
    frameTone: "white",
    manaCost: "{3}",
    imagePath: "669F9BF4-F0AF-4A1B-9CB5-9A083E3EEEF9.jpeg",
    imageAlt: "Hieronymus Bosch's Garden of Earthly Delights",
    flavorText: "A landscape of wonder, temptation, and overwhelming abundance.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "026",
  },
  onPlay: [],
  power: 0,
  health: 5,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 3 },
        },
      ],
    },
    {
      kind: "triggered",
      trigger: {
        event: "permanent_enters_battlefield",
        selector: {
          zone: "battlefield",
          controller: "you",
          cardType: "permanent",
          relation: "another",
        },
      },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
  ],
};
