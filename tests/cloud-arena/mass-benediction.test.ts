import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  getDerivedPermanentStat,
  getPermanentCounterCount,
} from "../../src/cloud-arena/index.js";

describe("cloud arena mass benediction", () => {
  it("adds a +1/+1 counter to every permanent on the battlefield", () => {
    const battle = createBattle({
      seed: 1,
      cardDefinitions,
      playerDeck: [
        "guardian",
        "holy_blade",
        "choir_captain",
        "mass_benediction",
        "attack",
        "defend",
      ],
      enemy: {
        name: "Benediction Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const bladeCard = battle.player.hand.find((card) => card.definitionId === "holy_blade");
    const captainCard = battle.player.hand.find((card) => card.definitionId === "choir_captain");
    const benedictionCard = battle.player.hand.find(
      (card) => card.definitionId === "mass_benediction",
    );

    if (!guardianCard || !bladeCard || !captainCard || !benedictionCard) {
      throw new Error(
        "Expected guardian, holy_blade, choir_captain, and mass_benediction in opening hand.",
      );
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bladeCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: benedictionCard.instanceId,
    });

    const guardian = battle.battlefield.find((permanent) => permanent?.definitionId === "guardian");
    const blade = battle.battlefield.find((permanent) => permanent?.definitionId === "holy_blade");
    const captain = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "choir_captain",
    );

    if (!guardian || !blade || !captain) {
      throw new Error("Expected guardian, holy_blade, and choir_captain on battlefield.");
    }

    expect(getPermanentCounterCount(guardian, "+1/+1")).toBe(2);
    expect(getPermanentCounterCount(blade, "+1/+1")).toBe(0);
    expect(getPermanentCounterCount(captain, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, guardian, "power")).toBe(5);
    expect(getDerivedPermanentStat(battle, captain, "power")).toBe(5);
    expect(guardian.health).toBe(5);
    expect(captain.health).toBe(4);
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain(
      "mass_benediction",
    );
  });
});
