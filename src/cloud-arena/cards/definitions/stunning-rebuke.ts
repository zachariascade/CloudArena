import type { CardDefinition } from "../../core/types.js";

export const stunningRebukeCardDefinition: CardDefinition = {
  id: "stunning_rebuke",
  name: "Rebuke from the Whirlwind",
  cardTypes: ["instant"],
  cost: 2,
  display: {
    title: "Rebuke from the Whirlwind",
    subtitle: "Instant",
    frameTone: "red",
    manaCost: "{2}",
    imagePath: "card_0032_flaming_sword_of_the_east.png",
    imageAlt: "A blazing sword cutting off the enemy’s momentum",
    flavorText: "A rebuke can hit so hard the next move never arrives.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "025",
  },
  onPlay: [],
  spellEffects: [
    {
      type: "stun",
      target: "enemy",
    },
  ],
};
