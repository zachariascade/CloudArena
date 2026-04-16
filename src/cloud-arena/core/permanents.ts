import {
  asPermanentCardDefinition,
  getCardDefinitionFromLibrary,
  isEquipmentCardDefinition,
} from "../cards/definitions.js";
import { LEAN_V1_DEFAULT_RECOVERY_POLICY } from "./constants.js";
import { emitRulesEvent } from "./rules-events.js";
import type {
  Ability,
  ActivatedAbility,
  BattleState,
  CardInstance,
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

function createDefaultEquipmentAbility(): ActivatedAbility {
  return {
    id: "equip",
    kind: "activated",
    activation: { type: "action", actionId: "equip" },
    targeting: {
      prompt: "Choose a permanent to equip",
      allowSelfTarget: false,
    },
    effects: [
      {
        type: "attach_from_battlefield",
        target: {
          zone: "battlefield",
          controller: "you",
          cardType: "permanent",
        },
      },
    ],
  };
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
    recoveryPolicy: definition.recoveryPolicy ?? LEAN_V1_DEFAULT_RECOVERY_POLICY,
    counters: [],
    modifiers: [],
    attachments: [],
    attachedTo: null,
    abilities: getInitialAbilitiesForDefinition(definition),
    disabledAbilityIds: [],
    disabledRulesActions: [],
    hasActedThisTurn: false,
    isTapped: false,
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
    const removedModifiers = removeSourceModifiers(attachedTarget, "equipment", attachmentPermanent.instanceId);

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
  targetPermanent.modifiers = [...(targetPermanent.modifiers ?? []), ...modifiers];

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
    controllerId: permanent.controllerId ?? "player",
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
