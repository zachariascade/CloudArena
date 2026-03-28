import type { ReactElement } from "react";
import { Link, useParams } from "react-router-dom";

import type { CardColor, CardId, CardStatus } from "../../../../src/domain/index.js";
import type { CardDetail } from "../../../../src/cloud-arcanum/api-contract.js";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
} from "../components/index.js";
import {
  buildCardsPagePath,
  CloudArcanumApiClientError,
  createCloudArcanumApiClient,
  useApiRequest,
} from "../lib/index.js";

type CardDetailPageProps = {
  apiBaseUrl: string;
};

function formatApiErrorDetails(error: Error | CloudArcanumApiClientError): ReactElement {
  if (error instanceof CloudArcanumApiClientError) {
    return (
      <p>
        Route <code>{error.route}</code> returned status <code>{error.status}</code>
        {error.code ? (
          <>
            {" "}
            with code <code>{error.code}</code>
          </>
        ) : null}
        .
      </p>
    );
  }

  return <p>{error.message}</p>;
}

function toStatusTone(status: CardStatus): string {
  switch (status) {
    case "approved":
      return "approved";
    case "balanced":
      return "balanced";
    case "templating":
      return "templating";
    case "draft":
    default:
      return "draft";
  }
}

function formatCardColors(colors: CardColor[]): string {
  return colors.length > 0 ? colors.join(" ") : "Colorless";
}

function ValueOrPlaceholder({
  value,
  placeholder = "TBD",
}: {
  value: string | number | null | undefined;
  placeholder?: string;
}): ReactElement {
  if (value === null || value === undefined || value === "") {
    return <span className="detail-placeholder">{placeholder}</span>;
  }

  return <>{String(value)}</>;
}

function buildImagePreview(card: CardDetail): ReactElement {
  if (card.image.isRenderable && card.image.publicUrl) {
    return (
      <img
        alt={card.image.alt}
        className="card-detail-image"
        src={card.image.publicUrl}
      />
    );
  }

  return (
    <div className="card-preview-fallback card-detail-fallback" aria-label="Preview pending">
      <strong>
        {card.image.kind === "placeholder" || card.image.kind === "missing"
          ? "Preview pending"
          : "Image unavailable"}
      </strong>
      <span>{card.typeLine}</span>
    </div>
  );
}

function CardSignalBadge({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "warning" | "danger";
}): ReactElement {
  return <span className={`signal-badge ${tone}`}>{label}</span>;
}

function CardStatusBadge({ status }: { status: CardStatus }): ReactElement {
  return <span className={`status-badge ${toStatusTone(status)}`}>{status}</span>;
}

