import type { CardDefinition } from "../../core/types.js";

export const focusedBlessingCardDefinition: CardDefinition = {
  id: "focused_blessing",
  name: "Focused Blessing",
  cardTypes: ["instant"],
  cost: 1,
  onPlay: [],
  spellEffects: [
    {
      type: "add_counter",
      target: {
        zone: "battlefield",
        controller: "you",
        cardType: "creature",
      },
      targeting: {
        prompt: "Choose a creature to bless",
      },
      powerDelta: 1,
      healthDelta: 1,
    },
  ],
};
