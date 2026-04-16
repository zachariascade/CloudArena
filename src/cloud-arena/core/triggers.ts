import {
  getCardDefinitionFromLibrary,
} from "../cards/definitions.js";
import { resolveEffects } from "./effects.js";
import { cleanupDefeatedPermanents } from "./permanents.js";
import { matchesSelectorObject, selectObjects } from "./selectors.js";
import { evaluateValueExpression } from "./value-expressions.js";
import type {
  Ability,
  BattleState,
  CardInstance,
  Condition,
  PermanentState,
  RulesEvent,
} from "./types.js";
import type { SelectedObject } from "./selectors.js";

type TriggerEventWithPermanentSnapshot = Extract<
  RulesEvent,
  { type: "permanent_died" | "permanent_left_battlefield" | "permanent_attacked" | "permanent_blocked" | "permanent_becomes_blocked" }
>;

type TriggerResolution = {
  ability: Ability;
  abilitySourcePermanentId?: string;
  abilitySourceCardInstanceId?: string;
  triggerSubjectPermanentId?: string;
  triggerSubjectCardInstanceId?: string;
  sourceCardInstanceId?: string;
};

function toPermanentSelectedObject(
  state: BattleState,
  permanent: PermanentState,
): SelectedObject {
  return {
    kind: "permanent",
    zone: "battlefield",
    permanent,
    definition: getCardDefinitionFromLibrary(state.cardDefinitions, permanent.definitionId),
    controllerId: permanent.controllerId ?? "player",
  };
}

function toSyntheticPermanentSelectedObject(
  state: BattleState,
  event: TriggerEventWithPermanentSnapshot,
): SelectedObject {
  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, event.definitionId);

  return {
    kind: "permanent",
    zone: "battlefield",
    permanent: {
      instanceId: event.permanentId,
      sourceCardInstanceId: event.sourceCardInstanceId,
      name: definition.name,
      definitionId: event.definitionId,
      controllerId: event.controllerId,
      power: 0,
      health: 0,
      maxHealth: 0,
      block: 0,
      recoveryPolicy: "none",
      counters: [],
      modifiers: [],
      attachments: [],
      attachedTo: null,
      abilities: definition.abilities ? definition.abilities.map((ability) => ({ ...ability })) : [],
      disabledAbilityIds: [],
      disabledRulesActions: [],
      hasActedThisTurn: false,
      isTapped: false,
      isDefending: false,
      slotIndex: event.slotIndex,
    },
    definition,
    controllerId: event.controllerId,
  };
}

function toCardSelectedObject(
  state: BattleState,
  card: CardInstance,
  zone: "hand" | "graveyard" | "discard",
): SelectedObject {
  return {
    kind: "card",
    zone,
    card,
    definition: getCardDefinitionFromLibrary(state.cardDefinitions, card.definitionId),
    controllerId: "player",
  };
}

function getCardInZone(
  cards: CardInstance[],
  cardInstanceId: string,
): CardInstance | null {
  return cards.find((card) => card.instanceId === cardInstanceId) ?? null;
}

function getTriggerSubjectObject(
  state: BattleState,
  event: RulesEvent,
): SelectedObject | null {
  switch (event.type) {
    case "permanent_entered": {
      const permanent = state.battlefield.find((entry) => entry?.instanceId === event.permanentId) ?? null;

      return permanent ? toPermanentSelectedObject(state, permanent) : null;
    }
    case "permanent_died":
    case "permanent_left_battlefield":
      return toSyntheticPermanentSelectedObject(state, event);
    case "permanent_attacked":
    case "permanent_blocked":
    case "permanent_becomes_blocked":
      return toSyntheticPermanentSelectedObject(state, event);
    case "counter_added": {
      const permanent = state.battlefield.find((entry) => entry?.instanceId === event.permanentId) ?? null;

      return permanent ? toPermanentSelectedObject(state, permanent) : null;
    }
    case "card_drawn": {
      const card = getCardInZone(state.player.hand, event.cardInstanceId);

      return card ? toCardSelectedObject(state, card, "hand") : null;
    }
    case "card_discarded": {
      const card = getCardInZone(state.player.discardPile, event.cardInstanceId);

      return card ? toCardSelectedObject(state, card, "discard") : null;
    }
    case "card_played":
    case "attachment_attached":
    case "counter_removed":
      return null;
    default:
      return null;
  }
}

