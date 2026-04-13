import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createCloudArcanumApiLoaders } from "../../apps/cloud-arcanum-api/src/loaders/index.js";
import {
  createCloudArcanumApiServices,
  normalizeCloudArcanumData,
} from "../../apps/cloud-arcanum-api/src/services/index.js";
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

describe("cloud arcanum normalization", () => {
  it("builds indexes and resolves entity relationships", async () => {
    const tempRoot = await withTempProject();
    const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });
    const snapshot = await loaders.loadSnapshot();

    const normalized = normalizeCloudArcanumData(snapshot);

    expect(normalized.indexes.cardsById.size).toBe(snapshot.cards.length);
    expect(normalized.indexes.decksById.size).toBe(snapshot.decks.length);
    expect(normalized.indexes.setsById.size).toBe(snapshot.sets.length);
    expect(normalized.indexes.universesById.size).toBe(snapshot.universes.length);

    const card = normalized.cards.find((record) => record.set && record.universe);
    expect(card).toBeDefined();
    expect(card?.set?.data.id).toBe(card?.data.setId);
    expect(card?.universe?.data.id).toBe(card?.set?.data.universeId);

    const setRecord = normalized.sets.find((record) => record.cards.length > 0 && record.universe);
    expect(setRecord).toBeDefined();
    expect(setRecord?.cards.length).toBeGreaterThan(0);
    expect(
      (setRecord?.countsByStatus.approved ?? 0) +
        (setRecord?.countsByStatus.balanced ?? 0) +
        (setRecord?.countsByStatus.templating ?? 0) +
        (setRecord?.countsByStatus.draft ?? 0),
    ).toBe(setRecord?.cards.length);

    const universe = normalized.universes.find(
      (record) => record.sets.length > 0 && record.cards.length > 0,
    );
    expect(universe).toBeDefined();
    expect(universe?.sets.length).toBeGreaterThan(0);
    expect(universe?.cards.length).toBeGreaterThan(0);
    expect(
      (universe?.countsByStatus.approved ?? 0) +
        (universe?.countsByStatus.balanced ?? 0) +
        (universe?.countsByStatus.templating ?? 0) +
        (universe?.countsByStatus.draft ?? 0),
    ).toBe(universe?.cards.length);

    const deck = normalized.decks.find((record) => record.cards.length > 0 && record.universe);
    expect(deck).toBeDefined();
    expect(deck?.universe?.data.id).toBe(deck?.data.universeId);
    expect(deck?.sets.length).toBeGreaterThan(0);
    expect(deck?.cards.length).toBeGreaterThan(0);
    expect(deck?.totalCards).toBeGreaterThanOrEqual(deck?.uniqueCards ?? 0);
    expect(deck?.cards.reduce((sum, entry) => sum + entry.quantity, 0)).toBe(deck?.totalCards);
    expect(normalized.issues).toHaveLength(0);
  });

  it("reports missing relationship references without throwing", async () => {
    const tempRoot = await withTempProject();
    const setPath = path.join(tempRoot, "data/sets/set_genesis_book_of_beginnings.json");
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
    deckRecord.cards = [{ cardId: "card_missing", quantity: 2 }];

    await writeJson(setPath, setRecord);
    await writeJson(cardPath, cardRecord);
    await writeJson(deckPath, deckRecord);

    const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });
    const normalized = normalizeCloudArcanumData(await loaders.loadSnapshot());
    const messages = normalized.issues.map((issue) => issue.message);

    expect(messages).toContain('Unknown universeId "universe_missing".');
    expect(messages).toContain('Unknown setId "set_missing".');
    expect(messages).toContain('Unknown setId "set_missing" in deck setIds.');
    expect(messages).toContain('Unknown commander cardId "card_missing".');
    expect(messages).toContain('Unknown deck cardId "card_missing".');
  });

  it("exposes normalized data through the service layer", async () => {
    const tempRoot = await withTempProject();
    const services = createCloudArcanumApiServices(
      createCloudArcanumApiLoaders({ workspaceRoot: tempRoot }),
    );

    const normalized = await services.loadNormalizedData();

    expect(normalized.cards.length).toBe(normalized.indexes.cardsById.size);
    expect(normalized.decks.length).toBe(normalized.indexes.decksById.size);
    expect(normalized.sets.length).toBe(normalized.indexes.setsById.size);
    expect(normalized.universes.length).toBe(normalized.indexes.universesById.size);
  });
});
