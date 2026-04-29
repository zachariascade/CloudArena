import type { CardDefinition } from "../../core/types.js";

export const galleryPandemoniumJohnMartinCardDefinition: CardDefinition = {
  id: "gallery_pandemonium_john_martin",
  name: "Pandemonium",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    name: "Pandemonium",
    frameTone: "split-black-red",
    artist: "John Martin",
    imagePath: "https://commons.wikimedia.org/wiki/Special:FilePath/Pandemonium.jpg",
    imageAlt: "John Martin's Pandemonium",
    flavorText: "The capital of Hell was built for the sound of itself.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "059",
  },
  onPlay: [],
  power: 6,
  health: 5,
  abilities: [],
};
