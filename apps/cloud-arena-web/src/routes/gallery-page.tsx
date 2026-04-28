import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";

import { CloudArenaAppShell } from "../components/index.js";

type GalleryEntry = {
  title: string;
  artist: string;
  year: string;
  wikiUrl: string;
  imageUrl: string;
};

const GALLERY: GalleryEntry[] = [
  {
    title: "The Annunciation",
    artist: "Fra Angelico",
    year: "c. 1440–1445",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Angelico_-_Annunciation_-_San_Marco_north_corridor.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Angelico_-_Annunciation_-_San_Marco_north_corridor.jpg",
  },
  {
    title: "The Creation of Adam",
    artist: "Michelangelo",
    year: "c. 1508–1512",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Michelangelo_-_Creation_of_Adam_(cropped).jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/960px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg",
  },
  {
    title: "The Ancient of Days",
    artist: "William Blake",
    year: "1794",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:The_Ancient_of_Days_(Blake,_Research_Issues).jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg/960px-The_Ancient_of_Days_%28Blake%2C_Research_Issues%29.jpg",
  },
  {
    title: "Jacob Wrestles with the Angel",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:024.Jacob_Wrestles_with_the_Angel.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/024.Jacob_Wrestles_with_the_Angel.jpg/960px-024.Jacob_Wrestles_with_the_Angel.jpg",
  },
  {
    title: "The Angel Stopping Abraham",
    artist: "Rembrandt van Rijn",
    year: "1635",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son,_Isaac.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/96/Rembrandt_The_Angel_Preventing_Abraham_from_Sacrificing_his_Son%2C_Isaac.jpg",
  },
  {
    title: "Saint Michael Vanquishing Satan",
    artist: "Raphael",
    year: "1518",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Raphael_-_St._Michael_Vanquishing_Satan.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/Raphael_-_St._Michael_Vanquishing_Satan.jpg",
  },
  {
    title: "The Great Day of His Wrath",
    artist: "John Martin",
    year: "1853",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg/960px-John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg",
  },
  {
    title: "The Deluge",
    artist: "Gustave Doré",
    year: "1866",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I,_The_Deluge.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg/960px-Gustave_Dor%C3%A9_-_The_Holy_Bible_-_Plate_I%2C_The_Deluge.jpg",
  },
  {
    title: "The Last Judgment",
    artist: "Hieronymus Bosch",
    year: "c. 1482",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:Hieronymus_Bosch_-_The_Last_Judgement.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Hieronymus_Bosch_-_The_Last_Judgement.jpg/960px-Hieronymus_Bosch_-_The_Last_Judgement.jpg",
  },
  {
    title: "The Opening of the Fifth Seal",
    artist: "El Greco",
    year: "c. 1608–1614",
    wikiUrl: "https://commons.wikimedia.org/wiki/File:El_Greco_-_The_Opening_of_the_Fifth_Seal_(The_Vision_of_St_John)_-_WGA10637.jpg",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/El_Greco_-_The_Opening_of_the_Fifth_Seal_%28The_Vision_of_St_John%29_-_WGA10637.jpg/960px-El_Greco_-_The_Opening_of_the_Fifth_Seal_%28The_Vision_of_St_John%29_-_WGA10637.jpg",
  },
];

type CloudArenaGalleryPageProps = {
  cloudArcanumWebBaseUrl: string;
};

export function CloudArenaGalleryPage({
  cloudArcanumWebBaseUrl,
}: CloudArenaGalleryPageProps): ReactElement {
  const [active, setActive] = useState<GalleryEntry | null>(null);
  const [copied, setCopied] = useState(false);

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

          <div className="cloud-arena-gallery-stage">
            <section className="cloud-arena-gallery-column">
              <div className="cloud-arena-gallery-scroll-pane">
                <div className="cloud-arena-gallery-panel">
                  <div className="cloud-arena-gallery-grid">
                    {GALLERY.map((entry) => (
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
                </div>
              </div>
            </section>
          </div>
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
