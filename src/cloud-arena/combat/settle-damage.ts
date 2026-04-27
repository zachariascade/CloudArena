import { emitRulesEvent } from "../core/rules-events.js";
import { findPermanentById } from "../core/selectors.js";
import { permanentHasKeyword } from "../core/permanents.js";
import type { BattleState, DamageOverflowPolicy } from "../core/types.js";

function applyDamageToBlockAndHealth(
  damage: number,
  target: { block: number; health: number },
): number {
  if (target.block >= damage) {
    target.block -= damage;
    return 0;
  }

  const remainingDamage = damage - target.block;
  target.block = 0;
  if (target.health >= remainingDamage) {
    target.health -= remainingDamage;
    return 0;
  }

  const spilloverDamage = remainingDamage - target.health;
  target.health = 0;
  return spilloverDamage;
}

function logEnemyDamage(
  state: BattleState,
  amount: number,
  target: "player" | "permanent",
  targetId?: string,
): void {
  if (amount <= 0) {
    return;
  }

  state.log.push({
    type: "damage_dealt",
    turnNumber: state.turnNumber,
    source: "enemy_intent",
    target,
    targetId,
    amount,
  });
}

function applyEnemyDamageToPlayerBlock(
  state: BattleState,
  damage: number,
): number {
  if (state.player.block <= 0) {
    return damage;
  }

  if (state.player.block >= damage) {
    state.player.block -= damage;
    logEnemyDamage(state, damage, "player");
    return 0;
  }

  const absorbedByPlayerBlock = state.player.block;
  state.player.block = 0;
  logEnemyDamage(state, absorbedByPlayerBlock, "player");
  return damage - absorbedByPlayerBlock;
}

function applyEnemyDamageToDefenders(
  state: BattleState,
  damage: number,
  sourcePermanentId: string,
): { remainingDamage: number; defended: boolean; halted: boolean } {
  let remainingDamage = damage;
  let defended = false;
  let halted = false;

  for (const permanentId of state.blockingQueue) {
    if (remainingDamage <= 0) {
      break;
    }

    const permanent = findPermanentById(state, permanentId);

    if (!permanent) {
      continue;
    }

    if (permanent.blockingTargetPermanentId !== sourcePermanentId) {
      continue;
    }

    defended = true;
    halted ||= permanentHasKeyword(permanent, "halt");
    const beforeCombined = permanent.block + permanent.health;
    remainingDamage = applyDamageToBlockAndHealth(remainingDamage, permanent);
    const absorbedByPermanent = beforeCombined - (permanent.block + permanent.health);
    logEnemyDamage(state, absorbedByPermanent, "permanent", permanent.instanceId);
    if (absorbedByPermanent > 0) {
      emitRulesEvent(state, {
        type: "permanent_becomes_blocked",
        turnNumber: state.turnNumber,
        permanentId: permanent.instanceId,
        sourceCardInstanceId: permanent.sourceCardInstanceId,
        definitionId: permanent.definitionId,
        controllerId: permanent.controllerId ?? "player",
        slotIndex: permanent.slotIndex,
      });
    }
  }

  return { remainingDamage, defended, halted };
}

function applyEnemyDamageToPlayerHealth(
  state: BattleState,
  damage: number,
): void {
  if (damage <= 0) {
    return;
  }

  state.player.health -= damage;
  logEnemyDamage(state, damage, "player");
}

export function settleEnemyAttackDamage(
  state: BattleState,
  damage: number,
  sourcePermanentId: string,
  overflowPolicy: DamageOverflowPolicy = "overflow",
): BattleState {
  let remainingDamage = damage;

  remainingDamage = applyEnemyDamageToPlayerBlock(state, remainingDamage);

  const sourcePermanent = findPermanentById(state, sourcePermanentId);
  const hasMenace = sourcePermanent ? permanentHasKeyword(sourcePermanent, "menace") : false;
  const blockerCount = hasMenace
    ? state.blockingQueue.filter(
        (id) => findPermanentById(state, id)?.blockingTargetPermanentId === sourcePermanentId,
      ).length
    : Infinity;
  const canBeBlocked = !hasMenace || blockerCount >= 2;

  const defenderResult = canBeBlocked
    ? applyEnemyDamageToDefenders(state, remainingDamage, sourcePermanentId)
    : { remainingDamage, defended: false, halted: false };
  remainingDamage = defenderResult.remainingDamage;
  if (defenderResult.defended && overflowPolicy === "stop_at_blocker") {
    remainingDamage = 0;
  }
  if (defenderResult.halted && overflowPolicy !== "trample") {
    remainingDamage = 0;
  }
  applyEnemyDamageToPlayerHealth(state, remainingDamage);

  return state;
}
