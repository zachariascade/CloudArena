import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  evaluateValueExpression,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const VALUE_EXPRESSION_CARD_DEFINITIONS: CardDefinitionLibrary = {
  angel_guardian: {
    id: "angel_guardian",
    name: "Angel Guardian",
    type: "permanent",
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    health: 10,
    actions: [{ attackAmount: 4 }],
  },
  angel_champion: {
    id: "angel_champion",
    name: "Angel Champion",
    type: "permanent",
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    health: 12,
    actions: [{ attackAmount: 6 }],
  },
  human_soldier: {
    id: "human_soldier",
    name: "Human Soldier",
    type: "permanent",
    cost: 2,
    subtypes: ["Human"],
    onPlay: [],
    health: 9,
    actions: [{ blockAmount: 3 }],
  },
  defend: {
    id: "defend",
    name: "Defend",
    type: "instant",
    cost: 1,
    onPlay: [{ blockAmount: 7, target: "player" }],
  },
  attack: {
    id: "attack",
    name: "Attack",
    type: "instant",
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
};

function createExpressionBattle() {
  return createTestBattle({
    cardDefinitions: VALUE_EXPRESSION_CARD_DEFINITIONS,
    playerDeck: [
      "angel_guardian",
      "angel_champion",
      "human_soldier",
      "defend",
      "attack",
    ],
    enemy: {
      name: "Expression Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 12 }],
    },
  });
}

describe("cloud arena value expressions", () => {
  it("evaluates constants and selector counts", () => {
    const battle = createExpressionBattle();
    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) => entry.definitionId !== "defend" && entry.definitionId !== "attack")) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

    expect(
      evaluateValueExpression(battle, {
        type: "constant",
        value: 3,
      }),
    ).toBe(3);

    expect(
      evaluateValueExpression(battle, {
        type: "count",
        selector: {
          zone: "battlefield",
          controller: "you",
          subtype: "Angel",
        },
      }),
    ).toBe(2);
  });

  it("evaluates counter_count and self properties from context", () => {
    const battle = createExpressionBattle();
    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "angel_guardian");

    if (!guardianCard) {
      throw new Error("Expected angel_guardian in hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const guardianPermanent = battle.battlefield[0];

    if (!guardianPermanent) {
      throw new Error("Expected angel_guardian on battlefield.");
    }

    guardianPermanent.counters = {
      "+1/+1": 2,
    };
    guardianPermanent.block = 5;

    expect(
      evaluateValueExpression(
        battle,
        {
          type: "counter_count",
          target: "self",
          counter: "+1/+1",
        },
        { abilitySourcePermanentId: guardianPermanent.instanceId },
      ),
    ).toBe(2);

    expect(
      evaluateValueExpression(
        battle,
        {
          type: "property",
          target: "self",
          property: "health",
        },
        { abilitySourcePermanentId: guardianPermanent.instanceId },
      ),
    ).toBe(10);

    expect(
      evaluateValueExpression(
        battle,
        {
          type: "property",
          target: "self",
          property: "block",
        },
        { abilitySourcePermanentId: guardianPermanent.instanceId },
      ),
    ).toBe(5);

    expect(
      evaluateValueExpression(
        battle,
        {
          type: "property",
          target: "self",
          property: "damage",
        },
        { abilitySourcePermanentId: guardianPermanent.instanceId },
      ),
    ).toBe(4);
  });

  it("evaluates trigger_subject properties from context", () => {
    const battle = createExpressionBattle();
    battle.player.energy = 10;

    const championCard = battle.player.hand.find((card) => card.definitionId === "angel_champion");

    if (!championCard) {
      throw new Error("Expected angel_champion in hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: championCard.instanceId,
    });

    const championPermanent = battle.battlefield[0];

    if (!championPermanent) {
      throw new Error("Expected angel_champion on battlefield.");
    }

    championPermanent.block = 2;

    expect(
      evaluateValueExpression(
        battle,
        {
          type: "property",
          target: "trigger_subject",
          property: "health",
        },
        { triggerSubjectPermanentId: championPermanent.instanceId },
      ),
    ).toBe(12);

    expect(
      evaluateValueExpression(
        battle,
        {
          type: "property",
          target: "trigger_subject",
          property: "damage",
        },
        { triggerSubjectPermanentId: championPermanent.instanceId },
      ),
    ).toBe(6);
  });
});
