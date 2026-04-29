import type { EnemyCardDefinition } from "../../../../src/cloud-arena/core/types.js";
import {
  cloudArenaEnemyPresets,
  crossSlash,
  doubleSlash,
  gainBlockEqualToBasePower,
  gainPower,
  getCardDefinition,
  multiSlash,
  singleSlash,
  spawnSimpleToken,
  tripleSlash,
  weakenAllPermanents,
} from "../../../../src/cloud-arena/index.js";

import {
  buildCardManaCost,
  buildDisplayCardModel,
  buildCardSubtitle,
  type DisplayCardModel,
} from "./display-card.js";

function buildSetupImageUrl(imagePath: string): string {
  return /^https?:\/\//.test(imagePath) ? imagePath : `./images/cards/${imagePath}`;
}

function formatAttackPowerLabel(attackPowerMultiplier: number): string {
  if (attackPowerMultiplier === 1) {
    return "base power";
  }

  if (Number.isInteger(attackPowerMultiplier)) {
    return `${attackPowerMultiplier}x base power`;
  }

  return `${attackPowerMultiplier}x base power`;
}

function formatAttackRepeatLabel(attackTimes: number): string {
  return attackTimes === 1 ? "" : attackTimes === 2 ? "twice" : `${attackTimes} times`;
}

function summarizeEnemyCardEffect(card: EnemyCardDefinition["effects"][number]): string {
  const parts: string[] = [];

  if (typeof card.attackAmount === "number") {
    const attackCount = card.attackTimes ?? 1;
    parts.push(attackCount > 1 ? `Attack ${card.attackAmount} x${attackCount}` : `Attack ${card.attackAmount}`);
  }

  if (typeof card.attackPowerMultiplier === "number") {
    const attackCount = card.attackTimes ?? 1;
    const powerLabel = formatAttackPowerLabel(card.attackPowerMultiplier);
    const repeatLabel = formatAttackRepeatLabel(attackCount);

    parts.push(
      repeatLabel.length > 0
        ? `Attack with ${powerLabel} ${repeatLabel}`
        : `Attack with ${powerLabel}`,
    );
  }

  if (card.bypassBlock) {
    parts.unshift("**Pierce**");
  }

  if (typeof card.blockAmount === "number") {
    parts.push(`Gain ${card.blockAmount} Block`);
  }

  if (typeof card.blockPowerMultiplier === "number") {
    parts.push("Gain Block equal to base power");
  }

  if (typeof card.blockHealthMultiplier === "number") {
    parts.push("Gain Block equal to health");
  }

  if (typeof card.powerDelta === "number") {
    parts.push(card.powerDelta > 0 ? `Gain ${card.powerDelta} Power` : `Lose ${Math.abs(card.powerDelta)} Power`);
  }

  if (typeof card.energyDelta === "number") {
    parts.push(
      card.energyDelta > 0
        ? `Player gains ${card.energyDelta} Energy`
        : `Player loses ${Math.abs(card.energyDelta)} Energy`,
    );
  }

  if (typeof card.powerDeltaTargetPermanents === "number") {
    parts.push(
      card.powerDeltaTargetPermanents > 0
        ? `Player permanents get +${card.powerDeltaTargetPermanents} Power`
        : `Reduce player permanents Power by ${Math.abs(card.powerDeltaTargetPermanents)}`,
    );
  }

  if (typeof card.powerDeltaAllPermanents === "number") {
    parts.push(
      card.powerDeltaAllPermanents > 0
        ? `All permanents get +${card.powerDeltaAllPermanents} Power`
        : `Reduce all permanents Power by ${Math.abs(card.powerDeltaAllPermanents)}`,
    );
  }

  if (card.spawnCardId) {
    const spawnCount = card.spawnCount ?? 1;
    const spawnLabel = card.spawnCardId.replace(/_/g, " ");
    parts.push(spawnCount === 1 ? `Spawn ${spawnLabel}` : `Spawn ${spawnCount} ${spawnLabel}s`);
  }

  const summary = parts.join(" • ");

  if (summary.length === 0) {
    return summary;
  }

  if (card.resolveTiming === "immediate") {
    return `${summary} • **Immediate**`;
  }

  if (card.resolveTiming === "start_of_next_turn") {
    return `${summary} (Next turn start)`;
  }

  return summary;
}

function getEnemyCardDefinitionById(cardId: string): EnemyCardDefinition | null {
  for (const preset of Object.values(cloudArenaEnemyPresets)) {
    const card = preset.cards.find((entry) => entry.id === cardId);

    if (card) {
      return card;
    }
  }

  return null;
}

function parseAttackIntentLabel(label: string): { attackAmount: number; attackTimes: number } | null {
  const match = label.trim().match(/^attack\s+(\d+)(?:\s+x(\d+))?(?:\s+trample)?$/i);

  if (!match) {
    return null;
  }

  return {
    attackAmount: Number(match[1]),
    attackTimes: match[2] ? Number(match[2]) : 1,
  };
}

function getSlashCardDefinitionFromIntent(input: {
  attackAmount: number;
  attackTimes: number;
  basePower: number;
}): EnemyCardDefinition {
  if (input.basePower <= 0 || input.attackAmount <= 0) {
    return singleSlash();
  }

  const ratio = input.attackAmount / input.basePower;
  const roundedRatio = Math.max(1, Math.round(ratio));

  if (input.attackTimes > 1) {
    return roundedRatio >= 2 ? multiSlash() : crossSlash();
  }

  if (roundedRatio >= 3) {
    return tripleSlash();
  }

  if (roundedRatio >= 2) {
    return doubleSlash();
  }

  return singleSlash();
}

