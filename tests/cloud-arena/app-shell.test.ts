import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { CloudArenaAppShell } from "../../apps/cloud-arena-web/src/components/index.js";

describe("cloud arena app shell", () => {
  it("renders page content and the feedback affordance without app chrome navigation", () => {
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

    expect(html).toContain("content");
    expect(html).toContain("cloud-arena-feedback-button");
    expect(html).toContain('href="https://forms.gle/tgCeYHQ6s1WjPUjw8"');
    expect(html).not.toContain('href="/run"');
    expect(html).not.toContain('href="/battle"');
    expect(html).not.toContain('href="/decks"');
    expect(html).not.toContain("cloud-arena-menu-button");
    expect(html).not.toContain("cloud-arena-menu-sidebar");
    expect(html).not.toContain("Recolor the shell");
    expect(html).not.toContain('type="color"');
  });
});
