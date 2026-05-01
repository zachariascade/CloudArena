import type { CardDefinition } from "../../core/types.js";

export const attackCardDefinition: CardDefinition = {
  id: "attack",
  name: "Flaming Sword of the East",
  cardTypes: ["instant"],
  cost: 1,
  display: {
    name: "Flaming Sword of the East",
    frameTone: "red",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg",
    imageAlt: "A flaming sword cutting across the dark",
    flavorText: "Commit first. Let hesitation fall away after the strike lands.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "001",
  },
  onPlay: [{ attackAmount: 3, target: "enemy" }],
};
