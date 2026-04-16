import type { CardDefinition } from "../../core/types.js";

export const massBenedictionCardDefinition: CardDefinition = {
  id: "mass_benediction",
  name: "Mass Benediction",
  cardTypes: ["instant"],
  cost: 2,
  onPlay: [],
  spellEffects: [
    {
      type: "add_counter",
      target: {
        zone: "battlefield",
        cardType: "permanent",
      },
      powerDelta: 1,
      healthDelta: 1,
    },
  ],
};
