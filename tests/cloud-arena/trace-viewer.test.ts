import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { CloudArenaSessionSnapshot } from "../../src/cloud-arena/api-contract.js";
import {
  cloudArenaSampleTrace,
  buildBattleViewModelFromSessionSnapshot,
  buildBattleViewModelFromTraceStep,
  buildCloudArenaViewModelFromSessionSnapshot,
  buildCloudArenaViewModelFromTraceStep,
  buildTraceStepViewModels,
  groupTraceEventsByTurn,
  getTraceViewerStepIndexAfterCommand,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-web-lib.js";
import {
  CloudArenaAppShell,
  CloudArenaBattleState,
  CloudArenaTraceViewer,
} from "../../apps/cloud-arena-web/src/components/index.js";
import { CloudArenaInteractivePage } from "../../apps/cloud-arena-web/src/routes/interactive-page.js";
import { CloudArenaTraceViewerPage } from "../../apps/cloud-arena-web/src/routes/trace-viewer-page.js";

describe("cloud arena trace viewer scaffold", () => {
  it("renders the trace viewer page without crashing", () => {
    const html = renderToStaticMarkup(createElement(CloudArenaTraceViewerPage));

    expect(html).toContain("Trace Viewer");
    expect(html).toContain("Mixed Guardian");
  });

  it("renders the interactive battle page shell without crashing", () => {
    const html = renderToStaticMarkup(
      createElement(CloudArenaInteractivePage, {
        apiBaseUrl: "http://127.0.0.1:4311",
      }),
    );

    expect(html).toContain("Interactive Battle");
    expect(html).toContain("Creating battle session");
  });

  it("renders a separate Cloud Arena shell navigation", () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(CloudArenaAppShell, {
          cloudArcanumWebBaseUrl: "http://127.0.0.1:4320",
          children: createElement("div", null, "content"),
        }),
      ),
    );

    expect(html).toContain('href="/"');
    expect(html).toContain("/trace-viewer");
    expect(html).toContain("Cloud Arena");
    expect(html).toContain("Replay");
    expect(html).toContain("http://127.0.0.1:4320/cards");
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
      "Choir Captain",
    ]);
    expect(stepViewModels[1]?.battlefield[0]?.instanceId).toBe("guardian_1");
    expect(stepViewModels[4]?.turnNumber).toBe(2);
    expect(stepViewModels[4]?.player.hand).toHaveLength(4);
    expect(stepViewModels[4]?.visibleLog.at(-1)?.type).toBe("permanent_summoned");
  });

  it("groups visible log events by turn for the log panel", () => {
    const stepViewModels = buildTraceStepViewModels(cloudArenaSampleTrace);
    const groups = groupTraceEventsByTurn(
      stepViewModels[4]?.visibleLog ?? [],
      stepViewModels[4]?.currentEvents ?? [],
    );

    expect(groups.map((group) => group.turnNumber)).toEqual([1, 2]);
    expect(groups[1]?.events.at(-1)?.event.type).toBe("permanent_summoned");
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

  it("builds a shared screen view model for replay and interactive modes", () => {
    const stepViewModels = buildTraceStepViewModels(cloudArenaSampleTrace);
    const replayViewModel = buildCloudArenaViewModelFromTraceStep({
      currentStepIndex: 1,
      stepCount: stepViewModels.length,
      step: stepViewModels[1]!,
      trace: cloudArenaSampleTrace,
    });

    expect(replayViewModel.mode).toBe("replay");
    expect(replayViewModel.summary.some((entry) => entry.label === "Agent")).toBe(true);
    expect(replayViewModel.currentAction?.title).toContain("Play card_1");
    expect(replayViewModel.logGroups.length).toBeGreaterThan(0);

    const interactiveViewModel = buildCloudArenaViewModelFromSessionSnapshot({
      sessionId: "test-session",
      scenarioId: "mixed_guardian",
      status: "active",
      turnNumber: 2,
      phase: "player_action",
      seed: 1,
      createdAt: "2026-04-09T12:00:00.000Z",
      resetSource: {
        scenarioId: "mixed_guardian",
        seed: 1,
      },
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
      battlefield: [null, null, null],
      blockingQueue: [],
      legalActions: [],
      actionHistory: [],
      log: [],
    });

    expect(interactiveViewModel.mode).toBe("interactive");
    expect(interactiveViewModel.session?.sessionId).toBe("test-session");
    expect(interactiveViewModel.session?.actionCount).toBe(0);
    expect(interactiveViewModel.currentAction?.meta.some((entry) => entry.label === "Actions")).toBe(true);
  });

  it("renders permanent counters in the battlefield view", () => {
    const battleViewModel = buildBattleViewModelFromSessionSnapshot({
      sessionId: "test-session",
      scenarioId: "mixed_guardian",
      status: "active",
      turnNumber: 2,
      phase: "player_action",
      seed: 1,
      createdAt: "2026-04-09T12:00:00.000Z",
      resetSource: {
        scenarioId: "mixed_guardian",
        seed: 1,
      },
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
          isCreature: true,
          power: 3,
          health: 8,
          maxHealth: 8,
          block: 2,
          counters: { "+1/+1": 2 },
          attachments: [],
          attachedTo: null,
          hasActedThisTurn: false,
          isDefending: false,
          slotIndex: 0,
          actions: [],
        },
        null,
        null,
      ],
      blockingQueue: [],
      legalActions: [],
      actionHistory: [],
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

  it("renders legal action labels and disabled controls in the interactive battle view", () => {
    const battleViewModel = buildBattleViewModelFromSessionSnapshot({
      sessionId: "test-session",
      scenarioId: "mixed_guardian",
      status: "active",
      turnNumber: 2,
      phase: "player_action",
      seed: 1,
      createdAt: "2026-04-09T12:00:00.000Z",
      resetSource: {
        scenarioId: "mixed_guardian",
        seed: 1,
      },
      player: {
        health: 100,
        maxHealth: 100,
        block: 0,
        energy: 2,
        hand: [
          {
            instanceId: "card_1",
            definitionId: "guardian",
            name: "Guardian",
            cost: 2,
            effectSummary: "Attack 4 • Defend • apply block",
          },
        ],
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
          instanceId: "guardian_1",
          sourceCardInstanceId: "card_1",
          definitionId: "guardian",
          name: "Guardian",
          controllerId: "player",
          isCreature: true,
          power: 4,
          health: 8,
          maxHealth: 8,
          block: 0,
          counters: {},
          attachments: [],
          attachedTo: null,
          hasActedThisTurn: false,
          isDefending: false,
          slotIndex: 0,
          actions: [
            {
              id: "guardian_apply_block",
              kind: "activated",
              activation: { type: "action", actionId: "apply_block" },
              effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 3 } }],
            },
          ],
        },
        null,
        null,
      ],
      blockingQueue: [],
      legalActions: [
        {
          action: { type: "play_card", cardInstanceId: "card_1" },
          label: "Play Guardian",
          source: "hand",
        },
        {
          action: { type: "use_permanent_action", permanentId: "guardian_1", source: "rules", action: "attack" },
          label: "Attack with Guardian",
          source: "battlefield",
        },
        {
          action: { type: "end_turn" },
          label: "End turn",
          source: "turn",
        },
      ],
      actionHistory: [],
      log: [],
    });

    const html = renderToStaticMarkup(
      createElement(CloudArenaBattleState, {
        battle: battleViewModel,
        disableHandCardActions: true,
        disablePermanentActions: true,
        disableTurnActions: true,
        playableHandCardInstanceIds: ["card_1"],
        playablePermanentActions: [{ permanentId: "guardian_1", action: "attack" }],
        turnActions: [{ action: { type: "end_turn" }, label: "End turn" }],
      }),
    );

    expect(html).toContain("Hand actions");
    expect(html).toContain("Battlefield actions");
    expect(html).toContain("Hand");
    expect(html).toContain("Battlefield");
    expect(html).toContain("aria-haspopup=\"menu\"");
    expect(html).toContain("aria-expanded=\"false\"");
    expect(html).toContain("End turn (E)");
    expect(html).toContain("disabled");
  });

  it("keeps interactive action groups aligned with the session legal actions", () => {
    const snapshot: CloudArenaSessionSnapshot = {
      sessionId: "test-session",
      scenarioId: "mixed_guardian",
      status: "active",
      turnNumber: 2,
      phase: "player_action",
      seed: 1,
      createdAt: "2026-04-09T12:00:00.000Z",
      resetSource: {
        scenarioId: "mixed_guardian",
        seed: 1,
      },
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
      battlefield: [null, null, null],
      blockingQueue: [],
      legalActions: [
        {
          action: { type: "play_card", cardInstanceId: "card_1" },
          label: "Play Guardian",
          source: "hand",
        },
        {
          action: { type: "use_permanent_action", permanentId: "guardian_1", source: "rules", action: "attack" },
          label: "Attack with Guardian",
          source: "battlefield",
        },
        {
          action: { type: "end_turn" },
          label: "End turn",
          source: "turn",
        },
      ],
      actionHistory: [],
      log: [],
    };

    const battleViewModel = buildBattleViewModelFromSessionSnapshot(snapshot);

    expect([
      ...battleViewModel.actionGroups.hand,
      ...battleViewModel.actionGroups.battlefield,
      ...battleViewModel.actionGroups.turn,
    ]).toEqual(battleViewModel.legalActions);
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
    expect(firstStepHtml).toContain("Attack 10 • Defend • apply block");
    expect(firstStepHtml).toContain("Attack");
    expect(firstStepHtml).toContain("aria-label=\"{1}\"");
    expect(firstStepHtml).toContain("Attack 6");
    expect(secondStepHtml).toContain("Play card_1");
    expect(secondStepHtml).toContain("establish guardian on empty board");
    expect(secondStepHtml).toContain("Guardian, Keeper of the Gate");
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
