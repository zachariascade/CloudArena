import { Fragment, useEffect, useId, useRef } from "react";
import type { ReactElement } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import type { CardListItem } from "../../../../src/cloud-arcanum/api-contract.js";
import type { CardStatus } from "../../../../src/domain/index.js";
import { formatCardDisplayName } from "../../../../src/cloud-arcanum/shared-utils.js";
import mana1Symbol from "../assets/mtg-symbols/mana/1.svg";
import mana2Symbol from "../assets/mtg-symbols/mana/2.svg";
import mana3Symbol from "../assets/mtg-symbols/mana/3.svg";
import manaBSymbol from "../assets/mtg-symbols/mana/B.svg";
import manaCSymbol from "../assets/mtg-symbols/mana/C.svg";
import manaGSymbol from "../assets/mtg-symbols/mana/G.svg";
import manaRSymbol from "../assets/mtg-symbols/mana/R.svg";
import manaTSymbol from "../assets/mtg-symbols/mana/T.svg";
import manaUSymbol from "../assets/mtg-symbols/mana/U.svg";
import manaWSymbol from "../assets/mtg-symbols/mana/W.svg";
import rarityExpansionSymbol from "../assets/mtg-symbols/rarity/expansion.svg";

export type RulesPreviewLine = {
  kind: "oracle" | "flavor";
  text: string;
};

const MANA_SYMBOLS: Readonly<Record<string, string>> = {
  "1": mana1Symbol,
  "2": mana2Symbol,
  "3": mana3Symbol,
  B: manaBSymbol,
  C: manaCSymbol,
  G: manaGSymbol,
  R: manaRSymbol,
  T: manaTSymbol,
  U: manaUSymbol,
  W: manaWSymbol,
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

function buildImagePreview(card: CardListItem): ReactElement {
  if (card.image.isRenderable && card.image.publicUrl) {
    return (
      <img
        alt={card.image.alt}
        className="card-face-art-image"
        src={card.image.publicUrl}
      />
    );
  }

  const fallbackLabel =
    card.image.kind === "missing" || card.image.kind === "placeholder"
      ? "Preview pending"
      : "Image unavailable";

  return (
    <div className="card-face-art-fallback" aria-label={fallbackLabel}>
      <strong>{fallbackLabel}</strong>
      <span>{card.typeLine}</span>
    </div>
  );
}

export function buildRulesPreview(
  card: Pick<CardListItem, "oracleText" | "flavorText">,
): RulesPreviewLine[] {
  const oracleLines = card.oracleText
    ? card.oracleText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    : [];

  if (oracleLines.length > 0) {
    const previewLines: RulesPreviewLine[] = oracleLines
      .slice(0, card.flavorText ? 2 : 3)
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
    return [
      {
        kind: "flavor",
        text: card.flavorText,
      },
    ];
  }

  return [
    {
      kind: "oracle",
      text: "Rules text pending",
    },
  ];
}

function buildCardFaceStats(card: CardListItem): { value: string } | null {
  if (card.power !== null && card.toughness !== null) {
    return {
      value: `${card.power}/${card.toughness}`,
    };
  }

  if (card.loyalty !== null) {
    return {
      value: card.loyalty,
    };
  }

  if (card.defense !== null) {
    return {
      value: card.defense,
    };
  }

  return null;
}

function formatCardRarity(rarity: CardListItem["rarity"]): string {
  return rarity ? rarity[0].toUpperCase() + rarity.slice(1) : "N/A";
}

function toRarityClassName(rarity: CardListItem["rarity"]): string {
  switch (rarity) {
    case "common":
      return "is-common";
    case "uncommon":
      return "is-uncommon";
    case "rare":
      return "is-rare";
    case "mythic":
      return "is-mythic";
    default:
      return "is-na";
  }
}

function formatCollectorNumber(cardId: string): string {
  const match = cardId.match(/^card_(\d+)/);
  return match ? match[1] : cardId.replace(/^card_/, "");
}

function parseManaCostTokens(manaCost: string | null): string[] {
  if (!manaCost) {
    return [];
  }

  const matches = manaCost.match(/\{([^}]+)\}/g);
  if (!matches) {
    return [manaCost];
  }

  return matches.map((token) => token.slice(1, -1));
}

function normalizeManaToken(token: string): string {
  return token.trim().toUpperCase();
}

function getManaSymbolSrc(token: string): string | null {
  return MANA_SYMBOLS[normalizeManaToken(token)] ?? null;
}

function renderManaSymbol(token: string, className: string): ReactElement {
  const normalizedToken = normalizeManaToken(token);
  const symbolSrc = getManaSymbolSrc(normalizedToken);

  if (!symbolSrc) {
    return <span className={className}>{normalizedToken}</span>;
  }

  return (
    <span aria-hidden="true" className={className}>
      <img alt="" draggable="false" src={symbolSrc} />
    </span>
  );
}

