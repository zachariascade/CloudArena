import type { CardDefinition } from "../../core/types.js";

export const resurrectCardDefinition: CardDefinition = {
  id: "resurrect",
  name: "Resurrect",
  cardTypes: ["instant"],
  cost: 2,
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
