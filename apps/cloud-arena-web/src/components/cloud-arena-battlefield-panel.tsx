import type { ReactElement } from "react";
import type { FocusEvent, MouseEvent } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import { AbilityCostChip } from "./ability-cost-chip.js";
import { DisplayCard } from "./display-card.js";
import {
  cardDefinitions,
  type BattleAction,
} from "../../../../src/cloud-arena/index.js";

type CloudArenaBattlefieldPanelProps = {
  zoneKeyPrefix?: "battlefield" | "enemy_battlefield";
  battlefield: CloudArenaBattleViewModel["battlefield"];
  legalActions: CloudArenaBattleViewModel["legalActions"];
  getInspectableModel: (key: string) => Parameters<typeof DisplayCard>[0]["model"];
  getPermanentMenuActions: (
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  ) => Array<{
    action: string;
    label: string;
    costs: Array<{ type: "free" } | { type: "energy"; amount: number } | { type: "tap" }>;
    disabled?: boolean;
    onSelect?: () => void;
  }>;
  getPermanentCounterEntries: (
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  ) => Array<{ counter: string; amount: number }>;
  bindInspectorInteractions: (key: string) => {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (event: MouseEvent<HTMLElement>) => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
    onClick: () => void;
  };
  onOpenDetails: (key: string, event: MouseEvent<HTMLElement>) => void;
  openPermanentMenuId?: string | null;
  onPermanentMenuToggle?: (permanentId: string) => void;
  onPermanentMenuClose?: () => void;
  onTargetPermanentSelect?: (action: BattleAction) => void;
};

type PermanentIntentBubble =
  | {
      tone: "attack";
      label: string;
      value: string;
      detail?: string | null;
    }
  | {
      tone: "spawn";
      label: string;
      detail?: string | null;
    }
  | {
      tone: "block" | "power" | "neutral";
      label: string;
      detail?: string | null;
    };

function titleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function getSpawnName(spawnCardId: string): string {
  return cardDefinitions[spawnCardId]?.name ?? titleCase(spawnCardId);
}

function parsePermanentIntentLabel(label: string): PermanentIntentBubble {
  const [primaryLabel, ...details] = label.split(/\s+\+\s+/);
  const detail = details.length > 0 ? details.join(" + ") : null;
  const attackMatch = primaryLabel.match(/^attack\s+(\d+)(?:\s+x(\d+))?(?:\s+trample)?$/i);

  if (attackMatch) {
    const amount = attackMatch[1];
    const attackTimes = attackMatch[2] ? `x${attackMatch[2]}` : null;

    return {
      tone: "attack",
      label: "Attack",
      value: amount,
      detail: attackTimes ?? detail,
    };
  }

  const spawnMatch = primaryLabel.match(/^spawn\s+(.+?)(?:\s+x(\d+))?$/i);

  if (spawnMatch) {
    const spawnCardId = spawnMatch[1].trim();
    const spawnCount = spawnMatch[2] ? Number(spawnMatch[2]) : 1;
    const spawnName = getSpawnName(spawnCardId);

    return {
      tone: "spawn",
      label: `Spawn ${spawnName}${spawnCount > 1 ? ` x${spawnCount}` : ""}`,
      detail: detail ? titleCase(detail) : null,
    };
  }

  const blockMatch = primaryLabel.match(/^block\s+(\d+)(?:\s+x(\d+))?$/i);

  if (blockMatch) {
    const amount = blockMatch[1];
    const blockTimes = blockMatch[2] ? `x${blockMatch[2]}` : null;

    return {
      tone: "block",
      label: `Block ${amount}`,
      detail: blockTimes ?? detail,
    };
  }

  const powerMatch = primaryLabel.match(/^([+-]?\d+)\s+power$/i);

  if (powerMatch) {
    const amount = Number(powerMatch[1]);

    return {
      tone: "power",
      label: `${amount > 0 ? "+" : ""}${amount} Power`,
      detail: detail ? titleCase(detail) : null,
    };
  }

  return {
    tone: "neutral",
    label: titleCase(primaryLabel),
    detail: detail ? titleCase(detail) : null,
  };
}

function getPermanentIntentBubble(
  permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
): PermanentIntentBubble | null {
  const label = permanent.intentLabel?.trim() ?? permanent.intentQueueLabels?.[0]?.trim() ?? null;

  if (label) {
    return parsePermanentIntentLabel(label);
  }

  if (permanent.isCreature && permanent.power > 0) {
    return {
      tone: "attack",
      label: "Attack",
      value: String(permanent.power),
      detail: null,
    };
  }

  return null;
}

