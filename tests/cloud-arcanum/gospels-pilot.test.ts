import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  GOSPEL_BOOK_CONFIGS,
  GOSPELS_CHAPTER_BANDS,
  GOSPELS_REQUIRED_ANCHORS,
  ensureGospelsRequiredAnchors,
  parseGospelRawSource,
  serializeGospelsIntermediateCsv,
  validateGospelChapters,
  validateGospelsChapterBands,
  validateGospelsConceptRecords,
} from "../../src/biblical/gospels-pilot.js";
import { repoRoot } from "./helpers.js";

describe("gospels pilot", () => {
  it("parses each raw Gospel source into the expected chapter count", async () => {
    for (const config of GOSPEL_BOOK_CONFIGS) {
      const raw = await readFile(path.join(repoRoot, config.rawSourcePath), "utf8");
      const chapters = parseGospelRawSource(raw, config);

      validateGospelChapters(config.book, chapters);

      expect(chapters).toHaveLength(config.chapterCount);
      expect(chapters[0]?.chapter).toBe(1);
      expect(chapters.at(-1)?.chapter).toBe(config.chapterCount);
    }
  });

  it("assigns each Gospel chapter band exactly once", () => {
    validateGospelsChapterBands();

    expect(GOSPELS_CHAPTER_BANDS).toEqual([
      { book: "Matthew", start: 1, end: 28 },
      { book: "Mark", start: 1, end: 16 },
      { book: "Luke", start: 1, end: 24 },
      { book: "John", start: 1, end: 21 },
    ]);
  });

  it("keeps the curated Gospel concept set valid and anchor-complete", async () => {
    const conceptsPath = path.join(repoRoot, "data", "sources", "kjv", "gospels.concepts.json");
    const raw = await readFile(conceptsPath, "utf8");
    const records = JSON.parse(raw) as Parameters<typeof validateGospelsConceptRecords>[0];

    validateGospelsConceptRecords(records);
    ensureGospelsRequiredAnchors(records);

    const csv = serializeGospelsIntermediateCsv(records);

    expect(
      csv.startsWith(
        "simple_name,source_book,source_period,category,chapter_start,chapter_end,confidence,notes\n",
      ),
    ).toBe(true);
    expect(csv).toContain("Jesus Christ,Matthew,Gospels,Person");
    expect(csv).toContain("Water into Wine,John,Gospels,Miracle");
    expect(csv).toContain("The Good Samaritan,Luke,Gospels,Theme/Symbol");
    expect(records.length).toBeGreaterThanOrEqual(80);
    expect(records.length).toBeLessThanOrEqual(220);
    expect(
      GOSPELS_REQUIRED_ANCHORS.every((anchor) =>
        records.some((record) => record.simple_name === anchor),
      ),
    ).toBe(true);
  });
});
