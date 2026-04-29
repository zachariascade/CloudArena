import {
  asPermanentCardDefinition,
  getCardDefinitionFromLibrary,
  hasCardType,
  isEquipmentCardDefinition,
} from "../cards/definitions.js";
import {
  LEAN_V1_DEFAULT_RECOVERY_POLICY,
} from "./constants.js";
import { emitRulesEvent } from "./rules-events.js";
import type {
  Ability,
  ActivatedAbility,
  BattleState,
  CardInstance,
  CardDefinitionId,
  EnemyActorState,
  PermanentKeyword,
  PermanentKeywordModifier,
  PermanentState,
} from "./types.js";

export function adjustPermanentHealth(
  permanent: PermanentState,
  delta: number,
): void {
  if (delta === 0) {
    return;
  }

  const nextMaxHealth = Math.max(0, permanent.maxHealth + delta);
  const nextHealth = Math.max(0, Math.min(permanent.health + delta, nextMaxHealth));
  permanent.maxHealth = nextMaxHealth;
  permanent.health = nextHealth;
}

export function scaleEquipmentBonusAmount(amount: number): number {
  return amount;
}

function createEquipmentModifierId(attachmentPermanentId: string, stat: "power" | "health"): string {
  return `modifier_${attachmentPermanentId}_${stat}`;
}

function getEquipmentModifiersForAttachment(
  state: BattleState,
  attachmentPermanent: PermanentState,
): Array<{
  id: string;
  stat: "power" | "health";
  amount: number;
  sourceKind: "equipment";
  sourceId: string;
}> {
  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, attachmentPermanent.definitionId),
  );

  if (!isEquipmentCardDefinition(definition)) {
    return [];
  }

  return [
    ...(definition.power !== 0
      ? [{
          id: createEquipmentModifierId(attachmentPermanent.instanceId, "power"),
          stat: "power" as const,
          amount: definition.power,
          sourceKind: "equipment" as const,
          sourceId: attachmentPermanent.instanceId,
        }]
      : []),
    ...(definition.health !== 0
      ? [{
          id: createEquipmentModifierId(attachmentPermanent.instanceId, "health"),
          stat: "health" as const,
          amount: definition.health,
          sourceKind: "equipment" as const,
          sourceId: attachmentPermanent.instanceId,
        }]
      : []),
  ];
}

function getEquipmentKeywordModifiersForAttachment(
  state: BattleState,
  attachmentPermanent: PermanentState,
): PermanentKeywordModifier[] {
  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, attachmentPermanent.definitionId),
  );

  if (!isEquipmentCardDefinition(definition)) {
    return [];
  }

  return (definition.grantedKeywords ?? []).map((keyword) => ({
    keyword,
    sourceKind: "equipment",
    sourceId: attachmentPermanent.instanceId,
  }));
}

function removeSourceModifiers(
  permanent: PermanentState,
  sourceKind: "equipment",
  sourceId: string,
): Array<{ stat: "power" | "health"; amount: number }> {
  const retainedModifiers: NonNullable<PermanentState["modifiers"]> = [];
  const removedModifiers: Array<{ stat: "power" | "health"; amount: number }> = [];

  for (const modifier of permanent.modifiers ?? []) {
    if (modifier.sourceKind === sourceKind && modifier.sourceId === sourceId) {
      removedModifiers.push({
        stat: modifier.stat,
        amount: modifier.amount,
      });
      continue;
    }

    retainedModifiers.push(modifier);
  }

  permanent.modifiers = retainedModifiers;
  return removedModifiers;
}

function removeSourceKeywordModifiers(
  permanent: PermanentState,
  sourceKind: "equipment",
  sourceId: string,
): PermanentKeywordModifier[] {
  const retainedModifiers: NonNullable<PermanentState["keywordModifiers"]> = [];
  const removedModifiers: PermanentKeywordModifier[] = [];

  for (const modifier of permanent.keywordModifiers ?? []) {
    if (modifier.sourceKind === sourceKind && modifier.sourceId === sourceId) {
      removedModifiers.push(modifier);
      continue;
    }

    retainedModifiers.push(modifier);
  }

  permanent.keywordModifiers = retainedModifiers;
  return removedModifiers;
}

function removeExpiredKeywordModifiersFromPermanent(
  permanent: PermanentState,
  turnNumber: number,
): void {
  const retainedModifiers: NonNullable<PermanentState["keywordModifiers"]> = [];

  for (const modifier of permanent.keywordModifiers ?? []) {
    if (modifier.expiresAtTurnNumber !== undefined && modifier.expiresAtTurnNumber <= turnNumber) {
      continue;
    }

    retainedModifiers.push(modifier);
  }

  permanent.keywordModifiers = retainedModifiers;
}

