import { describe, expect, it } from "vitest";

import {
  createCloudArenaLocalDeckRepository,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-local-decks.js";
import {
  CloudArenaLocalSessionNotFoundError,
  createCloudArenaLocalSessionService,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-local-session.js";
import {
  createCloudArenaSessionController,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-session-controller.js";

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

describe("cloud arena local session service", () => {
  it("creates, advances, and resets local sessions with browser-saved decks", async () => {
    const deckRepository = createCloudArenaLocalDeckRepository({
      idGenerator: () => "deck_local_session",
      storage: new TestStorage(),
    });

    await deckRepository.createCloudArenaDeck({
      name: "Local Session Deck",
      cards: [
        { cardId: "attack", quantity: 10 },
        { cardId: "defend", quantity: 10 },
      ],
      tags: ["session"],
      notes: null,
    });

    const sessions = createCloudArenaLocalSessionService({
      deckRepository,
      idGenerator: () => "session_local_one",
      now: () => new Date("2026-04-21T12:00:00.000Z"),
    });

    const created = await sessions.createCloudArenaSession({
      scenarioId: "demon_pack",
      deckId: "deck_local_session",
      seed: 42,
      shuffleDeck: false,
    });

    expect(created.data).toMatchObject({
      sessionId: "session_local_one",
      deckId: "deck_local_session",
      seed: 42,
      status: "active",
    });
    expect(created.data.player.drawPile.map((card) => card.definitionId)).toContain("attack");

    const action = created.data.legalActions[0]?.action;

    if (!action) {
      throw new Error("Expected at least one legal action.");
    }

    const advanced = await sessions.applyCloudArenaAction(created.data.sessionId, { action });

    expect(advanced.data.actionHistory).toHaveLength(1);

    const reset = await sessions.resetCloudArenaSession(created.data.sessionId);

    expect(reset.data.actionHistory).toEqual([]);
    expect(reset.data.seed).toBe(42);
  });

  it("reports missing local sessions clearly", async () => {
    const sessions = createCloudArenaLocalSessionService();

    await expect(sessions.getCloudArenaSession("missing")).rejects.toBeInstanceOf(
      CloudArenaLocalSessionNotFoundError,
    );
  });

  it("uses local mode through the session controller without an API", async () => {
    const controller = createCloudArenaSessionController({
      apiBaseUrl: "http://127.0.0.1:1",
      mode: "local",
    });

    const session = await controller.createCloudArenaSession({
      scenarioId: "demon_pack",
      deckId: "master_deck",
      seed: 7,
      shuffleDeck: false,
    });

    expect(session.data.deckId).toBe("master_deck");
    expect(session.data.legalActions.length).toBeGreaterThan(0);
  });
});
