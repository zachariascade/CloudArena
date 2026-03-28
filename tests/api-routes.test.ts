import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createCloudArcanumApiApp } from "../apps/cloud-arcanum-api/src/app.js";
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

async function createTestApp() {
  const tempRoot = await createTempProject();
  tempProjects.push(tempRoot);

  return createCloudArcanumApiApp({ workspaceRoot: tempRoot });
}

describe("cloud arcanum api routes", () => {
  it("serves cards list and detail responses", async () => {
    const app = await createTestApp();

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/cards?pageSize=1",
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().data.length).toBeGreaterThan(0);
    const cardId = listResponse.json().data[0].id;

    const detailResponse = await app.inject({
      method: "GET",
      url: `/api/cards/${cardId}`,
    });

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json().data.id).toBe(cardId);
    expect(detailResponse.json().data.set.id).toBeTypeOf("string");
    expect(detailResponse.json().data.universe.id).toBeTypeOf("string");

    await app.close();
  });

  it("serves decks, sets, universes, and filter metadata", async () => {
    const app = await createTestApp();

    const filtersResponse = await app.inject({
      method: "GET",
      url: "/api/meta/filters",
    });
    const decksResponse = await app.inject({
      method: "GET",
      url: "/api/decks",
    });
    const setsResponse = await app.inject({
      method: "GET",
      url: "/api/sets",
    });
    const universesResponse = await app.inject({
      method: "GET",
      url: "/api/universes",
    });

    expect(filtersResponse.statusCode).toBe(200);
    expect(filtersResponse.json().data.statuses.length).toBeGreaterThan(0);
    expect(decksResponse.statusCode).toBe(200);
    expect(decksResponse.json().data.length).toBeGreaterThan(0);
    expect(setsResponse.statusCode).toBe(200);
    expect(setsResponse.json().data.length).toBeGreaterThan(0);
    expect(universesResponse.statusCode).toBe(200);
    expect(universesResponse.json().data.length).toBeGreaterThan(0);

    await app.close();
  });

  it("serves validation summary and entity validation", async () => {
    const app = await createTestApp();

    const summaryResponse = await app.inject({
      method: "GET",
      url: "/api/validation/summary",
    });
    const cardsResponse = await app.inject({
      method: "GET",
      url: "/api/cards?pageSize=1",
    });
    expect(cardsResponse.json().data.length).toBeGreaterThan(0);
    const cardId = cardsResponse.json().data[0].id;
    const entityResponse = await app.inject({
      method: "GET",
      url: `/api/validation/entities/${cardId}`,
    });

    expect(summaryResponse.statusCode).toBe(200);
    expect(summaryResponse.json().data.counts.totalFiles).toBe(
      summaryResponse.json().data.counts.universes +
        summaryResponse.json().data.counts.sets +
        summaryResponse.json().data.counts.cards +
        summaryResponse.json().data.counts.decks,
    );
    expect(entityResponse.statusCode).toBe(200);
    expect(entityResponse.json().data.entityId).toBe(cardId);
    expect(entityResponse.json().data.hasErrors).toBe(false);

    await app.close();
  });

  it("returns invalid_query and not_found envelopes when appropriate", async () => {
    const app = await createTestApp();

    const invalidQueryResponse = await app.inject({
      method: "GET",
      url: "/api/cards?hasImage=maybe",
    });
    const notFoundResponse = await app.inject({
      method: "GET",
      url: "/api/cards/card_missing",
    });

    expect(invalidQueryResponse.statusCode).toBe(400);
    expect(invalidQueryResponse.json().error.code).toBe("invalid_query");
    expect(notFoundResponse.statusCode).toBe(404);
    expect(notFoundResponse.json().error.code).toBe("not_found");

    await app.close();
  });

  it("surfaces missing-image and missing-reference edge cases in route payloads", async () => {
    const tempRoot = await createTempProject();
    tempProjects.push(tempRoot);

    const cardPath = path.join(
      tempRoot,
      "data/cards/card_0001_abraham_father_of_nations.json",
    );
    const cardRecord = await readJson<Record<string, unknown>>(cardPath);
    cardRecord.image = {
      type: "local",
      path: "images/cards/missing-art.svg",
    };
    cardRecord.setId = "set_missing";
    await writeJson(cardPath, cardRecord);

    const app = createCloudArcanumApiApp({ workspaceRoot: tempRoot });

    const detailResponse = await app.inject({
      method: "GET",
      url: "/api/cards/card_0001",
    });

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json().data.image.kind).toBe("missing");
    expect(detailResponse.json().data.image.isRenderable).toBe(false);
    expect(detailResponse.json().data.set.name).toBe("Unknown Set");
    expect(detailResponse.json().data.universe.name).toBe("Unknown Universe");
    expect(detailResponse.json().data.validation.hasErrors).toBe(true);

    await app.close();
  });
});
