import { readFile } from "node:fs/promises";

export type GenesisVerse = {
  chapter: number;
  verse: number;
  text: string;
};

export type GenesisChapter = {
  chapter: number;
  verses: GenesisVerse[];
  text: string;
};

export type GenesisSourceManifest = {
  book: "Genesis";
  chapterCount: 50;
  sourcePeriod: "Genesis";
  rawSourcePath: string;
  normalizedSourcePath: string;
};

export type GenesisConceptCategory =
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

export type GenesisConceptRecord = {
  simple_name: string;
  source_book: "Genesis";
  source_period: "Genesis";
  category: GenesisConceptCategory;
  chapter_start: number;
  chapter_end: number;
  confidence: number;
  notes: string;
};

export type GenesisSourceDocument = {
  manifest: GenesisSourceManifest;
  chapters: GenesisChapter[];
};

export const GENESIS_SOURCE_PERIOD = "Genesis";
export const GENESIS_BOOK = "Genesis";
export const GENESIS_CHAPTER_COUNT = 50;

export const GENESIS_CHAPTER_BANDS = [
  { start: 1, end: 11 },
  { start: 12, end: 25 },
  { start: 26, end: 37 },
  { start: 38, end: 50 },
] as const;

export const GENESIS_REQUIRED_ANCHORS = [
  "Adam",
  "Eve",
  "Noah",
  "Abraham",
  "Sarah",
  "Isaac",
  "Jacob",
  "Joseph",
  "Eden",
  "The Fall",
  "The Flood",
  "Tower of Babel",
  "Covenant of the Rainbow",
  "Call of Abram",
  "The Binding on Moriah",
  "Jacob's Ladder",
  "Wrestling with God",
  "The Coat of Many Colors",
  "Sold for Silver",
  "Dreams of Sun and Sheaves",
] as const;

const GENESIS_CATEGORY_SET = new Set<GenesisConceptCategory>([
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

const VERSE_LINE_PATTERN = /^01:(\d{3}):(\d{3})\s+(.*)$/;

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

export function parseGenesisRawSource(rawText: string): GenesisChapter[] {
  const cleanedText = rawText.replace(/^\uFEFF/, "");
  const lines = cleanedText.split(/\r?\n/);
  const verses: GenesisVerse[] = [];
  let currentVerse: GenesisVerse | null = null;
  let inBookBody = false;

  for (const line of lines) {
    if (!inBookBody) {
      if (line.includes("Book 01") && line.includes("Genesis")) {
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

  const chapters = new Map<number, GenesisVerse[]>();

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

export function validateGenesisChapters(chapters: GenesisChapter[]): void {
  if (chapters.length !== GENESIS_CHAPTER_COUNT) {
    throw new Error(
      `Expected ${GENESIS_CHAPTER_COUNT} chapters in Genesis, found ${chapters.length}.`,
    );
  }

  const chapterMap = new Map(chapters.map((chapter) => [chapter.chapter, chapter]));

  for (let chapter = 1; chapter <= GENESIS_CHAPTER_COUNT; chapter += 1) {
    const chapterRecord = chapterMap.get(chapter);

    if (!chapterRecord) {
      throw new Error(`Missing Genesis chapter ${chapter}.`);
    }

    if (chapterRecord.verses.length === 0) {
      throw new Error(`Genesis chapter ${chapter} did not contain any verses.`);
    }
  }
}

export function validateGenesisChapterBands(): void {
  const coveredChapters = new Map<number, number>();

  for (const band of GENESIS_CHAPTER_BANDS) {
    for (let chapter = band.start; chapter <= band.end; chapter += 1) {
      coveredChapters.set(chapter, (coveredChapters.get(chapter) ?? 0) + 1);
    }
  }

  for (let chapter = 1; chapter <= GENESIS_CHAPTER_COUNT; chapter += 1) {
    if (coveredChapters.get(chapter) !== 1) {
      throw new Error(`Expected Genesis chapter ${chapter} to be assigned exactly once.`);
    }
  }
}

export function buildGenesisManifest(): GenesisSourceManifest {
  return {
    book: GENESIS_BOOK,
    chapterCount: GENESIS_CHAPTER_COUNT,
    sourcePeriod: GENESIS_SOURCE_PERIOD,
    rawSourcePath: "data/sources/kjv/genesis.raw.txt",
    normalizedSourcePath: "data/sources/kjv/genesis.json",
  };
}

export async function loadGenesisSourceDocument(filePath: string): Promise<GenesisSourceDocument> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as GenesisSourceDocument;
}

export async function loadGenesisConceptRecords(filePath: string): Promise<GenesisConceptRecord[]> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as GenesisConceptRecord[];
}

export function validateGenesisConceptRecords(records: GenesisConceptRecord[]): void {
  const seenKeys = new Set<string>();

  for (const record of records) {
    if (normalizeWhitespace(record.simple_name).length === 0) {
      throw new Error("Encountered a blank simple_name in Genesis concept records.");
    }

    if (record.source_book !== GENESIS_BOOK) {
      throw new Error(`Unexpected source_book "${record.source_book}".`);
    }

    if (record.source_period !== GENESIS_SOURCE_PERIOD) {
      throw new Error(`Unexpected source_period "${record.source_period}".`);
    }

    if (!GENESIS_CATEGORY_SET.has(record.category)) {
      throw new Error(`Unexpected Genesis concept category "${record.category}".`);
    }

    if (
      record.chapter_start < 1 ||
      record.chapter_start > GENESIS_CHAPTER_COUNT ||
      record.chapter_end < 1 ||
      record.chapter_end > GENESIS_CHAPTER_COUNT ||
      record.chapter_start > record.chapter_end
    ) {
      throw new Error(
        `Invalid Genesis chapter span ${record.chapter_start}-${record.chapter_end} for "${record.simple_name}".`,
      );
    }

    if (record.confidence < 0 || record.confidence > 1) {
      throw new Error(`Invalid confidence for "${record.simple_name}".`);
    }

    const duplicateKey = normalizeConceptKey(record.simple_name);

    if (seenKeys.has(duplicateKey)) {
      throw new Error(`Duplicate Genesis concept record "${record.simple_name}".`);
    }

    seenKeys.add(duplicateKey);
  }
}

export function ensureGenesisRequiredAnchors(records: GenesisConceptRecord[]): void {
  const recordNames = new Set(records.map((record) => normalizeConceptKey(record.simple_name)));

  for (const anchor of GENESIS_REQUIRED_ANCHORS) {
    if (!recordNames.has(normalizeConceptKey(anchor))) {
      throw new Error(`Missing required Genesis anchor "${anchor}".`);
    }
  }
}

export function escapeCsvValue(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

export function serializeGenesisIntermediateCsv(records: GenesisConceptRecord[]): string {
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
