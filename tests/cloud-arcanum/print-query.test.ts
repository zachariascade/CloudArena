import { describe, expect, it } from "vitest";

import {
  buildPrintableCardsPagePath,
  parsePrintableCardsPageQuery,
} from "../../apps/cloud-arcanum-web/src/lib/cloud-arcanum-lib.js";
import { buildPrintablePageCss } from "../../apps/cloud-arcanum-web/src/lib/print-layout.js";

describe("print query helpers", () => {
  it("parses print settings alongside card filters", () => {
    const query = parsePrintableCardsPageQuery(
      new URLSearchParams(
        "q=angel&setId=set_test&paperSize=a4&orientation=portrait&fit=safe&cardsPerPage=4&showCropMarks=true&status=approved",
      ),
    );

    expect(query.q).toBe("angel");
    expect(query.setId).toBe("set_test");
    expect(query.paperSize).toBe("a4");
    expect(query.orientation).toBe("portrait");
    expect(query.fit).toBe("safe");
    expect(query.cardsPerPage).toBe(4);
    expect(query.showCropMarks).toBe(true);
    expect(query.status).toEqual(["approved"]);
  });

  it("builds a printable cards path", () => {
    expect(
      buildPrintableCardsPagePath({
        q: "angel",
        cardsPerPage: 4,
        paperSize: "letter",
        fit: "tight",
        orientation: "auto",
        showCropMarks: false,
      }),
    ).toBe(
      "/cards/print?q=angel&cardsPerPage=4&paperSize=letter&fit=tight&orientation=auto&showCropMarks=false",
    );
  });

  it("builds a print page css rule for the selected sheet", () => {
    expect(buildPrintablePageCss("letter", "landscape")).toContain(
      "@page { size: letter landscape; margin: 0.125in; }",
    );
    expect(buildPrintablePageCss("a4", "portrait")).toContain(
      "@page { size: A4 portrait; margin: 0.125in; }",
    );
  });
});
