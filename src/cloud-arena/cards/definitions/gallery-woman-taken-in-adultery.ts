import type { CardDefinition } from "../../core/types.js";

export const galleryWomanTakenInAdulteryCardDefinition: CardDefinition = {
  id: "gallery_woman_taken_in_adultery",
  name: "The Woman Taken in Adultery",
  cardTypes: ["instant"],
  cost: 3,
  display: {
    name: "The Woman Taken in Adultery",
    title: "Neither Do I Condemn You",
    frameTone: "white",
    artist: "Rembrandt van Rijn",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rembrandt_Christ_and_the_Woman_Taken_in_Adultery.jpg/960px-Rembrandt_Christ_and_the_Woman_Taken_in_Adultery.jpg",
    imageAlt: "Rembrandt van Rijn's The Woman Taken in Adultery",
    flavorText: "Mercy can change the whole shape of the room in a single breath.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "053",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "gain_block",
      target: "player",
      amount: { type: "constant", value: 4 },
    },
    {
      type: "draw_card",
      target: "self",
      amount: { type: "constant", value: 1 },
    },
    {
      type: "stun",
      target: "enemy",
    },
  ],
};