function renderManaCost(manaCost: string | null): ReactElement {
  const tokens = parseManaCostTokens(manaCost);

  if (tokens.length === 0) {
    return <span className="card-face-mana">TBD</span>;
  }

  return (
    <span className="card-face-mana-group" aria-label={manaCost ?? "Mana cost pending"}>
      {tokens.map((token, index) => (
        <Fragment key={`${token}-${index}`}>
          {renderManaSymbol(token, "card-face-mana card-face-mana-token")}
        </Fragment>
      ))}
    </span>
  );
}

function renderRulesText(line: string): ReactElement[] {
  return line
    .split(/(\{[^}]+\}|\([^)]*\))/g)
    .filter(Boolean)
    .map((segment, index) => {
      const tokenMatch = segment.match(/^\{([^}]+)\}$/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        return <Fragment key={`${line}-${index}`}>{renderManaSymbol(token, "card-face-inline-mana")}</Fragment>;
      }

      if (segment.startsWith("(") && segment.endsWith(")")) {
        return (
          <span key={`${line}-${index}`} className="card-face-reminder-text">
            {segment}
          </span>
        );
      }

      return <Fragment key={`${line}-${index}`}>{segment}</Fragment>;
    });
}

function buildFrameTone(card: CardListItem): string {
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

type CardFaceTileProps = {
  card: CardListItem;
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
  const rulesPreview = buildRulesPreview(card);
  const stats = buildCardFaceStats(card);
  const hasFlavorDivider =
    rulesPreview.some((line) => line.kind === "oracle") &&
    rulesPreview.some((line) => line.kind === "flavor");
  const displayName = formatCardDisplayName(card.name, card.title);
  const frameTone = buildFrameTone(card);
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

  const cardFace = (
    <article className="card-face">
      <header className="card-face-header">
        <div className="card-face-title-wrap">
          <h3>{displayName}</h3>
        </div>
        <div className="card-face-mana-wrap">
          {renderManaCost(card.manaCost)}
        </div>
      </header>

      <div className="card-face-art">
        {buildImagePreview(card)}
      </div>

        <div className="card-face-typeline">
          <span>{card.typeLine}</span>
          <span
            aria-label={`Rarity: ${formatCardRarity(card.rarity)}`}
            className={`card-face-rarity-badge ${toRarityClassName(card.rarity)}`}
            title={formatCardRarity(card.rarity)}
          >
            {card.rarity ? (
              <span
                aria-hidden="true"
                className="card-face-rarity-badge-mark"
                style={{
                  WebkitMaskImage: `url(${rarityExpansionSymbol})`,
                  maskImage: `url(${rarityExpansionSymbol})`,
                }}
              />
            ) : (
              "N/A"
            )}
          </span>
        </div>

      <div className="card-face-rules">
        {rulesPreview.map((line) => (
          <p
            key={`${line.kind}:${line.text}`}
            className={[
              "card-face-rules-line",
              line.kind === "flavor" ? "is-flavor" : null,
              line.kind === "flavor" && hasFlavorDivider ? "has-flavor-divider" : null,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {renderRulesText(line.text)}
          </p>
        ))}
      </div>

      <footer className="card-face-footer">
        <div className="card-face-footer-top">
          <div className="card-face-footer-printline">
            <span>{card.setCode ?? card.set.name}</span>
          </div>
          {stats ? (
            <div className="card-face-footer-stats">
              <div className="card-face-stats-box">
                <strong>{stats.value}</strong>
              </div>
            </div>
          ) : null}
        </div>
        <div className="card-face-footer-bottom">
          <div className="card-face-footer-artist">
            {card.image.artist ?? card.artist ?? "TBD"}
          </div>
          <div className="card-face-collector-number">{formatCollectorNumber(card.id)}</div>
        </div>
      </footer>
    </article>
  );

  const previewModal = isPreviewOpen ? (
      <div
        className="card-preview-modal-backdrop"
        onClick={onClosePreview}
        role="presentation"
      >
      <div
        id={dialogId}
        aria-label={`${displayName} preview`}
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
          <div className={`card-preview-shell tone-${frameTone}`}>
            <div className="card-face card-face-preview">
              {cardFace.props.children}
            </div>
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
      <div className={`card-face-tile tone-${frameTone} ${stateClasses}`.trim()}>
        <button
          aria-label={`Open ${displayName}`}
          aria-controls={dialogId}
          aria-expanded={isPreviewOpen}
          aria-haspopup="dialog"
          className="card-face-link"
          onClick={onOpenPreview}
          ref={previewButtonRef}
          type="button"
        >
          {cardFace}
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
