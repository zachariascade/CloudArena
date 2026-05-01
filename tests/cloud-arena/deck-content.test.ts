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

  it("can list in-progress cards when requested for the full catalog", () => {
    const cards = listCloudArenaCardSummaries({ availabilityStatus: "all" });
    const attackCard = cards.find((entry) => entry.id === "attack");
    const danielCard = cards.find((entry) => entry.id === "gallery_daniel_in_the_lions_den");
    const danielSetCard = cards.find((entry) => entry.id === "meshach_shadrach_and_abednego");
    const ancientOfDays = cards.find((entry) => entry.id === "gallery_ancient_of_days");
    const kingOfBabylon = cards.find((entry) => entry.id === "nebuchadnezzar_king_of_babylon");
    const beastOfTheField = cards.find((entry) => entry.id === "nebuchadnezzar_beast_of_the_field");

    expect(cards.map((entry) => entry.id)).toContain("gallery_daniel_in_the_lions_den");
    expect(attackCard?.cardSet?.id).toBe("none");
    expect(danielCard?.cardSet?.id).toBe("daniel");
    expect(danielSetCard?.cardSet?.id).toBe("daniel");
    expect(ancientOfDays?.cardSet?.id).toBe("daniel");
    expect(kingOfBabylon?.cardSet?.id).toBe("daniel");
    expect(beastOfTheField?.cardSet?.id).toBe("daniel");
  });
});
