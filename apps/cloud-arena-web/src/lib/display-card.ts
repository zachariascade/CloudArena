import {
  LEAN_V1_DEFAULT_TURN_ENERGY,
  getAbilityCostDisplayParts,
  getCardDefinition,
} from "../../../../src/cloud-arena/index.js";
import type { CardDefinition, CardDisplayDefinition } from "../../../../src/cloud-arena/core/types.js";
import type {
  CloudArenaCardSnapshot,
  CloudArenaPermanentSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";
import { summarizeCardDefinition } from "../../../../src/cloud-arena/card-summary.js";
import {
  buildDisplayCardModel,
  type DisplayCardImage,
  type DisplayCardModel,
} from "../../../../src/presentation/display-card.js";

export { buildDisplayCardModel } from "../../../../src/presentation/display-card.js";
export type {
  DisplayCardAction,
  DisplayCardEnergyBar,
  DisplayCardHealthBar,
  DisplayCardImage,
  DisplayCardModel,
  DisplayCardModelBase,
  DisplayCardStat,
  DisplayCardTextBlock,
  DisplayCardVariant,
} from "../../../../src/presentation/display-card.js";

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
    url: /^https?:\/\//.test(imagePath) ? imagePath : `./images/cards/${imagePath}`,
    fallbackLabel,
    credit,
  };
}

function getFallbackCardDisplay(definition: CardDefinition): CardDisplayDefinition {
  const typeLine = [
    definition.cardTypes
      .map((cardType) => cardType.replace(/_/g, " "))
      .map((cardType) => cardType.charAt(0).toUpperCase() + cardType.slice(1))
      .join(" "),
    definition.subtypes?.length ? `- ${definition.subtypes.join(" ")}` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(" ")
    .trim();

  return {
    title: null,
    subtitle: typeLine || null,
    frameTone: "colorless",
    manaCost: definition.cost > 0 ? `{${definition.cost}}` : "{0}",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: definition.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 12) || "CARD",
    footerStat:
      "power" in definition && "health" in definition ? `${definition.power}/${definition.health}` : null,
  };
}

function getCardDisplay(definition: CardDefinition): CardDisplayDefinition {
  return definition.display ?? getFallbackCardDisplay(definition);
}

const ARENA_PLAYER_PRESENTATION = {
  frameTone: "white",
  imagePath: "card_0021_adam_first_of_dust.jpg",
  imageAlt: "A solemn figure shaped from dust and light",
  footerCode: "ARE",
  footerCredit: "Cloud Arena",
  collectorNumber: "P01",
};

function getEnemyTelegraphTextBlocks(input: {
  intentLabel?: string | null;
  intentQueueLabels?: string[] | null;
}): Array<
  | {
      kind: "intent";
      text: string;
    }
> {
  const blocks: Array<
    | {
        kind: "intent";
        text: string;
      }
  > = [];

  if (input.intentLabel) {
    blocks.push({
      kind: "intent",
      text: `Telegraph: ${input.intentLabel}`,
    });
  }

  const queueLabels = input.intentLabel
    ? (input.intentQueueLabels ?? []).slice(1)
    : (input.intentQueueLabels ?? []);

  queueLabels.forEach((label, index) => {
    blocks.push({
      kind: "intent",
      text: `${index === 0 ? "Next" : "Then"}: ${label}`,
    });
  });

  return blocks;
}

export function mapArenaPlayerToDisplayCard(
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    isHealthDropping?: boolean;
    isHealthRising?: boolean;
  },
  options: {
    stateFlags?: string[];
  } = {},
): DisplayCardModel {
  return buildDisplayCardModel({
    variant: "player",
    name: "Player",
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
    textBlocks: [],
    badges: ["hero"],
    actions: [],
    stateFlags: [
      ...(options.stateFlags ?? []),
      player.isHealthDropping ? "health-dropping" : null,
      player.isHealthRising ? "health-rising" : null,
    ].filter((flag): flag is string => flag !== null),
  });
}

export function mapArenaEnemyToDisplayCard(
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    leaderDefinitionId?: string | null;
    intentLabel: string;
    intentQueueLabels?: string[];
    isHealthRising?: boolean;
    isHealthDropping?: boolean;
  },
  options: {
    stateFlags?: string[];
  } = {},
): DisplayCardModel {
  const presentation = enemy.leaderDefinitionId
    ? getCardDisplay(getCardDefinition(enemy.leaderDefinitionId))
    : {
        frameTone: "split-black-red",
        imagePath: "card_0009_lucifer_fallen_angel_of_light.webp",
        imageAlt: "A fallen angel wreathed in fire and shadow",
        footerCode: "ARE",
        footerCredit: "Cloud Arena",
        collectorNumber: "E01",
        title: "Harbinger of Attrition",
        subtitle: "Enemy - Demon",
        manaCost: null,
        flavorText: null,
        footerStat: null,
      };

  return buildDisplayCardModel({
    variant: "enemy",
    name: enemy.name,
    title: presentation.title,
    subtitle: presentation.subtitle,
    frameTone: presentation.frameTone,
    manaCost: presentation.manaCost,
    image: buildArenaImage(
      presentation.imagePath,
      presentation.imageAlt,
      enemy.name,
      presentation.footerCredit,
    ),
    metaLine: null,
    footerCode: presentation.footerCode,
    footerCredit: presentation.footerCredit,
    collectorNumber: presentation.collectorNumber,
    footerStat: presentation.footerStat ?? null,
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
      ...getEnemyTelegraphTextBlocks({
        intentLabel: enemy.intentLabel,
        intentQueueLabels: enemy.intentQueueLabels,
      }),
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
    stateFlags: [
      ...(options.stateFlags ?? []),
      enemy.isHealthDropping ? "health-dropping" : null,
      enemy.isHealthRising ? "health-rising" : null,
    ].filter((flag): flag is string => flag !== null),
  });
}

