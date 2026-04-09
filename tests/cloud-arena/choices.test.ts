import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  resolveEffect,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { createTestBattle } from "./helpers.js";

const CHOICE_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  offering_thrall: {
    id: "offering_thrall",
    name: "Offering Thrall",
    type: "permanent",
    cost: 1,
    onPlay: [],
    health: 4,
    actions: [],
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

describe("cloud arena choice handling", () => {
  it("records deterministic permanent choices for sacrifice effects", () => {
    const battle = createTestBattle({
      cardDefinitions: CHOICE_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "offering_thrall",
        "altar_keeper",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Choice Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    for (const card of battle.player.hand.filter((entry) =>
      entry.definitionId === "offering_thrall" || entry.definitionId === "altar_keeper"
    )) {
      applyBattleAction(battle, {
        type: "play_card",
        cardInstanceId: card.instanceId,
      });
    }

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

    expect(battle.choices.at(-1)).toMatchObject({
      kind: "select_permanents",
      reason: "Resolve sacrifice effect",
      selectedIds: ["offering_thrall_1"],
      strategy: "first_available",
    });
  });

  it("records optional attachment decisions and chosen hand cards", () => {
    const battle = createTestBattle({
      cardDefinitions: CHOICE_TEST_CARD_DEFINITIONS,
      playerDeck: [
        "altar_keeper",
        "holy_blade",
        "attack",
        "defend",
        "attack",
      ],
      enemy: {
        name: "Choice Dummy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    });

    battle.player.energy = 10;

    const keeperCard = battle.player.hand.find((card) => card.definitionId === "altar_keeper");

    if (!keeperCard) {
      throw new Error("Expected altar_keeper in opening hand.");
    }

    applyBattleAction(battle, {
      type: "play_card",
      cardInstanceId: keeperCard.instanceId,
    });

    const keeper = battle.battlefield[0];

    if (!keeper) {
      throw new Error("Expected altar_keeper on battlefield.");
    }

    resolveEffect(
      battle,
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
      { abilitySourcePermanentId: keeper.instanceId },
    );

    expect(battle.choices.at(-2)).toMatchObject({
      kind: "select_hand_card",
      reason: "Choose a card from hand to attach",
      selectedIds: ["card_2"],
      strategy: "first_available",
    });
    expect(battle.choices.at(-1)).toMatchObject({
      kind: "optional_effect",
      reason: "Choose whether to attach an Equipment from hand",
      selectedIds: ["yes"],
      strategy: "auto_yes",
    });
  });
});
