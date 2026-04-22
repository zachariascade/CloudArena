import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, MouseEvent, ReactElement } from "react";

import type { CloudArenaBattleViewModel } from "../lib/cloud-arena-battle-view-model.js";
import { DisplayCard } from "./display-card.js";
import {
  mapArenaGraveyardCardToDisplayCard,
  mapArenaHandCardToDisplayCard,
} from "../lib/display-card.js";
import type { BattleAction } from "../../../../src/cloud-arena/index.js";

type PileKind = "draw" | "discard" | "graveyard";

type CloudArenaHandTrayProps = {
  battle: CloudArenaBattleViewModel;
  player: CloudArenaBattleViewModel["player"];
  maxPlayerEnergy: number;
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
  onBattleAction?: (action: BattleAction) => void;
  onInspectPlayer: {
    onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (event: MouseEvent<HTMLElement>) => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
    onClick: () => void;
  };
};

function getPercent(current: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (current / max) * 100));
}

function getPileLabel(pile: PileKind): string {
  switch (pile) {
    case "draw":
      return "Draw Pile";
    case "discard":
      return "Discard Pile";
    case "graveyard":
      return "Graveyard Pile";
  }
}

export function CloudArenaHandTray({
  battle,
  player,
  maxPlayerEnergy,
  getInspectableModel,
  bindInspectorInteractions,
  onOpenDetails,
  isPlayableHandCard,
  groupedTurnActionsCount: _groupedTurnActionsCount,
  onBattleAction,
  onInspectPlayer,
}: CloudArenaHandTrayProps): ReactElement {
  const [openPile, setOpenPile] = useState<PileKind | null>(null);
  const previousPlayerHealthRef = useRef(player.health);
  const playerHealthFlashTimerRef = useRef<number | null>(null);
  const [playerHealthFlashDirection, setPlayerHealthFlashDirection] = useState<"increase" | "decrease" | null>(null);
  const pendingHandCardInstanceId = battle.pendingTargetRequest?.context?.pendingCardPlay?.instanceId ?? null;
  const isSelectingGraveyardCard =
    battle.pendingTargetRequest?.targetKind === "card" &&
    battle.pendingTargetRequest.selector.zone === "graveyard";

  const openPileCards = useMemo(() => {
    if (!openPile) {
      return [];
    }

    switch (openPile) {
      case "draw":
        return player.drawPile;
      case "discard":
        return player.discardPile;
      case "graveyard":
        return player.graveyard;
    }
  }, [openPile, player.discardPile, player.drawPile, player.graveyard]);

  useEffect(() => {
    const previousHealth = previousPlayerHealthRef.current;
    previousPlayerHealthRef.current = player.health;

    if (player.health !== previousHealth) {
      setPlayerHealthFlashDirection(player.health > previousHealth ? "increase" : "decrease");

      if (playerHealthFlashTimerRef.current !== null) {
        window.clearTimeout(playerHealthFlashTimerRef.current);
      }

      playerHealthFlashTimerRef.current = window.setTimeout(() => {
        setPlayerHealthFlashDirection(null);
        playerHealthFlashTimerRef.current = null;
      }, 520);
    }
  }, [player.health]);

  useEffect(() => () => {
    if (playerHealthFlashTimerRef.current !== null) {
      window.clearTimeout(playerHealthFlashTimerRef.current);
      playerHealthFlashTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isSelectingGraveyardCard) {
      setOpenPile("graveyard");
    }
  }, [isSelectingGraveyardCard]);

  useEffect(() => {
    if (!openPile) {
      return;
    }

    function onDocumentKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpenPile(null);
      }
    }

    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [openPile]);

  const openPileTitle = openPile
    ? openPile === "graveyard" && isSelectingGraveyardCard
      ? battle.pendingTargetRequest?.prompt ?? getPileLabel(openPile)
      : getPileLabel(openPile)
    : null;
  const graveyardSelectionActions = new Map(
    battle.legalActions
      .flatMap((entry) =>
        entry.action.type === "choose_card"
          ? [[entry.action.targetCardInstanceId, entry] as const]
          : [],
      ),
  );
  const pileModal = openPile ? (
    <div
      className="cloud-arena-pile-modal-backdrop"
      role="presentation"
      onClick={() => setOpenPile(null)}
    >
      <div
        className="panel cloud-arena-pile-modal"
        role="dialog"
        aria-modal="true"
        aria-label={openPileTitle ?? "Pile"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cloud-arena-pile-modal-header">
          <div className="cloud-arena-pile-modal-title">
            <strong>{openPileTitle}</strong>
            <span>{openPileCards.length} cards</span>
          </div>
          <button
            type="button"
            className="cloud-arena-pile-modal-close"
            onClick={() => setOpenPile(null)}
          >
            Close
          </button>
        </div>
        <div className="cloud-arena-pile-modal-scroll">
          <div className="cloud-arena-pile-modal-grid">
            {openPileCards.length > 0 ? (
              openPileCards.map((card) => (
                        <DisplayCard
                  key={card.instanceId}
                  className="cloud-arena-pile-modal-card"
                  model={
                    openPile === "graveyard" && isSelectingGraveyardCard
                    ? mapArenaGraveyardCardToDisplayCard(card, {
                        disabled: !graveyardSelectionActions.has(card.instanceId),
                        isTargetable: graveyardSelectionActions.has(card.instanceId),
                        onChoose: (cardInstanceId) => {
                          const action = graveyardSelectionActions.get(cardInstanceId)?.action;

                            if (action) {
                              onBattleAction?.(action);
                            }
                          },
                        })
                      : mapArenaHandCardToDisplayCard(card, {
                          isPlayable: false,
                          disabled: true,
                        })
                  }
                />
              ))
            ) : (
              <div className="cloud-arena-pile-modal-empty">
                No cards in this pile.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section className="panel trace-viewer-panel trace-viewer-hand-bar cloud-arena-hand-tray">
      <div className="cloud-arena-hand-tray-layout">
        <div
          className={[
            "cloud-arena-hand-hud",
            playerHealthFlashDirection === "decrease" ? "is-health-dropping" : null,
            playerHealthFlashDirection === "increase" ? "is-health-rising" : null,
          ]
            .filter(Boolean)
            .join(" ")}
          role="button"
          tabIndex={0}
          {...onInspectPlayer}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") {
              return;
            }

            event.preventDefault();
            onInspectPlayer.onClick();
          }}
        >
          <div className="cloud-arena-hand-hud-header">
            <strong>Pilgrim Duelist</strong>
          </div>
          <div className="cloud-arena-hand-hud-line">
            <div
              className="cloud-arena-hand-hud-block"
              aria-label={`Player block ${player.block}`}
              title={`Player block ${player.block}`}
            >
              <span className="cloud-arena-hand-hud-block-value">{player.block}</span>
            </div>
            <div className="cloud-arena-hand-hud-track">
              <div
            className={[
            "cloud-arena-hand-hud-health-bar",
            playerHealthFlashDirection === "decrease" ? "is-dropping" : null,
            playerHealthFlashDirection === "increase" ? "is-rising" : null,
          ]
            .filter(Boolean)
            .join(" ")}
                role="progressbar"
                aria-label="Pilgrim Duelist health"
                aria-valuemin={0}
                aria-valuemax={player.maxHealth}
                aria-valuenow={player.health}
              >
                <div
                  className="cloud-arena-hand-hud-health-bar-fill"
                  style={{ width: `${getPercent(player.health, player.maxHealth)}%` }}
                />
              </div>
              <div
          className={[
            "cloud-arena-hand-hud-stats",
            playerHealthFlashDirection === "decrease" ? "is-dropping" : null,
            playerHealthFlashDirection === "increase" ? "is-rising" : null,
          ]
            .filter(Boolean)
            .join(" ")}
              >
                <span>Health {player.health}/{player.maxHealth}</span>
                <span>Energy {player.energy}/{maxPlayerEnergy}</span>
              </div>
            </div>
          </div>
          <div className="cloud-arena-hand-hud-piles" aria-label="Player pile buttons">
            <button
              type="button"
              className="cloud-arena-hand-hud-pile-button"
              aria-haspopup="dialog"
              aria-label={`Draw pile ${player.drawPileCount} cards`}
              onClick={(event) => {
                event.stopPropagation();
                setOpenPile("draw");
              }}
            >
              <span>Draw Pile</span>
              <strong>{player.drawPileCount}</strong>
            </button>
            <button
              type="button"
              className="cloud-arena-hand-hud-pile-button"
              aria-haspopup="dialog"
              aria-label={`Discard pile ${player.discardPile.length} cards`}
              onClick={(event) => {
                event.stopPropagation();
                setOpenPile("discard");
              }}
            >
              <span>Discard Pile</span>
              <strong>{player.discardPile.length}</strong>
            </button>
            <button
              type="button"
              className="cloud-arena-hand-hud-pile-button"
              aria-haspopup="dialog"
              aria-label={`Graveyard pile ${player.graveyard.length} cards`}
              onClick={(event) => {
                event.stopPropagation();
                setOpenPile("graveyard");
              }}
            >
              <span>Graveyard Pile</span>
              <strong>{player.graveyard.length}</strong>
            </button>
          </div>
        </div>
        <div className="trace-viewer-hand-scroll" aria-label="Player hand">
          {battle.player.hand.length > 0 ? (
            battle.player.hand.map((card, index) => {
              const isPlayable = isPlayableHandCard(card.instanceId);
              const stackSlot = Math.min(index, 8);
              const cardStyle: CSSProperties & Record<string, string | number> = {
                ["--hand-card-stack-index"]: stackSlot,
                ["--hand-card-stack-shift"]: `calc(var(--display-card-width) * .45)`,
                ["--hand-card-stack-lift"]: `${stackSlot * 0.1}rem`,
                ["--hand-card-stack-tilt"]: `${((index % 5) - 2) * 0.55}deg`,
                ["--hand-card-stack-z"]: battle.player.hand.length - index,
              };

              return (
                <div
                  key={card.instanceId}
                  className="cloud-arena-hand-card-shell"
                  style={cardStyle}
                  {...bindInspectorInteractions(`hand:${card.instanceId}`)}
                >
                  <DisplayCard
                    className={[
                      "trace-viewer-hand-card",
                      isPlayable ? "trace-viewer-hand-card-playable" : "trace-viewer-hand-card-disabled",
                      card.instanceId === pendingHandCardInstanceId
                        ? "trace-viewer-hand-card-pending"
                        : null,
                      "cloud-arena-hand-card",
                    ]
                      .filter(Boolean)
                      .join(" ")}
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
              <div className="trace-viewer-card-meta">empty</div>
            </article>
          )}
        </div>
      </div>
      {typeof document !== "undefined" && pileModal ? createPortal(pileModal, document.body) : pileModal}
    </section>
  );
}
