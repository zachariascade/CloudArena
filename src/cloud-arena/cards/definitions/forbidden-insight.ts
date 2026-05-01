import type { CardDefinition } from "../../core/types.js";

export const forbiddenInsightCardDefinition: CardDefinition = {
  id: "forbidden_insight",
  name: "Tree of Forbidden Knowledge",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    name: "Tree of Forbidden Knowledge",
    frameTone: "blue",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/003.Adam%20and%20Eve%20Are%20Driven%20out%20of%20Eden.jpg/960px-003.Adam%20and%20Eve%20Are%20Driven%20out%20of%20Eden.jpg",
    imageAlt: "A moment of hidden understanding opening like a book of fire",
    flavorText: "Some truths are dangerous, but they still fill the hand with answers.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "016",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "draw_card",
      target: "self",
      amount: { type: "constant", value: 3 },
    },
  ],
};
