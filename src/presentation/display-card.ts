import type { AbilityCostDisplayPart } from "../cloud-arena/core/activated-abilities.js";

export type DisplayCardVariant = "mtg" | "player" | "enemy" | "permanent" | "saga";

export type DisplayCardImage = {
  alt: string;
  url: string | null;
  fallbackLabel: string;
  credit?: string | null;
};

export type DisplayCardStat = {
  label: string;
  value: string;
};

export type DisplayCardCounterPill = {
  label: "Power" | "Health";
  value: number;
};

export type DisplayCardTextBlock = {
  kind: "rules" | "flavor" | "intent" | "passive" | "meta";
  text: string;
};

export type DisplayCardSagaChapter = {
  chapter: number;
  label: string;
  text: string;
  resolved?: boolean;
  active?: boolean;
};

export type DisplayCardAction = {
  id: string;
  label: string;
  disabled?: boolean;
  emphasis?: "primary" | "neutral";
  costs?: AbilityCostDisplayPart[];
  onSelect?: () => void;
};

export type DisplayCardHealthBar = {
  current: number;
  max: number;
  label?: string;
};

export type DisplayCardEnergyBar = {
  current: number;
  max: number;
  label?: string;
};

export type DisplayCardModelBase = {
  variant: DisplayCardVariant;
  name: string;
  title?: string | null;
  subtitle?: string | null;
  artist?: string | null;
  frameTone: string;
  manaCost?: string | null;
  rarity?: "common" | "uncommon" | "rare" | "mythic" | null;
  image?: DisplayCardImage | null;
  metaLine?: string | null;
  footerCode: string;
  footerCredit: string;
  collectorNumber: string;
  footerStat?: string | null;
  healthBar?: DisplayCardHealthBar | null;
  energyBar?: DisplayCardEnergyBar | null;
  counterPills?: DisplayCardCounterPill[];
  statusLabel?: string | null;
  statusTone?: "draft" | "templating" | "balanced" | "approved";
  stats: DisplayCardStat[];
  textBlocks: DisplayCardTextBlock[];
  saga?: {
    loreCounter?: number;
    finalChapter?: number;
    chapters: DisplayCardSagaChapter[];
  } | null;
  badges: string[];
  actions: DisplayCardAction[];
  stateFlags: string[];
};

export type DisplayCardModel = DisplayCardModelBase;

export function buildDisplayCardModel(model: DisplayCardModelBase): DisplayCardModel {
  return model;
}
