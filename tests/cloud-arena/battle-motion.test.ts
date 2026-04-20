import { describe, expect, it } from "vitest";

import type { CloudArenaBattleViewModel } from "../../apps/cloud-arena-web/src/lib/cloud-arena-battle-view-model.js";
import { getBattleMotionDiff } from "../../apps/cloud-arena-web/src/lib/cloud-arena-battle-motion.js";

function makePermanent(
  overrides: Partial<NonNullable<CloudArenaBattleViewModel["battlefield"][number]>> & {
    instanceId: string;
    definitionId: string;
    name: string;
  },
): NonNullable<CloudArenaBattleViewModel["battlefield"][number]> {
  return {
    sourceCardInstanceId: overrides.instanceId,
    controllerId: "player",
    intentLabel: null,
    intentQueueLabels: null,
    isCreature: true,
    power: 3,
    health: 5,
    maxHealth: 5,
    block: 0,
    counters: {},
    attachments: [],
    attachedTo: null,
    hasActedThisTurn: false,
    isTapped: false,
    isDefending: false,
    slotIndex: 0,
    actions: [],
    ...overrides,
  };
}

function makeBattle(
  overrides: Partial<CloudArenaBattleViewModel>,
): CloudArenaBattleViewModel {
  return {
    turnNumber: 1,
    phase: "player_action",
    actionGroups: { hand: [], battlefield: [], turn: [] },
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
      intent: {} as CloudArenaBattleViewModel["enemy"]["intent"],
      intentLabel: "",
      intentQueueLabels: [],
    },
    battlefield: [],
    enemyBattlefield: [],
    pendingTargetRequest: null,
    blockingQueue: [],
    legalActions: [],
    ...overrides,
  };
}

describe("cloud arena battle motion", () => {
  it("detects attack, hit, and death transitions from battlefield diffs", () => {
    const previousBattle = makeBattle({
      battlefield: [
        makePermanent({
          instanceId: "ally_1",
          definitionId: "guardian",
          name: "Guardian",
          slotIndex: 0,
          isTapped: false,
          hasActedThisTurn: false,
        }),
        makePermanent({
          instanceId: "ally_2",
          definitionId: "token_angel",
          name: "Token Angel",
          slotIndex: 1,
          health: 4,
          block: 2,
        }),
      ],
      enemyBattlefield: [
        makePermanent({
          instanceId: "enemy_1",
          definitionId: "token_imp",
          name: "Token Imp",
          slotIndex: 0,
          controllerId: "enemy",
          health: 3,
          block: 0,
        }),
      ],
    });

    const currentBattle = makeBattle({
      battlefield: [
        makePermanent({
          instanceId: "ally_1",
          definitionId: "guardian",
          name: "Guardian",
          slotIndex: 0,
          isTapped: true,
          hasActedThisTurn: true,
        }),
        null,
      ],
      enemyBattlefield: [
        makePermanent({
          instanceId: "enemy_1",
          definitionId: "token_imp",
          name: "Token Imp",
          slotIndex: 0,
          controllerId: "enemy",
          health: 1,
          block: 0,
          hasActedThisTurn: false,
        }),
      ],
    });

    const diff = getBattleMotionDiff(previousBattle, currentBattle);

    expect(diff.attackIds).toEqual(["ally_1"]);
    expect(diff.hitIds).toEqual(["enemy_1"]);
    expect(diff.deathOverlays).toHaveLength(1);
    expect(diff.deathOverlays[0]).toMatchObject({
      zoneKeyPrefix: "battlefield",
      slotIndex: 1,
      permanent: {
        instanceId: "ally_2",
        name: "Token Angel",
      },
    });
  });
});
