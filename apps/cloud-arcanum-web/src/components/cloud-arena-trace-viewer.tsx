import type { ReactElement } from "react";
import { useEffect, useState } from "react";

import {
  type SimulationTrace,
} from "../../../../src/cloud-arena/index.js";
import {
  buildBattleViewModelFromTraceStep,
  buildTraceStepViewModels,
  clampTraceViewerStepIndex,
  formatTraceActionRecord,
  formatTraceEvent,
  groupTraceEventsByTurn,
  getTraceViewerStepCount,
  getTraceViewerStepIndexAfterCommand,
} from "../lib/index.js";
import { CloudArenaBattleState } from "./cloud-arena-battle-state.js";

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
  const currentBattle = currentStep ? buildBattleViewModelFromTraceStep(currentStep) : null;
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
                Intent <strong>{currentBattle?.enemy.intentLabel ?? trace.finalSummary.enemy.intent}</strong>
              </div>
            </div>
            <p className="trace-viewer-keyboard-hint">
              Keyboard: <code>←</code> previous, <code>→</code> next, <code>Home</code> first, <code>End</code> last
            </p>
          </section>
        </div>
      </section>

      {currentBattle ? (
        <CloudArenaBattleState
          battle={currentBattle}
          sidePanel={(
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
            </section>
          )}
        />
      ) : null}
    </div>
  );
}
