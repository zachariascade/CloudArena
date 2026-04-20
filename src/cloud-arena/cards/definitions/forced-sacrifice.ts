import type { CardDefinition } from "../../core/types.js";

export const forcedSacrificeCardDefinition: CardDefinition = {
  id: "forced_sacrifice",
  name: "Forced Sacrifice",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    title: "Forced Sacrifice",
    subtitle: "Instant",
    frameTone: "split-black-red",
    manaCost: "{1}",
    imagePath: "classics/card_0056_the_fall.png",
    imageAlt: "A shadowed descent demanding a costly offering",
    flavorText: "Some offerings are not chosen freely.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "013",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "sacrifice",
      selector: {
        zone: "battlefield",
        controller: "you",
        cardType: "permanent",
      },
      targeting: {
        prompt: "Choose a permanent to sacrifice",
      },
      amount: 1,
      choice: "controller",
    },
  ],
};
