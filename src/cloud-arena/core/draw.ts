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

function shuffleCards(cards: CardInstance[], seed: number): CardInstance[] {
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

export function discardHand(state: BattleState): number {
  if (state.player.hand.length === 0) {
    return 0;
  }

  const discarded = state.player.hand.length;
  state.player.discardPile.push(...state.player.hand);
  state.player.hand = [];
  return discarded;
}

export function drawUpToHandSize(state: BattleState, targetHandSize: number): DrawResult {
  const cards: CardInstance[] = [];

  while (state.player.hand.length < targetHandSize) {
    if (state.player.drawPile.length === 0) {
      if (state.player.discardPile.length === 0) {
        break;
      }

      state.player.drawPile = shuffleCards(
        state.player.discardPile,
        state.seed + state.turnNumber + cards.length,
      );
      state.player.discardPile = [];
    }

    const nextCard = state.player.drawPile.shift();

    if (!nextCard) {
      break;
    }

    state.player.hand.push(nextCard);
    cards.push(nextCard);
  }

  return {
    cards,
    count: cards.length,
  };
}
