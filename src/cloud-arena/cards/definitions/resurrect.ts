import type { CardDefinition } from "../../core/types.js";

export const resurrectCardDefinition: CardDefinition = {
  id: "resurrect",
  name: "Raised from the Tomb",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    title: "Raised from the Tomb",
    subtitle: "Instant",
    frameTone: "white",
    manaCost: "{2}",
    imagePath: "card_0004_gabriel.svg",
    imageAlt: "A radiant hand lifting a card back from the grave",
    flavorText: "What falls away can be gathered back, cleanly and with purpose.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "017",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "return_from_graveyard",
      selector: {
        zone: "graveyard",
        controller: "you",
      },
      targeting: {
        prompt: "Choose a card from your graveyard",
      },
    },
  ],
};
