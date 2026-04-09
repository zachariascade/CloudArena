import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  getDerivedPermanentStat,
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

    expect(seraph.counters?.["+1/+1"]).toBe(1);
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

    expect(getDerivedPermanentStat(battle, captain, "damage")).toBe(4);
  });

  it("supports armory_disciple free equipment attachment in the default card library", () => {
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

    const disciple = battle.battlefield.find((permanent) => permanent?.definitionId === "armory_disciple");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");

    if (!disciple || !blade) {
      throw new Error("Expected armory_disciple and holy_blade on battlefield.");
    }

    expect(blade.attachedTo).toBe(disciple.instanceId);
    expect(disciple.attachments).toContain(blade.instanceId);
    expect(
      battle.choices.some((choice) =>
        choice.kind === "optional_effect" &&
        choice.selectedIds.includes("yes"),
      ),
    ).toBe(true);
  });
});
