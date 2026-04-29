import type { CardDefinition } from "../../core/types.js";

export const denialBeforeTheRoostersCryCardDefinition: CardDefinition = {
  id: "denial_before_the_rooster_s_cry",
  name: "Denial Before the Rooster's Cry",
  cardTypes: ["instant"],
  cost: 3,
  display: {
    title: "Denial Before the Rooster's Cry",
    frameTone: "white",
    manaCost: "{1}{W}{U}",
    imagePath: "https://commons.wikimedia.org/wiki/Special:FilePath/Brooklyn_Museum_-_The_Third_Denial_of_Peter._Jesus%27_Look_of_Reproach_-_James_Tissot.jpg",
    imageAlt: "James Tissot's The Third Denial of Peter. Jesus' Look of Reproach",
    flavorText: "When the hour breaks, faith gets one more turn to stand.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "129",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "grant_keyword",
      target: {
        zone: "battlefield",
        controller: "you",
        cardType: "creature",
      },
      targeting: {
        prompt: "Choose a creature to shield",
      },
      keyword: "indestructible",
      duration: "end_of_turn",
    },
  ],
};
