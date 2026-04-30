import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const nebuchadnezzarBeastOfTheFieldCardDefinition: CardDefinition = {
  id: "nebuchadnezzar_beast_of_the_field",
  name: "Nebuchadnezzar, Beast of the Field",
  cardTypes: ["creature"],
  cost: 5,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.daniel,
  display: {
    name: "Nebuchadnezzar, Beast of the Field",
    title: "Nebuchadnezzar in the Field",
    frameTone: "black",
    artist: "William Blake",
    imagePath:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/William_Blake_-_Nebuchadnezzar_-_Google_Art_Project.jpg/960px-William_Blake_-_Nebuchadnezzar_-_Google_Art_Project.jpg",
    imageAlt: "William Blake's Nebuchadnezzar",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "032",
  },
  onPlay: [],
  power: 0,
  health: 1,
  abilities: [],
};
