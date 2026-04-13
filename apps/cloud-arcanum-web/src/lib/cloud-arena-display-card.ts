import { LEAN_V1_DEFAULT_TURN_ENERGY } from "../../../../src/cloud-arena/index.js";
import type {
  CloudArenaCardSnapshot,
  CloudArenaPermanentSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";

import type { CloudArenaBattleViewModel } from "./cloud-arena-battle-view-model.js";
import type {
  DisplayCardImage,
  DisplayCardModel,
} from "./display-card.js";

type ArenaCardPresentation = {
  title: string | null;
  typeLine: string;
  manaCost: string | null;
  frameTone: string;
  imagePath?: string;
  imageAlt?: string;
  flavorText?: string | null;
  footerCode: string;
  footerCredit: string;
  collectorNumber: string;
};

function buildArenaImage(
  imagePath: string | undefined,
  alt: string | undefined,
  fallbackLabel: string,
  credit: string,
): DisplayCardImage | null {
  if (!imagePath || !alt) {
    return null;
  }

  return {
    alt,
    url: `/images/cards/${imagePath}`,
    fallbackLabel,
    credit,
  };
}

const ARENA_HAND_CARD_PRESENTATIONS: Record<string, ArenaCardPresentation> = {
  attack: {
    title: "Opening Cut",
    typeLine: "Instant - Assault",
    manaCost: "{1}",
    frameTone: "red",
    imagePath: "card_0032_flaming_sword_of_the_east.png",
    imageAlt: "A flaming sword cutting across the dark",
    flavorText: "Commit first. Let hesitation fall away after the strike lands.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "001",
  },
  defend: {
    title: "Stand Firm",
    typeLine: "Instant - Guard",
    manaCost: "{1}",
    frameTone: "white",
    imagePath: "card_0036_watcher_at_edens_gate.jpg",
    imageAlt: "A vigilant guardian standing at Eden's gate",
    flavorText: "Meet the blow with discipline, not panic.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "002",
  },
  defending_strike: {
    title: "Shield and Scourge",
    typeLine: "Instant - Clash",
    manaCost: "{2}",
    frameTone: "split-white-red",
    imagePath: "card_0032_flaming_sword_of_the_east.png",
    imageAlt: "A flaming sword held in defense",
    flavorText: "Turn defense into pressure before the enemy can reset.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "003",
  },
  guardian: {
    title: "Keeper of the Gate",
    typeLine: "Creature - Angel",
    manaCost: "{3}",
    frameTone: "white",
    imagePath: "card_0036_watcher_at_edens_gate.jpg",
    imageAlt: "A guardian standing watch before a sacred gate",
    flavorText: "A faithful body on the field buys time for every plan behind it.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "004",
  },
  anointed_banner: {
    title: "Consecrated Standard",
    typeLine: "Artifact",
    manaCost: "{2}",
    frameTone: "white",
    imagePath: "card_0057_garments_of_skin.jpg",
    imageAlt: "A consecrated banner lifted before the faithful",
    flavorText: "Raised high, it turns a gathered host into a sanctified advance.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "005",
  },
  sacrificial_seraph: {
    title: "Winged Collector",
    typeLine: "Creature - Angel",
    manaCost: "{2}",
    frameTone: "white",
    imagePath: "card_0003_michael.jpg",
    imageAlt: "An angel descending over a battlefield altar",
    flavorText: "Every offering leaves it brighter, sharper, and harder to oppose.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "006",
  },
  choir_captain: {
    title: "Voice Above the Host",
    typeLine: "Creature - Angel",
    manaCost: "{3}",
    frameTone: "white",
    imagePath: "card_0004_gabriel.jpg",
    imageAlt: "An angelic captain calling ranks into formation",
    flavorText: "Its song counts every wing and turns presence into power.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "007",
  },
  armory_disciple: {
    title: "Bearer of the Forge",
    typeLine: "Creature - Human",
    manaCost: "{2}",
    frameTone: "white",
    imagePath: "card_0057_garments_of_skin.jpg",
    imageAlt: "A disciple receiving blessed arms before battle",
    flavorText: "The right tool arrives the moment discipline becomes devotion.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "008",
  },
  holy_blade: {
    title: "Blessed Edge",
    typeLine: "Artifact - Equipment",
    manaCost: "{1}",
    frameTone: "colorless",
    imagePath: "card_0032_flaming_sword_of_the_east.png",
    imageAlt: "A radiant sword suspended in sacred light",
    flavorText: "No hand keeps it long; it belongs where the charge is fiercest.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "009",
  },
};

const ARENA_PLAYER_PRESENTATION = {
  frameTone: "white",
  typeLine: "Legendary Hero",
  imagePath: "card_0021_adam_first_of_dust.jpg",
  imageAlt: "A solemn figure shaped from dust and light",
  footerCode: "ARE",
  footerCredit: "Cloud Arena",
  collectorNumber: "P01",
};

const ARENA_ENEMY_PRESENTATION = {
  frameTone: "split-black-red",
  typeLine: "Enemy - Demon",
  imagePath: "card_0009_lucifer_fallen_angel_of_light.webp",
  imageAlt: "A fallen angel wreathed in fire and shadow",
  footerCode: "ARE",
  footerCredit: "Cloud Arena",
  collectorNumber: "E01",
};

export function mapArenaPlayerToDisplayCard(
  player: CloudArenaBattleViewModel["player"],
): DisplayCardModel {
  return {
    variant: "player",
    name: "Pilgrim Duelist",
    title: "Vanguard of the Arena",
    subtitle: "Legendary Hero",
    frameTone: ARENA_PLAYER_PRESENTATION.frameTone,
    manaCost: null,
    image: buildArenaImage(
      ARENA_PLAYER_PRESENTATION.imagePath,
      ARENA_PLAYER_PRESENTATION.imageAlt,
      "Player preview",
      ARENA_PLAYER_PRESENTATION.footerCredit,
    ),
    metaLine: null,
    footerCode: ARENA_PLAYER_PRESENTATION.footerCode,
    footerCredit: ARENA_PLAYER_PRESENTATION.footerCredit,
    collectorNumber: ARENA_PLAYER_PRESENTATION.collectorNumber,
    footerStat: null,
    healthBar: {
      current: player.health,
      max: player.maxHealth,
      label: `${player.health}/${player.maxHealth}`,
    },
    energyBar: {
      current: player.energy,
      max: LEAN_V1_DEFAULT_TURN_ENERGY,
      label: `${player.energy}/${LEAN_V1_DEFAULT_TURN_ENERGY}`,
    },
    statusLabel: "hero",
    statusTone: "approved",
    stats: [{ label: "Block", value: String(player.block) }],
    textBlocks: [
      {
        kind: "passive",
        text: `At the start of your turn, prepare ${player.energy} energy for the exchange ahead.`,
      },
      {
        kind: "rules",
        text: `Hand ${player.hand.length}. Draw ${player.drawPileCount}. Discard ${player.discardPile.length}. Graveyard ${player.graveyard.length}.`,
      },
      {
        kind: "flavor",
        text: "Every turn is a choice between weathering the blow and ending the fight.",
      },
    ],
    badges: ["hero"],
    actions: [],
    stateFlags: [],
  };
}

export function mapArenaEnemyToDisplayCard(
  enemy: CloudArenaBattleViewModel["enemy"],
): DisplayCardModel {
  return {
    variant: "enemy",
    name: enemy.name,
    title: "Harbinger of Attrition",
    subtitle: "Enemy - Demon",
    frameTone: ARENA_ENEMY_PRESENTATION.frameTone,
    manaCost: null,
    image: buildArenaImage(
      ARENA_ENEMY_PRESENTATION.imagePath,
      ARENA_ENEMY_PRESENTATION.imageAlt,
      enemy.name,
      ARENA_ENEMY_PRESENTATION.footerCredit,
    ),
    metaLine: null,
    footerCode: ARENA_ENEMY_PRESENTATION.footerCode,
    footerCredit: ARENA_ENEMY_PRESENTATION.footerCredit,
    collectorNumber: ARENA_ENEMY_PRESENTATION.collectorNumber,
    footerStat: null,
    healthBar: {
      current: enemy.health,
      max: enemy.maxHealth,
      label: `${enemy.health}/${enemy.maxHealth}`,
    },
    energyBar: null,
    statusLabel: "enemy",
    statusTone: "draft",
    stats: [{ label: "Block", value: String(enemy.block) }],
    textBlocks: [
      {
        kind: "intent",
        text: `${enemy.name} is preparing ${enemy.intentLabel}.`,
      },
      {
        kind: "rules",
        text: `Current block ${enemy.block}. If left unanswered, the next enemy resolution will hit in full.`,
      },
      {
        kind: "flavor",
        text: "The demon does not rush. It wins by making every exchange cost too much.",
      },
    ],
    badges: ["boss"],
    actions: [],
    stateFlags: [],
  };
}

export function mapArenaHandCardToDisplayCard(
  card: CloudArenaCardSnapshot,
  options: {
    isPlayable: boolean;
    disabled?: boolean;
    onPlay?: (cardInstanceId: string) => void;
  },
): DisplayCardModel {
  const presentation = ARENA_HAND_CARD_PRESENTATIONS[card.definitionId] ?? {
    title: null,
    typeLine: "Spell",
    manaCost: card.cost > 0 ? `{${card.cost}}` : null,
    frameTone: "colorless",
    flavorText: null,
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: card.definitionId.toUpperCase(),
  };

  return {
    variant: "mtg",
    name: card.name,
    title: presentation.title,
    subtitle: presentation.typeLine,
    frameTone: presentation.frameTone,
    manaCost: presentation.manaCost,
    image: buildArenaImage(
      presentation.imagePath,
      presentation.imageAlt,
      card.name,
      presentation.footerCredit,
    ),
    metaLine: null,
    footerCode: presentation.footerCode,
    footerCredit: presentation.footerCredit,
    collectorNumber: presentation.collectorNumber,
    footerStat: null,
    healthBar: null,
    energyBar: null,
    statusLabel: options.isPlayable ? "playable" : "waiting",
    statusTone: options.isPlayable ? "balanced" : "draft",
    stats: [],
    textBlocks: [
      {
        kind: "rules",
        text: card.effectSummary,
      },
      ...(presentation.flavorText
        ? [{ kind: "flavor" as const, text: presentation.flavorText }]
        : []),
    ],
    badges: [options.isPlayable ? "playable" : "unavailable"],
    actions:
      options.isPlayable && options.onPlay
        ? [
            {
              id: `play-${card.instanceId}`,
              label: options.disabled ? "Waiting..." : "Play card",
              disabled: options.disabled,
              emphasis: "primary",
              onSelect: () => options.onPlay?.(card.instanceId),
            },
          ]
        : [],
    stateFlags: options.isPlayable ? ["playable"] : ["disabled"],
  };
}

function getPermanentActionText(
  action: CloudArenaPermanentSnapshot["actions"][number],
): string {
  if (action.kind === "activated") {
    if (action.activation.actionId === "attack") {
      return "Attack";
    }

    if (action.activation.actionId === "apply_block") {
      return "Apply Block";
    }

    return action.activation.actionId.replace(/_/g, " ");
  }

  return "Action";
}

function getFallbackArenaPresentation(
  cardName: string,
  costLabel: string | null,
): ArenaCardPresentation {
  return {
    title: null,
    typeLine: "Permanent Card",
    manaCost: costLabel,
    frameTone: "colorless",
    flavorText: null,
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: cardName.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 12) || "PERM",
  };
}

