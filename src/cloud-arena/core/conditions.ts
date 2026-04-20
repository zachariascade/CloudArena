import { selectObjects, type SelectorContext } from "./selectors.js";
import type { BattleState, Condition } from "./types.js";
import { evaluateValueExpression } from "./value-expressions.js";

export function evaluateCondition(
  state: BattleState,
  condition: Condition,
  context: SelectorContext,
): boolean {
  switch (condition.type) {
    case "exists":
      return selectObjects(state, condition.selector, context).length > 0;
    case "threshold": {
      const count = selectObjects(state, condition.selector, context).length;

      switch (condition.op ?? ">=") {
        case "==":
          return count === condition.value;
        case "!=":
          return count !== condition.value;
        case ">":
          return count > condition.value;
        case ">=":
          return count >= condition.value;
        case "<":
          return count < condition.value;
        case "<=":
          return count <= condition.value;
      }
    }
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
