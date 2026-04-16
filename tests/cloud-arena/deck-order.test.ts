import { describe, expect, it } from "vitest";

import { shuffleCards } from "../../src/cloud-arena/core/draw.js";
import {
  createBattle,
  type CardInstance,
  type CreateBattleInput,
} from "../../src/cloud-arena/index.js";

import { TEST_CARD_DEFINITIONS } from "./helpers.js";

function toCardInstances(deck: string[]): CardInstance[] {
  return deck.map((definitionId, index) => ({
    instanceId: `card_${index + 1}`,
    definitionId,
  }));
}

describe("cloud arena deck ordering", () => {
  it("keeps the opening deck ordered unless shuffleDeck is enabled", () => {
    const seed = 42;
    const deck = [
      "attack",
      "defend",
      "twin_strike",
      "guardian",
      "blade_dancer",
      "attack",
      "defend",
    ];
    const baseInput: CreateBattleInput = {
      seed,
      playerHealth: 30,
      cardDefinitions: TEST_CARD_DEFINITIONS,
      playerDeck: deck,
      enemy: {
        name: "Test Enemy",
        health: 30,
        basePower: 12,
        behavior: [{ attackAmount: 12 }],
      },
    };

    const orderedBattle = createBattle({
      ...baseInput,
      shuffleDeck: false,
    });
    expect(orderedBattle.player.hand.map((card) => card.definitionId)).toEqual(deck.slice(0, 5));
    expect(orderedBattle.player.drawPile.map((card) => card.definitionId)).toEqual(deck.slice(5));

    const shuffledCards = shuffleCards(toCardInstances(deck), seed).map((card, index) => ({
      ...card,
      instanceId: `card_${index + 1}`,
    }));

    const shuffledBattle = createBattle({
      ...baseInput,
      shuffleDeck: true,
    });

    expect(shuffledBattle.player.hand.map((card) => card.definitionId)).toEqual(
      shuffledCards.slice(0, 5).map((card) => card.definitionId),
    );
    expect(shuffledBattle.player.drawPile.map((card) => card.definitionId)).toEqual(
      shuffledCards.slice(5).map((card) => card.definitionId),
    );
  });
});
