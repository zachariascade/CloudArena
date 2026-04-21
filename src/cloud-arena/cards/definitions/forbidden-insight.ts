import type { CardDefinition } from "../../core/types.js";

export const forbiddenInsightCardDefinition: CardDefinition = {
  id: "forbidden_insight",
  name: "Tree of Forbidden Knowledge",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    title: "Tree of Forbidden Knowledge",
    subtitle: "Instant",
    frameTone: "blue",
    manaCost: "{2}",
    imagePath: "card_0031_tree_of_forbidden_knowledge.jpg",
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
