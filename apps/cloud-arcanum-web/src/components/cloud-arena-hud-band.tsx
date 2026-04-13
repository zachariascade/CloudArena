import type { ReactElement } from "react";

type CloudArenaHudBandProps = {
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    intentLabel: string;
  };
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    handCount: number;
    drawPileCount: number;
  };
  maxPlayerEnergy: number;
  onInspectEnemy: {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    onFocus: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
    onClick: () => void;
  };
  onInspectPlayer: {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => void;
    onMouseLeave: () => void;
    onFocus: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur: () => void;
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
  enemy,
  player,
  maxPlayerEnergy,
  onInspectEnemy,
  onInspectPlayer,
}: CloudArenaHudBandProps): ReactElement {
  return (
    <section className="cloud-arena-hud-band">
      <button
        type="button"
        className="cloud-arena-hud-card cloud-arena-hud-card-enemy"
        {...onInspectEnemy}
      >
        <div className="cloud-arena-hud-card-header">
          <span className="cloud-arena-hud-kicker">Enemy</span>
          <strong>{enemy.name}</strong>
        </div>
        <div className="cloud-arena-hud-stat-row">
          <span>Health {enemy.health}/{enemy.maxHealth}</span>
          <span>Block {enemy.block}</span>
        </div>
        <div
          className="cloud-arena-hud-health-bar"
          role="progressbar"
          aria-label={`${enemy.name} health`}
          aria-valuemin={0}
          aria-valuemax={enemy.maxHealth}
          aria-valuenow={enemy.health}
        >
          <div
            className="cloud-arena-hud-health-bar-fill"
            style={{ width: `${getPercent(enemy.health, enemy.maxHealth)}%` }}
          />
        </div>
        <p className="cloud-arena-hud-intent">{enemy.intentLabel}</p>
      </button>

      <button
        type="button"
        className="cloud-arena-hud-card cloud-arena-hud-card-player"
        {...onInspectPlayer}
      >
        <div className="cloud-arena-hud-card-header">
          <span className="cloud-arena-hud-kicker">Player</span>
          <strong>Pilgrim Duelist</strong>
        </div>
        <div className="cloud-arena-hud-stat-row">
          <span>Health {player.health}/{player.maxHealth}</span>
          <span>Block {player.block}</span>
          <span>Energy {player.energy}/{maxPlayerEnergy}</span>
        </div>
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
        <p className="cloud-arena-hud-intent">
          Hand {player.handCount}. Draw {player.drawPileCount}. Ready the field.
        </p>
      </button>
    </section>
  );
}
