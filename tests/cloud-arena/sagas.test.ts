import { describe, expect, it } from "vitest";

import {
  applyBattleAction,
  asPermanentCardDefinition,
  getDerivedPermanentStat,
  getLegalActions,
  getPermanentCounterCount,
  resetRound,
  resolveEffect,
  type CardDefinitionLibrary,
} from "../../src/cloud-arena/index.js";
import { summarizeCardDefinition } from "../../src/cloud-arena/card-summary.js";
import { dreamOfTheStatueCardDefinition } from "../../src/cloud-arena/cards/definitions/dream-of-the-statue.js";
import { dreamOfTheTreeCardDefinition } from "../../src/cloud-arena/cards/definitions/dream-of-the-tree.js";
import { createTestBattle } from "./helpers.js";

const SAGA_TEST_CARD_DEFINITIONS: CardDefinitionLibrary = {
  enemy_leader: {
    id: "enemy_leader",
    name: "Enemy Leader",
    cardTypes: ["creature"],
    cost: 0,
    onPlay: [],
    power: 0,
    health: 0,
    abilities: [],
  },
  witness_saga: {
    id: "witness_saga",
    name: "Witness Saga",
    cardTypes: ["enchantment", "saga"],
    cost: 1,
    onPlay: [],
    power: 2,
    health: 3,
    saga: {
      chapters: [
        {
          chapter: 1,
          label: "I",
          effects: [
            {
              type: "gain_block",
              target: "player",
              amount: { type: "constant", value: 2 },
            },
          ],
        },
        {
          chapter: 2,
          label: "II",
          effects: [
            {
              type: "gain_block",
              target: "player",
              amount: { type: "constant", value: 4 },
            },
          ],
        },
        {
          chapter: 3,
          label: "III",
          effects: [
            {
              type: "gain_block",
              target: "player",
              amount: { type: "constant", value: 6 },
            },
          ],
        },
      ],
    },
    abilities: [],
  },
  filler: {
    id: "filler",
    name: "Filler",
    cardTypes: ["instant"],
    cost: 0,
    onPlay: [],
  },
  targeted_saga: {
    id: "targeted_saga",
    name: "Targeted Saga",
    cardTypes: ["enchantment", "saga"],
    cost: 1,
    onPlay: [],
    power: 1,
    health: 3,
    saga: {
      chapters: [
        {
          chapter: 1,
          label: "I",
          effects: [
            {
              type: "deal_damage",
              target: {
                zone: "enemy_battlefield",
                controller: "opponent",
                cardType: "permanent",
              },
              amount: { type: "constant", value: 4 },
              targeting: {
                prompt: "Choose an enemy marked by the writing",
              },
            },
          ],
        },
      ],
    },
    abilities: [],
  },
};

