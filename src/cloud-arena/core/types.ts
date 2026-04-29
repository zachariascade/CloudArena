export type BattlePhase = "player_action" | "enemy_resolution" | "finished";

export type CardDefinitionId = string;
export type EffectTarget = "player" | "enemy";
export type PermanentCardType =
  | "artifact"
  | "battle"
  | "creature"
  | "enchantment"
  | "land"
  | "planeswalker";
export type NonPermanentCardType = "instant" | "sorcery";
export type CardType = PermanentCardType | NonPermanentCardType;
export type SelectorCardType = CardType | "permanent" | "equipment";
export type AbilityKind = "triggered" | "activated" | "static" | "replacement";
export type ActivatedAbilityActionId = string;
export type RulesActionId = "attack" | "defend";
export type ZoneName = "battlefield" | "enemy_battlefield" | "hand" | "graveyard" | "discard";
export type SelectorController = "you" | "opponent" | "any";
export type SelectorRelation = "self" | "another";
export type SelectorSource = "trigger_subject" | "ability_source";
export type ConditionOperator = "==" | "!=" | ">" | ">=" | "<" | "<=";
export type CounterName = string;
export type DerivedStatName = "power" | "health" | "block";
export type ChoiceStrategy = "first_available" | "auto_yes" | "auto_no";
export type DamageOverflowPolicy = "overflow" | "stop_at_blocker" | "trample";
export type DefenderRecoveryPolicy = "none" | "full_heal";
export type DrawPolicy = "full_refresh" | "draw_to_full" | "draw_one";
export type SummoningSicknessPolicy = "enabled" | "disabled";
export type PermanentKeyword =
  | "refresh"
  | "halt"
  | "menace"
  | "deathtouch"
  | "pierce"
  | "hexproof"
  | "indestructible";
export type CounterStat = "power" | "health";
export type CounterSourceKind = "card" | "permanent";
export type ModifierSourceKind = "equipment" | "card" | "permanent";
export type EnemyEffectResolveTiming = "immediate" | "end_of_player_turn" | "start_of_next_turn";
export type Targeting = {
  prompt?: string;
  optional?: boolean;
  allowSelfTarget?: boolean;
};

export type PendingHandCardContext = {
  cardInstanceId: string;
  definitionId: CardDefinitionId;
  handIndex: number;
};

export type AbilityCost =
  | {
      type: "energy";
      amount: number;
    }
  | {
      type: "tap";
    };

export type CardEffect = {
  attackAmount?: number;
  attackTimes?: number;
  blockAmount?: number;
  summonSelf?: boolean;
  target: EffectTarget | Selector;
  targeting?: Targeting;
};

export type ActionAbilityActivation = {
  type: "action";
  actionId: ActivatedAbilityActionId;
};

export type Selector = {
  zone?: ZoneName;
  controller?: SelectorController;
  cardType?: SelectorCardType;
  subtype?: string;
  relation?: SelectorRelation;
  source?: SelectorSource;
  defending?: boolean;
};

export type PendingTargetRequest = {
  id: string;
  prompt: string;
  optional: boolean;
  targetKind: "permanent" | "card";
  selector: Selector;
  effects: Effect[];
  nextEffectIndex: number;
  abilityCosts?: AbilityCost[];
  context: {
    abilitySourcePermanentId?: string;
    triggerSubjectPermanentId?: string;
    sourceCardInstanceId?: string;
    attackBypassesBlock?: boolean;
    defendingPermanentId?: string;
    pendingCardPlay?: PendingHandCardContext;
    pendingCardPreview?: PendingHandCardContext;
  };
};

export type ValueExpression =
  | {
      type: "constant";
      value: number;
    }
  | {
      type: "count";
      selector: Selector;
    }
  | {
      type: "counter_count";
      target: "self";
      counter: CounterName;
      stat?: CounterStat;
    }
  | {
      type: "property";
      target: "self" | "trigger_subject";
      property: DerivedStatName;
    };

