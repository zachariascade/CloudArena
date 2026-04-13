import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { AppShell } from "../../apps/cloud-arcanum-web/src/components/index.js";

describe("cloud arcanum app shell", () => {
  it("keeps navigation focused on Cloud Arcanum routes", () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(AppShell, {
          children: createElement("div", null, "content"),
        }),
      ),
    );

    expect(html).toContain("/cards");
    expect(html).toContain("/decks");
    expect(html).not.toContain("/cloud-arena");
  });
});
