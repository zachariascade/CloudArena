import type { ReactElement } from "react";
import type { FocusEvent, MouseEvent } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import { AbilityCostChip } from "./ability-cost-chip.js";
import { DisplayCard } from "./display-card.js";
import type { BattleAction } from "../../../../src/cloud-arena/index.js";

type CloudArenaBattlefieldPanelProps = {
  title?: string;
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

export function CloudArenaBattlefieldPanel({
  title = "Battlefield",
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
  const occupiedSlots = battlefield.filter(Boolean).length;

  return (
    <section className="panel trace-viewer-panel trace-viewer-panel-wide trace-viewer-battlefield-panel cloud-arena-battlefield-panel">
      <div className="cloud-arena-section-heading">
        <strong>{title}</strong>
        <span>{occupiedSlots}/{battlefield.length} occupied</span>
      </div>
      <div className="trace-viewer-board-scroll" aria-label="Battlefield">
        <div className="trace-viewer-card-grid trace-viewer-board-grid">
          {battlefield.map((slot, index) => (
            slot ? (
              (() => {
                const menuActions = getPermanentMenuActions(slot);
                const targetAction = legalActions.find(
                  (entry) =>
                    entry.action.type === "choose_target" &&
                    entry.action.targetPermanentId === slot.instanceId,
                );

                return (
                  <div
                    key={`slot-${index + 1}`}
                    className="trace-viewer-battlefield-slot"
                    {...bindInspectorInteractions(`battlefield:${slot.instanceId}`)}
                  >
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
                      aria-expanded={
                        !targetAction && menuActions.length > 0 && openPermanentMenuId === slot.instanceId
                      }
                      aria-haspopup={!targetAction && menuActions.length > 0 ? "menu" : undefined}
                    >
                      <DisplayCard
                        className="trace-viewer-battlefield-card cloud-arena-battlefield-card"
                        model={getInspectableModel(`${zoneKeyPrefix}:${slot.instanceId}`)}
                      />
                    </div>
                    <button
                      type="button"
                      className="cloud-arena-card-details-button cloud-arena-battlefield-details-button"
                      onClick={(event) => onOpenDetails(`${zoneKeyPrefix}:${slot.instanceId}`, event)}
                    >
                      details
                    </button>
                    {openPermanentMenuId === slot.instanceId && menuActions.length > 0 ? (
                      <div
                        className="cloud-arena-permanent-menu"
                        role="menu"
                        aria-label={`${slot.name} actions`}
                        onMouseDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                      >
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
                  ) : null}
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
