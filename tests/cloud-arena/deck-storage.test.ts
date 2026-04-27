import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  createCloudArenaSavedDeck,
  deleteCloudArenaSavedDeck,
  expandCloudArenaDeckSource,
  loadCloudArenaSavedDeckCollection,
  resolveCloudArenaDeckSourceById,
  updateCloudArenaSavedDeck,
  CloudArenaSavedDeckValidationError,
} from "../../apps/cloud-arena-api/src/index.js";

async function createTempWorkspace(): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), "cloud-arena-deck-storage-"));
}

describe("cloud arena deck storage", () => {
  it("loads missing saved deck directories safely", async () => {
    const workspaceRoot = await createTempWorkspace();

    try {
      const collection = await loadCloudArenaSavedDeckCollection({ workspaceRoot });

      expect(collection.records).toEqual([]);
      expect(collection.issues).toHaveLength(1);
      expect(collection.issues[0]?.message).toContain("Directory not found");
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("creates, loads, updates, resolves, expands, and deletes saved decks", async () => {
    const workspaceRoot = await createTempWorkspace();

    try {
      const created = await createCloudArenaSavedDeck(
        {
          name: "Phase Zero Demo",
          cards: [
            { cardId: "attack", quantity: 10 },
            { cardId: "defend", quantity: 10 },
          ],
          notes: "Phase 0 test deck.",
        },
        { workspaceRoot },
      );

      expect(created.data.id).toMatch(/^deck_[a-f0-9]+$/);
      expect(created.data.name).toBe("Phase Zero Demo");
      expect(created.data.tags).toEqual([]);
      expect(created.data.notes).toBe("Phase 0 test deck.");
      expect(created.data.cards).toEqual([
        { cardId: "attack", quantity: 10 },
        { cardId: "defend", quantity: 10 },
      ]);

      const expectedFilePath = path.join(
        workspaceRoot,
        "data",
        "cloud-arena",
        "decks",
        `${created.data.id}.json`,
      );

      expect(created.filePath).toBe(expectedFilePath);

      const writtenDeck = JSON.parse(await readFile(created.filePath, "utf8")) as {
        id: string;
        name: string;
        cards: Array<{ cardId: string; quantity: number }>;
        tags: string[];
        notes: string | null;
      };

      expect(writtenDeck).toEqual(created.data);

      const loadedCollection = await loadCloudArenaSavedDeckCollection({ workspaceRoot });
      expect(loadedCollection.issues).toEqual([]);
      expect(loadedCollection.records).toHaveLength(1);
      expect(loadedCollection.records[0]?.data).toEqual(created.data);

      const resolvedSavedDeck = await resolveCloudArenaDeckSourceById(created.data.id, {
        workspaceRoot,
        loadedDecks: loadedCollection,
      });

      expect(resolvedSavedDeck?.kind).toBe("saved");
      expect(resolvedSavedDeck?.deckId).toBe(created.data.id);
      expect(expandCloudArenaDeckSource(resolvedSavedDeck!)).toEqual([
        "attack",
        "attack",
        "attack",
        "attack",
        "attack",
        "attack",
        "attack",
        "attack",
        "attack",
        "attack",
        "defend",
        "defend",
        "defend",
        "defend",
        "defend",
        "defend",
        "defend",
        "defend",
        "defend",
        "defend",
      ]);

      const presetSource = await resolveCloudArenaDeckSourceById("starter_deck", { workspaceRoot });
      expect(presetSource?.kind).toBe("preset");
      expect(expandCloudArenaDeckSource(presetSource!)).toContain("token_angel");

      const updated = await updateCloudArenaSavedDeck(
        created.data.id,
        {
          name: "Phase Zero Demo Updated",
          cards: [{ cardId: "attack", quantity: 20 }],
          tags: ["alpha", "battle"],
          notes: null,
        },
        { workspaceRoot },
      );

      expect(updated.data.id).toBe(created.data.id);
      expect(updated.data.name).toBe("Phase Zero Demo Updated");
      expect(updated.data.tags).toEqual(["alpha", "battle"]);
      expect(updated.data.notes).toBeNull();
      expect(updated.data.cards).toEqual([{ cardId: "attack", quantity: 20 }]);

      const reloadedCollection = await loadCloudArenaSavedDeckCollection({ workspaceRoot });
      expect(reloadedCollection.records).toHaveLength(1);
      expect(reloadedCollection.records[0]?.data).toEqual(updated.data);

      await deleteCloudArenaSavedDeck(created.data.id, { workspaceRoot });

      const afterDeleteCollection = await loadCloudArenaSavedDeckCollection({ workspaceRoot });
      expect(afterDeleteCollection.records).toEqual([]);
      expect(afterDeleteCollection.issues).toEqual([]);
      await expect(
        readFile(created.filePath, "utf8"),
      ).rejects.toThrow();
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("reports malformed deck files without throwing", async () => {
    const workspaceRoot = await createTempWorkspace();
    const deckDirectory = path.join(workspaceRoot, "data", "cloud-arena", "decks");

    try {
      await mkdir(deckDirectory, { recursive: true });
      await writeFile(path.join(deckDirectory, "broken.json"), "{", "utf8");

      const collection = await loadCloudArenaSavedDeckCollection({ workspaceRoot });

      expect(collection.records).toEqual([]);
      expect(collection.issues.some((issue) => issue.message.startsWith("Invalid JSON"))).toBe(true);
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });

  it("rejects invalid saved deck input before writing", async () => {
    const workspaceRoot = await createTempWorkspace();

    try {
      await expect(
        createCloudArenaSavedDeck(
          {
            name: "Too Small",
            cards: [{ cardId: "attack", quantity: 1 }],
          },
          { workspaceRoot },
        ),
      ).rejects.toBeInstanceOf(CloudArenaSavedDeckValidationError);

      const collection = await loadCloudArenaSavedDeckCollection({ workspaceRoot });
      expect(collection.records).toEqual([]);
    } finally {
      await rm(workspaceRoot, { recursive: true, force: true });
    }
  });
});
