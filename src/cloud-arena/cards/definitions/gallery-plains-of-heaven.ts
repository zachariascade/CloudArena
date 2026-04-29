import type { CardDefinition } from "../../core/types.js";

export const galleryPlainsOfHeavenCardDefinition: CardDefinition = {
  id: "gallery_plains_of_heaven",
  name: "The Plains of Heaven",
  cardTypes: ["enchantment"],
  cost: 3,
  rarity: "mythic",
  display: {
    title: "Plains of Heaven",
    frameTone: "white",
    manaCost: "{3}",
    artist: "John Martin",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/John_Martin_-_The_Plains_of_Heaven_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Plains_of_Heaven_-_Google_Art_Project.jpg",
    imageAlt: "John Martin's The Plains of Heaven",
    flavorText: "The horizon is a promise that keeps pulling the faithful forward.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "045",
  },
  onPlay: [],
  power: 0,
  health: 5,
  abilities: [],
};
