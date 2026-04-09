import type { ReactElement, ReactNode } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import {
  mapArenaEnemyToDisplayCard,
  mapArenaHandCardToDisplayCard,
  mapArenaPermanentToDisplayCard,
  mapArenaPlayerToDisplayCard,
} from "../lib/display-card.js";
import type {
  BattleAction,
  PermanentActionMode,
} from "../../../../src/cloud-arena/index.js";
import { DisplayCard } from "./display-card.js";

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
  const playerCard = mapArenaPlayerToDisplayCard(battle.player);
  const enemyCard = mapArenaEnemyToDisplayCard(battle.enemy);

  function getPermanentCounterEntries(
    permanent: NonNullable<CloudArenaBattleViewModel["battlefield"][number]>,
  ): Array<{ counter: string; amount: number }> {
    return Object.entries(permanent.counters ?? {})
      .filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] > 0)
      .map(([counter, amount]) => ({ counter, amount }));
  }

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
          {turnActions.length > 0 ? (
            <div className="trace-viewer-battle-actions">
              {turnActions.map((entry, index) => (
                <button
                  key={`${entry.label}-${index}`}
                  type="button"
                  className="primary-button trace-viewer-battle-action-button"
                  disabled={disableTurnActions}
                  onClick={() => onTurnAction?.(entry.action)}
                >
                  {entry.action.type === "end_turn" ? `${entry.label} (E)` : entry.label}
                </button>
              ))}
            </div>
          ) : null}
          <section className="trace-viewer-panels cloud-arena-top-panels">
            <DisplayCard
              className="cloud-arena-summary-card"
              model={playerCard}
            />
            <DisplayCard
              className="cloud-arena-summary-card"
              model={enemyCard}
            />
          </section>
        </div>

        {sidePanel}
      </section>

      <section className="panel trace-viewer-panel trace-viewer-panel-wide trace-viewer-battlefield-panel">
        <div className="trace-viewer-card-grid trace-viewer-board-grid">
          {battle.battlefield.map((slot, index) => (
            slot ? (
              <div key={`slot-${index + 1}`} className="trace-viewer-battlefield-slot">
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
                <DisplayCard
                  className="trace-viewer-battlefield-card"
                  model={mapArenaPermanentToDisplayCard(slot, {
                    disableActions: disablePermanentActions,
                    playableActions: slot.actions.flatMap((action) => {
                      const mode =
                        typeof action.attackAmount === "number" && action.attackAmount > 0
                          ? "attack"
                          : "defend";
                      const isPlayable = playablePermanentActionKeys.has(
                        `${slot.instanceId}:${mode}`,
                      );

                      if (!isPlayable) {
                        return [];
                      }

                      return [
                        {
                          action: mode,
                          label: getPermanentActionLabel(action),
                          onSelect: onUsePermanentAction
                            ? () => onUsePermanentAction(slot.instanceId, mode)
                            : undefined,
                        },
                      ];
                    }),
                  })}
                />
              </div>
            ) : (
              <article
                key={`slot-${index + 1}`}
                className="trace-viewer-card trace-viewer-card-empty trace-viewer-battlefield-card"
              >
                <strong>Slot {index + 1}</strong>
                <div className="trace-viewer-card-meta">empty</div>
              </article>
            )
          ))}
        </div>
      </section>

      <section className="panel trace-viewer-panel trace-viewer-hand-bar">
        <div className="trace-viewer-hand-scroll" aria-label="Player hand">
          {battle.player.hand.length > 0 ? (
            battle.player.hand.map((card) => {
              const isPlayable = playableHandCards.has(card.instanceId);
              return (
                <DisplayCard
                  key={card.instanceId}
                  className={`trace-viewer-hand-card ${isPlayable ? "trace-viewer-hand-card-playable" : "trace-viewer-hand-card-disabled"}`.trim()}
                  model={mapArenaHandCardToDisplayCard(card, {
                    isPlayable,
                    disabled: disableHandCardActions,
                    onPlay: onPlayHandCard,
                  })}
                />
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
        <div className="trace-viewer-hand-footer">
          <strong>Hand</strong>
          <span>Energy {battle.player.energy}/{maxPlayerEnergy}</span>
        </div>
      </section>
    </>
  );
}
