import { describe, expect, it } from "vitest";

import {
  PRINTABLE_CARD_BLEED_IN,
  PRINTABLE_CARD_BOX_IN,
  PRINTABLE_CARD_TRIM_IN,
  chunkCardsForPages,
  computePrintableGridLayout,
} from "../../apps/cloud-arcanum-web/src/lib/print-layout.js";

describe("print layout helpers", () => {
  it("prefers the denser landscape sheet for Letter when orientation is auto", () => {
    const layout = computePrintableGridLayout({
      fit: "tight",
      orientation: "auto",
      paperSize: "letter",
    });

    expect(layout.orientation).toBe("landscape");
    expect(layout.columns).toBe(3);
    expect(layout.rows).toBe(2);
    expect(layout.columns * layout.rows).toBe(6);
    expect(layout.cardsPerPage).toBe(6);
  });

  it("packs more cards on A4 in landscape", () => {
    const layout = computePrintableGridLayout({
      fit: "tight",
      orientation: "auto",
      paperSize: "a4",
    });

    expect(layout.orientation).toBe("landscape");
    expect(layout.columns).toBe(4);
    expect(layout.rows).toBe(2);
    expect(layout.columns * layout.rows).toBe(8);
    expect(layout.cardsPerPage).toBe(8);
  });

  it("respects a requested cards-per-page target when one fits", () => {
    const layout = computePrintableGridLayout({
      cardsPerPage: 4,
      fit: "tight",
      orientation: "auto",
      paperSize: "letter",
    });

    expect(layout.columns).toBe(2);
    expect(layout.rows).toBe(2);
    expect(layout.cardsPerPage).toBe(4);
  });

  it("falls back to the largest layout that fits when the target is too high", () => {
    const layout = computePrintableGridLayout({
      cardsPerPage: 12,
      fit: "tight",
      orientation: "auto",
      paperSize: "letter",
    });

    expect(layout.columns).toBe(3);
    expect(layout.rows).toBe(2);
    expect(layout.cardsPerPage).toBe(6);
  });

  it("chunks cards by the computed page capacity", () => {
    const pages = chunkCardsForPages(["a", "b", "c", "d", "e"], 2);

    expect(pages).toEqual([
      ["a", "b"],
      ["c", "d"],
      ["e"],
    ]);
  });

  it("keeps the trim and bleed math aligned with standard card size", () => {
    expect(PRINTABLE_CARD_TRIM_IN).toEqual({
      widthIn: 2.5,
      heightIn: 3.5,
    });
    expect(PRINTABLE_CARD_BLEED_IN).toBe(0.125);
    expect(PRINTABLE_CARD_BOX_IN).toEqual({
      widthIn: 2.75,
      heightIn: 3.75,
    });
  });
});
