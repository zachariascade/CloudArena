import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DisplayCard } from "../apps/cloud-arcanum-web/src/components/display-card.js";
import { CloudArenaBattlefieldPanel } from "../apps/cloud-arena-web/src/components/cloud-arena-battlefield-panel.js";
import { CloudArenaHandTray } from "../apps/cloud-arena-web/src/components/cloud-arena-hand-tray.js";
import { CloudArenaInspectorPanel } from "../apps/cloud-arena-web/src/components/cloud-arena-inspector-panel.js";
import {
  mapCloudArcanumCardToDisplayCard,
} from "../apps/cloud-arcanum-web/src/lib/display-card.js";
import {
  mapArenaEnemyToDisplayCard,
  mapArenaHandCardToDisplayCard,
  mapArenaPermanentToDisplayCard,
  mapArenaPlayerToDisplayCard,
} from "../apps/cloud-arena-web/src/lib/cloud-arena-display-card.js";
import type { CloudArenaBattleViewModel } from "../apps/cloud-arena-web/src/lib/cloud-arena-battle-view-model.js";

describe("shared display card mappers", () => {
  it("maps a Cloud Arcanum card into the mtg display model", () => {
    const model = mapCloudArcanumCardToDisplayCard({
      name: "Moses",
      title: "Lawgiver",
      typeLine: "Legendary Creature - Human Prophet",
      manaCost: "{2}{W}{U}",
      power: "3",
      toughness: "4",
      loyalty: null,
      defense: null,
      image: {
        kind: "remote",
        sourcePath: null,
        publicUrl: "https://example.com/moses.jpg",
        isRenderable: true,
        alt: "Moses raising his staff",
        artist: "Artist",
        sourceUrl: null,
        license: null,
        creditText: null,
        sourceNotes: null,
        requestedThemeId: null,
        resolvedThemeId: null,
        fellBack: false,
      },
      oracleText: "When Moses enters, draw a card.",
      flavorText: "He led through the waters.",
      status: "balanced",
    });

    expect(model.variant).toBe("mtg");
    expect(model.name).toBe("Moses");
    expect(model.title).toBe("Lawgiver");
    expect(model.subtitle).toContain("Legendary Creature");
    expect(model.image?.url).toBe("https://example.com/moses.jpg");
    expect(model.textBlocks.map((entry) => entry.text)).toContain("When Moses enters, draw a card.");
    expect(model.badges).toEqual(["balanced"]);
  });

  it("maps arena player and enemy summaries into display cards", () => {
    const player = mapArenaPlayerToDisplayCard({
      health: 28,
      maxHealth: 30,
      block: 5,
      energy: 2,
      hand: [],
      drawPile: [],
      drawPileCount: 10,
      discardPile: [{ instanceId: "c1", definitionId: "attack", name: "Attack", cost: 1, effectSummary: "Deal 6 damage." }],
      graveyard: [],
    });
    const enemy = mapArenaEnemyToDisplayCard({
      name: "Long Battle Demon",
      health: 44,
      maxHealth: 60,
      block: 3,
      intent: { attackAmount: 10, attackTimes: 2 },
      intentLabel: "attack 10 x2",
    });

    expect(player.variant).toBe("player");
    expect(player.name).toBe("Pilgrim Duelist");
    expect(player.title).toBe("Vanguard of the Arena");
    expect(player.image?.url).toContain("/images/cards/card_0021_adam_first_of_dust.jpg");
    expect(player.footerStat).toBeNull();
    expect(player.healthBar).toEqual({
      current: 28,
      max: 30,
      label: "28/30",
    });
    expect(player.energyBar).toEqual({
      current: 2,
      max: 3,
      label: "2/3",
    });
    expect(player.stats.find((entry) => entry.label === "HP")).toBeUndefined();
    expect(player.stats.find((entry) => entry.label === "Energy")).toBeUndefined();
    expect(enemy.variant).toBe("enemy");
    expect(enemy.title).toBe("Harbinger of Attrition");
    expect(enemy.image?.url).toContain("/images/cards/card_0009_lucifer_fallen_angel_of_light.webp");
    expect(enemy.footerStat).toBeNull();
    expect(enemy.healthBar).toEqual({
      current: 44,
      max: 60,
      label: "44/60",
    });
    expect(enemy.stats.find((entry) => entry.label === "HP")).toBeUndefined();
    expect(enemy.textBlocks[0]?.text).toContain("is preparing attack 10 x2");
  });

  it("maps arena hand cards and permanents with actions", () => {
    const onPlay = vi.fn();
    const onAttack = vi.fn();
    const handCard = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_1",
        definitionId: "guardian",
        name: "Guardian",
        cost: 3,
        effectSummary: "Summon a guardian with 10 health.",
      },
      {
        isPlayable: true,
        onPlay,
      },
    );
    const permanentCard = mapArenaPermanentToDisplayCard(
      {
        instanceId: "guardian_1",
        sourceCardInstanceId: "card_1",
        definitionId: "guardian",
        name: "Guardian",
        isCreature: true,
        power: 4,
        health: 10,
        maxHealth: 10,
        block: 2,
        hasActedThisTurn: false,
        isDefending: true,
        slotIndex: 0,
        actions: [
          {
            id: "guardian_apply_block",
            kind: "activated",
            activation: { type: "action", actionId: "apply_block" },
            effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 5 } }],
          },
        ],
      },
      {
        playableActions: [
          {
            action: "attack",
            label: "Attack 4",
            onSelect: onAttack,
          },
        ],
      },
    );

    expect(handCard.actions).toHaveLength(1);
    expect(handCard.title).toBe("Keeper of the Gate");
    expect(handCard.image?.url).toContain("/images/cards/card_0036_watcher_at_edens_gate.jpg");
    expect(handCard.footerStat).toBe("4/4");
    handCard.actions[0]?.onSelect?.();
    expect(onPlay).toHaveBeenCalledWith("card_1");

    expect(permanentCard.variant).toBe("permanent");
    expect(permanentCard.footerStat).toBe("4/10");
    expect(permanentCard.healthBar).toBeNull();
    expect(permanentCard.statusLabel).toBe("defending");
    expect(permanentCard.stats).toHaveLength(0);
    expect(permanentCard.textBlocks.map((entry) => entry.text)).toContain(
      "This card is set to intercept the next enemy assault.",
    );
    expect(permanentCard.image?.url).toContain("/images/cards/card_0036_watcher_at_edens_gate.jpg");
    expect(permanentCard.badges).toHaveLength(0);
    expect(permanentCard.actions).toHaveLength(1);
    permanentCard.actions[0]?.onSelect?.();
    expect(onAttack).toHaveBeenCalledTimes(1);
  });

  it("maps graveyard hymn as a creature instead of a spell", () => {
    const hymn = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_15",
        definitionId: "graveyard_hymn",
        name: "Graveyard Hymn",
        cost: 2,
        effectSummary: "When this dies, bless every permanent.",
      },
      {
        isPlayable: true,
      },
    );

    const permanentHymn = mapArenaPermanentToDisplayCard({
      instanceId: "graveyard_hymn_15",
      sourceCardInstanceId: "card_15",
      definitionId: "graveyard_hymn",
      name: "Graveyard Hymn",
      isCreature: true,
      power: 2,
      health: 2,
      maxHealth: 2,
      block: 0,
      counters: {},
      attachments: [],
      attachedTo: null,
      hasActedThisTurn: false,
      isDefending: false,
      slotIndex: 2,
      actions: [],
    });

    expect(hymn.subtitle).toBe("Creature - Angel");
    expect(hymn.title).toBe("Graveyard Hymn");
    expect(permanentHymn.title).toBe("Graveyard Hymn");
    expect(permanentHymn.subtitle).toBe("Creature - Angel");
  });

  it("renders details controls for hand cards and battlefield permanents", () => {
    const battle: CloudArenaBattleViewModel = {
      turnNumber: 1,
      phase: "player_action",
      actionGroups: {
        hand: [],
        battlefield: [],
        turn: [],
      },
      player: {
        health: 30,
        maxHealth: 30,
        block: 0,
        energy: 3,
        hand: [
          {
            instanceId: "card_1",
            definitionId: "graveyard_hymn",
            name: "Graveyard Hymn",
            cost: 2,
            effectSummary: "Bless the battlefield on death.",
          },
        ],
        drawPile: [],
        drawPileCount: 0,
        discardPile: [],
        graveyard: [],
      },
      enemy: {
        name: "Test Enemy",
        health: 30,
        maxHealth: 30,
        block: 0,
        intent: { attackAmount: 12 },
        intentLabel: "attack 12",
      },
      battlefield: [
        {
          instanceId: "graveyard_hymn_1",
          sourceCardInstanceId: "card_1",
          definitionId: "graveyard_hymn",
          name: "Graveyard Hymn",
          controllerId: "player",
          isCreature: true,
          power: 2,
          health: 2,
          maxHealth: 2,
          block: 0,
          counters: {},
          attachments: [],
          attachedTo: null,
          hasActedThisTurn: false,
          isDefending: false,
          slotIndex: 0,
          actions: [],
        },
      ],
      blockingQueue: [],
      legalActions: [],
    };

    const html = renderToStaticMarkup(
      createElement(
        "div",
        null,
        createElement(CloudArenaHandTray, {
          battle,
          getInspectableModel: (key) =>
            key === "hand:card_1"
              ? mapArenaHandCardToDisplayCard(battle.player.hand[0]!, {
                  isPlayable: true,
                })
              : mapArenaEnemyToDisplayCard({
                  name: "Test Enemy",
                  health: 30,
                  maxHealth: 30,
                  block: 0,
                  intent: { attackAmount: 12 },
                  intentLabel: "attack 12",
                }),
          bindInspectorInteractions: () => ({
            onMouseEnter: () => undefined,
            onMouseLeave: () => undefined,
            onFocus: () => undefined,
            onBlur: () => undefined,
            onClick: () => undefined,
          }),
          onOpenDetails: () => undefined,
          isPlayableHandCard: () => true,
          groupedTurnActionsCount: 0,
        }),
        createElement(CloudArenaBattlefieldPanel, {
          battlefield: battle.battlefield,
          legalActions: [],
          getInspectableModel: (key) =>
            key === "battlefield:graveyard_hymn_1"
              ? mapArenaPermanentToDisplayCard(battle.battlefield[0]!, {})
              : mapArenaEnemyToDisplayCard({
                  name: "Test Enemy",
                  health: 30,
                  maxHealth: 30,
                  block: 0,
                  intent: { attackAmount: 12 },
                  intentLabel: "attack 12",
                }),
          getPermanentMenuActions: () => [],
          getPermanentCounterEntries: () => [],
          bindInspectorInteractions: () => ({
            onMouseEnter: () => undefined,
            onMouseLeave: () => undefined,
            onFocus: () => undefined,
            onBlur: () => undefined,
            onClick: () => undefined,
          }),
          onOpenDetails: () => undefined,
          openPermanentMenuId: null,
        }),
      ),
    );

    expect(html).toContain("details");
  });

  it("renders details controls in the arena hand tray without playable text", () => {
    const battle: CloudArenaBattleViewModel = {
      turnNumber: 1,
      phase: "player_action",
      actionGroups: {
        hand: [],
        battlefield: [],
        turn: [],
      },
      player: {
        health: 30,
        maxHealth: 30,
        block: 0,
        energy: 3,
        hand: [
          {
            instanceId: "card_1",
            definitionId: "graveyard_hymn",
            name: "Graveyard Hymn",
            cost: 2,
            effectSummary: "Bless the battlefield on death.",
          },
        ],
        drawPile: [],
        drawPileCount: 0,
        discardPile: [],
        graveyard: [],
      },
      enemy: {
        name: "Test Enemy",
        health: 30,
        maxHealth: 30,
        block: 0,
        intent: { attackAmount: 12 },
        intentLabel: "attack 12",
      },
      battlefield: [],
      blockingQueue: [],
      legalActions: [],
    };

    const html = renderToStaticMarkup(
      createElement(CloudArenaHandTray, {
        battle,
        getInspectableModel: (key) =>
          key === "hand:card_1"
            ? mapArenaHandCardToDisplayCard(battle.player.hand[0]!, {
                isPlayable: true,
              })
            : mapArenaEnemyToDisplayCard({
                name: "Test Enemy",
                health: 30,
                maxHealth: 30,
                block: 0,
                intent: { attackAmount: 12 },
                intentLabel: "attack 12",
              }),
        bindInspectorInteractions: () => ({
          onMouseEnter: () => undefined,
          onMouseLeave: () => undefined,
          onFocus: () => undefined,
          onBlur: () => undefined,
          onClick: () => undefined,
        }),
        onOpenDetails: () => undefined,
        isPlayableHandCard: () => true,
        groupedTurnActionsCount: 0,
      }),
    );

    expect(html).toContain("details");
    expect(html).not.toContain(">playable<");
  });

  it("renders a card definition inspector panel", () => {
    const html = renderToStaticMarkup(
      createElement(CloudArenaInspectorPanel, {
        definitionJson: JSON.stringify(
          {
            id: "guardian",
            name: "Guardian",
            cardTypes: ["creature"],
            cost: 3,
            power: 4,
            health: 4,
            abilities: [
              {
                id: "guardian_apply_block",
                kind: "activated",
                activation: { type: "action", actionId: "apply_block" },
                effects: [
                  {
                    type: "gain_block",
                    target: "player",
                    amount: { type: "constant", value: 5 },
                  },
                ],
              },
            ],
          },
          null,
          2,
        ),
      }),
    );

    expect(html).toContain("Card Definition");
    expect(html).toContain("&quot;id&quot;: &quot;guardian&quot;");
    expect(html).toContain("&quot;abilities&quot;: [");
    expect(html).not.toContain("card-face");
  });

  it("does not render anointed banner as a guardian fallback", () => {
    const bannerCard = mapArenaPermanentToDisplayCard({
      instanceId: "anointed_banner_2",
      sourceCardInstanceId: "card_2",
      definitionId: "anointed_banner",
      name: "Anointed Banner",
      isCreature: false,
      power: 0,
      health: 6,
      maxHealth: 6,
      block: 0,
      counters: { "+1/+1": 1 },
      attachments: [],
      attachedTo: null,
      hasActedThisTurn: false,
      isDefending: false,
      slotIndex: 1,
      actions: [
        {
          id: "anointed_banner_apply_block",
          kind: "activated",
          activation: { type: "action", actionId: "apply_block" },
          effects: [{ type: "gain_block", target: "player", amount: { type: "constant", value: 2 } }],
        },
      ],
    });

    expect(bannerCard.name).toBe("Anointed Banner");
    expect(bannerCard.title).toBe("Consecrated Standard");
    expect(bannerCard.subtitle).toBe("Artifact");
    expect(bannerCard.textBlocks.map((entry) => entry.text)).not.toContain(
      "This guardian is ready to press the attack or hold the line.",
    );
  });
});