function createDefaultEquipmentAbility(): ActivatedAbility {
  return {
    id: "equip",
    kind: "activated",
    activation: { type: "action", actionId: "equip" },
    targeting: {
      prompt: "Choose a creature to equip",
      allowSelfTarget: false,
    },
    effects: [
      {
        type: "attach_from_battlefield",
        target: {
          zone: "battlefield",
          controller: "you",
          cardType: "creature",
        },
      },
    ],
  };
}

function getPermanentKeywordsForDefinition(
  definition: ReturnType<typeof asPermanentCardDefinition>,
): PermanentKeyword[] {
  const keywords = [...(definition.keywords ?? [])];

  if (definition.recoveryPolicy === "full_heal" && !keywords.includes("refresh")) {
    keywords.push("refresh");
  }

  return keywords;
}

function getInitialAbilitiesForDefinition(
  definition: ReturnType<typeof asPermanentCardDefinition>,
): Ability[] {
  const abilities = definition.abilities ? definition.abilities.map((ability) => ({ ...ability })) : [];

  if (
    isEquipmentCardDefinition(definition) &&
    !abilities.some(
      (ability) => ability.kind === "activated" && ability.activation.actionId === "equip",
    )
  ) {
    abilities.push(createDefaultEquipmentAbility());
  }

  return abilities;
}

function getBattlefieldForController(
  state: BattleState,
  controllerId: "player" | "enemy",
): Array<PermanentState | null> {
  return controllerId === "enemy" ? state.enemyBattlefield : state.battlefield;
}

function getSlotRangeForPermanentDefinition(
  state: BattleState,
  definition: ReturnType<typeof asPermanentCardDefinition>,
  controllerId: "player" | "enemy",
): { start: number; end: number } {
  const creatureSlotCount =
    controllerId === "enemy" ? state.enemyCreatureSlotCount : state.playerCreatureSlotCount;
  const nonCreatureSlotCount =
    controllerId === "enemy" ? state.enemyNonCreatureSlotCount : state.playerNonCreatureSlotCount;

  if (hasCardType(definition, "creature")) {
    return {
      start: 0,
      end: creatureSlotCount,
    };
  }

  return {
    start: creatureSlotCount,
    end: creatureSlotCount + nonCreatureSlotCount,
  };
}

function findOpenBattlefieldSlotForDefinition(
  state: BattleState,
  definition: ReturnType<typeof asPermanentCardDefinition>,
  controllerId: "player" | "enemy",
): number {
  const battlefield = getBattlefieldForController(state, controllerId);
  const { start, end } = getSlotRangeForPermanentDefinition(state, definition, controllerId);

  for (let slotIndex = start; slotIndex < end; slotIndex += 1) {
    if (battlefield[slotIndex] === null) {
      return slotIndex;
    }
  }

  return -1;
}

export function canSummonPermanentDefinition(
  state: BattleState,
  definition: ReturnType<typeof asPermanentCardDefinition>,
  controllerId: "player" | "enemy" = "player",
): boolean {
  return findOpenBattlefieldSlotForDefinition(state, definition, controllerId) !== -1;
}

export function toPermanentInstanceId(card: CardInstance): string {
  const cardNumber = card.instanceId.replace(/^card_/, "");
  return `${card.definitionId}_${cardNumber}`;
}

export function permanentHasSummoningSickness(
  state: BattleState,
  permanent: PermanentState,
): boolean {
  if (state.summoningSicknessPolicy === "disabled") {
    return false;
  }

  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId),
  );

  return (
    hasCardType(definition, "creature") &&
    permanent.enteredBattlefieldTurnNumber === state.turnNumber
  );
}

