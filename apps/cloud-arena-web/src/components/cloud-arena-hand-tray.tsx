import type { ReactElement } from "react";
import type { FocusEvent, MouseEvent } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import { DisplayCard } from "./display-card.js";

type CloudArenaHandTrayProps = {
  battle: CloudArenaBattleViewModel;
  getInspectableModel: (key: string) => Parameters<typeof DisplayCard>[0]["model"];
  bindInspectorInteractions: (key: string) => {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (event: MouseEvent<HTMLElement>) => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
    onClick: () => void;
  };
  onOpenDetails: (key: string, event: MouseEvent<HTMLElement>) => void;
  isPlayableHandCard: (cardInstanceId: string) => boolean;
  groupedTurnActionsCount: number;
};

export function CloudArenaHandTray({
  battle,
  getInspectableModel,
  bindInspectorInteractions,
  onOpenDetails,
  isPlayableHandCard,
  groupedTurnActionsCount: _groupedTurnActionsCount,
}: CloudArenaHandTrayProps): ReactElement {
  return (
    <section className="panel trace-viewer-panel trace-viewer-hand-bar cloud-arena-hand-tray">
      <div className="cloud-arena-section-heading">
        <strong>Hand</strong>
        <span>{battle.player.hand.length} cards</span>
      </div>
      <div className="trace-viewer-hand-scroll" aria-label="Player hand">
        {battle.player.hand.length > 0 ? (
          battle.player.hand.map((card) => {
            const isPlayable = isPlayableHandCard(card.instanceId);
            return (
              <div
                key={card.instanceId}
                className="cloud-arena-hand-card-shell"
                {...bindInspectorInteractions(`hand:${card.instanceId}`)}
              >
                <DisplayCard
                  className={`trace-viewer-hand-card ${isPlayable ? "trace-viewer-hand-card-playable" : "trace-viewer-hand-card-disabled"} cloud-arena-hand-card`.trim()}
                  model={getInspectableModel(`hand:${card.instanceId}`)}
                />
                <button
                  type="button"
                  className="cloud-arena-card-details-button"
                  onClick={(event) => onOpenDetails(`hand:${card.instanceId}`, event)}
                >
                  details
                </button>
              </div>
            );
          })
        ) : (
          <article className="trace-viewer-card trace-viewer-card-empty trace-viewer-hand-card">
            <strong>Hand</strong>
            <div className="trace-viewer-card-meta">empty</div>
          </article>
        )}
      </div>
      <div className="cloud-arena-zone-chip-row">
        <details className="trace-viewer-zone-chip cloud-arena-zone-chip">
          <summary>Deck <strong>{battle.player.drawPileCount}</strong></summary>
          <div className="cloud-arena-zone-chip-detail">
            {battle.player.drawPile.length > 0
              ? battle.player.drawPile.map((card) => card.name).join(", ")
              : "empty"}
          </div>
        </details>
        <details className="trace-viewer-zone-chip cloud-arena-zone-chip">
          <summary>Discard <strong>{battle.player.discardPile.length}</strong></summary>
          <div className="cloud-arena-zone-chip-detail">
            {battle.player.discardPile.length > 0
              ? battle.player.discardPile.map((card) => card.name).join(", ")
              : "empty"}
          </div>
        </details>
        <details className="trace-viewer-zone-chip cloud-arena-zone-chip">
          <summary>Graveyard <strong>{battle.player.graveyard.length}</strong></summary>
          <div className="cloud-arena-zone-chip-detail">
            {battle.player.graveyard.length > 0
              ? battle.player.graveyard.map((card) => card.name).join(", ")
              : "empty"}
          </div>
        </details>
        <details className="trace-viewer-zone-chip cloud-arena-zone-chip">
          <summary>Queue <strong>{battle.blockingQueue.length}</strong></summary>
          <div className="cloud-arena-zone-chip-detail">
            {battle.blockingQueue.length > 0
              ? battle.blockingQueue.join(", ")
              : "empty"}
          </div>
        </details>
      </div>
    </section>
  );
}
