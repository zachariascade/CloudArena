import type { ReactElement } from "react";

import {
  type SimulationTrace,
} from "../../../../src/cloud-arena/index.js";
import {
  useCloudArenaReplayController,
} from "../lib/cloud-arena-web-lib.js";
import { CloudArenaBattleState } from "./cloud-arena-battle-state.js";
import { CloudArenaLogPanel } from "./cloud-arena-log-panel.js";
import { CloudArenaReplayControls } from "./cloud-arena-replay-controls.js";

type CloudArenaTraceViewerProps = {
  trace: SimulationTrace;
  initialStepIndex?: number;
};

export function CloudArenaTraceViewer({
  trace,
  initialStepIndex = 0,
}: CloudArenaTraceViewerProps): ReactElement {
  const {
    currentStepIndex,
    stepCount,
    viewModel: currentViewModel,
    navigate,
  } = useCloudArenaReplayController(trace, initialStepIndex);

  return (
    <div
      className="trace-viewer-layout"
      tabIndex={0}
      aria-label="Cloud Arena trace viewer"
    >
      <section className="panel trace-viewer-hero">
        <div className="summary-row trace-viewer-metadata">
          {currentViewModel?.summary.map((entry) => (
            <div key={`${entry.label}-${entry.value}`} className="summary-pill">
              {entry.label} <strong>{entry.value}</strong>
            </div>
          ))}
        </div>

        <div className="trace-viewer-hero-grid">
          <CloudArenaReplayControls
            currentStepIndex={currentStepIndex}
            onNavigate={navigate}
            stepCount={stepCount}
          />

          <section className="trace-viewer-current-action">
            <strong>Current action</strong>
            <p>{currentViewModel?.currentAction?.title ?? "Opening state"}</p>
            <p>{currentViewModel?.currentAction?.detail ?? "Opening hand and board state before the first action."}</p>
            <div className="summary-row trace-viewer-inline-meta">
              {currentViewModel?.currentAction?.meta.map((entry) => (
                <div key={`${entry.label}-${entry.value}`} className="summary-pill">
                  {entry.label} <strong>{entry.value}</strong>
                </div>
              ))}
            </div>
            {currentViewModel?.currentAction?.keyboardHint ? (
              <p className="trace-viewer-keyboard-hint">
                Keyboard: <code>←</code> previous, <code>→</code> next, <code>Home</code> first, <code>End</code> last
              </p>
            ) : null}
          </section>
        </div>
      </section>

      {currentViewModel ? (
        <CloudArenaBattleState
          battle={currentViewModel.battle}
          sidePanel={<CloudArenaLogPanel groups={currentViewModel.logGroups} />}
        />
      ) : null}
    </div>
  );
}
