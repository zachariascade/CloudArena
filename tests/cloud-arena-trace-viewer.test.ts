import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import {
  AppShell,
  CloudArenaBattleState,
  CloudArenaTraceViewer,
} from "../apps/cloud-arcanum-web/src/components/index.js";
import { cloudArenaSampleTrace } from "../apps/cloud-arcanum-web/src/lib/index.js";
import {
  buildBattleViewModelFromSessionSnapshot,
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
    expect(stepViewModels[4]?.player.hand).toHaveLength(4);
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

  it("renders permanent counters in the battlefield view", () => {
    const battleViewModel = buildBattleViewModelFromSessionSnapshot({
      sessionId: "test-session",
      scenarioId: "mixed_guardian",
      status: "active",
      turnNumber: 2,
      phase: "player_action",
      seed: 1,
      player: {
        health: 100,
        maxHealth: 100,
        block: 0,
        energy: 2,
        hand: [],
        drawPileCount: 5,
        discardPile: [],
        graveyard: [],
      },
      enemy: {
        name: "Long Battle Demon",
        health: 28,
        maxHealth: 40,
        block: 0,
        intent: { attackAmount: 12 },
        intentLabel: "attack 12",
      },
      battlefield: [
        {
          instanceId: "sacrificial_seraph_1",
          sourceCardInstanceId: "card_1",
          definitionId: "sacrificial_seraph",
          name: "Sacrificial Seraph",
          controllerId: "player",
          health: 8,
          maxHealth: 8,
          block: 2,
          counters: { "+1/+1": 2 },
          attachments: [],
          attachedTo: null,
          hasActedThisTurn: false,
          isDefending: false,
          slotIndex: 0,
          actions: [{ attackAmount: 3 }],
        },
        null,
        null,
      ],
      blockingQueue: [],
      legalActions: [],
      log: [],
    });

    const html = renderToStaticMarkup(
      createElement(CloudArenaBattleState, {
        battle: battleViewModel,
      }),
    );

    expect(html).toContain("Sacrificial Seraph counters");
    expect(html).toContain("+1/+1 x2");
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
    expect(firstStepHtml).toContain("aria-label=\"Pilgrim Duelist health\"");
    expect(firstStepHtml).toContain("aria-label=\"Long Battle Demon health\"");
    expect(firstStepHtml).toContain("data-variant=\"mtg\"");
    expect(firstStepHtml).toContain("aria-label=\"{3}\"");
    expect(firstStepHtml).toContain("Attack 10 • Defend 5");
    expect(firstStepHtml).toContain("Attack");
    expect(firstStepHtml).toContain("aria-label=\"{1}\"");
    expect(firstStepHtml).toContain("Attack 6");
    expect(secondStepHtml).toContain("Play card_1");
    expect(secondStepHtml).toContain("establish guardian on empty board");
    expect(secondStepHtml).toContain("guardian_1");
    expect(secondStepHtml).toContain("data-variant=\"permanent\"");
    expect(secondStepHtml).toContain("aria-label=\"Guardian health\"");
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
