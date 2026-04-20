import type { ReactElement } from "react";
import { Fragment } from "react";

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
import { getCloudArenaRuntimeConfig } from "../lib/runtime-config.js";

import type { DisplayCardModel } from "../lib/display-card.js";
import { getDisplayCardSection } from "../lib/display-card.js";
import { AbilityCostChip } from "./ability-cost-chip.js";

type DisplayCardProps = {
  model: DisplayCardModel;
  className?: string;
};

function formatCardDisplayName(name: string, title: string | null | undefined): string {
  return title ? `${name}, ${title}` : name;
}

function clampHealthPercent(current: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (current / max) * 100));
}

function clampMeterCount(current: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(max, current));
}

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

  const { cloudArcanumApiBaseUrl } = getCloudArenaRuntimeConfig();
  return `${cloudArcanumApiBaseUrl.replace(/\/$/, "")}${url}`;
}

function renderDisplayImage(model: DisplayCardModel): ReactElement {
  const image = getDisplayCardSection(model, "art")?.image ?? model.image ?? null;
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
        aria-label={image?.fallbackLabel ?? `${model.name} preview`}
      >
        <strong>{image?.fallbackLabel ?? "Preview pending"}</strong>
        <span>{model.subtitle ?? model.metaLine ?? model.variant}</span>
      </div>
    </div>
  );
}

