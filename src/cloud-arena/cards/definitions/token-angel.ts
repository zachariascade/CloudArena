import type { CardDefinition } from "../../core/types.js";

export const tokenAngelCardDefinition: CardDefinition = {
  id: "token_angel",
  name: "Angel of the Lord",
  cardTypes: ["creature"],
  cost: 1,
  display: {
    name: "Angel of the Lord",
    frameTone: "white",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg/960px-Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
    imageAlt: "A small angel token hovering over the battlefield",
    flavorText:
      "A little light, repeated where it is needed, still holds the line.",
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
