import { describe, expect, it } from "vitest";

import {
  getGalleryStateFromUrl,
  updateGallerySearch,
} from "../../apps/cloud-arena-web/src/routes/gallery-page.js";

describe("cloud arena gallery helpers", () => {
  it("round-trips gallery query, sort, and pagination state through the url", () => {
    expect(getGalleryStateFromUrl("?q=angel&sort=year&dir=desc&cards=used&page=3")).toEqual({
      searchQuery: "angel",
      sortKey: "year",
      sortDir: "desc",
      usageFilter: "used",
      page: 2,
    });

    expect(
      updateGallerySearch("?q=angel&sort=year&dir=desc&cards=used&page=3", {
        searchQuery: " angel ",
        sortKey: "title",
        sortDir: "asc",
        usageFilter: "all",
        page: 0,
      }),
    ).toBe("?q=angel");

    expect(
      updateGallerySearch("", {
        searchQuery: "angel",
        sortKey: "year",
        sortDir: "desc",
        usageFilter: "used",
        page: 2,
      }),
    ).toBe("?q=angel&sort=year&dir=desc&cards=used&page=3");
  });

  it("falls back to sensible defaults when the url contains invalid values", () => {
    expect(getGalleryStateFromUrl("?sort=broken&dir=sideways&cards=maybe&page=NaN")).toEqual({
      searchQuery: "",
      sortKey: "title",
      sortDir: "asc",
      usageFilter: "all",
      page: 0,
    });
  });
});
