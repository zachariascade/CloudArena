import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  createBattle,
  getDerivedPermanentStat,
  getPermanentCounterCount,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";

const BENEDICTION_TEST_DEFINITIONS: CardDefinitionLibrary = {
  test_creature: {
    id: "test_creature",
    name: "Test Creature",
    cardTypes: ["creature"],
    subtypes: ["Angel"],
    cost: 2,
    onPlay: [],
    power: 4,
    health: 4,
    abilities: [],
  },
  test_equipment: {
    id: "test_equipment",
    name: "Test Equipment",
    cardTypes: ["artifact"],
    subtypes: ["Equipment"],
    cost: 1,
    onPlay: [],
    power: 1,
    health: 1,
    abilities: [],
  },
  test_captain: {
    id: "test_captain",
    name: "Test Captain",
    cardTypes: ["creature"],
    subtypes: ["Angel"],
    cost: 2,
    onPlay: [],
    power: 2,
    health: 3,
    keywords: ["refresh"],
    abilities: [
      {
        kind: "static",
        modifier: {
          target: "self",
          stat: "power",
          operation: "add",
          value: {
            type: "count",
            selector: {
              zone: "battlefield",
              subtype: "Angel",
            },
          },
        },
      },
    ],
  },
  test_benediction: {
    id: "test_benediction",
    name: "Test Benediction",
    cardTypes: ["instant"],
    cost: 2,
    onPlay: [],
    spellEffects: [
      {
        type: "add_counter",
        target: {
          zone: "battlefield",
          cardType: "permanent",
        },
        powerDelta: 1,
        healthDelta: 1,
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

describe("cloud arena mass benediction", () => {
  it("adds a +1/+1 counter to every permanent on the battlefield", () => {
    const battle = createBattle({
      seed: 1,
      cardDefinitions: BENEDICTION_TEST_DEFINITIONS,
      playerDeck: [
        "test_creature",
        "test_equipment",
        "test_captain",
        "test_benediction",
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

    const creatureCard = battle.player.hand.find((card) => card.definitionId === "test_creature");
    const equipmentCard = battle.player.hand.find((card) => card.definitionId === "test_equipment");
    const captainCard = battle.player.hand.find((card) => card.definitionId === "test_captain");
    const benedictionCard = battle.player.hand.find(
      (card) => card.definitionId === "test_benediction",
    );

    if (!creatureCard || !equipmentCard || !captainCard || !benedictionCard) {
      throw new Error(
        "Expected test_creature, test_equipment, test_captain, and test_benediction in opening hand.",
      );
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: creatureCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: equipmentCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: captainCard.instanceId,
    });
    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: benedictionCard.instanceId,
    });

    const creature = battle.battlefield.find((permanent) => permanent?.definitionId === "test_creature");
    const equipment = battle.battlefield.find((permanent) => permanent?.definitionId === "test_equipment");
    const captain = battle.battlefield.find(
      (permanent) => permanent?.definitionId === "test_captain",
    );

    if (!creature || !equipment || !captain) {
      throw new Error("Expected test_creature, test_equipment, and test_captain on battlefield.");
    }

    expect(getPermanentCounterCount(creature, "+1/+1")).toBe(2);
    expect(getPermanentCounterCount(equipment, "+1/+1")).toBe(2);
    expect(getPermanentCounterCount(captain, "+1/+1")).toBe(2);
    expect(getDerivedPermanentStat(battle, creature, "power")).toBe(5);
    // Captain: base 2 + static count(Angels: creature + captain = 2) + counter 1 = 5
    expect(getDerivedPermanentStat(battle, captain, "power")).toBe(5);
    expect(creature.health).toBe(5);
    expect(captain.health).toBe(4);
    expect(battle.player.discardPile.map((card) => card.definitionId)).toContain(
      "test_benediction",
    );
  });
});
