import type { CardDefinition } from "../../core/types.js";

export const enemyShieldedSlashCardDefinition: CardDefinition = {
  id: "enemy_shielded_slash",
  name: "Shielded Slash",
  cardTypes: ["instant"],
  cost: 0,
  display: {
    title: "Shielded Slash",
    subtitle: "Enemy - Assault",
    frameTone: "split-black-red",
    manaCost: "{0}",
    imagePath: "shielded-slash.png",
    imageAlt: "A demon cutting forward behind a wall of infernal armor",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E13",
  },
  onPlay: [],
  playableInPlayerDecks: false,
};
