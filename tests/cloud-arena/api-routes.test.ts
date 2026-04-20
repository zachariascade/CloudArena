import { describe, expect, it } from "vitest";

import { createCloudArenaApiApp } from "../../apps/cloud-arena-api/src/app.js";

function createArenaTestApp() {
  return createCloudArenaApiApp();
}

describe("cloud arena api routes", () => {
  it("creates, reads, updates, and resets Cloud Arena sessions", async () => {
    const app = createArenaTestApp();

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/cloud-arena/sessions",
      payload: {
        scenarioId: "mixed_guardian",
        deckId: "wide_angels",
        seed: 7,
        shuffleDeck: true,
      },
    });

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.json().data.sessionId).toBeTypeOf("string");
    expect(createResponse.json().data.scenarioId).toBe("mixed_guardian");
    expect(createResponse.json().data.deckId).toBe("wide_angels");
    expect(createResponse.json().data.seed).toBe(7);
    expect(createResponse.json().data.createdAt).toBeTypeOf("string");
    expect(createResponse.json().data.resetSource).toEqual({
      scenarioId: "mixed_guardian",
      deckId: "wide_angels",
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
    const app = createArenaTestApp();

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
    const app = createArenaTestApp();

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
    const app = createArenaTestApp();

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
