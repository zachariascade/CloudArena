import { getDerivedPermanentStat } from "./derived-stats.js";
import { findPermanentById, selectObjects, type SelectorContext } from "./selectors.js";
import type {
  BattleState,
  DerivedStatName,
  PermanentState,
  ValueExpression,
} from "./types.js";

export type ValueExpressionContext = SelectorContext;

function getPermanentPropertyValue(
  state: BattleState,
  permanent: PermanentState,
  property: DerivedStatName,
): number {
  switch (property) {
    case "health":
      return permanent.health;
    case "block":
      return permanent.block;
    case "damage":
      return getDerivedPermanentStat(state, permanent, "damage");
  }
}

function getReferencedPermanent(
  state: BattleState,
  target: "self" | "trigger_subject",
  context: ValueExpressionContext,
): PermanentState | null {
  const permanentId =
    target === "self"
      ? context.abilitySourcePermanentId
      : context.triggerSubjectPermanentId;

  if (!permanentId) {
    return null;
  }

  return findPermanentById(state, permanentId);
}

export function evaluateValueExpression(
  state: BattleState,
  expression: ValueExpression,
  context: ValueExpressionContext = {},
): number {
  switch (expression.type) {
    case "constant":
      return expression.value;
    case "count":
      return selectObjects(state, expression.selector, context).length;
    case "counter_count": {
      const permanent = getReferencedPermanent(state, expression.target, context);
      return permanent?.counters?.[expression.counter] ?? 0;
    }
    case "property": {
      const permanent = getReferencedPermanent(state, expression.target, context);
      if (!permanent) {
        return 0;
      }

      return getPermanentPropertyValue(state, permanent, expression.property);
    }
  }
}