function getAbilitySourceObjects(state: BattleState, triggerSubject: SelectedObject | null): SelectedObject[] {
  const sources = [
    ...selectObjects(state, { zone: "battlefield" }),
    ...selectObjects(state, { zone: "hand" }),
    ...selectObjects(state, { zone: "graveyard" }),
    ...selectObjects(state, { zone: "discard" }),
  ];

  if (triggerSubject) {
    const sourceId =
      triggerSubject.kind === "permanent"
        ? triggerSubject.permanent.instanceId
        : triggerSubject.card.instanceId;

    if (
      !sources.some((object) =>
        object.kind === "permanent"
          ? object.permanent.instanceId === sourceId
          : object.card.instanceId === sourceId,
      )
    ) {
      sources.push(triggerSubject);
    }
  }

  return sources;
}

function matchesTrigger(
  ability: Ability,
  event: RulesEvent,
  abilitySource: SelectedObject,
  triggerSubject: SelectedObject,
): boolean {
  if (ability.kind !== "triggered" || !ability.trigger) {
    return false;
  }

  const context: TriggerResolution = {
    ability,
    abilitySourcePermanentId:
      abilitySource.kind === "permanent" ? abilitySource.permanent.instanceId : undefined,
    abilitySourceCardInstanceId:
      abilitySource.kind === "card" ? abilitySource.card.instanceId : undefined,
    triggerSubjectPermanentId:
      triggerSubject.kind === "permanent" ? triggerSubject.permanent.instanceId : undefined,
    triggerSubjectCardInstanceId:
      triggerSubject.kind === "card" ? triggerSubject.card.instanceId : undefined,
    sourceCardInstanceId:
      abilitySource.kind === "card"
        ? abilitySource.card.instanceId
        : triggerSubject.kind === "card"
          ? triggerSubject.card.instanceId
          : undefined,
  };

  switch (ability.trigger.event) {
    case "self_enters_battlefield":
      return (
        event.type === "permanent_entered" &&
        abilitySource.kind === "permanent" &&
        triggerSubject.kind === "permanent" &&
        abilitySource.permanent.instanceId === triggerSubject.permanent.instanceId
      );
    case "permanent_enters_battlefield":
      return (
        event.type === "permanent_entered" &&
        triggerSubject.kind === "permanent" &&
        (!ability.trigger.selector ||
          matchesSelectorObject(triggerSubject, ability.trigger.selector, context))
      );
    case "permanent_died":
      if (event.type !== "permanent_died" || triggerSubject.kind !== "permanent") {
        return false;
      }

      if (ability.trigger.selector?.relation === "self") {
        const { relation: _relation, ...selectorWithoutRelation } = ability.trigger.selector;

        if (
          abilitySource.kind === "card" &&
          triggerSubject.permanent.sourceCardInstanceId === abilitySource.card.instanceId &&
          matchesSelectorObject(triggerSubject, selectorWithoutRelation, context)
        ) {
          return true;
        }

        return false;
      }

      return (
        !ability.trigger.selector ||
        matchesSelectorObject(triggerSubject, ability.trigger.selector, context)
      );
    case "permanent_left_battlefield":
      return (
        event.type === "permanent_left_battlefield" &&
        triggerSubject.kind === "permanent" &&
        (!ability.trigger.selector ||
          matchesSelectorObject(triggerSubject, ability.trigger.selector, context))
      );
    case "permanent_attacked":
      return (
        event.type === "permanent_attacked" &&
        triggerSubject.kind === "permanent" &&
        (!ability.trigger.selector ||
          matchesSelectorObject(triggerSubject, ability.trigger.selector, context))
      );
    case "permanent_blocked":
      return (
        event.type === "permanent_blocked" &&
        triggerSubject.kind === "permanent" &&
        (!ability.trigger.selector ||
          matchesSelectorObject(triggerSubject, ability.trigger.selector, context))
      );
    case "permanent_becomes_blocked":
      return (
        event.type === "permanent_becomes_blocked" &&
        triggerSubject.kind === "permanent" &&
        (!ability.trigger.selector ||
          matchesSelectorObject(triggerSubject, ability.trigger.selector, context))
      );
    case "counter_added":
      return (
        event.type === "counter_added" &&
        triggerSubject.kind === "permanent" &&
        (!ability.trigger.counter || ability.trigger.counter === event.counter) &&
        (!ability.trigger.stat || ability.trigger.stat === event.stat) &&
        (!ability.trigger.selector ||
          matchesSelectorObject(triggerSubject, ability.trigger.selector, context))
      );
    case "card_drawn":
      return (
        event.type === "card_drawn" &&
        triggerSubject.kind === "card" &&
        (!ability.trigger.selector ||
          matchesSelectorObject(triggerSubject, ability.trigger.selector, context))
      );
    case "card_discarded":
      return (
        event.type === "card_discarded" &&
        triggerSubject.kind === "card" &&
        (!ability.trigger.selector ||
          matchesSelectorObject(triggerSubject, ability.trigger.selector, context))
      );
    case "turn_started":
      return false;
  }
}

