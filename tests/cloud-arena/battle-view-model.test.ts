import { describe, expect, it } from "vitest";

import type { CloudArenaSessionSnapshot } from "../../src/cloud-arena/api-contract.js";
import { buildBattleViewModelFromSessionSnapshot } from "../../apps/cloud-arena-web/src/lib/cloud-arena-battle-view-model.js";

describe("cloud arena battle view model", () => {
  it("keeps a targeted spell visible in hand while target selection is pending", () => {
    const snapshot: CloudArenaSessionSnapshot = {
      sessionId: "session_1",
      scenarioId: "mixed_guardian",
      deckId: null,
      status: "active",
      turnNumber: 1,
      phase: "player_action",
      seed: 1,
      createdAt: "2026-04-20T00:00:00.000Z",
      resetSource: {
        scenarioId: "mixed_guardian",
        deckId: null,
        seed: 1,
      },
      player: {
        health: 30,
        maxHealth: 30,
        block: 0,
        energy: 2,
        hand: [
          {
            instanceId: "card_1",
            definitionId: "guardian",
            name: "Guardian",
            cost: 3,
            effectSummary: "Attack 3 • Defend",
          },
        ],
        drawPile: [],
        drawPileCount: 0,
        discardPile: [],
        graveyard: [],
      },
      enemy: {
        name: "Enemy",
        health: 30,
        maxHealth: 30,
        block: 0,
        intent: { attackAmount: 3 },
        intentLabel: "attack 3",
        intentQueueLabels: [],
      },
      battlefield: [],
      enemyBattlefield: [],
      pendingTargetRequest: {
        id: "target_1",
        prompt: "Choose a creature to bless",
        optional: false,
        targetKind: "card",
        selector: {
          zone: "battlefield",
          controller: "you",
          cardType: "creature",
        },
        context: {
          pendingCardPlay: {
            instanceId: "card_2",
            definitionId: "focused_blessing",
            name: "Focused Blessing",
            cost: 1,
            effectSummary: "Bless a creature.",
          },
          pendingCardPlayHandIndex: 0,
        },
      },
      blockingQueue: [],
      legalActions: [],
      actionHistory: [],
      log: [],
    };

    const battle = buildBattleViewModelFromSessionSnapshot(snapshot);

    expect(battle.player.hand).toHaveLength(2);
    expect(battle.player.hand.map((card) => card.instanceId)).toEqual(["card_2", "card_1"]);
    expect(battle.player.hand[0]).toMatchObject({
      instanceId: "card_2",
      definitionId: "focused_blessing",
      name: "Focused Blessing",
    });
  });
});
