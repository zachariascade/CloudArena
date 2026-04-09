import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  destroyPermanent,
  getDerivedPermanentStat,
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

    battle.player.energy = 10;

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

    expect(seraph.counters?.["+1/+1"]).toBe(1);
    expect(battle.player.graveyard.map((card) => card.definitionId)).toEqual(["guardian"]);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });

    const captain = battle.battlefield.find((permanent) => permanent?.definitionId === "choir_captain");

    if (!captain) {
      throw new Error("Expected choir_captain on battlefield.");
    }

    expect(getDerivedPermanentStat(battle, captain, "damage")).toBe(4);

    destroyPermanent(battle, seraph.instanceId);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: discipleCard.instanceId,
    });

    const disciple = battle.battlefield.find((permanent) => permanent?.definitionId === "armory_disciple");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!disciple || !blade) {
      throw new Error("Expected armory_disciple and holy_blade on battlefield.");
    }

    expect(blade.attachedTo).toBe(disciple.instanceId);
    expect(disciple.attachments).toContain(blade.instanceId);
    expect(battle.rules.some((event) => event.type === "counter_added")).toBe(true);
    expect(battle.rules.some((event) => event.type === "attachment_attached")).toBe(true);
    expect(
      battle.choices.some((choice) => choice.kind === "select_permanents"),
    ).toBe(true);
    expect(
      battle.choices.some((choice) => choice.kind === "optional_effect" && choice.selectedIds.includes("yes")),
    ).toBe(true);
    expect(battle.rulesCursor).toBe(battle.rules.length);
  });
});
