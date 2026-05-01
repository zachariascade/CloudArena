import type { ReactElement, ReactNode } from "react";
import { Fragment, useMemo, useState } from "react";
import type { MouseEvent } from "react";

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
import { getCloudArenaRuntimeConfig } from "../lib/runtime-config.js";

import type { DisplayCardModel } from "../lib/display-card.js";
import { AbilityCostChip } from "./ability-cost-chip.js";

type DisplayCardProps = {
  model: DisplayCardModel;
  className?: string;
  healthAccessory?: ReactNode;
  detailsAction?: {
    ariaLabel?: string;
    onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  };
};

const DISPLAY_CARD_KEYWORD_GLOSSARY = {
  immediate: {
    label: "Immediate",
    description: "This effect resolves right away when the enemy card is played, before the normal end-of-turn timing.",
  },
  halt: {
    label: "Halt",
    description: "While defending, this stops damage from passing through unless the attack has trample.",
  },
  refresh: {
    label: "Refresh",
    description: "Restore this to full health at the start of each round if it survived damage.",
  },
  menace: {
    label: "Menace",
    description: "Can only be blocked by two or more defenders. A single blocker is bypassed entirely.",
  },
  pierce: {
    label: "Pierce",
    description: "Damage from this creature ignores block and is dealt directly to health.",
  },
} as const;

type DisplayCardKeywordId = keyof typeof DISPLAY_CARD_KEYWORD_GLOSSARY;

function formatCardDisplayName(name: string, title: string | null | undefined): string {
  if (!title) {
    return name;
  }

  return `${name}, ${title}`;
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

function getKeywordIdFromText(text: string): DisplayCardKeywordId | null {
  const normalized = text.trim().toLowerCase();

  return normalized in DISPLAY_CARD_KEYWORD_GLOSSARY
    ? (normalized as DisplayCardKeywordId)
    : null;
}

function collectKeywordsFromTextBlocks(textBlocks: DisplayCardModel["textBlocks"]): DisplayCardKeywordId[] {
  const keywords: DisplayCardKeywordId[] = [];

  for (const block of textBlocks) {
    const matches = block.text.match(/\*\*([^*]+)\*\*/g) ?? [];

    for (const match of matches) {
      const keywordId = getKeywordIdFromText(match.replace(/\*\*/g, ""));

      if (keywordId && !keywords.includes(keywordId)) {
        keywords.push(keywordId);
      }
    }
  }

  return keywords;
}

function renderRulesText(
  line: string,
  options: {
    onKeywordEnter: (keywordId: DisplayCardKeywordId) => void;
    onKeywordLeave: () => void;
  },
): ReactElement[] {
  return line
    .split(/(\*\*[^*]+\*\*|\{[^}]+\}|\([^)]*\))/g)
    .filter(Boolean)
    .map((segment, index) => {
      const boldMatch = segment.match(/^\*\*([^*]+)\*\*$/);
      if (boldMatch) {
        const keywordId = getKeywordIdFromText(boldMatch[1] ?? "");

        if (keywordId) {
          return (
            <span
              key={`${line}-${index}`}
              className="card-face-keyword-trigger"
              tabIndex={0}
              role="button"
              aria-label={`Show keyword help for ${DISPLAY_CARD_KEYWORD_GLOSSARY[keywordId].label}`}
              onMouseEnter={() => options.onKeywordEnter(keywordId)}
              onMouseLeave={() => options.onKeywordLeave()}
              onFocus={() => options.onKeywordEnter(keywordId)}
              onBlur={() => options.onKeywordLeave()}
            >
              <strong>{boldMatch[1]}</strong>
            </span>
          );
        }

        return (
          <strong key={`${line}-${index}`}>
            {boldMatch[1]}
          </strong>
        );
      }

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

  const { cloudArcanumApiBaseUrl, contentMode, sessionMode } = getCloudArenaRuntimeConfig();
  if (!cloudArcanumApiBaseUrl || contentMode === "local" || sessionMode === "local") {
    return `.${url}`;
  }

  return `${cloudArcanumApiBaseUrl.replace(/\/$/, "")}${url}`;
}

function renderDisplayImage(model: DisplayCardModel): ReactElement {
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
        aria-label={image?.fallbackLabel ?? `${model.name} preview`}
      >
        <strong>{image?.fallbackLabel ?? "Preview pending"}</strong>
        <span>{model.subtitle ?? model.metaLine ?? model.variant}</span>
      </div>
    </div>
  );
}

