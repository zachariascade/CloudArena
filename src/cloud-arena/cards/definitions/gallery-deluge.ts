import type { CardDefinition } from "../../core/types.js";

export const galleryDelugeCardDefinition: CardDefinition = {
  id: "gallery_deluge",
  name: "The Deluge",
  cardTypes: ["sorcery"],
  cost: 3,
  availabilityStatus: "in_progress",
  display: {
    name: "The Deluge",
    title: "Flood of Judgment",
    frameTone: "blue",
    artist: "Gustave Doré",
    imagePath:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/960px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
    imageAlt: "Gustave Doré's The Deluge",
    flavorText:
      "The flood does not choose sides. It only asks what can still endure.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "037",
  },
  onPlay: [],
  spellEffects: [],
};
