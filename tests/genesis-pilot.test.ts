import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  GENESIS_CHAPTER_BANDS,
  GENESIS_REQUIRED_ANCHORS,
  ensureGenesisRequiredAnchors,
  parseGenesisRawSource,
  serializeGenesisIntermediateCsv,
  validateGenesisChapterBands,
  validateGenesisChapters,
  validateGenesisConceptRecords,
} from "../src/biblical/genesis-pilot.js";
import { repoRoot } from "./helpers.js";

describe("genesis pilot", () => {
  it("parses the raw Genesis source into 50 chapters", async () => {
    const rawPath = path.join(repoRoot, "data", "sources", "kjv", "genesis.raw.txt");
    const raw = await readFile(rawPath, "utf8");
    const chapters = parseGenesisRawSource(raw);

    validateGenesisChapters(chapters);

    expect(chapters).toHaveLength(50);
    expect(chapters[0]?.chapter).toBe(1);
    expect(chapters[49]?.chapter).toBe(50);
    expect(chapters[0]?.verses[0]?.text).toContain("In the beginning");
    expect(chapters[49]?.text).toContain("a coffin in Egypt");
  });

  it("assigns each Genesis chapter band exactly once", () => {
    validateGenesisChapterBands();

    expect(GENESIS_CHAPTER_BANDS).toEqual([
      { start: 1, end: 11 },
      { start: 12, end: 25 },
      { start: 26, end: 37 },
      { start: 38, end: 50 },
    ]);
  });

  it("keeps the curated Genesis concept set valid and anchor-complete", async () => {
    const conceptsPath = path.join(repoRoot, "data", "sources", "kjv", "genesis.concepts.json");
    const raw = await readFile(conceptsPath, "utf8");
    const records = JSON.parse(raw) as Parameters<typeof validateGenesisConceptRecords>[0];

    validateGenesisConceptRecords(records);
    ensureGenesisRequiredAnchors(records);

    const csv = serializeGenesisIntermediateCsv(records);

    expect(
      csv.startsWith(
        "simple_name,source_book,source_period,category,chapter_start,chapter_end,confidence,notes\n",
      ),
    ).toBe(true);
    expect(csv).toContain("Adam,Genesis,Genesis,Person");
    expect(csv).toContain("The Flood,Genesis,Genesis,Event");
    expect(csv).toContain("Abraham,Genesis,Genesis,Person");
    expect(records.length).toBeGreaterThanOrEqual(80);
    expect(records.length).toBeLessThanOrEqual(220);
    expect(
      GENESIS_REQUIRED_ANCHORS.every((anchor) =>
        records.some((record) => record.simple_name === anchor),
      ),
    ).toBe(true);
  });
});

