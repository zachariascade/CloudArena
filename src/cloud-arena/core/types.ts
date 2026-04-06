export type BattlePhase = "player_action" | "enemy_resolution" | "finished";

export type CardDefinitionId = string;
export type PermanentActionMode = "attack" | "defend";
export type EffectTarget = "player" | "enemy";
export type CardType = "instant" | "permanent";

export type CardEffect = {
  attackAmount?: number;
  attackTimes?: number;
  blockAmount?: number;
  summonSelf?: boolean;
  target: EffectTarget;
};

export type PermanentActionDefinition = {
  attackAmount?: number;
  attackTimes?: number;
  blockAmount?: number;
};

export type BattleEvent =
  | {
      type: "battle_created";
      turnNumber: number;
    }
  | {
      type: "turn_started";
      turnNumber: number;
      cardsDrawn: number;
      energy: number;
      enemyIntent: EnemyIntent;
    }
  | {
      type: "card_drawn";
      turnNumber: number;
      cardId: CardDefinitionId;
    }
  | {
      type: "card_played";
      turnNumber: number;
      cardId: CardDefinitionId;
    }
  | {
      type: "enemy_card_played";
      turnNumber: number;
      cardId: string;
    }
  | {
      type: "block_gained";
      turnNumber: number;
      target: "player" | "enemy" | "permanent";
      targetId?: string;
      amount: number;
    }
  | {
      type: "damage_dealt";
      turnNumber: number;
      source: "card" | "enemy_intent" | "permanent_action";
      sourceId?: string;
      target: "player" | "enemy" | "permanent";
      targetId?: string;
      amount: number;
    }
  | {
      type: "permanent_summoned";
      turnNumber: number;
      permanentId: string;
      definitionId: CardDefinitionId;
      slotIndex: number;
    }
  | {
      type: "permanent_acted";
      turnNumber: number;
      permanentId: string;
      action: PermanentActionMode;
    }
  | {
      type: "enemy_intent_resolved";
      turnNumber: number;
      intent: EnemyIntent;
    }
  | {
      type: "permanent_destroyed";
      turnNumber: number;
      permanentId: string;
      definitionId: CardDefinitionId;
    }
  | {
      type: "turn_ended";
      turnNumber: number;
    }
  | {
      type: "battle_finished";
      turnNumber: number;
      winner: "player" | "enemy";
      playerHealth: number;
      enemyHealth: number;
      permanents: Array<{
        permanentId: string;
        health: number;
        maxHealth: number;
      }>;
    };

export type BaseCardDefinition = {
  id: CardDefinitionId;
  name: string;
  cost: number;
  onPlay: CardEffect[];
};

export type InstantCardDefinition = BaseCardDefinition & {
  type: "instant";
};

export type PermanentCardDefinition = BaseCardDefinition & {
  type: "permanent";
  health: number;
  actions: PermanentActionDefinition[];
};

export type CardDefinition = InstantCardDefinition | PermanentCardDefinition;

export type CardDefinitionLibrary = Record<CardDefinitionId, CardDefinition>;

export type EnemyCardDefinition = {
  id: string;
  name: string;
  effects: Array<{
    attackAmount?: number;
    attackTimes?: number;
    blockAmount?: number;
    target: EffectTarget;
  }>;
};

export type CardInstance = {
  instanceId: string;
  definitionId: CardDefinitionId;
};

export type EnemyIntent = {
  attackAmount?: number;
  attackTimes?: number;
  blockAmount?: number;
};

export type EnemyBehaviorStep = EnemyIntent;

export type EnemyState = {
  name: string;
  health: number;
  maxHealth: number;
  block: number;
  basePower: number;
  intent: EnemyIntent;
  behavior: EnemyBehaviorStep[];
  cards: EnemyCardDefinition[];
  behaviorIndex: number;
  currentCard: EnemyCardDefinition | null;
};

export type PlayerState = {
  health: number;
  maxHealth: number;
  block: number;
  energy: number;
  drawPile: CardInstance[];
  hand: CardInstance[];
  discardPile: CardInstance[];
  graveyard: CardInstance[];
};

export type PermanentState = {
  instanceId: string;
  sourceCardInstanceId: string;
  name: string;
  definitionId: CardDefinitionId;
  health: number;
  maxHealth: number;
  block: number;
  actions: PermanentActionDefinition[];
  hasActedThisTurn: boolean;
  isDefending: boolean;
  slotIndex: number;
};

export type BattleState = {
  turnNumber: number;
  phase: BattlePhase;
  seed: number;
  cardDefinitions: CardDefinitionLibrary;
  player: PlayerState;
  enemy: EnemyState;
  battlefield: Array<PermanentState | null>;
  blockingQueue: string[];
  log: BattleEvent[];
};

export type PlayCardAction = {
  type: "play_card";
  cardInstanceId: string;
};

export type UsePermanentAction = {
  type: "use_permanent_action";
  permanentId: string;
  action: PermanentActionMode;
};

export type EndTurnAction = {
  type: "end_turn";
};

export type BattleAction =
  | PlayCardAction
  | UsePermanentAction
  | EndTurnAction;

export type BehaviorEnemyConfig = {
  name: string;
  health: number;
  basePower: number;
  behavior: EnemyBehaviorStep[];
  cards?: never;
};

export type CardEnemyConfig = {
  name: string;
  health: number;
  basePower: number;
  cards: EnemyCardDefinition[];
  behavior?: never;
};

export type CreateBattleEnemyConfig = BehaviorEnemyConfig | CardEnemyConfig;

export type CreateBattleInput = {
  seed?: number;
  playerHealth?: number;
  cardDefinitions?: CardDefinitionLibrary;
  playerDeck: CardDefinitionId[];
  enemy: CreateBattleEnemyConfig;
};
