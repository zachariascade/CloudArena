import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  getDerivedPermanentStat,
  getLegalActions,
  getPermanentCounterCount,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";

const TARGETING_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  curious_stag: {
    id: "curious_stag",
    name: "Curious Stag",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 3,
    abilities: [],
  },
  targeted_blessing: {
    id: "targeted_blessing",
    name: "Targeted Blessing",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [],
    spellEffects: [
      {
        type: "add_counter",
        target: {
          zone: "battlefield",
          controller: "you",
          cardType: "creature",
        },
        targeting: {
          prompt: "Choose a creature to bless",
        },
        powerDelta: 1,
        healthDelta: 1,
      },
    ],
  },
};

function createTargetingBattle() {
  return createBattle({
    seed: 1,
    cardDefinitions: {
      ...cardDefinitions,
      ...TARGETING_TEST_CARD_DEFINITIONS,
    },
    playerDeck: [
      "guardian",
      "curious_stag",
      "targeted_blessing",
      "attack",
      "defend",
    ],
    enemy: {
      name: "Targeting Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 12 }],
    },
  });
}

describe("cloud arena targeting", () => {
  it("pauses for a target and resolves a targeted blessing on the clicked creature", () => {
    const battle = createTargetingBattle();
    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const stagCard = battle.player.hand.find((card) => card.definitionId === "curious_stag");
    const blessingCard = battle.player.hand.find(
      (card) => card.definitionId === "targeted_blessing",
    );

    if (!guardianCard || !stagCard || !blessingCard) {
      throw new Error("Expected guardian, curious_stag, and targeted_blessing in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: stagCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: blessingCard.instanceId,
    });

    expect(battle.pendingTargetRequest).toBeTruthy();

    const legalActions = getLegalActions(battle);
    expect(legalActions.every((action) => action.type === "choose_target")).toBe(true);
    expect(legalActions).toHaveLength(2);

    const chooseTargetAction = legalActions[0];

    if (!chooseTargetAction || chooseTargetAction.type !== "choose_target") {
      throw new Error("Expected a legal target to be available.");
    }

    applyBattleAction(battle, chooseTargetAction);

    const targetedPermanent = battle.battlefield.find(
      (permanent) => permanent?.instanceId === chooseTargetAction.targetPermanentId,
    );
    const untargetedPermanent = battle.battlefield.find(
      (permanent) => permanent?.instanceId !== chooseTargetAction.targetPermanentId && permanent !== null,
    );

    if (!targetedPermanent || !untargetedPermanent) {
      throw new Error("Expected both permanents on the battlefield.");
    }

    expect(battle.pendingTargetRequest).toBeNull();
    expect(getPermanentCounterCount(targetedPermanent, "+1/+1")).toBe(2);
    expect(getPermanentCounterCount(untargetedPermanent, "+1/+1")).toBe(0);
    expect(getDerivedPermanentStat(battle, targetedPermanent, "power")).toBe(5);
    expect(targetedPermanent.health).toBe(5);
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain(
      "targeted_blessing",
    );
  });
});
