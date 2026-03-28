import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  cardSchema,
  deckSchema,
  setSchema,
  universeSchema,
} from "../src/domain/index.js";
import { repoRoot } from "./helpers.js";

async function loadJson<T>(relativeFile: string): Promise<T> {
  const contents = await readFile(path.join(repoRoot, relativeFile), "utf8");
  return JSON.parse(contents) as T;
}

describe("schema validation", () => {
  it("accepts the sample records", async () => {
    const universe = await loadJson("data/universes/universe_biblical_biblical_world.json");
    const set = await loadJson("data/sets/set_genesis_book_of_beginnings.json");
    const approvedCard = await loadJson("data/cards/card_0001_abraham_father_of_nations.json");
    const draftCard = await loadJson("data/cards/card_0002_sarah_laughter_of_promise.json");
    const deck = await loadJson("data/decks/deck_patriarchs_tribe_of_promise.json");

    expect(universeSchema.safeParse(universe).success).toBe(true);
    expect(setSchema.safeParse(set).success).toBe(true);
    expect(cardSchema.safeParse(approvedCard).success).toBe(true);
    expect(cardSchema.safeParse(draftCard).success).toBe(true);
    expect(deckSchema.safeParse(deck).success).toBe(true);
  });

  it("allows explicit draft placeholders", async () => {
    const draftCard = await loadJson<Record<string, unknown>>(
      "data/cards/card_0002_sarah_laughter_of_promise.json",
    );

    const result = cardSchema.safeParse(draftCard);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
      expect(result.data.manaCost).toBeNull();
      expect(result.data.manaValue).toBeNull();
      expect(result.data.rarity).toBeNull();
      expect(result.data.oracleText).toBeNull();
    }
  });

  it("requires finalized mechanics for balanced and approved cards", async () => {
    const approvedCard = await loadJson<Record<string, unknown>>(
      "data/cards/card_0001_abraham_father_of_nations.json",
    );
    approvedCard.manaCost = null;
    approvedCard.manaValue = null;
    approvedCard.rarity = null;
    approvedCard.oracleText = null;

    const result = cardSchema.safeParse(approvedCard);

    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.path.join("."));
      expect(issues).toContain("manaCost");
      expect(issues).toContain("manaValue");
      expect(issues).toContain("rarity");
      expect(issues).toContain("oracleText");
    }
  });
});
