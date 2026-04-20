import type { CardDefinition } from "../../core/types.js";

export const restorativeTouchCardDefinition: CardDefinition = {
  id: "restorative_touch",
  name: "Restorative Touch",
  cardTypes: ["instant"],
  cost: 1,
  onPlay: [],
  spellEffects: [
    {
      type: "add_counter",
      target: {
        zone: "battlefield",
        controller: "any",
        cardType: "permanent",
      },
      targeting: {
        prompt: "Choose a permanent to heal",
      },
      healthDelta: 3,
    },
  ],
};
