import type { CardDefinition } from "../../core/types.js";

export const galleryDelugeCardDefinition: CardDefinition = {
  id: "gallery_deluge",
  name: "The Deluge",
  cardTypes: ["sorcery"],
  cost: 5,
  display: {
    title: "Flood of Judgment",
    subtitle: "Sorcery",
    frameTone: "blue",
    manaCost: "{5}",
    artist: "Gustave Doré",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/960px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
    imageAlt: "Gustave Doré's The Deluge",
    flavorText: "The flood does not choose sides. It only asks what can still endure.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "037",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "deal_damage",
      target: {
        zone: "battlefield",
        controller: "opponent",
        cardType: "creature",
      },
      amount: { type: "constant", value: 3 },
    },
    {
      type: "gain_block",
      target: "player",
      amount: { type: "constant", value: 3 },
    },
  ],
};