export function CloudArenaBattlefieldPanel({
  zoneKeyPrefix = "battlefield",
  battlefield,
  legalActions,
  getInspectableModel,
  getPermanentMenuActions,
  getPermanentCounterEntries,
  bindInspectorInteractions,
  onOpenDetails,
  openPermanentMenuId = null,
  onPermanentMenuToggle,
  onPermanentMenuClose,
  onTargetPermanentSelect,
}: CloudArenaBattlefieldPanelProps): ReactElement {
  return (
    <section className="panel trace-viewer-panel trace-viewer-battlefield-panel cloud-arena-battlefield-panel">
      <div className="trace-viewer-board-scroll" aria-label="Battlefield">
        <div className="trace-viewer-card-grid trace-viewer-board-grid">
          {battlefield.map((slot, index) => (
            slot ? (
              (() => {
                const menuActions = getPermanentMenuActions(slot);
                const permanentCardModel = getInspectableModel(`${zoneKeyPrefix}:${slot.instanceId}`);
                const targetAction = legalActions.find(
                  (entry) =>
                    entry.action.type === "choose_target" &&
                    entry.action.targetPermanentId === slot.instanceId,
                );
                const isActionListOpen =
                  !targetAction && menuActions.length > 0 && openPermanentMenuId === slot.instanceId;

                return (
                  <div
                    key={`slot-${index + 1}`}
                    className="trace-viewer-battlefield-slot"
                    {...bindInspectorInteractions(`battlefield:${slot.instanceId}`)}
                  >
                    {(() => {
                      const intentBubble = getPermanentIntentBubble(slot);

                      return intentBubble ? (
                        <div
                          className={[
                            "cloud-arena-permanent-intent-bubble",
                            `is-${intentBubble.tone}`,
                          ].join(" ")}
                          aria-label={`${slot.name} intent ${intentBubble.label}${intentBubble.detail ? ` ${intentBubble.detail}` : ""}`}
                        >
                          {intentBubble.tone === "attack" ? (
                            <>
                              <span className="cloud-arena-permanent-intent-badge">
                                {intentBubble.value}
                              </span>
                              <span className="cloud-arena-permanent-intent-label">
                                {intentBubble.label}
                              </span>
                            </>
                          ) : (
                            <span className="cloud-arena-permanent-intent-label">
                              {intentBubble.label}
                            </span>
                          )}
                          {intentBubble.detail ? (
                            <span className="cloud-arena-permanent-intent-detail">
                              {intentBubble.detail}
                            </span>
                          ) : null}
                        </div>
                      ) : null;
                    })()}
                    {getPermanentCounterEntries(slot).length > 0 ? (
                      <div className="trace-viewer-counter-row" aria-label={`${slot.name} counters`}>
                        {getPermanentCounterEntries(slot).map((entry) => (
                          <span
                            key={`${slot.instanceId}-${entry.counter}`}
                            className="trace-viewer-counter-chip"
                          >
                            {entry.counter} x{entry.amount}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {isActionListOpen ? (
                      <div
                        className={[
                          "trace-viewer-battlefield-card",
                          "cloud-arena-battlefield-card",
                          "cloud-arena-permanent-action-face",
                          `tone-${permanentCardModel.frameTone}`,
                        ].join(" ")}
                        role="menu"
                        aria-label={`${slot.name} actions`}
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="cloud-arena-permanent-action-face-header">
                          <h3>{permanentCardModel.name}</h3>
                        </div>
                        <div className="cloud-arena-permanent-action-face-rules">
                          <div className="cloud-arena-permanent-action-face-list">
                            {menuActions.map((action) => (
                              <button
                                key={`${slot.instanceId}-${action.action}`}
                                type="button"
                                className="cloud-arena-permanent-menu-button"
                                role="menuitem"
                                disabled={action.disabled}
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onPermanentMenuClose?.();
                                  action.onSelect?.();
                                }}
                              >
                                <span className="cloud-arena-permanent-menu-button-label">{action.label}</span>
                                <AbilityCostChip costs={action.costs} className="cloud-arena-permanent-menu-button-cost" />
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="cloud-arena-permanent-menu-button cloud-arena-permanent-action-face-back"
                          onMouseDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation();
                            onPermanentMenuClose?.();
                          }}
                        >
                          Back
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`cloud-arena-permanent-button${targetAction ? " is-targetable" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          if (targetAction && onTargetPermanentSelect) {
                            onTargetPermanentSelect(targetAction.action);
                            return;
                          }

                          if (menuActions.length > 0) {
                            onPermanentMenuToggle?.(slot.instanceId);
                          }
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ") {
                            return;
                          }

                          event.preventDefault();

                          if (targetAction && onTargetPermanentSelect) {
                            onTargetPermanentSelect(targetAction.action);
                            return;
                          }

                          if (menuActions.length > 0) {
                            onPermanentMenuToggle?.(slot.instanceId);
                          }
                        }}
                        aria-expanded={menuActions.length > 0 ? false : undefined}
                        aria-haspopup={!targetAction && menuActions.length > 0 ? "menu" : undefined}
                      >
                        <DisplayCard
                          className="trace-viewer-battlefield-card cloud-arena-battlefield-card"
                          model={permanentCardModel}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      className="cloud-arena-card-details-button cloud-arena-battlefield-details-button"
                      onClick={(event) => onOpenDetails(`${zoneKeyPrefix}:${slot.instanceId}`, event)}
                    >
                      details
                    </button>
                  </div>
                );
              })()
            ) : (
              <article
                key={`slot-${index + 1}`}
                className="trace-viewer-card trace-viewer-card-empty trace-viewer-battlefield-card cloud-arena-empty-slot"
              >
                <strong>Slot {index + 1}</strong>
                <div className="trace-viewer-card-meta">empty</div>
              </article>
            )
          ))}
        </div>
      </div>
    </section>
  );
}
