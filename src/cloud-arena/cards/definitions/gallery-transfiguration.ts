import type { CardDefinition } from "../../core/types.js";

export const galleryTransfigurationCardDefinition: CardDefinition = {
  id: "gallery_transfiguration",
  name: "The Transfiguration",
  cardTypes: ["creature"],
  cost: 3,
  rarity: "mythic",
  display: {
    title: "Shining on the Mountain",
    frameTone: "split-white-blue",
    artist: "Raphael",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Transfiguration_Raphael.jpg/960px-Transfiguration_Raphael.jpg",
    imageAlt: "Raphael's The Transfiguration",
    flavorText: "A brighter form can transform not just the eye, but the field itself.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "051",
  },
  subtypes: ["Human"],
  onPlay: [],
  power: 4,
  health: 5,
  abilities: [],
};
