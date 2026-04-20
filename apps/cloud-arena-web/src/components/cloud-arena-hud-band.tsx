import type { FocusEvent, MouseEvent, ReactElement } from "react";

type CloudArenaHudBandProps = {
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    handCount: number;
    drawPileCount: number;
  };
  maxPlayerEnergy: number;
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

export function CloudArenaHudBand({
  player,
  maxPlayerEnergy,
  onInspectPlayer,
}: CloudArenaHudBandProps): ReactElement {
  return (
    <div className="cloud-arena-hud-band">
      <button
        type="button"
        className="cloud-arena-hud-card cloud-arena-hud-card-player"
        {...onInspectPlayer}
      >
        <div className="cloud-arena-hud-card-header">
          <span className="cloud-arena-hud-kicker">Player</span>
          <strong>Pilgrim Duelist</strong>
        </div>
        <div className="cloud-arena-hud-player-line">
          <div
            className="cloud-arena-hud-block"
            aria-label={`Player block ${player.block}`}
            title={`Player block ${player.block}`}
          >
            <span className="cloud-arena-hud-block-value">{player.block}</span>
          </div>
          <div className="cloud-arena-hud-player-track">
            <div
              className="cloud-arena-hud-health-bar"
              role="progressbar"
              aria-label="Pilgrim Duelist health"
              aria-valuemin={0}
              aria-valuemax={player.maxHealth}
              aria-valuenow={player.health}
            >
              <div
                className="cloud-arena-hud-health-bar-fill"
                style={{ width: `${getPercent(player.health, player.maxHealth)}%` }}
              />
            </div>
            <div className="cloud-arena-hud-stat-row">
              <span>Health {player.health}/{player.maxHealth}</span>
              <span>Energy {player.energy}/{maxPlayerEnergy}</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
