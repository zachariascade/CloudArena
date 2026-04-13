import path from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";

import { afterEach, describe, expect, it } from "vitest";

import { createCloudArcanumApiLoaders } from "../../apps/cloud-arcanum-api/src/loaders/index.js";
import { cleanupTempProject, createTempProject } from "./helpers.js";

const tempProjects: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempProjects.splice(0).map((tempRoot) => cleanupTempProject(tempRoot)),
  );
});

async function withTempProject(): Promise<string> {
  const tempRoot = await createTempProject();
  tempProjects.push(tempRoot);
  return tempRoot;
}

describe("cloud arcanum api loaders", () => {
  it("loads canonical entity records and card image assets", async () => {
    const tempRoot = await withTempProject();
    const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });

    const snapshot = await loaders.loadSnapshot();

    expect(snapshot.universes.length).toBeGreaterThan(0);
    expect(snapshot.sets.length).toBeGreaterThan(0);
    expect(snapshot.cards.length).toBeGreaterThan(0);
    expect(snapshot.decks.length).toBeGreaterThan(0);
    expect(snapshot.cardImages.length).toBeGreaterThan(0);
    expect(snapshot.issues).toHaveLength(0);
    expect(snapshot.universes.every((record) => record.relativeFilePath.startsWith("data/universes/"))).toBe(true);
    expect(snapshot.sets.every((record) => record.relativeFilePath.startsWith("data/sets/"))).toBe(true);
    expect(snapshot.cards.every((record) => record.relativeFilePath.startsWith("data/cards/"))).toBe(true);
    expect(snapshot.decks.every((record) => record.relativeFilePath.startsWith("data/decks/"))).toBe(true);
    expect(snapshot.cardImages.every((record) => record.relativeFilePath.startsWith("images/cards/"))).toBe(true);
  });

  it("reports malformed files without throwing and skips invalid records", async () => {
    const tempRoot = await withTempProject();
    const cardPath = path.join(tempRoot, "data/cards/card_9999_broken.json");
    await writeFile(cardPath, "{ invalid json\n", "utf8");

    const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });
    const cards = await loaders.loadCards();

    expect(cards.records.length).toBeGreaterThan(0);
    expect(cards.issues).toHaveLength(1);
    expect(cards.issues[0]?.file).toBe("data/cards/card_9999_broken.json");
    expect(cards.issues[0]?.message).toContain("Invalid JSON:");
  });

  it("reports missing directories safely", async () => {
    const tempRoot = await withTempProject();
    await rm(path.join(tempRoot, "data/decks"), { recursive: true, force: true });
    await rm(path.join(tempRoot, "images/cards"), { recursive: true, force: true });

    const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });
    const [decks, cardImages] = await Promise.all([
      loaders.loadDecks(),
      loaders.loadCardImages(),
    ]);

    expect(decks.records).toHaveLength(0);
    expect(decks.issues).toEqual([
      {
        file: "data/decks",
        message: "Directory not found.",
      },
    ]);
    expect(cardImages.records).toHaveLength(0);
    expect(cardImages.issues).toEqual([
      {
        file: "images/cards",
        message: "Directory not found.",
      },
    ]);
  });

  it("ignores .gitkeep while reading card images", async () => {
    const tempRoot = await withTempProject();
    await rm(path.join(tempRoot, "images/cards"), { recursive: true, force: true });
    await mkdir(path.join(tempRoot, "images/cards"), { recursive: true });
    await writeFile(path.join(tempRoot, "images/cards/.gitkeep"), "", "utf8");
    await writeFile(path.join(tempRoot, "images/cards/custom-test.png"), "png", "utf8");

    const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });
    const cardImages = await loaders.loadCardImages();

    expect(cardImages.issues).toHaveLength(0);
    expect(cardImages.records).toHaveLength(1);
    expect(cardImages.records[0]?.relativeFilePath).toBe("images/cards/custom-test.png");
  });
});