export function summonPermanentFromCard(
  state: BattleState,
  card: CardInstance,
  controllerId: "player" | "enemy" = "player",
  enteredBattlefieldTurnNumber?: number,
): PermanentState {
  const battlefield = getBattlefieldForController(state, controllerId);
  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId),
  );
  const openSlot = findOpenBattlefieldSlotForDefinition(state, definition, controllerId);

  if (openSlot === -1) {
    throw new Error(`Cannot summon ${card.definitionId} without an open battlefield slot.`);
  }

  const permanentId = toPermanentInstanceId(card);

  const permanent: PermanentState = {
    instanceId: permanentId,
    sourceCardInstanceId: card.instanceId,
    name: definition.name,
    definitionId: definition.id,
    controllerId,
    power: definition.power,
    health: definition.health,
    maxHealth: definition.health,
    block: 0,
    recoveryPolicy: definition.recoveryPolicy ?? LEAN_V1_DEFAULT_RECOVERY_POLICY,
    enteredBattlefieldTurnNumber,
    keywords: getPermanentKeywordsForDefinition(definition),
    counters: [],
    modifiers: [],
    keywordModifiers: [],
    attachments: [],
    attachedTo: null,
    abilities: getInitialAbilitiesForDefinition(definition),
    disabledAbilityIds: [],
    disabledRulesActions: [],
    hasActedThisTurn: false,
    isTapped: false,
    isDefending: false,
    blockingTargetPermanentId: null,
    slotIndex: openSlot,
  };

  battlefield[openSlot] = permanent;

  state.log.push({
    type: "permanent_summoned",
    turnNumber: state.turnNumber,
    permanentId,
    definitionId: definition.id,
    slotIndex: openSlot,
    controllerId,
  });

  emitRulesEvent(state, {
    type: "permanent_entered",
    turnNumber: state.turnNumber,
    permanentId,
    sourceCardInstanceId: card.instanceId,
    definitionId: definition.id,
    controllerId,
    slotIndex: openSlot,
  });

  return permanent;
}

export function canSummonPermanentFromCard(
  state: BattleState,
  card: CardInstance,
  controllerId: "player" | "enemy" = "player",
): boolean {
  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId),
  );

  return canSummonPermanentDefinition(state, definition, controllerId);
}

export function trySummonPermanentFromCard(
  state: BattleState,
  card: CardInstance,
  controllerId: "player" | "enemy" = "player",
  enteredBattlefieldTurnNumber?: number,
): PermanentState | null {
  if (!canSummonPermanentFromCard(state, card, controllerId)) {
    return null;
  }

  return summonPermanentFromCard(state, card, controllerId, enteredBattlefieldTurnNumber);
}

export function createEnemyPermanent(
  state: BattleState,
  enemy: {
    definitionId: CardDefinitionId;
    name: string;
    health: number;
    basePower: number;
    enemyActorId?: string | null;
  },
  enteredBattlefieldTurnNumber?: number,
): PermanentState {
  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, enemy.definitionId),
  );
  const openSlot = findOpenBattlefieldSlotForDefinition(state, definition, "enemy");

  if (openSlot === -1) {
    throw new Error(`Cannot create enemy ${enemy.name} without an open battlefield slot.`);
  }

  const permanent: PermanentState = {
    instanceId: `${enemy.definitionId}_${state.turnNumber}_${state.nextEnemyTokenIndex}`,
    sourceCardInstanceId: `${enemy.definitionId}_${state.turnNumber}_${state.nextEnemyTokenIndex}`,
    name: enemy.name,
    definitionId: enemy.definitionId,
    controllerId: "enemy",
    enemyActorId: enemy.enemyActorId ?? null,
    intentLabel: null,
    intentQueueLabels: [],
    power: enemy.basePower,
    health: enemy.health,
    maxHealth: enemy.health,
    block: 0,
    recoveryPolicy: definition.recoveryPolicy ?? LEAN_V1_DEFAULT_RECOVERY_POLICY,
    enteredBattlefieldTurnNumber,
    keywords: getPermanentKeywordsForDefinition(definition),
    counters: [],
    modifiers: [],
    keywordModifiers: [],
    attachments: [],
    attachedTo: null,
    abilities: getInitialAbilitiesForDefinition(definition),
    disabledAbilityIds: [],
    disabledRulesActions: [],
    hasActedThisTurn: false,
    isTapped: false,
    isDefending: false,
    blockingTargetPermanentId: null,
    slotIndex: openSlot,
  };

  state.enemyBattlefield[openSlot] = permanent;

  emitRulesEvent(state, {
    type: "permanent_entered",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    sourceCardInstanceId: permanent.sourceCardInstanceId,
    definitionId: permanent.definitionId,
    controllerId: "enemy",
    slotIndex: openSlot,
  });

  state.log.push({
    type: "permanent_summoned",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    definitionId: permanent.definitionId,
    slotIndex: openSlot,
    controllerId: "enemy",
  });

  return permanent;
}

