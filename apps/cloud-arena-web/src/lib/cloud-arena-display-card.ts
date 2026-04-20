import {
  LEAN_V1_DEFAULT_TURN_ENERGY,
  getAbilityCostDisplayParts,
} from "../../../../src/cloud-arena/index.js";
import type {
  CloudArenaCardSnapshot,
  CloudArenaPermanentSnapshot,
} from "../../../../src/cloud-arena/api-contract.js";
import {
  buildDisplayCardModel,
  type DisplayCardImage,
  type DisplayCardModel,
} from "../../../../src/presentation/display-card.js";

import type { CloudArenaBattleViewModel } from "./cloud-arena-battle-view-model.js";

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
  footerStat?: string | null;
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
    imagePath: "card_0033_eden_garden_of_delight.jpg",
    imageAlt: "A steadfast shelter standing against the storm",
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
    imagePath: "card_0031_tree_of_forbidden_knowledge.jpg",
    imageAlt: "A hard-earned warning wrapped around a burning edge",
    flavorText: "Turn defense into pressure before the enemy can reset.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "003",
  },
  focused_blessing: {
    title: "Focused Blessing",
    typeLine: "Instant",
    manaCost: "{1}",
    frameTone: "white",
    imagePath: "card_0004_gabriel.svg",
    imageAlt: "A radiant blessing aimed with deliberate focus",
    flavorText: "A single faithful touch can sharpen a whole line of resolve.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "011",
  },
  targeted_smite: {
    title: "Targeted Smite",
    typeLine: "Instant",
    manaCost: "{1}",
    frameTone: "red",
    imagePath: "card_0023_cain_marked_exile.jpg",
    imageAlt: "A marked exile struck by a precise judgment",
    flavorText: "Judgment lands best when it does not wander.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "012",
  },
  forced_sacrifice: {
    title: "Forced Sacrifice",
    typeLine: "Instant",
    manaCost: "{1}",
    frameTone: "split-black-red",
    imagePath: "classics/card_0056_the_fall.png",
    imageAlt: "A shadowed descent demanding a costly offering",
    flavorText: "Some offerings are not chosen freely.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "013",
  },
  forbidden_insight: {
    title: "Forbidden Insight",
    typeLine: "Instant",
    manaCost: "{2}",
    frameTone: "blue",
    imagePath: "card_0031_tree_of_forbidden_knowledge.jpg",
    imageAlt: "A moment of hidden understanding opening like a book of fire",
    flavorText: "Some truths are dangerous, but they still fill the hand with answers.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "016",
  },
  resurrect: {
    title: "Return to the Hand",
    typeLine: "Instant",
    manaCost: "{2}",
    frameTone: "white",
    imagePath: "card_0004_gabriel.svg",
    imageAlt: "A radiant hand lifting a card back from the grave",
    flavorText: "What falls away can be gathered back, cleanly and with purpose.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "017",
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
    footerStat: "4/4",
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
  mass_benediction: {
    title: "Mass Benediction",
    typeLine: "Instant",
    manaCost: "{2}",
    frameTone: "white",
    imagePath: "card_0027_let_there_be_light.png",
    imageAlt: "A radiant blessing washing over a gathered host",
    flavorText: "When the field is already crowded with resolve, every presence turns brighter.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "010",
  },
  graveyard_hymn: {
    title: "Graveyard Hymn",
    typeLine: "Creature - Angel",
    manaCost: "{2}",
    frameTone: "white",
    imagePath: "card_0004_gabriel.svg",
    imageAlt: "An angel singing over the battlefield",
    flavorText: "Even in ruin, a faithful voice can make the whole field rise again.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "015",
    footerStat: "2/2",
  },
  token_imp: {
    title: "Token Imp",
    typeLine: "Creature - Demon Imp",
    manaCost: "{0}",
    frameTone: "split-black-red",
    imagePath: "token_imp.svg",
    imageAlt: "A small imp with ember wings and a sly grin",
    flavorText: "Small enough to underestimate, loud enough to matter.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "006B",
    footerStat: "2/4",
  },
  sacrificial_seraph: {
    title: "Winged Collector",
    typeLine: "Creature - Angel",
    manaCost: "{2}",
    frameTone: "white",
    imagePath: "card_0003_michael.avif",
    imageAlt: "An angel descending over a battlefield altar",
    flavorText: "Every offering leaves it brighter, sharper, and harder to oppose.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "006",
    footerStat: "3/5",
  },
  sanctified_guide: {
    title: "Sanctified Guide",
    typeLine: "Creature - Angel",
    manaCost: "{3}",
    frameTone: "white",
    imagePath: "card_0037_builder_of_the_tower.jpg",
    imageAlt: "An angel guiding a single blessing onto the field",
    flavorText: "A steady hand can direct grace exactly where the line is thinnest.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "014",
    footerStat: "2/4",
  },
  token_angel: {
    title: "Token Angel",
    typeLine: "Creature - Angel",
    manaCost: "{1}",
    frameTone: "white",
    imagePath: "classics/card_0059_dove_with_the_olive_branch.jpg",
    imageAlt: "A small angel token hovering over the battlefield",
    flavorText: "A little light, repeated where it is needed, still holds the line.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "006A",
    footerStat: "1/1",
  },
  enemy_leader: {
    title: "Enemy Leader",
    typeLine: "Enemy - Demon",
    manaCost: "{0}",
    frameTone: "split-black-red",
    imagePath: "card_0009_lucifer_fallen_angel_of_light.webp",
    imageAlt: "A fallen angel wreathed in fire and shadow",
    flavorText: "The battle's answer stands on the board, not behind it.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E00",
    footerStat: null,
  },
  choir_captain: {
    title: "Voice Above the Host",
    typeLine: "Creature - Angel",
    manaCost: "{3}",
    frameTone: "white",
    imagePath: "classics/card_0055_image_of_god.jpg",
    imageAlt: "An angelic captain calling ranks into formation",
    flavorText: "Its song counts every wing and turns presence into power.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "007",
    footerStat: "2/3",
  },
  armory_disciple: {
    title: "Bearer of the Forge",
    typeLine: "Creature - Human",
    manaCost: "{2}",
    frameTone: "white",
    imagePath: "card_0041_tubal_cain_forger_of_bronze_and_iron.jpg",
    imageAlt: "A disciple receiving blessed arms before battle",
    flavorText: "The right tool arrives the moment discipline becomes devotion.",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "008",
    footerStat: "2/4",
  },
  holy_blade: {
    title: "Blessed Edge",
    typeLine: "Artifact - Equipment",
    manaCost: "{1}",
    frameTone: "colorless",
    imagePath: "card_0027_let_there_be_light.png",
    imageAlt: "A radiant blade formed from sacred light",
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

const ARENA_ENEMY_PRESENTATIONS: Record<string, typeof ARENA_ENEMY_PRESENTATION> = {
  "Grunt Demon": {
    frameTone: "split-black-red",
    typeLine: "Enemy - Demon",
    imagePath: "grunt_demon.svg",
    imageAlt: "A horned demon soldier framed by smoke and ember light",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E02",
  },
  "Demon Husk": {
    frameTone: "split-black-red",
    typeLine: "Enemy - Demon",
    imagePath: "grunt_demon.svg",
    imageAlt: "A lean demon husk with cracked armor and ember-lit eyes",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E03",
  },
  "Demon Brute": {
    frameTone: "split-black-red",
    typeLine: "Enemy - Demon",
    imagePath: "card_0009_lucifer_fallen_angel_of_light.webp",
    imageAlt: "A hulking demon brute wrapped in fire and shadow",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E04",
  },
  "Pack Alpha": {
    frameTone: "split-black-red",
    typeLine: "Enemy - Demon",
    imagePath: "grunt_demon.svg",
    imageAlt: "A pack leader demon with a commanding stare and ember-lit armor",
    footerCode: "ARE",
    footerCredit: "Cloud Arena",
    collectorNumber: "E05",
  },
};

function getArenaEnemyPresentation(enemyName: string): typeof ARENA_ENEMY_PRESENTATION {
  return ARENA_ENEMY_PRESENTATIONS[enemyName] ?? ARENA_ENEMY_PRESENTATION;
}

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
  player: CloudArenaBattleViewModel["player"],
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
    stateFlags: [],
  });
}

