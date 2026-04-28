import type { CardDefinition } from "../../core/types.js";

export const galleryAnnunciationCardDefinition: CardDefinition = {
  id: "gallery_annunciation",
  name: "The Annunciation",
  cardTypes: ["enchantment"],
  cost: 3,
  display: {
    title: "Herald of the First Sign",
    subtitle: "Legendary Enchantment",
    frameTone: "split-white-blue",
    manaCost: "{3}",
    artist: "Fra Angelico",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Angelico_-_Annunciation_-_San_Marco_north_corridor.jpg",
    imageAlt: "Fra Angelico's Annunciation",
    flavorText: "News becomes power the moment it lands in willing hands.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "033",
    footerStat: "0/4",
  },
  onPlay: [],
  power: 0,
  health: 4,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "gain_energy",
          target: "player",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
    {
      kind: "triggered",
      trigger: {
        event: "spell_cast",
        selector: {
          zone: "hand",
          controller: "you",
          cardType: "instant",
        },
      },
      effects: [
        {
          type: "draw_card",
          target: "self",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
    {
      kind: "triggered",
      trigger: {
        event: "spell_cast",
        selector: {
          zone: "hand",
          controller: "you",
          cardType: "sorcery",
        },
      },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 2 },
        },
      ],
    },
  ],
};
