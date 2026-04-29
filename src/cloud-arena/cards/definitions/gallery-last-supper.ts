import type { CardDefinition } from "../../core/types.js";

export const galleryLastSupperCardDefinition: CardDefinition = {
  id: "gallery_last_supper",
  name: "The Last Supper",
  cardTypes: ["enchantment"],
  cost: 3,
  rarity: "mythic",
  display: {
    name: "The Last Supper",
    title: "Bread and Cup",
    frameTone: "white",
    artist: "Jacopo Tintoretto",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg/960px-Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg",
    imageAlt: "Jacopo Tintoretto's The Last Supper",
    flavorText: "A shared table can turn scarcity into a beginning.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "043",
  },
  onPlay: [],
  power: 0,
  health: 5,
  abilities: [],
};
