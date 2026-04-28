import { useState, useMemo, type ReactElement } from "react";
import { Link } from "react-router-dom";

import { CloudArenaAppShell } from "../components/index.js";
import { GALLERY, type GalleryEntry } from "./gallery-data.js";

const PAGE_SIZE = 12;
type SortKey = "title" | "artist" | "year";
type SortDir = "asc" | "desc";

type CloudArenaGalleryPageProps = {
  cloudArcanumWebBaseUrl: string;
};

export function CloudArenaGalleryPage({
  cloudArcanumWebBaseUrl,
}: CloudArenaGalleryPageProps): ReactElement {
  const [active, setActive] = useState<GalleryEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return GALLERY;
    return GALLERY.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.artist.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey].toLowerCase();
      const bv = b[sortKey].toLowerCase();
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = sorted.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function handleSearch(q: string): void {
    setSearchQuery(q);
    setPage(0);
  }

  function handleSort(key: SortKey): void {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  function openLightbox(entry: GalleryEntry): void {
    setActive(entry);
    setCopied(false);
  }

  function closeLightbox(): void {
    setActive(null);
    setCopied(false);
  }

  function copyUrl(): void {
    if (!active) return;
    void navigator.clipboard.writeText(active.imageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function sortLabel(key: SortKey): string {
    if (key !== sortKey) return key.charAt(0).toUpperCase() + key.slice(1);
    return `${key.charAt(0).toUpperCase() + key.slice(1)} ${sortDir === "asc" ? "↑" : "↓"}`;
  }

  return (
    <CloudArenaAppShell cloudArcanumWebBaseUrl={cloudArcanumWebBaseUrl} fullBleed>
      <section className="cloud-arena-start-screen cloud-arena-run-screen cloud-arena-gallery">
        <div className="cloud-arena-start-backdrop" aria-hidden="true">
          <span className="cloud-arena-start-orb cloud-arena-start-orb-left" />
          <span className="cloud-arena-start-orb cloud-arena-start-orb-right" />
          <span className="cloud-arena-start-rift" />
          <span className="cloud-arena-start-rift cloud-arena-start-rift-secondary" />
        </div>

        <div className="cloud-arena-gallery-layout">
          <header className="cloud-arena-gallery-header">
            <h2 className="cloud-arena-gallery-title">Art Gallery</h2>
            <Link className="cloud-arena-start-menu-item cloud-arena-gallery-back" to="/">
              <strong>← Back</strong>
            </Link>
          </header>

          <div className="cloud-arena-gallery-toolbar">
            <input
              className="cloud-arena-gallery-search"
              type="search"
              placeholder="Search title or artist…"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              aria-label="Search gallery"
            />
            <div className="cloud-arena-gallery-sort-group">
              <span className="cloud-arena-gallery-sort-label">Sort:</span>
              {(["title", "artist", "year"] as SortKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`cloud-arena-gallery-sort-btn${sortKey === k ? " is-active" : ""}`}
                  onClick={() => handleSort(k)}
                >
                  {sortLabel(k)}
                </button>
              ))}
            </div>
          </div>

          <div className="cloud-arena-gallery-stage">
            <section className="cloud-arena-gallery-column">
              <div className="cloud-arena-gallery-scroll-pane">
                <div className="cloud-arena-gallery-panel">
                  {paginated.length === 0 ? (
                    <p className="cloud-arena-gallery-empty">No results found.</p>
                  ) : (
                    <div className="cloud-arena-gallery-grid">
                      {paginated.map((entry) => (
                        <button
                          key={entry.wikiUrl}
                          type="button"
                          className="cloud-arena-gallery-entry"
                          onClick={() => openLightbox(entry)}
                          aria-label={`View ${entry.title} by ${entry.artist}`}
                        >
                          <div className="cloud-arena-gallery-thumb-wrap">
                            <img
                              src={entry.imageUrl}
                              alt={entry.title}
                              className="cloud-arena-gallery-thumb"
                              loading="lazy"
                            />
                          </div>
                          <div className="cloud-arena-gallery-caption">
                            <span className="cloud-arena-gallery-entry-title">{entry.title}</span>
                            <span className="cloud-arena-gallery-entry-artist">{entry.artist}, {entry.year}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {totalPages > 1 && (
            <div className="cloud-arena-gallery-pagination">
              <button
                type="button"
                className="cloud-arena-gallery-page-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
              >
                ← Prev
              </button>
              <span className="cloud-arena-gallery-page-info">
                Page {safePage + 1} of {totalPages}
                <span className="cloud-arena-gallery-page-count"> ({sorted.length} works)</span>
              </span>
              <button
                type="button"
                className="cloud-arena-gallery-page-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {active && (
          <div
            className="cloud-arena-gallery-lightbox-backdrop"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.title} by ${active.artist}`}
          >
            <div
              className="cloud-arena-gallery-lightbox"
              role="presentation"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={active.imageUrl}
                alt={active.title}
                className="cloud-arena-gallery-lightbox-img"
              />
              <div className="cloud-arena-gallery-lightbox-info">
                <div className="cloud-arena-gallery-lightbox-text">
                  <p className="cloud-arena-gallery-lightbox-title">{active.title}</p>
                  <p className="cloud-arena-gallery-lightbox-artist">{active.artist}, {active.year}</p>
                  <a
                    href={active.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cloud-arena-gallery-lightbox-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Wikimedia Commons ↗
                  </a>
                </div>
                <div className="cloud-arena-gallery-lightbox-actions">
                  <button
                    type="button"
                    className="cloud-arena-gallery-copy-btn"
                    onClick={copyUrl}
                  >
                    {copied ? "Copied!" : "Copy image URL"}
                  </button>
                  <button
                    type="button"
                    className="cloud-arena-gallery-close-btn"
                    onClick={closeLightbox}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </CloudArenaAppShell>
  );
}
