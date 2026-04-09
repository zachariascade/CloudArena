import type {
  CardDetail,
  CardListItem,
  CloudArenaCardSnapshot,
  CloudArenaPermanentSnapshot,
  ImagePreview,
} from "../../../../src/cloud-arcanum/api-contract.js";

import type { CloudArenaBattleViewModel } from "./cloud-arena-battle-view-model.js";
import { buildRulesPreview } from "../components/card-face-tile.js";
import { LEAN_V1_DEFAULT_TURN_ENERGY } from "../../../../src/cloud-arena/index.js";

export type DisplayCardVariant = "mtg" | "player" | "enemy" | "permanent";

export type DisplayCardImage = {
  alt: string;
  url: string | null;
  fallbackLabel: string;
  credit?: string | null;
};

export type DisplayCardStat = {
  label: string;
  value: string;
};

export type DisplayCardTextBlock = {
  kind: "rules" | "flavor" | "intent" | "passive" | "meta";
  text: string;
};

export type DisplayCardAction = {
  id: string;
  label: string;
  disabled?: boolean;
  emphasis?: "primary" | "neutral";
  onSelect?: () => void;
};

export type DisplayCardModel = {
  variant: DisplayCardVariant;
  name: string;
  title?: string | null;
  subtitle?: string | null;
  frameTone: string;
  manaCost?: string | null;
  image?: DisplayCardImage | null;
  metaLine?: string | null;
  footerCode: string;
  footerCredit: string;
  collectorNumber: string;
  footerStat?: string | null;
  healthBar?: {
    current: number;
    max: number;
    label?: string;
  } | null;
  energyBar?: {
    current: number;
    max: number;
    label?: string;
  } | null;
  statusLabel?: string | null;
  statusTone?: "draft" | "templating" | "balanced" | "approved";
  stats: DisplayCardStat[];
  textBlocks: DisplayCardTextBlock[];
  badges: string[];
  actions: DisplayCardAction[];
  stateFlags: string[];
};

type CloudArcanumDisplayCardInput = {
  id?: string;
  name: string;
  title: string | null;
  typeLine: string;
  manaCost: string | null;
  power: string | null;
  toughness: string | null;
  loyalty: string | null;
  defense: string | null;
  image: ImagePreview;
  oracleText: string | null;
  flavorText: string | null;
  artist?: string | null;
  setCode?: string | null;
  colors?: string[];
  status?: CardListItem["status"];
  draft?: Pick<CardDetail["draft"], "status">;
};

function formatDisplayImage(
  image: ImagePreview,
  fallbackLabel: string,
  credit?: string | null,
): DisplayCardImage {
  return {
    alt: image.alt,
    url: image.isRenderable ? image.publicUrl : null,
    fallbackLabel:
      image.kind === "placeholder" || image.kind === "missing"
        ? fallbackLabel
        : "Image unavailable",
    credit,
  };
}

function formatDisplayCardValue(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return String(value);
}

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
    typeLine: "Permanent - Guardian",
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
    typeLine: "Permanent - Relic Banner",
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
    typeLine: "Permanent - Angel",
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
    typeLine: "Permanent - Angel Captain",
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
    typeLine: "Permanent - Disciple",
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
    typeLine: "Permanent - Equipment",
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

export function mapCloudArcanumCardToDisplayCard(
  card: CloudArcanumDisplayCardInput,
): DisplayCardModel {
  const status = card.status ?? card.draft?.status ?? "draft";
  const frameTone =
    card.colors && card.colors.length === 1
      ? ({
          W: "white",
          U: "blue",
          B: "black",
          R: "red",
          G: "green",
          C: "colorless",
        }[card.colors[0]] ?? "colorless")
      : card.colors && card.colors.length > 1
        ? "multicolor"
        : "colorless";
  const stats: DisplayCardStat[] = [];
  const power = formatDisplayCardValue(card.power);
  const toughness = formatDisplayCardValue(card.toughness);
  const loyalty = formatDisplayCardValue(card.loyalty);
  const defense = formatDisplayCardValue(card.defense);

  if (power && toughness) {
    stats.push({
      label: "P/T",
      value: `${power}/${toughness}`,
    });
  }

  if (loyalty) {
    stats.push({
      label: "Loyalty",
      value: loyalty,
    });
  }

  if (defense) {
    stats.push({
      label: "Defense",
      value: defense,
    });
  }

  return {
    variant: "mtg",
    name: card.name,
    title: card.title,
    frameTone,
    manaCost: card.manaCost,
    subtitle: card.typeLine,
    image: formatDisplayImage(card.image, "Preview pending"),
    metaLine: card.manaCost,
    footerCode: card.setCode ?? "CARD",
    footerCredit: card.image.artist ?? card.artist ?? "TBD",
    collectorNumber: card.id?.replace(/^card_/, "") ?? "000",
    footerStat: stats[0]?.value ?? null,
    healthBar: null,
    energyBar: null,
    statusLabel: status,
    statusTone: status,
    stats,
    textBlocks: buildRulesPreview({
      oracleText: card.oracleText,
      flavorText: card.flavorText,
    }).map((entry) => ({
      kind: entry.kind === "oracle" ? "rules" : "flavor",
      text: entry.text,
    })),
    badges: [status],
    actions: [],
    stateFlags: [],
  };
}

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
    stats: [
      { label: "Block", value: String(player.block) },
    ],
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
    stats: [
      { label: "Block", value: String(enemy.block) },
    ],
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
        ? [
            {
              kind: "flavor" as const,
              text: presentation.flavorText,
            },
          ]
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
  if (typeof action.attackAmount === "number" && action.attackAmount > 0) {
    const times =
      typeof action.attackTimes === "number" && action.attackTimes > 1
        ? ` x${action.attackTimes}`
        : "";

    return `Attack ${action.attackAmount}${times}`;
  }

  if (typeof action.blockAmount === "number" && action.blockAmount > 0) {
    return `Defend ${action.blockAmount}`;
  }

  return "Action";
}

function getFallbackArenaPresentation(
  cardName: string,
  costLabel: string | null,
): ArenaCardPresentation {
  return {
    title: null,
    typeLine: "Permanent",
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
      action: "attack" | "defend";
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
    statusLabel: permanent.hasActedThisTurn ? "acted" : "ready",
    statusTone: permanent.hasActedThisTurn ? "draft" : "balanced",
    stats: [{ label: "Block", value: String(permanent.block) }],
    textBlocks: [
      ...permanent.actions.map((action) => ({
        kind: "rules" as const,
        text: getPermanentActionText(action),
      })),
      {
        kind: "meta",
        text: permanent.isDefending
          ? "This permanent is set to intercept the next enemy assault."
          : "This permanent is ready to press the attack or hold the line.",
      },
      ...(presentation.flavorText
        ? [
            {
              kind: "flavor" as const,
              text: presentation.flavorText,
            },
          ]
        : []),
    ],
    badges: [
      permanent.hasActedThisTurn ? "acted" : "ready",
      permanent.isDefending ? "defending" : "open",
    ],
    actions: permanent.actions.flatMap((action, index) => {
      const mode =
        typeof action.attackAmount === "number" && action.attackAmount > 0
          ? "attack"
          : "defend";
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
    }),
    stateFlags: [
      permanent.hasActedThisTurn ? "acted" : "ready",
      permanent.isDefending ? "defending" : "open",
    ],
  };
}
