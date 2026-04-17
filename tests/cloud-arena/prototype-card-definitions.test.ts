import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  getLegalActions,
  getDerivedPermanentStat,
  getPermanentCounterCount,
} from "../../src/cloud-arena/index.js";

describe("cloud arena prototype card definitions", () => {
  it("supports sacrificial_seraph in the default card library", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "guardian",
        "sacrificial_seraph",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Prototype Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const seraphCard = battle.player.hand.find((card) => card.definitionId === "sacrificial_seraph");

    if (!guardianCard || !seraphCard) {
      throw new Error("Expected prototype cards in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: seraphCard.instanceId,
    });

    const seraph = battle.battlefield.find((permanent) => permanent?.definitionId === "sacrificial_seraph");

    if (!seraph) {
      throw new Error("Expected sacrificial_seraph on battlefield.");
    }

    expect(getPermanentCounterCount(seraph, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, seraph, "power")).toBe(4);
    expect(battle.player.graveyard.map((card) => card.definitionId)).toContain("guardian");
  });

  it("supports choir_captain static scaling in the default card library", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "choir_captain",
        "guardian",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Prototype Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const captainCard = battle.player.hand.find((card) => card.definitionId === "choir_captain");
    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");

    if (!captainCard || !guardianCard) {
      throw new Error("Expected choir_captain and guardian in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });

    const captain = battle.battlefield.find((permanent) => permanent?.definitionId === "choir_captain");

    if (!captain) {
      throw new Error("Expected choir_captain on battlefield.");
    }

    expect(getDerivedPermanentStat(battle, captain, "power")).toBe(4);
  });

  it("supports armory_disciple equipping holy_blade in the default card library", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "armory_disciple",
        "holy_blade",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Prototype Dummy",
        health: 40,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const discipleCard = battle.player.hand.find((card) => card.definitionId === "armory_disciple");

    if (!discipleCard) {
      throw new Error("Expected armory_disciple in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: discipleCard.instanceId,
    });

    const bladeCard = battle.player.hand.find((card) => card.definitionId === "holy_blade");

    if (!bladeCard) {
      throw new Error("Expected holy_blade in hand after playing armory_disciple.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });

    const disciple = battle.battlefield.find((permanent) => permanent?.definitionId === "armory_disciple");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!disciple || !blade) {
      throw new Error("Expected armory_disciple and holy_blade on battlefield.");
    }

    const equipAction = getLegalActions(battle).find(
      (action) =>
        action.type === "use_permanent_action" &&
        action.permanentId === blade.instanceId &&
        action.action === "equip",
    );

    if (!equipAction || equipAction.type !== "use_permanent_action") {
      throw new Error("Expected equip action for holy_blade.");
    }

    applyBattleAction(battle, equipAction);

    const targetAction = getLegalActions(battle).find(
      (action) =>
        action.type === "choose_target" &&
        action.targetPermanentId === disciple.instanceId,
    );

    if (!targetAction || targetAction.type !== "choose_target") {
      throw new Error("Expected a legal target for holy_blade.");
    }

    applyBattleAction(battle, targetAction);

    expect(blade.attachedTo).toBe(disciple.instanceId);
    expect(disciple.attachments).toContain(blade.instanceId);
    expect(getDerivedPermanentStat(battle, disciple, "power")).toBe(3);
    expect(disciple.health).toBe(5);
    expect(disciple.maxHealth).toBe(5);
  });
});