export function mapArenaHandCardToDisplayCard(
  card: CloudArenaCardSnapshot,
  options: {
    isPlayable: boolean;
    disabled?: boolean;
    isTargetable?: boolean;
    onPlay?: (cardInstanceId: string) => void;
    actionLabel?: string;
  },
): DisplayCardModel {
  const definition = getCardDefinition(card.definitionId);
  const presentation = getCardDisplay(definition);

  return buildDisplayCardModel({
    variant: "mtg",
    name: card.name,
    title: presentation.title,
    subtitle: presentation.subtitle,
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
    footerStat: presentation.footerStat ?? null,
    healthBar: null,
    energyBar: null,
    statusLabel: null,
    statusTone: undefined,
    stats: [],
    textBlocks: [
      {
        kind: "rules",
        text: card.effectSummary,
      },
    ],
    badges: [],
    actions:
      options.isPlayable && options.onPlay
        ? [
            {
              id: `play-${card.instanceId}`,
              label: options.disabled ? "Waiting..." : (options.actionLabel ?? "Play card"),
              disabled: options.disabled,
              emphasis: "primary",
              onSelect: () => options.onPlay?.(card.instanceId),
            },
          ]
        : [],
    stateFlags: [
      options.isPlayable ? "playable" : "disabled",
      options.isTargetable ? "targetable" : null,
    ].filter((flag): flag is string => flag !== null),
  });
}

export function mapArenaGraveyardCardToDisplayCard(
  card: CloudArenaCardSnapshot,
  options: {
    disabled?: boolean;
    isTargetable?: boolean;
    onChoose?: (cardInstanceId: string) => void;
    actionLabel?: string;
  },
): DisplayCardModel {
  return mapArenaHandCardToDisplayCard(card, {
    isPlayable: true,
    disabled: options.disabled,
    isTargetable: options.isTargetable,
    onPlay: options.onChoose,
    actionLabel: options.actionLabel ?? "Return to hand",
  });
}

export function mapArenaPermanentToDisplayCard(
  permanent: CloudArenaPermanentSnapshot,
  options: {
    disableActions?: boolean;
    isTargetable?: boolean;
    targetTone?: "player" | "enemy";
    stateFlags?: string[];
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
  const definition = getCardDefinition(permanent.definitionId);
  const presentation = getCardDisplay(definition);
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
        costs: getAbilityCostDisplayParts(action),
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
        costs: [{ type: "free" as const }],
        disabled: options.disableActions,
        onSelect: mappedAction.onSelect,
      },
    ];
  });
  const hasAvailableActions =
    !permanent.hasActedThisTurn && (permanent.isCreature || permanent.actions.length > 0);
  const permanentAvailabilityState = hasAvailableActions ? "ready" : "spent";
  const isEnemyControlled = permanent.controllerId === "enemy";

  return buildDisplayCardModel({
    variant: "permanent",
    name: permanent.name,
    title: presentation.title,
    subtitle: presentation.subtitle,
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
    footerStat: permanent.isCreature ? `${permanent.power}/${permanent.health}` : null,
    healthBar: permanent.isCreature
      ? {
          current: permanent.health,
          max: permanent.maxHealth,
          label: `${permanent.health}/${permanent.maxHealth}`,
        }
      : null,
    energyBar: null,
    statusLabel: permanent.isTapped
      ? "tapped"
      : permanent.isDefending
        ? "defending"
        : null,
    statusTone: permanent.isTapped
      ? "draft"
      : permanent.isDefending
        ? "approved"
        : undefined,
    stats: isEnemyControlled ? [{ label: "Block", value: String(permanent.block) }] : [],
    textBlocks: [
      {
        kind: "rules",
        text: summarizeCardDefinition(definition).join(" • "),
      },
    ],
    badges: [],
    actions: [...nativeActionButtons, ...activatedActionButtons],
    stateFlags: [
      ...(options.stateFlags ?? []),
      permanent.hasActedThisTurn ? "spent" : permanentAvailabilityState,
      permanent.isTapped ? "tapped" : "untapped",
      permanent.isDefending ? "defending" : "open",
      isEnemyControlled ? "enemy-controlled" : null,
      options.isTargetable ? `targetable-${options.targetTone ?? "player"}` : null,
    ].filter((flag): flag is string => flag !== null),
  });
}
