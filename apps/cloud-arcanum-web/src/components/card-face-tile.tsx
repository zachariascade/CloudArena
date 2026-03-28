import { Fragment, useEffect, useId, useRef, useState } from "react";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";

import type { CardListItem } from "../../../../src/cloud-arcanum/api-contract.js";
import type { CardStatus } from "../../../../src/domain/index.js";

export type RulesPreviewLine = {
  kind: "oracle" | "flavor";
  text: string;
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

function buildCardFaceStats(card: CardListItem): { value: string } {
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

  return {
    value: "?/?",
  };
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

function renderManaCost(manaCost: string | null): ReactElement {
  const tokens = parseManaCostTokens(manaCost);

  if (tokens.length === 0) {
    return <span className="card-face-mana">TBD</span>;
  }

  return (
    <span className="card-face-mana-group" aria-label={manaCost ?? "Mana cost pending"}>
      {tokens.map((token) => (
        <span key={token} className={`card-face-mana card-face-mana-token token-${token.toLowerCase()}`}>
          {token}
        </span>
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
        return (
          <span
            key={`${line}-${index}`}
            className={`card-face-inline-mana token-${token.toLowerCase()}`}
          >
            {token}
          </span>
        );
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
  if (card.colors.length === 0) {
    return "colorless";
  }

  if (card.colors.length > 1) {
    return "multicolor";
  }

  switch (card.colors[0]) {
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

export function CardFaceTile({ card }: { card: CardListItem }): ReactElement {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previewButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasPreviewOpenRef = useRef(false);
  const dialogId = useId();
  const rulesPreview = buildRulesPreview(card);
  const stats = buildCardFaceStats(card);
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
        setIsPreviewOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPreviewOpen]);

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
          <h3>{card.name}</h3>
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
            {card.rarity ? "" : "N/A"}
          </span>
        </div>

      <div className="card-face-rules">
        {rulesPreview.map((line) => (
          <p
            key={`${line.kind}:${line.text}`}
            className={`card-face-rules-line ${line.kind === "flavor" ? "is-flavor" : ""}`.trim()}
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
          <div className="card-face-footer-stats">
            <div className="card-face-stats-box">
              <strong>{stats.value}</strong>
            </div>
          </div>
        </div>
        <div className="card-face-footer-bottom">
          <div className="card-face-footer-artist">{card.artist ?? "TBD"}</div>
          <div className="card-face-collector-number">{formatCollectorNumber(card.id)}</div>
        </div>
      </footer>
    </article>
  );

  return (
    <>
      <div className={`card-face-tile tone-${frameTone} ${stateClasses}`.trim()}>
        <button
          aria-label={`Open ${card.name}`}
          aria-controls={dialogId}
          aria-expanded={isPreviewOpen}
          aria-haspopup="dialog"
          className="card-face-link"
          onClick={() => setIsPreviewOpen(true)}
          ref={previewButtonRef}
          type="button"
        >
          {cardFace}
        </button>

        <div className="card-face-meta-row">
          <span className={`card-face-status ${toStatusTone(card.status)}`}>
            {card.status}
          </span>
          <Link className="card-face-preview-button" to={`/cards/${card.id}`}>
            Details
          </Link>
        </div>
      </div>

      {isPreviewOpen ? (
        <div
          className="card-preview-modal-backdrop"
          onClick={() => setIsPreviewOpen(false)}
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
            <button
              aria-label="Close preview"
              className="card-preview-close"
              ref={closeButtonRef}
              onClick={() => setIsPreviewOpen(false)}
              type="button"
            >
              Close
            </button>
            <div className={`card-preview-shell tone-${frameTone}`}>
              <div className="card-face card-face-preview">
                {cardFace.props.children}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
