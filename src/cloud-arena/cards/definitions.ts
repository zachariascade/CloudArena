import { attackCardDefinition } from "./definitions/attack.js";
import { armoryDiscipleCardDefinition } from "./definitions/armory-disciple.js";
import { anointedBannerCardDefinition } from "./definitions/anointed-banner.js";
import { choirCaptainCardDefinition } from "./definitions/choir-captain.js";
import { defendCardDefinition } from "./definitions/defend.js";
import { defendingStrikeCardDefinition } from "./definitions/defending-strike.js";
import { guardianCardDefinition } from "./definitions/guardian.js";
import { holyBladeCardDefinition } from "./definitions/holy-blade.js";
import { sacrificialSeraphCardDefinition } from "./definitions/sacrificial-seraph.js";
import type {
  CardDefinition,
  CardDefinitionLibrary,
  CardDefinitionId,
  PermanentCardDefinition,
} from "../core/types.js";

export const cardDefinitions: CardDefinitionLibrary = {
  attack: attackCardDefinition,
  armory_disciple: armoryDiscipleCardDefinition,
  anointed_banner: anointedBannerCardDefinition,
  choir_captain: choirCaptainCardDefinition,
  defend: defendCardDefinition,
  defending_strike: defendingStrikeCardDefinition,
  guardian: guardianCardDefinition,
  holy_blade: holyBladeCardDefinition,
  sacrificial_seraph: sacrificialSeraphCardDefinition,
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
