import type { CardDefinition } from "../../core/types.js";

export const gallerySacrificeOfIsaacCardDefinition: CardDefinition = {
  id: "gallery_sacrifice_of_isaac",
  name: "The Sacrifice of Isaac",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Faith Tested",
    subtitle: "Legendary Creature - Human",
    frameTone: "split-white-red",
    manaCost: "{3}",
    artist: "Caravaggio",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sacrifice_of_Isaac-Caravaggio_%28Uffizi%29.jpg/960px-Sacrifice_of_Isaac-Caravaggio_%28Uffizi%29.jpg",
    imageAlt: "Caravaggio's The Sacrifice of Isaac",
    flavorText: "Obedience is costly, but it can leave the field altered forever.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "046",
    footerStat: "4/4",
  },
  subtypes: ["Human"],
  onPlay: [],
  power: 4,
  health: 4,
  preSummonEffects: [
    {
      type: "sacrifice",
      selector: {
        zone: "battlefield",
        controller: "you",
        cardType: "creature",
        relation: "another",
      },
      targeting: {
        prompt: "Choose a creature to sacrifice",
      },
      amount: 1,
      choice: "controller",
    },
  ],
  abilities: [],
};
