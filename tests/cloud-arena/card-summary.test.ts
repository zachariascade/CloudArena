import { describe, expect, it } from "vitest";

import { anointedBannerCardDefinition } from "../../src/cloud-arena/cards/definitions/anointed-banner.js";
import { armorySeraphCardDefinition } from "../../src/cloud-arena/cards/definitions/armory-seraph.js";
import { battlefieldInsightCardDefinition } from "../../src/cloud-arena/cards/definitions/battlefield-insight.js";
import { forbiddenInsightCardDefinition } from "../../src/cloud-arena/cards/definitions/forbidden-insight.js";
import { focusedBlessingCardDefinition } from "../../src/cloud-arena/cards/definitions/focused-blessing.js";
import { choirCaptainCardDefinition } from "../../src/cloud-arena/cards/definitions/choir-captain.js";
import { forcedSacrificeCardDefinition } from "../../src/cloud-arena/cards/definitions/forced-sacrifice.js";
import { guardianCardDefinition } from "../../src/cloud-arena/cards/definitions/guardian.js";
import { haltBucklerCardDefinition } from "../../src/cloud-arena/cards/definitions/halt-buckler.js";
import { graveyardHymnCardDefinition } from "../../src/cloud-arena/cards/definitions/graveyard-hymn.js";
import { massBenedictionCardDefinition } from "../../src/cloud-arena/cards/definitions/mass-benediction.js";
import { targetedStrikeCardDefinition } from "../../src/cloud-arena/cards/definitions/targeted-strike.js";
import { stunningRebukeCardDefinition } from "../../src/cloud-arena/cards/definitions/stunning-rebuke.js";
import { holyBladeCardDefinition } from "../../src/cloud-arena/cards/definitions/holy-blade.js";
import { judgmentBladeCardDefinition } from "../../src/cloud-arena/cards/definitions/judgment-blade.js";
import { restorativeTouchCardDefinition } from "../../src/cloud-arena/cards/definitions/restorative-touch.js";
import { radiantConduitCardDefinition } from "../../src/cloud-arena/cards/definitions/radiant-conduit.js";
import { refreshSignetCardDefinition } from "../../src/cloud-arena/cards/definitions/refresh-signet.js";
import { resurrectCardDefinition } from "../../src/cloud-arena/cards/definitions/resurrect.js";
import { sanctifiedGuideCardDefinition } from "../../src/cloud-arena/cards/definitions/sanctified-guide.js";
import { summarizeCardDefinition } from "../../src/cloud-arena/card-summary.js";

describe("cloud arena card summary", () => {
  it("describes the stun effect on Stunning Rebuke", () => {
    expect(summarizeCardDefinition(stunningRebukeCardDefinition)).toEqual([
      "Stun the enemy.",
    ]);
  });

  it("describes the equipment benefit on Holy Blade", () => {
    expect(summarizeCardDefinition(holyBladeCardDefinition)).toEqual([
      "Equip a permanent.",
      "Equipped permanent gets +1/+1.",
    ]);
  });

  it("describes equipment-granted keyword abilities", () => {
    expect(summarizeCardDefinition(refreshSignetCardDefinition)).toEqual([
      "Equip a permanent.",
      "Equipped permanent gets +0/+1.",
      "Equipped creature has **Refresh**.",
    ]);
    expect(summarizeCardDefinition(haltBucklerCardDefinition)).toEqual([
      "Equip a permanent.",
      "Equipped permanent gets +0/+1.",
      "Equipped creature has **Halt**.",
    ]);
  });

  it("describes the sweeping attack on Judgment Blade", () => {
    expect(summarizeCardDefinition(judgmentBladeCardDefinition)).toEqual([
      "Equip a permanent.",
      "Equipped permanent gets +1/+1.",
      "Equipped creature attacks all enemy permanents.",
    ]);
  });

  it("describes the battlefield buff on the Ark of the Covenant", () => {
    expect(summarizeCardDefinition(anointedBannerCardDefinition)).toEqual([
      "When a creature you control enters the battlefield, it gets +1/+1.",
    ]);
  });

  it("describes the targeted blessing and sacrifice effects", () => {
    expect(summarizeCardDefinition(focusedBlessingCardDefinition)).toEqual([
      "Choose a creature you control; it gets +1/+1.",
    ]);
    expect(summarizeCardDefinition(forcedSacrificeCardDefinition)).toEqual([
      "Choose a permanent you control; sacrifice it.",
    ]);
  });

  it("describes mass and targeted battlefield damage", () => {
    expect(summarizeCardDefinition(massBenedictionCardDefinition)).toEqual([
      "Each permanent on the battlefield gets +1/+1.",
    ]);
    expect(summarizeCardDefinition(targetedStrikeCardDefinition)).toEqual([
      "Choose an enemy permanent; deal 4 damage to it.",
    ]);
  });

  it("describes the static angel bonus on Choir Captain", () => {
    expect(summarizeCardDefinition(choirCaptainCardDefinition)).toEqual([
      "**Refresh**",
      "This gets +1 power for each Angel on the battlefield.",
    ]);
  });

  it("describes the guardian block ability", () => {
    expect(summarizeCardDefinition(guardianCardDefinition)).toContain(
      "**Halt**",
    );
    expect(summarizeCardDefinition(guardianCardDefinition)).toContain(
      "Pay 1 energy: Gain 5 block.",
    );
  });

  it("describes the guided blessing tap ability", () => {
    expect(summarizeCardDefinition(sanctifiedGuideCardDefinition)).toContain(
      "Tap: Choose a creature you control; it gets +1/+1.",
    );
  });

  it("describes the armory seraph equipment trigger", () => {
    expect(summarizeCardDefinition(armorySeraphCardDefinition)).toEqual([
      "When an equipment you control enters the battlefield, draw 1 card.",
    ]);
  });

  it("describes the radiant conduit energy ability", () => {
    expect(summarizeCardDefinition(radiantConduitCardDefinition)).toContain(
      "Tap: Gain 1 energy.",
    );
  });

  it("describes draw and revive spells", () => {
    expect(summarizeCardDefinition(forbiddenInsightCardDefinition)).toEqual([
      "Draw 3 cards.",
    ]);
    expect(summarizeCardDefinition(battlefieldInsightCardDefinition)).toEqual([
      "Draw X cards, where X is the number of creatures on the battlefield.",
    ]);
    expect(summarizeCardDefinition(resurrectCardDefinition)).toEqual([
      "Choose a card in the graveyard; return it to your hand.",
    ]);
  });

  it("describes graveyard hymn's death trigger and healing touch", () => {
    expect(summarizeCardDefinition(graveyardHymnCardDefinition)).toContain(
      "When this dies, each creature on the battlefield gets +1/+1.",
    );
    expect(summarizeCardDefinition(restorativeTouchCardDefinition)).toContain(
      "Choose a permanent; it gets +0/+3.",
    );
  });
});
