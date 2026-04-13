import { evaluateValueExpression } from "./value-expressions.js";
import type {
  Ability,
  ActivatedAbility,
  BattleState,
  PermanentState,
} from "./types.js";

export function isActivatedAbility(ability: Ability): ability is ActivatedAbility {
  return ability.kind === "activated";
}

export function getActivatedAbilities(abilities: Ability[] | undefined): ActivatedAbility[] {
  return (abilities ?? []).filter(isActivatedAbility);
}

export function getActivatedAbilityById(
  abilities: Ability[] | undefined,
  abilityId: string,
): ActivatedAbility | null {
  return getActivatedAbilities(abilities).find((ability) => ability.id === abilityId) ?? null;
}

export function getAbilityActionAmount(
  state: BattleState,
  permanent: PermanentState,
  ability: ActivatedAbility,
): number | null {
  const matchingEffect = ability.effects.find((effect) => {
    if (ability.activation.actionId === "attack") {
      return effect.type === "deal_damage" && effect.target === "enemy";
    }

    if (ability.activation.actionId === "apply_block") {
      return effect.type === "gain_block" && effect.target === "player";
    }

    return false;
  });

  if (!matchingEffect) {
    return null;
  }

  if (matchingEffect.type === "deal_damage" || matchingEffect.type === "gain_block") {
    return evaluateValueExpression(state, matchingEffect.amount, {
      abilitySourcePermanentId: permanent.instanceId,
    });
  }

  return null;
}

export function formatActivatedAbilityLabel(
  state: BattleState,
  permanent: PermanentState,
  ability: ActivatedAbility,
): string {
  const amount = getAbilityActionAmount(state, permanent, ability);

  if (ability.activation.actionId === "attack") {
    return typeof amount === "number" ? `Attack ${amount}` : "Attack";
  }

  if (ability.activation.actionId === "apply_block") {
    return typeof amount === "number" ? `Apply Block ${amount}` : "Apply Block";
  }

  return ability.activation.actionId.replace(/_/g, " ");
}
