import type { CardDefinition } from "../../core/types.js";

export const galleryAncientOfDaysCardDefinition: CardDefinition = {
  id: "gallery_ancient_of_days",
  name: "Ancient of Days",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Keeper of the First Dawn",
    subtitle: "Legendary Creature - Sage",
    frameTone: "white",
    manaCost: "{3}",
    artist: "William Blake",
    imagePath:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg/960px-The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg",
    imageAlt: "William Blake's The Ancient of Days",
    flavorText: "A single patient mind can hold the sky in its proper shape.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "031",
    footerStat: "4/6",
  },
  subtypes: ["Sage"],
  onPlay: [],
  power: 4,
  health: 6,
  abilities: [],
};
