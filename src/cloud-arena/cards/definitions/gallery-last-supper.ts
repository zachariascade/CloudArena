import type { CardDefinition } from "../../core/types.js";

export const galleryLastSupperCardDefinition: CardDefinition = {
  id: "gallery_last_supper",
  name: "The Last Supper",
  cardTypes: ["enchantment"],
  cost: 4,
  display: {
    title: "Bread and Cup",
    subtitle: "Legendary Enchantment",
    frameTone: "white",
    manaCost: "{4}",
    artist: "Jacopo Tintoretto",
    imagePath: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg/960px-Jacopo_Tintoretto_-_The_Last_Supper_-_WGA22649.jpg",
    imageAlt: "Jacopo Tintoretto's The Last Supper",
    flavorText: "A shared table can turn scarcity into a beginning.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "043",
  },
  onPlay: [],
  power: 0,
  health: 5,
  abilities: [
    {
      kind: "triggered",
      trigger: { event: "self_enters_battlefield" },
      effects: [
        {
          type: "draw_card",
          target: "self",
          amount: { type: "constant", value: 2 },
        },
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
          controller: "you",
        },
      },
      effects: [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 1 },
        },
      ],
    },
  ],
};
