import type { CardDefinition } from "../../core/types.js";

export const tokenImpCardDefinition: CardDefinition = {
  id: "token_imp",
  name: "Token Imp",
  cardTypes: ["creature"],
  cost: 0,
  subtypes: ["Demon", "Imp"],
  onPlay: [],
  power: 2,
  health: 4,
  recoveryPolicy: "none",
  abilities: [],
};
