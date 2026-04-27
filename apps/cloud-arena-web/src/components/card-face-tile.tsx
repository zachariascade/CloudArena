import { useEffect, useId, useRef } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import type { CardStatus } from "../../../../src/domain/index.js";

import { DisplayCard } from "./display-card.js";
import { buildDisplayCardModel, type DisplayCardModel } from "../lib/display-card.js";

export type RulesPreviewLine = {
  kind: "oracle" | "flavor";
  text: string;
};

type CardFaceTileCard = {
  id: string;
  name: string;
  title: string | null;
  status: CardStatus;
  typeLine: string;
  manaCost: string | null;
  colors: readonly string[];
  rarity: "common" | "uncommon" | "rare" | "mythic" | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  defense: string | null;
  oracleText: string | null;
  flavorText: string | null;
  artist: string | null;
  set: {
    name: string;
  };
  setCode: string | null;
  draft: {
    hasUnresolvedMechanics: boolean;
    isDraftLike: boolean;
  };
  validation: {
    hasErrors: boolean;
  };
  image: {
    alt: string;
    artist: string | null;
    fellBack: boolean;
    isRenderable: boolean;
    kind: string;
    publicUrl: string | null;
  };
};

function toStatusTone(status: CardStatus): string {
  switch (status) {
    case "approved":
      return "approved";
    case "balanced":
      return "balanced";
    case "templating":
      return "templating";
    case "draft":
    default:
      return "draft";
  }
}

function formatCollectorNumber(cardId: string): string {
  const match = cardId.match(/^card_(\d+)/);
  return match ? match[1] : cardId.replace(/^card_/, "");
}

function buildFrameTone(card: CardFaceTileCard): string {
  const coloredCardColors = card.colors.filter(
    (color): color is "W" | "U" | "B" | "R" | "G" => color !== "C",
  );

  if (coloredCardColors.length === 0) {
    return "colorless";
  }

  if (coloredCardColors.length === 2) {
    type ColoredFrameTone = "W" | "U" | "B" | "R" | "G";

    const colorOrder: readonly ColoredFrameTone[] = ["W", "U", "B", "R", "G"];
    const toneNames: Record<ColoredFrameTone, string> = {
      W: "white",
      U: "blue",
      B: "black",
      R: "red",
      G: "green",
    };
    const sortedColors: ColoredFrameTone[] = [...coloredCardColors].sort(
      (left, right) => colorOrder.indexOf(left) - colorOrder.indexOf(right),
    );

    return `split-${toneNames[sortedColors[0]]}-${toneNames[sortedColors[1]]}`;
  }

  if (coloredCardColors.length > 1) {
    return "multicolor";
  }

  switch (coloredCardColors[0]) {
    case "W":
      return "white";
    case "U":
      return "blue";
    case "B":
      return "black";
    case "R":
      return "red";
    case "G":
      return "green";
    default:
      return "colorless";
  }
}

function buildCardFaceStats(card: CardFaceTileCard): string | null {
  if (card.power !== null && card.toughness !== null) {
    return `${card.power}/${card.toughness}`;
  }
  if (card.loyalty !== null) return card.loyalty;
  if (card.defense !== null) return card.defense;
  return null;
}

export function buildRulesPreview(
  card: Pick<CardFaceTileCard, "oracleText" | "flavorText">,
): RulesPreviewLine[] {
  const oracleLines = card.oracleText
    ? card.oracleText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    : [];

  if (oracleLines.length > 0) {
    const previewLines: RulesPreviewLine[] = oracleLines
      .slice(0, card.flavorText ? 3 : 4)
      .map((line) => ({
        kind: "oracle" as const,
        text: line,
      }));

    if (card.flavorText) {
      previewLines.push({
        kind: "flavor",
        text: card.flavorText,
      });
    }

    return previewLines;
  }

  if (card.flavorText) {
    return [{ kind: "flavor", text: card.flavorText }];
  }

  return [{ kind: "oracle", text: "Rules text pending" }];
}

