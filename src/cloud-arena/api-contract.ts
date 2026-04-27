import type {
  ActivatedAbility,
  BattleAction,
  BattleEvent,
  BattlePhase,
  CardDefinitionId,
  CloudArenaDeckPresetId,
  EnemyIntent,
} from "./index.js";
export type { CloudArenaDeckPresetId } from "./index.js";

export const cloudArenaApiRoutes = {
  cloudArenaSessions: "/api/cloud-arena/sessions",
  cloudArenaSessionDetail: "/api/cloud-arena/sessions/:sessionId",
  cloudArenaSessionActions: "/api/cloud-arena/sessions/:sessionId/actions",
  cloudArenaSessionReset: "/api/cloud-arena/sessions/:sessionId/reset",
  cloudArenaCards: "/api/cloud-arena/cards",
  cloudArenaDecks: "/api/cloud-arena/decks",
  cloudArenaDeckDetail: "/api/cloud-arena/decks/:deckId",
} as const;

export type CloudArenaApiRouteName = keyof typeof cloudArenaApiRoutes;

export type CloudArenaSessionScenarioId =
  | "demon_pack"
  | "lake_of_ice"
  | "imp_caller"
  | "malchior_binder_of_wills"
  | "viper_shade";

export type CloudArenaDeckId = string;
export type CloudArenaDeckKind = "preset" | "saved";

export type CloudArenaCardListQuery = {
  q?: string;
  cardType?: string;
};

export type CloudArenaDeckListQuery = {
  q?: string;
  kind?: CloudArenaDeckKind;
  containsCardId?: string;
};

export type CloudArenaDeckRouteParams = {
  deckId: string;
};

export type CloudArenaCardSummary = {
  id: CardDefinitionId;
  name: string;
  cost: number;
  typeLine: string;
  cardTypes: string[];
  subtypes: string[];
  effectSummary: string;
};

export type CloudArenaDeckCardEntry = {
  cardId: CardDefinitionId;
  quantity: number;
};

export type CloudArenaDeckSummary = {
  id: CloudArenaDeckId;
  kind: CloudArenaDeckKind;
  name: string;
  cardCount: number;
  uniqueCardCount: number;
  tags: string[];
  notes: string | null;
};

export type CloudArenaDeckDetail = CloudArenaDeckSummary & {
  cards: CloudArenaDeckCardEntry[];
};

export type CloudArenaDeckWriteRequest = {
  name: string;
  cards: CloudArenaDeckCardEntry[];
  tags?: string[];
  notes?: string | null;
};

export type CloudArenaDeckDeleteResponse = {
  deckId: CloudArenaDeckId;
  deleted: true;
};

export type CloudArenaCreateSessionRequest = {
  scenarioId?: CloudArenaSessionScenarioId;
  deckId?: CloudArenaDeckId;
  seed?: number;
  shuffleDeck?: boolean;
  playerHealth?: number;
};

export type CloudArenaActionRequest = {
  action: BattleAction;
};

export type CloudArenaSessionRouteParams = {
  sessionId: string;
};

export type CloudArenaCardSnapshot = {
  instanceId: string;
  definitionId: CardDefinitionId;
  name: string;
  cost: number;
  effectSummary: string;
};

export type CloudArenaEnemyActorSnapshot = {
  id: string;
  definitionId: CardDefinitionId | null;
  name: string;
  health: number;
  maxHealth: number;
  block: number;
  intent: EnemyIntent;
  intentLabel: string;
  intentQueueLabels: string[];
  currentCardId: string | null;
  permanentId: string | null;
};

export type CloudArenaPermanentSnapshot = {
  instanceId: string;
  sourceCardInstanceId: string;
  definitionId: CardDefinitionId;
  name: string;
  controllerId?: string;
  intentLabel?: string | null;
  intentQueueLabels?: string[] | null;
  isEnemyLeader?: boolean;
  isCreature: boolean;
  power: number;
  health: number;
  maxHealth: number;
  block: number;
  counters?: Record<string, number>;
  attachments?: string[];
  attachedTo?: string | null;
  hasActedThisTurn: boolean;
  isTapped: boolean;
  isDefending: boolean;
  blockingTargetPermanentId?: string | null;
  slotIndex: number;
  actions: ActivatedAbility[];
};

export type CloudArenaPendingTargetRequestSnapshot = {
  id: string;
  prompt: string;
  optional: boolean;
  targetKind: "permanent" | "card";
  selector: {
    zone?: string;
    controller?: string;
    cardType?: string;
    subtype?: string;
    relation?: string;
    source?: string;
  };
  context?: {
    abilitySourcePermanentId?: string;
    sourceCardInstanceId?: string;
    defendingPermanentId?: string;
    pendingCardPlay?: CloudArenaCardSnapshot;
    pendingCardPlayHandIndex?: number;
  };
};

export type CloudArenaActionOption = {
  action: BattleAction;
  label: string;
  source: "hand" | "battlefield" | "turn";
};

export type CloudArenaSessionActionRecord = {
  action: BattleAction;
  turnNumber: number;
  phase: BattlePhase;
};

