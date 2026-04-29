import type { CardDefinition } from "../../core/types.js";

export const galleryChristAndMaryMagdalenCardDefinition: CardDefinition = {
  id: "gallery_christ_and_mary_magdalen",
  name: "Christ and St Mary Magdalen at the Tomb",
  cardTypes: ["creature"],
  cost: 3,
  rarity: "mythic",
  display: {
    title: "Witness at the Empty Tomb",
    frameTone: "white",
    artist: "Rembrandt van Rijn",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg/960px-Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg",
    imageAlt: "Rembrandt van Rijn's Christ and St Mary Magdalen at the Tomb",
    flavorText: "The quietest witness often carries the message that lasts.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "035",
  },
  subtypes: ["Mystic"],
  onPlay: [],
  power: 2,
  health: 4,
  abilities: [],
};
