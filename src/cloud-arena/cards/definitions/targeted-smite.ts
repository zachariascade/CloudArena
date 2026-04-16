import type { CardDefinition } from "../../core/types.js";

export const targetedSmiteCardDefinition: CardDefinition = {
  id: "targeted_smite",
  name: "Targeted Smite",
  cardTypes: ["instant"],
  cost: 1,
  onPlay: [],
  spellEffects: [
    {
      type: "deal_damage",
      target: {
        zone: "battlefield",
        controller: "you",
        cardType: "permanent",
      },
      targeting: {
        prompt: "Choose a permanent to smite",
      },
      amount: { type: "constant", value: 3 },
    },
  ],
};
