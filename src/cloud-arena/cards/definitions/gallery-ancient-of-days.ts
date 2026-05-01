import type { CardDefinition } from "../../core/types.js";

export const galleryAncientOfDaysCardDefinition: CardDefinition = {
  id: "gallery_ancient_of_days",
  name: "Ancient of Days, Judge Eternal",
  cardTypes: ["creature"],
  cost: 3,
  availabilityStatus: "in_progress",
  cardSet: {
    id: "daniel",
    name: "Daniel",
  },
  rarity: "mythic",
  display: {
    name: "Ancient of Days, Judge Eternal",
    title: null,
    frameTone: "white",
    artist: "William Blake",
    imagePath:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg/960px-The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg",
    imageAlt: "William Blake's The Ancient of Days",
    flavorText: "A single patient mind can hold the sky in its proper shape.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "031",
  },
  subtypes: ["God"],
  onPlay: [],
  power: 4,
  health: 6,
  abilities: [],
};
