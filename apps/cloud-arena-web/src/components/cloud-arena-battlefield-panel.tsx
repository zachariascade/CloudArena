import type { ReactElement } from "react";
import type { FocusEvent, MouseEvent } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import type { CloudArenaBattleMotionState } from "../lib/cloud-arena-battle-motion.js";
import type { CloudArenaBattlefieldStackAttachment } from "../lib/cloud-arena-battle-attachments.js";
import { mapArenaPermanentToDisplayCard } from "../lib/display-card.js";
import { buildEnemyTelegraphPreviewCardModel } from "../lib/cloud-arena-enemy-card-preview.js";
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
  motionState: CloudArenaBattleMotionState;
  isTargeting?: boolean;
  enemyBattlefieldStackOrder?: string[];
  raisedEnemyPermanentId?: string | null;
  hiddenPermanentIds?: string[];
  stackedAttachmentsByTargetId?: Record<
    string,
    CloudArenaBattlefieldStackAttachment[]
  >;
  enemyCurrentCardId?: string | null;
  enemyLeaderDefinitionId?: string | null;
  getInspectableModel: (
    key: string,
  ) => Parameters<typeof DisplayCard>[0]["model"];
  getPermanentMenuActions: (
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  ) => Array<{
    action: string;
    label: string;
    costs: Array<
      { type: "free" } | { type: "energy"; amount: number } | { type: "tap" }
    >;
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
  onToggleEnemyBattlefieldStackOrder?: (permanentId: string) => void;
};