export function mapArenaPermanentToDisplayCard(
  permanent: CloudArenaPermanentSnapshot,
  options: {
    disableActions?: boolean;
    playableActions?: Array<{
      action: string;
      label: string;
      onSelect?: () => void;
    }>;
  } = {},
): DisplayCardModel {
  const actionMap = new Map(
    (options.playableActions ?? []).map((entry) => [entry.action, entry]),
  );
  const presentation =
    ARENA_HAND_CARD_PRESENTATIONS[permanent.definitionId] ??
    getFallbackArenaPresentation(permanent.name, null);
  const nativeRuleActions = permanent.isCreature
    ? [
        {
          id: `${permanent.instanceId}-attack-native`,
          label: `Attack ${permanent.power}`,
          action: "attack",
        },
        {
          id: `${permanent.instanceId}-defend-native`,
          label: "Defend",
          action: "defend",
        },
      ]
    : [];
  const activatedActionButtons = permanent.actions.flatMap((action, index) => {
    if (action.kind !== "activated") {
      return [];
    }

    const mode = action.activation.actionId;
    const mappedAction = actionMap.get(mode);

    if (!mappedAction) {
      return [];
    }

    return [
      {
        id: `${permanent.instanceId}-${mode}-${index}`,
        label: options.disableActions ? `${mappedAction.label}...` : mappedAction.label,
        disabled: options.disableActions,
        onSelect: mappedAction.onSelect,
      },
    ];
  });
  const nativeActionButtons = nativeRuleActions.flatMap((action) => {
    const mappedAction = actionMap.get(action.action);

    if (!mappedAction) {
      return [];
    }

    return [
      {
        id: action.id,
        label: options.disableActions ? `${mappedAction.label}...` : mappedAction.label,
        disabled: options.disableActions,
        onSelect: mappedAction.onSelect,
      },
    ];
  });

  return {
    variant: "permanent",
    name: permanent.name,
    title: presentation.title ?? `Slot ${permanent.slotIndex + 1}`,
    subtitle: presentation.typeLine,
    frameTone: presentation.frameTone,
    manaCost: presentation.manaCost,
    image: buildArenaImage(
      presentation.imagePath,
      presentation.imageAlt,
      permanent.name,
      presentation.footerCredit,
    ),
    metaLine: null,
    footerCode: presentation.footerCode,
    footerCredit: presentation.footerCredit,
    collectorNumber: `${presentation.collectorNumber}-${permanent.slotIndex + 1}`,
    footerStat: null,
    healthBar: {
      current: permanent.health,
      max: permanent.maxHealth,
      label: `${permanent.health}/${permanent.maxHealth}`,
    },
    energyBar: null,
    statusLabel: null,
    statusTone: permanent.hasActedThisTurn ? "draft" : "balanced",
    stats: [{ label: "Block", value: String(permanent.block) }],
    textBlocks: [
      ...(permanent.isCreature
        ? [
            { kind: "rules" as const, text: `Attack ${permanent.power}` },
            { kind: "rules" as const, text: "Defend" },
          ]
        : []),
      ...permanent.actions.map((action) => ({
        kind: "rules" as const,
        text: getPermanentActionText(action),
      })),
      {
        kind: "meta",
        text: permanent.isDefending
          ? "This card is set to intercept the next enemy assault."
          : "This card is ready to press the attack or hold the line.",
      },
      ...(presentation.flavorText
        ? [{ kind: "flavor" as const, text: presentation.flavorText }]
        : []),
    ],
    badges: [
      permanent.isDefending ? "defending" : "ready",
      ...(permanent.hasActedThisTurn ? ["acted"] : []),
    ],
    actions: [...nativeActionButtons, ...activatedActionButtons],
    stateFlags: [
      permanent.hasActedThisTurn ? "acted" : "ready",
      permanent.isDefending ? "defending" : "open",
    ],
  };
}