function getEnemyPreviewCardDefinition(card: EnemyCardDefinition) {
  try {
    return getCardDefinition(card.id);
  } catch {
    const hasAttackEffect = card.effects.some(
      (effect) =>
        typeof effect.attackAmount === "number" ||
        typeof effect.attackPowerMultiplier === "number",
    );
    const hasBlockEffect = card.effects.some(
      (effect) =>
        typeof effect.blockAmount === "number" ||
        typeof effect.blockPowerMultiplier === "number" ||
        typeof effect.blockHealthMultiplier === "number",
    );

    if (card.effects.some((effect) => effect.spawnCardId)) {
      return getCardDefinition("enemy_imp_caller");
    }

    if (hasAttackEffect && hasBlockEffect) {
      return getCardDefinition("enemy_shielded_slash");
    }

    if (hasBlockEffect) {
      return getCardDefinition("enemy_demonic_shield");
    }

    if (
      card.effects.some(
        (effect) =>
          typeof effect.powerDeltaTargetPermanents === "number" &&
          effect.powerDeltaTargetPermanents < 0,
      ) ||
      card.effects.some(
        (effect) =>
          typeof effect.powerDeltaAllPermanents === "number" &&
          effect.powerDeltaAllPermanents < 0,
      )
    ) {
      return getCardDefinition("enemy_demonic_curse");
    }

    if (
      card.effects.some(
        (effect) => typeof effect.powerDelta === "number" && effect.powerDelta > 0,
      )
    ) {
      return getCardDefinition("enemy_demonic_boost");
    }

    if (card.effects.some((effect) => typeof effect.attackPowerMultiplier === "number" || typeof effect.attackAmount === "number")) {
      return card.effects.some((effect) => typeof effect.attackTimes === "number" && effect.attackTimes > 1)
        ? getCardDefinition("enemy_brute")
        : getCardDefinition("enemy_grunt_demon");
    }

    return getCardDefinition("enemy_leader");
  }
}

export function buildEnemyTelegraphPreviewCardModel(input: {
  currentCardId?: string | null;
  intentLabel?: string | null;
  intentQueueLabels?: string[] | null;
  power: number;
}): DisplayCardModel | null {
  if (input.currentCardId) {
    const exactCard = getEnemyCardDefinitionById(input.currentCardId);

    if (exactCard) {
      return buildEnemyPreviewCardModel(exactCard, 0);
    }
  }

  const intentLabel = input.intentLabel?.trim() ?? input.intentQueueLabels?.[0]?.trim() ?? null;

  if (!intentLabel) {
    return input.power > 0 ? buildEnemyPreviewCardModel(singleSlash(), 0) : null;
  }

  const attackIntent = parseAttackIntentLabel(intentLabel);

  if (attackIntent) {
    return buildEnemyPreviewCardModel(
      getSlashCardDefinitionFromIntent({
        attackAmount: attackIntent.attackAmount,
        attackTimes: attackIntent.attackTimes,
        basePower: input.power,
      }),
      0,
    );
  }

  const normalizedLabel = intentLabel.toLowerCase();

  if (normalizedLabel === "idle" || normalizedLabel === "stunned") {
    return null;
  }

  if (normalizedLabel.includes("spawn")) {
    return buildEnemyPreviewCardModel(spawnSimpleToken(), 0);
  }

  if (normalizedLabel.includes("defend") || normalizedLabel.includes("block")) {
    return buildEnemyPreviewCardModel(gainBlockEqualToBasePower(), 0);
  }

  if (normalizedLabel.includes("debuff") || normalizedLabel.includes("reduce all permanents")) {
    return buildEnemyPreviewCardModel(weakenAllPermanents(), 0);
  }

  if (normalizedLabel.includes("power")) {
    return buildEnemyPreviewCardModel(gainPower(), 0);
  }

  return input.power > 0 ? buildEnemyPreviewCardModel(singleSlash(), 0) : null;
}

export function buildEnemyPreviewCardModel(
  card: EnemyCardDefinition,
  index: number,
  options: {
    stateFlags?: string[];
  } = {},
): DisplayCardModel {
  const summary = card.effects.map(summarizeEnemyCardEffect).filter((part) => part.length > 0);
  const definition = getEnemyPreviewCardDefinition(card);
  const display = definition.display ?? null;

  return buildDisplayCardModel({
    variant: "enemy",
    name: card.name,
    title: display?.title ?? null,
    subtitle: buildCardSubtitle(definition),
    frameTone: display?.frameTone ?? "split-black-red",
    manaCost: buildCardManaCost(definition),
    image: display?.imagePath && display?.imageAlt
      ? {
          alt: display.imageAlt,
          url: buildSetupImageUrl(display.imagePath),
          fallbackLabel: card.name,
          credit: display.footerCredit,
        }
      : null,
    metaLine: null,
    footerCode: display?.footerCode ?? "ARE",
    footerCredit: display?.footerCredit ?? "Cloud Arena",
    collectorNumber: display?.collectorNumber ?? `E${String(index + 1).padStart(2, "0")}`,
    footerStat: null,
    healthBar: null,
    energyBar: null,
    statusLabel: null,
    statusTone: "draft",
    stats: [],
    textBlocks: summary.length > 0 ? summary.map((text) => ({ kind: "rules" as const, text })) : [],
    badges: [],
    actions: [],
    stateFlags: [...(options.stateFlags ?? [])],
  });
}

export function buildEnemyPreviewCards(cards: EnemyCardDefinition[]): DisplayCardModel[] {
  return cards.map((card, index) => buildEnemyPreviewCardModel(card, index));
}
