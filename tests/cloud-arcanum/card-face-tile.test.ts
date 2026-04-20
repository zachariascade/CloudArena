import { describe, expect, it } from "vitest";

import { buildRulesPreview } from "../../apps/cloud-arcanum-web/src/components/card-face-tile.js";

describe("card face tile rules preview", () => {
  it("shows oracle text without flavor lines", () => {
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
        kind: "oracle",
        text: "When you exile a card this way, target creature gets +X/+0 until end of turn.",
      },
    ]);
  });

  it("falls back to a pending rules preview when oracle text is missing", () => {
    const preview = buildRulesPreview({
      oracleText: null,
      flavorText: "Fortunes favor the bold.",
    });

    expect(preview).toEqual([
      {
        kind: "oracle",
        text: "Rules text pending",
      },
    ]);
  });
});