describe("Saga permanents", () => {
  it("defines Many Metal Statue as a five-chapter Saga", () => {
    const definition = asPermanentCardDefinition(dreamOfTheStatueCardDefinition);

    expect(definition.cardTypes).toEqual(["enchantment", "saga"]);
    expect(definition.saga?.chapters.map((chapter) => chapter.title)).toEqual([
      "Head of Gold: Babylon",
      "Chest & Arms of Silver: Medo-Persia",
      "Belly & Thighs of Bronze: Greece",
      "Legs of Iron & Feet of Iron/Clay: Rome",
      "The Stone: The Eternal Kingdom of God",
    ]);
    expect(definition.saga?.chapters).toHaveLength(5);
    expect(summarizeCardDefinition(definition)).toContain(
      "V - The Stone: The Eternal Kingdom of God. Deal 7 damage to the enemy. Draw 1 card.",
    );
  });

  it("defines The Great Tree Humbled as a proper Saga", () => {
    const definition = asPermanentCardDefinition(dreamOfTheTreeCardDefinition);

    expect(definition.cardTypes).toEqual(["enchantment", "saga"]);
    expect(definition.display?.name).toBe("The Great Tree Humbled");
    expect(definition.saga?.chapters.map((chapter) => chapter.title)).toEqual([
      "The Tree Reaches the Heavens",
      "A Watcher Cries Aloud",
      "Cut Down the Tree",
      "Until Heaven Rules",
    ]);
    expect(definition.saga?.chapters).toHaveLength(4);
    expect(summarizeCardDefinition(definition)).toContain(
      "III - Cut Down the Tree. Choose an enemy permanent; deal 5 damage to it.",
    );
  });

  it("enters with a lore counter and makes chapter one available without resolving it", () => {
    const battle = createTestBattle({
      cardDefinitions: SAGA_TEST_CARD_DEFINITIONS,
      playerDeck: ["witness_saga"],
    });
    const sagaCard = battle.player.hand.find((card) => card.definitionId === "witness_saga");

    if (!sagaCard) {
      throw new Error("Expected Witness Saga in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: sagaCard.instanceId });

    const saga = battle.battlefield.find((permanent) => permanent?.definitionId === "witness_saga");

    expect(saga).not.toBeNull();
    expect(saga ? getPermanentCounterCount(saga, "lore") : 0).toBe(1);
    expect(saga?.sagaState?.resolvedChapters).toEqual([]);
    expect(battle.player.block).toBe(0);
    expect(saga?.abilities?.some((ability) => ability.id === "saga_chapter_1")).toBe(true);
    expect(battle.player.block).toBe(0);

    if (!saga) {
      throw new Error("Expected Witness Saga on the battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: saga.instanceId,
      source: "ability",
      action: "saga_chapter_1",
      abilityId: "saga_chapter_1",
    });

    expect(saga.sagaState?.resolvedChapters).toEqual([1]);
    expect(battle.player.block).toBe(2);
  });

  it("adds lore on later turns, unlocks chapter actions, and sacrifices after final activation on a later turn", () => {
    const battle = createTestBattle({
      cardDefinitions: SAGA_TEST_CARD_DEFINITIONS,
      playerDeck: ["witness_saga", "filler", "filler", "filler"],
    });
    const sagaCard = battle.player.hand.find((card) => card.definitionId === "witness_saga");

    if (!sagaCard) {
      throw new Error("Expected Witness Saga in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: sagaCard.instanceId });
    let saga = battle.battlefield.find((permanent) => permanent?.definitionId === "witness_saga");

    if (!saga) {
      throw new Error("Expected Witness Saga on the battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: saga.instanceId,
      source: "ability",
      action: "saga_chapter_1",
      abilityId: "saga_chapter_1",
    });
    resetRound(battle);

    saga = battle.battlefield.find((permanent) => permanent?.definitionId === "witness_saga");
    if (!saga) {
      throw new Error("Expected Witness Saga on the battlefield after chapter two unlocked.");
    }

    expect(saga ? getPermanentCounterCount(saga, "lore") : 0).toBe(2);
    expect(saga.sagaState?.resolvedChapters).toEqual([1]);
    expect(battle.player.block).toBe(0);

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: saga.instanceId,
      source: "ability",
      action: "saga_chapter_2",
      abilityId: "saga_chapter_2",
    });

    expect(saga.sagaState?.resolvedChapters).toEqual([1, 2]);
    expect(battle.player.block).toBe(4);

    resetRound(battle);

    saga = battle.battlefield.find((permanent) => permanent?.definitionId === "witness_saga");
    if (!saga) {
      throw new Error("Expected Witness Saga on the battlefield after chapter three unlocked.");
    }

    expect(getPermanentCounterCount(saga, "lore")).toBe(3);
    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: saga.instanceId,
      source: "ability",
      action: "saga_chapter_3",
      abilityId: "saga_chapter_3",
    });

    expect(saga.sagaState?.resolvedChapters).toEqual([1, 2, 3]);
    expect(battle.player.block).toBe(6);
    expect(battle.battlefield.some((permanent) => permanent?.definitionId === "witness_saga")).toBe(true);

    resetRound(battle);

    expect(battle.battlefield.some((permanent) => permanent?.definitionId === "witness_saga")).toBe(false);
    expect(battle.player.graveyard.map((card) => card.definitionId)).toContain("witness_saga");
    expect(battle.log.map((event) => event.type)).toContain("permanent_sacrificed");
    expect(battle.log.map((event) => event.type)).not.toContain("permanent_destroyed");
  });

  it("only makes the current lore chapter action legal", () => {
    const battle = createTestBattle({
      cardDefinitions: SAGA_TEST_CARD_DEFINITIONS,
      playerDeck: ["witness_saga", "filler", "filler", "filler"],
    });
    const sagaCard = battle.player.hand.find((card) => card.definitionId === "witness_saga");

    if (!sagaCard) {
      throw new Error("Expected Witness Saga in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: sagaCard.instanceId });
    const saga = battle.battlefield.find((permanent) => permanent?.definitionId === "witness_saga");

    if (!saga) {
      throw new Error("Expected Witness Saga on the battlefield.");
    }

    const legalActionsAtOne = getLegalActions(battle)
      .filter((action): action is Extract<typeof action, { type: "use_permanent_action" }> =>
        action.type === "use_permanent_action" && action.permanentId === saga.instanceId,
      )
      .map((action) => action.action);

    expect(legalActionsAtOne).toEqual(["attack", "defend", "saga_chapter_1"]);
    resetRound(battle);

    const legalActionsAtTwo = getLegalActions(battle)
      .filter((action): action is Extract<typeof action, { type: "use_permanent_action" }> =>
        action.type === "use_permanent_action" && action.permanentId === saga.instanceId,
      )
      .map((action) => action.action);

    expect(legalActionsAtTwo).toEqual(["attack", "defend", "saga_chapter_2"]);

    expect(() => applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: saga.instanceId,
      source: "ability",
      action: "saga_chapter_1",
      abilityId: "saga_chapter_1",
    })).toThrow(/cannot use ability/);

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: saga.instanceId,
      source: "ability",
      action: "saga_chapter_2",
      abilityId: "saga_chapter_2",
    });

    expect(saga.sagaState?.resolvedChapters).toEqual([2]);
  });

  it("lets Sagas attack or defend like native combat permanents", () => {
    const attackingBattle = createTestBattle({
      cardDefinitions: SAGA_TEST_CARD_DEFINITIONS,
      playerDeck: ["witness_saga", "filler", "filler", "filler"],
    });
    const attackingSagaCard = attackingBattle.player.hand.find((card) => card.definitionId === "witness_saga");

    if (!attackingSagaCard) {
      throw new Error("Expected Witness Saga in hand.");
    }

    applyBattleAction(attackingBattle, { type: "play_card", cardInstanceId: attackingSagaCard.instanceId });
    const attackingSaga = attackingBattle.battlefield.find((permanent) => permanent?.definitionId === "witness_saga");

    if (!attackingSaga) {
      throw new Error("Expected Witness Saga on the battlefield.");
    }

    applyBattleAction(attackingBattle, {
      type: "use_permanent_action",
      permanentId: attackingSaga.instanceId,
      source: "rules",
      action: "attack",
    });

    const attackTargetAction = getLegalActions(attackingBattle).find(
      (action) => action.type === "choose_target",
    );

    if (!attackTargetAction || attackTargetAction.type !== "choose_target") {
      throw new Error("Expected Saga attack to request an enemy target.");
    }

    applyBattleAction(attackingBattle, attackTargetAction);

    const enemyPermanent = attackingBattle.enemyBattlefield.find((permanent) => permanent !== null);
    expect(enemyPermanent?.health).toBe(28);
    expect(attackingSaga.hasActedThisTurn).toBe(true);

    const defendingBattle = createTestBattle({
      cardDefinitions: SAGA_TEST_CARD_DEFINITIONS,
      playerDeck: ["witness_saga", "filler", "filler", "filler"],
    });
    const defendingSagaCard = defendingBattle.player.hand.find((card) => card.definitionId === "witness_saga");

    if (!defendingSagaCard) {
      throw new Error("Expected Witness Saga in hand.");
    }

    applyBattleAction(defendingBattle, { type: "play_card", cardInstanceId: defendingSagaCard.instanceId });
    const defendingSaga = defendingBattle.battlefield.find((permanent) => permanent?.definitionId === "witness_saga");

    if (!defendingSaga) {
      throw new Error("Expected Witness Saga on the battlefield.");
    }

    applyBattleAction(defendingBattle, {
      type: "use_permanent_action",
      permanentId: defendingSaga.instanceId,
      source: "rules",
      action: "defend",
    });

    expect(defendingSaga.isDefending).toBe(true);
    expect(defendingBattle.blockingQueue).toContain(defendingSaga.instanceId);
  });

  it("supports targeted Saga chapter abilities", () => {
    const battle = createTestBattle({
      cardDefinitions: SAGA_TEST_CARD_DEFINITIONS,
      playerDeck: ["targeted_saga", "filler", "filler", "filler"],
    });
    const sagaCard = battle.player.hand.find((card) => card.definitionId === "targeted_saga");

    if (!sagaCard) {
      throw new Error("Expected Targeted Saga in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: sagaCard.instanceId });
    const saga = battle.battlefield.find((permanent) => permanent?.definitionId === "targeted_saga");

    if (!saga) {
      throw new Error("Expected Targeted Saga on the battlefield.");
    }

    applyBattleAction(battle, {
      type: "use_permanent_action",
      permanentId: saga.instanceId,
      source: "ability",
      action: "saga_chapter_1",
      abilityId: "saga_chapter_1",
    });

    expect(battle.pendingTargetRequest?.prompt).toBe("Choose an enemy marked by the writing");
    const target = battle.enemyBattlefield.find((permanent) => permanent !== null);

    if (!target) {
      throw new Error("Expected an enemy target.");
    }

    applyBattleAction(battle, {
      type: "choose_target",
      targetPermanentId: target.instanceId,
    });

    expect(target.health).toBe(26);
    expect(saga.sagaState?.resolvedChapters).toEqual([1]);
  });

  it("supports semantic counters that do not alter derived stats", () => {
    const battle = createTestBattle({
      cardDefinitions: SAGA_TEST_CARD_DEFINITIONS,
      playerDeck: ["witness_saga"],
    });
    const sagaCard = battle.player.hand.find((card) => card.definitionId === "witness_saga");

    if (!sagaCard) {
      throw new Error("Expected Witness Saga in hand.");
    }

    applyBattleAction(battle, { type: "play_card", cardInstanceId: sagaCard.instanceId });
    const saga = battle.battlefield.find((permanent) => permanent?.definitionId === "witness_saga");

    if (!saga) {
      throw new Error("Expected Witness Saga on the battlefield.");
    }

    resolveEffect(battle, {
      type: "add_counter",
      target: "self",
      counter: "lore",
      amount: { type: "constant", value: 2 },
    }, {
      abilitySourcePermanentId: saga.instanceId,
    });

    expect(getPermanentCounterCount(saga, "lore")).toBe(3);
    expect(getDerivedPermanentStat(battle, saga, "power")).toBe(2);
    expect(saga.health).toBe(3);
    expect(saga.maxHealth).toBe(3);
  });
});
