import {
  hasCardType,
  isPermanentCardDefinition,
} from "./cards/definitions.js";
import type {
  Ability,
  AbilityCost,
  CardDefinition,
  CardEffect,
  Condition,
  Effect,
  Selector,
  Trigger,
  ValueExpression,
} from "./core/types.js";

function formatCount(amount: number): string {
  return amount === 1 ? "1" : String(amount);
}

function scaleEquipmentBonusAmount(amount: number): number {
  return amount;
}

function lowercaseFirst(text: string): string {
  return text ? `${text[0].toLowerCase()}${text.slice(1)}` : text;
}

function describeSelectorTarget(selector: Selector | "self" | "player" | "enemy"): string {
  if (selector === "self") {
    return "this";
  }

  if (selector === "player") {
    return "you";
  }

  if (selector === "enemy") {
    return "the enemy";
  }

  if (selector.zone === "battlefield") {
    if (selector.controller === "you") {
      if (selector.cardType === "creature") {
        return "a creature you control";
      }

      if (selector.cardType === "equipment") {
        return "an equipment you control";
      }

      if (selector.cardType === "permanent") {
        return "a permanent you control";
      }
    }

    if (selector.controller === "opponent") {
      if (selector.cardType === "creature") {
        return "an enemy creature";
      }

      if (selector.cardType === "equipment") {
        return "an enemy equipment";
      }

      if (selector.cardType === "permanent") {
        return "an enemy permanent";
      }
    }

    if (selector.cardType === "creature") {
      return "a creature";
    }

    if (selector.cardType === "equipment") {
      return "an equipment";
    }

    if (selector.cardType === "permanent") {
      return "a permanent";
    }

    if (selector.subtype) {
      return `a ${selector.subtype}`;
    }
  }

  if (selector.zone === "enemy_battlefield") {
    return selector.cardType === "creature" ? "an enemy creature" : "an enemy permanent";
  }

  if (selector.zone === "hand") {
    return "a card in hand";
  }

  if (selector.zone === "graveyard") {
    return "a card in the graveyard";
  }

  if (selector.zone === "discard") {
    return "a card in the discard pile";
  }

  if (selector.controller === "you") {
    return "a card you control";
  }

  if (selector.controller === "opponent") {
    return "a card controlled by the opponent";
  }

  return "a target";
}

function describeCollectionTarget(selector: Selector): string {
  if (selector.zone === "battlefield") {
    if (selector.controller === "you") {
      if (selector.subtype) {
        return `each ${selector.subtype} you control`;
      }

      if (selector.cardType === "creature") {
        return "each creature you control";
      }

      if (selector.cardType === "equipment") {
        return "each equipment you control";
      }

      if (selector.cardType === "permanent") {
        return "each permanent you control";
      }
    }

    if (selector.controller === "opponent") {
      if (selector.subtype) {
        return `each enemy ${selector.subtype}`;
      }

      if (selector.cardType === "creature") {
        return "each enemy creature";
      }

      if (selector.cardType === "equipment") {
        return "each enemy equipment";
      }

      if (selector.cardType === "permanent") {
        return "each enemy permanent";
      }
    }

    if (selector.subtype) {
      return `each ${selector.subtype} on the battlefield`;
    }

    if (selector.cardType === "creature") {
      return "each creature on the battlefield";
    }

    if (selector.cardType === "equipment") {
      return "each equipment on the battlefield";
    }

    if (selector.cardType === "permanent") {
      return "each permanent on the battlefield";
    }
  }

  if (selector.zone === "enemy_battlefield") {
    return selector.subtype
      ? `each enemy ${selector.subtype}`
      : selector.cardType === "creature"
        ? "each enemy creature"
        : "each enemy permanent";
  }

  if (selector.zone === "hand") {
    return "each card in hand";
  }

  if (selector.zone === "graveyard") {
    return "each card in the graveyard";
  }

  if (selector.zone === "discard") {
    return "each card in the discard pile";
  }

  return describeSelectorTarget(selector);
}

