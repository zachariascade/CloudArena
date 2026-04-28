import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  createBattle,
  getPermanentCounterCount,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { TEST_CARD_DEFINITIONS } from "./helpers.js";

const COMBAT_TRIGGER_TEST_DEFINITIONS: CardDefinitionLibrary = {
  battle_chorus: {
    id: "battle_chorus",
    name: "Battle Chorus",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 3,
    health: 15,
    abilities: [
      {
        kind: "triggered",
        trigger: {
          event: "permanent_attacked",
          selector: { relation: "self" },
        },
        effects: [
          {
            type: "add_counter",
            target: "self",
            counter: "rage",
            stat: "power",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
      {
        kind: "triggered",
        trigger: {
          event: "permanent_blocked",
          selector: { relation: "self" },
        },
        effects: [
          {
            type: "add_counter",
            target: "self",
            counter: "fortify",
            stat: "health",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
      {
        kind: "triggered",
        trigger: {
          event: "permanent_becomes_blocked",
          selector: { relation: "self" },
        },
        effects: [
          {
            type: "add_counter",
            target: "self",
            counter: "shield",
            stat: "health",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
    ],
  },
};

function createCombatTriggerBattle() {
  return createBattle({
    seed: 1,
    summoningSicknessPolicy: "disabled",
    cardDefinitions: {
      ...TEST_CARD_DEFINITIONS,
      ...COMBAT_TRIGGER_TEST_DEFINITIONS,
    },
    playerDeck: [
      "battle_chorus",
      "defend",
      "defend",
      "defend",
      "defend",
    ],
    enemy: {
      name: "Combat Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 6 }],
    },
  });
}

describe("cloud arena combat-state triggers", () => {
  it("fires attack, block, and becomes-blocked triggers", () => {
    const battle = createCombatTriggerBattle();
    battle.player.energy = 10;

    const chorusCard = battle.player.hand.find((card) => card.definitionId === "battle_chorus");

    if (!chorusCard) {
      throw new Error("Expected battle_chorus in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: chorusCard.instanceId,
    });

    const chorusPermanent = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "battle_chorus",
    );

    if (!chorusPermanent) {
      throw new Error("Expected battle_chorus on the battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: chorusPermanent.instanceId,
      action: "attack",
    });
    const leaderTarget = battle.enemyBattlefield.find((entry) => entry?.isEnemyLeader);

    if (!leaderTarget) {
      throw new Error("Expected enemy leader target.");
    }

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: leaderTarget.instanceId,
    });

    expect(getPermanentCounterCount(chorusPermanent, "rage", "power")).toBe(1);
    expect(
      battle.rules.some((event) => event.type === "permanent_attacked"),
    ).toBe(true);

    applyBattleAction(battle, { type: "end_turn" });

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: chorusPermanent.instanceId,
      action: "defend",
    });

    expect(getPermanentCounterCount(chorusPermanent, "fortify", "health")).toBe(1);
    expect(
      battle.rules.some((event) => event.type === "permanent_blocked"),
    ).toBe(true);

    applyBattleAction(battle, { type: "end_turn" });

    expect(getPermanentCounterCount(chorusPermanent, "shield", "health")).toBe(1);
    expect(
      battle.rules.some((event) => event.type === "permanent_becomes_blocked"),
    ).toBe(true);
    expect(chorusPermanent.health).toBeGreaterThan(0);
  });
});
