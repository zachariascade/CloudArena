export function getTotalAttackAmount(input: {
  attackAmount?: number;
  attackTimes?: number;
}): number {
  if (typeof input.attackAmount !== "number" || input.attackAmount <= 0) {
    return 0;
  }

  return input.attackAmount * Math.max(1, input.attackTimes ?? 1);
}

export function hasAttackAmount(input: {
  attackAmount?: number;
}): boolean {
  return typeof input.attackAmount === "number" && input.attackAmount > 0;
}

export function hasBlockAmount(input: {
  blockAmount?: number;
}): boolean {
  return typeof input.blockAmount === "number" && input.blockAmount > 0;
}
