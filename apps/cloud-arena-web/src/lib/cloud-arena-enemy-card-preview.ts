import type { EnemyCardDefinition } from "../../../../src/cloud-arena/core/types.js";
import { getCardDefinition } from "../../../../src/cloud-arena/index.js";

import {
  buildDisplayCardModel,
  type DisplayCardModel,
} from "./display-card.js";

function buildSetupImageUrl(imagePath: string): string {
  return /^https?:\/\//.test(imagePath) ? imagePath : `./images/cards/${imagePath}`;
}

function summarizeEnemyCardEffect(card: EnemyCardDefinition["effects"][number]): string {
  const parts: string[] = [];

  if (typeof card.attackAmount === "number") {
    const attackCount = card.attackTimes ?? 1;
    parts.push(attackCount > 1 ? `Attack ${card.attackAmount} x${attackCount}` : `Attack ${card.attackAmount}`);
  }

  if (typeof card.attackPowerMultiplier === "number") {
    const attackCount = card.attackTimes ?? 1;
    parts.push(
      attackCount > 1
        ? `Attack ${attackCount} times with base power`
        : "Attack with base power",
    );
  }

  if (typeof card.blockAmount === "number") {
    parts.push(`Gain ${card.blockAmount} Block`);
  }

  if (typeof card.blockPowerMultiplier === "number") {
    parts.push("Gain Block equal to base power");
  }

  if (typeof card.powerDelta === "number") {
    parts.push(card.powerDelta > 0 ? `Gain ${card.powerDelta} Power` : `Lose ${Math.abs(card.powerDelta)} Power`);
  }

  if (card.spawnCardId) {
    const spawnCount = card.spawnCount ?? 1;
    const spawnLabel = card.spawnCardId.replace(/_/g, " ");
    parts.push(spawnCount === 1 ? `Spawn ${spawnLabel}` : `Spawn ${spawnCount} ${spawnLabel}s`);
  }

  return parts.join(" • ");
}

function getEnemyPreviewCardDefinition(card: EnemyCardDefinition) {
  try {
    return getCardDefinition(card.id);
  } catch {
    if (card.effects.some((effect) => effect.spawnCardId)) {
      return getCardDefinition("enemy_imp_caller");
    }

    if (card.effects.some((effect) => typeof effect.blockPowerMultiplier === "number" || typeof effect.blockAmount === "number")) {
      return getCardDefinition("enemy_husk");
    }

    if (card.effects.some((effect) => typeof effect.attackPowerMultiplier === "number" || typeof effect.attackAmount === "number")) {
      return card.effects.some((effect) => typeof effect.attackTimes === "number" && effect.attackTimes > 1)
        ? getCardDefinition("enemy_brute")
        : getCardDefinition("enemy_grunt_demon");
    }

    return getCardDefinition("enemy_leader");
  }
}

export function buildEnemyPreviewCardModel(
  card: EnemyCardDefinition,
  index: number,
): DisplayCardModel {
  const summary = card.effects.map(summarizeEnemyCardEffect).filter((part) => part.length > 0);
  const definition = getEnemyPreviewCardDefinition(card);
  const display = definition.display ?? null;

  return buildDisplayCardModel({
    variant: "enemy",
    name: card.name,
    title: display?.title ?? null,
    subtitle: display?.subtitle ?? "Enemy Card",
    frameTone: display?.frameTone ?? "split-black-red",
    manaCost: display?.manaCost ?? null,
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
    stateFlags: [],
  });
}

export function buildEnemyPreviewCards(cards: EnemyCardDefinition[]): DisplayCardModel[] {
  return cards.map((card, index) => buildEnemyPreviewCardModel(card, index));
}
