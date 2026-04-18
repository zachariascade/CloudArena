import type {
  ActivatedAbility,
  BattleAction,
  BattleEvent,
  BattlePhase,
  CardDefinitionId,
  EnemyIntent,
} from "./index.js";

export const cloudArenaApiRoutes = {
  cloudArenaSessions: "/api/cloud-arena/sessions",
  cloudArenaSessionDetail: "/api/cloud-arena/sessions/:sessionId",
  cloudArenaSessionActions: "/api/cloud-arena/sessions/:sessionId/actions",
  cloudArenaSessionReset: "/api/cloud-arena/sessions/:sessionId/reset",
} as const;

export type CloudArenaApiRouteName = keyof typeof cloudArenaApiRoutes;

export type CloudArenaSessionScenarioId =
  | "mixed_guardian"
  | "demon_pack"
  | "grunt_demon"
  | "imp_caller";

export type CloudArenaCreateSessionRequest = {
  scenarioId?: CloudArenaSessionScenarioId;
  seed?: number;
  shuffleDeck?: boolean;
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

export type CloudArenaPermanentSnapshot = {
  instanceId: string;
  sourceCardInstanceId: string;
  definitionId: CardDefinitionId;
  name: string;
  controllerId?: string;
  intentLabel?: string | null;
  intentQueueLabels?: string[] | null;
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
  slotIndex: number;
  actions: ActivatedAbility[];
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
  seed: number;
};

export type CloudArenaSessionSnapshot = {
  sessionId: string;
  scenarioId: CloudArenaSessionScenarioId;
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
    intent: EnemyIntent;
    intentLabel: string;
    intentQueueLabels: string[];
  };
  battlefield: Array<CloudArenaPermanentSnapshot | null>;
  enemyBattlefield: Array<CloudArenaPermanentSnapshot | null>;
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
