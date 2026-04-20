import type { AbilityCostDisplayPart } from "../cloud-arena/core/activated-abilities.js";

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

export type DisplayCardSectionKind =
  | "identity"
  | "art"
  | "summary"
  | "combat"
  | "stats"
  | "status"
  | "actions"
  | "metadata";

type DisplayCardSectionBase<K extends DisplayCardSectionKind> = {
  id: K;
  kind: K;
};

export type DisplayCardIdentitySection = DisplayCardSectionBase<"identity"> & {
  name: string;
  title?: string | null;
  subtitle?: string | null;
  frameTone: string;
  manaCost?: string | null;
  metaLine?: string | null;
};

export type DisplayCardArtSection = DisplayCardSectionBase<"art"> & {
  image: DisplayCardImage | null;
};

export type DisplayCardSummarySection = DisplayCardSectionBase<"summary"> & {
  textBlocks: DisplayCardTextBlock[];
};

export type DisplayCardCombatSection = DisplayCardSectionBase<"combat"> & {
  healthBar: DisplayCardHealthBar | null;
  energyBar: DisplayCardEnergyBar | null;
  footerStat?: string | null;
};

export type DisplayCardStatsSection = DisplayCardSectionBase<"stats"> & {
  stats: DisplayCardStat[];
};

export type DisplayCardStatusSection = DisplayCardSectionBase<"status"> & {
  statusLabel?: string | null;
  statusTone?: "draft" | "templating" | "balanced" | "approved";
  badges: string[];
  stateFlags: string[];
};

export type DisplayCardActionsSection = DisplayCardSectionBase<"actions"> & {
  actions: DisplayCardAction[];
};

export type DisplayCardMetadataSection = DisplayCardSectionBase<"metadata"> & {
  footerCode: string;
  footerCredit: string;
  collectorNumber: string;
};

export type DisplayCardSection =
  | DisplayCardIdentitySection
  | DisplayCardArtSection
  | DisplayCardSummarySection
  | DisplayCardCombatSection
  | DisplayCardStatsSection
  | DisplayCardStatusSection
  | DisplayCardActionsSection
  | DisplayCardMetadataSection;

export type DisplayCardModelBase = {
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
  healthBar?: DisplayCardHealthBar | null;
  energyBar?: DisplayCardEnergyBar | null;
  statusLabel?: string | null;
  statusTone?: "draft" | "templating" | "balanced" | "approved";
  stats: DisplayCardStat[];
  textBlocks: DisplayCardTextBlock[];
  badges: string[];
  actions: DisplayCardAction[];
  stateFlags: string[];
};

export type DisplayCardModel = DisplayCardModelBase & {
  sections: DisplayCardSection[];
};

export function buildDisplayCardSections(model: DisplayCardModelBase): DisplayCardSection[] {
  return [
    {
      id: "identity",
      kind: "identity",
      name: model.name,
      title: model.title ?? null,
      subtitle: model.subtitle ?? null,
      frameTone: model.frameTone,
      manaCost: model.manaCost ?? null,
      metaLine: model.metaLine ?? null,
    },
    {
      id: "art",
      kind: "art",
      image: model.image ?? null,
    },
    {
      id: "summary",
      kind: "summary",
      textBlocks: model.textBlocks,
    },
    {
      id: "combat",
      kind: "combat",
      healthBar: model.healthBar ?? null,
      energyBar: model.energyBar ?? null,
      footerStat: model.footerStat ?? null,
    },
    {
      id: "stats",
      kind: "stats",
      stats: model.stats,
    },
    {
      id: "status",
      kind: "status",
      statusLabel: model.statusLabel ?? null,
      statusTone: model.statusTone,
      badges: model.badges,
      stateFlags: model.stateFlags,
    },
    {
      id: "actions",
      kind: "actions",
      actions: model.actions,
    },
    {
      id: "metadata",
      kind: "metadata",
      footerCode: model.footerCode,
      footerCredit: model.footerCredit,
      collectorNumber: model.collectorNumber,
    },
  ];
}

export function buildDisplayCardModel(model: DisplayCardModelBase): DisplayCardModel {
  return {
    ...model,
    sections: buildDisplayCardSections(model),
  };
}

export function getDisplayCardSection<TKind extends DisplayCardSectionKind>(
  model: Pick<DisplayCardModel, "sections">,
  kind: TKind,
): Extract<DisplayCardSection, { kind: TKind }> | null {
  return (model.sections.find((section) => section.kind === kind) ?? null) as
    | Extract<DisplayCardSection, { kind: TKind }>
    | null;
}
