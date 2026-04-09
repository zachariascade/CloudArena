import { selectObjects, selectPermanents, type SelectedObject, type SelectorContext } from "./selectors.js";
import type {
  BattleState,
  ChoiceOption,
  ChoiceRecord,
  ChoiceStrategy,
  PermanentState,
  Selector,
} from "./types.js";

type ChoiceInput = {
  controllerId?: string;
  kind: ChoiceRecord["kind"];
  optional?: boolean;
  options: ChoiceOption[];
  reason: string;
  selectedIds: string[];
  strategy: ChoiceStrategy;
};

function recordChoice(
  state: BattleState,
  input: ChoiceInput,
): void {
  state.choices.push({
    id: `choice_${state.turnNumber}_${state.choices.length + 1}`,
    turnNumber: state.turnNumber,
    controllerId: input.controllerId ?? "player",
    kind: input.kind,
    reason: input.reason,
    optional: input.optional ?? false,
    options: input.options,
    selectedIds: input.selectedIds,
    strategy: input.strategy,
  });
}

function toObjectChoiceOption(object: SelectedObject): ChoiceOption {
  if (object.kind === "card") {
    return {
      id: object.card.instanceId,
      label: object.definition.name,
    };
  }

  return {
    id: object.permanent.instanceId,
    label: object.permanent.name,
  };
}

export function choosePermanents(
  state: BattleState,
  input: {
    selector: Selector;
    amount: number;
    reason: string;
    controllerId?: string;
    context?: SelectorContext;
    optional?: boolean;
  },
): PermanentState[] {
  const candidates = selectPermanents(state, input.selector, input.context ?? {});
  const selected = candidates.slice(0, Math.max(0, input.amount));

  recordChoice(state, {
    controllerId: input.controllerId,
    kind: "select_permanents",
    optional: input.optional ?? false,
    options: candidates.map((permanent) => ({
      id: permanent.instanceId,
      label: permanent.name,
    })),
    reason: input.reason,
    selectedIds: selected.map((permanent) => permanent.instanceId),
    strategy: "first_available",
  });

  return selected;
}

export function chooseSingleObject(
  state: BattleState,
  input: {
    selector: Selector;
    reason: string;
    controllerId?: string;
    context?: SelectorContext;
    optional?: boolean;
  },
): SelectedObject | null {
  const candidates = selectObjects(state, input.selector, input.context ?? {});
  const selected = candidates[0] ?? null;

  recordChoice(state, {
    controllerId: input.controllerId,
    kind: "select_hand_card",
    optional: input.optional ?? false,
    options: candidates.map(toObjectChoiceOption),
    reason: input.reason,
    selectedIds: selected ? [toObjectChoiceOption(selected).id] : [],
    strategy: "first_available",
  });

  return selected;
}

export function chooseOptionalEffect(
  state: BattleState,
  input: {
    reason: string;
    shouldResolve: boolean;
    controllerId?: string;
  },
): boolean {
  recordChoice(state, {
    controllerId: input.controllerId,
    kind: "optional_effect",
    optional: true,
    options: [
      { id: "yes", label: "Yes" },
      { id: "no", label: "No" },
    ],
    reason: input.reason,
    selectedIds: input.shouldResolve ? ["yes"] : ["no"],
    strategy: input.shouldResolve ? "auto_yes" : "auto_no",
  });

  return input.shouldResolve;
}