function mapCardFaceTileCardToDisplayCard(card: CardFaceTileCard): DisplayCardModel {
  const rulesPreview = buildRulesPreview(card);
  const footerStat = buildCardFaceStats(card);

  return buildDisplayCardModel({
    variant: "mtg",
    name: card.name,
    title: card.title,
    subtitle: card.typeLine,
    frameTone: buildFrameTone(card),
    manaCost: card.manaCost,
    rarity: card.rarity,
    image:
      card.image.isRenderable && card.image.publicUrl
        ? {
            alt: card.image.alt,
            url: card.image.publicUrl,
            fallbackLabel: card.typeLine,
            credit: card.image.artist ?? card.artist,
          }
        : {
            alt: card.image.alt,
            url: null,
            fallbackLabel:
              card.image.kind === "missing" || card.image.kind === "placeholder"
                ? "Preview pending"
                : "Image unavailable",
            credit: card.image.artist ?? card.artist,
          },
    metaLine: null,
    footerCode: card.setCode ?? card.set.name,
    footerCredit: card.image.artist ?? card.artist ?? "TBD",
    collectorNumber: formatCollectorNumber(card.id),
    footerStat,
    healthBar: null,
    energyBar: null,
    statusLabel: null,
    statusTone: undefined,
    stats: [],
    textBlocks: rulesPreview.map((line) => ({
      kind: line.kind === "flavor" ? ("flavor" as const) : ("rules" as const),
      text: line.text,
    })),
    badges: [],
    actions: [],
    stateFlags: [],
  });
}

type CardFaceTileProps = {
  card: CardFaceTileCard;
  detailPath?: string;
  hasNextCard?: boolean;
  hasPreviousCard?: boolean;
  isPreviewOpen?: boolean;
  onClosePreview?: () => void;
  onOpenPreview?: () => void;
  onShowNextCard?: () => void;
  onShowPreviousCard?: () => void;
};

export function CardFaceTile({
  card,
  detailPath = `/cards/${card.id}`,
  hasNextCard = false,
  hasPreviousCard = false,
  isPreviewOpen = false,
  onClosePreview,
  onOpenPreview,
  onShowNextCard,
  onShowPreviousCard,
}: CardFaceTileProps): ReactElement {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previewButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasPreviewOpenRef = useRef(false);
  const dialogId = useId();

  const cardModel = mapCardFaceTileCardToDisplayCard(card);
  const stateClasses = [
    card.draft.hasUnresolvedMechanics ? "is-incomplete" : null,
    card.draft.isDraftLike ? "is-draftlike" : null,
    card.validation.hasErrors ? "has-validation-warning" : null,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!isPreviewOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClosePreview?.();
      }

      if (event.key === "ArrowLeft" && hasPreviousCard) {
        event.preventDefault();
        onShowPreviousCard?.();
      }

      if (event.key === "ArrowRight" && hasNextCard) {
        event.preventDefault();
        onShowNextCard?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasNextCard, hasPreviousCard, isPreviewOpen, onClosePreview, onShowNextCard, onShowPreviousCard]);

  useEffect(() => {
    if (isPreviewOpen) {
      closeButtonRef.current?.focus();
      wasPreviewOpenRef.current = true;
      return;
    }

    if (wasPreviewOpenRef.current) {
      previewButtonRef.current?.focus();
      wasPreviewOpenRef.current = false;
    }
  }, [isPreviewOpen]);

  const previewModal = isPreviewOpen ? (
    <div
      className="card-preview-modal-backdrop"
      onClick={onClosePreview}
      role="presentation"
    >
      <div
        id={dialogId}
        aria-label={`${card.name} preview`}
        aria-modal="true"
        className="card-preview-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="card-preview-toolbar">
          <button
            aria-label="Close preview"
            className="card-preview-close"
            ref={closeButtonRef}
            onClick={onClosePreview}
            type="button"
          >
            Close
          </button>
        </div>
        <div className="card-preview-stage">
          <button
            aria-label="Previous card"
            className="card-preview-nav card-preview-nav-left"
            disabled={!hasPreviousCard}
            onClick={onShowPreviousCard}
            type="button"
          >
            ←
          </button>
          <div className="card-preview-shell">
            <DisplayCard model={cardModel} />
          </div>
          <button
            aria-label="Next card"
            className="card-preview-nav card-preview-nav-right"
            disabled={!hasNextCard}
            onClick={onShowNextCard}
            type="button"
          >
            →
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className={`card-face-tile ${stateClasses}`.trim()}>
        <button
          aria-label={`Open ${card.name}`}
          aria-controls={dialogId}
          aria-expanded={isPreviewOpen}
          aria-haspopup="dialog"
          className="card-face-link"
          onClick={onOpenPreview}
          ref={previewButtonRef}
          type="button"
        >
          <DisplayCard model={cardModel} className={stateClasses} />
        </button>

        <div className="card-face-meta-row">
          <span className={`card-face-status ${toStatusTone(card.status)}`}>
            {card.status}
          </span>
          {card.image.fellBack ? (
            <span
              className="card-face-status draft"
              title="Using fallback art for the selected theme"
            >
              fallback art
            </span>
          ) : null}
          <Link className="card-face-preview-button" to={detailPath}>
            Details
          </Link>
        </div>
      </div>

      {previewModal && typeof document !== "undefined"
        ? createPortal(previewModal, document.body)
        : null}
    </>
  );
}