export type CloudArenaSessionResetSource = {
  scenarioId: CloudArenaSessionScenarioId;
  deckId: CloudArenaDeckId | null;
  seed: number;
};

export type CloudArenaSessionSnapshot = {
  sessionId: string;
  scenarioId: CloudArenaSessionScenarioId;
  deckId: CloudArenaDeckId | null;
  status: "active" | "finished";
  turnNumber: number;
  phase: BattlePhase;
  seed: number;
  createdAt: string;
  resetSource: CloudArenaSessionResetSource;
  player: {
    health: number;
    maxHealth: number;
    block: number;
    energy: number;
    hand: CloudArenaCardSnapshot[];
    drawPile: CloudArenaCardSnapshot[];
    drawPileCount: number;
    discardPile: CloudArenaCardSnapshot[];
    graveyard: CloudArenaCardSnapshot[];
  };
  enemy: {
    name: string;
    health: number;
    maxHealth: number;
    block: number;
    leaderDefinitionId?: CardDefinitionId | null;
    currentCardId?: string | null;
    intent: EnemyIntent;
    intentLabel: string;
    intentQueueLabels: string[];
  };
  enemies: CloudArenaEnemyActorSnapshot[];
  creatureBattlefieldSlotCount: number;
  nonCreatureBattlefieldSlotCount: number;
  battlefield: Array<CloudArenaPermanentSnapshot | null>;
  enemyBattlefield: Array<CloudArenaPermanentSnapshot | null>;
  pendingTargetRequest: CloudArenaPendingTargetRequestSnapshot | null;
  blockingQueue: string[];
  legalActions: CloudArenaActionOption[];
  actionHistory: CloudArenaSessionActionRecord[];
  log: BattleEvent[];
};

export type CloudArenaApiSuccessResponse<T> = {
  data: T;
};

export type CloudArenaApiContracts = {
  cloudArenaSessions: {
    route: typeof cloudArenaApiRoutes.cloudArenaSessions;
    query: undefined;
    params: undefined;
    response: CloudArenaApiSuccessResponse<CloudArenaSessionSnapshot>;
  };
  cloudArenaSessionDetail: {
    route: typeof cloudArenaApiRoutes.cloudArenaSessionDetail;
    query: undefined;
    params: CloudArenaSessionRouteParams;
    response: CloudArenaApiSuccessResponse<CloudArenaSessionSnapshot>;
  };
  cloudArenaSessionActions: {
    route: typeof cloudArenaApiRoutes.cloudArenaSessionActions;
    query: undefined;
    params: CloudArenaSessionRouteParams;
    response: CloudArenaApiSuccessResponse<CloudArenaSessionSnapshot>;
  };
  cloudArenaSessionReset: {
    route: typeof cloudArenaApiRoutes.cloudArenaSessionReset;
    query: undefined;
    params: CloudArenaSessionRouteParams;
    response: CloudArenaApiSuccessResponse<CloudArenaSessionSnapshot>;
  };
  cloudArenaCards: {
    route: typeof cloudArenaApiRoutes.cloudArenaCards;
    query: CloudArenaCardListQuery;
    params: undefined;
    response: CloudArenaApiSuccessResponse<CloudArenaCardSummary[]>;
  };
  cloudArenaDecks: {
    route: typeof cloudArenaApiRoutes.cloudArenaDecks;
    query: CloudArenaDeckListQuery;
    params: undefined;
    response: CloudArenaApiSuccessResponse<CloudArenaDeckSummary[]>;
  };
  cloudArenaDeckDetail: {
    route: typeof cloudArenaApiRoutes.cloudArenaDeckDetail;
    query: undefined;
    params: CloudArenaDeckRouteParams;
    response: CloudArenaApiSuccessResponse<CloudArenaDeckDetail>;
  };
  cloudArenaDeckDelete: {
    route: typeof cloudArenaApiRoutes.cloudArenaDeckDetail;
    query: undefined;
    params: CloudArenaDeckRouteParams;
    response: CloudArenaApiSuccessResponse<CloudArenaDeckDeleteResponse>;
  };
};

export type CloudArenaApiContractName = keyof CloudArenaApiContracts;

export type CloudArenaApiResponse<TName extends CloudArenaApiContractName> =
  CloudArenaApiContracts[TName]["response"];

export function buildCloudArenaSessionsPath(): string {
  return "/api/cloud-arena/sessions";
}

export function buildCloudArenaSessionPath(sessionId: string): string {
  return `/api/cloud-arena/sessions/${sessionId}`;
}

export function buildCloudArenaSessionActionsPath(sessionId: string): string {
  return `/api/cloud-arena/sessions/${sessionId}/actions`;
}

export function buildCloudArenaSessionResetPath(sessionId: string): string {
  return `/api/cloud-arena/sessions/${sessionId}/reset`;
}

export function buildCloudArenaCardsPath(): string {
  return "/api/cloud-arena/cards";
}

export function buildCloudArenaDecksPath(): string {
  return "/api/cloud-arena/decks";
}

export function buildCloudArenaDeckPath(deckId: string): string {
  return `/api/cloud-arena/decks/${deckId}`;
}
