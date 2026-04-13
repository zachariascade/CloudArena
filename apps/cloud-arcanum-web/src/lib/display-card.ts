import type {
  CardDetail,
  CardListItem,
  ImagePreview,
} from "../../../../src/cloud-arcanum/api-contract.js";

import { buildRulesPreview } from "../components/card-face-tile.js";

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

type CloudArcanumDisplayCardInput = {
  id?: string;
  name: string;
  title: string | null;
  typeLine: string;
  manaCost: string | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  defense: string | null;
  image: ImagePreview;
  oracleText: string | null;
  flavorText: string | null;
  artist?: string | null;
  setCode?: string | null;
  colors?: string[];
  status?: CardListItem["status"];
  draft?: Pick<CardDetail["draft"], "status">;
};

function formatDisplayImage(
  image: ImagePreview,
  fallbackLabel: string,
  credit?: string | null,
): DisplayCardImage {
  return {
    alt: image.alt,
    url: image.isRenderable ? image.publicUrl : null,
    fallbackLabel:
      image.kind === "placeholder" || image.kind === "missing"
        ? fallbackLabel
        : "Image unavailable",
    credit,
  };
}

function formatDisplayCardValue(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}

export function mapCloudArcanumCardToDisplayCard(
  card: CloudArcanumDisplayCardInput,
): DisplayCardModel {
  const status = card.status ?? card.draft?.status ?? "draft";
  const frameTone =
    card.colors && card.colors.length === 1
      ? ({
          W: "white",
          U: "blue",
          B: "black",
          R: "red",
          G: "green",
          C: "colorless",
        }[card.colors[0]] ?? "colorless")
      : card.colors && card.colors.length > 1
        ? "multicolor"
        : "colorless";
  const stats: DisplayCardStat[] = [];
  const power = formatDisplayCardValue(card.power);
  const toughness = formatDisplayCardValue(card.toughness);
  const loyalty = formatDisplayCardValue(card.loyalty);
  const defense = formatDisplayCardValue(card.defense);

  if (power && toughness) {
    stats.push({
      label: "P/T",
      value: `${power}/${toughness}`,
    });
  }

  if (loyalty) {
    stats.push({
      label: "Loyalty",
      value: loyalty,
    });
  }

  if (defense) {
    stats.push({
      label: "Defense",
      value: defense,
    });
  }

  return {
    variant: "mtg",
    name: card.name,
    title: card.title,
    frameTone,
    manaCost: card.manaCost,
    subtitle: card.typeLine,
    image: formatDisplayImage(card.image, "Preview pending"),
    metaLine: card.manaCost,
    footerCode: card.setCode ?? "CARD",
    footerCredit: card.image.artist ?? card.artist ?? "TBD",
    collectorNumber: card.id?.replace(/^card_/, "") ?? "000",
    footerStat: stats[0]?.value ?? null,
    healthBar: null,
    energyBar: null,
    statusLabel: status,
    statusTone: status,
    stats,
    textBlocks: buildRulesPreview({
      oracleText: card.oracleText,
      flavorText: card.flavorText,
    }).map((entry) => ({
      kind: entry.kind === "oracle" ? "rules" : "flavor",
      text: entry.text,
    })),
    badges: [status],
    actions: [],
    stateFlags: [],
  };
}
