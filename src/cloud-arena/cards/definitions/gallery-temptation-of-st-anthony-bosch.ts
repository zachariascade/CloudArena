import type { CardDefinition } from "../../core/types.js";

export const galleryTemptationOfStAnthonyBoschCardDefinition: CardDefinition = {
  id: "gallery_temptation_of_st_anthony_bosch",
  name: "The Temptation of St Anthony",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "The Temptation of St Anthony",
    subtitle: "Creature - Demon",
    frameTone: "split-black-red",
    manaCost: "{3}",
    artist: "Hieronymus Bosch",
    imagePath:
      "https://commons.wikimedia.org/wiki/Special:FilePath/The%20Temptation%20of%20St%20Anthony%20(Bosch).jpg",
    imageAlt: "Hieronymus Bosch's The Temptation of St Anthony",
    flavorText: "Every snare is dressed as an argument.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "057",
    footerStat: "4/6",
  },
  onPlay: [],
  power: 4,
  health: 6,
  abilities: [],
};
