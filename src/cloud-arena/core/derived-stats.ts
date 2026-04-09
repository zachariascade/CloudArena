import { getTotalAttackAmount } from "./combat-values.js";
import { evaluateValueExpression } from "./value-expressions.js";
import type {
  BattleState,
  DerivedStatName,
  PermanentActionDefinition,
  PermanentState,
  StatModifier,
} from "./types.js";

function getBasePermanentDamage(permanent: PermanentState): number {
  return Math.max(
    0,
    ...permanent.actions.map((action) => getTotalAttackAmount(action)),
  );
}

function getBasePermanentStat(
  permanent: PermanentState,
  stat: DerivedStatName,
): number {
  switch (stat) {
    case "damage":
      return getBasePermanentDamage(permanent);
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
    .filter((ability) => ability.kind === "static" && ability.modifier)
    .map((ability) => ability.modifier as StatModifier)
    .filter((modifier) => modifier.target === "self");
}

export function getDerivedPermanentStat(
  state: BattleState,
  permanent: PermanentState,
  stat: DerivedStatName,
): number {
  let value = getBasePermanentStat(permanent, stat);

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
  action: PermanentActionDefinition,
): number {
  if (typeof action.attackAmount === "number" && action.attackAmount > 0) {
    const baseDamage = getTotalAttackAmount(action);
    const basePermanentDamage = getBasePermanentDamage(permanent);
    const derivedPermanentDamage = getDerivedPermanentStat(state, permanent, "damage");
    const damageDelta = derivedPermanentDamage - basePermanentDamage;

    return Math.max(0, baseDamage + damageDelta);
  }

  return action.blockAmount ?? 0;
}
