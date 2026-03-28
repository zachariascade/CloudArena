import { afterEach, describe, expect, it } from "vitest";

import { createCloudArcanumApiLoaders } from "../apps/cloud-arcanum-api/src/loaders/index.js";
import { normalizeCloudArcanumData } from "../apps/cloud-arcanum-api/src/services/index.js";
import {
  queryCards,
  queryDecks,
  querySets,
  queryUniverses,
} from "../apps/cloud-arcanum-api/src/services/queries.js";
import type { CardColor } from "../src/domain/index.js";
import { cleanupTempProject, createTempProject } from "./helpers.js";

const tempProjects: string[] = [];

afterEach(async () => {
  await Promise.all(tempProjects.splice(0).map(cleanupTempProject));
});

async function withNormalizedData() {
  const tempRoot = await createTempProject();
  tempProjects.push(tempRoot);
  const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });
  return normalizeCloudArcanumData(await loaders.loadSnapshot());
}

describe("cloud arcanum queries", () => {
  it("supports card text search, filters, sorting, and pagination", async () => {
    const normalized = await withNormalizedData();
    const sampleCard = normalized.cards[0]!;
    const searchableToken = sampleCard.data.slug;
    const cardInDeck = normalized.cards.find((record) => record.decks.length > 0);
    const imageResults = queryCards(normalized, { hasImage: true }).data;

    const searchResults = queryCards(normalized, { q: searchableToken }).data;
    expect(searchResults.some((card) => card.id === sampleCard.data.id)).toBe(true);

    const universeResults = queryCards(normalized, {
      universeId: sampleCard.universe?.data.id,
    }).data;
    expect(universeResults.some((card) => card.id === sampleCard.data.id)).toBe(true);

    const setResults = queryCards(normalized, { setId: sampleCard.data.setId }).data;
    expect(setResults.some((card) => card.id === sampleCard.data.id)).toBe(true);

    const statusResults = queryCards(normalized, { status: [sampleCard.data.status] }).data;
    expect(statusResults.every((card) => card.status === sampleCard.data.status)).toBe(true);
    expect(statusResults.some((card) => card.id === sampleCard.data.id)).toBe(true);

    if (sampleCard.data.colors.length > 0) {
      const colorResults = queryCards(normalized, {
        color: [sampleCard.data.colors[0]! as CardColor],
      }).data;
      expect(colorResults.some((card) => card.id === sampleCard.data.id)).toBe(true);
    }

    const unresolvedResults = queryCards(normalized, { hasUnresolvedMechanics: true }).data;
    expect(unresolvedResults.length).toBeGreaterThan(0);
    expect(unresolvedResults.every((card) => card.draft.hasUnresolvedMechanics)).toBe(true);

    expect(imageResults.every((card) => card.image.isRenderable)).toBe(true);
    expect(imageResults.length).toBeGreaterThan(0);

    if (cardInDeck?.decks[0]) {
      const deckResults = queryCards(normalized, {
        deckId: cardInDeck.decks[0].deck.data.id,
      }).data;
      expect(deckResults.some((card) => card.id === cardInDeck.data.id)).toBe(true);
    }

    const sorted = queryCards(normalized, {
      sort: "updatedAt",
      direction: "desc",
      page: 1,
      pageSize: 1,
    });

    expect(sorted.data).toHaveLength(1);
    expect(sorted.meta.total).toBe(normalized.cards.length);
    expect(sorted.meta.page).toBe(1);
    expect(sorted.meta.pageSize).toBe(1);
  });

  it("supports deck search and filtering", async () => {
    const normalized = await withNormalizedData();
    const sampleDeck = normalized.decks[0]!;
    const searchToken = sampleDeck.data.name.split(/\s+/)[0]!;
    const sampleSetId = sampleDeck.data.setIds[0]!;
    const sampleCardId = sampleDeck.cards[0]?.card?.data.id;

    const searchResults = queryDecks(normalized, { q: searchToken }).data;
    expect(searchResults.some((deck) => deck.id === sampleDeck.data.id)).toBe(true);

    const universeResults = queryDecks(normalized, {
      universeId: sampleDeck.data.universeId,
    }).data;
    expect(universeResults.some((deck) => deck.id === sampleDeck.data.id)).toBe(true);

    const setResults = queryDecks(normalized, { setId: sampleSetId }).data;
    expect(setResults.some((deck) => deck.id === sampleDeck.data.id)).toBe(true);

    if (sampleCardId) {
      const cardResults = queryDecks(normalized, { containsCardId: sampleCardId }).data;
      expect(cardResults.some((deck) => deck.id === sampleDeck.data.id)).toBe(true);
    }
  });

  it("supports set and universe search/filter flows", async () => {
    const normalized = await withNormalizedData();
    const sampleSet = normalized.sets[0]!;
    const sampleUniverse = normalized.universes[0]!;
    const setSearchToken = sampleSet.data.name.split(/\s+/)[0]!;
    const universeSearchToken = sampleUniverse.data.name.split(/\s+/)[0]!;

    const setSearchResults = querySets(normalized, { q: setSearchToken }).data;
    expect(setSearchResults.some((set) => set.id === sampleSet.data.id)).toBe(true);

    const setUniverseResults = querySets(normalized, {
      universeId: sampleSet.data.universeId,
    }).data;
    expect(setUniverseResults.some((set) => set.id === sampleSet.data.id)).toBe(true);

    const universeSearchResults = queryUniverses(normalized, { q: universeSearchToken }).data;
    expect(
      universeSearchResults.some((universe) => universe.id === sampleUniverse.data.id),
    ).toBe(true);
  });
});
