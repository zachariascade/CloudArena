import type { CardDefinition } from "../../core/types.js";

export const galleryAngelStoppingAbrahamCardDefinition: CardDefinition = {
  id: "gallery_angel_stopping_abraham",
  name: "Angel Stopping Abraham",
  cardTypes: ["creature"],
  cost: 3,
  rarity: "mythic",
  display: {
    title: "Voice of Stayed Hand",
    frameTone: "split-white-green",
    artist: "Rembrandt van Rijn",
    imagePath:
      "https://upload.wikimedia.org/wikipedia/commons/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
    imageAlt:
      "Rembrandt's The Angel Preventing Abraham from Sacrificing his Son, Isaac",
    flavorText: "The blade can lower itself when mercy speaks first.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "032",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 2,
  health: 5,
  abilities: [],
};