function evaluateCondition(
  state: BattleState,
  condition: Condition,
  context: TriggerResolution,
): boolean {
  switch (condition.type) {
    case "exists":
      return selectObjects(state, condition.selector, context).length > 0;
    case "compare": {
      const left = evaluateValueExpression(state, condition.left, context);
      const right = evaluateValueExpression(state, condition.right, context);

      switch (condition.op) {
        case "==":
          return left === right;
        case "!=":
          return left !== right;
        case ">":
          return left > right;
        case ">=":
          return left >= right;
        case "<":
          return left < right;
        case "<=":
          return left <= right;
      }
    }
  }
}

function collectTriggeredAbilities(
  state: BattleState,
  event: RulesEvent,
): TriggerResolution[] {
  const triggerSubject = getTriggerSubjectObject(state, event);

  if (!triggerSubject) {
    return [];
  }

  const abilitySources = getAbilitySourceObjects(state, triggerSubject);

  return abilitySources.flatMap((abilitySource) => {
    const abilities =
      abilitySource.kind === "permanent"
        ? abilitySource.permanent.abilities ?? []
        : abilitySource.definition.abilities ?? [];

    return abilities.flatMap((ability) =>
      matchesTrigger(ability, event, abilitySource, triggerSubject)
        ? [
            {
              ability,
              abilitySourcePermanentId:
                abilitySource.kind === "permanent" ? abilitySource.permanent.instanceId : undefined,
              abilitySourceCardInstanceId:
                abilitySource.kind === "card" ? abilitySource.card.instanceId : undefined,
              triggerSubjectPermanentId:
                triggerSubject.kind === "permanent" ? triggerSubject.permanent.instanceId : undefined,
              triggerSubjectCardInstanceId:
                triggerSubject.kind === "card" ? triggerSubject.card.instanceId : undefined,
              sourceCardInstanceId:
                abilitySource.kind === "card"
                  ? abilitySource.card.instanceId
                  : triggerSubject.kind === "card"
                    ? triggerSubject.card.instanceId
                    : undefined,
            },
          ]
        : [],
    );
  });
}

export function processTriggeredAbilities(state: BattleState): BattleState {
  while (state.rulesCursor < state.rules.length) {
    const event = state.rules[state.rulesCursor];

    if (!event) {
      break;
    }

    state.rulesCursor += 1;

    const triggeredAbilities = collectTriggeredAbilities(state, event);

    for (const resolution of triggeredAbilities) {
      const conditions = "conditions" in resolution.ability ? resolution.ability.conditions ?? [] : [];
      const conditionsMet = conditions.every((condition: Condition) =>
        evaluateCondition(state, condition, resolution));

      if (!conditionsMet) {
        continue;
      }

      resolveEffects(state, "effects" in resolution.ability ? resolution.ability.effects ?? [] : [], resolution);
      cleanupDefeatedPermanents(state);
    }
  }

  return state;
}
