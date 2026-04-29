import { describe, expect, it } from "vitest";

import {
  isCardReady,
  isCardSelectableByPlayers,
  listCloudArenaCardSummaries,
  validateCloudArenaSavedDeckDraft,
} from "../../src/cloud-arena/index.js";
import type { CardDefinition } from "../../src/cloud-arena/core/types.js";

describe("cloud arena deck content", () => {
  it("keeps enemy-only slash cards out of player card listings", () => {
    const cardIds = listCloudArenaCardSummaries().map((entry) => entry.id);

    expect(cardIds).not.toContain("single_slash");
    expect(cardIds).not.toContain("double_slash");
    expect(cardIds).not.toContain("triple_slash");
    expect(cardIds).not.toContain("cross_slash");
    expect(cardIds).not.toContain("multi_slash");
    expect(cardIds).not.toContain("token_imp");
  });

  it("rejects enemy-only slash cards in saved player decks", () => {
    const issues = validateCloudArenaSavedDeckDraft({
      name: "Slash deck",
      cards: [
        {
          cardId: "single_slash",
          quantity: 1,
        },
        {
          cardId: "token_imp",
          quantity: 1,
        },
      ],
    });

    expect(issues.some((issue) => issue.message.includes("not a Cloud Arena player card"))).toBe(true);
  });

  it("treats in-progress cards as unavailable for player decks", () => {
    const inProgressCard = {
      id: "draft_card",
      name: "Draft Card",
      cost: 1,
      availabilityStatus: "in_progress",
      cardTypes: ["sorcery"],
      onPlay: [],
    } as CardDefinition;
    const readyCard = {
      id: "ready_card",
      name: "Ready Card",
      cost: 1,
      cardTypes: ["sorcery"],
      onPlay: [],
    } as CardDefinition;

    expect(isCardReady(inProgressCard)).toBe(false);
    expect(isCardSelectableByPlayers(inProgressCard)).toBe(false);
    expect(isCardReady(readyCard)).toBe(true);
    expect(isCardSelectableByPlayers(readyCard)).toBe(true);
  });
});
