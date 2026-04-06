import { readFile } from "node:fs/promises";

export type ExodusVerse = {
  chapter: number;
  verse: number;
  text: string;
};

export type ExodusChapter = {
  chapter: number;
  verses: ExodusVerse[];
  text: string;
};

export type ExodusSourceManifest = {
  book: "Exodus";
  chapterCount: 40;
  sourcePeriod: "Egypt & Exodus";
  rawSourcePath: string;
  normalizedSourcePath: string;
};

export type ExodusConceptCategory =
  | "Person"
  | "Place"
  | "Relic"
  | "Item"
  | "Event"
  | "Creature"
  | "Miracle"
  | "Judgment"
  | "Law/Rite"
  | "Theme/Symbol";

export type ExodusConceptRecord = {
  simple_name: string;
  source_book: "Exodus";
  source_period: "Egypt & Exodus";
  category: ExodusConceptCategory;
  chapter_start: number;
  chapter_end: number;
  confidence: number;
  notes: string;
};

export type ExodusSourceDocument = {
  manifest: ExodusSourceManifest;
  chapters: ExodusChapter[];
};

export const EXODUS_SOURCE_PERIOD = "Egypt & Exodus";
export const EXODUS_BOOK = "Exodus";
export const EXODUS_CHAPTER_COUNT = 40;

export const EXODUS_CHAPTER_BANDS = [
  { start: 1, end: 10 },
  { start: 11, end: 20 },
  { start: 21, end: 31 },
  { start: 32, end: 40 },
] as const;

export const EXODUS_REQUIRED_ANCHORS = [
  "Moses",
  "Aaron",
  "Pharaoh",
  "The Burning Bush",
  "Passover",
  "Ten Plagues of Egypt",
  "Parting of the Red Sea",
  "Manna from Heaven",
  "Ten Commandments",
  "Golden Calf",
  "Tabernacle",
  "Ark of the Covenant",
  "Pillar of Cloud",
  "Pillar of Fire",
] as const;

const EXODUS_CATEGORY_SET = new Set<ExodusConceptCategory>([
  "Person",
  "Place",
  "Relic",
  "Item",
  "Event",
  "Creature",
  "Miracle",
  "Judgment",
  "Law/Rite",
  "Theme/Symbol",
]);

const VERSE_LINE_PATTERN = /^02:(\d{3}):(\d{3})\s+(.*)$/;

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeConceptKey(value: string): string {
  return normalizeWhitespace(value)
    .normalize("NFKD")
    .replace(/[’']/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .toLowerCase();
}

export function parseExodusRawSource(rawText: string): ExodusChapter[] {
  const cleanedText = rawText.replace(/^\uFEFF/, "");
  const lines = cleanedText.split(/\r?\n/);
  const verses: ExodusVerse[] = [];
  let currentVerse: ExodusVerse | null = null;
  let inBookBody = false;

  for (const line of lines) {
    if (!inBookBody) {
      if (line.includes("Book 02") && line.includes("Exodus")) {
        inBookBody = true;
      }
      continue;
    }

    if (line.includes("*** END OF THE PROJECT GUTENBERG EBOOK")) {
      break;
    }

    const verseMatch = line.match(VERSE_LINE_PATTERN);

    if (verseMatch) {
      const chapter = Number.parseInt(verseMatch[1], 10);
      const verse = Number.parseInt(verseMatch[2], 10);
      const text = normalizeWhitespace(verseMatch[3]);

      currentVerse = {
        chapter,
        verse,
        text,
      };

      verses.push(currentVerse);
      continue;
    }

    if (currentVerse && line.trim().length > 0) {
      currentVerse.text = normalizeWhitespace(`${currentVerse.text} ${line.trim()}`);
    }
  }

  const chapters = new Map<number, ExodusVerse[]>();

  for (const verse of verses) {
    const chapterVerses = chapters.get(verse.chapter) ?? [];
    chapterVerses.push(verse);
    chapters.set(verse.chapter, chapterVerses);
  }

  return [...chapters.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([chapter, chapterVerses]) => ({
      chapter,
      verses: chapterVerses.sort((left, right) => left.verse - right.verse),
      text: chapterVerses.map((verse) => `${verse.verse}. ${verse.text}`).join("\n"),
    }));
}

export function validateExodusChapters(chapters: ExodusChapter[]): void {
  if (chapters.length !== EXODUS_CHAPTER_COUNT) {
    throw new Error(
      `Expected ${EXODUS_CHAPTER_COUNT} chapters in Exodus, found ${chapters.length}.`,
    );
  }

  const chapterMap = new Map(chapters.map((chapter) => [chapter.chapter, chapter]));

  for (let chapter = 1; chapter <= EXODUS_CHAPTER_COUNT; chapter += 1) {
    const chapterRecord = chapterMap.get(chapter);

    if (!chapterRecord) {
      throw new Error(`Missing Exodus chapter ${chapter}.`);
    }

    if (chapterRecord.verses.length === 0) {
      throw new Error(`Exodus chapter ${chapter} did not contain any verses.`);
    }
  }
}

export function validateChapterBands(): void {
  const coveredChapters = new Map<number, number>();

  for (const band of EXODUS_CHAPTER_BANDS) {
    for (let chapter = band.start; chapter <= band.end; chapter += 1) {
      coveredChapters.set(chapter, (coveredChapters.get(chapter) ?? 0) + 1);
    }
  }

  for (let chapter = 1; chapter <= EXODUS_CHAPTER_COUNT; chapter += 1) {
    if (coveredChapters.get(chapter) !== 1) {
      throw new Error(`Expected Exodus chapter ${chapter} to be assigned exactly once.`);
    }
  }
}

export function buildExodusManifest(): ExodusSourceManifest {
  return {
    book: EXODUS_BOOK,
    chapterCount: EXODUS_CHAPTER_COUNT,
    sourcePeriod: EXODUS_SOURCE_PERIOD,
    rawSourcePath: "data/sources/kjv/exodus.raw.txt",
    normalizedSourcePath: "data/sources/kjv/exodus.json",
  };
}

export async function loadExodusSourceDocument(filePath: string): Promise<ExodusSourceDocument> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as ExodusSourceDocument;
}

export async function loadExodusConceptRecords(filePath: string): Promise<ExodusConceptRecord[]> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as ExodusConceptRecord[];
}

