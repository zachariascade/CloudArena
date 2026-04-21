import { describe, expect, it } from "vitest";

import type { CloudArenaDeckSummary } from "../../src/cloud-arena/api-contract.js";
import { buildCloudArenaDeckChooserGroups } from "../../apps/cloud-arena-web/src/routes/interactive-page.js";

describe("cloud arena interactive page deck chooser", () => {
  it("groups presets and saved decks and preserves a selected saved deck id", () => {
    const decks: CloudArenaDeckSummary[] = [
      {
        id: "master_deck",
        kind: "preset",
        name: "Master Deck",
        cardCount: 20,
        uniqueCardCount: 20,
        tags: [],
        notes: null,
      },
      {
        id: "saved_1",
        kind: "saved",
        name: "Saved Control",
        cardCount: 40,
        uniqueCardCount: 12,
        tags: ["control"],
        notes: null,
      },
    ];

    const groups = buildCloudArenaDeckChooserGroups(decks, "saved_1");

    expect(groups[0]?.label).toBe("Built-in presets");
    expect(groups[0]?.options.map((option) => option.id)).toContain("master_deck");
    expect(groups[1]?.label).toBe("Saved decks");
    expect(groups[1]?.options.map((option) => option.id)).toContain("saved_1");
    expect(groups[1]?.options.find((option) => option.id === "saved_1")?.description).toContain("40 cards");
  });

  it("injects the selected deck when it is not yet loaded from the API", () => {
    const groups = buildCloudArenaDeckChooserGroups(null, "saved_missing");

    expect(groups[0]?.options.map((option) => option.id)).toContain("master_deck");
    expect(groups[1]?.options[0]).toMatchObject({
      id: "saved_missing",
      kind: "saved",
    });
  });
});
