import { Fragment } from "react";
import type { ReactElement } from "react";

import { formatCardDisplayName } from "../../../../src/cloud-arcanum/shared-utils.js";
import type { DisplayCardModel } from "../lib/display-card.js";
import { getCloudArcanumRuntimeConfig } from "../lib/runtime-config.js";
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

type PrintableCardFaceProps = {
  model: DisplayCardModel;
  className?: string;
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

function renderManaCost(manaCost: string | null | undefined): ReactElement | null {
  if (!manaCost) {
    return null;
  }

  const matches = manaCost.match(/\{([^}]+)\}/g);
  const tokens = matches ? matches.map((token) => token.slice(1, -1)) : [manaCost];

  return (
    <span className="card-face-mana-group" aria-label={manaCost}>
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
        return (
          <Fragment key={`${line}-${index}`}>
            {renderManaSymbol(tokenMatch[1], "card-face-inline-mana")}
          </Fragment>
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

function resolveDisplayImageUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//.test(url)) {
    return url;
  }

  if (!url.startsWith("/images/")) {
    return url;
  }

  if (typeof window === "undefined") {
    return url;
  }

  const { apiBaseUrl } = getCloudArcanumRuntimeConfig();
  return `${apiBaseUrl.replace(/\/$/, "")}${url}`;
}

function renderImage(model: DisplayCardModel): ReactElement {
  const image = model.image ?? null;
  const resolvedUrl = resolveDisplayImageUrl(image?.url);

  if (resolvedUrl) {
    return (
      <div className="card-face-art">
        <img
          alt={image?.alt ?? `${model.name} art`}
          className="card-face-art-image"
          src={resolvedUrl}
        />
      </div>
    );
  }

  return (
    <div className="card-face-art">
      <div
        className="card-face-art-fallback"
        aria-label={model.image?.fallbackLabel ?? `${model.name} preview`}
      >
        <strong>{model.image?.fallbackLabel ?? "Preview pending"}</strong>
        <span>{model.subtitle ?? model.metaLine ?? model.variant}</span>
      </div>
    </div>
  );
}

export function PrintableCardFace({
  className,
  model,
}: PrintableCardFaceProps): ReactElement {
  const displayName = formatCardDisplayName(model.name, model.title);
  const rules = model.textBlocks;

  return (
    <div
      className={`printable-card-face tone-${model.frameTone} ${className ?? ""}`.trim()}
      data-frame-tone={model.frameTone}
    >
      <article className="card-face">
        <header className="card-face-header">
          <div className="card-face-title-wrap">
            <h3>{displayName}</h3>
          </div>
          <div className="card-face-mana-wrap">{renderManaCost(model.manaCost)}</div>
        </header>

        {renderImage(model)}

        <div className="card-face-typeline">
          <span>{model.subtitle ?? "Card"}</span>
          <span className="card-face-rarity-badge is-na">{model.variant.toUpperCase()}</span>
        </div>

        <div className="card-face-rules">
          {rules.map((block, index) => (
            <p
              key={`${block.kind}-${index}`}
              className={[
                "card-face-rules-line",
                block.kind === "flavor" ? "is-flavor" : null,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {renderRulesText(block.text)}
            </p>
          ))}
        </div>

        <footer className="card-face-footer">
          <div className="card-face-footer-top">
            <div className="card-face-footer-printline">
              <span>{model.footerCode}</span>
            </div>
            {model.footerStat ? (
              <div className="card-face-footer-stats">
                <div className="card-face-stats-box">
                  <strong>{model.footerStat}</strong>
                </div>
              </div>
            ) : null}
          </div>
          <div className="card-face-footer-bottom">
            <div className="card-face-footer-artist">{model.footerCredit}</div>
            <div className="card-face-collector-number">{model.collectorNumber}</div>
          </div>
        </footer>
      </article>
    </div>
  );
}