function describeCountExpression(expression: Extract<ValueExpression, { type: "count" }>): string {
  if (expression.selector.zone === "battlefield") {
    if (expression.selector.controller === "you" && expression.selector.cardType === "creature") {
      return "the number of creatures you control";
    }

    if (expression.selector.controller === "opponent" && expression.selector.cardType === "creature") {
      return "the number of enemy creatures";
    }

    if (expression.selector.cardType === "creature") {
      return "the number of creatures on the battlefield";
    }

    if (expression.selector.controller === "you" && expression.selector.cardType === "permanent") {
      return "the number of permanents you control";
    }

    if (expression.selector.controller === "opponent" && expression.selector.cardType === "permanent") {
      return "the number of enemy permanents";
    }

    if (expression.selector.cardType === "permanent") {
      return "the number of permanents on the battlefield";
    }
  }

  if (expression.selector.zone === "hand") {
    return "the number of cards in hand";
  }

  if (expression.selector.zone === "graveyard") {
    return "the number of cards in the graveyard";
  }

  if (expression.selector.zone === "discard") {
    return "the number of cards in the discard pile";
  }

  return `the number of ${describeCollectionTarget(expression.selector).replace(/^each /, "")}`;
}

function describeThresholdCondition(condition: Extract<Condition, { type: "threshold" }>): string {
  const subject = describeCountExpression({
    type: "count",
    selector: condition.selector,
  });

  switch (condition.op ?? ">=") {
    case "==":
      return `${subject} is exactly ${condition.value}`;
    case "!=":
      return `${subject} is not ${condition.value}`;
    case ">":
      return `${subject} is greater than ${condition.value}`;
    case ">=":
      return `${subject} is at least ${condition.value}`;
    case "<":
      return `${subject} is less than ${condition.value}`;
    case "<=":
      return `${subject} is at most ${condition.value}`;
  }
}

function describeCondition(condition: Condition): string | null {
  switch (condition.type) {
    case "exists":
      return `${describeSelectorTarget(condition.selector)} exists`;
    case "threshold":
      return describeThresholdCondition(condition);
    case "compare":
      return null;
  }
}

function describeConditions(conditions: Condition[] | undefined): string | null {
  const parts = (conditions ?? []).map(describeCondition).filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(" and ") : null;
}

function describeCounterTarget(effect: { target: "self" | Selector }): string {
  if (effect.target === "self") {
    return "this";
  }

  return describeSelectorTarget(effect.target);
}

