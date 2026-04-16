import type { AbilityCostDisplayPart } from "../../../../src/cloud-arena/index.js";

export type DisplayCardVariant = "mtg" | "player" | "enemy" | "permanent";

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

export type DisplayCardTextBlock = {
  kind: "rules" | "flavor" | "intent" | "passive" | "meta";
  text: string;
};

export type DisplayCardAction = {
  id: string;
  label: string;
  disabled?: boolean;
  emphasis?: "primary" | "neutral";
  costs?: AbilityCostDisplayPart[];
  onSelect?: () => void;
};

export type DisplayCardModel = {
  variant: DisplayCardVariant;
  name: string;
  title?: string | null;
  subtitle?: string | null;
  frameTone: string;
  manaCost?: string | null;
  image?: DisplayCardImage | null;
  metaLine?: string | null;
  footerCode: string;
  footerCredit: string;
  collectorNumber: string;
  footerStat?: string | null;
  healthBar?: {
    current: number;
    max: number;
    label?: string;
  } | null;
  energyBar?: {
    current: number;
    max: number;
    label?: string;
  } | null;
  statusLabel?: string | null;
  statusTone?: "draft" | "templating" | "balanced" | "approved";
  stats: DisplayCardStat[];
  textBlocks: DisplayCardTextBlock[];
  badges: string[];
  actions: DisplayCardAction[];
  stateFlags: string[];
};
