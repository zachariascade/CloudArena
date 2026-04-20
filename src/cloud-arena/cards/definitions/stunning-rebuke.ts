import type { CardDefinition } from "../../core/types.js";

export const stunningRebukeCardDefinition: CardDefinition = {
  id: "stunning_rebuke",
  name: "Stunning Rebuke",
  cardTypes: ["instant"],
  cost: 2,
  onPlay: [],
  spellEffects: [
    {
      type: "stun",
      target: "enemy",
    },
  ],
};
