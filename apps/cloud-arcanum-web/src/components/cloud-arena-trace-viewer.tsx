import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import {
  formatEnemyIntent,
  type SimulationTrace,
} from "../../../../src/cloud-arena/index.js";
import {
  buildTraceStepViewModels,
  clampTraceViewerStepIndex,
  formatTraceActionRecord,
  formatTraceEvent,
  groupTraceEventsByTurn,
  getTraceViewerStepCount,
  getTraceViewerStepIndexAfterCommand,
} from "../lib/index.js";

type CloudArenaTraceViewerProps = {
  trace: SimulationTrace;
  initialStepIndex?: number;
};

type TraceViewerShellControlsProps = {
  currentStepIndex: number;
  onNavigate: (command: "first" | "previous" | "next" | "last") => void;
  stepCount: number;
};

function TraceViewerShellControls({
  currentStepIndex,
  onNavigate,
  stepCount,
}: TraceViewerShellControlsProps): ReactElement {
  const maxStepIndex = Math.max(0, stepCount - 1);

  return (
    <section className="panel trace-viewer-controls">
      <div className="trace-viewer-summary-row">
        <div className="summary-pill">
          Step <strong>{stepCount === 0 ? 0 : currentStepIndex + 1}</strong> of <strong>{stepCount}</strong>
        </div>
      </div>
      <div className="trace-viewer-button-row">
        <button
          type="button"
          className="ghost-button"
          disabled={currentStepIndex <= 0}
          onClick={() => onNavigate("first")}
        >
          First
        </button>
        <button
          type="button"
          className="ghost-button"
          disabled={currentStepIndex <= 0}
          onClick={() => onNavigate("previous")}
        >
          Previous
        </button>
        <button
          type="button"
          className="ghost-button"
          disabled={currentStepIndex >= maxStepIndex}
          onClick={() => onNavigate("next")}
        >
          Next
        </button>
        <button
          type="button"
          className="ghost-button"
          disabled={currentStepIndex >= maxStepIndex}
          onClick={() => onNavigate("last")}
        >
          Last
        </button>
      </div>
    </section>
  );
}

