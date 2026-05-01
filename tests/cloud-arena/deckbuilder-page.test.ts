import { describe, expect, it } from "vitest";

import type {
  CloudArenaCardSummary,
  CloudArenaDeckDetail,
  CloudArenaDeckSummary,
} from "../../src/cloud-arena/api-contract.js";
import {
  buildDeckWriteRequest,
  buildDeckSelectionGroups,
  buildCreateModalDraftFromDeckDraft,
  buildDraftFromDetail,
  createEmptyDraft,
  decrementDeckCard,
  filterCards,
  getDeckCardQuantity,
  getDeckBuilderStateFromUrl,
  incrementDeckCard,
  isDeckCardSelected,
  summarizeDeckCards,
  toggleDeckCardSelection,
  updateDeckBuilderSearch,
} from "../../apps/cloud-arena-web/src/routes/deckbuilder-page.js";

describe("cloud arena deckbuilder helpers", () => {
  it("toggles selected cards in and out of the deck", () => {
    expect(isDeckCardSelected([{ cardId: "attack", quantity: 1 }], "attack")).toBe(true);
    expect(toggleDeckCardSelection([{ cardId: "attack", quantity: 1 }], "attack")).toEqual([]);
    expect(toggleDeckCardSelection([], "attack")).toEqual([{ cardId: "attack", quantity: 1 }]);
    expect(getDeckCardQuantity([{ cardId: "attack", quantity: 3 }], "attack")).toBe(3);
    expect(getDeckCardQuantity([], "attack")).toBe(0);
  });

  it("keeps card quantities stable while preserving order", () => {
    const cards = incrementDeckCard(
      [
        { cardId: "attack", quantity: 2 },
        { cardId: "guard", quantity: 1 },
      ],
      "guard",
    );

    expect(cards).toEqual([
      { cardId: "attack", quantity: 2 },
      { cardId: "guard", quantity: 2 },
    ]);
    expect(decrementDeckCard(cards, "attack")).toEqual([
      { cardId: "attack", quantity: 1 },
      { cardId: "guard", quantity: 2 },
    ]);
    expect(decrementDeckCard(cards, "guard", 2)).toEqual([
      { cardId: "attack", quantity: 2 },
    ]);
  });

  it("builds deck requests and drafts from the UI state", () => {
    const detail: CloudArenaDeckDetail = {
      id: "saved_1",
      kind: "saved",
      name: "Control",
      cardCount: 20,
      uniqueCardCount: 2,
      tags: ["control", "reactive"],
      notes: null,
      cards: [
        { cardId: "attack", quantity: 10 },
        { cardId: "defend", quantity: 10 },
      ],
    };

    const draft = buildDraftFromDetail(detail);

    expect(draft.sourceKind).toBe("saved");
    expect(draft.tagsText).toBe("control, reactive");
    expect(summarizeDeckCards(draft.cards)).toEqual({
      cardCount: 20,
      uniqueCardCount: 2,
    });
    expect(buildDeckWriteRequest({
      ...createEmptyDraft(),
      name: "  Control  ",
      cards: draft.cards,
      tagsText: "control, control, reactive",
      notes: "  keep it tight  ",
    })).toEqual({
      name: "Control",
      cards: [
        { cardId: "attack", quantity: 10 },
        { cardId: "defend", quantity: 10 },
      ],
      tags: ["control", "reactive"],
      notes: "keep it tight",
    });
  });

  it("prefills the create modal from the current deck draft", () => {
    expect(buildCreateModalDraftFromDeckDraft({
      sourceId: "preset_1",
      sourceKind: "preset",
      name: "Wide Angels",
      notes: "Aerial pressure",
      tagsText: "angels, tokens",
      cards: [{ cardId: "token_angel", quantity: 4 }],
    })).toEqual({
      name: "Wide Angels",
      notes: "Aerial pressure",
      tagsText: "angels, tokens",
    });
  });

  it("filters cards and groups deck chooser options", () => {
    const cards: CloudArenaCardSummary[] = [
      {
        id: "attack",
        name: "Attack",
        cost: 1,
        availabilityStatus: "ready",
        cardSet: {
          id: "none",
          name: "None",
        },
        typeLine: "Creature",
        cardTypes: ["creature"],
        subtypes: [],
        effectSummary: "Hit hard.",
      },
      {
        id: "defend",
        name: "Defend",
        cost: 0,
        availabilityStatus: "ready",
        cardSet: {
          id: "daniel",
          name: "Daniel",
        },
        typeLine: "Instant",
        cardTypes: ["instant"],
        subtypes: [],
        effectSummary: "Block damage.",
      },
      {
        id: "lion",
        name: "Lion",
        cost: 3,
        availabilityStatus: "in_progress",
        cardSet: {
          id: "daniel",
          name: "Daniel",
        },
        typeLine: "Creature",
        cardTypes: ["creature"],
        subtypes: [],
        effectSummary: "A future Daniel set card.",
      },
    ];

    const decks: CloudArenaDeckSummary[] = [
      {
        id: "master_deck",
        kind: "preset",
        name: "Master Deck",
        cardCount: 20,
        uniqueCardCount: 2,
        tags: [],
        notes: null,
      },
      {
        id: "saved_1",
        kind: "saved",
        name: "Reactive",
        cardCount: 20,
        uniqueCardCount: 2,
        tags: ["control"],
        notes: null,
      },
    ];

    expect(filterCards(cards, "def", "all", "all", "all").map((card) => card.id)).toEqual(["defend"]);
    expect(filterCards(cards, "", "creature", "all", "all").map((card) => card.id)).toEqual(["attack", "lion"]);
    expect(filterCards(cards, "", "all", "ready", "all").map((card) => card.id)).toEqual(["attack", "defend"]);
    expect(filterCards(cards, "", "all", "in_progress", "all").map((card) => card.id)).toEqual(["lion"]);
    expect(filterCards(cards, "", "all", "all", "none").map((card) => card.id)).toEqual(["attack"]);
    expect(filterCards(cards, "", "all", "all", "daniel").map((card) => card.id)).toEqual(["defend", "lion"]);
    expect(
      buildDeckSelectionGroups(decks, "saved_1")
        .flatMap((group) => group.options)
        .map((option) => option.id),
    ).toContain("saved_1");
  });

  it("includes the counters preset in the default deck chooser fallback", () => {
    const presetIds = buildDeckSelectionGroups(null, "master_deck")[1]?.options.map((option) => option.id) ?? [];

    expect(presetIds).toContain("master_deck");
    expect(presetIds).toContain("counters");
    expect(presetIds).toContain("tall_creatures");
    expect(presetIds).toContain("mixed_guardian");
  });

  it("round-trips deckbuilder query and filter state through the url", () => {
    const parsed = getDeckBuilderStateFromUrl("?q=angel&status=ready&set=daniel&selected=selected&deck=saved_1");

    expect(parsed).toEqual({
      cardSearch: "angel",
      cardStatusFilter: "ready",
      cardSetFilter: "daniel",
      selectedCardFilter: "selected",
      deckId: "saved_1",
    });

    expect(updateDeckBuilderSearch("", {
      cardSearch: " angel ",
      cardStatusFilter: "all",
      cardSetFilter: "all",
      selectedCardFilter: "all",
      deckId: null,
    })).toBe("?q=angel");
    expect(updateDeckBuilderSearch("?q=angel", {
      cardSearch: "angel",
      cardStatusFilter: "ready",
      cardSetFilter: "daniel",
      selectedCardFilter: "selected",
      deckId: "saved_1",
    })).toBe("?q=angel&status=ready&set=daniel&selected=selected&deck=saved_1");
  });
});
