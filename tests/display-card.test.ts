import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DisplayCard } from "../apps/cloud-arena-web/src/components/display-card.js";
import { CloudArenaBattlefieldPanel } from "../apps/cloud-arena-web/src/components/cloud-arena-battlefield-panel.js";
import { CloudArenaBattleState } from "../apps/cloud-arena-web/src/components/cloud-arena-battle-state.js";
import { CloudArenaHandTray } from "../apps/cloud-arena-web/src/components/cloud-arena-hand-tray.js";
import { CloudArenaInspectorPanel } from "../apps/cloud-arena-web/src/components/cloud-arena-inspector-panel.js";
import {
  buildCardSubtitle,
  buildCardFooterStat,
  buildCardManaCost,
  mapArenaEnemyToDisplayCard,
  mapArenaHandCardToDisplayCard,
  mapArenaPermanentToDisplayCard,
  mapArenaPlayerToDisplayCard,
} from "../apps/cloud-arena-web/src/lib/display-card.js";
import { buildEnemyPreviewCards } from "../apps/cloud-arena-web/src/lib/cloud-arena-enemy-card-preview.js";
import type { CloudArenaBattleViewModel } from "../apps/cloud-arena-web/src/lib/cloud-arena-battle-view-model.js";
import type { CloudArenaBattleMotionState } from "../apps/cloud-arena-web/src/lib/cloud-arena-battle-motion.js";
import type { CardDefinition } from "../src/cloud-arena/core/types.js";
import { battlefieldInsightCardDefinition } from "../src/cloud-arena/cards/definitions/battlefield-insight.js";
import { guardianCardDefinition } from "../src/cloud-arena/cards/definitions/guardian.js";
import { denialBeforeTheRoostersCryCardDefinition } from "../src/cloud-arena/cards/definitions/denial-before-the-rooster-s-cry.js";
import { galleryAncientOfDaysCardDefinition } from "../src/cloud-arena/cards/definitions/gallery-ancient-of-days.js";
import { restorativeTouchCardDefinition } from "../src/cloud-arena/cards/definitions/restorative-touch.js";
import { stunningRebukeCardDefinition } from "../src/cloud-arena/cards/definitions/stunning-rebuke.js";
import { targetedStrikeCardDefinition } from "../src/cloud-arena/cards/definitions/targeted-strike.js";
import { tubalCainsForgeCardDefinition } from "../src/cloud-arena/cards/definitions/tubal-cains-forge.js";
import { getEnemyPreset } from "../src/cloud-arena/index.js";

const EMPTY_BATTLE_MOTION_STATE: CloudArenaBattleMotionState = {
  attackIds: {},
  hitIds: {},
  deathOverlays: {},
  healthIncreaseIds: {},
  healthDecreaseIds: {},
};

