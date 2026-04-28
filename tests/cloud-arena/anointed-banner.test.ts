import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  createBattle,
  getDerivedPermanentActionAmount,
  getDerivedPermanentStat,
  getPermanentCounterCount,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";

const BANNER_TEST_DEFINITIONS: CardDefinitionLibrary = {
  test_creature: {
    id: "test_creature",
    name: "Test Creature",
    cardTypes: ["creature"],
    cost: 2,
    onPlay: [],
    power: 4,
    health: 4,
    keywords: ["halt"],
    abilities: [],
  },
  test_banner: {
    id: "test_banner",
    name: "Test Banner",
    cardTypes: ["artifact"],
    cost: 2,
    onPlay: [],
    power: 0,
    health: 6,
    abilities: [
      {
        kind: "triggered",
        trigger: {
          event: "permanent_enters_battlefield",
          selector: {
            zone: "battlefield",
            controller: "you",
            cardType: "creature",
          },
        },
        effects: [
          {
            type: "add_counter",
            target: {
              zone: "battlefield",
              controller: "you",
              cardType: "creature",
              source: "trigger_subject",
              relation: "self",
            },
            powerDelta: 1,
            healthDelta: 1,
          },
        ],
      },
    ],
  },
  attack: {
    id: "attack",
    name: "Attack",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
  defend: {
    id: "defend",
    name: "Defend",
    cardTypes: ["instant"],
    cost: 1,
    onPlay: [{ blockAmount: 7, target: "player" }],
  },
};

describe("cloud arena anointed banner", () => {
  it("adds a +1/+1 counter to a creature when it enters the battlefield", () => {
    const battle = createBattle({
      seed: 1,
      cardDefinitions: BANNER_TEST_DEFINITIONS,
      playerDeck: [
        "test_creature",
        "test_banner",
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

    const creatureCard = battle.player.hand.find((card) => card.definitionId === "test_creature");
    const bannerCard = battle.player.hand.find((card) => card.definitionId === "test_banner");

    if (!creatureCard || !bannerCard) {
      throw new Error("Expected test_creature and test_banner in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: bannerCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: creatureCard.instanceId,
    });

    const creature = battle.battlefield.find((permanent) => permanent?.definitionId === "test_creature");
    const banner = battle.battlefield.find((permanent) => permanent?.definitionId === "test_banner");

    if (!creature || !banner) {
      throw new Error("Expected test_creature and test_banner on battlefield.");
    }

    expect(getPermanentCounterCount(creature, "+1/+1")).toBe(2);
    expect(getPermanentCounterCount(banner, "+1/+1")).toBe(0);
    expect(getDerivedPermanentStat(battle, creature, "power")).toBe(5);
    expect(getDerivedPermanentActionAmount(battle, creature, "attack")).toBe(5);
    expect(battle.rules.filter((event) => event.type === "counter_added").length).toBe(2);
    expect(creature.health).toBe(5);
    expect(banner.health).toBe(6);
  });
});
