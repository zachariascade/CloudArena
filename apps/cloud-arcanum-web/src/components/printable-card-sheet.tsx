import type { CSSProperties, ReactElement } from "react";
import { Link } from "react-router-dom";

import type { CardListItem } from "../../../../src/cloud-arcanum/api-contract.js";
import { mapCloudArcanumCardToDisplayCard } from "../lib/display-card.js";
import {
  PRINTABLE_CARD_BLEED_IN,
  PRINTABLE_CARD_TRIM_IN,
  type PrintableGridLayout,
} from "../lib/print-layout.js";
import { chunkCardsForPages } from "../lib/print-layout.js";
import { PrintableCardFace } from "./printable-card-face.js";
import { EmptyState } from "./empty-state.js";

type PrintableCardSheetProps = {
  cards: CardListItem[];
  layout: PrintableGridLayout;
  showCropMarks: boolean;
};

type PrintableCardWrapperStyle = CSSProperties & {
  ["--print-card-box-height"]: string;
  ["--print-card-box-width"]: string;
  ["--print-card-bleed"]: string;
  ["--print-card-trim-height"]: string;
  ["--print-card-trim-width"]: string;
};

export function buildPrintablePageLabel(pageIndex: number, pageCount: number): string {
  return `Page ${pageIndex + 1} of ${pageCount}`;
}

function PrintableCropMarks(): ReactElement {
  return (
    <div aria-hidden="true" className="print-sheet-crop-marks">
      <span className="print-sheet-crop-mark print-sheet-crop-mark-top-left" />
      <span className="print-sheet-crop-mark print-sheet-crop-mark-top-right" />
      <span className="print-sheet-crop-mark print-sheet-crop-mark-bottom-left" />
      <span className="print-sheet-crop-mark print-sheet-crop-mark-bottom-right" />
    </div>
  );
}

function buildCardWrapperStyle(layout: PrintableGridLayout): PrintableCardWrapperStyle {
  return {
    ["--print-card-box-height"]: `${layout.cardBox.heightIn}in`,
    ["--print-card-box-width"]: `${layout.cardBox.widthIn}in`,
    ["--print-card-bleed"]: `${PRINTABLE_CARD_BLEED_IN}in`,
    ["--print-card-trim-height"]: `${PRINTABLE_CARD_TRIM_IN.heightIn}in`,
    ["--print-card-trim-width"]: `${PRINTABLE_CARD_TRIM_IN.widthIn}in`,
  };
}

export function PrintableCardSheet({
  cards,
  layout,
  showCropMarks,
}: PrintableCardSheetProps): ReactElement {
  const cardsPerPage = Math.max(1, layout.columns * layout.rows);
  const pages = chunkCardsForPages(cards, cardsPerPage);

  if (pages.length === 0) {
    return (
      <EmptyState
        title="No cards to print"
        description="The current filters did not return any cards."
        actions={
          <p>
            Go back to <Link className="text-link" to="/cards">cards</Link> and broaden the
            filters if you want a printable sheet.
          </p>
        }
      />
    );
  }

  return (
    <section
      className={[
        "print-sheet-preview",
        showCropMarks ? "show-crop-marks" : null,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="summary-row print-sheet-summary">
        <div className="summary-pill">
          <strong>{cards.length}</strong> cards
        </div>
        <div className="summary-pill">
          <strong>{pages.length}</strong> pages
        </div>
        <div className="summary-pill">
          <strong>{layout.cardsPerPage}</strong> cards/page
        </div>
        <div className="summary-pill">
          <strong>
            {layout.columns} x {layout.rows}
          </strong>{" "}
          grid
        </div>
      </div>

      <div className="print-sheet-pages">
        {pages.map((page, pageIndex) => (
          <article
            key={`print-page-${pageIndex}`}
            className="print-sheet-page"
            style={{
              display: "grid",
              gap: `${layout.marginIn}in`,
              gridTemplateColumns: `repeat(${Math.max(1, layout.columns)}, ${layout.cardBox.widthIn}in)`,
              gridAutoRows: `${layout.cardBox.heightIn}in`,
              minHeight: `${layout.heightIn}in`,
              padding: `${layout.marginIn}in`,
              width: `${layout.widthIn}in`,
            }}
          >
            <div className="print-sheet-page-number">
              {buildPrintablePageLabel(pageIndex, pages.length)}
            </div>
            {page.map((card) => (
              <div
                key={card.id}
                className="print-sheet-card"
                style={buildCardWrapperStyle(layout)}
              >
                {showCropMarks ? <PrintableCropMarks /> : null}
                <PrintableCardFace
                  model={mapCloudArcanumCardToDisplayCard(card)}
                />
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
