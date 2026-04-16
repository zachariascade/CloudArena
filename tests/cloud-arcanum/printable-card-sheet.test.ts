import { describe, expect, it } from "vitest";

import { buildPrintablePageLabel } from "../../apps/cloud-arcanum-web/src/components/printable-card-sheet.js";

describe("printable card sheet helpers", () => {
  it("formats page labels with one-based numbering", () => {
    expect(buildPrintablePageLabel(0, 3)).toBe("Page 1 of 3");
    expect(buildPrintablePageLabel(2, 3)).toBe("Page 3 of 3");
  });
});
