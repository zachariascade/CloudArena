import { describe, expect, it } from "vitest";

import {
  createCloudArenaBattleLocation,
  getDeckDraftFromUrl,
  getScenarioDraftFromUrl,
} from "../../apps/cloud-arena-web/src/lib/cloud-arena-web-lib.js";

describe("cloud arena battle setup", () => {
  it("builds the battle route with deck and enemy query params", () => {
    const location = createCloudArenaBattleLocation("wide_angels", "imp_caller");

    expect(location).toEqual({
      pathname: "/battle",
      search: "?deck=wide_angels&enemy=imp_caller",
    });
  });

  it("reads the draft setup from the current query string", () => {
    expect(getDeckDraftFromUrl("?deck=tall_creatures")).toBe("tall_creatures");
    expect(getScenarioDraftFromUrl("?enemy=grunt_demon")).toBe("grunt_demon");
    expect(getScenarioDraftFromUrl("?enemy=not_real")).toBe("mixed_guardian");
  });
});
