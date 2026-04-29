import type { CardDefinition } from "../../core/types.js";

export const tokenAngelCardDefinition: CardDefinition = {
  id: "token_angel",
  name: "Angel of the Lord",
  cardTypes: ["creature"],
  cost: 1,
  display: {
    name: "Angel of the Lord",
    title: "Angel of the Lord",
    frameTone: "white",
    imagePath: "classics/card_0059_dove_with_the_olive_branch.jpg",
    imageAlt: "A small angel token hovering over the battlefield",
    flavorText: "A little light, repeated where it is needed, still holds the line.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "006A",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 1,
  health: 1,
  keywords: ["halt"],
  abilities: [],
};
