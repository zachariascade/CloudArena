import type { CardDefinition } from "../../core/types.js";

export const galleryJacobWrestlesWithTheAngelCardDefinition: CardDefinition = {
  id: "gallery_jacob_wrestles_with_the_angel",
  name: "Jacob Wrestles with the Angel",
  cardTypes: ["creature"],
  cost: 3,
  rarity: "mythic",
  display: {
    title: "Wrestler at the Ford",
    frameTone: "split-white-green",
    manaCost: "{3}",
    artist: "Gustave Doré",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/024.Jacob_Wrestles_with_the_Angel.jpg/960px-024.Jacob_Wrestles_with_the_Angel.jpg",
    imageAlt: "Gustave Doré's Jacob Wrestles with the Angel",
    flavorText: "Blessing and struggle often arrive wearing the same face.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "040",
    footerStat: "3/5",
  },
  subtypes: ["Human", "Warrior"],
  onPlay: [],
  power: 3,
  health: 5,
  abilities: [],
};
