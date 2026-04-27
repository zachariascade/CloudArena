import { describe, expect, it } from "vitest";

import { buildEnemyPreviewCardModel } from "../../apps/cloud-arena-web/src/lib/cloud-arena-enemy-card-preview.js";

describe("enemy card preview art", () => {
  it("uses shielded slash art for enemy cards that both attack and block", () => {
    const model = buildEnemyPreviewCardModel(
      {
        id: "assault_6_block_4",
        name: "Assault 6 + 4 block",
        effects: [
          {
            attackAmount: 6,
            target: "player",
          },
          {
            blockAmount: 4,
            target: "enemy",
          },
        ],
      },
      0,
    );

    expect(model.image?.url).toContain("shielded-slash.png");
  });

  it("uses demonic curse art for enemy debuffs", () => {
    const model = buildEnemyPreviewCardModel(
      {
        id: "chain_of_command",
        name: "Chain of Command",
        effects: [
          {
            powerDeltaTargetPermanents: -1,
            target: "player",
          },
        ],
      },
      0,
    );

    expect(model.image?.url).toContain("demonic-curse");
  });

  it("uses demonic boost art for enemy self-buffs", () => {
    const model = buildEnemyPreviewCardModel(
      {
        id: "gain_power_1",
        name: "Gain Power",
        effects: [
          {
            powerDelta: 1,
            target: "enemy",
          },
        ],
      },
      0,
    );

    expect(model.image?.url).toContain("demonic-boost.png");
  });
});
