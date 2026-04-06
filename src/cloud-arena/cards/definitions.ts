import { attackCardDefinition } from "./definitions/attack.js";
import { defendCardDefinition } from "./definitions/defend.js";
import { defendingStrikeCardDefinition } from "./definitions/defending-strike.js";
import { guardianCardDefinition } from "./definitions/guardian.js";
import type {
  CardDefinition,
  CardDefinitionLibrary,
  CardDefinitionId,
  PermanentCardDefinition,
} from "../core/types.js";

export const cardDefinitions: CardDefinitionLibrary = {
  attack: attackCardDefinition,
  defend: defendCardDefinition,
  defending_strike: defendingStrikeCardDefinition,
  guardian: guardianCardDefinition,
};

export function getCardDefinitionFromLibrary(
  library: CardDefinitionLibrary,
  cardId: CardDefinitionId,
): CardDefinition {
  const definition = library[cardId];

  if (!definition) {
    throw new Error(`Card definition ${cardId} was not found.`);
  }

  return definition;
}

export function getCardDefinition(cardId: CardDefinitionId): CardDefinition {
  return getCardDefinitionFromLibrary(cardDefinitions, cardId);
}

export function asPermanentCardDefinition(
  definition: CardDefinition,
): PermanentCardDefinition {
  if (definition.type !== "permanent") {
    throw new Error(`Card ${definition.id} is not a permanent card.`);
  }

  return definition;
}
