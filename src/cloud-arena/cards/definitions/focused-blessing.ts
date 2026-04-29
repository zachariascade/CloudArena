import type { CardDefinition } from "../../core/types.js";

export const focusedBlessingCardDefinition: CardDefinition = {
  id: "focused_blessing",
  name: "Aaronic Blessing",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    title: "Aaronic Blessing",
    frameTone: "white",
    imagePath: "https://commons.wikimedia.org/wiki/Special:FilePath/Fra%20Angelico%20-%20The%20Annunciation.jpg",
    imageAlt: "Fra Angelico's Annunciation with the Archangel Gabriel",
    flavorText: "A single faithful touch can sharpen a whole line of resolve.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "011",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "add_counter",
      target: {
        zone: "battlefield",
        controller: "you",
        cardType: "creature",
      },
      targeting: {
        prompt: "Choose a creature to bless",
      },
      powerDelta: 1,
      healthDelta: 1,
    },
  ],
};
