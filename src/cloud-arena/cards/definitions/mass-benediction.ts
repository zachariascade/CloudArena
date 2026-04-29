import type { CardDefinition } from "../../core/types.js";

export const massBenedictionCardDefinition: CardDefinition = {
  id: "mass_benediction",
  name: "Priestly Benediction",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    name: "Priestly Benediction",
    title: "Priestly Benediction",
    frameTone: "white",
    imagePath: "card_0027_let_there_be_light.png",
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