export function createPermanentForEnemyActor(
  state: BattleState,
  enemyActor: Pick<EnemyActorState, "id" | "definitionId" | "name" | "health" | "basePower" | "intent">,
  options: {
    enteredBattlefieldTurnNumber?: number;
  } = {},
): PermanentState {
  const definitionId = enemyActor.definitionId ?? "enemy_leader";

  return createEnemyPermanent(state, {
    definitionId,
    name: enemyActor.name,
    health: enemyActor.health,
    basePower: enemyActor.basePower,
    enemyActorId: enemyActor.id,
  }, options.enteredBattlefieldTurnNumber);
}

export function getEnemyActorPermanent(
  state: BattleState,
  actor: Pick<EnemyActorState, "permanentId">,
): PermanentState | null {
  if (!actor.permanentId) {
    return null;
  }
  return state.enemyBattlefield.find((permanent) => permanent?.instanceId === actor.permanentId) ?? null;
}

export function getPrimaryEnemyPermanent(state: BattleState): PermanentState | null {
  const primaryActor = state.enemies[0];
  const primaryPermanent = primaryActor ? getEnemyActorPermanent(state, primaryActor) : null;

  if (primaryPermanent && primaryPermanent.health > 0) {
    return primaryPermanent;
  }

  return (
    state.enemyBattlefield.find((permanent) => {
      if (!permanent || permanent.health <= 0) {
        return false;
      }

      const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);
      return hasCardType(definition, "creature");
    }) ?? null
  );
}

export function permanentHasKeyword(
  permanent: PermanentState,
  keyword: PermanentKeyword,
): boolean {
  return (
    permanent.keywords.includes(keyword) ||
    (permanent.keywordModifiers ?? []).some((modifier) => modifier.keyword === keyword)
  );
}

export function expireTemporaryKeywordModifiers(state: BattleState): void {
  for (const permanent of [...state.battlefield, ...state.enemyBattlefield]) {
    if (!permanent) {
      continue;
    }

    removeExpiredKeywordModifiersFromPermanent(permanent, state.turnNumber);
  }
}

export function hasLivingEnemyCreatures(state: BattleState): boolean {
  return state.enemyBattlefield.some((permanent) => {
    if (!permanent || permanent.health <= 0) {
      return false;
    }

    const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);
    return hasCardType(definition, "creature");
  });
}

export function isEquipmentPermanent(state: BattleState, permanent: PermanentState): boolean {
  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);
  return isEquipmentCardDefinition(definition);
}

function findPermanentOnBattlefield(
  state: BattleState,
  permanentId: string,
): PermanentState | null {
  return (
    state.battlefield.find((permanent) => permanent?.instanceId === permanentId) ??
    state.enemyBattlefield.find((permanent) => permanent?.instanceId === permanentId) ??
    null
  );
}

export function permanentAttacksAllEnemyPermanents(
  state: BattleState,
  permanent: PermanentState,
): boolean {
  return (permanent.attachments ?? []).some((attachmentId) => {
    const attachmentPermanent = findPermanentOnBattlefield(state, attachmentId);

    if (!attachmentPermanent) {
      return false;
    }

    const definition = asPermanentCardDefinition(
      getCardDefinitionFromLibrary(state.cardDefinitions, attachmentPermanent.definitionId),
    );

    return isEquipmentCardDefinition(definition) && definition.attackAllEnemyPermanents === true;
  });
}

export function canAttachPermanentToTarget(
  state: BattleState,
  attachmentPermanent: PermanentState,
  targetPermanent: PermanentState,
): boolean {
  if (!isEquipmentPermanent(state, attachmentPermanent)) {
    return false;
  }

  if (attachmentPermanent.instanceId === targetPermanent.instanceId) {
    return false;
  }

  if (attachmentPermanent.controllerId !== targetPermanent.controllerId) {
    return false;
  }

  const targetDefinition = getCardDefinitionFromLibrary(state.cardDefinitions, targetPermanent.definitionId);

  if (!hasCardType(targetDefinition, "creature")) {
    return false;
  }

  return true;
}

export function detachPermanent(
  state: BattleState,
  attachmentPermanentId: string,
): boolean {
  const attachmentPermanent = state.battlefield.find(
    (permanent) => permanent?.instanceId === attachmentPermanentId,
  );

  if (!attachmentPermanent?.attachedTo) {
    return false;
  }

  const attachedTarget = state.battlefield.find(
    (permanent) => permanent?.instanceId === attachmentPermanent.attachedTo,
  );

  if (attachedTarget) {
    const removedModifiers = removeSourceModifiers(attachedTarget, "equipment", attachmentPermanent.instanceId);
    removeSourceKeywordModifiers(attachedTarget, "equipment", attachmentPermanent.instanceId);

    for (const removedModifier of removedModifiers) {
      if (removedModifier.stat === "health") {
        adjustPermanentHealth(attachedTarget, -removedModifier.amount);
      }
    }

    attachedTarget.attachments = (attachedTarget.attachments ?? []).filter(
      (entry) => entry !== attachmentPermanent.instanceId,
    );
  }

  attachmentPermanent.attachedTo = null;
  return true;
}

