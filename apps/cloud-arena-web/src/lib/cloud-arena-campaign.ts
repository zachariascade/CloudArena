import type { CardDefinitionId } from "../../../../src/cloud-arena/index.js";
import { cloudArenaDeckPresets } from "../../../../src/cloud-arena/index.js";
import type { CloudArenaSessionScenarioId, CloudArenaDeckCardEntry } from "../../../../src/cloud-arena/api-contract.js";
import { createCloudArenaLocalDeckRepository } from "./cloud-arena-local-decks.js";

export type CampaignLevelStatus = "locked" | "unlocked" | "complete";

export type CampaignLevel = {
  index: number;
  scenarioId: CloudArenaSessionScenarioId;
  label: string;
};

export type CampaignRun = {
  id: string;
  status: "in_progress" | "complete";
  currentLevelIndex: number;
  completedLevelIndices: number[];
  deckCardIds: CardDefinitionId[];
  savedDeckId: string;
  pendingRewardOptions: CardDefinitionId[] | null;
};

export const CAMPAIGN_LEVELS: CampaignLevel[] = [
  { index: 0, scenarioId: "demon_pack", label: "Demon Pack" },
  { index: 1, scenarioId: "lake_of_ice", label: "Cocytus, Lake of Ice" },
  { index: 2, scenarioId: "imp_caller", label: "Belzaphor's Swarm" },
  { index: 3, scenarioId: "malchior_binder_of_wills", label: "Malchior, Binder of Wills" },
];

export const CAMPAIGN_REWARD_POOL: CardDefinitionId[] = [
  "attack",
  "armory_disciple",
  "armory_seraph",
  "anointed_banner",
  "choir_captain",
  "defend",
  "defending_strike",
  "battlefield_insight",
  "focused_blessing",
  "forced_sacrifice",
  "forbidden_insight",
  "garden_of_earthly_delights",
  "graveyard_hymn",
  "guardian",
  "halt_buckler",
  "holy_blade",
  "judgment_blade",
  "mass_benediction",
  "refresh_signet",
  "restorative_touch",
  "resurrect",
  "sacrificial_seraph",
  "radiant_conduit",
  "sanctified_guide",
  "sapping_curse",
  "targeted_strike",
  "stunning_rebuke",
  "token_angel",
];

const CAMPAIGN_RUN_KEY = "cloud-arena-campaign-run";

function cardsToEntries(cardIds: CardDefinitionId[]): CloudArenaDeckCardEntry[] {
  const counts = new Map<string, number>();
  for (const id of cardIds) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([cardId, quantity]) => ({
    cardId: cardId as CardDefinitionId,
    quantity,
  }));
}

export function getLevelStatus(run: CampaignRun, levelIndex: number): CampaignLevelStatus {
  if (run.completedLevelIndices.includes(levelIndex)) return "complete";
  if (levelIndex === run.currentLevelIndex) return "unlocked";
  return "locked";
}

export function loadCampaignRun(): CampaignRun | null {
  try {
    const raw = localStorage.getItem(CAMPAIGN_RUN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CampaignRun;
  } catch {
    return null;
  }
}

export function saveCampaignRun(run: CampaignRun): void {
  localStorage.setItem(CAMPAIGN_RUN_KEY, JSON.stringify(run));
}

export function clearCampaignRun(): void {
  localStorage.removeItem(CAMPAIGN_RUN_KEY);
}

export function drawRewardOptions(): CardDefinitionId[] {
  const pool = [...CAMPAIGN_REWARD_POOL];
  const result: CardDefinitionId[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool[index]!);
    pool.splice(index, 1);
  }
  return result;
}

export async function createNewCampaignRun(): Promise<CampaignRun> {
  const starterCards = cloudArenaDeckPresets.wide_angels.cards as CardDefinitionId[];
  const repo = createCloudArenaLocalDeckRepository();
  const deck = await repo.createCloudArenaDeck({
    name: "Campaign Deck",
    cards: cardsToEntries(starterCards),
    tags: ["campaign"],
    notes: null,
  });
  const run: CampaignRun = {
    id: `campaign_${Date.now()}`,
    status: "in_progress",
    currentLevelIndex: 0,
    completedLevelIndices: [],
    deckCardIds: starterCards,
    savedDeckId: deck.data.id,
    pendingRewardOptions: null,
  };
  saveCampaignRun(run);
  return run;
}

export async function applyRewardChoice(
  run: CampaignRun,
  chosenCardId: CardDefinitionId,
): Promise<CampaignRun> {
  const newCardIds = [...run.deckCardIds, chosenCardId];
  const repo = createCloudArenaLocalDeckRepository();
  await repo.updateCloudArenaDeck(run.savedDeckId, {
    name: "Campaign Deck",
    cards: cardsToEntries(newCardIds),
    tags: ["campaign"],
    notes: null,
  });
  const nextLevelIndex = run.currentLevelIndex + 1;
  const isComplete = nextLevelIndex >= CAMPAIGN_LEVELS.length;
  const updatedRun: CampaignRun = {
    ...run,
    status: isComplete ? "complete" : "in_progress",
    currentLevelIndex: isComplete ? run.currentLevelIndex : nextLevelIndex,
    completedLevelIndices: [...run.completedLevelIndices, run.currentLevelIndex],
    deckCardIds: newCardIds,
    pendingRewardOptions: null,
  };
  saveCampaignRun(updatedRun);
  return updatedRun;
}
