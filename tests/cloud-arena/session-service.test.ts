import { describe, expect, it } from "vitest";

import type { CloudArenaActionOption } from "../../src/cloud-arena/api-contract.js";
import type { BattleAction } from "../../src/cloud-arena/index.js";
import {
  CloudArenaFinishedBattleError,
  CloudArenaInvalidActionError,
  CloudArenaSessionNotFoundError,
  createCloudArenaSessionService,
} from "../../apps/cloud-arena-api/src/services/cloud-arena-sessions.js";

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
      deckId: "wide_angels",
      seed: 9,
    });

    expect(snapshot.sessionId).toBeTypeOf("string");
    expect(snapshot.scenarioId).toBe("mixed_guardian");
    expect(snapshot.deckId).toBe("wide_angels");
    expect(snapshot.seed).toBe(9);
    expect(snapshot.createdAt).toBeTypeOf("string");
    expect(snapshot.resetSource).toEqual({
      scenarioId: "mixed_guardian",
      deckId: "wide_angels",
      seed: 9,
    });
    expect(snapshot.legalActions.length).toBeGreaterThan(0);
    expect(snapshot.actionHistory).toEqual([]);
  });

  it("summarizes sacrifice costs on cards in the session snapshot", () => {
    const service = createCloudArenaSessionService();
    const snapshot = service.createSession({
      scenarioId: "mixed_guardian",
      deckId: "tall_creatures",
      seed: 9,
    });
    const seraph = snapshot.player.hand.find((card) => card.definitionId === "sacrificial_seraph");

    if (!seraph) {
      throw new Error("Expected sacrificial_seraph in the opening hand.");
    }

    expect(seraph.effectSummary).not.toContain("Summon");
    expect(seraph.effectSummary).not.toContain("Attack");
    expect(seraph.effectSummary).not.toContain("Defend");
    expect(seraph.effectSummary).toContain("As an additional cost, sacrifice another creature you control.");
  });

  it("summarizes equipment bonuses on cards in the session snapshot", () => {
    const service = createCloudArenaSessionService();
    const snapshot = service.createSession({
      scenarioId: "mixed_guardian",
      deckId: "tall_creatures",
      seed: 9,
    });
    const blade = snapshot.player.hand.find((card) => card.definitionId === "holy_blade");

    if (!blade) {
      throw new Error("Expected holy_blade in the opening hand.");
    }

    expect(blade.effectSummary).toContain("Equip a permanent.");
    expect(blade.effectSummary).toContain("Equipped permanent gets +1/+1.");
  });

  it("surfaces enemy telegraph queue labels in the session snapshot", () => {
    const service = createCloudArenaSessionService();
    const snapshot = service.createSession({
      scenarioId: "imp_caller",
      seed: 11,
    });

    expect(snapshot.enemy.intentLabel).toBeTruthy();
    expect(snapshot.enemy.intentQueueLabels.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.enemy.intentQueueLabels[0]).toBe(snapshot.enemy.intentLabel);
    expect(snapshot.enemy.intentQueueLabels.some((label) => label.includes("spawn"))).toBe(true);
    expect(
      snapshot.enemyBattlefield.every(
        (slot) => !slot || slot.intentQueueLabels === null || Array.isArray(slot.intentQueueLabels),
      ),
    ).toBe(true);
  });

  it("creates multi-enemy pack encounters with multiple enemy bodies on the battlefield", () => {
    const service = createCloudArenaSessionService();
    const snapshot = service.createSession({
      scenarioId: "demon_pack",
      seed: 13,
    });

    const enemyBodies = snapshot.enemyBattlefield.filter(
      (entry): entry is NonNullable<typeof entry> => entry !== null,
    );

    expect(snapshot.scenarioId).toBe("demon_pack");
    expect(snapshot.enemy.name).toBe("Demon Pack");
    expect(enemyBodies.length).toBeGreaterThanOrEqual(3);
    expect(enemyBodies.some((entry) => entry.definitionId === "enemy_pack_alpha")).toBe(true);
    expect(enemyBodies.filter((entry) => entry.definitionId === "enemy_husk")).toHaveLength(1);
    expect(enemyBodies.filter((entry) => entry.definitionId === "enemy_brute")).toHaveLength(1);
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

  it("accepts permanent actions that omit the source field", () => {
    const service = createCloudArenaSessionService();
    const session = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 5,
    });
    const guardianAction = findPlayableCardAction(
      session.player.hand,
      session.legalActions,
      "guardian",
    );

    if (!guardianAction) {
      throw new Error("Expected to find a playable guardian card.");
    }

    const afterGuardian = service.applyAction(session.sessionId, guardianAction);
    const permanentAction = afterGuardian.legalActions.find(
      (
        entry,
      ): entry is (typeof entry & {
        action: Extract<BattleAction, { type: "use_permanent_action" }>;
      }) => entry.action.type === "use_permanent_action",
    )?.action as Extract<BattleAction, { type: "use_permanent_action" }> | undefined;

    if (!permanentAction) {
      throw new Error("Expected to find a playable permanent action.");
    }

    const { source: _source, ...actionWithoutSource } = permanentAction as Extract<BattleAction, {
      type: "use_permanent_action";
    }> & {
      source?: unknown;
    };
    const updated = service.applyAction(
      afterGuardian.sessionId,
      actionWithoutSource as BattleAction,
    );

    const latestAction = updated.actionHistory.at(-1)?.action as
      | Extract<BattleAction, { type: "use_permanent_action" }>
      | undefined;

    expect(latestAction?.source).toBeDefined();
    expect(latestAction).toMatchObject({
      type: "use_permanent_action",
      permanentId: permanentAction.permanentId,
      action: permanentAction.action,
    });
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
        ? findPlayableCardAction(updated.player.hand, updated.legalActions, "mass_benediction")
        : undefined;

      if (bannerAction) {
        updated = service.applyAction(updated.sessionId, bannerAction);
        break;
      }

      const endTurnAction = updated.legalActions.find(
        (entry) => entry.action.type === "end_turn",
      )?.action;

      if (!endTurnAction) {
        throw new Error("Expected an end turn action while searching for the mass benediction combo.");
      }

      updated = service.applyAction(updated.sessionId, endTurnAction);
    }

    const guardian = updated.battlefield.find(
      (permanent) => permanent?.definitionId === "guardian",
    );
    const benediction = updated.player.discardPile.find(
      (card) => card.definitionId === "mass_benediction",
    );

    expect(playedGuardian).toBe(true);
    expect(benediction).toBeTruthy();
    expect(guardian?.counters?.["+1/+1"]).toBe(2);
    expect(guardian?.power).toBe(5);
  });

  it("includes the pending spell play context while a target is being chosen", () => {
    const service = createCloudArenaSessionService();
    const session = service.createSession({
      scenarioId: "mixed_guardian",
      seed: 5,
    });
    const tokenAngelAction = findPlayableCardAction(
      session.player.hand,
      session.legalActions,
      "token_angel",
    );

    if (!tokenAngelAction) {
      throw new Error("Expected to find a playable token angel card.");
    }

    const afterTokenAngel = service.applyAction(session.sessionId, tokenAngelAction);
    const focusedBlessingAction = findPlayableCardAction(
      afterTokenAngel.player.hand,
      afterTokenAngel.legalActions,
      "focused_blessing",
    );

    if (!focusedBlessingAction) {
      throw new Error("Expected to find a playable focused blessing card.");
    }

    const updated = service.applyAction(afterTokenAngel.sessionId, focusedBlessingAction);

    expect(updated.pendingTargetRequest).toBeTruthy();
    expect(updated.pendingTargetRequest?.context?.pendingCardPlay).toMatchObject({
      instanceId: focusedBlessingAction.cardInstanceId,
      definitionId: "focused_blessing",
      name: "Aaronic Blessing",
    });
    expect(updated.pendingTargetRequest?.context?.pendingCardPlayHandIndex).toBe(1);
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
      deckId: "tall_creatures",
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
      deckId: "tall_creatures",
      seed: 3,
    });
    expect(reset.actionHistory).toEqual([]);
    expect(reset.player.hand).toEqual(session.player.hand);
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
