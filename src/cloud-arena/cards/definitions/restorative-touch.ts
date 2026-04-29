import type { CardDefinition } from "../../core/types.js";

export const restorativeTouchCardDefinition: CardDefinition = {
  id: "restorative_touch",
  name: "Your Faith Has Made You Well",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    title: "Your Faith Has Made You Well",
    frameTone: "white",
    manaCost: "{1}",
    imagePath: "card_0030_tree_of_life.jpg",
    imageAlt: "A living tree radiating restorative strength",
    flavorText: "A careful touch can steady what battle has worn thin.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "023",
  },
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
