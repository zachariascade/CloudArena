import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("print route wiring", () => {
  it("registers the cards print page route", () => {
    const routeSource = readFileSync(
      path.join(process.cwd(), "apps/cloud-arcanum-web/src/routes/index.tsx"),
      "utf8",
    );

    expect(routeSource).toContain('path: "cards/print"');
    expect(routeSource).toContain("PrintCardsPage");
  });
});
