import type { CardDefinition } from "../../core/types.js";

export const tokenImpCardDefinition: CardDefinition = {
  id: "token_imp",
  name: "Unclean Spirit",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    name: "Unclean Spirit",
    frameTone: "split-black-red",
    imagePath: "38790FFE-A07F-43DA-ACBD-AFAED530BB8E.jpeg",
    imageAlt: "A small imp with ember wings and a sly grin",
    flavorText: "Small enough to underestimate, loud enough to matter.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "006B",
  },
  subtypes: ["Demon", "Imp"],
  onPlay: [],
  playableInPlayerDecks: false,
  power: 2,
  health: 4,
  recoveryPolicy: "none",
  abilities: [],
};
