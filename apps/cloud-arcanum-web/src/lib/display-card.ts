import type {
  CardDetail,
  CardListItem,
  ImagePreview,
} from "../../../../src/cloud-arcanum/api-contract.js";
import {
  buildDisplayCardModel,
  buildDisplayCardSections,
  getDisplayCardSection,
  type DisplayCardAction,
  type DisplayCardImage,
  type DisplayCardModel,
  type DisplayCardStat,
  type DisplayCardTextBlock,
} from "../../../../src/presentation/display-card.js";

import { buildRulesPreview } from "../components/card-face-tile.js";

export type {
  DisplayCardAction,
  DisplayCardImage,
  DisplayCardModel,
  DisplayCardStat,
  DisplayCardTextBlock,
  DisplayCardSection,
  DisplayCardVariant,
} from "../../../../src/presentation/display-card.js";

export { buildDisplayCardModel, buildDisplayCardSections, getDisplayCardSection };

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

  return buildDisplayCardModel({
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
    }).map((entry): DisplayCardTextBlock => ({
      kind: entry.kind === "oracle" ? "rules" : "flavor",
      text: entry.text,
    })),
    badges: [status],
    actions: [],
    stateFlags: [],
  });
}