export function DisplayCard({ model, className, healthAccessory, detailsAction }: DisplayCardProps): ReactElement {
  const [activeKeywordId, setActiveKeywordId] = useState<DisplayCardKeywordId | null>(null);
  const [activeCounterLabel, setActiveCounterLabel] = useState<"Power" | "Health" | null>(null);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const displayName = formatCardDisplayName(model.name, model.title);
  const healthBar = model.healthBar ?? null;
  const energyBar = model.energyBar ?? null;
  const footerStat = model.footerStat ?? null;
  const textBlocks = model.textBlocks;
  const stats = model.stats;
  const counterPills = model.counterPills ?? [];
  const statusLabel = model.statusLabel ?? null;
  const statusTone = model.statusTone;
  const badges = model.badges;
  const stateFlags = model.stateFlags;
  const actions = model.actions;
  const saga = model.saga ?? null;
  const glossaryKeywordIds = useMemo(() => collectKeywordsFromTextBlocks(textBlocks), [textBlocks]);
  const defaultKeywordId = glossaryKeywordIds[0] ?? null;
  const visibleKeywordId = activeKeywordId ?? (isCardHovered ? defaultKeywordId : null);
  const healthPercent = healthBar
    ? clampHealthPercent(healthBar.current, healthBar.max)
    : 0;
  const energyLabel = energyBar ? (energyBar.label ?? `${energyBar.current}/${energyBar.max}`) : null;
  const blockStat = healthBar
    ? stats.find((stat) => stat.label.toLowerCase() === "block") ?? null
    : null;
  const visibleStats = blockStat
    ? stats.filter((stat) => stat !== blockStat)
    : stats;
  const usesSideCombatPanel = model.variant === "player";
  const isPermanentCard = model.variant === "permanent" || model.variant === "saga";
  const isSagaCard = model.variant === "saga";
  const isEnemyCard = model.variant === "enemy";
  const isEnemyControlledCard = isPermanentCard && stateFlags.includes("enemy-controlled");
  const showsEnemyBlockInline = Boolean(blockStat) && (isEnemyCard || isEnemyControlledCard);
  const isTopCombatCard = model.variant === "enemy" || isPermanentCard;
  const isExhaustedPermanent = isPermanentCard && stateFlags.includes("spent");
  const isDefendingPermanent = isPermanentCard && stateFlags.includes("defending");
  const isTargetablePlayer = stateFlags.includes("targetable-player");
  const isTargetableEnemy = stateFlags.includes("targetable-enemy");
  const isHealthDropping = stateFlags.includes("health-dropping");
  const isHealthRising = stateFlags.includes("health-rising");
  const isInspectorCurrent = stateFlags.includes("inspector-current");
  const blockValue = blockStat?.value ?? "0";
  const formatCounterValue = (value: number): string => (value > 0 ? `+${value}` : String(value));
  const formatCounterTooltip = (label: "Power" | "Health", value: number): string =>
    `${label} counter ${formatCounterValue(value)}`;
  const counterPanelLabel = counterPills.length > 0
    ? `${model.name} counters: ${counterPills.map((counter) => `${counter.label} counter ${formatCounterValue(counter.value)}`).join(", ")}`
    : null;
  const getCounterTone = (label: "Power" | "Health", value: number): string => {
    if (value < 0) {
      return "is-negative";
    }

    return label === "Power" ? "is-power" : "is-health";
  };
  const detailsButton = detailsAction ? (
    <button
      type="button"
      className="display-card-info-button"
      aria-label={detailsAction.ariaLabel ?? `Details for ${model.name}`}
      onClick={(event) => {
        event.stopPropagation();
        detailsAction.onClick(event);
      }}
    >
      <span aria-hidden="true">i</span>
    </button>
  ) : null;
  const sagaBody = saga ? (
    <div className="card-face-saga-body">
      <div className="card-face-saga-chapters">
        {typeof saga.loreCounter === "number" && typeof saga.finalChapter === "number" ? (
          <div className="card-face-saga-lore" aria-label={`${model.name} lore ${saga.loreCounter} of ${saga.finalChapter}`}>
            <span>Lore</span>
            <strong>{saga.loreCounter}/{saga.finalChapter}</strong>
          </div>
        ) : null}
        {saga.chapters.map((chapter) => (
          <div
            key={`${chapter.chapter}-${chapter.label}`}
            className={[
              "card-face-saga-chapter",
              chapter.resolved ? "is-resolved" : null,
              chapter.active ? "is-active" : null,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="card-face-saga-marker">{chapter.label}</span>
            <p>{renderRulesText(chapter.text, {
              onKeywordEnter: setActiveKeywordId,
              onKeywordLeave: () => setActiveKeywordId(null),
            })}</p>
          </div>
        ))}
      </div>
      <div className="card-face-saga-art-wrap">
        {renderDisplayImage(model)}
      </div>
    </div>
  ) : null;
  const typeLine = (
    <div className="card-face-typeline">
      <span>{model.subtitle ?? "Card"}</span>
      {model.rarity ? (
        <span
          aria-label={`Rarity: ${model.rarity}`}
          className={`card-face-rarity-badge is-${model.rarity}`}
          title={model.rarity}
        >
          <span
            aria-hidden="true"
            className="card-face-rarity-badge-mark"
            style={{
              WebkitMaskImage: `url(${rarityExpansionSymbol})`,
              maskImage: `url(${rarityExpansionSymbol})`,
            }}
          />
        </span>
      ) : (
        <span className="card-face-rarity-badge is-na">{model.variant.toUpperCase()}</span>
      )}
    </div>
  );
  const cardFace = (
    <article className="card-face">
      <header className="card-face-header">
        <div className="card-face-title-wrap">
          <h3>{displayName}</h3>
        </div>
        <div className="card-face-mana-wrap">{renderManaCost(model.manaCost)}</div>
      </header>

      {sagaBody ? null : renderDisplayImage(model)}

      {sagaBody ? null : typeLine}

      {sagaBody ?? (
        <div className="card-face-rules">
          {textBlocks.map((block, index) => (
            <p
              key={`${block.kind}-${index}`}
              className={[
                "card-face-rules-line",
                block.kind === "flavor" ? "is-flavor" : null,
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {renderRulesText(block.text, {
                onKeywordEnter: setActiveKeywordId,
                onKeywordLeave: () => setActiveKeywordId(null),
              })}
            </p>
          ))}
        </div>
      )}

      {sagaBody ? typeLine : null}

      <footer className="card-face-footer">
        <div className="card-face-footer-top">
          <div className="card-face-footer-printline">
            <span>{model.footerCode}</span>
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
          <div className="card-face-footer-artist">{model.artist ?? model.footerCredit}</div>
          <div className="card-face-collector-number">{model.collectorNumber}</div>
        </div>
      </footer>
    </article>
  );

  const isCardButton = actions.length === 1 && (model.variant === "mtg" || model.variant === "saga");
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
        {blockStat && !showsEnemyBlockInline ? (
          <div className="display-card-block-pill" aria-label={`${model.name} block ${blockValue}`}>
            <span
              className={`display-card-block-icon${isEnemyCard || isEnemyControlledCard ? " is-enemy" : ""}`}
              aria-hidden="true"
            >
              <span className="display-card-block-value">{blockValue}</span>
            </span>
          </div>
        ) : null}
        <div className="display-card-health-meter">
          <div className="display-card-health-row">
            <strong>{healthBar.label ?? `${healthBar.current}/${healthBar.max}`}</strong>
            {showsEnemyBlockInline ? (
              <div className="display-card-block-inline" aria-label={`${model.name} block ${blockValue}`}>
                <span
                  className={`display-card-block-icon${isEnemyCard || isEnemyControlledCard ? " is-enemy is-inline" : ""}`}
                  aria-hidden="true"
                >
                  <span className="display-card-block-value">{blockValue}</span>
                </span>
              </div>
            ) : null}
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
            {healthAccessory}
            {detailsButton}
          </div>
        </div>
      </div>
      {energyBar ? (
        <div className="display-card-energy-panel">
          <div className="display-card-energy-row">
            <span className="display-card-energy-label">Energy</span>
            <div
              className="display-card-energy-orb"
              role="meter"
              aria-label={`${model.name} energy`}
              aria-valuemin={0}
              aria-valuemax={energyBar.max}
              aria-valuenow={energyBar.current}
            >
              <strong>{energyLabel}</strong>
            </div>
          </div>
        </div>
      ) : null}
      {counterPills.length > 0 ? (
        <div
          className="display-card-counter-panel"
          aria-label={counterPanelLabel ?? `${model.name} counters`}
        >
          {counterPills.map((counter) => (
            <div key={counter.label} className="display-card-counter-orb-wrap">
              <div
                className={`display-card-counter-orb ${getCounterTone(counter.label, counter.value)}`}
                aria-label={formatCounterTooltip(counter.label, counter.value)}
                tabIndex={0}
                onMouseEnter={() => setActiveCounterLabel(counter.label)}
                onMouseLeave={() => setActiveCounterLabel((current) => (current === counter.label ? null : current))}
                onFocus={() => setActiveCounterLabel(counter.label)}
                onBlur={() => setActiveCounterLabel((current) => (current === counter.label ? null : current))}
              >
                <strong>{formatCounterValue(counter.value)}</strong>
              </div>
              <span
                className={[
                  "display-card-counter-tooltip",
                  activeCounterLabel === counter.label ? "is-visible" : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                role="note"
                aria-hidden={activeCounterLabel === counter.label ? undefined : "true"}
              >
                {formatCounterTooltip(counter.label, counter.value)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  ) : null;
  const lowerContent = (
    <>
      {statusLabel || actions.length > 0 || badges.length > 0 || (!healthBar && detailsButton) ? (
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
          ) : !healthBar && detailsButton ? (
            <div className="display-card-actions-inline">
              {detailsButton}
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
        isSagaCard ? "is-saga" : null,
        isExhaustedPermanent && !isSagaCard ? "is-exhausted" : null,
        isTappedPermanent ? "is-tapped" : null,
        isTargetablePlayer ? "is-targetable is-targetable-player" : null,
        isTargetableEnemy ? "is-targetable is-targetable-enemy" : null,
        isHealthDropping ? "is-health-dropping" : null,
        isHealthRising ? "is-health-rising" : null,
        isInspectorCurrent ? "is-inspector-current" : null,
        className ?? null,
      ]
        .filter(Boolean)
        .join(" ")}
      data-variant={model.variant}
    >
      <div className="display-card-hover-zone">
        {isTopCombatCard && combatPanel ? (
          <div className="display-card-enemy-stack">
            {combatPanel}
            <div
              className="display-card-combat-hover-zone"
              onMouseEnter={() => setIsCardHovered(true)}
              onMouseLeave={() => {
                setIsCardHovered(false);
                setActiveKeywordId(null);
              }}
            >
              {faceContent}
              {lowerContent}
            </div>
          </div>
        ) : usesSideCombatPanel && combatPanel ? (
          <div className={`display-card-character-layout display-card-character-layout-${model.variant}`}>
            <div
              className="display-card-main-column display-card-combat-hover-zone"
              onMouseEnter={() => setIsCardHovered(true)}
              onMouseLeave={() => {
                setIsCardHovered(false);
                setActiveKeywordId(null);
              }}
            >
              {faceContent}
              {lowerContent}
            </div>
            {model.variant === "player" ? combatPanel : null}
          </div>
        ) : (
          <div
            className="display-card-combat-hover-zone"
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => {
              setIsCardHovered(false);
              setActiveKeywordId(null);
            }}
          >
            {faceContent}
            {lowerContent}
          </div>
        )}
      </div>
      {glossaryKeywordIds.length > 0 ? (
        <aside
          className={`display-card-keyword-tooltip${visibleKeywordId ? " is-visible" : ""}`}
          role="note"
          aria-label="Keyword abilities"
        >
          <div className="display-card-keyword-tooltip-list">
            {glossaryKeywordIds.map((keywordId) => (
              <div
                key={keywordId}
                className={`display-card-keyword-tooltip-entry${keywordId === visibleKeywordId ? " is-active" : ""}`}
              >
                <strong>{DISPLAY_CARD_KEYWORD_GLOSSARY[keywordId].label}</strong>
                <span>{DISPLAY_CARD_KEYWORD_GLOSSARY[keywordId].description}</span>
              </div>
            ))}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
