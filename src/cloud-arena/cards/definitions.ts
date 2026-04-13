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
  CardType,
  PermanentCardDefinition,
  PermanentCardType,
} from "../core/types.js";

const permanentCardTypes = new Set<PermanentCardType>([
  "artifact",
  "battle",
  "creature",
  "enchantment",
  "land",
  "planeswalker",
]);

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

export function hasCardType(
  definition: CardDefinition,
  cardType: CardType,
): boolean {
  return definition.cardTypes.includes(cardType);
}

export function isEquipmentCardDefinition(definition: CardDefinition): boolean {
  return definition.subtypes?.includes("Equipment") ?? false;
}

export function isPermanentCardDefinition(
  definition: CardDefinition,
): definition is PermanentCardDefinition {
  return definition.cardTypes.some((cardType) => permanentCardTypes.has(cardType as PermanentCardType));
}

export function asPermanentCardDefinition(
  definition: CardDefinition,
): PermanentCardDefinition {
  if (!isPermanentCardDefinition(definition)) {
    throw new Error(`Card ${definition.id} is not a permanent card.`);
  }

  return definition;
}