export type Condition =
  | {
      type: "exists";
      selector: Selector;
    }
  | {
      type: "threshold";
      selector: Selector;
      op?: ConditionOperator;
      value: number;
    }
  | {
      type: "compare";
      left: ValueExpression;
      op: ConditionOperator;
      right: ValueExpression;
    };

export type Trigger =
  | {
      event: "self_enters_battlefield";
    }
  | {
      event: "permanent_enters_battlefield";
      selector?: Selector;
    }
  | {
      event: "permanent_died";
      selector?: Selector;
    }
  | {
      event: "permanent_left_battlefield";
      selector?: Selector;
    }
  | {
      event: "permanent_attacked";
      selector?: Selector;
    }
  | {
      event: "permanent_blocked";
      selector?: Selector;
    }
  | {
      event: "permanent_becomes_blocked";
      selector?: Selector;
    }
  | {
      event: "counter_added";
      selector?: Selector;
      counter?: CounterName;
      stat?: CounterStat;
    }
  | {
      event: "card_drawn";
      selector?: Selector;
    }
  | {
      event: "card_played";
      selector?: Selector;
    }
  | {
      event: "spell_cast";
      selector?: Selector;
    }
  | {
      event: "card_discarded";
      selector?: Selector;
    }
  | {
      event: "turn_started";
      player: "self" | "controller" | "opponent";
    };

export type Effect =
  | {
      type: "sacrifice";
      selector: Selector;
      amount: number;
      choice: "controller";
      targeting?: Targeting;
    }
  | {
      type: "add_counter";
      target: "self" | Selector;
      powerDelta?: number;
      healthDelta?: number;
      counter?: CounterName;
      stat?: CounterStat;
      amount?: ValueExpression;
      duration?: "end_of_turn";
      targeting?: Targeting;
    }
  | {
      type: "grant_keyword";
      target: "self" | Selector;
      keyword: PermanentKeyword;
      duration?: "end_of_turn";
      targeting?: Targeting;
    }
  | {
      type: "remove_counter";
      target: "self" | Selector;
      counterId?: string;
      counter: CounterName;
      stat?: CounterStat;
      sourceKind?: CounterSourceKind;
      sourceId?: string;
      amount: ValueExpression;
      targeting?: Targeting;
    }
  | {
      type: "deal_damage";
      target: "enemy" | "player" | Selector;
      amount: ValueExpression;
      targeting?: Targeting;
    }
  | {
      type: "gain_block";
      target: "self" | "player" | Selector;
      amount: ValueExpression;
      targeting?: Targeting;
    }
  | {
      type: "restore_health";
      target: "self" | Selector;
      targeting?: Targeting;
    }
  | {
      type: "draw_card";
      target: "self" | "player";
      amount: ValueExpression;
      targeting?: Targeting;
    }
  | {
      type: "gain_energy";
      target: "player";
      amount: ValueExpression;
      targeting?: Targeting;
    }
  | {
      type: "summon_permanent";
      cardId: CardDefinitionId;
      amount?: ValueExpression;
      controllerId?: "player" | "enemy";
    }
  | {
      type: "attach_from_hand";
      selector: Selector;
      target: "self" | Selector;
      optional: boolean;
      cost: "free";
    }
  | {
      type: "attach_from_battlefield";
      target: "self" | Selector;
      targeting?: Targeting;
    }
  | {
      type: "return_from_graveyard";
      selector: Selector;
      targeting?: Targeting;
    }
  | {
      type: "stun";
      target: "enemy";
    };

export type StatModifier = {
  target: "self";
  stat: DerivedStatName;
  operation: "add" | "set";
  value: ValueExpression;
};

export type TriggeredAbility = {
  id?: string;
  kind: "triggered";
  trigger: Trigger;
  conditions?: Condition[];
  effects?: Effect[];
};

export type ActivatedAbility = {
  id: string;
  kind: "activated";
  activation: ActionAbilityActivation;
  costs?: AbilityCost[];
  conditions?: Condition[];
  effects: Effect[];
  targeting?: Targeting;
};

export type StaticAbility = {
  id?: string;
  kind: "static";
  modifier: StatModifier;
};