function describeAddCounterEffect(effect: Extract<Effect, { type: "add_counter" }>): string {
  const target = describeCounterTarget(effect);
  const targetSelector = effect.target === "self" ? null : effect.target;
  const hasTargeting = Boolean(effect.targeting);
  const isTriggeredSubject =
    targetSelector !== null &&
    targetSelector.source === "trigger_subject" &&
    targetSelector.relation === "self";
  const isMassTarget =
    targetSelector !== null &&
    !hasTargeting &&
    (targetSelector.controller === undefined || targetSelector.controller === "any") &&
    (targetSelector.zone === "battlefield" || targetSelector.zone === "enemy_battlefield");
  const powerDelta = effect.powerDelta ?? 0;
  const healthDelta = effect.healthDelta ?? 0;
  const durationSuffix = effect.duration === "end_of_turn" ? " until end of turn" : "";

  if (
    typeof effect.powerDelta === "number" &&
    typeof effect.healthDelta === "number" &&
    effect.powerDelta === effect.healthDelta &&
    effect.powerDelta > 0
  ) {
    if (isTriggeredSubject) {
      return `It gets +${effect.powerDelta}/+${effect.healthDelta}${durationSuffix}.`;
    }

    if (isMassTarget && targetSelector) {
      const label = describeCollectionTarget(targetSelector);
      return `${label[0].toUpperCase()}${label.slice(1)} gets +${effect.powerDelta}/+${effect.healthDelta}${durationSuffix}.`;
    }

    return `${target === "this" ? "This" : `Choose ${target}; it`} gets +${effect.powerDelta}/+${effect.healthDelta}${durationSuffix}.`;
  }

  if (
    typeof effect.powerDelta === "number" &&
    effect.powerDelta !== 0 &&
    (effect.healthDelta === undefined || effect.healthDelta === 0)
  ) {
    const powerLabel = effect.powerDelta > 0 ? `+${effect.powerDelta}` : `${effect.powerDelta}`;

    if (isTriggeredSubject) {
      return `It gets ${powerLabel} power${durationSuffix}.`;
    }

    if (isMassTarget && targetSelector) {
      const label = describeCollectionTarget(targetSelector);
      return `${label[0].toUpperCase()}${label.slice(1)} gets ${powerLabel} power${durationSuffix}.`;
    }

    return `${target === "this" ? "This" : `Choose ${target}; it`} gets ${powerLabel} power${durationSuffix}.`;
  }

  if (
    powerDelta === 0 &&
    typeof effect.healthDelta === "number" &&
    effect.healthDelta > 0
  ) {
    if (isTriggeredSubject) {
      return `It gets +0/+${effect.healthDelta}${durationSuffix}.`;
    }

    return `${target === "this" ? "This" : `Choose ${target}; it`} gets +0/+${effect.healthDelta}${durationSuffix}.`;
  }

  const amount =
    typeof effect.amount === "object" &&
    effect.amount !== null &&
    "type" in effect.amount &&
    effect.amount.type === "constant"
      ? effect.amount.value
      : Math.max(Math.abs(powerDelta), Math.abs(healthDelta), 1);
  const counterLabel = effect.counter ?? `${powerDelta >= 0 ? "+" : ""}${powerDelta}/${healthDelta >= 0 ? "+" : ""}${healthDelta}`;

  if (isTriggeredSubject) {
    return `It gains ${formatCount(amount)} ${counterLabel} counter${amount === 1 ? "" : "s"}${durationSuffix}.`;
  }

  if (isMassTarget && targetSelector) {
    const label = describeCollectionTarget(targetSelector);
    return `${label[0].toUpperCase()}${label.slice(1)} gains ${formatCount(amount)} ${counterLabel} counter${amount === 1 ? "" : "s"}${durationSuffix}.`;
  }

  if (target.startsWith("each ")) {
    return `${target[0].toUpperCase()}${target.slice(1)} gains ${formatCount(amount)} ${counterLabel} counter${amount === 1 ? "" : "s"}${durationSuffix}.`;
  }

  return `${target === "this" ? "This" : `Choose ${target}; it`} gains ${formatCount(amount)} ${counterLabel} counter${amount === 1 ? "" : "s"}${durationSuffix}.`;
}

function describeRemoveCounterEffect(effect: Extract<Effect, { type: "remove_counter" }>): string {
  const target = describeCounterTarget(effect);
  const amount =
    typeof effect.amount === "object" &&
    effect.amount !== null &&
    "type" in effect.amount &&
    effect.amount.type === "constant"
      ? effect.amount.value
      : 1;
  return `${target === "this" ? "This" : `Choose ${target}; it`} loses ${formatCount(amount)} ${effect.counter} counter${amount === 1 ? "" : "s"}.`;
}

function describeGrantKeywordEffect(effect: Extract<Effect, { type: "grant_keyword" }>): string {
  const target = describeCounterTarget(effect);
  const durationSuffix = effect.duration === "end_of_turn" ? " until end of turn" : "";

  return `${target === "this" ? "This" : `Choose ${target}; it`} gains ${effect.keyword}${durationSuffix}.`;
}

function describeSacrificeTarget(selector: Selector): string {
  if (selector.controller === "you" && selector.cardType === "creature") {
    return "another creature you control";
  }

  if (selector.controller === "you" && selector.cardType === "permanent") {
    return "another permanent you control";
  }

  return describeSelectorTarget(selector);
}

