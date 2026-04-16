import { emitRulesEvent } from "./rules-events.js";
import type { BattleState, CardInstance } from "./types.js";

export type DrawResult = {
  cards: CardInstance[];
  count: number;
};

function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0;

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0x100000000;
  };
}

export function shuffleCards(cards: CardInstance[], seed: number): CardInstance[] {
  const random = createSeededRandom(seed);
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffled[index];
    const next = shuffled[swapIndex];

    shuffled[index] = next!;
    shuffled[swapIndex] = current!;
  }

  return shuffled;
}

function drawNextCard(state: BattleState, drawnCards: CardInstance[]): CardInstance | null {
  if (state.player.drawPile.length === 0) {
    if (state.player.discardPile.length === 0) {
      return null;
    }

    state.player.drawPile = shuffleCards(
      state.player.discardPile,
      state.seed + state.turnNumber + drawnCards.length,
    );
    state.player.discardPile = [];
  }

  return state.player.drawPile.shift() ?? null;
}

export function drawCards(state: BattleState, count: number): DrawResult {
  const cards: CardInstance[] = [];
  const draws = Math.max(0, count);

  for (let index = 0; index < draws; index += 1) {
    const nextCard = drawNextCard(state, cards);

    if (!nextCard) {
      break;
    }

    state.player.hand.push(nextCard);
    cards.push(nextCard);
    emitRulesEvent(state, {
      type: "card_drawn",
      turnNumber: state.turnNumber,
      cardInstanceId: nextCard.instanceId,
      definitionId: nextCard.definitionId,
      controllerId: "player",
    });
  }

  return {
    cards,
    count: cards.length,
  };
}

export function discardHand(state: BattleState): number {
  if (state.player.hand.length === 0) {
    return 0;
  }

  const discardedCards = [...state.player.hand];
  state.player.hand = [];
  state.player.discardPile.push(...discardedCards);

  for (const card of discardedCards) {
    emitRulesEvent(state, {
      type: "card_discarded",
      turnNumber: state.turnNumber,
      cardInstanceId: card.instanceId,
      definitionId: card.definitionId,
      controllerId: "player",
    });
  }

  const discarded = discardedCards.length;
  return discarded;
}

export function drawUpToHandSize(state: BattleState, targetHandSize: number): DrawResult {
  const remaining = Math.max(0, targetHandSize - state.player.hand.length);
  const result = drawCards(state, remaining);

  return {
    cards: result.cards,
    count: result.count,
  };
}
