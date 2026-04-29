import type { CardDefinition } from "../../core/types.js";

export const galleryAnnunciationCardDefinition: CardDefinition = {
  id: "gallery_annunciation",
  name: "The Annunciation",
  cardTypes: ["enchantment"],
  cost: 3,
  rarity: "mythic",
  display: {
    title: "Herald of the First Sign",
    frameTone: "split-white-blue",
    artist: "Fra Angelico",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Angelico_-_Annunciation_-_San_Marco_north_corridor.jpg",
    imageAlt: "Fra Angelico's Annunciation",
    flavorText: "News becomes power the moment it lands in willing hands.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "033",
  },
  onPlay: [],
  power: 0,
  health: 4,
  abilities: [],
};
