import type { CardDefinition } from "../../core/types.js";

export const galleryTowerOfBabelCardDefinition: CardDefinition = {
  id: "gallery_tower_of_babel",
  name: "The Tower of Babel",
  cardTypes: ["enchantment"],
  cost: 3,
  display: {
    title: "The Great Tower",
    subtitle: "Legendary Enchantment",
    frameTone: "split-white-blue",
    manaCost: "{3}",
    artist: "Gustave Doré",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Gustave_Dore_Bible_The_Tower_of_Babel.jpg/960px-Gustave_Dore_Bible_The_Tower_of_Babel.jpg",
    imageAlt: "Gustave Doré's Tower of Babel",
    flavorText: "Every new layer promises mastery and delivers another kind of confusion.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "050",
  },
  onPlay: [],
  power: 0,
  health: 6,
  abilities: [],
};
