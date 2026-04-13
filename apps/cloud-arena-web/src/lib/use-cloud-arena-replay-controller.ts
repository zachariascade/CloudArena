import { useEffect, useMemo, useState } from "react";

import type { SimulationTrace } from "../../../../src/cloud-arena/index.js";

import {
  buildCloudArenaViewModelFromTraceStep,
} from "./cloud-arena-view-model.js";
import {
  buildTraceStepViewModels,
  clampTraceViewerStepIndex,
  getTraceViewerStepCount,
  getTraceViewerStepIndexAfterCommand,
} from "./cloud-arena-trace-view-model.js";

export function useCloudArenaReplayController(
  trace: SimulationTrace,
  initialStepIndex = 0,
): {
  currentStepIndex: number;
  stepCount: number;
  viewModel: ReturnType<typeof buildCloudArenaViewModelFromTraceStep> | null;
  navigate: (command: "first" | "previous" | "next" | "last") => void;
} {
  const stepCount = getTraceViewerStepCount(trace);
  const stepViewModels = useMemo(() => buildTraceStepViewModels(trace), [trace]);
  const [currentStepIndex, setCurrentStepIndex] = useState(
    clampTraceViewerStepIndex(trace, initialStepIndex),
  );
  const clampedStepIndex = clampTraceViewerStepIndex(trace, currentStepIndex);
  const currentStep = stepViewModels[clampedStepIndex] ?? null;

  useEffect(() => {
    setCurrentStepIndex(clampTraceViewerStepIndex(trace, initialStepIndex));
  }, [initialStepIndex, trace]);

  function navigate(command: "first" | "previous" | "next" | "last"): void {
    setCurrentStepIndex((existingStepIndex) =>
      getTraceViewerStepIndexAfterCommand(trace, existingStepIndex, command),
    );
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

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        navigate("previous");
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        navigate("next");
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        navigate("first");
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        navigate("last");
      }
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, [trace]);

  return {
    currentStepIndex: clampedStepIndex,
    stepCount,
    viewModel: currentStep
      ? buildCloudArenaViewModelFromTraceStep({
          currentStepIndex: clampedStepIndex,
          stepCount,
          step: currentStep,
          trace,
        })
      : null,
    navigate,
  };
}