export function validateConceptRecords(records: ExodusConceptRecord[]): void {
  const seenKeys = new Set<string>();

  for (const record of records) {
    if (normalizeWhitespace(record.simple_name).length === 0) {
      throw new Error("Encountered a blank simple_name in Exodus concept records.");
    }

    if (record.source_book !== EXODUS_BOOK) {
      throw new Error(`Unexpected source_book "${record.source_book}".`);
    }

    if (record.source_period !== EXODUS_SOURCE_PERIOD) {
      throw new Error(`Unexpected source_period "${record.source_period}".`);
    }

    if (!EXODUS_CATEGORY_SET.has(record.category)) {
      throw new Error(`Unexpected Exodus concept category "${record.category}".`);
    }

    if (
      record.chapter_start < 1 ||
      record.chapter_start > EXODUS_CHAPTER_COUNT ||
      record.chapter_end < 1 ||
      record.chapter_end > EXODUS_CHAPTER_COUNT ||
      record.chapter_start > record.chapter_end
    ) {
      throw new Error(
        `Invalid Exodus chapter span ${record.chapter_start}-${record.chapter_end} for "${record.simple_name}".`,
      );
    }

    if (record.confidence < 0 || record.confidence > 1) {
      throw new Error(`Invalid confidence for "${record.simple_name}".`);
    }

    const duplicateKey = normalizeConceptKey(record.simple_name);
    if (seenKeys.has(duplicateKey)) {
      throw new Error(`Duplicate Exodus concept record "${record.simple_name}".`);
    }

    seenKeys.add(duplicateKey);
  }
}

export function ensureRequiredAnchors(records: ExodusConceptRecord[]): void {
  const recordNames = new Set(records.map((record) => normalizeConceptKey(record.simple_name)));

  for (const anchor of EXODUS_REQUIRED_ANCHORS) {
    if (!recordNames.has(normalizeConceptKey(anchor))) {
      throw new Error(`Missing required Exodus anchor "${anchor}".`);
    }
  }
}

export function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function serializeIntermediateCsv(records: ExodusConceptRecord[]): string {
  const rows = [
    [
      "simple_name",
      "source_book",
      "source_period",
      "category",
      "chapter_start",
      "chapter_end",
      "confidence",
      "notes",
    ].join(","),
    ...records.map((record) =>
      [
        record.simple_name,
        record.source_book,
        record.source_period,
        record.category,
        String(record.chapter_start),
        String(record.chapter_end),
        record.confidence.toFixed(2),
        record.notes,
      ]
        .map(escapeCsvValue)
        .join(","),
    ),
  ];

  return `${rows.join("\n")}\n`;
}
