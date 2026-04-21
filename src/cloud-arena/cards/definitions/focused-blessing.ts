import type { CardDefinition } from "../../core/types.js";

export const focusedBlessingCardDefinition: CardDefinition = {
  id: "focused_blessing",
  name: "Aaronic Blessing",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    title: "Aaronic Blessing",
    subtitle: "Instant",
    frameTone: "white",
    manaCost: "{1}",
    imagePath: "card_0004_gabriel.svg",
    imageAlt: "A radiant blessing aimed with deliberate focus",
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
