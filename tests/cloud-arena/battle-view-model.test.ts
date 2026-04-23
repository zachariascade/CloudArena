import { describe, expect, it } from "vitest";

import type { CloudArenaSessionSnapshot } from "../../src/cloud-arena/api-contract.js";
import { buildBattleViewModelFromSessionSnapshot } from "../../apps/cloud-arena-web/src/lib/cloud-arena-battle-view-model.js";

describe("cloud arena battle view model", () => {
  it("keeps a targeted spell visible in hand while target selection is pending", () => {
    const snapshot: CloudArenaSessionSnapshot = {
      sessionId: "session_1",
      scenarioId: "demon_pack",
      deckId: null,
      status: "active",
      turnNumber: 1,
      phase: "player_action",
      seed: 1,
      createdAt: "2026-04-20T00:00:00.000Z",
      resetSource: {
        scenarioId: "demon_pack",
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
      creatureBattlefieldSlotCount: 5,
      nonCreatureBattlefieldSlotCount: 5,
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

  it("compacts battlefield slots leftward when an earlier slot is empty", () => {
    const snapshot: CloudArenaSessionSnapshot = {
      sessionId: "session_2",
      scenarioId: "demon_pack",
      deckId: null,
      status: "active",
      turnNumber: 1,
      phase: "player_action",
      seed: 1,
      createdAt: "2026-04-20T00:00:00.000Z",
      resetSource: {
        scenarioId: "demon_pack",
        deckId: null,
        seed: 1,
      },
      player: {
        health: 30,
        maxHealth: 30,
        block: 0,
        energy: 3,
        hand: [],
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
      creatureBattlefieldSlotCount: 5,
      nonCreatureBattlefieldSlotCount: 5,
      battlefield: [
        null,
        {
          instanceId: "ally_2",
          sourceCardInstanceId: "card_2",
          definitionId: "guardian",
          name: "Guardian",
          controllerId: "player",
          isCreature: true,
          power: 4,
          health: 10,
          maxHealth: 10,
          block: 0,
          counters: {},
          attachments: [],
          attachedTo: null,
          hasActedThisTurn: false,
          isTapped: false,
          isDefending: false,
          slotIndex: 1,
          actions: [],
          intentLabel: null,
          intentQueueLabels: null,
        },
      ],
      enemyBattlefield: [
        null,
        {
          instanceId: "enemy_2",
          sourceCardInstanceId: "card_3",
          definitionId: "token_imp",
          name: "Token Imp",
          controllerId: "enemy",
          isCreature: true,
          power: 2,
          health: 4,
          maxHealth: 4,
          block: 0,
          counters: {},
          attachments: [],
          attachedTo: null,
          hasActedThisTurn: false,
          isTapped: false,
          isDefending: false,
          slotIndex: 1,
          actions: [],
          intentLabel: null,
          intentQueueLabels: null,
        },
      ],
      pendingTargetRequest: null,
      blockingQueue: [],
      legalActions: [],
      actionHistory: [],
      log: [],
    };

    const battle = buildBattleViewModelFromSessionSnapshot(snapshot);

    expect(battle.battlefield).toHaveLength(1);
    expect(battle.battlefield[0]).toMatchObject({
      instanceId: "ally_2",
      slotIndex: 0,
    });
    expect(battle.battlefieldSlotCount).toBe(2);
    expect(battle.creatureBattlefieldSlotCount).toBe(5);
    expect(battle.nonCreatureBattlefieldSlotCount).toBe(5);
    expect(battle.enemyBattlefield).toHaveLength(1);
    expect(battle.enemyBattlefield?.[0]).toMatchObject({
      instanceId: "enemy_2",
      slotIndex: 0,
    });
  });
});
