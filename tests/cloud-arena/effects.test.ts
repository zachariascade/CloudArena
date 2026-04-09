import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  resolveEffect,
  resolveEffects,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const EFFECT_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  angel_host: {
    id: "angel_host",
    name: "Angel Host",
    type: "permanent",
    cost: 2,
    subtypes: ["Angel"],
    onPlay: [],
    health: 10,
    actions: [{ attackAmount: 4 }],
  },
  altar_keeper: {
    id: "altar_keeper",
    name: "Altar Keeper",
    type: "permanent",
    cost: 2,
    onPlay: [],
    health: 8,
    actions: [{ blockAmount: 3 }],
  },
  holy_blade: {
    id: "holy_blade",
    name: "Holy Blade",
    type: "permanent",
    cost: 1,
    subtypes: ["Equipment"],
    onPlay: [],
    health: 1,
    actions: [],
  },
  defend: {
    id: "defend",
    name: "Defend",
    type: "instant",
    cost: 1,
    onPlay: [{ blockAmount: 7, target: "player" }],
  },
  attack: {
    id: "attack",
    name: "Attack",
    type: "instant",
    cost: 1,
    onPlay: [{ attackAmount: 6, target: "enemy" }],
  },
};

function createEffectBattle() {
  return createTestBattle({
    cardDefinitions: EFFECT_TEST_CARD_DEFINITIONS,
    playerDeck: [
      "angel_host",
      "altar_keeper",
      "holy_blade",
      "defend",
      "attack",
    ],
    enemy: {
      name: "Effect Dummy",
      health: 30,
      basePower: 12,
      behavior: [{ attackAmount: 12 }],
    },
  });
}

describe("cloud arena effect primitives", () => {
  it("adds counters and emits counter_added rules events", () => {
    const battle = createEffectBattle();
    battle.player.energy = 10;

    const angelCard = battle.player.hand.find((card) => card.definitionId === "angel_host");

    if (!angelCard) {
      throw new Error("Expected angel_host in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: angelCard.instanceId });

    const angelPermanent = battle.battlefield[0];

    if (!angelPermanent) {
      throw new Error("Expected angel_host on battlefield.");
    }

    resolveEffect(
      battle,
      {
        type: "add_counter",
        target: "self",
        counter: "+1/+1",
        amount: { type: "constant", value: 2 },
      },
      { abilitySourcePermanentId: angelPermanent.instanceId },
    );

    expect(angelPermanent.counters?.["+1/+1"]).toBe(2);
    expect(battle.rules.at(-1)).toEqual({
      type: "counter_added",
      turnNumber: 1,
      permanentId: angelPermanent.instanceId,
      counter: "+1/+1",
      amount: 2,
    });
  });

  it("sacrifices matching permanents through the shared destroy path", () => {
    const battle = createEffectBattle();
    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "angel_host" || entry.definitionId === "altar_keeper"
    )) {
      applyBattleAction(battle, { type: "play_card", cardInstanceId: card.instanceId });
    }

    expect(battle.battlefield.filter(Boolean)).toHaveLength(2);

    resolveEffect(battle, {
      type: "sacrifice",
      selector: {
        zone: "battlefield",
        controller: "you",
        cardType: "permanent",
      },
      amount: 1,
      choice: "controller",
    });

    expect(battle.battlefield.filter(Boolean)).toHaveLength(1);
    expect(battle.player.graveyard).toHaveLength(1);
    expect(battle.rules.some((event) => event.type === "permanent_died")).toBe(true);
  });

  it("supports damage, block, summon, and attach primitives", () => {
    const battle = createEffectBattle();
    battle.player.energy = 10;

    const angelCard = battle.player.hand.find((card) => card.definitionId === "angel_host");

    if (!angelCard) {
      throw new Error("Expected angel_host in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: angelCard.instanceId });

    const angelPermanent = battle.battlefield[0];

    if (!angelPermanent) {
      throw new Error("Expected angel_host on battlefield.");
    }

    resolveEffects(
      battle,
      [
        {
          type: "gain_block",
          target: "player",
          amount: { type: "constant", value: 5 },
        },
        {
          type: "deal_damage",
          target: "enemy",
          amount: { type: "constant", value: 4 },
        },
        {
          type: "summon_permanent",
          cardId: "altar_keeper",
        },
        {
          type: "attach_from_hand",
          selector: {
            zone: "hand",
            controller: "you",
            cardType: "equipment",
          },
          target: "self",
          optional: true,
          cost: "free",
        },
      ],
      { abilitySourcePermanentId: angelPermanent.instanceId },
    );

    expect(battle.player.block).toBe(5);
    expect(battle.enemy.health).toBe(26);
    expect(battle.battlefield.filter(Boolean)).toHaveLength(3);
    expect(angelPermanent.attachments).toHaveLength(1);
    expect(
      battle.rules.some((event) => event.type === "attachment_attached"),
    ).toBe(true);
  });
});
