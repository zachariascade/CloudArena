import { chdir, cwd } from "node:process";

import { describe, expect, it } from "vitest";

import { createCloudArenaApiApp } from "../../apps/cloud-arena-api/src/app.js";
import { createTempProject, cleanupTempProject } from "../cloud-arcanum/helpers.js";

describe("cloud arena content routes", () => {
  it("lists cards, manages decks, and accepts saved decks when creating sessions", async () => {
    const tempRoot = await createTempProject();
    const originalCwd = cwd();

    try {
      chdir(tempRoot);
      const app = createCloudArenaApiApp();

      const cardsResponse = await app.inject({
        method: "GET",
        url: "/api/cloud-arena/cards?q=guardian&cardType=creature",
      });

      expect(cardsResponse.statusCode).toBe(200);
      expect(cardsResponse.json().data.length).toBeGreaterThan(0);
      expect(cardsResponse.json().data[0].typeLine).toContain("creature");
      expect(cardsResponse.json().data[0].effectSummary).toBeTypeOf("string");

      const createDeckResponse = await app.inject({
        method: "POST",
        url: "/api/cloud-arena/decks",
        payload: {
          name: "Phase 2 Route Deck",
          cards: [
            { cardId: "attack", quantity: 10 },
            { cardId: "defend", quantity: 10 },
          ],
          tags: ["route", "phase2"],
          notes: "Created through the content route.",
        },
      });

      expect(createDeckResponse.statusCode).toBe(200);
      expect(createDeckResponse.json().data.kind).toBe("saved");
      expect(createDeckResponse.json().data.cardCount).toBe(20);
      expect(createDeckResponse.json().data.uniqueCardCount).toBe(2);

      const savedDeckId = createDeckResponse.json().data.id as string;

      const deckListResponse = await app.inject({
        method: "GET",
        url: `/api/cloud-arena/decks?kind=saved&containsCardId=attack&q=phase`,
      });

      expect(deckListResponse.statusCode).toBe(200);
      expect(deckListResponse.json().data.some((deck: { id: string }) => deck.id === savedDeckId)).toBe(true);

      const deckDetailResponse = await app.inject({
        method: "GET",
        url: `/api/cloud-arena/decks/${savedDeckId}`,
      });

      expect(deckDetailResponse.statusCode).toBe(200);
      expect(deckDetailResponse.json().data.id).toBe(savedDeckId);
      expect(deckDetailResponse.json().data.cards).toEqual([
        { cardId: "attack", quantity: 10 },
        { cardId: "defend", quantity: 10 },
      ]);

      const updateDeckResponse = await app.inject({
        method: "PUT",
        url: `/api/cloud-arena/decks/${savedDeckId}`,
        payload: {
          name: "Phase 2 Route Deck Updated",
          cards: [{ cardId: "attack", quantity: 20 }],
          tags: ["route"],
          notes: null,
        },
      });

      expect(updateDeckResponse.statusCode).toBe(200);
      expect(updateDeckResponse.json().data.name).toBe("Phase 2 Route Deck Updated");
      expect(updateDeckResponse.json().data.cardCount).toBe(20);

      const sessionResponse = await app.inject({
        method: "POST",
        url: "/api/cloud-arena/sessions",
        payload: {
          scenarioId: "mixed_guardian",
          deckId: savedDeckId,
          seed: 17,
          shuffleDeck: false,
        },
      });

      expect(sessionResponse.statusCode).toBe(200);
      expect(sessionResponse.json().data.deckId).toBe(savedDeckId);
      expect(sessionResponse.json().data.resetSource.deckId).toBe(savedDeckId);

      const deleteDeckResponse = await app.inject({
        method: "DELETE",
        url: `/api/cloud-arena/decks/${savedDeckId}`,
      });

      expect(deleteDeckResponse.statusCode).toBe(200);
      expect(deleteDeckResponse.json().data).toEqual({
        deleted: true,
        deckId: savedDeckId,
      });

      await app.close();
    } finally {
      chdir(originalCwd);
      await cleanupTempProject(tempRoot);
    }
  }, 15000);
});
