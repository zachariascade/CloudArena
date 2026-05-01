import {
  LEAN_V1_DEFAULT_TURN_ENERGY,
  getAbilityCostDisplayParts,
  getCardDefinition,
} from "../../../../src/cloud-arena/index.js";
import type { CardDefinition, CardDisplayDefinition, PermanentCardDefinition } from "../../../../src/cloud-arena/core/types.js";
import type {
  CloudArenaCardSnapshot,
  CloudArenaPermanentSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";
import { summarizeCardDefinition } from "../../../../src/cloud-arena/card-summary.js";
import {
  buildDisplayCardModel,
  type DisplayCardCounterPill,
  type DisplayCardImage,
  type DisplayCardModel,
  type DisplayCardSagaChapter,
  type DisplayCardTextBlock,
} from "../../../../src/presentation/display-card.js";

type ResolvedCardDisplay = CardDisplayDefinition & {
  name: string;
  manaCost: string | null;
  subtitle: string | null;
  footerStat: string | null;
};

export { buildDisplayCardModel } from "../../../../src/presentation/display-card.js";
export type {
  DisplayCardAction,
  DisplayCardEnergyBar,
  DisplayCardHealthBar,
  DisplayCardImage,
  DisplayCardModel,
  DisplayCardModelBase,
  DisplayCardSagaChapter,
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

function summarizeSagaChapterText(chapter: NonNullable<PermanentCardDefinition["saga"]>["chapters"][number]): string {
  const summary = summarizeCardDefinition({
    id: `saga_chapter_${chapter.chapter}`,
    name: `Chapter ${chapter.chapter}`,
    cardTypes: ["sorcery"],
    cost: 0,
    onPlay: [],
    spellEffects: chapter.effects,
  });

  return summary.join(" ");
}

function getDefinitionSagaDisplay(definition: CardDefinition): DisplayCardModel["saga"] {
  if (!("saga" in definition) || !definition.saga) {
    return null;
  }

  return {
    finalChapter:
      definition.saga.sacrificeAfterChapter ??
      Math.max(...definition.saga.chapters.map((chapter) => chapter.chapter)),
    chapters: definition.saga.chapters.map((chapter): DisplayCardSagaChapter => ({
      chapter: chapter.chapter,
      label: chapter.label ?? String(chapter.chapter),
      text: summarizeSagaChapterText(chapter),
    })),
  };
}

function getPermanentSagaDisplay(permanent: CloudArenaPermanentSnapshot): DisplayCardModel["saga"] {
  if (!permanent.saga) {
    return null;
  }

  return {
    loreCounter: permanent.saga.loreCounter,
    finalChapter: permanent.saga.finalChapter,
    chapters: permanent.saga.chapters.map((chapter): DisplayCardSagaChapter => ({
      chapter: chapter.chapter,
      label: chapter.label,
      text: chapter.text.replace(/^[^-]+ - /, ""),
      resolved: chapter.resolved,
      active: chapter.active,
    })),
  };
}

function formatCardTypeLine(definition: Pick<CardDefinition, "cardTypes" | "subtypes">): string {
  if (definition.cardTypes.includes("saga")) {
    const baseTypes = definition.cardTypes.filter((cardType) => cardType !== "saga");
    const typeLine = baseTypes.length > 0
      ? baseTypes
          .map((cardType) => cardType.replace(/_/g, " "))
          .map((cardType) => cardType.charAt(0).toUpperCase() + cardType.slice(1))
          .join(" ")
      : "Enchantment";
    const subtypes = ["Saga", ...(definition.subtypes ?? [])];

    return `${typeLine} - ${subtypes.join(" ")}`;
  }

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

  return typeLine;
}

export function buildCardSubtitle(
  definition: Pick<CardDefinition, "cardTypes" | "subtypes" | "rarity">,
): string {
  const typeLine = formatCardTypeLine(definition);
  const isLegendaryOrHigher =
    definition.rarity === "mythic" || definition.rarity === "special" || definition.rarity === "bonus";

  return isLegendaryOrHigher ? `Legendary ${typeLine}` : typeLine;
}

export function buildCardFooterStat(definition: CardDefinition): string | null {
  const displayableTypes = new Set(["creature", "enchantment", "battle", "land", "saga"]);
  const shouldShowStat = definition.cardTypes.some((cardType) => displayableTypes.has(cardType));

  if (shouldShowStat && "power" in definition && "health" in definition) {
    return `${definition.power}/${definition.health}`;
  }

  return null;
}

export function buildCardManaCost(definition: Pick<CardDefinition, "cost" | "manaCost">): string | null {
  return definition.manaCost ?? (definition.cost > 0 ? `{${definition.cost}}` : "{0}");
}

export function buildCardDisplayName(definition: Pick<CardDefinition, "name" | "display">): string {
  return definition.display?.name ?? definition.name;
}

function getFallbackCardDisplay(definition: CardDefinition): CardDisplayDefinition {
  return {
    name: definition.name,
    title: null,
    frameTone: "colorless",
    artist: null,
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: definition.id.toUpperCase().replace(/[^A-Z0-9]+/g, "_").slice(0, 12) || "CARD",
  };
}

function getCardDisplay(definition: CardDefinition): ResolvedCardDisplay {
  const display = definition.display ?? getFallbackCardDisplay(definition);

  return {
    ...display,
    name: buildCardDisplayName(definition),
    manaCost: buildCardManaCost(definition),
    subtitle: buildCardSubtitle(definition),
    footerStat: buildCardFooterStat(definition),
  };
}

function getPermanentCounterPills(permanent: CloudArenaPermanentSnapshot): DisplayCardCounterPill[] {
  const pills: DisplayCardCounterPill[] = [];
  const powerCounter = permanent.powerCounter ?? 0;
  const healthCounter = permanent.healthCounter ?? 0;

  if (powerCounter !== 0) {
    pills.push({ label: "Power", value: powerCounter });
  }

  if (healthCounter !== 0) {
    pills.push({ label: "Health", value: healthCounter });
  }

  return pills;
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
    artist: null,
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
    intentLabel?: string | null;
    intentQueueLabels?: string[];
    isHealthRising?: boolean;
    isHealthDropping?: boolean;
  },
  options: {
    stateFlags?: string[];
    context?: "battle" | "catalog";
  } = {},
): DisplayCardModel {
  const leaderDefinition = enemy.leaderDefinitionId
    ? getCardDefinition(enemy.leaderDefinitionId)
    : null;
  const presentation = leaderDefinition
    ? getCardDisplay(leaderDefinition)
    : {
        frameTone: "split-black-red",
        imagePath: "card_0009_lucifer_fallen_angel_of_light.webp",
        imageAlt: "A fallen angel wreathed in fire and shadow",
        footerCode: "ARE",
        footerCredit: "Cloud Arena",
        collectorNumber: "E01",
        name: "Harbinger of Attrition",
        title: "Harbinger of Attrition",
        artist: null,
        subtitle: "Enemy - Demon",
        manaCost: null,
        flavorText: null,
        footerStat: null,
      };
  const footerStat = leaderDefinition ? buildCardFooterStat(leaderDefinition) : null;
  const leaderKeywordBlocks: DisplayCardTextBlock[] =
    leaderDefinition && "keywords" in leaderDefinition && leaderDefinition.keywords?.length
      ? [
          {
            kind: "rules",
            text: leaderDefinition.keywords.map((kw) => `**${kw.charAt(0).toUpperCase() + kw.slice(1)}**`).join(", "),
          },
        ]
      : [];

  const isCatalog = options.context === "catalog";

  const catalogTextBlocks: DisplayCardTextBlock[] = (() => {
    if (!leaderDefinition) {
      return [
        {
          kind: "flavor" as const,
          text: "The demon does not rush. It wins by making every exchange cost too much.",
        },
      ];
    }

    const rulesLines = summarizeCardDefinition(leaderDefinition)
      .filter((line) => !/^\*\*\w/.test(line));

    return [
      ...leaderKeywordBlocks,
      ...(rulesLines.length > 0
        ? [{ kind: "rules" as const, text: rulesLines.join(" ") }]
        : []),
      ...(presentation.flavorText
        ? [{ kind: "flavor" as const, text: presentation.flavorText }]
        : []),
    ];
  })();

  const battleTextBlocks: DisplayCardTextBlock[] = [
    ...(enemy.intentLabel
      ? [
          {
            kind: "intent" as const,
            text: `${enemy.name} is preparing ${enemy.intentLabel}.`,
          },
          ...getEnemyTelegraphTextBlocks({
            intentLabel: enemy.intentLabel,
            intentQueueLabels: enemy.intentQueueLabels,
          }),
        ]
      : []),
    ...leaderKeywordBlocks,
    {
      kind: "rules" as const,
      text: `Current block ${enemy.block}. If left unanswered, the next enemy resolution will hit in full.`,
    },
    {
      kind: "flavor" as const,
      text: "The demon does not rush. It wins by making every exchange cost too much.",
    },
  ];

  return buildDisplayCardModel({
    variant: "enemy",
    name: enemy.name,
    title: presentation.title,
    subtitle: presentation.subtitle,
    artist: presentation.artist ?? null,
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
    footerStat,
    healthBar: {
      current: enemy.health,
      max: enemy.maxHealth,
      label: `${enemy.health}/${enemy.maxHealth}`,
    },
    energyBar: null,
    statusLabel: "enemy",
    statusTone: "draft",
    stats: [{ label: "Block", value: String(enemy.block) }],
    textBlocks: isCatalog ? catalogTextBlocks : battleTextBlocks,
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
    variant: definition.cardTypes.includes("saga") ? "saga" : "mtg",
    name: card.name,
    title: presentation.title,
    subtitle: presentation.subtitle,
    artist: presentation.artist ?? null,
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
    footerStat: buildCardFooterStat(definition),
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
    saga: getDefinitionSagaDisplay(definition),
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
  const hasNativeCombatActions = permanent.isCreature || Boolean(permanent.saga);
  const nativeRuleActions = hasNativeCombatActions
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
    !permanent.hasActedThisTurn && (hasNativeCombatActions || permanent.actions.length > 0);
  const permanentAvailabilityState = permanent.saga
    ? "ready"
    : hasAvailableActions
      ? "ready"
      : "spent";
  const isEnemyControlled = permanent.controllerId === "enemy";

  return buildDisplayCardModel({
    variant: permanent.saga ? "saga" : "permanent",
    name: permanent.name,
    title: presentation.title,
    subtitle: presentation.subtitle,
    artist: presentation.artist ?? null,
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
    footerStat: hasNativeCombatActions ? `${permanent.power}/${permanent.health}` : null,
    healthBar: hasNativeCombatActions
      ? {
          current: permanent.health,
          max: permanent.maxHealth,
          label: `${permanent.health}/${permanent.maxHealth}`,
      }
      : null,
    energyBar: null,
    counterPills: getPermanentCounterPills(permanent),
    statusLabel: permanent.saga
      ? `Lore ${permanent.saga.loreCounter}/${permanent.saga.finalChapter}`
      : permanent.isTapped
      ? "tapped"
      : permanent.isDefending
        ? "defending"
        : null,
    statusTone: permanent.saga
      ? "balanced"
      : permanent.isTapped
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
    saga: getPermanentSagaDisplay(permanent),
    badges: [],
    actions: [...nativeActionButtons, ...activatedActionButtons],
    stateFlags: [
      ...(options.stateFlags ?? []),
      permanent.hasActedThisTurn && !permanent.saga ? "spent" : permanentAvailabilityState,
      permanent.isTapped ? "tapped" : "untapped",
      permanent.isDefending ? "defending" : "open",
      isEnemyControlled ? "enemy-controlled" : null,
      options.isTargetable ? `targetable-${options.targetTone ?? "player"}` : null,
    ].filter((flag): flag is string => flag !== null),
  });
}

export function mapCardDefinitionIdToDisplayCard(definitionId: string): DisplayCardModel {
  const definition = getCardDefinition(definitionId);
  const presentation = getCardDisplay(definition);
  const summary = summarizeCardDefinition(definition);

  return buildDisplayCardModel({
    variant: definition.cardTypes.includes("saga") ? "saga" : "mtg",
    name: definition.name,
    title: presentation.title,
    subtitle: presentation.subtitle,
    frameTone: presentation.frameTone,
    manaCost: presentation.manaCost,
    image: buildArenaImage(
      presentation.imagePath,
      presentation.imageAlt,
      definition.name,
      presentation.footerCredit,
    ),
    metaLine: null,
    footerCode: presentation.footerCode,
    footerCredit: presentation.footerCredit,
    collectorNumber: presentation.collectorNumber,
    footerStat: buildCardFooterStat(definition),
    healthBar: null,
    energyBar: null,
    statusLabel: null,
    statusTone: undefined,
    stats: [],
    textBlocks: summary.map((line) => ({ kind: "rules" as const, text: line })),
    saga: getDefinitionSagaDisplay(definition),
    badges: [],
    actions: [],
    stateFlags: [],
  });
}
