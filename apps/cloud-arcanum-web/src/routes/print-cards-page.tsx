import type { ChangeEvent, ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";

import type { CardListItem, CardsListMeta } from "../../../../src/cloud-arcanum/api-contract.js";
import {
  buildCardsPagePath,
  buildCardListQueryString,
  buildPrintableCardsPagePath,
  buildPrintableCardsPageQueryString,
  createCloudArcanumApiClient,
  parsePrintableCardsPageQuery,
  type PrintableFitMode,
  type PrintableOrientation,
  type PrintablePaperSize,
  useApiRequest,
} from "../lib/cloud-arcanum-lib.js";
import { buildPrintablePageCss, computePrintableGridLayout } from "../lib/print-layout.js";
import {
  ErrorState,
  LoadingState,
  PageLayout,
  PrintableCardSheet,
} from "../components/index.js";

type PrintCardsPageProps = {
  apiBaseUrl: string;
};

type ListResourceState<TItem, TMeta extends { total: number; filtersApplied: Record<string, unknown> }> =
  {
    data: {
      items: TItem[];
      meta: TMeta;
    } | null;
    error: Error | null;
    status: "idle" | "loading" | "success" | "error";
  };

const PAPER_SIZE_OPTIONS: Array<{ label: string; value: PrintablePaperSize }> = [
  { label: "Letter", value: "letter" },
  { label: "A4", value: "a4" },
];

const ORIENTATION_OPTIONS: Array<{ label: string; value: PrintableOrientation }> = [
  { label: "Auto", value: "auto" },
  { label: "Portrait", value: "portrait" },
  { label: "Landscape", value: "landscape" },
];

const FIT_OPTIONS: Array<{ label: string; value: PrintableFitMode }> = [
  { label: "Tight", value: "tight" },
  { label: "Safe", value: "safe" },
  { label: "Calibration", value: "calibration" },
];

const CARDS_PER_PAGE_OPTIONS = [
  { label: "Auto", value: "" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "4", value: "4" },
  { label: "6", value: "6" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "12", value: "12" },
] as const;

function formatApiErrorDetails(error: Error): ReactElement {
  return <p>{error.message}</p>;
}

function buildCardFilters(query: ReturnType<typeof parsePrintableCardsPageQuery>) {
  const { cardsPerPage, fit, orientation, paperSize, showCropMarks, ...cardFilters } = query;
  void cardsPerPage;
  void fit;
  void orientation;
  void paperSize;
  void showCropMarks;

  return {
    ...cardFilters,
    page: undefined,
    pageSize: undefined,
  };
}

function updateSearchParams(
  searchParams: URLSearchParams,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  nextQuery: ReturnType<typeof parsePrintableCardsPageQuery>,
): void {
  const nextSearchParams = new URLSearchParams(buildPrintableCardsPageQueryString(nextQuery));

  if (searchParams.toString() === nextSearchParams.toString()) {
    return;
  }

  setSearchParams(nextSearchParams, { preventScrollReset: true });
}

function PrintableControls({
  query,
  searchParams,
  setSearchParams,
}: {
  query: ReturnType<typeof parsePrintableCardsPageQuery>;
  searchParams: URLSearchParams;
  setSearchParams: ReturnType<typeof useSearchParams>[1];
}): ReactElement {
  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>): void {
    const { name, value } = event.currentTarget;
    updateSearchParams(searchParams, setSearchParams, {
      ...query,
      [name]:
        value.length > 0
          ? value
          : undefined,
    } as ReturnType<typeof parsePrintableCardsPageQuery>);
  }

  function handleCardsPerPageChange(event: ChangeEvent<HTMLSelectElement>): void {
    const { value } = event.currentTarget;
    updateSearchParams(searchParams, setSearchParams, {
      ...query,
      cardsPerPage: value.length > 0 ? Number(value) : undefined,
    });
  }

  function handlePrint(): void {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  const printablePath = buildPrintableCardsPagePath(query);

  return (
    <section className="panel filters-panel print-controls">
      <div className="filters-header">
        <div>
          <strong>Print settings</strong>
          <p>
            Choose the sheet size and packing mode. The route keeps the current card filters and
            prints only the cards that match them.
          </p>
        </div>
        <div className="summary-row">
          <button className="primary-button" onClick={handlePrint} type="button">
            Print sheet
          </button>
          <Link className="ghost-button" to={buildCardsPagePath(buildCardFilters(query))}>
            Back to cards
          </Link>
        </div>
      </div>

      <div className="filters-grid">
        <label className="field">
          <span>Paper size</span>
          <select name="paperSize" onChange={handleSelectChange} value={query.paperSize ?? "letter"}>
            {PAPER_SIZE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Orientation</span>
          <select
            name="orientation"
            onChange={handleSelectChange}
            value={query.orientation ?? "auto"}
          >
            {ORIENTATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Fit</span>
          <select name="fit" onChange={handleSelectChange} value={query.fit ?? "tight"}>
            {FIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Cards per page</span>
          <select
            name="cardsPerPage"
            onChange={handleCardsPerPageChange}
            value={query.cardsPerPage?.toString() ?? ""}
          >
            {CARDS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option.value || "auto"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Crop marks</span>
          <select
            name="showCropMarks"
            onChange={(event) =>
              updateSearchParams(searchParams, setSearchParams, {
                ...query,
                showCropMarks: event.currentTarget.value === "true" ? true : undefined,
              })
            }
            value={query.showCropMarks ? "true" : "false"}
          >
            <option value="false">Off</option>
            <option value="true">On</option>
          </select>
        </label>
      </div>

      <p>
        Sheet URL: <code>{printablePath}</code>
      </p>
      <p>
        The sheet uses the largest grid that fits at or below the selected cards-per-page target.
      </p>
    </section>
  );
}

export function PrintCardsPage({ apiBaseUrl }: PrintCardsPageProps): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = parsePrintableCardsPageQuery(searchParams);
  const api = createCloudArcanumApiClient({ baseUrl: apiBaseUrl });
  const cardFilters = buildCardFilters(query);
  const layout = computePrintableGridLayout({
    cardsPerPage: query.cardsPerPage,
    fit: query.fit ?? "tight",
    orientation: query.orientation ?? "auto",
    paperSize: query.paperSize ?? "letter",
  });
  const printablePageCss = buildPrintablePageCss(
    query.paperSize ?? "letter",
    layout.orientation,
  );

  const cardsState = useApiRequest(
    async (signal) => {
      const response = await api.listCards(cardFilters, { signal });
      return { items: response.data, meta: response.meta };
    },
    [apiBaseUrl, buildCardListQueryString(cardFilters)],
  ) as ListResourceState<CardListItem, CardsListMeta>;

  return (
    <div className="print-sheet-route">
      <style>{printablePageCss}</style>
      <PageLayout
        kicker="Print preview"
        title="Printable cards"
        description="A print-first view that packs the current card selection into physical sheets."
      >
        <PrintableControls
          query={query}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />

        {cardsState.status === "loading" || cardsState.status === "idle" ? (
          <LoadingState
            title="Loading printable cards"
            description="Fetching the current filtered card set for sheet packing."
          />
        ) : null}

        {cardsState.status === "error" && cardsState.error ? (
          <ErrorState
            title="Printable cards unavailable"
            description="We couldn't load the cards for the printable sheet."
            details={formatApiErrorDetails(cardsState.error)}
          />
        ) : null}

        {cardsState.status === "success" && cardsState.data ? (
          <PrintableCardSheet
            cards={cardsState.data.items}
            layout={layout}
            showCropMarks={query.showCropMarks ?? false}
          />
        ) : null}
      </PageLayout>
    </div>
  );
}