describe("shared display card component", () => {
  it("renders mtg and arena variants without requiring identical fields", () => {
    const mtgHtml = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: mapCloudArcanumCardToDisplayCard({
          name: "Deborah",
          title: "Judge of Israel",
          typeLine: "Legendary Creature - Human Advisor",
          manaCost: "{1}{W}",
          power: "2",
          toughness: "3",
          loyalty: null,
          defense: null,
          image: {
            kind: "placeholder",
            sourcePath: null,
            publicUrl: null,
            isRenderable: false,
            alt: "Deborah placeholder art",
            artist: null,
            sourceUrl: null,
            license: null,
            creditText: null,
            sourceNotes: null,
            requestedThemeId: null,
            resolvedThemeId: null,
            fellBack: false,
          },
          oracleText: "Other creatures you control get +0/+1.",
          flavorText: null,
          status: "draft",
        }),
      }),
    );
    const arenaHandHtml = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: mapArenaHandCardToDisplayCard(
          {
            instanceId: "card_1",
            definitionId: "guardian",
            name: "Guardian",
            cost: 3,
            effectSummary: "Summon a guardian with 10 health.",
          },
          {
            isPlayable: true,
          },
        ),
      }),
    );
    const enemyHtml = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: mapArenaEnemyToDisplayCard({
          name: "Long Battle Demon",
          health: 50,
          maxHealth: 50,
          block: 0,
          intent: { attackAmount: 12 },
          intentLabel: "attack 12",
        }),
      }),
    );
    const permanentHtml = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: mapArenaPermanentToDisplayCard(
          {
            instanceId: "guardian_1",
            sourceCardInstanceId: "card_1",
            definitionId: "guardian",
            name: "Guardian",
            isCreature: true,
            power: 4,
            health: 8,
            maxHealth: 10,
            block: 2,
            hasActedThisTurn: false,
            isDefending: true,
            slotIndex: 0,
            actions: [
              {
                id: "guardian_apply_block",
                kind: "activated",
                activation: { type: "action", actionId: "apply_block" },
                effects: [
                  { type: "gain_block", target: "player", amount: { type: "constant", value: 5 } },
                ],
              },
            ],
          },
          {
            playableActions: [
              {
                action: "attack",
                label: "Attack 4",
              },
            ],
          },
        ),
      }),
    );
    const playerHtml = renderToStaticMarkup(
        createElement(DisplayCard, {
        model: mapArenaPlayerToDisplayCard({
          health: 28,
          maxHealth: 30,
          block: 5,
          energy: 2,
          hand: [],
          drawPile: [],
          drawPileCount: 10,
          discardPile: [],
          graveyard: [],
        }),
      }),
    );

    expect(mtgHtml).toContain("data-variant=\"mtg\"");
    expect(mtgHtml).toContain("Judge of Israel");
    expect(mtgHtml).toContain("Preview pending");
    expect(mtgHtml).toContain("printable-card-face");
    expect(arenaHandHtml).toContain("card-face-stats-box");
    expect(arenaHandHtml).toContain(">4/4<");
    expect(playerHtml).toContain("aria-label=\"Pilgrim Duelist energy\"");
    expect(playerHtml).toContain(">2/3<");
    expect(playerHtml).toContain("display-card-energy-segment is-filled");
    expect(playerHtml).toContain("display-card-energy-segment is-empty");
    expect(playerHtml).toContain("display-card-character-layout display-card-character-layout-player");
    expect(playerHtml).not.toContain("<span>Energy</span><strong>2</strong>");
    expect(playerHtml).not.toContain("Hand ");
    expect(enemyHtml).toContain("data-variant=\"enemy\"");
    expect(enemyHtml).toContain("Long Battle Demon");
    expect(enemyHtml).toContain("Long Battle Demon is preparing attack 12.");
    expect(enemyHtml).toContain("/images/cards/card_0009_lucifer_fallen_angel_of_light.webp");
    expect(enemyHtml).toContain("display-card-character-layout display-card-character-layout-enemy");
    expect(enemyHtml).toContain("aria-label=\"Long Battle Demon block 0\"");
    expect(enemyHtml).toContain("aria-label=\"Long Battle Demon health\"");
    expect(enemyHtml).toContain("aria-label=\"Long Battle Demon intent\"");
    expect(enemyHtml).toContain("display-card-intent-banner");
    expect(enemyHtml).toContain(">50/50<");
    expect(enemyHtml).not.toContain("<span>HP</span>");
    expect(enemyHtml).not.toContain("<span>Block</span>");
    expect(permanentHtml).toContain("card-face-stats-box");
    expect(permanentHtml).toContain(">4/8<");
    expect(permanentHtml).not.toContain("aria-label=\"Guardian health\"");
    expect(permanentHtml).not.toContain("display-card-block-icon");
    expect(permanentHtml).not.toContain("ready");
    expect(permanentHtml).not.toContain("spent");
    expect(permanentHtml).not.toContain("acted");
  });
});
