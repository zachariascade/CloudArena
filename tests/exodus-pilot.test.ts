import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  EXODUS_CHAPTER_BANDS,
  EXODUS_REQUIRED_ANCHORS,
  ensureRequiredAnchors,
  parseExodusRawSource,
  serializeIntermediateCsv,
  validateChapterBands,
  validateConceptRecords,
  validateExodusChapters,
} from "../src/biblical/exodus-pilot.js";
import { repoRoot } from "./helpers.js";

describe("exodus pilot", () => {
  it("parses the raw Exodus source into 40 chapters", async () => {
    const rawPath = path.join(repoRoot, "data", "sources", "kjv", "exodus.raw.txt");
    const raw = await readFile(rawPath, "utf8");
    const chapters = parseExodusRawSource(raw);

    validateExodusChapters(chapters);

    expect(chapters).toHaveLength(40);
    expect(chapters[0]?.chapter).toBe(1);
    expect(chapters[39]?.chapter).toBe(40);
    expect(chapters[0]?.verses[0]?.text).toContain("Now these are the names");
    expect(chapters[39]?.text).toContain("the cloud of the LORD");
  });

  it("assigns each Exodus chapter band exactly once", () => {
    validateChapterBands();

    expect(EXODUS_CHAPTER_BANDS).toEqual([
      { start: 1, end: 10 },
      { start: 11, end: 20 },
      { start: 21, end: 31 },
      { start: 32, end: 40 },
    ]);
  });

  it("keeps the curated Exodus concept set valid and anchor-complete", async () => {
    const conceptsPath = path.join(repoRoot, "data", "sources", "kjv", "exodus.concepts.json");
    const raw = await readFile(conceptsPath, "utf8");
    const records = JSON.parse(raw) as Parameters<typeof validateConceptRecords>[0];

    validateConceptRecords(records);
    ensureRequiredAnchors(records);

    const csv = serializeIntermediateCsv(records);

    expect(
      csv.startsWith(
        "simple_name,source_book,source_period,category,chapter_start,chapter_end,confidence,notes\n",
      ),
    ).toBe(true);
    expect(csv).toContain("Moses,Exodus,Egypt & Exodus,Person");
    expect(csv).toContain("Passover,Exodus,Egypt & Exodus,Law/Rite");
    expect(csv).toContain("Tabernacle,Exodus,Egypt & Exodus,Relic");
    expect(records.length).toBeGreaterThanOrEqual(60);
    expect(records.length).toBeLessThanOrEqual(160);
    expect(
      EXODUS_REQUIRED_ANCHORS.every((anchor) =>
        records.some((record) => record.simple_name === anchor),
      ),
    ).toBe(true);
  });
});
