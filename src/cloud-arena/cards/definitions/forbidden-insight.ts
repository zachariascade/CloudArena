import type { CardDefinition } from "../../core/types.js";

export const forbiddenInsightCardDefinition: CardDefinition = {
  id: "forbidden_insight",
  name: "Forbidden Insight",
  cardTypes: ["instant"],
  cost: 2,
  onPlay: [],
  spellEffects: [
    {
      type: "draw_card",
      target: "self",
      amount: { type: "constant", value: 2 },
    },
  ],
};
