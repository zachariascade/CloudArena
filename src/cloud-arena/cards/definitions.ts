import { attackCardDefinition } from "./definitions/attack.js";
import { armoryDiscipleCardDefinition } from "./definitions/armory-disciple.js";
import { anointedBannerCardDefinition } from "./definitions/anointed-banner.js";
import { armorySeraphCardDefinition } from "./definitions/armory-seraph.js";
import { galleryCreationOfAdamCardDefinition } from "./definitions/gallery-creation-of-adam.js";
import { galleryDelugeCardDefinition } from "./definitions/gallery-deluge.js";
import { galleryGreatDayOfHisWrathCardDefinition } from "./definitions/gallery-great-day-of-his-wrath.js";
import { galleryGreatRedDragonCardDefinition } from "./definitions/gallery-great-red-dragon.js";
import { galleryJacobWrestlesWithTheAngelCardDefinition } from "./definitions/gallery-jacob-wrestles-with-the-angel.js";
import { galleryAncientOfDaysCardDefinition } from "./definitions/gallery-ancient-of-days.js";
import { galleryAngelStoppingAbrahamCardDefinition } from "./definitions/gallery-angel-stopping-abraham.js";
import { galleryAnnunciationCardDefinition } from "./definitions/gallery-annunciation.js";
import { galleryBelshazzarsFeastCardDefinition } from "./definitions/gallery-belshazzars-feast.js";
import { galleryChristAndMaryMagdalenCardDefinition } from "./definitions/gallery-christ-and-mary-magdalen.js";
import { galleryJoshuaCommandingTheSunToStandStillUponGibeonCardDefinition } from "./definitions/gallery-joshua-commanding-the-sun-to-stand-still-upon-gibeon.js";
import { galleryLastJudgmentCardDefinition } from "./definitions/gallery-last-judgment.js";
import { galleryLastSupperCardDefinition } from "./definitions/gallery-last-supper.js";
import { galleryOpeningOfTheFifthSealCardDefinition } from "./definitions/gallery-opening-of-the-fifth-seal.js";
import { galleryPlainsOfHeavenCardDefinition } from "./definitions/gallery-plains-of-heaven.js";
import { gallerySacrificeOfIsaacCardDefinition } from "./definitions/gallery-sacrifice-of-isaac.js";
import { gallerySaintMichaelVanquishingSatanCardDefinition } from "./definitions/gallery-saint-michael-vanquishing-satan.js";
import { gallerySatanInCocytusCardDefinition } from "./definitions/gallery-satan-in-cocytus.js";
import { gallerySodomAndGomorrahCardDefinition } from "./definitions/gallery-sodom-and-gomorrah.js";
import { galleryTowerOfBabelCardDefinition } from "./definitions/gallery-tower-of-babel.js";
import { galleryTransfigurationCardDefinition } from "./definitions/gallery-transfiguration.js";
import { galleryTriumphOfChristianityOverPaganismCardDefinition } from "./definitions/gallery-triumph-of-christianity-over-paganism.js";
import { galleryWomanTakenInAdulteryCardDefinition } from "./definitions/gallery-woman-taken-in-adultery.js";
import { choirCaptainCardDefinition } from "./definitions/choir-captain.js";
import { defendCardDefinition } from "./definitions/defend.js";
import { defendingStrikeCardDefinition } from "./definitions/defending-strike.js";
import { battlefieldInsightCardDefinition } from "./definitions/battlefield-insight.js";
import { focusedBlessingCardDefinition } from "./definitions/focused-blessing.js";
import { forbiddenInsightCardDefinition } from "./definitions/forbidden-insight.js";
import { gardenOfEarthlyDelightsCardDefinition } from "./definitions/garden-of-earthly-delights.js";
import { graveyardHymnCardDefinition } from "./definitions/graveyard-hymn.js";
import { guardianCardDefinition } from "./definitions/guardian.js";
import { haltBucklerCardDefinition } from "./definitions/halt-buckler.js";
import { holyBladeCardDefinition } from "./definitions/holy-blade.js";
import { judgmentBladeCardDefinition } from "./definitions/judgment-blade.js";
import { enemyBruteCardDefinition } from "./definitions/enemy-brute.js";
import { enemyDemonicBoostCardDefinition } from "./definitions/enemy-demonic-boost.js";
import { enemyDemonicCurseCardDefinition } from "./definitions/enemy-demonic-curse.js";
import { enemyDemonPierceCardDefinition } from "./definitions/enemy-demon-pierce.js";
import { enemyCocytusCardDefinition } from "./definitions/enemy-cocytus.js";
import { enemyDemonicShieldCardDefinition } from "./definitions/enemy-demonic-shield.js";
import { enemyGruntDemonCardDefinition } from "./definitions/enemy-grunt-demon.js";
import { enemyImpCallerCardDefinition } from "./definitions/enemy-imp-caller.js";
import { enemyMalchiorCardDefinition } from "./definitions/enemy-malchior.js";
import { enemyLeaderCardDefinition } from "./definitions/enemy-leader.js";
import { enemyHuskCardDefinition } from "./definitions/enemy-husk.js";
import { enemyLongBattleDemonCardDefinition } from "./definitions/enemy-long-battle-demon.js";
import { enemyPackAlphaCardDefinition } from "./definitions/enemy-pack-alpha.js";
import { enemyShieldedSlashCardDefinition } from "./definitions/enemy-shielded-slash.js";
import {
  enemyCrossSlashCardDefinition,
  enemyDoubleSlashCardDefinition,
  enemyMultiSlashCardDefinition,
  enemySingleSlashCardDefinition,
  enemyTripleSlashCardDefinition,
} from "./definitions/enemy-slash-cards.js";
import { massBenedictionCardDefinition } from "./definitions/mass-benediction.js";
import { restorativeTouchCardDefinition } from "./definitions/restorative-touch.js";
import { refreshSignetCardDefinition } from "./definitions/refresh-signet.js";
import { resurrectCardDefinition } from "./definitions/resurrect.js";
import { sacrificialSeraphCardDefinition } from "./definitions/sacrificial-seraph.js";
import { radiantConduitCardDefinition } from "./definitions/radiant-conduit.js";
import { sanctifiedGuideCardDefinition } from "./definitions/sanctified-guide.js";
import { sappingCurseCardDefinition } from "./definitions/sapping-curse.js";
import { targetedStrikeCardDefinition } from "./definitions/targeted-strike.js";
import { stunningRebukeCardDefinition } from "./definitions/stunning-rebuke.js";
import { tokenImpCardDefinition } from "./definitions/token-imp.js";
import { tokenAngelCardDefinition } from "./definitions/token-angel.js";
import { tubalCainsForgeCardDefinition } from "./definitions/tubal-cains-forge.js";
import { scrollOfTheCovenanCardDefinition } from "./definitions/scroll-of-the-covenant.js";
import { enemyViperShadeCardDefinition } from "./definitions/enemy-viper-shade.js";
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
  armory_seraph: armorySeraphCardDefinition,
  anointed_banner: anointedBannerCardDefinition,
  gallery_creation_of_adam: galleryCreationOfAdamCardDefinition,
  gallery_deluge: galleryDelugeCardDefinition,
  gallery_great_day_of_his_wrath: galleryGreatDayOfHisWrathCardDefinition,
  gallery_great_red_dragon: galleryGreatRedDragonCardDefinition,
  gallery_jacob_wrestles_with_the_angel: galleryJacobWrestlesWithTheAngelCardDefinition,
  gallery_ancient_of_days: galleryAncientOfDaysCardDefinition,
  gallery_angel_stopping_abraham: galleryAngelStoppingAbrahamCardDefinition,
  gallery_annunciation: galleryAnnunciationCardDefinition,
  gallery_belshazzars_feast: galleryBelshazzarsFeastCardDefinition,
  gallery_christ_and_mary_magdalen: galleryChristAndMaryMagdalenCardDefinition,
  gallery_joshua_commanding_the_sun_to_stand_still_upon_gibeon:
    galleryJoshuaCommandingTheSunToStandStillUponGibeonCardDefinition,
  gallery_last_judgment: galleryLastJudgmentCardDefinition,
  gallery_last_supper: galleryLastSupperCardDefinition,
  gallery_opening_of_the_fifth_seal: galleryOpeningOfTheFifthSealCardDefinition,
  gallery_plains_of_heaven: galleryPlainsOfHeavenCardDefinition,
  gallery_sacrifice_of_isaac: gallerySacrificeOfIsaacCardDefinition,
  gallery_saint_michael_vanquishing_satan: gallerySaintMichaelVanquishingSatanCardDefinition,
  gallery_satan_in_cocytus: gallerySatanInCocytusCardDefinition,
  gallery_sodom_and_gomorrah: gallerySodomAndGomorrahCardDefinition,
  gallery_tower_of_babel: galleryTowerOfBabelCardDefinition,
  gallery_transfiguration: galleryTransfigurationCardDefinition,
  gallery_triumph_of_christianity_over_paganism: galleryTriumphOfChristianityOverPaganismCardDefinition,
  gallery_woman_taken_in_adultery: galleryWomanTakenInAdulteryCardDefinition,
  choir_captain: choirCaptainCardDefinition,
  defend: defendCardDefinition,
  defending_strike: defendingStrikeCardDefinition,
  battlefield_insight: battlefieldInsightCardDefinition,
  focused_blessing: focusedBlessingCardDefinition,
  forbidden_insight: forbiddenInsightCardDefinition,
  garden_of_earthly_delights: gardenOfEarthlyDelightsCardDefinition,
  graveyard_hymn: graveyardHymnCardDefinition,
  guardian: guardianCardDefinition,
  halt_buckler: haltBucklerCardDefinition,
  holy_blade: holyBladeCardDefinition,
  judgment_blade: judgmentBladeCardDefinition,
  enemy_leader: enemyLeaderCardDefinition,
  enemy_grunt_demon: enemyGruntDemonCardDefinition,
  enemy_cocytus: enemyCocytusCardDefinition,
  enemy_demonic_shield: enemyDemonicShieldCardDefinition,
  enemy_demonic_curse: enemyDemonicCurseCardDefinition,
  enemy_demon_pierce: enemyDemonPierceCardDefinition,
  enemy_demonic_boost: enemyDemonicBoostCardDefinition,
  enemy_imp_caller: enemyImpCallerCardDefinition,
  enemy_malchior: enemyMalchiorCardDefinition,
  enemy_husk: enemyHuskCardDefinition,
  enemy_long_battle_demon: enemyLongBattleDemonCardDefinition,
  enemy_brute: enemyBruteCardDefinition,
  enemy_pack_alpha: enemyPackAlphaCardDefinition,
  enemy_shielded_slash: enemyShieldedSlashCardDefinition,
  single_slash: enemySingleSlashCardDefinition,
  double_slash: enemyDoubleSlashCardDefinition,
  triple_slash: enemyTripleSlashCardDefinition,
  cross_slash: enemyCrossSlashCardDefinition,
  multi_slash: enemyMultiSlashCardDefinition,
  mass_benediction: massBenedictionCardDefinition,
  refresh_signet: refreshSignetCardDefinition,
  restorative_touch: restorativeTouchCardDefinition,
  resurrect: resurrectCardDefinition,
  sacrificial_seraph: sacrificialSeraphCardDefinition,
  radiant_conduit: radiantConduitCardDefinition,
  sanctified_guide: sanctifiedGuideCardDefinition,
  sapping_curse: sappingCurseCardDefinition,
  targeted_strike: targetedStrikeCardDefinition,
  stunning_rebuke: stunningRebukeCardDefinition,
  token_imp: tokenImpCardDefinition,
  token_angel: tokenAngelCardDefinition,
  tubal_cains_forge: tubalCainsForgeCardDefinition,
  scroll_of_the_covenant: scrollOfTheCovenanCardDefinition,
  enemy_viper_shade: enemyViperShadeCardDefinition,
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
  return definition.cardTypes.some((cardType) =>
    permanentCardTypes.has(cardType as PermanentCardType),
  );
}

export function asPermanentCardDefinition(
  definition: CardDefinition,
): PermanentCardDefinition {
  if (!isPermanentCardDefinition(definition)) {
    throw new Error(`Card ${definition.id} is not a permanent card.`);
  }

  return definition;
}