export function attachPermanentToTarget(
  state: BattleState,
  attachmentPermanent: PermanentState,
  targetPermanent: PermanentState,
): void {
  if (!canAttachPermanentToTarget(state, attachmentPermanent, targetPermanent)) {
    throw new Error(
      `Permanent ${attachmentPermanent.instanceId} cannot be attached to ${targetPermanent.instanceId}.`,
    );
  }

  detachPermanent(state, attachmentPermanent.instanceId);
  targetPermanent.attachments = [...(targetPermanent.attachments ?? []), attachmentPermanent.instanceId];
  attachmentPermanent.attachedTo = targetPermanent.instanceId;

  const modifiers = getEquipmentModifiersForAttachment(state, attachmentPermanent);
  const keywordModifiers = getEquipmentKeywordModifiersForAttachment(state, attachmentPermanent);
  targetPermanent.modifiers = [...(targetPermanent.modifiers ?? []), ...modifiers];
  targetPermanent.keywordModifiers = [...(targetPermanent.keywordModifiers ?? []), ...keywordModifiers];

  for (const modifier of modifiers) {
    if (modifier.stat === "health") {
      adjustPermanentHealth(targetPermanent, modifier.amount);
    }
  }

  emitRulesEvent(state, {
    type: "attachment_attached",
    turnNumber: state.turnNumber,
    attachmentId: attachmentPermanent.instanceId,
    targetPermanentId: targetPermanent.instanceId,
  });
}

function detachAttachmentsFromTarget(
  state: BattleState,
  targetPermanent: PermanentState,
): void {
  for (const attachmentId of targetPermanent.attachments ?? []) {
    const attachmentPermanent = state.battlefield.find(
      (permanent) => permanent?.instanceId === attachmentId,
    );

    if (attachmentPermanent) {
      attachmentPermanent.attachedTo = null;
    }
  }

  targetPermanent.attachments = [];
}

export function destroyPermanent(
  state: BattleState,
  permanentId: string,
): boolean {
  const battlefield =
    state.battlefield.findIndex((permanent) => permanent?.instanceId === permanentId) !== -1
      ? state.battlefield
      : state.enemyBattlefield;
  const permanentIndex = battlefield.findIndex((permanent) => permanent?.instanceId === permanentId);

  if (permanentIndex === -1) {
    return false;
  }

  const permanent = battlefield[permanentIndex];

  if (!permanent) {
    return false;
  }

  detachPermanent(state, permanent.instanceId);
  detachAttachmentsFromTarget(state, permanent);

  emitRulesEvent(state, {
    type: "permanent_left_battlefield",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    sourceCardInstanceId: permanent.sourceCardInstanceId,
    definitionId: permanent.definitionId,
    controllerId: permanent.controllerId ?? "player",
    slotIndex: permanent.slotIndex,
  });

  state.log.push({
    type: "permanent_destroyed",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    definitionId: permanent.definitionId,
    controllerId: permanent.controllerId ?? "player",
  });

  if ((permanent.controllerId ?? "player") !== "enemy") {
    state.player.graveyard.push({
      instanceId: permanent.sourceCardInstanceId,
      definitionId: permanent.definitionId,
    });
  }

  if (permanent.enemyActorId) {
    const enemyActor = state.enemies.find((actor) => actor.id === permanent.enemyActorId) ?? null;

    if (enemyActor) {
      enemyActor.health = 0;
      enemyActor.block = 0;
      enemyActor.permanentId = null;
      enemyActor.intentQueueLabels = [];
    }
  }

  emitRulesEvent(state, {
    type: "permanent_died",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    sourceCardInstanceId: permanent.sourceCardInstanceId,
    definitionId: permanent.definitionId,
    controllerId: permanent.controllerId ?? "player",
    slotIndex: permanent.slotIndex,
  });

  battlefield[permanentIndex] = null;
  state.blockingQueue = state.blockingQueue.filter((entry) => entry !== permanent.instanceId);

  return true;
}

export function cleanupDefeatedPermanents(state: BattleState): BattleState {
  for (const permanent of [...state.battlefield, ...state.enemyBattlefield]) {
    if (!permanent || permanent.health > 0) {
      continue;
    }

    destroyPermanent(state, permanent.instanceId);
  }

  return state;
}
