import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppShell, CloudArenaTraceViewer } from "../apps/cloud-arcanum-web/src/components/index.js";
import { cloudArenaSampleTrace } from "../apps/cloud-arcanum-web/src/lib/index.js";
import {
  buildBattleViewModelFromTraceStep,
  buildTraceStepViewModels,
  groupTraceEventsByTurn,
  getTraceViewerStepIndexAfterCommand,
} from "../apps/cloud-arcanum-web/src/lib/index.js";
import { CloudArenaInteractivePage } from "../apps/cloud-arcanum-web/src/routes/cloud-arena-interactive-page.js";
import { CloudArenaTraceViewerPage } from "../apps/cloud-arcanum-web/src/routes/cloud-arena-trace-viewer-page.js";

describe("cloud arena trace viewer scaffold", () => {
  it("renders the trace viewer page without crashing", () => {
    const html = renderToStaticMarkup(createElement(CloudArenaTraceViewerPage));

    expect(html).toContain("Trace Viewer");
    expect(html).toContain("Mixed Guardian");
  });

  it("renders the interactive battle page shell without crashing", () => {
    const html = renderToStaticMarkup(
      createElement(CloudArenaInteractivePage, {
        apiBaseUrl: "http://127.0.0.1:4310",
      }),
    );

    expect(html).toContain("Interactive Battle");
    expect(html).toContain("Creating battle session");
  });

  it("includes the Cloud Arena link in app shell navigation", () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(AppShell, {
          children: createElement("div", null, "content"),
        }),
      ),
    );

    expect(html).toContain("/cloud-arena");
    expect(html).toContain("/cloud-arena/trace-viewer");
    expect(html).toContain("Cloud Arena");
    expect(html).toContain("Replay");
  });

  it("renders sample trace metadata and battle log content", () => {
    const html = renderToStaticMarkup(
      createElement(CloudArenaTraceViewer, {
        trace: cloudArenaSampleTrace,
      }),
    );

    expect(html).toContain("heuristic_baseline");
    expect(html).toContain("Winner");
    expect(html).toContain("Battle log");
    expect(html).toContain("battle created");
  });

  it("builds step view models with reconstructed hand and battlefield state", () => {
    const stepViewModels = buildTraceStepViewModels(cloudArenaSampleTrace);

    expect(stepViewModels[0]?.actionRecord).toBeNull();
    expect(stepViewModels[0]?.battlefield[0]).toBeNull();
    expect(stepViewModels[0]?.player.hand.map((card) => card.name)).toEqual([
      "Guardian",
      "Attack",
      "Defend",
      "Attack",
      "Defend",
    ]);
    expect(stepViewModels[1]?.battlefield[0]?.instanceId).toBe("guardian_1");
    expect(stepViewModels[4]?.turnNumber).toBe(2);
    expect(stepViewModels[4]?.player.hand).toHaveLength(5);
    expect(stepViewModels[4]?.visibleLog.at(-1)?.type).toBe("block_gained");
  });

  it("groups visible log events by turn for the log panel", () => {
    const stepViewModels = buildTraceStepViewModels(cloudArenaSampleTrace);
    const groups = groupTraceEventsByTurn(
      stepViewModels[4]?.visibleLog ?? [],
      stepViewModels[4]?.currentEvents ?? [],
    );

    expect(groups.map((group) => group.turnNumber)).toEqual([1, 2]);
    expect(groups[1]?.events.at(-1)?.event.type).toBe("block_gained");
  });

  it("normalizes replay steps into the shared battle view model", () => {
    const stepViewModels = buildTraceStepViewModels(cloudArenaSampleTrace);
    const battleViewModel = buildBattleViewModelFromTraceStep(stepViewModels[1]!);

    expect(battleViewModel.turnNumber).toBe(1);
    expect(battleViewModel.player.hand).toHaveLength(4);
    expect(battleViewModel.enemy.intentLabel).toContain("attack");
    expect(battleViewModel.battlefield[0]?.instanceId).toBe("guardian_1");
    expect(battleViewModel.legalActions).toEqual([]);
  });

  it("updates current action and reason when initial step changes", () => {
    const firstStepHtml = renderToStaticMarkup(
      createElement(CloudArenaTraceViewer, {
        trace: cloudArenaSampleTrace,
        initialStepIndex: 0,
      }),
    );
    const secondStepHtml = renderToStaticMarkup(
      createElement(CloudArenaTraceViewer, {
        trace: cloudArenaSampleTrace,
        initialStepIndex: 1,
      }),
    );

    expect(firstStepHtml).toContain("Opening state");
    expect(firstStepHtml).toContain("Opening hand and board state before the first action.");
    expect(firstStepHtml).toContain("Keyboard:");
    expect(firstStepHtml).toContain("Guardian</strong><div class=\"trace-viewer-card-cost\">3</div>");
    expect(firstStepHtml).toContain("card_1");
    expect(firstStepHtml).toContain("Attack</strong><div class=\"trace-viewer-card-cost\">1</div>");
    expect(firstStepHtml).toContain("card_3");
    expect(secondStepHtml).toContain("Play card_1");
    expect(secondStepHtml).toContain("establish guardian on empty board");
    expect(secondStepHtml).toContain("guardian_1");
    expect(secondStepHtml).toContain("Turn 1");
  });

  it("advances step indices through the trace controls helper", () => {
    expect(getTraceViewerStepIndexAfterCommand(cloudArenaSampleTrace, 0, "next")).toBe(1);
    expect(getTraceViewerStepIndexAfterCommand(cloudArenaSampleTrace, 1, "previous")).toBe(0);
    expect(
      getTraceViewerStepIndexAfterCommand(cloudArenaSampleTrace, 0, "last"),
    ).toBe(cloudArenaSampleTrace.actionHistory.length);
  });
});
