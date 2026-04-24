import { describe, expect, it } from "vitest";

import {
  listCloudArenaCardSummaries,
  validateCloudArenaSavedDeckDraft,
} from "../../src/cloud-arena/index.js";

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
});
