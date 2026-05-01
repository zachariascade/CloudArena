import type { CardDefinition } from "../../core/types.js";
import { CARD_SETS } from "../card-sets.js";

export const letMyPeopleGoCardDefinition: CardDefinition = {
  id: "let_my_people_go",
  name: "Let My People Go",
  cardTypes: ["sorcery"],
  cost: 2,
  availabilityStatus: "in_progress",
  cardSet: CARD_SETS.exodus,
  onPlay: [],
};