describe("shared display card mappers", () => {
  it("maps an arena hand card into the mtg display model", () => {
    const model = mapArenaHandCardToDisplayCard(
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
    );

    expect(model.variant).toBe("mtg");
    expect(model.name).toBe("Guardian");
    expect(model.title).toBeUndefined();
    expect(model.subtitle).toBe("Creature - Angel");
    expect(model.image?.url).toContain(guardianCardDefinition.display!.imagePath);
    expect(model.textBlocks.map((entry) => entry.text)).toContain("Summon a guardian with 10 health.");
    expect(model.badges).toEqual([]);
  });

  it("maps and renders Saga cards with chapter text beside the art", () => {
    const model = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_saga",
        definitionId: "writing_on_the_wall",
        name: "Writing on the Wall",
        cost: 2,
        effectSummary: "I - Gain 5 block. II - Deal 4 damage to the enemy. III - Draw 1 card.",
      },
      {
        isPlayable: true,
      },
    );
    const html = renderToStaticMarkup(createElement(DisplayCard, { model }));

    expect(model.variant).toBe("saga");
    expect(model.subtitle).toBe("Enchantment - Saga");
    expect(model.footerStat).toBe("1/5");
    expect(model.saga?.chapters.map((chapter) => chapter.label)).toEqual(["I", "II", "III"]);
    expect(html).toContain("card-face-saga-body");
    expect(html).toContain("card-face-saga-chapter");
    expect(html).toContain("Gain 5 block.");
    expect(html).toContain("card-face-saga-art-wrap");
    expect(html.indexOf("card-face-saga-body")).toBeLessThan(html.indexOf("card-face-typeline"));
  });

  it("shows lore progress on battlefield Saga permanents", () => {
    const model = mapArenaPermanentToDisplayCard({
      instanceId: "writing_on_the_wall_1",
      sourceCardInstanceId: "card_saga",
      definitionId: "writing_on_the_wall",
      name: "Writing on the Wall",
      controllerId: "player",
      isCreature: false,
      power: 1,
      health: 5,
      maxHealth: 5,
      block: 0,
      counters: { lore: 2 },
      saga: {
        loreCounter: 2,
        finalChapter: 3,
        activeChapter: 2,
        resolvedChapters: [1, 2],
        chapters: [
          { chapter: 1, label: "I", text: "I - Gain 5 block.", resolved: true, active: false },
          { chapter: 2, label: "II", text: "II - Deal 4 damage to the enemy.", resolved: true, active: true },
          { chapter: 3, label: "III", text: "III - Draw 1 card.", resolved: false, active: false },
        ],
      },
      attachments: [],
      attachedTo: null,
      hasActedThisTurn: true,
      isTapped: false,
      isDefending: false,
      blockingTargetPermanentId: null,
      slotIndex: 0,
      actions: [],
    });
    const html = renderToStaticMarkup(createElement(DisplayCard, { model }));

    expect(model.variant).toBe("saga");
    expect(model.statusLabel).toBe("Lore 2/3");
    expect(model.footerStat).toBe("1/5");
    expect(model.healthBar?.label).toBe("5/5");
    expect(model.stateFlags).not.toContain("spent");
    expect(html).toContain("card-face-saga-lore");
    expect(html).toContain("2/3");
    expect(html).toContain("card-face-saga-chapter is-resolved is-active");
  });

  it("generates subtitles from card types, subtypes, and rarity", () => {
    const generatedSubtitle = buildCardSubtitle({
      cardTypes: ["creature"],
      subtypes: ["Angel", "Warrior"],
      rarity: "mythic",
    } satisfies Pick<CardDefinition, "cardTypes" | "subtypes" | "rarity">);

    expect(generatedSubtitle).toBe("Legendary Creature - Angel Warrior");
  });

  it("uses legendary gallery rarity to generate the subtitle", () => {
    expect(galleryAncientOfDaysCardDefinition.rarity).toBe("mythic");

    const generatedSubtitle = buildCardSubtitle(galleryAncientOfDaysCardDefinition);

    expect(generatedSubtitle).toBe("Legendary Creature - God");
  });

  it("derives the footer stat from the card definition power and health", () => {
    const footerStat = buildCardFooterStat({
      id: "test-permanent",
      name: "Test Permanent",
      cardTypes: ["creature"],
      cost: 2,
      onPlay: [],
      power: 4,
      health: 6,
      abilities: [],
    });

    expect(footerStat).toBe("4/6");
  });

  it("derives the mana cost from the card definition manaCost or cost", () => {
    expect(buildCardManaCost(galleryAncientOfDaysCardDefinition)).toBe("{3}");
    expect(buildCardManaCost(denialBeforeTheRoostersCryCardDefinition)).toBe("{1}{W}{U}");
  });

  it("maps arena player and enemy summaries into display cards", () => {
    const player = mapArenaPlayerToDisplayCard({
      health: 28,
      maxHealth: 30,
      block: 5,
      energy: 2,
    });
    const enemy = mapArenaEnemyToDisplayCard({
      name: "Long Battle Demon",
      health: 44,
      maxHealth: 60,
      block: 3,
      intentLabel: "attack 10 x2",
      intentQueueLabels: ["attack 10 x2", "defend 4", "spawn token_imp"],
    });

    expect(player.variant).toBe("player");
    expect(player.name).toBe("Player");
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
    expect(player.healthBar).toMatchObject({
      current: 28,
      max: 30,
    });
    expect(player.energyBar).toMatchObject({
      current: 2,
      max: 3,
    });
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
    expect(enemy.textBlocks.some((entry) => entry.kind === "intent" && entry.text === "Next: defend 4")).toBe(true);
    expect(enemy.statusLabel).toBe("enemy");
    expect(enemy.badges).toEqual(["boss"]);
    expect(enemy.statusTone).toBe("draft");
  });

  it("maps Radiant Conduit as a creature in the arena hand face", () => {
    const conduit = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_1",
        definitionId: "radiant_conduit",
        name: "Radiant Conduit",
        cost: 2,
        effectSummary: "Tap: Gain 1 energy.",
      },
      {
        isPlayable: true,
      },
    );

    expect(conduit.subtitle).toBe("Creature - Angel");
    expect(conduit.title).toBeUndefined();
    expect(conduit.textBlocks[0]?.text).toBe("Tap: Gain 1 energy.");
    expect(conduit.image?.url).toContain("/images/cards/2B5A00FD-D279-48BD-AEFE-0711AC4E9F54.jpeg");
  });

  it("uses the current art for the remaining arena hand spells", () => {
    const battlefieldInsight = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_3",
        definitionId: "battlefield_insight",
        name: "Battlefield Insight",
        cost: 2,
        effectSummary: "Draw a card for each creature you control.",
      },
      { isPlayable: true },
    );
    const restorativeTouch = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_4",
        definitionId: "restorative_touch",
        name: "Restorative Touch",
        cost: 1,
        effectSummary: "Heal 3 to a permanent.",
      },
      { isPlayable: true },
    );
    const targetedStrike = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_5",
        definitionId: "targeted_strike",
        name: "Targeted Strike",
        cost: 1,
        effectSummary: "Deal 4 damage to a chosen enemy.",
      },
      { isPlayable: true },
    );
    const stunningRebuke = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_6",
        definitionId: "stunning_rebuke",
        name: "Stunning Rebuke",
        cost: 2,
        effectSummary: "Stun the enemy.",
      },
      { isPlayable: true },
    );

    expect(battlefieldInsight.image?.url).toContain(
      battlefieldInsightCardDefinition.display!.imagePath,
    );
    expect(restorativeTouch.image?.url).toContain(restorativeTouchCardDefinition.display!.imagePath);
    expect(targetedStrike.image?.url).toContain(targetedStrikeCardDefinition.display!.imagePath);
    expect(stunningRebuke.image?.url).toContain(stunningRebukeCardDefinition.display!.imagePath);
  });

  it("maps Armory Seraph as a creature in the arena hand face", () => {
    const seraph = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_2",
        definitionId: "armory_seraph",
        name: "Armory Seraph",
        cost: 3,
        effectSummary: "Whenever an equipment you control enters the battlefield, draw a card.",
      },
      {
        isPlayable: true,
      },
    );

    expect(seraph.subtitle).toBe("Creature - Angel");
    expect(seraph.title).toBeUndefined();
    expect(seraph.textBlocks[0]?.text).toBe(
      "Whenever an equipment you control enters the battlefield, draw a card.",
    );
  });

  it("uses imp and grunt art for arena battle pieces", () => {
    const imp = mapArenaPermanentToDisplayCard({
      instanceId: "token_imp_1",
      sourceCardInstanceId: "card_1",
      definitionId: "token_imp",
      name: "Token Imp",
      isCreature: true,
      power: 2,
      health: 4,
      maxHealth: 4,
      block: 0,
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    });
    const grunt = mapArenaEnemyToDisplayCard({
      name: "Grunt Demon",
      health: 18,
      maxHealth: 18,
      block: 0,
      leaderDefinitionId: "enemy_grunt_demon",
      intentLabel: "attack 5",
    });

    expect(imp.image?.url).toContain("/images/cards/38790FFE-A07F-43DA-ACBD-AFAED530BB8E.jpeg");
    expect(imp.image?.alt).toContain("imp");
    expect(grunt.image?.url).toContain("/images/cards/grunt_demon.svg");
    expect(grunt.image?.alt).toContain("horned demon soldier");
  });

  it("uses the provided JPEG for Belzaphor art", () => {
    const impCaller = mapArenaEnemyToDisplayCard({
      name: "Belzaphor, Swarm of the Pit",
      health: 20,
      maxHealth: 20,
      block: 0,
      leaderDefinitionId: "enemy_imp_caller",
      intentLabel: "attack 3",
      intentQueueLabels: ["attack 3", "spawn imp"],
    });

    expect(impCaller.image?.url).toContain("/images/cards/0AF7C779-AF9B-4662-82E4-F481882E7788.jpeg");
    expect(impCaller.image?.alt).toContain("Belzaphor");
    expect(impCaller.title).toBeUndefined();
  });

  it("uses the provided JPEG for the Belzaphor battlefield leader", () => {
    const impCallerLeader = mapArenaPermanentToDisplayCard({
      instanceId: "enemy_leader_1",
      sourceCardInstanceId: "enemy_leader_1",
      definitionId: "enemy_imp_caller",
      name: "Belzaphor, Swarm of the Pit",
      controllerId: "enemy",
      isCreature: true,
      power: 3,
      health: 20,
      maxHealth: 20,
      block: 0,
      intentLabel: "attack 3",
      intentQueueLabels: ["attack 3", "spawn imp"],
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    });

    expect(impCallerLeader.image?.url).toContain("/images/cards/0AF7C779-AF9B-4662-82E4-F481882E7788.jpeg");
    expect(impCallerLeader.image?.alt).toContain("Belzaphor");
  });

  it("uses the suggested image for Garden of Earthly Delights", () => {
    const garden = mapArenaPermanentToDisplayCard({
      instanceId: "garden_1",
      sourceCardInstanceId: "card_1",
      definitionId: "garden_of_earthly_delights",
      name: "Garden of Earthly Delights",
      isCreature: false,
      power: 0,
      health: 5,
      maxHealth: 5,
      block: 0,
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    });

    expect(garden.image?.url).toContain("/images/cards/669F9BF4-F0AF-4A1B-9CB5-9A083E3EEEF9.jpeg");
    expect(garden.image?.alt).toContain("Garden of Earthly Delights");
    expect(garden.title).toBeUndefined();
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
        effectSummary: "Pay 1 energy: Gain 5 block.",
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
        isTapped: false,
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
    const enemyLeaderCard = mapArenaPermanentToDisplayCard({
      instanceId: "enemy_leader_1",
      sourceCardInstanceId: "enemy_leader_1",
      definitionId: "enemy_grunt_demon",
      name: "Grunt Demon",
      controllerId: "enemy",
      isCreature: true,
      power: 5,
      health: 18,
      maxHealth: 18,
      block: 0,
      intentLabel: "attack 5",
      intentQueueLabels: ["attack 5", "attack 7"],
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    });

    expect(handCard.actions).toHaveLength(1);
    expect(handCard.title).toBeUndefined();
    expect(handCard.image?.url).toContain(guardianCardDefinition.display!.imagePath);
    expect(handCard.footerStat).toBe("4/4");
    handCard.actions[0]?.onSelect?.();
    expect(onPlay).toHaveBeenCalledWith("card_1");

    expect(permanentCard.variant).toBe("permanent");
    expect(permanentCard.footerStat).toBe("4/10");
    expect(permanentCard.healthBar).toEqual({
      current: 10,
      max: 10,
      label: "10/10",
    });
    expect(permanentCard.statusLabel).toBe("defending");
    expect(permanentCard.stats).toHaveLength(0);
    expect(permanentCard.textBlocks.map((entry) => entry.text).join(" ")).toContain(
      handCard.textBlocks[0]?.text ?? "",
    );
    expect(permanentCard.image?.url).toContain(guardianCardDefinition.display!.imagePath);
    expect(permanentCard.badges).toHaveLength(0);
    expect(permanentCard.actions).toHaveLength(1);
    permanentCard.actions[0]?.onSelect?.();
    expect(onAttack).toHaveBeenCalledTimes(1);
    expect(enemyLeaderCard.healthBar).toEqual({
      current: 18,
      max: 18,
      label: "18/18",
    });
    expect(enemyLeaderCard.textBlocks.every((entry) => entry.kind === "rules")).toBe(true);
  });

  it("renders keyword abilities in bold in card text", () => {
    const guardianCard = mapArenaPermanentToDisplayCard({
      instanceId: "guardian_1",
      sourceCardInstanceId: "card_1",
      definitionId: "guardian",
      name: "Guardian",
      controllerId: "player",
      isCreature: true,
      power: 4,
      health: 10,
      maxHealth: 10,
      block: 0,
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    });

    const html = renderToStaticMarkup(createElement(DisplayCard, { model: guardianCard }));

    expect(html).toContain("<strong>Halt</strong>");
    expect(html).toContain("card-face-keyword-trigger");
    expect(html).toContain("display-card-keyword-tooltip");
    expect(html).toContain("While defending, this stops damage from passing through unless the attack has trample.");
  });

  it("renders cost chips in the Cloud Arena battlefield action face", () => {
    const battlefieldPermanent = {
      instanceId: "guide_1",
      sourceCardInstanceId: "card_2",
      definitionId: "sanctified_guide",
      name: "Sanctified Guide",
      isCreature: true,
      power: 2,
      health: 4,
      maxHealth: 4,
      block: 0,
      counters: {},
      attachments: [],
      attachedTo: null,
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 1,
      actions: [
        {
          id: "bless_target",
          kind: "activated",
          activation: { type: "action", actionId: "bless_target" },
          costs: [{ type: "tap" }],
          targeting: { allowSelfTarget: false },
          effects: [
            {
              type: "add_counter",
              target: "self",
              counter: "+1/+1",
              stat: "power",
              amount: { type: "constant", value: 1 },
            },
          ],
        },
      ],
    } as Parameters<typeof mapArenaPermanentToDisplayCard>[0];

    const panelHtml = renderToStaticMarkup(
        createElement(CloudArenaBattlefieldPanel, {
          battlefield: [battlefieldPermanent],
          legalActions: [],
          motionState: EMPTY_BATTLE_MOTION_STATE,
          getInspectableModel: () => mapArenaPermanentToDisplayCard(battlefieldPermanent, {
            playableActions: [],
          }),
        getPermanentMenuActions: () => [
          {
            action: "bless_target",
            label: "Bless",
            costs: [{ type: "tap" as const }],
            onSelect: () => undefined,
          },
          {
            action: "free_action",
            label: "Free Action",
            costs: [{ type: "free" as const }],
            onSelect: () => undefined,
          },
        ],
        getPermanentCounterEntries: () => [],
        bindInspectorInteractions: () => ({
          onMouseEnter: () => undefined,
          onMouseLeave: () => undefined,
          onFocus: () => undefined,
          onBlur: () => undefined,
          onClick: () => undefined,
        }),
        onOpenDetails: () => undefined,
        openPermanentMenuId: "guide_1",
        onPermanentMenuToggle: () => undefined,
        onPermanentMenuClose: () => undefined,
        onTargetPermanentSelect: () => undefined,
      }),
    );

    expect(panelHtml).toContain("Bless");
    expect(panelHtml).toContain("Free Action");
    expect(panelHtml).toContain("cloud-arena-permanent-action-face");
    expect(panelHtml).toContain("Back");
    expect(panelHtml).toContain("aria-label=\"Cost Tap\"");
    expect(panelHtml).toContain("aria-label=\"Cost 0\"");
    expect(panelHtml).toContain("T.svg");
  });

  it("renders Tubal-Cain with his current art", () => {
    const model = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_4",
        definitionId: "armory_disciple",
        name: "Tubal-Cain, Forger of Bronze and Iron",
        cost: 2,
        effectSummary: "A master forger who turns devotion into artifacts.",
      },
      {
        isPlayable: true,
      },
    );

    expect(model.image?.url).toContain(tubalCainsForgeCardDefinition.display!.imagePath);
    expect(model.image?.alt).toContain("Tubal-Cain forging bronze and iron");
  });

  it("stacks attached equipment under the permanent that carries it", () => {
    const hostPermanent = {
      instanceId: "disciple_1",
      sourceCardInstanceId: "card_1",
      definitionId: "armory_disciple",
      name: "Armory Disciple",
      isCreature: true,
      power: 2,
      health: 4,
      maxHealth: 4,
      block: 0,
      counters: {},
      attachments: ["holy_blade_1"],
      attachedTo: null,
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    } as Parameters<typeof mapArenaPermanentToDisplayCard>[0];
    const attachedEquipment = {
      instanceId: "holy_blade_1",
      sourceCardInstanceId: "card_2",
      definitionId: "holy_blade",
      name: "Holy Blade",
      isCreature: false,
      power: 1,
      health: 1,
      maxHealth: 1,
      block: 0,
      counters: {},
      attachments: [],
      attachedTo: "disciple_1",
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 1,
      actions: [
        {
          id: "holy_blade_equip",
          kind: "activated",
          activation: { type: "action", actionId: "equip" },
          targeting: { allowSelfTarget: false },
          effects: [],
        },
      ],
    } as Parameters<typeof mapArenaPermanentToDisplayCard>[0];

    const html = renderToStaticMarkup(
      createElement(CloudArenaBattlefieldPanel, {
        battlefield: [hostPermanent, attachedEquipment],
        legalActions: [],
        motionState: EMPTY_BATTLE_MOTION_STATE,
        getInspectableModel: (key) =>
          key === "battlefield:disciple_1"
            ? mapArenaPermanentToDisplayCard(hostPermanent, {})
            : mapArenaPermanentToDisplayCard(attachedEquipment, {}),
        getPermanentMenuActions: (permanent) =>
          permanent.instanceId === "holy_blade_1"
            ? [
                {
                  action: "equip",
                  label: "Re-equip",
                  costs: [{ type: "free" as const }],
                  onSelect: () => undefined,
                },
              ]
            : [],
        getPermanentCounterEntries: () => [],
        bindInspectorInteractions: () => ({
          onMouseEnter: () => undefined,
          onMouseLeave: () => undefined,
          onFocus: () => undefined,
          onBlur: () => undefined,
          onClick: () => undefined,
        }),
        onOpenDetails: () => undefined,
        openPermanentMenuId: "holy_blade_1",
        onPermanentMenuToggle: () => undefined,
        onPermanentMenuClose: () => undefined,
        onTargetPermanentSelect: () => undefined,
      }),
    );

    expect(html).toContain("cloud-arena-battlefield-active-attachment-overlay");
    expect(html).toContain("Armory Disciple");
    expect(html).toContain("Holy Blade");
    expect(html).toContain("Re-equip");
  });

  it("does not show power and toughness for noncreature artifacts", () => {
    const equipmentCard = mapArenaPermanentToDisplayCard({
      instanceId: "holy_blade_1",
      sourceCardInstanceId: "card_2",
      definitionId: "holy_blade",
      name: "Holy Blade",
      controllerId: "player",
      isCreature: false,
      power: 1,
      health: 1,
      maxHealth: 1,
      block: 0,
      counters: {},
      attachments: [],
      attachedTo: null,
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 1,
      actions: [],
    });

    expect(equipmentCard.footerStat).toBeNull();
    expect(equipmentCard.healthBar).toBeNull();
  });

  it("only renders permanent intent bubbles for enemy battlefield permanents", () => {
    const attackingPermanent = {
      instanceId: "guardian_1",
      sourceCardInstanceId: "card_1",
      definitionId: "guardian",
      name: "Guardian",
      isCreature: true,
      power: 4,
      health: 10,
      maxHealth: 10,
      block: 0,
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      intentLabel: "attack 4",
      actions: [],
    } as Parameters<typeof mapArenaPermanentToDisplayCard>[0];
    const renderPanel = (zoneKeyPrefix?: "battlefield" | "enemy_battlefield") =>
      renderToStaticMarkup(
        createElement(CloudArenaBattlefieldPanel, {
          zoneKeyPrefix,
          battlefield: [attackingPermanent],
          legalActions: [],
          motionState: EMPTY_BATTLE_MOTION_STATE,
          getInspectableModel: () => mapArenaPermanentToDisplayCard(attackingPermanent, {
            playableActions: [],
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
      );

    expect(renderPanel()).not.toContain("cloud-arena-permanent-intent-bubble");
    expect(renderPanel("enemy_battlefield")).toContain("cloud-arena-permanent-intent-bubble");
  });

  it("renders permanent counter orbs in the card health panel", () => {
    const counteredPermanent = {
      instanceId: "guide_1",
      sourceCardInstanceId: "card_2",
      definitionId: "sanctified_guide",
      name: "Sanctified Guide",
      isCreature: true,
      power: 3,
      health: 4,
      maxHealth: 4,
      block: 0,
      powerCounter: 2,
      healthCounter: -1,
      counters: { "+1/+1": 1 },
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    } as Parameters<typeof mapArenaPermanentToDisplayCard>[0];
    const renderPanel = (zoneKeyPrefix?: "battlefield" | "enemy_battlefield") =>
      renderToStaticMarkup(
        createElement(CloudArenaBattlefieldPanel, {
          zoneKeyPrefix,
          battlefield: [counteredPermanent],
          legalActions: [],
          motionState: EMPTY_BATTLE_MOTION_STATE,
          getInspectableModel: () => mapArenaPermanentToDisplayCard(counteredPermanent, {
            playableActions: [],
          }),
          getPermanentMenuActions: () => [],
          getPermanentCounterEntries: () => [{ counter: "+1/+1", amount: 1 }],
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
      );

    expect(renderPanel()).not.toContain("trace-viewer-counter-row");
    expect(renderPanel()).toContain("display-card-counter-panel");
    expect(renderPanel()).toContain("display-card-counter-orb-wrap");
    expect(renderPanel()).toContain("display-card-counter-tooltip");
    expect(renderPanel()).toContain("Sanctified Guide counters: Power counter +2, Health counter -1");
    expect(renderPanel()).toContain("Power counter +2");
    expect(renderPanel()).toContain("Health counter -1");
    expect(renderPanel()).toContain(">+2<");
    expect(renderPanel()).toContain(">-1<");
  });

  it("maps graveyard hymn as a creature instead of a spell", () => {
    const hymn = mapArenaHandCardToDisplayCard(
      {
        instanceId: "card_15",
        definitionId: "graveyard_hymn",
        name: "Graveyard Hymn",
        cost: 2,
        effectSummary: "When this dies, each creature on the battlefield gets +1/+1.",
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
      isTapped: false,
      isDefending: false,
      slotIndex: 2,
      actions: [],
    });

    expect(hymn.subtitle).toBe("Creature - Angel");
    expect(hymn.title).toBeUndefined();
    expect(permanentHymn.title).toBeUndefined();
    expect(permanentHymn.subtitle).toBe("Creature - Angel");
    expect(permanentHymn.textBlocks.map((entry) => entry.text)).toEqual(
      hymn.textBlocks.map((entry) => entry.text),
    );
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
      battlefieldSlotCount: 1,
      creatureBattlefieldSlotCount: 1,
      nonCreatureBattlefieldSlotCount: 1,
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
      enemies: [],
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
          isTapped: false,
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
          player: battle.player,
          creatureBattlefieldSlotCount: battle.creatureBattlefieldSlotCount,
          nonCreatureBattlefieldSlotCount: battle.nonCreatureBattlefieldSlotCount,
          maxPlayerEnergy: 3,
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
          onInspectPlayer: {
            onMouseEnter: () => undefined,
            onMouseLeave: () => undefined,
            onFocus: () => undefined,
            onBlur: () => undefined,
            onClick: () => undefined,
          },
        }),
        createElement(CloudArenaBattlefieldPanel, {
          battlefield: battle.battlefield,
          legalActions: [],
          motionState: EMPTY_BATTLE_MOTION_STATE,
          getInspectableModel: (key) =>
            key === "battlefield:graveyard_hymn_1"
              ? mapArenaPermanentToDisplayCard(battle.battlefield[0]!, {})
              : mapArenaEnemyToDisplayCard({
                  name: "Test Enemy",
                  health: 30,
                  maxHealth: 30,
                  block: 0,
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

    expect(html).toContain("display-card-info-button");
    expect(html).toContain("aria-label=\"Graveyard Hymn health\"");
  });

  it("renders an info control for enemy-controlled permanents", () => {
    const enemyPermanent = mapArenaPermanentToDisplayCard({
      instanceId: "enemy_permanent_1",
      sourceCardInstanceId: "enemy_permanent_1",
      definitionId: "enemy_grunt_demon",
      name: "Grunt Demon",
      controllerId: "enemy",
      isCreature: true,
      power: 5,
      health: 18,
      maxHealth: 18,
      block: 0,
      intentLabel: "attack 5",
      intentQueueLabels: ["attack 5"],
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: 0,
      actions: [],
    });

    const html = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: {
          ...enemyPermanent,
          stateFlags: [...enemyPermanent.stateFlags, "enemy-controlled"],
        },
        detailsAction: {
          onClick: () => undefined,
        },
      }),
    );

    expect(html).toContain("display-card-info-button");
    expect(html).toContain(">i<");
    expect(html).toContain("display-card-block-inline");
    expect(html).toContain("display-card-block-icon is-enemy is-inline");
    expect(html).not.toContain("details");
  });

  it("renders an info control for non-combat cards with details actions", () => {
    const html = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: mapArenaHandCardToDisplayCard(
          {
            instanceId: "card_1",
            definitionId: "graveyard_hymn",
            name: "Graveyard Hymn",
            cost: 2,
            effectSummary: "Bless the battlefield on death.",
          },
          {
            isPlayable: false,
          },
        ),
        detailsAction: {
          onClick: () => undefined,
        },
      }),
    );

    expect(html).toContain("display-card-info-button");
    expect(html).toContain("Details for Graveyard Hymn");
    expect(html).toContain(">i<");
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
      battlefieldSlotCount: 0,
      creatureBattlefieldSlotCount: 0,
      nonCreatureBattlefieldSlotCount: 0,
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
      enemies: [],
      battlefield: [],
      blockingQueue: [],
      legalActions: [],
    };

    const html = renderToStaticMarkup(
      createElement(CloudArenaHandTray, {
        battle,
        player: battle.player,
        creatureBattlefieldSlotCount: battle.creatureBattlefieldSlotCount,
        nonCreatureBattlefieldSlotCount: battle.nonCreatureBattlefieldSlotCount,
        maxPlayerEnergy: 3,
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
        onInspectPlayer: {
          onMouseEnter: () => undefined,
          onMouseLeave: () => undefined,
          onFocus: () => undefined,
          onBlur: () => undefined,
          onClick: () => undefined,
        },
      }),
    );

    expect(html).not.toContain("Details for draw pile");
    expect(html).not.toContain("Details for discard pile");
    expect(html).not.toContain("Details for graveyard pile");
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
        activeTab: "info",
        onTabChange: () => undefined,
      }),
    );

    expect(html).toContain("Card Definition");
    expect(html).toContain("&quot;id&quot;: &quot;guardian&quot;");
    expect(html).toContain("&quot;abilities&quot;: [");
    expect(html).not.toContain("card-face");
  });

  it("renders a sequence tab with real enemy card faces", () => {
    const impCallerCards = buildEnemyPreviewCards(getEnemyPreset("imp_caller").cards);

    const html = renderToStaticMarkup(
      createElement(CloudArenaInspectorPanel, {
        definitionJson: "{}",
        activeTab: "sequence",
        showSequenceTab: true,
        sequenceCards: impCallerCards.map((model, index) => ({
          key: `enemy_battlefield:enemy_1:enemy-sequence:${index}`,
          model,
        })),
        onTabChange: () => undefined,
      }),
    );

    expect(html).toContain("Sequence");
    expect(html).toContain("Single Slash");
    expect(html).toContain("Spawn token imp");
    expect(html).toContain("display-card-shell");
  });

  it("describes slash attack multipliers and repeat counts distinctly", () => {
    const previewCards = buildEnemyPreviewCards([
      {
        id: "single_slash_preview",
        name: "Single Slash",
        effects: [{ attackPowerMultiplier: 1, target: "player" }],
      },
      {
        id: "double_slash_preview",
        name: "Double Slash",
        effects: [{ attackPowerMultiplier: 2, target: "player" }],
      },
      {
        id: "triple_slash_preview",
        name: "Triple Slash",
        effects: [{ attackPowerMultiplier: 3, target: "player" }],
      },
      {
        id: "pierce_preview",
        name: "Pierce Slash",
        effects: [{ attackPowerMultiplier: 1, bypassBlock: true, target: "player" }],
      },
      {
        id: "weaken_preview",
        name: "Weaken",
        effects: [{ powerDeltaAllPermanents: -1, target: "enemy" }],
      },
    ]);

    expect(previewCards[0]?.textBlocks[0]?.text).toBe("Attack with base power");
    expect(previewCards[1]?.textBlocks[0]?.text).toBe("Attack with 2x base power");
    expect(previewCards[2]?.textBlocks[0]?.text).toBe("Attack with 3x base power");
    expect(previewCards[3]?.textBlocks[0]?.text).toBe("**Pierce** • Attack with base power");
    expect(previewCards[4]?.textBlocks[0]?.text).toBe("Reduce all permanents Power by 1");
  });

  it("renders immediate enemy cards with a hoverable Immediate keyword", () => {
    const html = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: buildEnemyPreviewCards([
          {
            id: "enemy_immediate_test",
            name: "Immediate Test",
            effects: [
              {
                attackPowerMultiplier: 1,
                target: "player",
                resolveTiming: "immediate",
              },
            ],
          },
        ])[0]!,
      }),
    );

    expect(html).toContain("card-face-keyword-trigger");
    expect(html).toContain("Show keyword help for Immediate");
    expect(html).toContain("Immediate");
  });

  it("does not render the Ark of the Covenant as a guardian fallback", () => {
    const bannerCard = mapArenaPermanentToDisplayCard({
      instanceId: "anointed_banner_2",
      sourceCardInstanceId: "card_2",
      definitionId: "anointed_banner",
      name: "Ark of the Covenant",
      isCreature: false,
      power: 0,
      health: 6,
      maxHealth: 6,
      block: 0,
      counters: { "+1/+1": 1 },
      attachments: [],
      attachedTo: null,
      hasActedThisTurn: false,
      isTapped: false,
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

    expect(bannerCard.name).toBe("Ark of the Covenant");
    expect(bannerCard.title).toBeUndefined();
    expect(bannerCard.subtitle).toBe("Artifact");
    expect(bannerCard.textBlocks.some((entry) => entry.text.length > 0)).toBe(true);
    expect(bannerCard.actions.map((action) => action.label)).not.toContain("Defend");
  });
});

