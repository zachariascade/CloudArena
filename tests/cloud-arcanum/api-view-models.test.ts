import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createCloudArcanumApiLoaders } from "../../apps/cloud-arcanum-api/src/loaders/index.js";
import { normalizeCloudArcanumData } from "../../apps/cloud-arcanum-api/src/services/index.js";
import {
  buildCardDetail,
  buildCardListItem,
  buildDeckDetail,
  buildDerivedViewModels,
  buildDraftStatusSummary,
  buildImagePreview,
  buildSetDetail,
  buildUniverseDetail,
} from "../../apps/cloud-arcanum-api/src/services/view-models.js";
import {
  cleanupTempProject,
  createTempProject,
  readJson,
  writeJson,
} from "./helpers.js";

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

describe("cloud arcanum view models", () => {
  it("derives draft status summary from unresolved mechanics", async () => {
    const normalized = await withNormalizedData();
    const draftCard = normalized.cards.find((record) => record.data.status === "draft");

    expect(draftCard).toBeDefined();

    const summary = buildDraftStatusSummary(draftCard!.data);

    expect(summary.status).toBe("draft");
    expect(summary.isDraftLike).toBe(true);
    expect(summary.hasUnresolvedMechanics).toBe(true);
    expect(summary.unresolvedFields.length).toBeGreaterThan(0);
    expect(summary.reviewLabel).toBe("Draft");
  });

  it("ignores irrelevant loyalty and defense fields for creature cards", async () => {
    const normalized = await withNormalizedData();
    const approvedCreature = normalized.indexes.cardsById.get("card_0001");

    expect(approvedCreature).toBeDefined();

    const summary = buildDraftStatusSummary(approvedCreature!.data);

    expect(summary.hasUnresolvedMechanics).toBe(false);
    expect(summary.unresolvedFields).toEqual([]);
    expect(summary.reviewLabel).toBe("Approved");
  });

  it("derives renderable local and missing image previews", async () => {
    const normalized = await withNormalizedData();
    const availableImagePaths = new Set(
      normalized.snapshot.cardImages.map((record) => record.relativeFilePath),
    );
    const sampleImagePath = normalized.snapshot.cardImages[0]?.relativeFilePath;

    expect(sampleImagePath).toBeDefined();

    const localPreview = buildImagePreview(
      {
        type: "local",
        path: sampleImagePath!,
      },
      "Sample artwork",
      availableImagePaths,
    );
    const missingPreview = buildImagePreview(
      {
        type: "local",
        path: "images/cards/missing.svg",
      },
      "Missing artwork",
      availableImagePaths,
    );

    expect(localPreview.kind).toBe("local");
    expect(localPreview.publicUrl).toBe(`/${sampleImagePath}`);
    expect(localPreview.isRenderable).toBe(true);
    expect(localPreview.artist).toBeNull();
    expect(missingPreview.kind).toBe("missing");
    expect(missingPreview.isRenderable).toBe(false);
  });

  it("builds card, deck, set, and universe detail models", async () => {
    const normalized = await withNormalizedData();
    const cardRecord = normalized.cards.find((record) => record.decks.length > 0)!;
    const deckRecord = normalized.decks.find((record) => record.cards.length > 0)!;
    const setRecord = normalized.sets.find((record) => record.cards.length > 0)!;
    const universeRecord = normalized.universes.find((record) => record.cards.length > 0)!;

    const cardDetail = buildCardDetail(normalized, cardRecord);
    const deckDetail = buildDeckDetail(normalized, deckRecord);
    const setDetail = buildSetDetail(normalized, setRecord);
    const universeDetail = buildUniverseDetail(universeRecord);

    expect(cardDetail.set.id).toBe(cardRecord.set?.data.id);
    expect(cardDetail.universe.id).toBe(cardRecord.universe?.data.id);
    expect(cardDetail.decks.length).toBeGreaterThan(0);

    expect(deckDetail.summary.totalCards).toBe(deckRecord.totalCards);
    expect(
      (deckDetail.summary.byStatus.approved ?? 0) +
        (deckDetail.summary.byStatus.balanced ?? 0) +
        (deckDetail.summary.byStatus.templating ?? 0) +
        (deckDetail.summary.byStatus.draft ?? 0),
    ).toBe(deckRecord.totalCards);
    expect(deckDetail.summary.bySet.length).toBeGreaterThan(0);

    expect(setDetail.cardCount).toBe(setRecord.cards.length);
    expect(setDetail.featuredCards.length).toBeLessThanOrEqual(setDetail.cardCount);
    expect(universeDetail.counts).toEqual({
      sets: universeRecord.sets.length,
      cards: universeRecord.cards.length,
      decks: universeRecord.decks.length,
    });
  });

  it("builds list items and aggregate derived model maps", async () => {
    const normalized = await withNormalizedData();
    const sampleCard = normalized.cards[0]!;

    const cardListItem = buildCardListItem(normalized, sampleCard);
    const derived = buildDerivedViewModels(normalized);

    expect(cardListItem.id).toBe(sampleCard.data.id);
    expect(cardListItem.name).toBe(sampleCard.data.name);
    expect(cardListItem.validation).toEqual({
      hasErrors: false,
      errorCount: 0,
    });
    expect(derived.cardListItems).toHaveLength(normalized.cards.length);
    expect(derived.deckListItems).toHaveLength(normalized.decks.length);
    expect(derived.setListItems).toHaveLength(normalized.sets.length);
    expect(derived.universeListItems).toHaveLength(normalized.universes.length);
    expect(derived.cardDetailsById.get(sampleCard.data.id)?.name).toBe(sampleCard.data.name);
  });

  it("surfaces file-scoped validation issues in derived validation summaries", async () => {
    const tempRoot = await createTempProject();
    tempProjects.push(tempRoot);

    const cardPath = path.join(
      tempRoot,
      "data/cards/card_0001_abraham.json",
    );
    const cardRecord = await readJson<Record<string, unknown>>(cardPath);
    cardRecord.setId = "set_missing";
    await writeJson(cardPath, cardRecord);

    const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });
    const normalized = normalizeCloudArcanumData(await loaders.loadSnapshot());
    const cardListItem = buildCardListItem(normalized, normalized.indexes.cardsById.get("card_0001")!);

    expect(cardListItem.validation.hasErrors).toBe(true);
    expect(cardListItem.validation.errorCount).toBeGreaterThan(0);
  });

  it("resolves themed card art with fallback while preserving legacy compatibility", async () => {
    const tempRoot = await createTempProject();
    tempProjects.push(tempRoot);

    const setPath = path.join(tempRoot, "data/sets/set_genesis_book_of_beginnings.json");
    const cardPath = path.join(tempRoot, "data/cards/card_0001_abraham.json");

    const setRecord = await readJson<Record<string, unknown>>(setPath);
    const cardRecord = await readJson<Record<string, unknown>>(cardPath);

    setRecord.themes = [
      { id: "default", name: "Default" },
      { id: "classics", name: "Classics" },
    ];
    setRecord.defaultThemeId = "default";
    setRecord.activeThemeId = "classics";

    const legacyImage = cardRecord.image;
    cardRecord.images = {
      default: legacyImage,
    };

    await writeJson(setPath, setRecord);
    await writeJson(cardPath, cardRecord);

    const loaders = createCloudArcanumApiLoaders({ workspaceRoot: tempRoot });
    const normalized = normalizeCloudArcanumData(await loaders.loadSnapshot());
    const card = normalized.indexes.cardsById.get("card_0001")!;

    const preview = buildCardListItem(normalized, card, undefined, {
      themeId: "classics",
    }).image;

    expect(preview.isRenderable).toBe(true);
    expect(preview.requestedThemeId).toBe("classics");
    expect(preview.resolvedThemeId).toBe("default");
    expect(preview.fellBack).toBe(true);
    expect(preview.artist).toBe(card.data.artist);
  });
});
