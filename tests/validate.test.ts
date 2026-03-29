import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { validateProject } from "../scripts/validate.js";
import {
  cleanupTempProject,
  createTempProject,
  readJson,
  writeJson,
} from "./helpers.js";

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

describe("project validator", () => {
  it("passes for the sample content", async () => {
    const tempRoot = await withTempProject();

    const result = await validateProject(tempRoot);

    expect(result.errors).toHaveLength(0);
    expect(result.counts.universes).toBeGreaterThan(0);
    expect(result.counts.sets).toBeGreaterThan(0);
    expect(result.counts.cards).toBeGreaterThan(0);
    expect(result.counts.decks).toBeGreaterThan(0);
    expect(result.counts.totalFiles).toBe(
      result.counts.universes +
        result.counts.sets +
        result.counts.cards +
        result.counts.decks,
    );
  });

  it("reports broken references across sets, cards, decks, and commanders", async () => {
    const tempRoot = await withTempProject();

    const setPath = path.join(
      tempRoot,
      "data/sets/set_genesis_book_of_beginnings.json",
    );
    const cardPath = path.join(
      tempRoot,
      "data/cards/card_0001_abraham.json",
    );
    const deckPath = path.join(
      tempRoot,
      "data/decks/deck_patriarchs_tribe_of_promise.json",
    );

    const setRecord = await readJson<Record<string, unknown>>(setPath);
    const cardRecord = await readJson<Record<string, unknown>>(cardPath);
    const deckRecord = await readJson<Record<string, unknown>>(deckPath);

    setRecord.universeId = "universe_missing";
    cardRecord.setId = "set_missing";
    deckRecord.universeId = "universe_missing";
    deckRecord.setIds = ["set_missing"];
    deckRecord.commander = "card_missing";
    deckRecord.cards = [{ cardId: "card_missing", quantity: 1 }];

    await writeJson(setPath, setRecord);
    await writeJson(cardPath, cardRecord);
    await writeJson(deckPath, deckRecord);

    const result = await validateProject(tempRoot);
    const messages = result.errors.map((error) => error.message);

    expect(messages).toContain('Unknown universeId "universe_missing".');
    expect(messages).toContain('Unknown setId "set_missing".');
    expect(messages).toContain('Unknown setId "set_missing" in deck setIds.');
    expect(messages).toContain('Unknown commander cardId "card_missing".');
    expect(messages).toContain('Unknown deck cardId "card_missing".');
  });

  it("reports filename and record ID mismatches", async () => {
    const tempRoot = await withTempProject();

    const cardPath = path.join(
      tempRoot,
      "data/cards/card_0001_abraham.json",
    );
    const cardRecord = await readJson<Record<string, unknown>>(cardPath);
    cardRecord.id = "card_9999";
    await writeJson(cardPath, cardRecord);

    const result = await validateProject(tempRoot);

    expect(
      result.errors.some((error) => error.message.includes("Filename ID prefix")),
    ).toBe(true);
  });

  it("reports duplicate IDs", async () => {
    const tempRoot = await withTempProject();

    const duplicateCardPath = path.join(
      tempRoot,
      "data/cards/card_0003_duplicate_test.json",
    );
    const duplicateCard = await readJson<Record<string, unknown>>(
      path.join(tempRoot, "data/cards/card_0001_abraham.json"),
    );
    duplicateCard.slug = "duplicate_test";
    await writeJson(duplicateCardPath, duplicateCard);

    const result = await validateProject(tempRoot);

    expect(
      result.errors.some((error) =>
        error.message.includes('Duplicate card id "card_0001"'),
      ),
    ).toBe(true);
  });
});