function CardDetailView({ card }: { card: CardDetail }): ReactElement {
  return (
    <div className="detail-layout">
      <section className="detail-hero panel">
        <div className="detail-hero-media">{buildImagePreview(card)}</div>
        <div className="detail-hero-body">
          <div className="detail-hero-header">
            <div>
              <h2>{card.name}</h2>
              <p>{card.typeLine}</p>
            </div>
            <CardStatusBadge status={card.draft.status} />
          </div>

          <div className="card-result-signals">
            <CardSignalBadge
              label={
                card.draft.hasUnresolvedMechanics
                  ? `${card.draft.unresolvedFields.length} unresolved fields`
                  : "Mechanics resolved"
              }
              tone={card.draft.hasUnresolvedMechanics ? "warning" : "neutral"}
            />
            <CardSignalBadge
              label={
                card.validation.hasErrors
                  ? `${card.validation.errorCount} validation issues`
                  : "Validation clean"
              }
              tone={card.validation.hasErrors ? "danger" : "neutral"}
            />
            <CardSignalBadge
              label={card.image.isRenderable ? "Image ready" : "Missing image"}
              tone={card.image.isRenderable ? "neutral" : "warning"}
            />
          </div>

          <div className="detail-stat-grid">
            <div className="meta-tile">
              <span>Mana cost</span>
              <strong>
                <ValueOrPlaceholder value={card.manaCost} />
              </strong>
            </div>
            <div className="meta-tile">
              <span>Mana value</span>
              <strong>
                <ValueOrPlaceholder value={card.manaValue} />
              </strong>
            </div>
            <div className="meta-tile">
              <span>Colors</span>
              <strong>{formatCardColors(card.colors)}</strong>
            </div>
            <div className="meta-tile">
              <span>Color identity</span>
              <strong>{formatCardColors(card.colorIdentity)}</strong>
            </div>
            <div className="meta-tile">
              <span>Rarity</span>
              <strong>
                <ValueOrPlaceholder value={card.rarity} placeholder="Unassigned" />
              </strong>
            </div>
            <div className="meta-tile">
              <span>Artist</span>
              <strong>
                <ValueOrPlaceholder value={card.artist} />
              </strong>
            </div>
          </div>
        </div>
      </section>

      <div className="detail-columns">
        <section className="panel detail-section">
          <strong>Rules text</strong>
          <div className="detail-copy">
            <p>
              <ValueOrPlaceholder value={card.oracleText} placeholder="Oracle text still in draft." />
            </p>
            <p className="detail-flavor">
              <ValueOrPlaceholder value={card.flavorText} placeholder="Flavor text not yet written." />
            </p>
          </div>
        </section>

        <section className="panel detail-section">
          <strong>Canonical metadata</strong>
          <dl className="detail-definition-list">
            <div>
              <dt>Card id</dt>
              <dd><code>{card.id}</code></dd>
            </div>
            <div>
              <dt>Slug</dt>
              <dd><code>{card.slug}</code></dd>
            </div>
            <div>
              <dt>Power / Toughness</dt>
              <dd>
                <ValueOrPlaceholder value={card.power} /> / <ValueOrPlaceholder value={card.toughness} />
              </dd>
            </div>
            <div>
              <dt>Loyalty</dt>
              <dd><ValueOrPlaceholder value={card.loyalty} /></dd>
            </div>
            <div>
              <dt>Defense</dt>
              <dd><ValueOrPlaceholder value={card.defense} /></dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{card.createdAt}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{card.updatedAt}</dd>
            </div>
          </dl>
        </section>

        <section className="panel detail-section">
          <strong>Mechanics</strong>
          {card.mechanics.length > 0 ? (
            <div className="card-result-tags">
              {card.mechanics.map((mechanic) => (
                <span key={mechanic} className="tag-chip">
                  {mechanic}
                </span>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No mechanics listed"
              description="This card does not yet have mechanics recorded in the API response."
            />
          )}
          {card.draft.hasUnresolvedMechanics ? (
            <div className="warning-callout">
              <strong>Unresolved placeholders</strong>
              <ul>
                {card.draft.unresolvedFields.map((field) => (
                  <li key={field}>
                    <code>{field}</code>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="panel detail-section">
          <strong>Set and universe</strong>
          <div className="detail-links">
            <Link className="text-link" to={buildCardsPagePath({ setId: card.set.id })}>
              {card.set.name} ({card.set.code})
            </Link>
            <Link className="text-link" to={buildCardsPagePath({ universeId: card.universe.id })}>
              {card.universe.name}
            </Link>
          </div>
        </section>

        <section className="panel detail-section">
          <strong>Deck usage</strong>
          {card.decks.length > 0 ? (
            <div className="detail-list">
              {card.decks.map((deck) => (
                <Link
                  key={deck.id}
                  className="detail-list-item text-link"
                  to={buildCardsPagePath({ deckId: deck.id })}
                >
                  <span>{deck.name}</span>
                  <strong>{deck.quantity}x</strong>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No deck references"
              description="No deck usage was returned for this card."
            />
          )}
        </section>

        <section className="panel detail-section">
          <strong>Validation summary</strong>
          <div className="detail-list">
            <div className="detail-list-item">
              <span>Has errors</span>
              <strong>{card.validation.hasErrors ? "Yes" : "No"}</strong>
            </div>
            <div className="detail-list-item">
              <span>Error count</span>
              <strong>{card.validation.errorCount}</strong>
            </div>
            <div className="detail-list-item">
              <span>Review label</span>
              <strong>{card.draft.reviewLabel}</strong>
            </div>
          </div>
          {card.notes ? (
            <div className="warning-callout neutral-callout">
              <strong>Notes</strong>
              <p>{card.notes}</p>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function CardDetailPage({ apiBaseUrl }: CardDetailPageProps): ReactElement {
  const params = useParams();
  const cardId = params.cardId;
  const api = createCloudArcanumApiClient({ baseUrl: apiBaseUrl });

  const state = useApiRequest(
    async (signal) => {
      if (!cardId) {
        throw new Error("Card id is missing from the route.");
      }

      const response = await api.getCardDetail({ cardId: cardId as CardId }, { signal });
      return response.data;
    },
    [apiBaseUrl, cardId],
  );

  return (
    <PageLayout
      kicker="Card detail"
      title={cardId ? `Card ${cardId}` : "Card detail"}
      description="Inspect the full card record, including rendering state, relationships, and draft/validation signals."
    >
      {state.status === "loading" || state.status === "idle" ? (
        <LoadingState
          title="Loading card detail"
          description="Fetching the card detail response and preparing the detail layout."
        />
      ) : null}

      {state.status === "error" && state.error ? (
        <ErrorState
          title="Card detail request failed"
          description="The detail route is wired up, but the backend card detail endpoint is not returning a successful response yet."
          details={
            <>
              {formatApiErrorDetails(state.error)}
              <p>
                Route id: <code>{cardId ?? "missing"}</code>. Return to{" "}
                <Link className="text-link" to="/cards">
                  cards
                </Link>{" "}
                or try another deep link once the API route is available.
              </p>
            </>
          }
        />
      ) : null}

      {state.status === "success" && state.data ? <CardDetailView card={state.data} /> : null}
    </PageLayout>
  );
}