function describeTrigger(trigger: Trigger): string | null {
  if (trigger.event === "self_enters_battlefield") {
    return "When this enters the battlefield";
  }

  if (trigger.event === "permanent_enters_battlefield") {
    if (trigger.selector?.controller === "you") {
      return `When ${describeSelectorTarget(trigger.selector)} enters the battlefield`;
    }

    if (trigger.selector?.controller === "opponent") {
      return `When ${describeSelectorTarget(trigger.selector)} enters the battlefield`;
    }

    return trigger.selector
      ? `When ${describeSelectorTarget(trigger.selector)} enters the battlefield`
      : "When a permanent enters the battlefield";
  }

  if (trigger.event === "permanent_died") {
    if (trigger.selector?.relation === "self") {
      return "When this dies";
    }

    return trigger.selector
      ? `When ${describeSelectorTarget(trigger.selector)} dies`
      : "When a permanent dies";
  }

  if (trigger.event === "permanent_left_battlefield") {
    return trigger.selector
      ? `When ${describeSelectorTarget(trigger.selector)} leaves the battlefield`
      : "When a permanent leaves the battlefield";
  }

  if (trigger.event === "permanent_attacked") {
    return trigger.selector
      ? `When ${describeSelectorTarget(trigger.selector)} attacks`
      : "When a permanent attacks";
  }

  if (trigger.event === "permanent_blocked") {
    return trigger.selector
      ? `When ${describeSelectorTarget(trigger.selector)} blocks`
      : "When a permanent blocks";
  }

  if (trigger.event === "permanent_becomes_blocked") {
    return trigger.selector
      ? `When ${describeSelectorTarget(trigger.selector)} becomes blocked`
      : "When a permanent becomes blocked";
  }

  if (trigger.event === "counter_added") {
    return trigger.selector
      ? `When ${describeSelectorTarget(trigger.selector)} gets a counter`
      : "When a counter is added";
  }

  if (trigger.event === "card_drawn") {
    if (trigger.selector?.controller === "you") {
      return "When you draw a card";
    }

    if (trigger.selector?.controller === "opponent") {
      return "When the opponent draws a card";
    }

    return "When a card is drawn";
  }

  if (trigger.event === "card_played") {
    if (trigger.selector?.controller === "you") {
      return "When you play a card";
    }

    if (trigger.selector?.controller === "opponent") {
      return "When the opponent plays a card";
    }

    return "When a card is played";
  }

  if (trigger.event === "spell_cast") {
    if (trigger.selector?.controller === "you") {
      return "When you cast a spell";
    }

    if (trigger.selector?.controller === "opponent") {
      return "When the opponent casts a spell";
    }

    return "When a spell is cast";
  }

  if (trigger.event === "card_discarded") {
    if (trigger.selector?.controller === "you") {
      return "When you discard a card";
    }

    if (trigger.selector?.controller === "opponent") {
      return "When the opponent discards a card";
    }

    return "When a card is discarded";
  }

  if (trigger.event === "turn_started") {
    if (trigger.player === "self" || trigger.player === "controller") {
      return "At the start of your turn";
    }

    if (trigger.player === "opponent") {
      return "At the start of the opponent's turn";
    }
  }

  return null;
}

function describeDealDamageEffect(effect: Extract<CardEffect | Effect, { target: unknown }>): string {
  const amount = "amount" in effect
    ? typeof effect.amount === "object" && effect.amount !== null && effect.amount.type === "constant"
      ? effect.amount.value
      : 0
    : 0;
  const hits = "attackTimes" in effect && effect.attackTimes && effect.attackTimes > 1 ? ` x${effect.attackTimes}` : "";

  if (effect.target === "enemy") {
    return `Deal ${amount}${hits} damage to the enemy.`;
  }

  if (effect.target === "player") {
    return `Deal ${amount}${hits} damage to you.`;
  }

  return `Choose ${describeSelectorTarget(effect.target)}; deal ${amount}${hits} damage to it.`;
}

function describeBlockEffect(effect: Extract<CardEffect | Effect, { target: unknown }>): string {
  const amount = "amount" in effect
    ? typeof effect.amount === "object" && effect.amount !== null && effect.amount.type === "constant"
      ? effect.amount.value
      : 0
    : 0;

  if (effect.target === "player") {
    return `Gain ${amount} block.`;
  }

  if (effect.target === "enemy") {
    return `The enemy gains ${amount} block.`;
  }

  return `Choose ${describeSelectorTarget(effect.target)}; give it ${amount} block.`;
}

