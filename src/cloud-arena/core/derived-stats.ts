import { evaluateValueExpression } from "./value-expressions.js";
import type {
  BattleState,
  DerivedStatName,
  PermanentState,
  StatModifier,
} from "./types.js";

function getCounterModifierForStat(
  permanent: PermanentState,
  stat: DerivedStatName,
): number {
  const counters = permanent.counters ?? {};

  switch (stat) {
    case "power":
      // In Cloud Arena, +1/+1 counters currently map to increased attack power.
      return counters["+1/+1"] ?? 0;
    case "health":
    case "block":
      return 0;
  }
}

function getBasePermanentStat(
  permanent: PermanentState,
  stat: DerivedStatName,
): number {
  switch (stat) {
    case "power":
      return permanent.power;
    case "health":
      return permanent.health;
    case "block":
      return permanent.block;
  }
}

function getStaticModifiersForPermanent(
  permanent: PermanentState,
): StatModifier[] {
  return (permanent.abilities ?? [])
    .filter((ability): ability is Extract<typeof ability, { kind: "static" }> => ability.kind === "static")
    .map((ability) => ability.modifier)
    .filter((modifier) => modifier.target === "self");
}

export function getDerivedPermanentStat(
  state: BattleState,
  permanent: PermanentState,
  stat: DerivedStatName,
): number {
  let value = getBasePermanentStat(permanent, stat) + getCounterModifierForStat(permanent, stat);

  for (const modifier of getStaticModifiersForPermanent(permanent)) {
    if (modifier.stat !== stat) {
      continue;
    }

    const modifierValue = evaluateValueExpression(state, modifier.value, {
      abilitySourcePermanentId: permanent.instanceId,
    });

    if (modifier.operation === "set") {
      value = modifierValue;
      continue;
    }

    value += modifierValue;
  }

  return Math.max(0, value);
}

export function getDerivedPermanentActionAmount(
  state: BattleState,
  permanent: PermanentState,
  action: "attack" | "apply_block",
): number {
  if (action === "attack") {
    return getDerivedPermanentStat(state, permanent, "power");
  }

  return 0;
}
