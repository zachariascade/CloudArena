import {
  getCardDefinitionFromLibrary,
  hasCardType,
  isEquipmentCardDefinition,
  isPermanentCardDefinition,
} from "../cards/definitions.js";
import { resolveEffects } from "./effects.js";
import { cleanupDefeatedPermanents } from "./permanents.js";
import { selectObjects } from "./selectors.js";
import { evaluateValueExpression } from "./value-expressions.js";
import type {
  Ability,
  BattleState,
  Condition,
  RulesEvent,
  Selector,
} from "./types.js";

type TriggerResolution = {
  ability: Ability;
  abilitySourcePermanentId: string;
  triggerSubjectPermanentId?: string;
};

function matchesEventSelector(
  state: BattleState,
  selector: Selector | undefined,
  event: RulesEvent,
  abilitySourcePermanentId: string,
): boolean {
  if (!selector) {
    return true;
  }

  if (selector.zone && selector.zone !== "battlefield") {
    return false;
  }

  if (
    event.type !== "permanent_entered" &&
    event.type !== "permanent_died" &&
    event.type !== "counter_added"
  ) {
    return false;
  }

  const eventPermanentId = event.permanentId;
  const definitionId =
    event.type === "counter_added"
      ? state.battlefield.find((permanent) => permanent?.instanceId === event.permanentId)?.definitionId
      : event.definitionId;

  if (!definitionId) {
    return false;
  }

  const definition = getCardDefinitionFromLibrary(state.cardDefinitions, definitionId);
  const controllerId =
    event.type === "counter_added"
      ? state.battlefield.find((permanent) => permanent?.instanceId === event.permanentId)?.controllerId ?? "player"
      : event.controllerId ?? "player";

  if (selector.controller === "you" && controllerId !== "player") {
    return false;
  }

  if (selector.controller === "opponent" && controllerId === "player") {
    return false;
  }

  if (selector.cardType === "equipment" && !isEquipmentCardDefinition(definition)) {
    return false;
  }

  if (selector.cardType === "permanent" && !isPermanentCardDefinition(definition)) {
    return false;
  }

  if (
    selector.cardType &&
    selector.cardType !== "equipment" &&
    selector.cardType !== "permanent" &&
    !hasCardType(definition, selector.cardType)
  ) {
    return false;
  }

  if (selector.subtype && !(definition.subtypes?.includes(selector.subtype) ?? false)) {
    return false;
  }

  if (selector.relation === "self" && eventPermanentId !== abilitySourcePermanentId) {
    return false;
  }

  if (selector.relation === "another" && eventPermanentId === abilitySourcePermanentId) {
    return false;
  }

  return true;
}

function matchesTrigger(
  state: BattleState,
  ability: Ability,
  event: RulesEvent,
  abilitySourcePermanentId: string,
): boolean {
  if (ability.kind !== "triggered" || !ability.trigger) {
    return false;
  }

  switch (ability.trigger.event) {
    case "self_enters_battlefield":
      return event.type === "permanent_entered" && event.permanentId === abilitySourcePermanentId;
    case "permanent_enters_battlefield":
      return (
        event.type === "permanent_entered" &&
        matchesEventSelector(state, ability.trigger.selector, event, abilitySourcePermanentId)
      );
    case "permanent_died":
      return (
        event.type === "permanent_died" &&
        matchesEventSelector(state, ability.trigger.selector, event, abilitySourcePermanentId)
      );
    case "counter_added":
      return (
        event.type === "counter_added" &&
        (!ability.trigger.counter || ability.trigger.counter === event.counter) &&
        matchesEventSelector(state, ability.trigger.selector, event, abilitySourcePermanentId)
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
  return state.battlefield.flatMap((permanent) => {
    if (!permanent?.abilities?.length) {
      return [];
    }

    return permanent.abilities.flatMap((ability) =>
      matchesTrigger(state, ability, event, permanent.instanceId)
        ? [
            {
              ability,
              abilitySourcePermanentId: permanent.instanceId,
              triggerSubjectPermanentId:
                "permanentId" in event ? event.permanentId : undefined,
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