export function mapArenaEnemyToDisplayCard(
  enemy: CloudArenaBattleViewModel["enemy"],
): DisplayCardModel {
  const presentation = getArenaEnemyPresentation(enemy.name);

  return buildDisplayCardModel({
    variant: "enemy",
    name: enemy.name,
    title: "Harbinger of Attrition",
    subtitle: "Enemy - Demon",
    frameTone: presentation.frameTone,
    manaCost: null,
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
    stateFlags: [],
  });
}

export function mapArenaHandCardToDisplayCard(
  card: CloudArenaCardSnapshot,
  options: {
    isPlayable: boolean;
    disabled?: boolean;
    onPlay?: (cardInstanceId: string) => void;
    actionLabel?: string;
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

  return buildDisplayCardModel({
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
      ...(presentation.flavorText
        ? [{ kind: "flavor" as const, text: presentation.flavorText }]
        : []),
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
    stateFlags: options.isPlayable ? ["playable"] : ["disabled"],
  });
}

export function mapArenaGraveyardCardToDisplayCard(
  card: CloudArenaCardSnapshot,
  options: {
    disabled?: boolean;
    onChoose?: (cardInstanceId: string) => void;
    actionLabel?: string;
  },
): DisplayCardModel {
  return mapArenaHandCardToDisplayCard(card, {
    isPlayable: true,
    disabled: options.disabled,
    onPlay: options.onChoose,
    actionLabel: options.actionLabel ?? "Return to hand",
  });
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

    if (action.activation.actionId === "equip") {
      return "Equip";
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

  return buildDisplayCardModel({
    variant: "permanent",
    name: permanent.name,
    title: presentation.title ?? null,
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
    footerStat: `${permanent.power}/${permanent.health}`,
    healthBar: null,
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
    stats: [],
    textBlocks: [
      ...(permanent.isCreature
        ? [
            { kind: "rules" as const, text: `Attack ${permanent.power}` },
            { kind: "rules" as const, text: "Defend" },
          ]
        : []),
      ...(permanent.controllerId === "enemy"
        ? getEnemyTelegraphTextBlocks({
            intentLabel: permanent.intentLabel,
            intentQueueLabels: permanent.intentQueueLabels,
          })
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
    badges: [],
    actions: [...nativeActionButtons, ...activatedActionButtons],
    stateFlags: [
      permanent.hasActedThisTurn ? "spent" : permanentAvailabilityState,
      permanent.isTapped ? "tapped" : "untapped",
      permanent.isDefending ? "defending" : "open",
    ],
  });
}
