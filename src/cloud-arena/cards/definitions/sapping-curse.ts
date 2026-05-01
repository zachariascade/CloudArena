import type { CardDefinition } from "../../core/types.js";

export const sappingCurseCardDefinition: CardDefinition = {
  id: "sapping_curse",
  name: "Sapping Curse",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    name: "Sapping Curse",
    frameTone: "blue",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/The%20Temptation%20of%20St%20Anthony%20(Bosch).jpg/960px-The%20Temptation%20of%20St%20Anthony%20(Bosch).jpg",
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
