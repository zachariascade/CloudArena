import type { CardDefinition } from "../../core/types.js";

export const massBenedictionCardDefinition: CardDefinition = {
  id: "mass_benediction",
  name: "Priestly Benediction",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    name: "Priestly Benediction",
    frameTone: "white",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
    imageAlt: "A radiant blessing washing over a gathered host",
    flavorText: "When the field is already crowded with resolve, every presence turns brighter.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "010",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "add_counter",
      target: {
        zone: "battlefield",
        cardType: "permanent",
      },
      powerDelta: 1,
      healthDelta: 1,
    },
  ],
};
