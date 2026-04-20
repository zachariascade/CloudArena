import type { CardDefinition } from "../../core/types.js";

export const tokenImpCardDefinition: CardDefinition = {
  id: "token_imp",
  name: "Token Imp",
  cardTypes: ["creature"],
  cost: 0,
  display: {
    title: "Token Imp",
    subtitle: "Creature - Demon Imp",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "38790FFE-A07F-43DA-ACBD-AFAED530BB8E.jpeg",
    imageAlt: "A small imp with ember wings and a sly grin",
    flavorText: "Small enough to underestimate, loud enough to matter.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "006B",
    footerStat: "2/4",
  },
  subtypes: ["Demon", "Imp"],
  onPlay: [],
  power: 2,
  health: 4,
  recoveryPolicy: "none",
  abilities: [],
};
