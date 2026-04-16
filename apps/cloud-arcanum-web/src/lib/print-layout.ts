import type {
  PrintableFitMode,
  PrintableOrientation,
  PrintablePaperSize,
} from "./query-string.js";

export type PrintablePageDimensions = {
  widthIn: number;
  heightIn: number;
};

export type PrintableCardBoxDimensions = {
  widthIn: number;
  heightIn: number;
};

export type PrintableGridLayout = {
  cardBox: PrintableCardBoxDimensions;
  columns: number;
  cardsPerPage: number;
  fit: PrintableFitMode;
  heightIn: number;
  marginIn: number;
  orientation: PrintableOrientation;
  paperSize: PrintablePaperSize;
  rows: number;
  usableHeightIn: number;
  usableWidthIn: number;
  widthIn: number;
};

const PAPER_SIZES: Record<PrintablePaperSize, PrintablePageDimensions> = {
  a4: { widthIn: 8.27, heightIn: 11.69 },
  letter: { widthIn: 8.5, heightIn: 11 },
};

const FIT_MARGINS_IN: Record<PrintableFitMode, number> = {
  calibration: 0.25,
  safe: 0.25,
  tight: 0.125,
};

export const PRINTABLE_CARD_TRIM_IN: PrintableCardBoxDimensions = {
  widthIn: 2.5,
  heightIn: 3.5,
};

export const PRINTABLE_CARD_BLEED_IN = 0.125;

export const PRINTABLE_CARD_BOX_IN: PrintableCardBoxDimensions = {
  widthIn: PRINTABLE_CARD_TRIM_IN.widthIn + PRINTABLE_CARD_BLEED_IN * 2,
  heightIn: PRINTABLE_CARD_TRIM_IN.heightIn + PRINTABLE_CARD_BLEED_IN * 2,
};

function resolvePrintablePageDimensions(
  paperSize: PrintablePaperSize,
  orientation: PrintableOrientation,
): PrintablePageDimensions {
  const dimensions = PAPER_SIZES[paperSize];

  if (orientation === "portrait") {
    return dimensions;
  }

  if (orientation === "landscape") {
    return {
      widthIn: dimensions.heightIn,
      heightIn: dimensions.widthIn,
    };
  }

  return dimensions;
}

function countCardsThatFit(
  page: PrintablePageDimensions,
  marginIn: number,
  cardBox: PrintableCardBoxDimensions,
): { columns: number; rows: number } {
  const usableWidthIn = Math.max(0, page.widthIn - marginIn * 2);
  const usableHeightIn = Math.max(0, page.heightIn - marginIn * 2);

  return {
    columns: Math.floor(usableWidthIn / cardBox.widthIn),
    rows: Math.floor(usableHeightIn / cardBox.heightIn),
  };
}

type PrintableGridCandidate = {
  layout: PrintableGridLayout;
  score: {
    aspectDifference: number;
    cardsPerPage: number;
    orientationBias: number;
    targetDelta: number;
    balance: number;
  };
};

function isBetterPrintableGridCandidate(
  candidate: PrintableGridCandidate,
  currentBest: PrintableGridCandidate,
): boolean {
  if (candidate.score.cardsPerPage !== currentBest.score.cardsPerPage) {
    return candidate.score.cardsPerPage > currentBest.score.cardsPerPage;
  }

  if (candidate.score.targetDelta !== currentBest.score.targetDelta) {
    return candidate.score.targetDelta < currentBest.score.targetDelta;
  }

  if (candidate.score.balance !== currentBest.score.balance) {
    return candidate.score.balance < currentBest.score.balance;
  }

  if (candidate.score.aspectDifference !== currentBest.score.aspectDifference) {
    return candidate.score.aspectDifference < currentBest.score.aspectDifference;
  }

  if (candidate.score.orientationBias !== currentBest.score.orientationBias) {
    return candidate.score.orientationBias > currentBest.score.orientationBias;
  }

  return false;
}

