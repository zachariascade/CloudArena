import {
  asPermanentCardDefinition,
  getCardDefinitionFromLibrary,
  isEquipmentCardDefinition,
} from "../cards/definitions.js";
import { emitRulesEvent } from "./rules-events.js";
import type {
  BattleState,
  CardInstance,
  PermanentState,
} from "./types.js";

export function toPermanentInstanceId(card: CardInstance): string {
  const cardNumber = card.instanceId.replace(/^card_/, "");
  return `${card.definitionId}_${cardNumber}`;
}

export function summonPermanentFromCard(
  state: BattleState,
  card: CardInstance,
  controllerId = "player",
): PermanentState {
  const openSlot = state.battlefield.findIndex((slot) => slot === null);

  if (openSlot === -1) {
    throw new Error(`Cannot summon ${card.definitionId} without an open battlefield slot.`);
  }

  const definition = asPermanentCardDefinition(
    getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId),
  );
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
    recoveryPolicy: definition.recoveryPolicy ?? "none",
    counters: {},
    attachments: [],
    attachedTo: null,
    abilities: definition.abilities ? definition.abilities.map((ability) => ({ ...ability })) : [],
    disabledAbilityIds: [],
    disabledRulesActions: [],
    hasActedThisTurn: false,
    isDefending: false,
    slotIndex: openSlot,
  };

  state.battlefield[openSlot] = permanent;

  state.log.push({
    type: "permanent_summoned",
    turnNumber: state.turnNumber,
    permanentId,
    definitionId: definition.id,
    slotIndex: openSlot,
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

export function isEquipmentPermanent(state: BattleState, permanent: PermanentState): boolean {
  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId);
  return isEquipmentCardDefinition(definition);
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
  const permanentIndex = state.battlefield.findIndex((permanent) => permanent?.instanceId === permanentId);

  if (permanentIndex === -1) {
    return false;
  }

  const permanent = state.battlefield[permanentIndex];

  if (!permanent) {
    return false;
  }

  detachPermanent(state, permanent.instanceId);
  detachAttachmentsFromTarget(state, permanent);

  state.log.push({
    type: "permanent_destroyed",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    definitionId: permanent.definitionId,
  });

  state.player.graveyard.push({
    instanceId: permanent.sourceCardInstanceId,
    definitionId: permanent.definitionId,
  });

  emitRulesEvent(state, {
    type: "permanent_died",
    turnNumber: state.turnNumber,
    permanentId: permanent.instanceId,
    sourceCardInstanceId: permanent.sourceCardInstanceId,
    definitionId: permanent.definitionId,
    controllerId: permanent.controllerId,
    slotIndex: permanent.slotIndex,
  });

  state.battlefield[permanentIndex] = null;
  state.blockingQueue = state.blockingQueue.filter((entry) => entry !== permanent.instanceId);

  return true;
}

export function cleanupDefeatedPermanents(state: BattleState): BattleState {
  for (const permanent of state.battlefield) {
    if (!permanent || permanent.health > 0) {
      continue;
    }

    destroyPermanent(state, permanent.instanceId);
  }

  return state;
}
