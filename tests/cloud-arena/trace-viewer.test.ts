import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import type { CloudArenaSessionSnapshot } from "../../src/cloud-arena/api-contract.js";
import {
  buildBattleViewModelFromSessionSnapshot,
  buildCloudArenaViewModelFromSessionSnapshot,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-web-lib.js";
import {
  CloudArenaAppShell,
  CloudArenaBattleState,
} from "../../apps/cloud-arena-web/src/components/index.js";
import { CloudArenaHudBand } from "../../apps/cloud-arena-web/src/components/cloud-arena-hud-band.js";
import { DisplayCard } from "../../apps/cloud-arena-web/src/components/display-card.js";
import { CloudArenaInteractivePage } from "../../apps/cloud-arena-web/src/routes/interactive-page.js";
import { mapArenaPermanentToDisplayCard } from "../../apps/cloud-arena-web/src/lib/cloud-arena-display-card.js";

describe("cloud arena shared battle view models", () => {
  it("renders the interactive battle page shell without crashing", () => {
    const html = renderToStaticMarkup(
      createElement(CloudArenaInteractivePage, {
        apiBaseUrl: "http://127.0.0.1:4311",
      }),
    );

    expect(html).toContain("Interactive Battle");
    expect(html).toContain("Creating battle session");
  });

  it("renders the player HUD before the enemy HUD", () => {
    const html = renderToStaticMarkup(
      createElement(CloudArenaHudBand, {
        enemy: {
          name: "Long Battle Demon",
          health: 28,
          maxHealth: 40,
          block: 0,
          intent: { attackAmount: 12 },
          intentLabel: "attack 12",
        },
        player: {
          health: 32,
          maxHealth: 40,
          block: 3,
          energy: 2,
          handCount: 4,
          drawPileCount: 18,
        },
        maxPlayerEnergy: 3,
        onInspectEnemy: {
          onMouseEnter: () => undefined,
          onMouseLeave: () => undefined,
          onFocus: () => undefined,
          onBlur: () => undefined,
          onClick: () => undefined,
        },
        onInspectPlayer: {
          onMouseEnter: () => undefined,
          onMouseLeave: () => undefined,
          onFocus: () => undefined,
          onBlur: () => undefined,
          onClick: () => undefined,
        },
      }),
    );

    expect(html.indexOf("cloud-arena-hud-card-player")).toBeGreaterThan(-1);
    expect(html.indexOf("cloud-arena-hud-card-enemy")).toBeGreaterThan(-1);
    expect(html.indexOf("cloud-arena-hud-card-player")).toBeLessThan(
      html.indexOf("cloud-arena-hud-card-enemy"),
    );
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
    expect(html).toContain("Cloud Arena");
    expect(html).not.toContain("/trace-viewer");
    expect(html).toContain("http://127.0.0.1:4320/cards");
  });

  it("normalizes session state into the shared battle view model", () => {
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
        drawPile: [],
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
      enemyBattlefield: [null, null, null],
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
        drawPile: [],
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
          isTapped: false,
          isDefending: false,
          slotIndex: 0,
          actions: [],
        },
        null,
        null,
      ],
      enemyBattlefield: [null, null, null],
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
    expect(html).toContain("trace-viewer-board-scroll");
  });

  it("greys out exhausted permanents and tints defending health panels blue", () => {
    const model = mapArenaPermanentToDisplayCard({
      instanceId: "guardian_1",
      sourceCardInstanceId: "card_1",
      definitionId: "guardian",
      name: "Guardian",
      controllerId: "player",
      isCreature: true,
      power: 4,
      health: 9,
      maxHealth: 10,
      block: 2,
      counters: {},
      attachments: [],
      attachedTo: null,
      hasActedThisTurn: true,
      isTapped: false,
      isDefending: true,
      slotIndex: 0,
      actions: [],
    });

    const html = renderToStaticMarkup(createElement(DisplayCard, { model }));

    expect(html).toContain("display-card-shell display-card-permanent is-exhausted");
    expect(html).toContain("This card is set to intercept the next enemy assault.");
    expect(html).toContain("is-exhausted");
  });

  it("keeps ready permanents at full opacity", () => {
    const model = mapArenaPermanentToDisplayCard({
      instanceId: "guardian_1",
      sourceCardInstanceId: "card_1",
      definitionId: "guardian",
      name: "Guardian",
      controllerId: "player",
      isCreature: true,
      power: 4,
      health: 9,
      maxHealth: 10,
      block: 2,
      counters: {},
      attachments: [],
      attachedTo: null,
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    });

    const html = renderToStaticMarkup(createElement(DisplayCard, { model }));

    expect(html).not.toContain("is-exhausted");
    expect(html).toContain("ready");
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
            effectSummary: "Attack 4 • Defend • Pay 1 energy: apply block",
          },
        ],
        drawPile: [],
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
          isTapped: false,
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
      enemyBattlefield: [null, null, null],
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
        drawPile: [],
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
      enemyBattlefield: [null, null, null],
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

});
