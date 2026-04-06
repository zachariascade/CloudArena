import type { ReactElement, ReactNode } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import type {
  BattleAction,
  PermanentActionMode,
} from "../../../../src/cloud-arena/index.js";

type CloudArenaBattleStateProps = {
  battle: CloudArenaBattleViewModel;
  disableHandCardActions?: boolean;
  disablePermanentActions?: boolean;
  disableTurnActions?: boolean;
  maxPlayerEnergy?: number;
  onUsePermanentAction?: (permanentId: string, action: PermanentActionMode) => void;
  onPlayHandCard?: (cardInstanceId: string) => void;
  onTurnAction?: (action: BattleAction) => void;
  playablePermanentActions?: Array<{
    permanentId: string;
    action: PermanentActionMode;
  }>;
  playableHandCardInstanceIds?: string[];
  turnActions?: Array<{
    action: BattleAction;
    label: string;
  }>;
  sidePanel?: ReactNode;
};

function clampHealthPercent(health: number, maxHealth: number): number {
  if (maxHealth <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (health / maxHealth) * 100));
}

export function CloudArenaBattleState({
  battle,
  disableHandCardActions = false,
  disablePermanentActions = false,
  disableTurnActions = false,
  maxPlayerEnergy = 3,
  onUsePermanentAction,
  onPlayHandCard,
  onTurnAction,
  playablePermanentActions = [],
  playableHandCardInstanceIds = [],
  turnActions = [],
  sidePanel,
}: CloudArenaBattleStateProps): ReactElement {
  const playableHandCards = new Set(playableHandCardInstanceIds);
  const playablePermanentActionKeys = new Set(
    playablePermanentActions.map(
      (entry) => `${entry.permanentId}:${entry.action}`,
    ),
  );
  const playerHealthPercent = clampHealthPercent(
    battle.player.health,
    battle.player.maxHealth,
  );
  const enemyHealthPercent = clampHealthPercent(
    battle.enemy.health,
    battle.enemy.maxHealth,
  );

  function getPermanentActionLabel(
    action: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>["actions"][number],
  ): string {
    if (typeof action.attackAmount === "number" && action.attackAmount > 0) {
      return `Attack ${action.attackAmount}`;
    }

    if (typeof action.blockAmount === "number" && action.blockAmount > 0) {
      return `Defend ${action.blockAmount}`;
    }

    return "Action";
  }

  return (
    <>
      <section
        className={`trace-viewer-content-grid ${sidePanel ? "" : "cloud-arena-content-grid-full"}`.trim()}
      >
        <div className="trace-viewer-main-column">
          <section className="trace-viewer-panels cloud-arena-top-panels">
            <section className="panel trace-viewer-panel cloud-arena-summary-panel">
              <strong>Player</strong>
              <div className="trace-viewer-stat-row">
                <div className="trace-viewer-stat-chip">
                  <span>HP</span>
                  <strong>{battle.player.health}/{battle.player.maxHealth}</strong>
                  <div
                    className="trace-viewer-health-bar"
                    role="progressbar"
                    aria-label="Player health"
                    aria-valuemin={0}
                    aria-valuemax={battle.player.maxHealth}
                    aria-valuenow={battle.player.health}
                  >
                    <div
                      className="trace-viewer-health-bar-fill"
                      style={{ width: `${playerHealthPercent}%` }}
                    />
                  </div>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Block</span>
                  <strong>{battle.player.block}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Hand</span>
                  <strong>{battle.player.hand.length}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Draw</span>
                  <strong>{battle.player.drawPileCount}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Discard</span>
                  <strong>{battle.player.discardPile.length}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Graveyard</span>
                  <strong>{battle.player.graveyard.length}</strong>
                </div>
              </div>
            </section>

            <section className="panel trace-viewer-panel cloud-arena-summary-panel">
              <strong>Enemy - {battle.enemy.name}</strong>
              <div className="trace-viewer-stat-row">
                <div className="trace-viewer-stat-chip">
                  <span>HP</span>
                  <strong>{battle.enemy.health}/{battle.enemy.maxHealth}</strong>
                  <div
                    className="trace-viewer-health-bar"
                    role="progressbar"
                    aria-label="Enemy health"
                    aria-valuemin={0}
                    aria-valuemax={battle.enemy.maxHealth}
                    aria-valuenow={battle.enemy.health}
                  >
                    <div
                      className="trace-viewer-health-bar-fill"
                      style={{ width: `${enemyHealthPercent}%` }}
                    />
                  </div>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Block</span>
                  <strong>{battle.enemy.block}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Intent</span>
                  <strong>{battle.enemy.intentLabel}</strong>
                </div>
              </div>
            </section>
          </section>
        </div>

        {sidePanel}
      </section>

      <section className="panel trace-viewer-panel trace-viewer-panel-wide trace-viewer-battlefield-panel">
        <div className="trace-viewer-section-header">
          <strong>Battlefield</strong>
          <span>Board slots</span>
        </div>
        <div className="trace-viewer-card-grid trace-viewer-board-grid">
          {battle.battlefield.map((slot, index) => (
            <article
              key={`slot-${index + 1}`}
              className={`trace-viewer-card ${slot ? "" : "trace-viewer-card-empty"}`.trim()}
            >
              <strong>Slot {index + 1}</strong>
              {slot ? (
                <>
                  <div>{slot.name}</div>
                  <div className="trace-viewer-card-meta">{slot.instanceId}</div>
                  <div className="trace-viewer-card-stats">
                    <span>HP {slot.health}/{slot.maxHealth}</span>
                    <span>Block {slot.block}</span>
                  </div>
                  <div className="trace-viewer-card-tags">
                    <span>{slot.hasActedThisTurn ? "Acted" : "Ready"}</span>
                    <span>{slot.isDefending ? "Defending" : "Open"}</span>
                  </div>
                  {slot.actions.length > 0 ? (
                    <div className="trace-viewer-card-actions">
                      {slot.actions.map((action, actionIndex) => {
                        const mode =
                          typeof action.attackAmount === "number" && action.attackAmount > 0
                            ? "attack"
                            : "defend";
                        const label = getPermanentActionLabel(action);
                        const isPlayable = playablePermanentActionKeys.has(
                          `${slot.instanceId}:${mode}`,
                        );

                        if (isPlayable && onUsePermanentAction) {
                          return (
                            <button
                              key={`${slot.instanceId}-${mode}-${actionIndex}`}
                              type="button"
                              className="ghost-button trace-viewer-inline-action"
                              disabled={disablePermanentActions}
                              onClick={() => onUsePermanentAction(slot.instanceId, mode)}
                            >
                              {disablePermanentActions ? `${label}...` : label}
                            </button>
                          );
                        }

                        return (
                          <span
                            key={`${slot.instanceId}-${mode}-${actionIndex}`}
                            className={`trace-viewer-inline-action ${isPlayable ? "trace-viewer-inline-action-available" : "trace-viewer-inline-action-disabled"}`.trim()}
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="trace-viewer-card-meta">empty</div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="panel trace-viewer-panel trace-viewer-hand-bar">
        <div className="trace-viewer-section-header">
          <strong>Hand</strong>
          <span>Energy {battle.player.energy}/{maxPlayerEnergy}</span>
        </div>
        {turnActions.length > 0 ? (
          <div className="trace-viewer-zone-row trace-viewer-hand-actions">
            {turnActions.map((entry, index) => (
              <button
                key={`${entry.label}-${index}`}
                type="button"
                className="ghost-button"
                disabled={disableTurnActions}
                onClick={() => onTurnAction?.(entry.action)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="trace-viewer-hand-scroll" aria-label="Player hand">
          {battle.player.hand.length > 0 ? (
            battle.player.hand.map((card) => {
              const isPlayable = playableHandCards.has(card.instanceId);
              const isClickable = Boolean(onPlayHandCard) && isPlayable;

              if (isClickable) {
                return (
                  <button
                    key={card.instanceId}
                    type="button"
                    className={`trace-viewer-card trace-viewer-hand-card trace-viewer-hand-card-button ${isPlayable ? "trace-viewer-hand-card-playable" : "trace-viewer-hand-card-disabled"}`.trim()}
                    disabled={disableHandCardActions}
                    onClick={() => onPlayHandCard?.(card.instanceId)}
                  >
                    <div className="trace-viewer-card-header">
                      <strong>{card.name}</strong>
                      <div className="trace-viewer-card-cost">{card.cost}</div>
                    </div>
                    <div className="trace-viewer-card-meta">{card.instanceId}</div>
                  <div className="trace-viewer-card-tags">
                    <span>{card.definitionId}</span>
                    <span>{disableHandCardActions ? "Waiting" : "Playable"}</span>
                  </div>
                  <div className="trace-viewer-card-meta">{card.effectSummary}</div>
                </button>
              );
            }

              return (
                <article
                  key={card.instanceId}
                  className={`trace-viewer-card trace-viewer-hand-card ${isPlayable ? "trace-viewer-hand-card-playable" : "trace-viewer-hand-card-disabled"}`.trim()}
                >
                  <div className="trace-viewer-card-header">
                    <strong>{card.name}</strong>
                    <div className="trace-viewer-card-cost">{card.cost}</div>
                  </div>
                  <div className="trace-viewer-card-meta">{card.instanceId}</div>
                  <div className="trace-viewer-card-tags">
                    <span>{card.definitionId}</span>
                    <span>{isPlayable ? "Playable" : "Unavailable"}</span>
                  </div>
                  <div className="trace-viewer-card-meta">{card.effectSummary}</div>
                </article>
              );
            })
          ) : (
            <article className="trace-viewer-card trace-viewer-card-empty trace-viewer-hand-card">
              <strong>Hand</strong>
              <div className="trace-viewer-card-meta">empty</div>
            </article>
          )}
        </div>
        <div className="trace-viewer-zone-row trace-viewer-hand-zones">
          <div className="trace-viewer-zone-chip">
            Discard:{" "}
            <strong>
              {battle.player.discardPile.length > 0
                ? battle.player.discardPile.map((card) => card.name).join(", ")
                : "empty"}
            </strong>
          </div>
          <div className="trace-viewer-zone-chip">
            Graveyard:{" "}
            <strong>
              {battle.player.graveyard.length > 0
                ? battle.player.graveyard.map((card) => card.name).join(", ")
                : "empty"}
            </strong>
          </div>
          <div className="trace-viewer-zone-chip">
            Blocking queue:{" "}
            <strong>
              {battle.blockingQueue.length > 0
                ? battle.blockingQueue.join(", ")
                : "empty"}
            </strong>
          </div>
        </div>
      </section>
    </>
  );
}
