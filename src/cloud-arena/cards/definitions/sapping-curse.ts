import type { CardDefinition } from "../../core/types.js";

export const sappingCurseCardDefinition: CardDefinition = {
  id: "sapping_curse",
  name: "Sapping Curse",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    title: "Sapping Curse",
    subtitle: "Instant",
    frameTone: "blue",
    manaCost: "{1}",
    imagePath: "card_0031_tree_of_forbidden_knowledge.jpg",
    imageAlt: "A dark burden draining strength from a creature",
    flavorText: "By the time the blade falls, the prey is already too heavy to lift.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "025",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "add_counter",
      target: {
        zone: "enemy_battlefield",
        controller: "opponent",
        cardType: "creature",
      },
      powerDelta: -3,
      duration: "end_of_turn",
      targeting: {
        prompt: "Choose an enemy creature to weaken",
      },
    },
  ],
};
