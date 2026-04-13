import type { ReactElement } from "react";

type CloudArenaReplayControlsProps = {
  currentStepIndex: number;
  onNavigate: (command: "first" | "previous" | "next" | "last") => void;
  stepCount: number;
};

export function CloudArenaReplayControls({
  currentStepIndex,
  onNavigate,
  stepCount,
}: CloudArenaReplayControlsProps): ReactElement {
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
