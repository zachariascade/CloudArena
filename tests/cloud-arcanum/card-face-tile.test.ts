import { describe, expect, it } from "vitest";

import { buildRulesPreview } from "../../apps/cloud-arcanum-web/src/components/card-face-tile.js";

describe("card face tile rules preview", () => {
  it("keeps a flavor line visible when oracle and flavor text are both present", () => {
    const preview = buildRulesPreview({
      oracleText: [
        "Lucky Slots - At the beginning of combat on your turn, scry 1.",
        "Then exile the top card of your library. You may play that card this turn.",
        "When you exile a card this way, target creature gets +X/+0 until end of turn.",
      ].join("\n"),
      flavorText: "I'm friend to one and all, thanks to my crystal ball!",
    });

    expect(preview).toEqual([
      {
        kind: "oracle",
        text: "Lucky Slots - At the beginning of combat on your turn, scry 1.",
      },
      {
        kind: "oracle",
        text: "Then exile the top card of your library. You may play that card this turn.",
      },
      {
        kind: "flavor",
        text: "I'm friend to one and all, thanks to my crystal ball!",
      },
    ]);
  });

  it("falls back to a flavor-only preview when oracle text is missing", () => {
    const preview = buildRulesPreview({
      oracleText: null,
      flavorText: "Fortunes favor the bold.",
    });

    expect(preview).toEqual([
      {
        kind: "flavor",
        text: "Fortunes favor the bold.",
      },
    ]);
  });
});
