import type { CardDefinition } from "../../core/types.js";

export const galleryRebelAngelKalmakovCardDefinition: CardDefinition = {
  id: "gallery_rebel_angel_kalmakov",
  name: "The Rebel Angel",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    name: "The Rebel Angel",
    frameTone: "split-black-red",
    artist: "Nicholas Kalmakoff",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/L%E2%80%99ange%20rebelle%20%28The%20Rebel%20Angel%29%20%281924%29%20-%20Nikolai%20Kalmakov.jpg",
    imageAlt: "Nikolai Kalmakov's The Rebel Angel",
    flavorText: "Rebellion can look like splendor until the light catches it.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "062",
  },
  onPlay: [],
  power: 4,
  health: 4,
  abilities: [],
};