export function CloudArenaTraceViewer({
  trace,
  initialStepIndex = 0,
}: CloudArenaTraceViewerProps): ReactElement {
  const stepCount = getTraceViewerStepCount(trace);
  const stepViewModels = buildTraceStepViewModels(trace);
  const [currentStepIndex, setCurrentStepIndex] = useState(
    clampTraceViewerStepIndex(trace, initialStepIndex),
  );
  const currentStep = stepViewModels[clampTraceViewerStepIndex(trace, currentStepIndex)] ?? null;
  const currentRecord = currentStep?.actionRecord ?? null;

  function handleNavigate(command: "first" | "previous" | "next" | "last"): void {
    setCurrentStepIndex((existingStepIndex) =>
      getTraceViewerStepIndexAfterCommand(trace, existingStepIndex, command),
    );
  }

  function handleKeyNavigation(event: KeyboardEvent): void {
    if (event.key === "ArrowLeft") {
      handleNavigate("previous");
    }

    if (event.key === "ArrowRight") {
      handleNavigate("next");
    }

    if (event.key === "Home") {
      handleNavigate("first");
    }

    if (event.key === "End") {
      handleNavigate("last");
    }
  }

  useEffect(() => {
    function onWindowKeyDown(event: KeyboardEvent): void {
      const target = event.target;

      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        handleKeyNavigation(event);
      }
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  });

  const visibleLog = currentStep?.visibleLog ?? trace.log;
  const currentEvents = currentStep?.currentEvents ?? [];
  const eventGroups = groupTraceEventsByTurn(visibleLog, currentEvents);
  const playerHealth = currentStep?.player.health ?? trace.finalSummary.player.health;
  const playerMaxHealth = currentStep?.player.maxHealth ?? trace.finalSummary.player.maxHealth;
  const enemyHealth = currentStep?.enemy.health ?? trace.finalSummary.enemy.health;
  const enemyMaxHealth = currentStep?.enemy.maxHealth ?? trace.finalSummary.enemy.maxHealth;
  const playerHealthPercent = Math.max(0, Math.min(100, (playerHealth / playerMaxHealth) * 100));
  const enemyHealthPercent = Math.max(0, Math.min(100, (enemyHealth / enemyMaxHealth) * 100));

  return (
    <div
      className="trace-viewer-layout"
      tabIndex={0}
      aria-label="Cloud Arena trace viewer"
    >
      <section className="panel trace-viewer-hero">
        <div className="summary-row trace-viewer-metadata">
          <div className="summary-pill">
            Scenario <strong>Mixed Guardian</strong>
          </div>
          <div className="summary-pill">
            Seed <strong>{trace.config.seed}</strong>
          </div>
          <div className="summary-pill">
            Agent <strong>{trace.config.agent}</strong>
          </div>
          <div className="summary-pill">
            Winner <strong>{trace.result.winner}</strong>
          </div>
          <div className="summary-pill">
            Final turn <strong>{trace.result.finalTurnNumber}</strong>
          </div>
        </div>

        <div className="trace-viewer-hero-grid">
          <TraceViewerShellControls
            currentStepIndex={currentStepIndex}
            onNavigate={handleNavigate}
            stepCount={stepCount}
          />

          <section className="trace-viewer-current-action">
            <strong>Current action</strong>
            <p>{formatTraceActionRecord(currentRecord)}</p>
            <p>
              {currentRecord?.reason ?? "Opening hand and board state before the first action."}
            </p>
            <div className="summary-row trace-viewer-inline-meta">
              <div className="summary-pill">
                Turn <strong>{currentStep?.turnNumber ?? trace.finalSummary.turnNumber}</strong>
              </div>
              <div className="summary-pill">
                Intent{" "}
                <strong>
                  {currentStep
                    ? formatEnemyIntent(currentStep.enemy.intent)
                    : trace.finalSummary.enemy.intent}
                </strong>
              </div>
            </div>
            <p className="trace-viewer-keyboard-hint">
              Keyboard: <code>←</code> previous, <code>→</code> next, <code>Home</code> first, <code>End</code> last
            </p>
          </section>
        </div>
      </section>

      <section className="trace-viewer-content-grid">
        <div className="trace-viewer-main-column">
          <section className="trace-viewer-panels">
            <section className="panel trace-viewer-panel trace-viewer-panel-wide">
              <strong>Player</strong>
              <div className="trace-viewer-stat-row">
                <div className="trace-viewer-stat-chip">
                  <span>HP</span>
                  <strong>{playerHealth}/{playerMaxHealth}</strong>
                  <div
                    className="trace-viewer-health-bar"
                    role="progressbar"
                    aria-label="Player health"
                    aria-valuemin={0}
                    aria-valuemax={playerMaxHealth}
                    aria-valuenow={playerHealth}
                  >
                    <div
                      className="trace-viewer-health-bar-fill"
                      style={{ width: `${playerHealthPercent}%` }}
                    />
                  </div>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Block</span>
                  <strong>{currentStep?.player.block ?? trace.finalSummary.player.block}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Energy</span>
                  <strong>{currentStep?.player.energy ?? trace.finalSummary.player.energy}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Hand</span>
                  <strong>{currentStep?.player.hand.length ?? trace.finalSummary.player.handCount}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Draw</span>
                  <strong>{currentStep?.player.drawPileCount ?? 0}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Discard</span>
                  <strong>
                    {currentStep?.player.discardPile.length ?? trace.finalSummary.player.discardCount}
                  </strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Graveyard</span>
                  <strong>
                    {currentStep?.player.graveyard.length ?? trace.finalSummary.player.graveyardCount}
                  </strong>
                </div>
              </div>
            </section>

            <section className="panel trace-viewer-panel trace-viewer-panel-wide trace-viewer-battlefield-panel">
              <div className="trace-viewer-section-header">
                <strong>Battlefield</strong>
                <span>Board slots</span>
              </div>
              {currentStep ? (
                <div className="trace-viewer-card-grid trace-viewer-board-grid">
                  {currentStep.battlefield.map((slot, index) => (
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
                        </>
                      ) : (
                        <div className="trace-viewer-card-meta">empty</div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <ul className="trace-viewer-list">
                  {trace.finalSummary.battlefield.map((slot) => (
                    <li key={slot}>{slot}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="panel trace-viewer-panel trace-viewer-panel-wide">
              <strong>Enemy - {currentStep?.enemy.name ?? trace.finalSummary.enemy.name}</strong>
              <div className="trace-viewer-stat-row">
                <div className="trace-viewer-stat-chip">
                  <span>HP</span>
                  <strong>{enemyHealth}/{enemyMaxHealth}</strong>
                  <div
                    className="trace-viewer-health-bar"
                    role="progressbar"
                    aria-label="Enemy health"
                    aria-valuemin={0}
                    aria-valuemax={enemyMaxHealth}
                    aria-valuenow={enemyHealth}
                  >
                    <div
                      className="trace-viewer-health-bar-fill"
                      style={{ width: `${enemyHealthPercent}%` }}
                    />
                  </div>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Block</span>
                  <strong>{currentStep?.enemy.block ?? trace.finalSummary.enemy.block}</strong>
                </div>
                <div className="trace-viewer-stat-chip">
                  <span>Intent</span>
                  <strong>
                    {currentStep
                      ? formatEnemyIntent(currentStep.enemy.intent)
                      : trace.finalSummary.enemy.intent}
                  </strong>
                </div>
              </div>
            </section>

          </section>
        </div>

        <section className="panel trace-viewer-log-panel">
          <strong>Battle log</strong>
          <div className="trace-viewer-log-groups">
            {eventGroups.map((group) => (
              <section key={`turn-${group.turnNumber}`} className="trace-viewer-log-group">
                <div className="trace-viewer-log-turn">Turn {group.turnNumber}</div>
                <ol className="trace-viewer-log">
                  {group.events.map(({ event, isCurrentEvent }, index) => (
                    <li
                      key={`${event.type}-${event.turnNumber}-${index}`}
                      className={isCurrentEvent ? "trace-viewer-log-current" : undefined}
                    >
                      {formatTraceEvent(event)}
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
          {currentStep ? (
            <p>
              Blocking queue:{" "}
              {currentStep.blockingQueue.length > 0
                ? currentStep.blockingQueue.join(", ")
                : "empty"}
            </p>
          ) : null}
        </section>
      </section>

      <section className="panel trace-viewer-panel trace-viewer-hand-bar">
        <div className="trace-viewer-section-header">
          <strong>Hand</strong>
          <span>Bottom tray</span>
        </div>
        {currentStep ? (
          <>
            <div className="trace-viewer-hand-scroll" aria-label="Player hand">
              {currentStep.player.hand.length > 0 ? (
                currentStep.player.hand.map((card) => (
                  <article key={card.instanceId} className="trace-viewer-card trace-viewer-hand-card">
                    <div className="trace-viewer-card-header">
                      <strong>{card.name}</strong>
                      <div className="trace-viewer-card-cost">{card.cost}</div>
                    </div>
                    <div className="trace-viewer-card-meta">{card.instanceId}</div>
                    <div className="trace-viewer-card-tags">
                      <span>{card.definitionId}</span>
                    </div>
                  </article>
                ))
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
                  {currentStep.player.discardPile.length > 0
                    ? currentStep.player.discardPile.map((card) => card.name).join(", ")
                    : "empty"}
                </strong>
              </div>
              <div className="trace-viewer-zone-chip">
                Graveyard:{" "}
                <strong>
                  {currentStep.player.graveyard.length > 0
                    ? currentStep.player.graveyard.map((card) => card.name).join(", ")
                    : "empty"}
                </strong>
              </div>
            </div>
          </>
        ) : (
          <p>No hand state available.</p>
        )}
      </section>
    </div>
  );
}
