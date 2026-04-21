import type { CardDefinition } from "../../core/types.js";

export const targetedSmiteCardDefinition: CardDefinition = {
  id: "targeted_smite",
  name: "Hand of the Lord",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    title: "Hand of the Lord",
    subtitle: "Instant",
    frameTone: "red",
    manaCost: "{1}",
    imagePath: "card_0023_cain_marked_exile.jpg",
    imageAlt: "A marked exile struck by a precise judgment",
    flavorText: "Judgment lands best when it does not wander.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "012",
  },
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
