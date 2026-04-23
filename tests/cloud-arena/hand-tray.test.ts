import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CloudArenaHandTray } from "../../apps/cloud-arena-web/src/components/cloud-arena-hand-tray.js";
import type { CloudArenaBattleViewModel } from "../../apps/cloud-arena-web/src/lib/cloud-arena-battle-view-model.js";
import type { DisplayCardModel } from "../../apps/cloud-arena-web/src/lib/display-card.js";

function makeBattle(): CloudArenaBattleViewModel {
  return {
    turnNumber: 1,
    phase: "player_action",
    actionGroups: { hand: [], battlefield: [], turn: [] },
    player: {
      health: 20,
      maxHealth: 20,
      block: 0,
      energy: 3,
      hand: [],
      drawPile: [],
      drawPileCount: 0,
      discardPile: [],
      graveyard: [],
    },
    enemy: {
      name: "Enemy",
      health: 20,
      maxHealth: 20,
      block: 0,
      intent: {} as CloudArenaBattleViewModel["enemy"]["intent"],
      intentLabel: "attack 3",
      intentQueueLabels: [],
    },
    battlefield: [],
    battlefieldSlotCount: 4,
    creatureBattlefieldSlotCount: 4,
    nonCreatureBattlefieldSlotCount: 2,
    enemyBattlefield: [],
    pendingTargetRequest: null,
    blockingQueue: [],
    legalActions: [],
  };
}

describe("cloud arena hand tray", () => {
  it("shows filled battlefield slots in the player hud", () => {
    const html = renderToStaticMarkup(
      createElement(CloudArenaHandTray, {
        battle: {
          ...makeBattle(),
          battlefield: [
            {
              instanceId: "ally_1",
              sourceCardInstanceId: "card_1",
              definitionId: "guardian",
              name: "Guardian",
              controllerId: "player",
              isCreature: true,
              power: 4,
              health: 10,
              maxHealth: 10,
              block: 0,
              counters: {},
              attachments: [],
              attachedTo: null,
              hasActedThisTurn: false,
              isTapped: false,
              isDefending: false,
              slotIndex: 0,
              actions: [],
              intentLabel: null,
              intentQueueLabels: null,
            },
          ],
        },
        player: makeBattle().player,
        creatureBattlefieldSlotCount: 4,
        nonCreatureBattlefieldSlotCount: 2,
        maxPlayerEnergy: 3,
        getInspectableModel: (() => ({
          variant: "player" as const,
          name: "Player",
          title: null,
          subtitle: null,
          frameTone: "white",
          manaCost: null,
          image: null,
          metaLine: null,
          footerCode: "ARE",
          footerCredit: "Cloud Arena",
          collectorNumber: "P01",
          footerStat: null,
          healthBar: null,
          energyBar: null,
          statusLabel: null,
          stats: [],
          textBlocks: [],
          badges: [],
          actions: [],
          stateFlags: [],
        })) as () => DisplayCardModel,
        bindInspectorInteractions: () => ({
          onMouseEnter: () => undefined,
          onMouseLeave: () => undefined,
          onFocus: () => undefined,
          onBlur: () => undefined,
          onClick: () => undefined,
        }),
        onOpenDetails: () => undefined,
        isPlayableHandCard: () => false,
        groupedTurnActionsCount: 0,
        onBattleAction: () => undefined,
        onInspectPlayer: {
          onMouseEnter: () => undefined,
          onMouseLeave: () => undefined,
          onFocus: () => undefined,
          onBlur: () => undefined,
          onClick: () => undefined,
        },
      }),
    );

    expect(html).toContain("C 1/4");
    expect(html).toContain("|");
    expect(html).toContain("P 0/2");
    expect(html).not.toContain("Details for draw pile");
    expect(html).not.toContain("Details for discard pile");
    expect(html).not.toContain("Details for graveyard pile");
    expect(html).not.toContain(">details<");
  });
});