export function DisplayCard({ model, className }: DisplayCardProps): ReactElement {
  const identitySection = getDisplayCardSection(model, "identity");
  const summarySection = getDisplayCardSection(model, "summary");
  const combatSection = getDisplayCardSection(model, "combat");
  const statsSection = getDisplayCardSection(model, "stats");
  const statusSection = getDisplayCardSection(model, "status");
  const actionsSection = getDisplayCardSection(model, "actions");
  const metadataSection = getDisplayCardSection(model, "metadata");
  const displayName = formatCardDisplayName(
    identitySection?.name ?? model.name,
    identitySection?.title ?? model.title,
  );
  const healthBar = combatSection?.healthBar ?? model.healthBar ?? null;
  const energyBar = combatSection?.energyBar ?? model.energyBar ?? null;
  const footerStat = combatSection?.footerStat ?? model.footerStat ?? null;
  const textBlocks = summarySection?.textBlocks ?? model.textBlocks;
  const stats = statsSection?.stats ?? model.stats;
  const statusLabel = statusSection?.statusLabel ?? model.statusLabel ?? null;
  const statusTone = statusSection?.statusTone ?? model.statusTone;
  const badges = statusSection?.badges ?? model.badges;
  const stateFlags = statusSection?.stateFlags ?? model.stateFlags;
  const actions = actionsSection?.actions ?? model.actions;
  const healthPercent = healthBar
    ? clampHealthPercent(healthBar.current, healthBar.max)
    : 0;
  const energySegments = energyBar
    ? clampMeterCount(energyBar.current, energyBar.max)
    : 0;
  const blockStat = healthBar
    ? stats.find((stat) => stat.label.toLowerCase() === "block") ?? null
    : null;
  const intentBlock =
    model.variant === "enemy"
      ? textBlocks.find((block) => block.kind === "intent") ?? null
      : null;
  const visibleTextBlocks = intentBlock
    ? textBlocks.filter((block) => block !== intentBlock)
    : textBlocks;
  const visibleStats = blockStat
    ? stats.filter((stat) => stat !== blockStat)
    : stats;
  const usesSideCombatPanel = model.variant === "player" || model.variant === "enemy";
  const isPermanentCard = model.variant === "permanent";
  const isExhaustedPermanent = isPermanentCard && stateFlags.includes("spent");
  const isDefendingPermanent = isPermanentCard && stateFlags.includes("defending");
  const cardFace = (
    <article className="card-face">
      <header className="card-face-header">
        <div className="card-face-title-wrap">
          <h3>{displayName}</h3>
        </div>
        <div className="card-face-mana-wrap">{renderManaCost(identitySection?.manaCost ?? model.manaCost)}</div>
      </header>

      {renderDisplayImage(model)}

      <div className="card-face-typeline">
        <span>{identitySection?.subtitle ?? model.subtitle ?? "Card"}</span>
        <span className="card-face-rarity-badge is-na">{model.variant.toUpperCase()}</span>
      </div>

      <div className="card-face-rules">
        {visibleTextBlocks.map((block, index) => (
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
            <span>{metadataSection?.footerCode ?? model.footerCode}</span>
          </div>
          {footerStat ? (
            <div className="card-face-footer-stats">
              <div className="card-face-stats-box">
                <strong>{footerStat}</strong>
              </div>
            </div>
          ) : null}
        </div>
        <div className="card-face-footer-bottom">
          <div className="card-face-footer-artist">{metadataSection?.footerCredit ?? model.footerCredit}</div>
          <div className="card-face-collector-number">{metadataSection?.collectorNumber ?? model.collectorNumber}</div>
        </div>
      </footer>
    </article>
  );

  const isCardButton = actions.length === 1 && model.variant === "mtg";
  const singleAction = isCardButton ? actions[0] : null;
  const isTappedPermanent = isPermanentCard && stateFlags.includes("tapped");
  const faceContent =
    isCardButton && singleAction ? (
      <button
        type="button"
        className="card-face-link"
        disabled={singleAction.disabled}
        onClick={() => singleAction.onSelect?.()}
      >
        {cardFace}
      </button>
    ) : (
      <div className="display-card-static-face">{cardFace}</div>
    );
  const combatPanel = healthBar ? (
    <div
      className={[
        "display-card-health-panel",
        isDefendingPermanent ? "is-defending" : null,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="display-card-health-strip">
        {blockStat ? (
          <div className="display-card-block-pill" aria-label={`${model.name} block ${blockStat.value}`}>
            <span className="display-card-block-icon" aria-hidden="true">
              <span className="display-card-block-value">{blockStat.value}</span>
            </span>
          </div>
        ) : null}
        <div className="display-card-health-meter">
          <div className="display-card-health-row">
            <span>Health</span>
            <strong>{healthBar.label ?? `${healthBar.current}/${healthBar.max}`}</strong>
          </div>
          <div
            className="trace-viewer-health-bar"
            role="progressbar"
            aria-label={`${model.name} health`}
            aria-valuemin={0}
            aria-valuemax={healthBar.max}
            aria-valuenow={healthBar.current}
          >
            <div
              className="trace-viewer-health-bar-fill"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>
      </div>
      {energyBar ? (
        <div className="display-card-energy-panel">
          <div className="display-card-health-row">
            <span>Energy</span>
            <strong>{energyBar.label ?? `${energyBar.current}/${energyBar.max}`}</strong>
          </div>
          <div
            className="display-card-energy-bar"
            role="meter"
            aria-label={`${model.name} energy`}
            aria-valuemin={0}
            aria-valuemax={energyBar.max}
            aria-valuenow={energyBar.current}
            style={{
              gridTemplateColumns: `repeat(${Math.max(1, energyBar.max)}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: Math.max(0, energyBar.max) }, (_, index) => (
              <span
                key={`energy-${index}`}
                className={[
                  "display-card-energy-segment",
                  index < energySegments ? "is-filled" : "is-empty",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      ) : null}
      {intentBlock ? (
        <div className="display-card-intent-banner" aria-label={`${model.name} intent`}>
          {intentBlock.text}
        </div>
      ) : null}
    </div>
  ) : null;
  const lowerContent = (
    <>
      {statusLabel || actions.length > 0 || badges.length > 0 ? (
        <div className="card-face-meta-row">
          {statusLabel ? (
            <span className={`card-face-status ${statusTone ?? ""}`.trim()}>
              {statusLabel}
            </span>
          ) : (
            <span />
          )}
          {actions.length > 0 && !isCardButton ? (
            <div className="display-card-actions-inline">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  className="card-face-preview-button"
                  disabled={action.disabled}
                  onClick={() => action.onSelect?.()}
                >
                  <span className="card-face-preview-button-label">{action.label}</span>
                  <AbilityCostChip costs={action.costs ?? [{ type: "free" }]} className="card-face-preview-button-cost" />
                </button>
              ))}
            </div>
          ) : badges.length > 0 ? (
            <div className="display-card-badges-inline">
              {badges.map((badge) => (
                <span key={badge} className="card-face-status">
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {visibleStats.length > 0 ? (
        <div className="trace-viewer-stat-row display-card-stat-row">
          {visibleStats.map((stat) => (
            <div key={`${stat.label}-${stat.value}`} className="trace-viewer-stat-chip">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className={[
        `card-face-tile tone-${model.frameTone} display-card-shell display-card-${model.variant}`,
        isExhaustedPermanent ? "is-exhausted" : null,
        isTappedPermanent ? "is-tapped" : null,
        className ?? null,
      ]
        .filter(Boolean)
        .join(" ")}
      data-variant={model.variant}
    >
      {usesSideCombatPanel && combatPanel ? (
        <div className={`display-card-character-layout display-card-character-layout-${model.variant}`}>
          {model.variant === "enemy" ? combatPanel : null}
          <div className="display-card-main-column">
            {faceContent}
            {lowerContent}
          </div>
          {model.variant === "player" ? combatPanel : null}
        </div>
      ) : (
        <>
          {faceContent}
          {lowerContent}
          {combatPanel}
        </>
      )}
    </div>
  );
}