describe("shared display card component", () => {
  it("does not repeat the name when no custom title is present", () => {
    const html = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: {
          variant: "mtg",
          name: "Plain Card",
          title: null,
          subtitle: "Instant",
          frameTone: "white",
          manaCost: "{1}",
          image: null,
          metaLine: null,
          footerCode: "ARE",
          footerCredit: "Cloud Arena",
          collectorNumber: "P00",
          footerStat: null,
          healthBar: null,
          energyBar: null,
          statusLabel: null,
          statusTone: undefined,
          stats: [],
          textBlocks: [],
          badges: [],
          actions: [],
          stateFlags: [],
        },
      }),
    );

    expect(html).toContain(">Plain Card<");
    expect(html).not.toContain(">Plain Card, Plain Card<");
  });

  it("does not repeat the name when the title is omitted", () => {
    const html = renderToStaticMarkup(
      createElement(DisplayCard, {
        model: {
          variant: "mtg",
          name: "Radiant Conduit",
          title: null,
          subtitle: "Creature - Angel",
          frameTone: "white",
          manaCost: "{2}",
          image: null,
          metaLine: null,
          footerCode: "ARE",
          footerCredit: "Cloud Arena",
          collectorNumber: "020",
          footerStat: null,
          healthBar: null,
          energyBar: null,
          statusLabel: null,
          statusTone: undefined,
          stats: [],
          textBlocks: [],
          badges: [],
          actions: [],
          stateFlags: [],
        },
      }),
    );

    expect(html).toContain("<h3>Radiant Conduit</h3>");
    expect(html).not.toContain(">Radiant Conduit, Radiant Conduit<");
  });

  it("renders mtg and arena variants without requiring identical fields", () => {
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
          intentLabel: "attack 12",
          intentQueueLabels: ["attack 12", "defend 3"],
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
            isTapped: false,
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
        }),
      }),
    );

    expect(arenaHandHtml).toContain("card-face-stats-box");
    expect(arenaHandHtml).toContain(">4/4<");
    expect(playerHtml).toContain("aria-label=\"Player energy\"");
    expect(playerHtml).toContain(">2/3<");
    expect(playerHtml).toContain("display-card-energy-orb");
    expect(playerHtml).toContain("display-card-character-layout display-card-character-layout-player");
    expect(playerHtml).not.toContain("<span>Energy</span><strong>2</strong>");
    expect(playerHtml).not.toContain("Hand ");
    expect(enemyHtml).toContain("data-variant=\"enemy\"");
    expect(enemyHtml).toContain("Long Battle Demon");
    expect(enemyHtml).toContain("Long Battle Demon is preparing attack 12.");
    expect(enemyHtml).toContain("/images/cards/card_0009_lucifer_fallen_angel_of_light.webp");
    expect(enemyHtml).toContain("display-card-enemy-stack");
    expect(enemyHtml).toContain("aria-label=\"Long Battle Demon block 0\"");
    expect(enemyHtml).toContain("aria-label=\"Long Battle Demon health\"");
    expect(enemyHtml).toContain("display-card-block-icon is-enemy");
    expect(enemyHtml).toContain(">50/50<");
    expect(enemyHtml).not.toContain(">Health<");
    expect(enemyHtml).not.toContain("<span>HP</span>");
    expect(enemyHtml).not.toContain("<span>Block</span>");
    expect(enemyHtml).not.toContain("display-card-intent-banner");
    expect(permanentHtml).toContain("card-face-stats-box");
    expect(permanentHtml).toContain(">4/8<");
    expect(permanentHtml).toContain("aria-label=\"Guardian health\"");
    expect(permanentHtml).not.toContain("display-card-block-icon");
    expect(permanentHtml).not.toContain("ready");
    expect(permanentHtml).not.toContain("spent");
    expect(permanentHtml).not.toContain("acted");
  });

  it("renders enemy block as a blue shield badge next to the health bar", () => {
    const enemyCard = mapArenaEnemyToDisplayCard({
      name: "Long Battle Demon",
      health: 44,
      maxHealth: 60,
      block: 7,
      intentLabel: "attack 10 x2",
      intentQueueLabels: ["attack 10 x2", "defend 4"],
    });

    const html = renderToStaticMarkup(createElement(DisplayCard, { model: enemyCard }));

    expect(html).toContain("display-card-block-icon is-enemy");
    expect(html).toContain("aria-label=\"Long Battle Demon block 7\"");
    expect(html).toContain(">7<");
  });

  it("shows the telegraphed enemy card over the battlefield from the current intent", () => {
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
        hand: [],
        drawPile: [],
        drawPileCount: 0,
        discardPile: [],
        graveyard: [],
      },
      enemy: {
        name: "Demon Pack",
        health: 24,
        maxHealth: 24,
        block: 0,
        leaderDefinitionId: "enemy_pack_alpha",
        currentCardId: "cross_slash",
        intent: { attackAmount: 6, attackTimes: 2 },
        intentLabel: "attack 6 x2",
        intentQueueLabels: ["attack 6 x2"],
      },
      enemies: [],
      battlefield: [],
      battlefieldSlotCount: 0,
      creatureBattlefieldSlotCount: 5,
      nonCreatureBattlefieldSlotCount: 5,
      enemyBattlefield: [
        {
          instanceId: "enemy_leader",
          sourceCardInstanceId: "enemy_card_1",
          definitionId: "enemy_pack_alpha",
          name: "Demon Pack, Legion",
          isCreature: true,
          power: 3,
          health: 24,
          maxHealth: 24,
          block: 0,
          controllerId: "enemy",
          hasActedThisTurn: false,
          isTapped: false,
          isDefending: false,
          isEnemyLeader: true,
          slotIndex: 0,
          actions: [],
        },
      ],
      pendingTargetRequest: null,
      blockingQueue: [],
      legalActions: [],
    };

    const html = renderToStaticMarkup(
      createElement(CloudArenaBattleState, {
        battle,
      }),
    );

    expect(html).toContain("cloud-arena-battlefield-action-play-overlay");
    expect(html).toContain("Cross Slash");
    expect(html).toContain("aria-hidden=\"true\"");
  });

  it("shows each enemy permanent's telegraphed card over its battlefield slot", () => {
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
        hand: [],
        drawPile: [],
        drawPileCount: 0,
        discardPile: [],
        graveyard: [],
      },
      enemy: {
        name: "Demon Pack",
        health: 24,
        maxHealth: 24,
        block: 0,
        leaderDefinitionId: "enemy_pack_alpha",
        currentCardId: "double_slash",
        intent: { attackAmount: 8 },
        intentLabel: "attack 8",
        intentQueueLabels: ["attack 8"],
      },
      enemies: [],
      battlefield: [],
      battlefieldSlotCount: 0,
      creatureBattlefieldSlotCount: 5,
      nonCreatureBattlefieldSlotCount: 5,
      enemyBattlefield: [
        {
          instanceId: "enemy_leader",
          sourceCardInstanceId: "enemy_card_1",
          definitionId: "enemy_pack_alpha",
          name: "Demon Pack, Legion",
          isCreature: true,
          power: 4,
          health: 24,
          maxHealth: 24,
          block: 0,
          controllerId: "enemy",
          hasActedThisTurn: false,
          isTapped: false,
          isDefending: false,
          isEnemyLeader: true,
          slotIndex: 0,
          actions: [],
        },
      ],
      pendingTargetRequest: null,
      blockingQueue: [],
      legalActions: [],
    };

    const html = renderToStaticMarkup(
      createElement(CloudArenaBattleState, {
        battle,
      }),
    );

    expect(html).toContain("cloud-arena-battlefield-action-play-overlay");
    expect(html).toContain("Double Slash");
    expect(html).toContain("aria-hidden=\"true\"");
  });

  it("shows the current telegraphed card even when the enemy intent is idle", () => {
    const battle: CloudArenaBattleViewModel = {
      turnNumber: 2,
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
        hand: [],
        drawPile: [],
        drawPileCount: 0,
        discardPile: [],
        graveyard: [],
      },
      enemy: {
        name: "Demon Pack",
        health: 24,
        maxHealth: 24,
        block: 24,
        leaderDefinitionId: "enemy_pack_alpha",
        currentCardId: "gain_block_equal_health",
        intent: {},
        intentLabel: "idle",
        intentQueueLabels: ["attack 6 x2"],
      },
      enemies: [],
      battlefield: [],
      battlefieldSlotCount: 0,
      creatureBattlefieldSlotCount: 5,
      nonCreatureBattlefieldSlotCount: 5,
      enemyBattlefield: [
        {
          instanceId: "enemy_leader",
          sourceCardInstanceId: "enemy_card_1",
          definitionId: "enemy_pack_alpha",
          name: "Demon Pack, Legion",
          isCreature: true,
          power: 3,
          health: 24,
          maxHealth: 24,
          block: 24,
          controllerId: "enemy",
          hasActedThisTurn: false,
          isTapped: false,
          isDefending: false,
          isEnemyLeader: true,
          slotIndex: 0,
          actions: [],
          intentLabel: "idle",
          intentQueueLabels: ["attack 6 x2"],
        },
      ],
      pendingTargetRequest: null,
      blockingQueue: [],
      legalActions: [],
    };

    const html = renderToStaticMarkup(
      createElement(CloudArenaBattleState, {
        battle,
      }),
    );

    expect(html).toContain("cloud-arena-battlefield-action-play-overlay");
    expect(html).toContain("Gain Block Equal To Health");
  });
});
