import type { ReactElement } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import { DisplayCard } from "./display-card.js";

type CloudArenaBattlefieldPanelProps = {
  battlefield: CloudArenaBattleViewModel["battlefield"];
  getInspectableModel: (key: string) => Parameters<typeof DisplayCard>[0]["model"];
  getPermanentMenuActions: (
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  ) => Array<{
    action: string;
    label: string;
    disabled?: boolean;
    onSelect?: () => void;
  }>;
  getPermanentCounterEntries: (
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  ) => Array<{ counter: string; amount: number }>;
  bindInspectorInteractions: (key: string) => {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    onFocus: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
    onClick: () => void;
  };
  openPermanentMenuId?: string | null;
  onPermanentMenuToggle?: (permanentId: string) => void;
  onPermanentMenuClose?: () => void;
};

export function CloudArenaBattlefieldPanel({
  battlefield,
  getInspectableModel,
  getPermanentMenuActions,
  getPermanentCounterEntries,
  bindInspectorInteractions,
  openPermanentMenuId = null,
  onPermanentMenuToggle,
  onPermanentMenuClose,
}: CloudArenaBattlefieldPanelProps): ReactElement {
  return (
    <section className="panel trace-viewer-panel trace-viewer-panel-wide trace-viewer-battlefield-panel cloud-arena-battlefield-panel">
      <div className="cloud-arena-section-heading">
        <strong>Battlefield</strong>
        <span>{battlefield.filter(Boolean).length}/3 occupied</span>
      </div>
      <div className="trace-viewer-card-grid trace-viewer-board-grid">
        {battlefield.map((slot, index) => (
          slot ? (
            (() => {
              const menuActions = getPermanentMenuActions(slot);

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
              <button
                type="button"
                className="cloud-arena-permanent-button"
                onClick={() => {
                  if (menuActions.length > 0) {
                    onPermanentMenuToggle?.(slot.instanceId);
                  }
                }}
                aria-expanded={menuActions.length > 0 && openPermanentMenuId === slot.instanceId}
                aria-haspopup={menuActions.length > 0 ? "menu" : undefined}
              >
                <DisplayCard
                  className="trace-viewer-battlefield-card cloud-arena-battlefield-card"
                  model={getInspectableModel(`battlefield:${slot.instanceId}`)}
                />
              </button>
              {openPermanentMenuId === slot.instanceId && menuActions.length > 0 ? (
                <div className="cloud-arena-permanent-menu" role="menu" aria-label={`${slot.name} actions`}>
                  {menuActions.map((action) => (
                    <button
                      key={`${slot.instanceId}-${action.action}`}
                      type="button"
                      className="cloud-arena-permanent-menu-button"
                      role="menuitem"
                      disabled={action.disabled}
                      onClick={() => {
                        onPermanentMenuClose?.();
                        action.onSelect?.();
                      }}
                    >
                      {action.label}
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
    </section>
  );
}
