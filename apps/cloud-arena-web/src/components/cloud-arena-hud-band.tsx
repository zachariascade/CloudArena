import type { FocusEvent, MouseEvent, ReactElement } from "react";

import {
  getEnemyIntentAttackHitAmount,
  getEnemyIntentAttackTimes,
} from "../../../../src/cloud-arena/index.js";

type CloudArenaHudBandProps = {
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    intent: {
      attackAmount?: number;
      attackTimes?: number;
      blockAmount?: number;
      overflowPolicy?: "trample" | "stop_at_blocker";
    };
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
    onMouseEnter: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave: (event: MouseEvent<HTMLElement>) => void;
    onFocus: (event: FocusEvent<HTMLElement>) => void;
    onBlur: (event: FocusEvent<HTMLElement>) => void;
    onClick: () => void;
  };
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

function formatEnemyAttack(intent: CloudArenaHudBandProps["enemy"]["intent"]): string {
  const attackAmount = getEnemyIntentAttackHitAmount(intent);
  const attackTimes = getEnemyIntentAttackTimes(intent);

  if (attackAmount <= 0) {
    return "0";
  }

  if (attackTimes > 1) {
    return `${attackAmount}×${attackTimes}`;
  }

  return String(attackAmount);
}

export function CloudArenaHudBand({
  enemy,
  player,
  maxPlayerEnergy,
  onInspectEnemy,
  onInspectPlayer,
}: CloudArenaHudBandProps): ReactElement {
  const enemyAttack = formatEnemyAttack(enemy.intent);

  return (
    <section className="cloud-arena-hud-band">
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
          <div
            className="cloud-arena-hud-block-badge"
            aria-label={`Player block ${player.block}`}
            title={`Player block ${player.block}`}
          >
            <span className="cloud-arena-hud-block-caption">BLK</span>
            <span className="cloud-arena-hud-block-value">{player.block}</span>
          </div>
        </div>
      </button>

      <button
        type="button"
        className="cloud-arena-hud-card cloud-arena-hud-card-enemy"
        {...onInspectEnemy}
      >
        <div className="cloud-arena-hud-card-header">
          <span className="cloud-arena-hud-kicker">Enemy</span>
          <strong>{enemy.name}</strong>
        </div>
        <div className="cloud-arena-hud-enemy-line">
          <div
            className="cloud-arena-hud-attack-badge"
            aria-label={`Enemy attack ${enemyAttack}`}
            title={`Enemy attack ${enemyAttack}`}
          >
            <span className="cloud-arena-hud-attack-caption">ATK</span>
            <span className="cloud-arena-hud-attack-value">{enemyAttack}</span>
          </div>
          <div className="cloud-arena-hud-enemy-track">
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
            <div className="cloud-arena-hud-stat-row">
              <span className="cloud-arena-hud-stat-pill">Block {enemy.block}</span>
            </div>
          </div>
        </div>
      </button>
    </section>
  );
}