function describeAbilityCostPrefix(ability: { costs?: AbilityCost[] }): string {
  const costs = ability.costs ?? [];
  const parts: string[] = [];

  const energyCost = costs
    .filter((cost): cost is Extract<AbilityCost, { type: "energy" }> => cost.type === "energy")
    .reduce((sum, cost) => sum + cost.amount, 0);

  if (energyCost > 0) {
    parts.push(`Pay ${energyCost} energy`);
  }

  if (costs.some((cost) => cost.type === "tap")) {
    parts.push("Tap");
  }

  return parts.length > 0 ? `${parts.join(" + ")}: ` : "";
}

function describeEffect(effect: CardEffect | Effect, preSummon = false): string {
  if ("type" in effect) {
    switch (effect.type) {
      case "sacrifice": {
        const amount = formatCount(effect.amount);
        if (preSummon) {
          return `As an additional cost, sacrifice ${amount === "1" ? describeSacrificeTarget(effect.selector) : `${amount} ${describeSacrificeTarget(effect.selector)}`}.`;
        }

        if (amount === "1") {
          return `Choose ${describeSelectorTarget(effect.selector)}; sacrifice it.`;
        }

        return `Choose ${amount} ${describeSelectorTarget(effect.selector)}; sacrifice them.`;
      }
      case "add_counter":
        return describeAddCounterEffect(effect);
      case "remove_counter":
        return describeRemoveCounterEffect(effect);
      case "grant_keyword":
        return describeGrantKeywordEffect(effect);
      case "deal_damage":
        return describeDealDamageEffect(effect);
      case "gain_block":
        return describeBlockEffect(effect);
      case "restore_health":
        return effect.target === "self"
          ? "This fully heals."
          : `Choose ${describeSelectorTarget(effect.target)}; fully heal it.`;
      case "stun":
        return "Stun the enemy.";
      case "draw_card":
        if (effect.target !== "self" && effect.target !== "player") {
          return `Choose ${describeSelectorTarget(effect.target)}; draw cards.`;
        }

        if (effect.amount.type === "constant") {
          return `Draw ${effect.amount.value} card${effect.amount.value === 1 ? "" : "s"}.`;
        }

        if (effect.amount.type === "count") {
          return `Draw X cards, where X is ${describeCountExpression(effect.amount)}.`;
        }

        return "Draw cards.";
      case "gain_energy":
        return `Gain ${effect.amount.type === "constant" ? effect.amount.value : 1} energy.`;
      case "return_from_graveyard":
        return `Choose ${describeSelectorTarget(effect.selector)}; return it to your hand.`;
      case "attach_from_hand":
        return `Choose ${describeSelectorTarget(effect.selector)}; attach it to ${describeSelectorTarget(effect.target)}.`;
      case "attach_from_battlefield":
        return `Attach this to ${describeSelectorTarget(effect.target)}.`;
      case "summon_permanent":
        return `Summon a permanent.`;
      default:
        return "Effect.";
    }
  }

  if (typeof effect.attackAmount === "number" && effect.attackAmount > 0) {
    const hits = effect.attackTimes && effect.attackTimes > 1 ? ` x${effect.attackTimes}` : "";
    if (effect.target === "enemy") {
      return `Deal ${effect.attackAmount}${hits} damage to the enemy.`;
    }

    return `Choose ${describeSelectorTarget(effect.target)}; deal ${effect.attackAmount}${hits} damage to it.`;
  }

  if (typeof effect.blockAmount === "number" && effect.blockAmount > 0) {
    if (effect.target === "player") {
      return `Gain ${effect.blockAmount} block.`;
    }

    return `Choose ${describeSelectorTarget(effect.target)}; give it ${effect.blockAmount} block.`;
  }

  if (effect.summonSelf) {
    return "Summon this card.";
  }

  return "Effect.";
}

