import type {
  CounterName,
  CounterStat,
  PermanentCounter,
  PermanentState,
} from "./types.js";

export type CounterSummary = Record<string, number>;

export function getPermanentCounterCount(
  permanent: PermanentState,
  counter: CounterName,
  stat?: CounterStat,
): number {
  return (permanent.counters ?? []).filter(
    (entry) => entry.counter === counter && (!stat || entry.stat === stat),
  ).length;
}

export function getPermanentCounterAmount(
  permanent: PermanentState,
  stat: CounterStat,
): number {
  return (permanent.counters ?? [])
    .filter((entry) => entry.stat === stat)
    .reduce((sum, entry) => sum + entry.amount, 0);
}

export function summarizePermanentCounters(
  counters: PermanentCounter[] | undefined,
): CounterSummary {
  const summary: CounterSummary = {};

  for (const counter of counters ?? []) {
    summary[counter.counter] = (summary[counter.counter] ?? 0) + 1;
  }

  return summary;
}

export function getCounterDisplaySummary(
  counters: PermanentCounter[] | undefined,
): Array<{ counter: CounterName; stat: CounterStat; amount: number; count: number }> {
  const summary = new Map<string, { counter: CounterName; stat: CounterStat; amount: number; count: number }>();

  for (const counter of counters ?? []) {
    const key = `${counter.counter}:${counter.stat}`;
    const existing = summary.get(key);

    if (existing) {
      existing.count += 1;
      existing.amount += counter.amount;
      continue;
    }

    summary.set(key, {
      counter: counter.counter,
      stat: counter.stat,
      amount: counter.amount,
      count: 1,
    });
  }

  return [...summary.values()];
}

