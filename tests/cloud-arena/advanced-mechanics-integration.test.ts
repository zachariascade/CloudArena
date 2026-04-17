import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  destroyPermanent,
  getDerivedPermanentStat,
  getLegalActions,
  getPermanentCounterCount,
} from "../../src/cloud-arena/index.js";

describe("cloud arena advanced mechanics integration", () => {
  it("handles chained triggers, static scaling, attachments, and choices together", () => {
    const battle = createBattle({
      seed: 1,
      playerHealth: 100,
      cardDefinitions,
      playerDeck: [
        "guardian",
        "sacrificial_seraph",
        "choir_captain",
        "armory_disciple",
        "holy_blade",
      ],
      enemy: {
        name: "Integration Dummy",
        health: 50,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 12;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const seraphCard = battle.player.hand.find((card) => card.definitionId === "sacrificial_seraph");
    const captainCard = battle.player.hand.find((card) => card.definitionId === "choir_captain");
    const discipleCard = battle.player.hand.find((card) => card.definitionId === "armory_disciple");

    if (!guardianCard || !seraphCard || !captainCard || !discipleCard) {
      throw new Error("Expected advanced mechanics cards in opening hand.");
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
    expect(battle.player.graveyard.map((card) => card.definitionId)).toEqual(["guardian"]);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });

    const captain = battle.battlefield.find((permanent) => permanent?.definitionId === "choir_captain");

    if (!captain) {
      throw new Error("Expected choir_captain on battlefield.");
    }

    expect(getDerivedPermanentStat(battle, captain, "power")).toBe(4);

    destroyPermanent(battle, seraph.instanceId);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: discipleCard.instanceId,
    });

    const disciple = battle.battlefield.find((permanent) => permanent?.definitionId === "armory_disciple");
    const bladeCard = battle.player.hand.find((card) => card.definitionId === "holy_blade");

    if (!disciple || !bladeCard) {
      throw new Error("Expected armory_disciple on battlefield and holy_blade in hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });

    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!blade) {
      throw new Error("Expected holy_blade on battlefield.");
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
      throw new Error("Expected a legal equip target to be available.");
    }

    applyBattleAction(battle, targetAction);

    expect(blade.attachedTo).toBe(disciple.instanceId);
    expect(disciple.attachments).toContain(blade.instanceId);
    expect(getDerivedPermanentStat(battle, disciple, "power")).toBe(3);
    expect(battle.rules.some((event) => event.type === "counter_added")).toBe(true);
    expect(battle.rules.some((event) => event.type === "attachment_attached")).toBe(true);
    expect(
      battle.choices.some((choice) => choice.kind === "select_permanents"),
    ).toBe(true);
    expect(battle.rulesCursor).toBe(battle.rules.length);
  });
});
