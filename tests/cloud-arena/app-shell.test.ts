import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { CloudArenaAppShell } from "../../apps/cloud-arena-web/src/components/index.js";

describe("cloud arena app shell", () => {
  it("exposes battle and deck builder navigation", () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(CloudArenaAppShell, {
          cloudArcanumWebBaseUrl: "https://example.com",
          children: createElement("div", null, "content"),
        }),
      ),
    );

    expect(html).toContain('href="/decks"');
    expect(html).toContain('href="/"');
  });
});
