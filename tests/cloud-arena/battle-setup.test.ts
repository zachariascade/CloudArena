import { describe, expect, it } from "vitest";

import {
  createCloudArenaBattleLocation,
  createCloudArenaRunLocation,
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

  it("builds the setup route with the same query params", () => {
    const location = createCloudArenaRunLocation("wide_angels", "imp_caller");

    expect(location).toEqual({
      pathname: "/run",
      search: "?deck=wide_angels&enemy=imp_caller",
    });
  });

  it("reads the draft setup from the current query string", () => {
    expect(getDeckDraftFromUrl("?deck=tall_creatures")).toBe("tall_creatures");
    expect(getScenarioDraftFromUrl("?enemy=imp_caller")).toBe("imp_caller");
    expect(getScenarioDraftFromUrl("?enemy=lake_of_ice")).toBe("lake_of_ice");
    expect(getScenarioDraftFromUrl("?enemy=malchior_binder_of_wills")).toBe("malchior_binder_of_wills");
    expect(getScenarioDraftFromUrl("?enemy=not_real")).toBe("demon_pack");
  });
});
