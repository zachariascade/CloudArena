import type { CardDefinition } from "../../core/types.js";

export const galleryChristAndMaryMagdalenCardDefinition: CardDefinition = {
  id: "gallery_christ_and_mary_magdalen",
  name: "Christ and St Mary Magdalen at the Tomb",
  cardTypes: ["creature"],
  cost: 3,
  display: {
    title: "Witness at the Empty Tomb",
    subtitle: "Legendary Creature - Mystic",
    frameTone: "white",
    manaCost: "{3}",
    artist: "Rembrandt van Rijn",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg/960px-Rembrandt_van_Rijn_-_Christ_and_St_Mary_Magdalen_at_the_Tomb_-_Google_Art_Project.jpg",
    imageAlt: "Rembrandt van Rijn's Christ and St Mary Magdalen at the Tomb",
    flavorText: "The quietest witness often carries the message that lasts.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "035",
    footerStat: "2/4",
  },
  subtypes: ["Mystic"],
  onPlay: [],
  power: 2,
  health: 4,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "return_from_graveyard",
          selector: {
            zone: "graveyard",
            controller: "you",
            cardType: "creature",
          },
          targeting: {
            prompt: "Choose a creature card from your graveyard",
          },
        },
      ],
    },
    {
      id: "christ_and_mary_magdalen_keep_watch",
      kind: "activated",
      activation: { type: "action", actionId: "keep_watch" },
      costs: [
        { type: "energy", amount: 1 },
        { type: "tap" },
      ],
      effects: [
        {
          type: "draw_card",
          target: "self",
          amount: { type: "constant", value: 1 },
        },
        {
          type: "restore_health",
          target: "self",
        },
      ],
    },
  ],
};
