import { attackCardDefinition } from "./definitions/attack.js";
import { armoryDiscipleCardDefinition } from "./definitions/armory-disciple.js";
import { anointedBannerCardDefinition } from "./definitions/anointed-banner.js";
import { choirCaptainCardDefinition } from "./definitions/choir-captain.js";
import { defendCardDefinition } from "./definitions/defend.js";
import { defendingStrikeCardDefinition } from "./definitions/defending-strike.js";
import { focusedBlessingCardDefinition } from "./definitions/focused-blessing.js";
import { forcedSacrificeCardDefinition } from "./definitions/forced-sacrifice.js";
import { forbiddenInsightCardDefinition } from "./definitions/forbidden-insight.js";
import { graveyardHymnCardDefinition } from "./definitions/graveyard-hymn.js";
import { guardianCardDefinition } from "./definitions/guardian.js";
import { holyBladeCardDefinition } from "./definitions/holy-blade.js";
import { enemyBruteCardDefinition } from "./definitions/enemy-brute.js";
import { enemyLeaderCardDefinition } from "./definitions/enemy-leader.js";
import { enemyHuskCardDefinition } from "./definitions/enemy-husk.js";
import { enemyPackAlphaCardDefinition } from "./definitions/enemy-pack-alpha.js";
import { massBenedictionCardDefinition } from "./definitions/mass-benediction.js";
import { restorativeTouchCardDefinition } from "./definitions/restorative-touch.js";
import { resurrectCardDefinition } from "./definitions/resurrect.js";
import { sacrificialSeraphCardDefinition } from "./definitions/sacrificial-seraph.js";
import { sanctifiedGuideCardDefinition } from "./definitions/sanctified-guide.js";
import { targetedSmiteCardDefinition } from "./definitions/targeted-smite.js";
import { targetedStrikeCardDefinition } from "./definitions/targeted-strike.js";
import { stunningRebukeCardDefinition } from "./definitions/stunning-rebuke.js";
import { tokenImpCardDefinition } from "./definitions/token-imp.js";
import { tokenAngelCardDefinition } from "./definitions/token-angel.js";
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
  focused_blessing: focusedBlessingCardDefinition,
  forced_sacrifice: forcedSacrificeCardDefinition,
  forbidden_insight: forbiddenInsightCardDefinition,
  graveyard_hymn: graveyardHymnCardDefinition,
  guardian: guardianCardDefinition,
  holy_blade: holyBladeCardDefinition,
  enemy_leader: enemyLeaderCardDefinition,
  enemy_husk: enemyHuskCardDefinition,
  enemy_brute: enemyBruteCardDefinition,
  enemy_pack_alpha: enemyPackAlphaCardDefinition,
  mass_benediction: massBenedictionCardDefinition,
  restorative_touch: restorativeTouchCardDefinition,
  resurrect: resurrectCardDefinition,
  sacrificial_seraph: sacrificialSeraphCardDefinition,
  sanctified_guide: sanctifiedGuideCardDefinition,
  targeted_smite: targetedSmiteCardDefinition,
  targeted_strike: targetedStrikeCardDefinition,
  stunning_rebuke: stunningRebukeCardDefinition,
  token_imp: tokenImpCardDefinition,
  token_angel: tokenAngelCardDefinition,
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