function describeAbility(ability: Ability): string[] {
  const conditionText = describeConditions("conditions" in ability ? ability.conditions : undefined);

  if (ability.kind === "triggered") {
    const triggerSummary = describeTrigger(ability.trigger);
    if (triggerSummary && ability.effects?.length) {
      const prefix = conditionText ? `${triggerSummary} if ${conditionText}, ` : `${triggerSummary}, `;
      return [`${prefix}${lowercaseFirst(summarizeEffects(ability.effects).join(" "))}`];
    }

    return [];
  }

  if (ability.kind === "static") {
    const { modifier } = ability;
    if (modifier.target !== "self") {
      return [];
    }

    if (modifier.operation === "add" && modifier.value.type === "count") {
      const targetLabel = describeCollectionTarget(modifier.value.selector).replace(/^each /, "");
      return [`This gets +1 ${modifier.stat} for each ${targetLabel}.`];
    }

    if (modifier.operation === "add" && modifier.value.type === "constant") {
      return [`This gets +${modifier.value.value} ${modifier.stat}.`];
    }

    return [];
  }

  if (ability.kind === "activated") {
    const effectSummary = summarizeEffects(ability.effects).join(" ");
    if (!effectSummary) {
      return [];
    }

    const conditionPrefix = conditionText ? `if ${conditionText}, ` : "";
    return [`${describeAbilityCostPrefix(ability)}${conditionPrefix}${effectSummary}`];
  }

  return [];
}

function summarizeEffects(
  effects: Array<CardEffect | Effect> | undefined,
  preSummon = false,
): string[] {
  return (effects ?? []).map((effect) => describeEffect(effect, preSummon));
}

export function summarizeCardDefinition(definition: CardDefinition): string[] {
  const summaryLines: string[] = [];

  if (isPermanentCardDefinition(definition)) {
    if (definition.subtypes?.includes("Equipment")) {
      summaryLines.push("Equip a permanent.");

      const powerBonus = scaleEquipmentBonusAmount(definition.power);
      const healthBonus = scaleEquipmentBonusAmount(definition.health);
      const powerLabel = `${powerBonus >= 0 ? "+" : ""}${powerBonus}`;
      const healthLabel = `${healthBonus >= 0 ? "+" : ""}${healthBonus}`;
      summaryLines.push(`Equipped permanent gets ${powerLabel}/${healthLabel}.`);
      if (definition.attackAllEnemyPermanents) {
        summaryLines.push("Equipped creature attacks all enemy permanents.");
      }
      for (const keyword of definition.grantedKeywords ?? []) {
        if (keyword === "refresh") {
          summaryLines.push("Equipped creature has **Refresh**.");
        }

        if (keyword === "halt") {
          summaryLines.push("Equipped creature has **Halt**.");
        }

        if (keyword === "pierce") {
          summaryLines.push("Equipped creature has **Pierce**.");
        }

        if (keyword === "hexproof") {
          summaryLines.push("Equipped creature has **Hexproof**.");
        }

        if (keyword === "indestructible") {
          summaryLines.push("Equipped creature has **Indestructible**.");
        }
      }
    } else if (!hasCardType(definition, "creature") && !(definition.abilities?.length ?? 0)) {
      summaryLines.push(`Summon ${definition.name}.`);
    }

    if (definition.keywords?.includes("refresh") || definition.recoveryPolicy === "full_heal") {
      summaryLines.push("**Refresh**");
    }

    if (definition.keywords?.includes("halt")) {
      summaryLines.push("**Halt**");
    }

    if (definition.keywords?.includes("menace")) {
      summaryLines.push("**Menace**");
    }

    if (definition.keywords?.includes("deathtouch")) {
      summaryLines.push("**Deathtouch** — Any creature that deals or receives damage from this creature is destroyed.");
    }

    if (definition.keywords?.includes("pierce")) {
      summaryLines.push("**Pierce** — This creature's damage ignores block and is dealt directly to health.");
    }

    if (definition.keywords?.includes("hexproof")) {
      summaryLines.push("**Hexproof** — Debuff effects can't target or affect this permanent.");
    }

    if (definition.keywords?.includes("indestructible")) {
      summaryLines.push("**Indestructible** — This creature takes no damage.");
    }

    summaryLines.push(...summarizeEffects(definition.preSummonEffects, true));
    summaryLines.push(...(definition.abilities ?? []).flatMap(describeAbility));
  } else {
    summaryLines.push(...summarizeEffects(definition.spellEffects?.length ? definition.spellEffects : definition.onPlay));
  }

  return summaryLines.filter((line) => line.length > 0);
}
