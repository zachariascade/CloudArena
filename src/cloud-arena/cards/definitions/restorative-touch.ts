import type { CardDefinition } from "../../core/types.js";

export const restorativeTouchCardDefinition: CardDefinition = {
  id: "restorative_touch",
  name: "Your Faith Has Made You Well",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    name: "Your Faith Has Made You Well",
    frameTone: "white",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
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
