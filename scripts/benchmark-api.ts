import { createCloudArcanumApiLoaders } from "../apps/cloud-arcanum-api/src/loaders/index.js";
import { createCloudArcanumApiServices } from "../apps/cloud-arcanum-api/src/services/index.js";
import {
  countCards,
  queryCardIds,
  queryCards,
  queryCardSummaries,
} from "../apps/cloud-arcanum-api/src/services/queries.js";

type BenchmarkSample = {
  label: string;
  ms: number;
};

type BenchmarkScenario = {
  label: string;
  size: number;
  pageOnlyMs: number;
  searchMs: number;
  summaryMs: number;
  idsMs: number;
  countMs: number;
};

function measureMs(fn: () => unknown): number {
  const start = process.hrtime.bigint();
  fn();
  return Number(process.hrtime.bigint() - start) / 1e6;
}

function averageMs(fn: () => unknown, iterations = 10): number {
  let total = 0;

  for (let index = 0; index < iterations; index += 1) {
    total += measureMs(fn);
  }

  return Number((total / iterations).toFixed(2));
}

async function measureAsyncMs(fn: () => Promise<unknown>): Promise<number> {
  const start = process.hrtime.bigint();
  await fn();
  return Number(process.hrtime.bigint() - start) / 1e6;
}

async function main(): Promise<void> {
  const workspaceRoot = process.cwd();
  const loaders = createCloudArcanumApiLoaders({ workspaceRoot });
  const services = createCloudArcanumApiServices(loaders, {
    validationCacheTtlMs: 5_000,
    normalizedDataCacheTtlMs: 5_000,
  });

  const coldSamples: BenchmarkSample[] = [
    {
      label: "dataFingerprint",
      ms: Number((await measureAsyncMs(() => loaders.loadDataFingerprint())).toFixed(2)),
    },
    {
      label: "loadNormalizedData.cold",
      ms: Number((await measureAsyncMs(() => services.loadNormalizedData())).toFixed(2)),
    },
    {
      label: "loadNormalizedData.warm",
      ms: Number((await measureAsyncMs(() => services.loadNormalizedData())).toFixed(2)),
    },
  ];

  const normalized = await services.loadNormalizedData();
  const baseCards = normalized.cards;
  const sizes = [baseCards.length, 1_000, 5_000, 10_000];

  const scenarios: BenchmarkScenario[] = sizes.map((size) => {
    const cards = Array.from({ length: size }, (_, index) => baseCards[index % baseCards.length]!);
    const synthetic = {
      ...normalized,
      cards,
    };

    return {
      label: size === baseCards.length ? "current" : `synthetic-${size}`,
      size,
      pageOnlyMs: averageMs(() => queryCards(synthetic, { page: 1, pageSize: 50 })),
      searchMs: averageMs(() => queryCards(synthetic, { q: "angel", page: 1, pageSize: 50 })),
      summaryMs: averageMs(() =>
        queryCardSummaries(synthetic, {
          hasUnresolvedMechanics: true,
          page: 1,
          pageSize: 50,
          sort: "updatedAt",
          direction: "desc",
        }),
      ),
      idsMs: averageMs(() =>
        queryCardIds(synthetic, {
          hasUnresolvedMechanics: true,
          page: 1,
          pageSize: 50,
          sort: "updatedAt",
          direction: "desc",
        }),
      ),
      countMs: averageMs(() =>
        countCards(synthetic, {
          hasUnresolvedMechanics: true,
          sort: "updatedAt",
          direction: "desc",
        }),
      ),
    };
  });

  console.log(
    JSON.stringify(
      {
        benchmarkedAt: new Date().toISOString(),
        workspaceRoot,
        coldSamples,
        scenarios,
      },
      null,
      2,
    ),
  );
}

await main();
