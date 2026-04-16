import { evaluateValueExpression } from "./value-expressions.js";
import type {
  Ability,
  AbilityCost,
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

export function getAbilityCosts(ability: ActivatedAbility): AbilityCost[] {
  return ability.costs ?? [];
}

export function getAbilityEnergyCost(ability: ActivatedAbility): number {
  return getAbilityCosts(ability)
    .filter((cost): cost is Extract<AbilityCost, { type: "energy" }> => cost.type === "energy")
    .reduce((sum, cost) => sum + cost.amount, 0);
}

export function abilityCostsTap(ability: ActivatedAbility): boolean {
  return getAbilityCosts(ability).some((cost) => cost.type === "tap");
}

export type AbilityCostDisplayPart =
  | {
      type: "free";
    }
  | {
      type: "energy";
      amount: number;
    }
  | {
      type: "tap";
    };

export function getAbilityCostDisplayParts(
  ability: ActivatedAbility,
): AbilityCostDisplayPart[] {
  const costs = getAbilityCosts(ability);
  const energyCost = costs
    .filter((cost): cost is Extract<AbilityCost, { type: "energy" }> => cost.type === "energy")
    .reduce((sum, cost) => sum + cost.amount, 0);
  const parts: AbilityCostDisplayPart[] = [];

  if (energyCost > 0) {
    parts.push({ type: "energy", amount: energyCost });
  }

  if (costs.some((cost) => cost.type === "tap")) {
    parts.push({ type: "tap" });
  }

  return parts.length > 0 ? parts : [{ type: "free" }];
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

export function formatAbilityCosts(ability: ActivatedAbility): string {
  const parts = getAbilityCosts(ability).map((cost) => {
    if (cost.type === "tap") {
      return "Tap";
    }

    return `Pay ${cost.amount} energy`;
  });

  return parts.length > 0 ? `${parts.join(" + ")}: ` : "";
}

export function canPayAbilityCosts(
  state: BattleState,
  permanent: PermanentState,
  ability: ActivatedAbility,
): boolean {
  return canPayAbilityCostBundle(state, permanent, getAbilityCosts(ability));
}

export function payAbilityCosts(
  state: BattleState,
  permanent: PermanentState,
  ability: ActivatedAbility,
): void {
  payAbilityCostBundle(state, permanent, getAbilityCosts(ability));
}

export function canPayAbilityCostBundle(
  state: BattleState,
  permanent: PermanentState,
  costs: AbilityCost[],
): boolean {
  const energyCost = costs
    .filter((cost): cost is Extract<AbilityCost, { type: "energy" }> => cost.type === "energy")
    .reduce((sum, cost) => sum + cost.amount, 0);
  const needsTap = costs.some((cost) => cost.type === "tap");

  return state.player.energy >= energyCost && (!needsTap || !permanent.isTapped);
}

export function payAbilityCostBundle(
  state: BattleState,
  permanent: PermanentState,
  costs: AbilityCost[],
): void {
  const energyCost = costs
    .filter((cost): cost is Extract<AbilityCost, { type: "energy" }> => cost.type === "energy")
    .reduce((sum, cost) => sum + cost.amount, 0);

  if (state.player.energy < energyCost) {
    throw new Error("Not enough energy to use ability.");
  }

  if (costs.some((cost) => cost.type === "tap" && permanent.isTapped)) {
    throw new Error(`Permanent ${permanent.instanceId} is already tapped.`);
  }

  state.player.energy -= energyCost;

  if (costs.some((cost) => cost.type === "tap")) {
    permanent.isTapped = true;
  }
}

export function formatActivatedAbilityLabel(
  state: BattleState,
  permanent: PermanentState,
  ability: ActivatedAbility,
): string {
  const amount = getAbilityActionAmount(state, permanent, ability);
  const costPrefix = formatAbilityCosts(ability);

  if (ability.activation.actionId === "attack") {
    return `${costPrefix}${typeof amount === "number" ? `Attack ${amount}` : "Attack"}`;
  }

  if (ability.activation.actionId === "apply_block") {
    return `${costPrefix}${typeof amount === "number" ? `Apply Block ${amount}` : "Apply Block"}`;
  }

  if (ability.activation.actionId === "equip") {
    return `${costPrefix}Equip`;
  }

  return `${costPrefix}${ability.activation.actionId.replace(/_/g, " ")}`;
}