type PermanentIntentBubble =
  | {
      tone: "attack" | "block" | "power";
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
      tone: "debuff" | "neutral";
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
  const attackMatch = primaryLabel.match(
    /^attack\s+(\d+)(?:\s+x(\d+))?(?:\s+trample)?$/i,
  );

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

  const blockMatch = primaryLabel.match(/^(?:block|defend)\s+(\d+)(?:\s+x(\d+))?$/i);

  if (blockMatch) {
    const amount = blockMatch[1];
    const blockTimes = blockMatch[2] ? `x${blockMatch[2]}` : null;

    return {
      tone: "block",
      label: `Block ${amount}`,
      value: amount,
      detail: blockTimes ?? detail,
    };
  }

  const powerMatch = primaryLabel.match(/^(?:power\s+)?([+-]?\d+)\s+power$|^power\s+([+-]?\d+)$/i);

  if (powerMatch) {
    const amount = Number(powerMatch[1] ?? powerMatch[2]);

    return {
      tone: "power",
      label: `${amount > 0 ? "+" : ""}${amount} Power`,
      value: `${amount > 0 ? "+" : ""}${amount}`,
      detail: detail ? titleCase(detail) : null,
    };
  }

  if (/^(?:debuff|debug)$/i.test(primaryLabel)) {
    return {
      tone: "debuff",
      label: "Debuff",
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
  const label =
    permanent.intentLabel?.trim() ??
    permanent.intentQueueLabels?.[0]?.trim() ??
    null;

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

function renderPermanentIntentBubble(
  permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
): ReactElement | null {
  const intentBubble = getPermanentIntentBubble(permanent);

  if (!intentBubble) {
    return null;
  }

  return (
    <div
      className={[
        "cloud-arena-permanent-intent-bubble",
        `is-${intentBubble.tone}`,
      ].join(" ")}
      aria-label={`${permanent.name} intent ${intentBubble.label}${intentBubble.detail ? ` ${intentBubble.detail}` : ""}`}
    >
      {"value" in intentBubble ? (
        <span className="cloud-arena-permanent-intent-value">
          {intentBubble.value}
        </span>
      ) : null}
      {intentBubble.detail && /^x\d+$/i.test(intentBubble.detail) ? (
        <span className="cloud-arena-permanent-intent-detail">
          {intentBubble.detail}
        </span>
      ) : null}
    </div>
  );
}

function getStackedAttachments(
  battlefield: CloudArenaBattleViewModel["battlefield"],
  permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  extraAttachments: CloudArenaBattlefieldStackAttachment[] = [],
): CloudArenaBattlefieldStackAttachment[] {
  const attachments = [
    ...(permanent.attachments ?? [])
      .map(
        (attachmentId) =>
          battlefield.find((entry) => entry?.instanceId === attachmentId) ??
          null,
      )
      .filter(
        (attachment): attachment is NonNullable<typeof attachment> =>
          attachment !== null,
      )
      .map((attachment) => ({
        permanent: attachment,
        inspectableKey: `${attachment.controllerId === "enemy" ? "enemy_battlefield" : "battlefield"}:${attachment.instanceId}`,
      })),
    ...extraAttachments,
  ];

  return attachments.filter(
    (attachment, index) =>
      attachments.findIndex(
        (entry) =>
          entry.permanent.instanceId === attachment.permanent.instanceId,
      ) === index,
  );
}

function getPermanentMenuActionList(
  permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  getPermanentMenuActions: CloudArenaBattlefieldPanelProps["getPermanentMenuActions"],
  motionState: CloudArenaBattleMotionState,
  openPermanentMenuId: string | null,
  onPermanentMenuToggle: CloudArenaBattlefieldPanelProps["onPermanentMenuToggle"],
  onPermanentMenuClose: CloudArenaBattlefieldPanelProps["onPermanentMenuClose"],
  onTargetPermanentSelect: CloudArenaBattlefieldPanelProps["onTargetPermanentSelect"],
  getInspectableModel: CloudArenaBattlefieldPanelProps["getInspectableModel"],
  zoneKeyPrefix: "battlefield" | "enemy_battlefield",
  bindInspectorInteractions: CloudArenaBattlefieldPanelProps["bindInspectorInteractions"],
  onOpenDetails: CloudArenaBattlefieldPanelProps["onOpenDetails"],
): ReactElement {
  const menuActions = getPermanentMenuActions(permanent);
  const permanentCardModel = getInspectableModel(
    `${zoneKeyPrefix}:${permanent.instanceId}`,
  );
  const targetAction = undefined;
  const isActionListOpen =
    menuActions.length > 0 && openPermanentMenuId === permanent.instanceId;
  const isAttackAnimated = Boolean(motionState.attackIds[permanent.instanceId]);
  const isHitAnimated = Boolean(motionState.hitIds[permanent.instanceId]);

  return (
    <>
      {isActionListOpen ? (
        <div
          className={[
            "trace-viewer-battlefield-card",
            "cloud-arena-battlefield-card",
            "cloud-arena-permanent-action-face",
            `tone-${permanentCardModel.frameTone}`,
          ].join(" ")}
          role="menu"
          aria-label={`${permanent.name} actions`}
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
                  key={`${permanent.instanceId}-${action.action}`}
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
                  <span className="cloud-arena-permanent-menu-button-label">
                    {action.label}
                  </span>
                  <AbilityCostChip
                    costs={action.costs}
                    className="cloud-arena-permanent-menu-button-cost"
                  />
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
          className={`cloud-arena-permanent-button${isAttackAnimated ? " is-attacking" : ""}${isHitAnimated ? " is-hit" : ""}`}
          role="button"
          tabIndex={0}
          {...bindInspectorInteractions(
            `${zoneKeyPrefix}:${permanent.instanceId}`,
          )}
          onClick={() => {
            if (targetAction && onTargetPermanentSelect) {
              onTargetPermanentSelect(targetAction);
              return;
            }

            if (menuActions.length > 0) {
              onPermanentMenuToggle?.(permanent.instanceId);
            }
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") {
              return;
            }

            event.preventDefault();

            if (targetAction && onTargetPermanentSelect) {
              onTargetPermanentSelect(targetAction);
              return;
            }

            if (menuActions.length > 0) {
              onPermanentMenuToggle?.(permanent.instanceId);
            }
          }}
          aria-expanded={menuActions.length > 0 ? false : undefined}
          aria-haspopup={menuActions.length > 0 ? "menu" : undefined}
        >
          <DisplayCard
            className={`trace-viewer-battlefield-card cloud-arena-battlefield-card${isAttackAnimated ? " is-attacking" : ""}${isHitAnimated ? " is-hit" : ""}`}
            model={permanentCardModel}
            detailsAction={{
              onClick: (event) =>
                onOpenDetails(
                  `${zoneKeyPrefix}:${permanent.instanceId}`,
                  event,
                ),
            }}
          />
        </div>
      )}
    </>
  );
}

export function CloudArenaBattlefieldPanel({
  zoneKeyPrefix = "battlefield",
  battlefield,
  legalActions,
  motionState,
  raisedEnemyPermanentId = null,
  hiddenPermanentIds,
  stackedAttachmentsByTargetId,
  enemyCurrentCardId = null,
  enemyLeaderDefinitionId = null,
  getInspectableModel,
  getPermanentMenuActions,
  getPermanentCounterEntries,
  bindInspectorInteractions,
  onOpenDetails,
  openPermanentMenuId = null,
  onPermanentMenuToggle,
  onPermanentMenuClose,
  onTargetPermanentSelect,
  onToggleEnemyBattlefieldStackOrder,
  isTargeting = false,
  enemyBattlefieldStackOrder,
}: CloudArenaBattlefieldPanelProps): ReactElement {
  const isEnemyBattlefield = zoneKeyPrefix === "enemy_battlefield";
  const hiddenPermanentIdSet = new Set(hiddenPermanentIds ?? []);
  const renderedBattlefield = battlefield.flatMap((slot, index) =>
    slot?.attachedTo ||
    (slot ? hiddenPermanentIdSet.has(slot.instanceId) : false)
      ? []
      : [
          {
            slot,
            index,
          },
        ],
  );

  return (
    <section className="panel trace-viewer-panel trace-viewer-battlefield-panel cloud-arena-battlefield-panel">
      <div className="trace-viewer-board-scroll" aria-label="Battlefield">
        <div
          className={[
            "trace-viewer-card-grid",
            "trace-viewer-board-grid",
            isEnemyBattlefield ? "is-enemy-battlefield-grid" : null,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {renderedBattlefield.map(({ slot, index }) => {
            const slotKey = `${zoneKeyPrefix}:${index}`;
            const deathOverlay = motionState.deathOverlays[slotKey] ?? null;
            const equipmentAttachments = slot
              ? getStackedAttachments(battlefield, slot)
              : [];
            const blockerAttachments = slot
              ? (stackedAttachmentsByTargetId?.[slot.instanceId] ?? [])
              : [];
            const attachedPermanents = [
              ...equipmentAttachments,
              ...blockerAttachments,
            ];
            const activeAttachment = slot
              ? (attachedPermanents.find(
                  (attachment) =>
                    attachment.permanent.instanceId === openPermanentMenuId,
                ) ?? null)
              : null;
            const activeAttachmentIsBlocker =
              activeAttachment !== null &&
              blockerAttachments.some(
                (attachment) =>
                  attachment.permanent.instanceId ===
                  activeAttachment.permanent.instanceId,
              );
            const visibleEquipmentAttachments =
              activeAttachment && !activeAttachmentIsBlocker
                ? equipmentAttachments.filter(
                    (attachment) =>
                      attachment.permanent.instanceId !==
                      activeAttachment.permanent.instanceId,
                  )
                : equipmentAttachments;
            const visibleBlockerAttachments =
              activeAttachment && activeAttachmentIsBlocker
                ? blockerAttachments.filter(
                    (attachment) =>
                      attachment.permanent.instanceId !==
                      activeAttachment.permanent.instanceId,
                  )
                : blockerAttachments;
            const telegraphOverlayCard =
              zoneKeyPrefix === "enemy_battlefield" &&
              slot &&
              slot.controllerId === "enemy" &&
              slot.isCreature &&
              slot.power > 0 &&
              !slot.hasActedThisTurn
                ? buildEnemyTelegraphPreviewCardModel({
                    currentCardId:
                      slot.definitionId === enemyLeaderDefinitionId
                        ? enemyCurrentCardId
                        : null,
                    intentLabel: slot.intentLabel,
                    intentQueueLabels: slot.intentQueueLabels,
                    power: slot.power,
                  })
                : null;

            return (
              <div
                key={`slot-${index + 1}`}
                style={
                  isEnemyBattlefield && slot
                    ? {
                        zIndex: (() => {
                          const stackOrder = enemyBattlefieldStackOrder ?? [];
                          const stackIndex = stackOrder.indexOf(
                            slot.instanceId,
                          );

                          if (stackIndex >= 0) {
                            return stackOrder.length - stackIndex;
                          }

                          return renderedBattlefield.length - index;
                        })(),
                        width: "100%",
                      }
                    : undefined
                }
                className={[
                  "trace-viewer-battlefield-slot",
                  zoneKeyPrefix === "battlefield"
                    ? "is-player-side"
                    : "is-enemy-side",
                  slot?.instanceId && motionState.attackIds[slot.instanceId]
                    ? "is-attacking"
                    : null,
                  slot?.instanceId && motionState.hitIds[slot.instanceId]
                    ? "is-hit"
                    : null,
                  !slot && deathOverlay ? "is-emptying" : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                {...(slot
                  ? bindInspectorInteractions(`battlefield:${slot.instanceId}`)
                  : {})}
              >
                {slot ? (
                  (() => {
                    const menuActions = getPermanentMenuActions(slot);
                    const permanentCardModel = getInspectableModel(
                      `${zoneKeyPrefix}:${slot.instanceId}`,
                    );
                    const targetAction = legalActions.find(
                      (entry) =>
                        entry.action.type === "choose_target" &&
                        entry.action.targetPermanentId === slot.instanceId,
                    );
                    const targetToneClass = targetAction
                      ? slot.controllerId === "enemy"
                        ? " is-targetable-enemy"
                        : " is-targetable-player"
                      : "";
                    const isActionListOpen =
                      !targetAction &&
                      menuActions.length > 0 &&
                      openPermanentMenuId === slot.instanceId;
                    const isAttackAnimated = Boolean(
                      motionState.attackIds[slot.instanceId],
                    );
                    const isHitAnimated = Boolean(
                      motionState.hitIds[slot.instanceId],
                    );

                    const isRaised = raisedEnemyPermanentId === slot.instanceId;

                    return (
                      <>
                        <div
                          className={[
                            "cloud-arena-battlefield-piece-stack",
                            isActionListOpen ? "is-action-menu-open" : null,
                            isRaised ? "is-raised" : null,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {telegraphOverlayCard ? (
                            <div
                              className={`cloud-arena-battlefield-action-play-overlay${isRaised ? " is-interactive" : ""}`}
                              aria-hidden={!isRaised}
                              role={isRaised ? "button" : undefined}
                              tabIndex={isRaised ? 0 : undefined}
                              aria-label={
                                isRaised
                                  ? `${slot.name} attack card — click to bring to front`
                                  : undefined
                              }
                              onClick={
                                isRaised
                                  ? () =>
                                      onToggleEnemyBattlefieldStackOrder?.(
                                        slot.instanceId,
                                      )
                                  : undefined
                              }
                              onKeyDown={
                                isRaised
                                  ? (event) => {
                                      if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                      ) {
                                        event.preventDefault();
                                        onToggleEnemyBattlefieldStackOrder?.(
                                          slot.instanceId,
                                        );
                                      }
                                    }
                                  : undefined
                              }
                            >
                              <DisplayCard
                                className="trace-viewer-battlefield-card cloud-arena-battlefield-card cloud-arena-battlefield-action-play-overlay-card"
                                model={telegraphOverlayCard}
                              />
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
                                      onMouseDown={(event) =>
                                        event.stopPropagation()
                                      }
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        onPermanentMenuClose?.();
                                        action.onSelect?.();
                                      }}
                                    >
                                      <span className="cloud-arena-permanent-menu-button-label">
                                        {action.label}
                                      </span>
                                      <AbilityCostChip
                                        costs={action.costs}
                                        className="cloud-arena-permanent-menu-button-cost"
                                      />
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
                              className={`cloud-arena-permanent-button${targetToneClass}${isAttackAnimated ? " is-attacking" : ""}${isHitAnimated ? " is-hit" : ""}`}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                if (targetAction && onTargetPermanentSelect) {
                                  onTargetPermanentSelect(targetAction.action);
                                  return;
                                }

                                if (
                                  zoneKeyPrefix === "enemy_battlefield" &&
                                  !isTargeting &&
                                  onToggleEnemyBattlefieldStackOrder
                                ) {
                                  onToggleEnemyBattlefieldStackOrder(
                                    slot.instanceId,
                                  );
                                  return;
                                }

                                if (menuActions.length > 0) {
                                  onPermanentMenuToggle?.(slot.instanceId);
                                }
                              }}
                              onKeyDown={(event) => {
                                if (
                                  event.key !== "Enter" &&
                                  event.key !== " "
                                ) {
                                  return;
                                }

                                event.preventDefault();

                                if (targetAction && onTargetPermanentSelect) {
                                  onTargetPermanentSelect(targetAction.action);
                                  return;
                                }

                                if (
                                  zoneKeyPrefix === "enemy_battlefield" &&
                                  !isTargeting &&
                                  onToggleEnemyBattlefieldStackOrder
                                ) {
                                  onToggleEnemyBattlefieldStackOrder(
                                    slot.instanceId,
                                  );
                                  return;
                                }

                                if (menuActions.length > 0) {
                                  onPermanentMenuToggle?.(slot.instanceId);
                                }
                              }}
                              aria-expanded={
                                menuActions.length > 0 ? false : undefined
                              }
                              aria-haspopup={
                                !targetAction && menuActions.length > 0
                                  ? "menu"
                                  : undefined
                              }
                            >
                              <DisplayCard
                                className={`trace-viewer-battlefield-card cloud-arena-battlefield-card${isAttackAnimated ? " is-attacking" : ""}${isHitAnimated ? " is-hit" : ""}`}
                                model={permanentCardModel}
                                healthAccessory={
                                  zoneKeyPrefix === "enemy_battlefield"
                                    ? renderPermanentIntentBubble(slot)
                                    : null
                                }
                                detailsAction={{
                                  onClick: (event) =>
                                    onOpenDetails(
                                      `${zoneKeyPrefix}:${slot.instanceId}`,
                                      event,
                                    ),
                                }}
                              />
                            </div>
                          )}
                          {visibleEquipmentAttachments.length > 0 ? (
                            <div className="cloud-arena-battlefield-attachment-stack">
                              {visibleEquipmentAttachments.map(
                                (attachment, attachmentIndex) => (
                                  <div
                                    key={attachment.permanent.instanceId}
                                    className="cloud-arena-battlefield-attachment-card-shell"
                                    style={{
                                      zIndex:
                                        visibleEquipmentAttachments.length -
                                        attachmentIndex,
                                    }}
                                  >
                                    {getPermanentMenuActionList(
                                      attachment.permanent,
                                      getPermanentMenuActions,
                                      motionState,
                                      openPermanentMenuId,
                                      onPermanentMenuToggle,
                                      onPermanentMenuClose,
                                      onTargetPermanentSelect,
                                      getInspectableModel,
                                      attachment.inspectableKey.startsWith(
                                        "enemy_battlefield:",
                                      )
                                        ? "enemy_battlefield"
                                        : "battlefield",
                                      bindInspectorInteractions,
                                      onOpenDetails,
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          ) : null}
                          {visibleBlockerAttachments.length > 0 ? (
                            <div className="cloud-arena-battlefield-blocker-stack">
                              {visibleBlockerAttachments.map(
                                (attachment, attachmentIndex) => (
                                  <div
                                    key={attachment.permanent.instanceId}
                                    className="cloud-arena-battlefield-blocker-card-shell"
                                    style={{
                                      zIndex:
                                        visibleBlockerAttachments.length -
                                        attachmentIndex,
                                    }}
                                  >
                                    {getPermanentMenuActionList(
                                      attachment.permanent,
                                      getPermanentMenuActions,
                                      motionState,
                                      openPermanentMenuId,
                                      onPermanentMenuToggle,
                                      onPermanentMenuClose,
                                      onTargetPermanentSelect,
                                      getInspectableModel,
                                      attachment.inspectableKey.startsWith(
                                        "enemy_battlefield:",
                                      )
                                        ? "enemy_battlefield"
                                        : "battlefield",
                                      bindInspectorInteractions,
                                      onOpenDetails,
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                          ) : null}
                          {activeAttachment ? (
                            <div className="cloud-arena-battlefield-active-attachment-overlay">
                              {getPermanentMenuActionList(
                                activeAttachment.permanent,
                                getPermanentMenuActions,
                                motionState,
                                openPermanentMenuId,
                                onPermanentMenuToggle,
                                onPermanentMenuClose,
                                onTargetPermanentSelect,
                                getInspectableModel,
                                activeAttachment.inspectableKey.startsWith(
                                  "enemy_battlefield:",
                                )
                                  ? "enemy_battlefield"
                                  : "battlefield",
                                bindInspectorInteractions,
                                onOpenDetails,
                              )}
                            </div>
                          ) : null}
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <article className="trace-viewer-card trace-viewer-card-empty trace-viewer-battlefield-card cloud-arena-empty-slot">
                      <strong>Slot {index + 1}</strong>
                      <div className="trace-viewer-card-meta">empty</div>
                    </article>
                    {deathOverlay ? (
                      <div
                        className="cloud-arena-permanent-death-overlay"
                        aria-hidden="true"
                      >
                        <DisplayCard
                          className="trace-viewer-battlefield-card cloud-arena-battlefield-card cloud-arena-permanent-death-card"
                          model={mapArenaPermanentToDisplayCard(
                            deathOverlay.permanent,
                            {
                              disableActions: true,
                            },
                          )}
                        />
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