export type ReplacementAbility = {
  id?: string;
  kind: "replacement";
  conditions?: Condition[];
  effects?: Effect[];
};

export type Ability =
  | TriggeredAbility
  | ActivatedAbility
  | StaticAbility
  | ReplacementAbility;

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
      type: "spell_cast";
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
      type: "energy_gained";
      turnNumber: number;
      target: "player";
      amount: number;
      source: "card" | "enemy_intent" | "permanent_action" | "ability";
      sourceId?: string;
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
      controllerId?: "player" | "enemy";
    }
  | {
      type: "permanent_acted";
      turnNumber: number;
      permanentId: string;
      source: "ability" | "rules";
      action: ActivatedAbilityActionId | RulesActionId;
      abilityId?: string;
    }
  | {
      type: "enemy_intent_resolved";
      turnNumber: number;
      intent: EnemyIntent;
    }
  | {
      type: "enemy_power_gained";
      turnNumber: number;
      amount: number;
      newBasePower: number;
    }
  | {
      type: "enemy_stunned";
      turnNumber: number;
    }
  | {
      type: "permanent_destroyed";
      turnNumber: number;
      permanentId: string;
      definitionId: CardDefinitionId;
      controllerId?: "player" | "enemy";
    }
  | {
      type: "counter_added";
      turnNumber: number;
      permanentId: string;
      counterId: string;
      counter: CounterName;
      stat: CounterStat;
      amount: number;
      sourceKind: CounterSourceKind;
      sourceId: string;
    }
  | {
      type: "counter_removed";
      turnNumber: number;
      permanentId: string;
      counterId: string;
      counter: CounterName;
      stat: CounterStat;
      amount: number;
      sourceKind: CounterSourceKind;
      sourceId: string;
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

export type RulesEvent =
  | {
      type: "card_played";
      turnNumber: number;
      cardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
    }
  | {
      type: "spell_cast";
      turnNumber: number;
      cardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
    }
  | {
      type: "card_drawn";
      turnNumber: number;
      cardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
    }
  | {
      type: "card_discarded";
      turnNumber: number;
      cardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
    }
  | {
      type: "turn_started";
      turnNumber: number;
      player: "self" | "controller" | "opponent";
    }
  | {
      type: "permanent_entered";
      turnNumber: number;
      permanentId: string;
      sourceCardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
      slotIndex: number;
    }
  | {
      type: "permanent_died";
      turnNumber: number;
      permanentId: string;
      sourceCardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
      slotIndex: number;
    }
  | {
      type: "permanent_left_battlefield";
      turnNumber: number;
      permanentId: string;
      sourceCardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
      slotIndex: number;
    }
  | {
      type: "permanent_attacked";
      turnNumber: number;
      permanentId: string;
      sourceCardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
      slotIndex: number;
    }
  | {
      type: "permanent_blocked";
      turnNumber: number;
      permanentId: string;
      sourceCardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
      slotIndex: number;
    }
  | {
      type: "permanent_becomes_blocked";
      turnNumber: number;
      permanentId: string;
      sourceCardInstanceId: string;
      definitionId: CardDefinitionId;
      controllerId: string;
      slotIndex: number;
    }
  | {
      type: "counter_added";
      turnNumber: number;
      permanentId: string;
      counterId: string;
      counter: CounterName;
      stat: CounterStat;
      amount: number;
      sourceKind: CounterSourceKind;
      sourceId: string;
    }
  | {
      type: "counter_removed";
      turnNumber: number;
      permanentId: string;
      counterId: string;
      counter: CounterName;
      stat: CounterStat;
      amount: number;
      sourceKind: CounterSourceKind;
      sourceId: string;
    }
  | {
      type: "attachment_attached";
      turnNumber: number;
      attachmentId: string;
      targetPermanentId: string;
    };

export type ChoiceOption = {
  id: string;
  label: string;
};

export type ChoiceRecord = {
  id: string;
  turnNumber: number;
  controllerId: string;
  kind: "select_permanents" | "select_hand_card" | "select_graveyard_card" | "optional_effect";
  reason: string;
  optional: boolean;
  options: ChoiceOption[];
  selectedIds: string[];
  strategy: ChoiceStrategy;
};

export type CardDisplayDefinition = {
  title: string | null;
  frameTone: string;
  imagePath?: string;
  imageAlt?: string;
  artist?: string | null;
  flavorText?: string | null;
  footerCode: string;
  footerCredit: string;
  collectorNumber: string;
};

export type BaseCardDefinition = {
  id: CardDefinitionId;
  name: string;
  cost: number;
  manaCost?: string | null;
  cardTypes: CardType[];
  subtypes?: string[];
  rarity?: "common" | "uncommon" | "rare" | "mythic" | "special" | "bonus" | null;
  display?: CardDisplayDefinition;
  onPlay: CardEffect[];
  spellEffects?: Effect[];
  abilities?: Ability[];
  playableInPlayerDecks?: boolean;
};

export type SpellCardDefinition = BaseCardDefinition & {
  cardTypes: NonPermanentCardType[];
};

export type PermanentCardDefinition = BaseCardDefinition & {
  cardTypes: PermanentCardType[];
  power: number;
  health: number;
  recoveryPolicy?: DefenderRecoveryPolicy;
  keywords?: PermanentKeyword[];
  grantedKeywords?: PermanentKeyword[];
  preSummonEffects?: Effect[];
  attackAllEnemyPermanents?: boolean;
};

export type CardDefinition = SpellCardDefinition | PermanentCardDefinition;

export type CardDefinitionLibrary = Record<CardDefinitionId, CardDefinition>;

export type EnemyCardEffect = {
  attackAmount?: number;
  attackTimes?: number;
  attackPowerMultiplier?: number;
  bypassBlock?: boolean;
  blockAmount?: number;
  blockPowerMultiplier?: number;
  blockHealthMultiplier?: number;
  energyDelta?: number;
  powerDelta?: number;
  powerDeltaTargetPermanents?: number;
  powerDeltaAllPermanents?: number;
  overflowPolicy?: DamageOverflowPolicy;
  spawnCardId?: CardDefinitionId;
  spawnCount?: number;
  controllerId?: "player" | "enemy";
  target: EffectTarget;
  resolveTiming?: EnemyEffectResolveTiming;
};

export type EnemyCardDefinition = {
  id: string;
  name: string;
  effects: EnemyCardEffect[];
};

export type CardInstance = {
  instanceId: string;
  definitionId: CardDefinitionId;
};

export type EnemyIntent = {
  attackAmount?: number;
  attackTimes?: number;
  blockAmount?: number;
  blockHealthMultiplier?: number;
  energyDelta?: number;
  powerDelta?: number;
  powerDeltaTargetPermanents?: number;
  powerDeltaAllPermanents?: number;
  overflowPolicy?: DamageOverflowPolicy;
  spawnCardId?: CardDefinitionId;
  spawnCount?: number;
};

export type EnemyBehaviorStep = EnemyIntent;

export type EnemyActorState = {
  id: string;
  definitionId: CardDefinitionId | null;
  name: string;
  health: number;
  maxHealth: number;
  block: number;
  basePower: number;
  intent: EnemyIntent;
  intentQueueLabels: string[];
  behavior: EnemyBehaviorStep[];
  cards: EnemyCardDefinition[];
  behaviorIndex: number;
  currentCardId: string | null;
  currentCard: EnemyCardDefinition | null;
  permanentId: string | null;
  stunnedThisTurn: boolean;
};

export type ScheduledEnemyCardEffect = {
  sourceCardId: string;
  sourceCardName: string;
  effect: EnemyCardEffect;
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
  controllerId?: "player" | "enemy";
  enemyActorId?: string | null;
  intentLabel?: string | null;
  intentQueueLabels?: string[] | null;
  power: number;
  health: number;
  maxHealth: number;
  block: number;
  recoveryPolicy: DefenderRecoveryPolicy;
  enteredBattlefieldTurnNumber?: number;
  keywords: PermanentKeyword[];
  counters?: PermanentCounter[];
  modifiers?: PermanentModifier[];
  keywordModifiers?: PermanentKeywordModifier[];
  attachments?: string[];
  attachedTo?: string | null;
  abilities?: Ability[];
  disabledAbilityIds?: string[];
  disabledRulesActions?: RulesActionId[];
  hasActedThisTurn: boolean;
  isTapped: boolean;
  isDefending: boolean;
  blockingTargetPermanentId: string | null;
  slotIndex: number;
};

export type PermanentCounter = {
  id: string;
  counter: CounterName;
  stat: CounterStat;
  amount: number;
  sourceKind: CounterSourceKind;
  sourceId: string;
};

export type PermanentModifier = {
  id: string;
  stat: CounterStat;
  amount: number;
  sourceKind: ModifierSourceKind;
  sourceId: string;
};

export type PermanentKeywordModifier = {
  keyword: PermanentKeyword;
  sourceKind: ModifierSourceKind;
  sourceId: string;
  expiresAtTurnNumber?: number;
};

export type BattleState = {
  turnNumber: number;
  phase: BattlePhase;
  seed: number;
  nextCounterIndex: number;
  nextEnemyTokenIndex: number;
  nextTargetRequestIndex: number;
  cardDefinitions: CardDefinitionLibrary;
  handSize: number;
  drawPolicy: DrawPolicy;
  summoningSicknessPolicy: SummoningSicknessPolicy;
  playerCreatureSlotCount: number;
  playerNonCreatureSlotCount: number;
  enemyCreatureSlotCount: number;
  enemyNonCreatureSlotCount: number;
  player: PlayerState;
  enemies: EnemyActorState[];
  battlefield: Array<PermanentState | null>;
  enemyBattlefield: Array<PermanentState | null>;
  pendingTargetRequest?: PendingTargetRequest | null;
  blockingQueue: string[];
  log: BattleEvent[];
  rules: RulesEvent[];
  rulesCursor: number;
  choices: ChoiceRecord[];
  temporaryCounters: Array<{
    id: string;
    expiresAtTurnNumber: number;
  }>;
  scheduledEnemyCardEffects: ScheduledEnemyCardEffect[];
};

export type PlayCardAction = {
  type: "play_card";
  cardInstanceId: string;
};

export type UsePermanentAction = {
  type: "use_permanent_action";
  permanentId: string;
  source?: "ability" | "rules";
  action: ActivatedAbilityActionId | RulesActionId;
  abilityId?: string;
};

export type EndTurnAction = {
  type: "end_turn";
};

export type BattleAction =
  | PlayCardAction
  | {
      type: "choose_target";
      targetPermanentId: string;
    }
  | {
      type: "choose_card";
      targetCardInstanceId: string;
    }
  | UsePermanentAction
  | EndTurnAction
  | {
      type: "debug_end_battle";
      winner: "player" | "enemy";
    };

export type BehaviorEnemyConfig = {
  name: string;
  health: number;
  basePower: number;
  behavior: EnemyBehaviorStep[];
  startingTokens?: CardDefinitionId[];
  startingPermanents?: CardDefinitionId[];
  cards?: never;
};

export type CardEnemyConfig = {
  name: string;
  health: number;
  basePower: number;
  cards: EnemyCardDefinition[];
  startingTokens?: CardDefinitionId[];
  startingPermanents?: CardDefinitionId[];
  behavior?: never;
};

export type CreateBattleEnemyConfig = BehaviorEnemyConfig | CardEnemyConfig;

export type CreateBattleEnemyInput = CreateBattleEnemyConfig & {
  definitionId?: CardDefinitionId;
};

export type CreateBattleInput = {
  seed?: number;
  playerHealth?: number;
  handSize?: number;
  drawPolicy?: DrawPolicy;
  summoningSicknessPolicy?: SummoningSicknessPolicy;
  cardDefinitions?: CardDefinitionLibrary;
  playerDeck: CardDefinitionId[];
  shuffleDeck?: boolean;
  enemies?: CreateBattleEnemyInput[];
  enemy?: CreateBattleEnemyInput;
};
