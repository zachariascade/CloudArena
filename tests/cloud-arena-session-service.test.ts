import { describe, expect, it } from "vitest";

import type { CloudArenaActionOption } from "../src/cloud-arena/api-contract.js";
import {
  CloudArenaFinishedBattleError,
  CloudArenaInvalidActionError,
  CloudArenaSessionNotFoundError,
  createCloudArenaSessionService,
} from "../apps/cloud-arcanum-api/src/services/cloud-arena-sessions.js";

function findPlayableCardAction(
  hand: { instanceId: string; definitionId: string }[],
  legalActions: CloudArenaActionOption[],
  definitionId: string,
): Extract<CloudArenaActionOption["action"], { type: "play_card" }> | undefined {
  for (const entry of legalActions) {
    const action = entry.action;

    if (action.type !== "play_card") {
      continue;
    }

    if (hand.some(
      (card) =>
        card.instanceId === action.cardInstanceId &&
        card.definitionId === definitionId,
    )) {
      return action;
    }
  }

  return undefined;
}

describe("cloud arena session service", () => {
  it("creates sessions with packaged legal actions and session metadata", () => {
    const service = createCloudArenaSessionService();
    const snapshot = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 9,
    });

    expect(snapshot.sessionId).toBeTypeOf("string");
    expect(snapshot.scenarioId).toBe("mixed_guardian");
    expect(snapshot.seed).toBe(9);
    expect(snapshot.createdAt).toBeTypeOf("string");
    expect(snapshot.resetSource).toEqual({
      scenarioId: "mixed_guardian",
      seed: 9,
    });
    expect(snapshot.legalActions.length).toBeGreaterThan(0);
    expect(snapshot.actionHistory).toEqual([]);
  });

  it("applies legal actions and records action history", () => {
    const service = createCloudArenaSessionService();
    const session = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 5,
    });
    const actionToApply =
      session.legalActions.find((entry) => entry.action.type !== "end_turn")?.action ??
      session.legalActions[0]?.action;

    if (!actionToApply) {
      throw new Error("Expected at least one legal action.");
    }

    const updated = service.applyAction(session.sessionId, actionToApply);

    expect(updated.actionHistory).toHaveLength(1);
    expect(updated.actionHistory[0]?.action).toEqual(actionToApply);
    expect(updated.log.length).toBeGreaterThan(session.log.length);
  });

  it("surfaces counter-based power buffs in the session snapshot", () => {
    const service = createCloudArenaSessionService();
    let snapshot = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 1,
    });
    let playedGuardian = false;
    let updated = snapshot;

    for (let guard = 0; guard < 12; guard += 1) {
      const guardianAction = !playedGuardian
        ? findPlayableCardAction(updated.player.hand, updated.legalActions, "guardian")
        : undefined;

      if (guardianAction) {
        updated = service.applyAction(updated.sessionId, guardianAction);
        playedGuardian = true;
        continue;
      }

      const bannerAction = playedGuardian
        ? findPlayableCardAction(updated.player.hand, updated.legalActions, "anointed_banner")
        : undefined;

      if (bannerAction) {
        updated = service.applyAction(updated.sessionId, bannerAction);
        break;
      }

      const endTurnAction = updated.legalActions.find(
        (entry) => entry.action.type === "end_turn",
      )?.action;

      if (!endTurnAction) {
        throw new Error("Expected an end turn action while searching for the banner combo.");
      }

      updated = service.applyAction(updated.sessionId, endTurnAction);
    }

    const guardian = updated.battlefield.find(
      (permanent) => permanent?.definitionId === "guardian",
    );
    const banner = updated.battlefield.find(
      (permanent) => permanent?.definitionId === "anointed_banner",
    );

    expect(playedGuardian).toBe(true);
    expect(banner).toBeTruthy();
    expect(guardian?.counters?.["+1/+1"]).toBe(1);
    expect(guardian?.power).toBe(11);
  });

  it("resolves the full enemy turn when end turn is applied", () => {
    const service = createCloudArenaSessionService();
    const session = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 5,
    });
    const endTurnAction = session.legalActions.find(
      (entry) => entry.action.type === "end_turn",
    )?.action;

    if (!endTurnAction) {
      throw new Error("Expected an end turn action.");
    }

    const updated = service.applyAction(session.sessionId, endTurnAction);

    expect(updated.turnNumber).toBeGreaterThanOrEqual(session.turnNumber);
    expect(updated.phase).toBe("player_action");
    expect(updated.log.some((event) => event.type === "turn_ended")).toBe(true);
    expect(updated.log.length).toBeGreaterThan(session.log.length);
  });

  it("resets a session back to its original seed and clears action history", () => {
    const service = createCloudArenaSessionService();
    const session = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 3,
    });
    const actionToApply =
      session.legalActions.find((entry) => entry.action.type !== "end_turn")?.action ??
      session.legalActions[0]?.action;

    if (!actionToApply) {
      throw new Error("Expected at least one legal action.");
    }

    service.applyAction(session.sessionId, actionToApply);
    const reset = service.resetSession(session.sessionId);

    expect(reset.seed).toBe(3);
    expect(reset.resetSource).toEqual({
      scenarioId: "mixed_guardian",
      seed: 3,
    });
    expect(reset.actionHistory).toEqual([]);
    expect(reset.player.hand).toEqual(session.player.hand);
  });

  it("exports a SimulationTrace-compatible replay artifact from a live session", () => {
    const service = createCloudArenaSessionService();
    const session = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 11,
    });
    const actionToApply =
      session.legalActions.find((entry) => entry.action.type !== "end_turn")?.action ??
      session.legalActions[0]?.action;

    if (!actionToApply) {
      throw new Error("Expected at least one legal action.");
    }

    service.applyAction(session.sessionId, actionToApply);
    const trace = service.exportReplay(session.sessionId);

    expect(trace.config.seed).toBe(11);
    expect(trace.config.agent).toBe("interactive_session");
    expect(trace.config.playerDeck.length).toBeGreaterThan(0);
    expect(trace.actionHistory).toHaveLength(1);
    expect(trace.log.length).toBeGreaterThan(0);
    expect(trace.finalSummary.turnNumber).toBeGreaterThan(0);
  });

  it("throws structured errors for missing sessions and illegal actions", () => {
    const service = createCloudArenaSessionService();
    const session = service.createSession();

    expect(() => service.getSession("missing-session")).toThrow(CloudArenaSessionNotFoundError);
    expect(() =>
      service.applyAction(session.sessionId, {
        type: "play_card",
        cardInstanceId: "card_missing",
      }),
    ).toThrow(CloudArenaInvalidActionError);
  });

  it("rejects new actions after the battle is already finished", () => {
    const service = createCloudArenaSessionService();
    const session = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 1,
    });

    let snapshot = session;

    for (let guard = 0; guard < 100 && snapshot.status !== "finished"; guard += 1) {
      const nextAction =
        snapshot.legalActions.find((entry) => entry.action.type === "end_turn")?.action ??
        snapshot.legalActions[0]?.action;

      if (!nextAction) {
        throw new Error("Expected at least one legal action before the battle finished.");
      }

      snapshot = service.applyAction(snapshot.sessionId, nextAction);
    }

    expect(snapshot.status).toBe("finished");
    expect(snapshot.legalActions).toEqual([]);
    expect(() =>
      service.applyAction(snapshot.sessionId, { type: "end_turn" }),
    ).toThrow(CloudArenaFinishedBattleError);
  });
});
