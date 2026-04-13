import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  cardDefinitions,
  createBattle,
  getDerivedPermanentActionAmount,
  getDerivedPermanentStat,
} from "../../src/cloud-arena/index.js";

describe("cloud arena anointed banner", () => {
  it("adds a +1/+1 counter to all permanents when it enters the battlefield", () => {
    const battle = createBattle({
      seed: 1,
      cardDefinitions,
      playerDeck: [
        "guardian",
        "anointed_banner",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Banner Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const guardianCard = battle.player.hand.find((card) => card.definitionId === "guardian");
    const bannerCard = battle.player.hand.find((card) => card.definitionId === "anointed_banner");

    if (!guardianCard || !bannerCard) {
      throw new Error("Expected guardian and anointed_banner in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: guardianCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bannerCard.instanceId,
    });

    const guardian = battle.battlefield.find((permanent) => permanent?.definitionId === "guardian");
    const banner = battle.battlefield.find((permanent) => permanent?.definitionId === "anointed_banner");

    if (!guardian || !banner) {
      throw new Error("Expected guardian and anointed_banner on battlefield.");
    }

    expect(guardian.counters?.["+1/+1"]).toBe(1);
    expect(banner.counters?.["+1/+1"]).toBe(1);
    expect(getDerivedPermanentStat(battle, guardian, "power")).toBe(11);
    expect(getDerivedPermanentActionAmount(battle, guardian, "attack")).toBe(11);
    expect(
      battle.rules.filter((event) => event.type === "counter_added").length,
    ).toBe(2);
  });
});
