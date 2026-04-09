import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const TRIGGER_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  offering_thrall: {
    id: "offering_thrall",
    name: "Offering Thrall",
    type: "permanent",
    cost: 1,
    onPlay: [],
    health: 4,
    actions: [],
  },
  carrion_angel: {
    id: "carrion_angel",
    name: "Carrion Angel",
    type: "permanent",
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    health: 8,
    actions: [{ attackAmount: 3 }],
    abilities: [
      {
        kind: "triggered",
        trigger: { event: "self_enters_battlefield" },
        effects: [
          {
            type: "sacrifice",
            selector: {
              zone: "battlefield",
              controller: "you",
              cardType: "permanent",
              relation: "another",
            },
            amount: 1,
            choice: "controller",
          },
        ],
      },
      {
        kind: "triggered",
        trigger: {
          event: "permanent_died",
          selector: {
            controller: "you",
            cardType: "permanent",
            relation: "another",
          },
        },
        effects: [
          {
            type: "add_counter",
            target: "self",
            counter: "+1/+1",
            amount: { type: "constant", value: 1 },
          },
        ],
      },
    ],
  },
  attack: {
    id: "attack",
    name: "Attack",
    type: "instant",
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
  defend: {
    id: "defend",
    name: "Defend",
    type: "instant",
    cost: 1,
    onPlay: [{ blockAmount: 7, target: "player" }],
  },
};

describe("cloud arena trigger resolution", () => {
  it("resolves enter triggers and chained death triggers deterministically", () => {
    const battle = createTestBattle({
      cardDefinitions: TRIGGER_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "offering_thrall",
        "carrion_angel",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Trigger Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const thrallCard = battle.player.hand.find((card) => card.definitionId === "offering_thrall");
    const angelCard = battle.player.hand.find((card) => card.definitionId === "carrion_angel");

    if (!thrallCard || !angelCard) {
      throw new Error("Expected trigger test permanents in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: thrallCard.instanceId,
    });

    expect(battle.battlefield.filter(Boolean)).toHaveLength(1);

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: angelCard.instanceId,
    });

    const permanents = battle.battlefield.filter((permanent) => permanent !== null);

    expect(permanents).toHaveLength(1);
    expect(permanents[0]?.definitionId).toBe("carrion_angel");
    expect(permanents[0]?.counters?.["+1/+1"]).toBe(1);
    expect(battle.player.graveyard.map((card) => card.definitionId)).toEqual(["offering_thrall"]);
    expect(
      battle.rules.map((event) => event.type),
    ).toEqual([
      "card_played",
      "permanent_entered",
      "card_played",
      "permanent_entered",
      "permanent_died",
      "counter_added",
    ]);
    expect(battle.rulesCursor).toBe(battle.rules.length);
  });
});
