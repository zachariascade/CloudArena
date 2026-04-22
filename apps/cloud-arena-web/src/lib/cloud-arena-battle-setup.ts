import type {
  CloudArenaDeckKind,
  CloudArenaDeckSummary,
  CloudArenaSessionScenarioId,
} from "../../../../src/cloud-arena/api-contract.js";

export const CLOUD_ARENA_BATTLE_PATH = "/battle";
export const CLOUD_ARENA_DECK_QUERY_PARAM = "deck";
export const CLOUD_ARENA_SCENARIO_QUERY_PARAM = "enemy";

export type CloudArenaDeckChooserOption = {
  id: string;
  label: string;
  description: string;
  kind: CloudArenaDeckKind;
  disabled?: boolean;
};

export type CloudArenaDeckChooserGroup = {
  label: string;
  options: CloudArenaDeckChooserOption[];
};

export const CLOUD_ARENA_SCENARIO_OPTIONS: Array<{
  id: CloudArenaSessionScenarioId;
  label: string;
  description: string;
}> = [
  {
    id: "demon_pack",
    label: "Demon Pack",
    description: "Leader plus two demon bodies",
  },
  {
    id: "mixed_guardian",
    label: "Mixed Guardian",
    description: "Balanced baseline battle",
  },
  {
    id: "grunt_demon",
    label: "Grunt Demon",
    description: "Simple low-tier attacker",
  },
  {
    id: "imp_caller",
    label: "Imp Caller",
    description: "Token pressure test",
  },
];

const CLOUD_ARENA_DECK_OPTIONS: Array<{
  id: string;
  label: string;
  description: string;
}> = [
  {
    id: "master_deck",
    label: "Master Deck",
    description: "All available player cards",
  },
  {
    id: "wide_angels",
    label: "Wide Angels",
    description: "Token angels and blessing scale",
  },
  {
    id: "tall_creatures",
    label: "Tall Creatures",
    description: "Grow one or two bigger bodies",
  },
];

function isCloudArenaSessionScenarioId(value: string): value is CloudArenaSessionScenarioId {
  return CLOUD_ARENA_SCENARIO_OPTIONS.some((option) => option.id === value);
}

function createPresetDeckChooserOption(
  option: (typeof CLOUD_ARENA_DECK_OPTIONS)[number],
): CloudArenaDeckChooserOption {
  return {
    id: option.id,
    label: option.label,
    description: option.description,
    kind: "preset",
  };
}

function createSavedDeckChooserOption(deck: CloudArenaDeckSummary): CloudArenaDeckChooserOption {
  return {
    id: deck.id,
    label: deck.name,
    description: `${deck.cardCount} cards, ${deck.uniqueCardCount} unique`,
    kind: "saved",
  };
}

export function buildCloudArenaDeckChooserGroups(
  deckSummaries: CloudArenaDeckSummary[] | null,
  selectedDeckId: string,
): CloudArenaDeckChooserGroup[] {
  const availableDecks = deckSummaries ?? [];
  const presetOptions = availableDecks
    .filter((deck) => deck.kind === "preset")
    .map((deck) => ({
      id: deck.id,
      label: deck.name,
      description: `${deck.cardCount} cards, ${deck.uniqueCardCount} unique`,
      kind: deck.kind,
    }));
  const fallbackPresetOptions = CLOUD_ARENA_DECK_OPTIONS.map(createPresetDeckChooserOption);
  const savedDeckOptions = availableDecks
    .filter((deck) => deck.kind === "saved")
    .map(createSavedDeckChooserOption);
  const shouldInjectSelectedDeck =
    selectedDeckId.length > 0 &&
    !presetOptions.some((option) => option.id === selectedDeckId) &&
    !fallbackPresetOptions.some((option) => option.id === selectedDeckId) &&
    !savedDeckOptions.some((option) => option.id === selectedDeckId);

  const resolvedPresetOptions = presetOptions.length > 0 ? presetOptions : fallbackPresetOptions;
  const resolvedSavedDeckOptions = shouldInjectSelectedDeck
    ? [
        {
          id: selectedDeckId,
          label: `Saved deck ${selectedDeckId}`,
          description: "Selected from the battle setup URL",
          kind: "saved" as const,
        },
        ...savedDeckOptions,
      ]
    : savedDeckOptions;

  return [
    {
      label: "Built-in presets",
      options: resolvedPresetOptions,
    },
    {
      label: "Saved decks",
      options:
        resolvedSavedDeckOptions.length > 0
          ? resolvedSavedDeckOptions
          : [
              {
                id: "",
                label: "No saved decks yet",
                description: "Create a deck in the deck builder to use it here.",
                kind: "saved" as const,
                disabled: true,
              },
            ],
    },
  ];
}

export function getScenarioDraftFromUrl(search = globalThis.location?.search ?? ""): CloudArenaSessionScenarioId {
  const searchParams = new URLSearchParams(search);
  const queryValue = searchParams.get(CLOUD_ARENA_SCENARIO_QUERY_PARAM);

  if (queryValue && isCloudArenaSessionScenarioId(queryValue)) {
    return queryValue;
  }

  return "mixed_guardian";
}

export function getDeckDraftFromUrl(search = globalThis.location?.search ?? ""): string {
  const searchParams = new URLSearchParams(search);
  const queryValue = searchParams.get(CLOUD_ARENA_DECK_QUERY_PARAM);

  if (queryValue) {
    return queryValue;
  }

  return "master_deck";
}

export function createCloudArenaBattleSearch(deckId: string, scenarioId: CloudArenaSessionScenarioId): string {
  const searchParams = new URLSearchParams();
  searchParams.set(CLOUD_ARENA_DECK_QUERY_PARAM, deckId);
  searchParams.set(CLOUD_ARENA_SCENARIO_QUERY_PARAM, scenarioId);
  return `?${searchParams.toString()}`;
}

export function createCloudArenaBattleLocation(
  deckId: string,
  scenarioId: CloudArenaSessionScenarioId,
): {
  pathname: string;
  search: string;
} {
  return {
    pathname: CLOUD_ARENA_BATTLE_PATH,
    search: createCloudArenaBattleSearch(deckId, scenarioId),
  };
}

export const buildCloudArenaBattleLocation = createCloudArenaBattleLocation;