export function computePrintableGridLayout({
  cardsPerPage,
  fit,
  orientation,
  paperSize,
}: {
  cardsPerPage?: number;
  fit: PrintableFitMode;
  orientation: PrintableOrientation;
  paperSize: PrintablePaperSize;
}): PrintableGridLayout {
  const candidateOrientations: PrintableOrientation[] =
    orientation === "auto" ? ["landscape", "portrait"] : [orientation];
  const marginIn = FIT_MARGINS_IN[fit];

  let bestCandidate: PrintableGridCandidate | null = null;

  for (const candidateOrientation of candidateOrientations) {
    const page = resolvePrintablePageDimensions(paperSize, candidateOrientation);
    const { columns, rows } = countCardsThatFit(page, marginIn, PRINTABLE_CARD_BOX_IN);

    for (let candidateColumns = 1; candidateColumns <= columns; candidateColumns += 1) {
      for (let candidateRows = 1; candidateRows <= rows; candidateRows += 1) {
        const cardsThatFit = candidateColumns * candidateRows;

        if (cardsThatFit <= 0) {
          continue;
        }

        if (typeof cardsPerPage === "number" && cardsThatFit > cardsPerPage) {
          continue;
        }

        const layout: PrintableGridLayout = {
          cardBox: PRINTABLE_CARD_BOX_IN,
          cardsPerPage: cardsThatFit,
          columns: candidateColumns,
          fit,
          heightIn: page.heightIn,
          marginIn,
          orientation: candidateOrientation,
          paperSize,
          rows: candidateRows,
          usableHeightIn: Math.max(0, page.heightIn - marginIn * 2),
          usableWidthIn: Math.max(0, page.widthIn - marginIn * 2),
          widthIn: page.widthIn,
        };
        const candidate: PrintableGridCandidate = {
          layout,
          score: {
            aspectDifference: Math.abs(
              page.widthIn / page.heightIn -
                (layout.columns * layout.cardBox.widthIn) /
                  (layout.rows * layout.cardBox.heightIn),
            ),
            cardsPerPage: cardsThatFit,
            orientationBias: page.widthIn >= page.heightIn ? candidateColumns : candidateRows,
            targetDelta:
              typeof cardsPerPage === "number"
                ? Math.abs(cardsPerPage - cardsThatFit)
                : Number.POSITIVE_INFINITY,
            balance: Math.abs(candidateColumns - candidateRows),
          },
        };

        if (!bestCandidate) {
          bestCandidate = candidate;
          continue;
        }

        if (isBetterPrintableGridCandidate(candidate, bestCandidate)) {
          bestCandidate = candidate;
        }
      }
    }
  }

  return bestCandidate?.layout ?? {
    cardBox: PRINTABLE_CARD_BOX_IN,
    columns: 0,
    cardsPerPage: 0,
    fit,
    heightIn: PAPER_SIZES[paperSize].heightIn,
    marginIn,
    orientation: orientation === "auto" ? "landscape" : orientation,
    paperSize,
    rows: 0,
    usableHeightIn: Math.max(0, PAPER_SIZES[paperSize].heightIn - marginIn * 2),
    usableWidthIn: Math.max(0, PAPER_SIZES[paperSize].widthIn - marginIn * 2),
    widthIn: PAPER_SIZES[paperSize].widthIn,
  };
}

export function chunkCardsForPages<TItem>(
  items: readonly TItem[],
  cardsPerPage: number,
): TItem[][] {
  const pageSize = cardsPerPage > 0 ? cardsPerPage : 1;
  const pages: TItem[][] = [];

  for (let index = 0; index < items.length; index += pageSize) {
    pages.push(items.slice(index, index + pageSize));
  }

  return pages;
}

export function buildPrintablePageCss(
  paperSize: PrintablePaperSize,
  orientation: PrintableOrientation,
): string {
  const pageSize = paperSize === "a4" ? "A4" : "letter";
  const pageOrientation = orientation === "auto" ? "landscape" : orientation;

  return [
    "@media print {",
    `  @page { size: ${pageSize} ${pageOrientation}; margin: 0.125in; }`,
    "}",
  ].join("\n");
}
