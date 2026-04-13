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

  it("serves card count, id, and summary query routes with aligned results", async () => {
    const app = await createTestApp();
    const queryString =
      "/api/cards/summary?hasUnresolvedMechanics=true&sort=updatedAt&direction=desc&page=1&pageSize=3";

    const summaryResponse = await app.inject({
      method: "GET",
      url: queryString,
    });
    const idsResponse = await app.inject({
      method: "GET",
      url: "/api/cards/ids?hasUnresolvedMechanics=true&sort=updatedAt&direction=desc&page=1&pageSize=3",
    });
    const countResponse = await app.inject({
      method: "GET",
      url: "/api/cards/count?hasUnresolvedMechanics=true&sort=updatedAt&direction=desc&page=1&pageSize=3",
    });

    expect(summaryResponse.statusCode).toBe(200);
    expect(idsResponse.statusCode).toBe(200);
    expect(countResponse.statusCode).toBe(200);
    expect(summaryResponse.json().data.map((item: { id: string }) => item.id)).toEqual(
      idsResponse.json().data.map((item: { id: string }) => item.id),
    );
    expect(summaryResponse.json().data.every((item: { hasUnresolvedMechanics: boolean }) => item.hasUnresolvedMechanics)).toBe(true);
    expect(countResponse.json().data.total).toBe(summaryResponse.json().meta.total);

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
      "data/cards/card_0001_abraham.json",
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

  it("supports theme-aware card previews through query params", async () => {
    const tempRoot = await createTempProject();
    tempProjects.push(tempRoot);

    const setPath = path.join(tempRoot, "data/sets/set_genesis_book_of_beginnings.json");
    const cardPath = path.join(tempRoot, "data/cards/card_0001_abraham.json");

    const setRecord = await readJson<Record<string, unknown>>(setPath);
    const cardRecord = await readJson<Record<string, unknown>>(cardPath);

    setRecord.themes = [
      { id: "default", name: "Default" },
      { id: "anime", name: "Anime" },
    ];
    setRecord.defaultThemeId = "default";
    setRecord.activeThemeId = "anime";

    const legacyImage = cardRecord.image;
    cardRecord.images = {
      default: legacyImage,
    };

    await writeJson(setPath, setRecord);
    await writeJson(cardPath, cardRecord);

    const app = createCloudArcanumApiApp({ workspaceRoot: tempRoot });

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/cards?setId=set_genesis&themeId=anime",
    });
    const detailResponse = await app.inject({
      method: "GET",
      url: "/api/cards/card_0001?themeId=anime",
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().meta.filtersApplied.themeId).toBe("anime");
    expect(listResponse.json().data[0].image.fellBack).toBe(true);
    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json().data.image.requestedThemeId).toBe("anime");
    expect(detailResponse.json().data.image.resolvedThemeId).toBe("default");

    await app.close();
  });

  it("creates, reads, updates, and resets Cloud Arena sessions", async () => {
    const app = await createTestApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/cloud-arena/sessions",
      payload: {
        scenarioId: "mixed_guardian",
        seed: 7,
      },
    });

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.json().data.sessionId).toBeTypeOf("string");
    expect(createResponse.json().data.scenarioId).toBe("mixed_guardian");
    expect(createResponse.json().data.seed).toBe(7);
    expect(createResponse.json().data.createdAt).toBeTypeOf("string");
    expect(createResponse.json().data.resetSource).toEqual({
      scenarioId: "mixed_guardian",
      seed: 7,
    });
    expect(createResponse.json().data.actionHistory).toEqual([]);
    expect(createResponse.json().data.legalActions.length).toBeGreaterThan(0);

    const initialSnapshot = createResponse.json().data;
    const sessionId = initialSnapshot.sessionId;

    const detailResponse = await app.inject({
      method: "GET",
      url: `/api/cloud-arena/sessions/${sessionId}`,
    });

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.json().data.sessionId).toBe(sessionId);
    expect(detailResponse.json().data.player.hand).toEqual(initialSnapshot.player.hand);

    const actionToApply =
      initialSnapshot.legalActions.find((entry: { action: { type: string } }) => entry.action.type !== "end_turn")
      ?? initialSnapshot.legalActions[0];

    const actionResponse = await app.inject({
      method: "POST",
      url: `/api/cloud-arena/sessions/${sessionId}/actions`,
      payload: {
        action: actionToApply.action,
      },
    });

    expect(actionResponse.statusCode).toBe(200);
    expect(actionResponse.json().data.sessionId).toBe(sessionId);
    expect(actionResponse.json().data.log.length).toBeGreaterThan(initialSnapshot.log.length);
    expect(actionResponse.json().data.actionHistory).toHaveLength(1);

    const resetResponse = await app.inject({
      method: "POST",
      url: `/api/cloud-arena/sessions/${sessionId}/reset`,
    });

    expect(resetResponse.statusCode).toBe(200);
    expect(resetResponse.json().data.seed).toBe(7);
    expect(resetResponse.json().data.resetSource).toEqual(initialSnapshot.resetSource);
    expect(resetResponse.json().data.actionHistory).toEqual([]);
    expect(resetResponse.json().data.player.hand).toEqual(initialSnapshot.player.hand);
    expect(resetResponse.json().data.log).toEqual(initialSnapshot.log);

    await app.close();
  });

  it("returns Cloud Arena session route errors for missing sessions and invalid actions", async () => {
    const app = await createTestApp();

    const missingResponse = await app.inject({
      method: "GET",
      url: "/api/cloud-arena/sessions/session_missing",
    });

    expect(missingResponse.statusCode).toBe(404);
    expect(missingResponse.json().error.code).toBe("not_found");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/cloud-arena/sessions",
      payload: {},
    });

    const sessionId = createResponse.json().data.sessionId;
    const invalidActionResponse = await app.inject({
      method: "POST",
      url: `/api/cloud-arena/sessions/${sessionId}/actions`,
      payload: {
        action: {
          type: "play_card",
          cardInstanceId: "card_missing",
        },
      },
    });

    expect(invalidActionResponse.statusCode).toBe(400);
    expect(invalidActionResponse.json().error.code).toBe("invalid_request");

    await app.close();
  });

  it("rejects malformed Cloud Arena action payloads", async () => {
    const app = await createTestApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/cloud-arena/sessions",
      payload: {},
    });

    const malformedActionResponse = await app.inject({
      method: "POST",
      url: `/api/cloud-arena/sessions/${createResponse.json().data.sessionId}/actions`,
      payload: {
        nope: true,
      },
    });

    expect(malformedActionResponse.statusCode).toBe(400);
    expect(malformedActionResponse.json().error.code).toBe("invalid_request");
    expect(malformedActionResponse.json().error.message).toContain("action object");

    await app.close();
  });

  it("returns clear Cloud Arena errors for invalid setup input and finished sessions", async () => {
    const app = await createTestApp();

    const invalidSetupResponse = await app.inject({
      method: "POST",
      url: "/api/cloud-arena/sessions",
      payload: {
        scenarioId: "unknown_scenario",
      },
    });

    expect(invalidSetupResponse.statusCode).toBe(400);
    expect(invalidSetupResponse.json().error.code).toBe("invalid_request");
    expect(invalidSetupResponse.json().error.message).toContain("scenarioId");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/cloud-arena/sessions",
      payload: {
        scenarioId: "mixed_guardian",
        seed: 1,
      },
    });

    let snapshot = createResponse.json().data;

    for (let guard = 0; guard < 100 && snapshot.status !== "finished"; guard += 1) {
      const nextAction =
        snapshot.legalActions.find((entry: { action: { type: string } }) => entry.action.type === "end_turn")
        ?? snapshot.legalActions[0];

      expect(nextAction).toBeDefined();

      const actionResponse = await app.inject({
        method: "POST",
        url: `/api/cloud-arena/sessions/${snapshot.sessionId}/actions`,
        payload: {
          action: nextAction.action,
        },
      });

      expect(actionResponse.statusCode).toBe(200);
      snapshot = actionResponse.json().data;
    }

    expect(snapshot.status).toBe("finished");

    const finishedActionResponse = await app.inject({
      method: "POST",
      url: `/api/cloud-arena/sessions/${snapshot.sessionId}/actions`,
      payload: {
        action: {
          type: "end_turn",
        },
      },
    });

    expect(finishedActionResponse.statusCode).toBe(409);
    expect(finishedActionResponse.json().error.code).toBe("invalid_request");
    expect(finishedActionResponse.json().error.message).toContain("already finished");

    await app.close();
  });
});
