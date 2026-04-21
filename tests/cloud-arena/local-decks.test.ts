import { describe, expect, it } from "vitest";

import {
  CloudArenaLocalDeckNotFoundError,
  CloudArenaLocalDeckValidationError,
  createCloudArenaLocalDeckRepository,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-local-decks.js";

class TestStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("cloud arena local deck repository", () => {
  it("lists bundled cards and preset decks without an API", async () => {
    const repository = createCloudArenaLocalDeckRepository({
      storage: new TestStorage(),
    });

    const cards = await repository.listCloudArenaCards({
      cardType: "creature",
      q: "guardian",
    });
    const decks = await repository.listCloudArenaDecks({
      kind: "preset",
    });
    const masterDeck = await repository.getCloudArenaDeck("master_deck");

    expect(cards.data.length).toBeGreaterThan(0);
    expect(cards.data[0]?.typeLine.toLowerCase()).toContain("creature");
    expect(decks.data.map((deck) => deck.id)).toContain("master_deck");
    expect(masterDeck.data.kind).toBe("preset");
    expect(masterDeck.data.name).toBe("Master Deck");
  });

  it("creates, reloads, updates, filters, and deletes browser-saved decks", async () => {
    const storage = new TestStorage();
    const repository = createCloudArenaLocalDeckRepository({
      idGenerator: () => "deck_local_one",
      now: () => new Date("2026-04-21T12:00:00.000Z"),
      storage,
    });

    const created = await repository.createCloudArenaDeck({
      name: "Local Control",
      cards: [
        { cardId: "attack", quantity: 10 },
        { cardId: "defend", quantity: 10 },
      ],
      tags: ["control"],
      notes: "Stored in browser storage.",
    });

    expect(created.data).toMatchObject({
      id: "deck_local_one",
      kind: "saved",
      name: "Local Control",
      cardCount: 20,
      uniqueCardCount: 2,
    });

    const reloadedRepository = createCloudArenaLocalDeckRepository({ storage });
    const savedDecks = await reloadedRepository.listCloudArenaDecks({
      containsCardId: "attack",
      kind: "saved",
      q: "control",
    });

    expect(savedDecks.data.map((deck) => deck.id)).toEqual(["deck_local_one"]);

    const updated = await reloadedRepository.updateCloudArenaDeck("deck_local_one", {
      name: "Local Control Updated",
      cards: [{ cardId: "attack", quantity: 20 }],
      tags: ["updated"],
      notes: null,
    });

    expect(updated.data.name).toBe("Local Control Updated");
    expect(updated.data.cards).toEqual([{ cardId: "attack", quantity: 20 }]);

    const deleted = await reloadedRepository.deleteCloudArenaDeck("deck_local_one");

    expect(deleted.data).toEqual({
      deleted: true,
      deckId: "deck_local_one",
    });
    await expect(reloadedRepository.getCloudArenaDeck("deck_local_one")).rejects.toBeInstanceOf(
      CloudArenaLocalDeckNotFoundError,
    );
  });

  it("rejects invalid saved decks before writing", async () => {
    const storage = new TestStorage();
    const repository = createCloudArenaLocalDeckRepository({
      idGenerator: () => "deck_too_small",
      storage,
    });

    await expect(repository.createCloudArenaDeck({
      name: "Too Small",
      cards: [{ cardId: "attack", quantity: 1 }],
    })).rejects.toBeInstanceOf(CloudArenaLocalDeckValidationError);

    const decks = await repository.listCloudArenaDecks({ kind: "saved" });
    expect(decks.data).toEqual([]);
  });
});
