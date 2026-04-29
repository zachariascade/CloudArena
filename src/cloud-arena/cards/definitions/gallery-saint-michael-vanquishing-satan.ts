import type { CardDefinition } from "../../core/types.js";

export const gallerySaintMichaelVanquishingSatanCardDefinition: CardDefinition = {
  id: "gallery_saint_michael_vanquishing_satan",
  name: "Saint Michael Vanquishing Satan",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Champion of Heaven",
    subtitle: "Legendary Creature - Angel",
    frameTone: "split-white-red",
    manaCost: "{3}",
    artist: "Raphael",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/7/74/Raphael_-_St._Michael_Vanquishing_Satan.jpg",
    imageAlt: "Raphael's Saint Michael Vanquishing Satan",
    flavorText: "The victory is not only force. It is order restored.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "047",
    footerStat: "5/6",
  },
  subtypes: ["Angel"],
  onPlay: [],
  power: 5,
  health: 6,
  abilities: [],
};
