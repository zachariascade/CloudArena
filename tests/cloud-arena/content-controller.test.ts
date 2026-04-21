import { describe, expect, it } from "vitest";

import {
  createCloudArenaContentController,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-content-controller.js";

describe("cloud arena content controller", () => {
  it("serves card and deck content from local mode without an API", async () => {
    const controller = createCloudArenaContentController({
      apiBaseUrl: "http://127.0.0.1:1",
      mode: "local",
    });

    const cards = await controller.listCloudArenaCards({ q: "attack" });
    const decks = await controller.listCloudArenaDecks({ kind: "preset" });

    expect(cards.data.map((card) => card.id)).toContain("attack");
    expect(decks.data.map((deck) => deck.id)).toContain("master_deck");
  });
});
