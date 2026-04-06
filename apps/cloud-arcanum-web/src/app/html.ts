export function renderCloudArcanumWebHtml(apiBaseUrl: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cloud Arcanum</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f7f0e6;
        --panel: rgba(255, 252, 247, 0.9);
        --ink: #1c1713;
        --muted: #5f544c;
        --accent: #9a3412;
        --border: rgba(95, 84, 76, 0.18);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top, rgba(251, 191, 36, 0.22), transparent 34%),
          linear-gradient(160deg, #fbf6ef 0%, var(--bg) 52%, #efe0c9 100%);
      }

      #root {
        min-height: 100vh;
      }

      .app-shell {
        width: min(76rem, calc(100vw - 1.5rem));
        margin: 0 auto;
        padding: 1.5rem 0 4rem;
      }

      .app-header {
        display: grid;
        gap: 0.9rem;
        margin-bottom: 1.15rem;
      }

      @media (min-width: 960px) {
        .app-header {
          gap: 1rem;
        }
      }

      .brand-block {
        display: grid;
        gap: 0.65rem;
      }

      .app-header .panel {
        padding: 1.5rem 1.5rem 1.35rem;
      }

      .brand-block h1 {
        margin: 0;
        font-size: clamp(2.9rem, 7vw, 5.2rem);
        line-height: 0.92;
        letter-spacing: -0.04em;
      }

      .brand-block p {
        max-width: 42rem;
        font-size: 1.02rem;
      }

      .nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
        justify-content: flex-start;
        align-items: center;
        padding: 0.55rem;
      }

      @media (min-width: 960px) {
        .nav {
          justify-content: flex-start;
        }
      }

      .eyebrow {
        display: inline-flex;
        width: fit-content;
        align-items: center;
        gap: 0.5rem;
        padding: 0.45rem 0.75rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.12);
        background: rgba(255, 250, 240, 0.8);
        color: var(--accent);
        font-size: 0.82rem;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .panel {
        padding: 2rem;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--panel);
        backdrop-filter: blur(10px);
        box-shadow: 0 20px 60px rgba(28, 23, 19, 0.08);
      }

      p {
        margin: 0;
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--muted);
      }

      code {
        font-family: "SFMono-Regular", Consolas, monospace;
        font-size: 0.95em;
      }

      .nav a {
        display: inline-flex;
        align-items: center;
        min-height: 2.7rem;
        padding: 0.75rem 1.1rem;
        border-radius: 16px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--ink);
        text-decoration: none;
        font-weight: 600;
        letter-spacing: 0.01em;
        transition:
          transform 140ms ease,
          border-color 140ms ease,
          background 140ms ease;
      }

      .nav a:hover {
        transform: translateY(-1px);
        border-color: rgba(154, 52, 18, 0.28);
        background: rgba(255, 255, 255, 0.7);
      }

      .nav a.active {
        background: rgba(154, 52, 18, 0.12);
        border-color: rgba(154, 52, 18, 0.32);
        color: var(--accent);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
      }

      @media (max-width: 659px) {
        .app-shell {
          width: min(76rem, calc(100vw - 1rem));
        }

        .app-header .panel {
          padding: 1.25rem 1.15rem 1.1rem;
        }

        .nav a {
          min-height: 2.55rem;
          padding: 0.68rem 0.92rem;
        }
      }

      .text-link {
        color: var(--accent);
        text-decoration-thickness: 0.08em;
        text-underline-offset: 0.14em;
      }

      .grid {
        display: grid;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      @media (min-width: 760px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .card {
        padding: 1rem 1.1rem;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.7);
      }

      .card strong {
        display: block;
        margin-bottom: 0.4rem;
      }

      .section-header {
        display: grid;
        gap: 0.6rem;
        margin-bottom: 1.5rem;
      }

      .section-header h2 {
        margin: 0;
        font-size: clamp(1.8rem, 4vw, 2.4rem);
      }

      .section-kicker {
        color: var(--accent);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.84rem;
      }

      .empty-state {
        display: grid;
        gap: 1rem;
      }

      .loading-state,
      .error-state {
        min-height: 13rem;
        align-content: start;
      }

      .loading-pulse {
        width: 3rem;
        height: 3rem;
        border-radius: 999px;
        background:
          radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.92), transparent 35%),
          linear-gradient(135deg, rgba(154, 52, 18, 0.16), rgba(251, 191, 36, 0.35));
        box-shadow: inset 0 0 0 1px rgba(154, 52, 18, 0.08);
        animation: pulse 1.2s ease-in-out infinite;
      }

      .error-details {
        padding: 0.9rem 1rem;
        border-radius: 16px;
        border: 1px solid rgba(154, 52, 18, 0.16);
        background: rgba(154, 52, 18, 0.06);
        color: var(--muted);
      }

      .empty-state ul {
        margin: 0;
        padding-left: 1.1rem;
        color: var(--muted);
      }

      .meta-grid {
        display: grid;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      @media (min-width: 760px) {
        .meta-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .meta-tile {
        padding: 1rem 1.1rem;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.62);
      }

      .meta-tile span {
        display: block;
        margin-bottom: 0.35rem;
        color: var(--muted);
        font-size: 0.9rem;
      }

      .meta-tile strong {
        font-size: 1.2rem;
      }

      .data-list {
        display: grid;
        gap: 1rem;
      }

      .summary-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }

      .summary-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.55rem 0.8rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.72);
        color: var(--muted);
      }

      .trace-viewer-layout {
        display: grid;
        gap: 0.9rem;
      }

      .trace-viewer-hero {
        display: grid;
        gap: 0.85rem;
        padding: 1.25rem;
      }

      .trace-viewer-hero-grid {
        display: grid;
        gap: 0.75rem;
      }

      @media (min-width: 980px) {
        .trace-viewer-hero-grid {
          grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
          align-items: start;
        }
      }

      .trace-viewer-controls,
      .trace-viewer-current-action,
      .trace-viewer-log-panel {
        display: grid;
        gap: 0.55rem;
      }

      .trace-viewer-controls,
      .trace-viewer-current-action {
        padding: 0;
        border: none;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
        backdrop-filter: none;
      }

      .trace-viewer-summary-row,
      .trace-viewer-button-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      .trace-viewer-inline-meta {
        margin-bottom: 0;
      }

      .trace-viewer-keyboard-hint {
        font-size: 0.92rem;
      }

      .trace-viewer-content-grid {
        display: grid;
        gap: 0.9rem;
      }

      @media (min-width: 1080px) {
        .trace-viewer-content-grid {
          grid-template-columns: minmax(0, 1.25fr) minmax(20rem, 0.95fr);
          align-items: start;
        }

        .cloud-arena-content-grid-full {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .trace-viewer-main-column {
        min-width: 0;
        width: 100%;
      }

      .trace-viewer-panels {
        display: grid;
        gap: 0.8rem;
        width: 100%;
      }

      @media (min-width: 760px) {
        .trace-viewer-panels {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          align-items: stretch;
        }
      }

      .trace-viewer-panel {
        display: grid;
        gap: 0.35rem;
        min-width: 0;
        padding: 1.1rem 1.15rem;
      }

      .cloud-arena-top-panels {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: stretch;
      }

      .cloud-arena-summary-panel {
        min-height: 100%;
      }

      @media (max-width: 699px) {
        .cloud-arena-top-panels {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .trace-viewer-hand-bar {
        gap: 0.8rem;
      }

      .trace-viewer-panel-wide {
        grid-column: 1 / -1;
      }

      .trace-viewer-section-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .trace-viewer-section-header span {
        color: var(--muted);
        font-size: 0.84rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .trace-viewer-list,
      .trace-viewer-log {
        display: grid;
        gap: 0.35rem;
        margin: 0;
        padding-left: 1rem;
        color: var(--muted);
      }

      .trace-viewer-log-panel {
        padding: 1.1rem 1.15rem;
      }

      .trace-viewer-log-groups {
        display: grid;
        gap: 0.75rem;
        max-height: 32rem;
        overflow: auto;
        padding-right: 0.2rem;
      }

      .trace-viewer-log-group {
        display: grid;
        gap: 0.45rem;
      }

      .trace-viewer-log-turn {
        position: sticky;
        top: 0;
        z-index: 1;
        width: fit-content;
        padding: 0.32rem 0.62rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 250, 240, 0.94);
        color: var(--accent);
        font-size: 0.84rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .trace-viewer-log {
        gap: 0.4rem;
        margin-left: 0;
        padding-right: 0.35rem;
      }

      .trace-viewer-log-current {
        color: var(--ink);
        font-weight: 700;
        background: rgba(154, 52, 18, 0.08);
        border-radius: 12px;
        padding: 0.3rem 0.45rem;
      }

      .trace-viewer-card-grid {
        display: grid;
        gap: 0.65rem;
        grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
      }

      .trace-viewer-hand-scroll {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(13rem, 16rem);
        gap: 0.8rem;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 0.15rem 0.15rem 0.45rem;
        scroll-snap-type: x proximity;
      }

      .trace-viewer-hand-card {
        min-height: 100%;
        scroll-snap-align: start;
      }

      .trace-viewer-hand-card-button {
        width: 100%;
        border: 1px solid rgba(130, 94, 52, 0.18);
        background:
          linear-gradient(180deg, rgba(255, 251, 238, 0.96), rgba(249, 242, 220, 0.92));
        color: inherit;
        font: inherit;
        text-align: left;
        cursor: pointer;
      }

      .trace-viewer-hand-card-playable {
        box-shadow:
          inset 0 0 0 1px rgba(154, 52, 18, 0.12),
          0 12px 28px rgba(98, 57, 18, 0.12);
      }

      .trace-viewer-hand-card-disabled {
        opacity: 0.78;
      }

      .trace-viewer-hand-card-button:hover:enabled {
        transform: translateY(-2px);
        border-color: rgba(154, 52, 18, 0.34);
        box-shadow:
          inset 0 0 0 1px rgba(154, 52, 18, 0.16),
          0 16px 34px rgba(98, 57, 18, 0.16);
      }

      .trace-viewer-hand-card-button:focus-visible {
        outline: 3px solid rgba(154, 52, 18, 0.28);
        outline-offset: 3px;
      }

      .trace-viewer-board-grid {
        align-items: start;
      }

      .trace-viewer-card {
        display: grid;
        gap: 0.35rem;
        padding: 0.8rem 0.85rem;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.74);
      }

      .trace-viewer-card-empty {
        background: rgba(255, 255, 255, 0.45);
      }

      .trace-viewer-card-meta {
        color: var(--muted);
        font-size: 0.9rem;
      }

      .trace-viewer-card-header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.5rem;
      }

      .trace-viewer-card-cost {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.9rem;
        min-height: 1.9rem;
        padding: 0.2rem 0.45rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.2);
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.26), rgba(154, 52, 18, 0.14));
        color: var(--accent);
        font-weight: 800;
        line-height: 1;
      }

      .trace-viewer-card-stats,
      .trace-viewer-card-tags,
      .trace-viewer-zone-row,
      .trace-viewer-stat-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .trace-viewer-card-stats span,
      .trace-viewer-card-tags span,
      .trace-viewer-inline-action,
      .trace-viewer-zone-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.28rem 0.52rem;
        border-radius: 999px;
        background: rgba(154, 52, 18, 0.08);
        color: var(--muted);
        font-size: 0.86rem;
      }

      .trace-viewer-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .trace-viewer-inline-action {
        border: 1px solid rgba(130, 94, 52, 0.16);
        background: rgba(255, 255, 255, 0.72);
        color: var(--ink);
        font: inherit;
        font-size: 0.84rem;
        font-weight: 700;
      }

      .trace-viewer-inline-action-available {
        box-shadow: inset 0 0 0 1px rgba(154, 52, 18, 0.08);
      }

      .trace-viewer-inline-action-disabled {
        opacity: 0.7;
      }

      .trace-viewer-zone-row {
        margin-top: 0.2rem;
      }

      .trace-viewer-hand-zones {
        margin-top: 0;
      }

      .trace-viewer-hand-actions {
        margin-bottom: 0.8rem;
      }

      .trace-viewer-stat-chip {
        display: grid;
        gap: 0.18rem;
        min-width: 7rem;
        padding: 0.55rem 0.72rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.68);
      }

      .trace-viewer-stat-chip span {
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .trace-viewer-stat-chip strong {
        font-size: 0.98rem;
        line-height: 1.2;
      }

      .trace-viewer-health-bar {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 0.5rem;
        border-radius: 999px;
        background: rgba(17, 24, 39, 0.08);
      }

      .trace-viewer-health-bar-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #16a34a, #4ade80);
        transition: width 180ms ease;
      }

      .ghost-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 2.45rem;
        padding: 0.58rem 0.9rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.72);
        color: var(--ink);
        cursor: pointer;
        font: inherit;
        transition:
          transform 140ms ease,
          border-color 140ms ease,
          background 140ms ease;
      }

      .ghost-button:hover:enabled {
        transform: translateY(-1px);
        border-color: rgba(154, 52, 18, 0.28);
        background: rgba(255, 255, 255, 0.92);
      }

      .ghost-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .query-list {
        display: grid;
        gap: 0.5rem;
        margin: 0;
      }

      .query-list div {
        display: grid;
        gap: 0.2rem;
      }

      .query-list dd {
        margin: 0;
      }

      .query-list code {
        color: var(--ink);
      }

      .filters-panel {
        display: grid;
        gap: 1rem;
      }

      .filters-header {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .search-form {
        display: grid;
        gap: 0.75rem;
      }

      @media (min-width: 760px) {
        .search-form {
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
        }
      }

      .filters-grid {
        display: grid;
        gap: 0.9rem;
      }

      .filters-disclosure {
        display: grid;
        gap: 0.85rem;
      }

      .search-form .filters-disclosure {
        grid-column: 1 / -1;
      }

      .filters-disclosure-toggle {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        width: fit-content;
        cursor: pointer;
        color: var(--accent);
        font-weight: 700;
        list-style: none;
      }

      .filters-disclosure-toggle::-webkit-details-marker {
        display: none;
      }

      .filters-disclosure-toggle::before {
        content: "▸";
        font-size: 0.9rem;
        transition: transform 140ms ease;
      }

      .filters-disclosure[open] .filters-disclosure-toggle::before {
        transform: rotate(90deg);
      }

      .filters-disclosure-content {
        display: grid;
        gap: 1rem;
      }

      @media (min-width: 760px) {
        .filters-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .field {
        display: grid;
        gap: 0.45rem;
      }

      .field span {
        color: var(--muted);
        font-size: 0.92rem;
        font-weight: 600;
      }

      .field input,
      .field select {
        width: 100%;
        min-height: 2.8rem;
        padding: 0.72rem 0.9rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.82);
        color: var(--ink);
        font: inherit;
      }

      .primary-button,
      .ghost-button {
        min-height: 2.55rem;
        padding: 0.64rem 0.95rem;
        border-radius: 999px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .primary-button {
        border: 1px solid rgba(154, 52, 18, 0.35);
        background: linear-gradient(135deg, #d97706, #9a3412);
        color: #fff8f1;
      }

      .ghost-button {
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.7);
        color: var(--ink);
      }

      .toggle-groups {
        display: grid;
        gap: 1rem;
      }

      .toggle-group {
        margin: 0;
        padding: 0;
        border: 0;
        display: grid;
        gap: 0.6rem;
      }

      .toggle-group legend {
        padding: 0;
        color: var(--muted);
        font-size: 0.92rem;
        font-weight: 700;
      }

      .toggle-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      .toggle-chip {
        position: relative;
        display: inline-flex;
      }

      .toggle-chip input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .toggle-chip span {
        display: inline-flex;
        align-items: center;
        min-height: 2.3rem;
        padding: 0.55rem 0.8rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.74);
        color: var(--ink);
        font-size: 0.94rem;
        cursor: pointer;
      }

      .toggle-chip input:checked + span {
        border-color: rgba(154, 52, 18, 0.3);
        background: rgba(154, 52, 18, 0.11);
        color: var(--accent);
      }

      .cards-gallery {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 1rem;
        align-items: start;
        justify-items: center;
      }

      @media (min-width: 640px) {
        .cards-gallery {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1.1rem;
        }
      }

      @media (min-width: 900px) {
        .cards-gallery {
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.25rem;
        }
      }

      @media (min-width: 1240px) {
        .cards-gallery {
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.35rem;
        }
      }

      @media (min-width: 1680px) {
        .cards-gallery {
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
      }

      .card-face-tile {
        --card-frame-top: rgba(255, 249, 214, 0.85);
        --card-frame-mid: #d9b865;
        --card-frame-base: #cfab4c;
        --card-frame-ink: rgba(80, 53, 20, 0.24);
        --card-frame-shadow: rgba(55, 31, 8, 0.18);
        --card-panel-top: #fffbee;
        --card-panel-bottom: #efe4bd;
        --card-panel-border: rgba(95, 74, 36, 0.34);
        --card-accent: #7c5b24;
        --card-highlight: rgba(255, 250, 229, 0.55);
        --card-art-frame: rgba(70, 46, 16, 0.46);
        --card-art-backdrop: rgba(27, 17, 8, 0.88);
        --card-display-font: "Cochin", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
        --card-rules-font: "Baskerville", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
        --card-title-size: clamp(0.8rem, 5.8cqw, 1.42rem);
        --card-typeline-size: clamp(0.68rem, 3.8cqw, 0.84rem);
        --card-rules-size: clamp(0.68rem, 3.9cqw, 0.9rem);
        --card-footer-size: clamp(0.5rem, 2.55cqw, 0.62rem);
        display: grid;
        gap: 0.35rem;
        width: min(100%, 22.75rem);
        container-type: inline-size;
      }

      .card-face-link {
        display: block;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        color: inherit;
        font: inherit;
        text-align: inherit;
        text-decoration: none;
        cursor: pointer;
      }

      .card-face-link:focus-visible {
        outline: 3px solid rgba(154, 52, 18, 0.35);
        outline-offset: 6px;
        border-radius: 26px;
      }

      .card-face {
        position: relative;
        display: grid;
        grid-template-rows: auto 1fr auto auto auto;
        width: 100%;
        aspect-ratio: 5 / 7;
        --card-face-padding: clamp(0.45rem, 2.2cqw, 0.7rem);
        padding: var(--card-face-padding);
        border-radius: clamp(18px, 7cqw, 24px);
        border: 4px solid rgba(10, 8, 7, 0.96);
        background:
          radial-gradient(circle at 50% 0%, var(--card-frame-top), transparent 38%),
          radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.36), transparent 24%),
          linear-gradient(180deg, color-mix(in srgb, var(--card-frame-mid) 40%, white) 0%, var(--card-frame-mid) 22%, color-mix(in srgb, var(--card-frame-mid) 36%, white) 55%, var(--card-frame-base) 100%);
        box-shadow:
          0 10px 24px var(--card-frame-shadow),
          inset 0 0 0 3px rgba(14, 11, 9, 0.92),
          inset 0 0 0 2px var(--card-highlight),
          inset 0 0 0 4px rgba(255, 255, 255, 0.16);
        transition:
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease;
      }

      .card-face-link:hover .card-face {
        transform: translateY(-2px);
        box-shadow:
          0 16px 30px color-mix(in srgb, var(--card-frame-shadow) 82%, black),
          inset 0 0 0 3px rgba(14, 11, 9, 0.94),
          inset 0 0 0 2px var(--card-highlight),
          inset 0 0 0 4px rgba(255, 255, 255, 0.18);
      }

      .tone-white .card-face {
        --card-frame-top: rgba(247, 251, 255, 0.94);
        --card-frame-mid: #d7dde8;
        --card-frame-base: #bfc8d8;
        --card-frame-ink: rgba(96, 108, 132, 0.28);
        --card-frame-shadow: rgba(83, 96, 122, 0.16);
        --card-panel-top: #fdfefe;
        --card-panel-bottom: #e8edf5;
        --card-accent: #6b778f;
      }

      .tone-blue .card-face {
        --card-frame-top: rgba(230, 245, 255, 0.82);
        --card-frame-mid: #8eadc5;
        --card-frame-base: #6c8ca6;
        --card-frame-ink: rgba(55, 82, 112, 0.28);
        --card-frame-shadow: rgba(35, 64, 91, 0.19);
        --card-panel-top: #f1f8ff;
        --card-panel-bottom: #dbeaf6;
        --card-accent: #295273;
      }

      .tone-black .card-face {
        --card-frame-top: rgba(231, 224, 233, 0.72);
        --card-frame-mid: #84758f;
        --card-frame-base: #6d5f78;
        --card-frame-ink: rgba(69, 56, 80, 0.32);
        --card-frame-shadow: rgba(39, 27, 51, 0.22);
        --card-panel-top: #f1ebf4;
        --card-panel-bottom: #d9cfdf;
        --card-accent: #503f5f;
      }

      .tone-red .card-face {
        --card-frame-top: rgba(255, 233, 225, 0.82);
        --card-frame-mid: #d78960;
        --card-frame-base: #be6d47;
        --card-frame-ink: rgba(112, 59, 33, 0.28);
        --card-frame-shadow: rgba(88, 43, 17, 0.2);
        --card-panel-top: #fff4ed;
        --card-panel-bottom: #f4dbcf;
        --card-accent: #964b24;
      }

      .tone-green .card-face {
        --card-frame-top: rgba(232, 246, 226, 0.82);
        --card-frame-mid: #93b36d;
        --card-frame-base: #779756;
        --card-frame-ink: rgba(69, 93, 45, 0.28);
        --card-frame-shadow: rgba(41, 67, 24, 0.2);
        --card-panel-top: #f2faec;
        --card-panel-bottom: #dcebcf;
        --card-accent: #456129;
      }

      .tone-multicolor .card-face {
        --card-frame-top: rgba(255, 244, 224, 0.84);
        --card-frame-mid: #d8ab5d;
        --card-frame-base: #b78b47;
        --card-frame-ink: rgba(102, 72, 24, 0.3);
        --card-frame-shadow: rgba(83, 55, 13, 0.22);
        --card-panel-top: #fff7e7;
        --card-panel-bottom: #f0e2bc;
        --card-accent: #8f641e;
      }

      .tone-colorless .card-face {
        --card-frame-top: rgba(243, 242, 238, 0.84);
        --card-frame-mid: #bdb7a7;
        --card-frame-base: #a8a18e;
        --card-frame-ink: rgba(95, 90, 79, 0.28);
        --card-frame-shadow: rgba(59, 52, 40, 0.18);
        --card-panel-top: #f6f4ef;
        --card-panel-bottom: #ebe8df;
        --card-accent: #68604f;
      }

      [class*="tone-split-"] .card-face {
        background:
          radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.28), transparent 38%),
          radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.3), transparent 24%),
          linear-gradient(
            135deg,
            var(--card-left-mid) 0%,
            color-mix(in srgb, var(--card-left-mid) 72%, white 28%) 46%,
            color-mix(in srgb, var(--card-right-mid) 72%, white 28%) 54%,
            var(--card-right-mid) 100%
          );
      }

      [class*="tone-split-"] .card-face-header,
      [class*="tone-split-"] .card-face-typeline,
      [class*="tone-split-"] .card-face-rules {
        background:
          linear-gradient(
            90deg,
            var(--card-left-panel-top) 0%,
            var(--card-left-panel-bottom) 47%,
            var(--card-right-panel-bottom) 53%,
            var(--card-right-panel-top) 100%
          );
      }

      .tone-split-white-blue .card-face {
        --card-left-mid: #d8c793;
        --card-right-mid: #7ea9c8;
        --card-left-panel-top: #fffdf1;
        --card-left-panel-bottom: #f2ead1;
        --card-right-panel-top: #f1f8ff;
        --card-right-panel-bottom: #d8e9f7;
      }

      .tone-split-white-black .card-face {
        --card-left-mid: #d8c793;
        --card-right-mid: #7a6c88;
        --card-left-panel-top: #fffdf1;
        --card-left-panel-bottom: #f2ead1;
        --card-right-panel-top: #f1ebf4;
        --card-right-panel-bottom: #d6cbde;
      }

      .tone-split-white-red .card-face {
        --card-left-mid: #d8c793;
        --card-right-mid: #cf7d57;
        --card-left-panel-top: #fffdf1;
        --card-left-panel-bottom: #f2ead1;
        --card-right-panel-top: #fff4ed;
        --card-right-panel-bottom: #f2d6c7;
      }

      .tone-split-white-green .card-face {
        --card-left-mid: #d8c793;
        --card-right-mid: #85aa63;
        --card-left-panel-top: #fffdf1;
        --card-left-panel-bottom: #f2ead1;
        --card-right-panel-top: #f2faec;
        --card-right-panel-bottom: #d7e8c8;
      }

      .tone-split-blue-black .card-face {
        --card-left-mid: #7ea9c8;
        --card-right-mid: #7a6c88;
        --card-left-panel-top: #f1f8ff;
        --card-left-panel-bottom: #d8e9f7;
        --card-right-panel-top: #f1ebf4;
        --card-right-panel-bottom: #d6cbde;
      }

      .tone-split-blue-red .card-face {
        --card-left-mid: #7ea9c8;
        --card-right-mid: #cf7d57;
        --card-left-panel-top: #f1f8ff;
        --card-left-panel-bottom: #d8e9f7;
        --card-right-panel-top: #fff4ed;
        --card-right-panel-bottom: #f2d6c7;
      }

      .tone-split-blue-green .card-face {
        --card-left-mid: #7ea9c8;
        --card-right-mid: #85aa63;
        --card-left-panel-top: #f1f8ff;
        --card-left-panel-bottom: #d8e9f7;
        --card-right-panel-top: #f2faec;
        --card-right-panel-bottom: #d7e8c8;
      }

      .tone-split-black-red .card-face {
        --card-left-mid: #7a6c88;
        --card-right-mid: #cf7d57;
        --card-left-panel-top: #f1ebf4;
        --card-left-panel-bottom: #d6cbde;
        --card-right-panel-top: #fff4ed;
        --card-right-panel-bottom: #f2d6c7;
      }

      .tone-split-black-green .card-face {
        --card-left-mid: #7a6c88;
        --card-right-mid: #85aa63;
        --card-left-panel-top: #f1ebf4;
        --card-left-panel-bottom: #d6cbde;
        --card-right-panel-top: #f2faec;
        --card-right-panel-bottom: #d7e8c8;
      }

      .tone-split-red-green .card-face {
        --card-left-mid: #cf7d57;
        --card-right-mid: #85aa63;
        --card-left-panel-top: #fff4ed;
        --card-left-panel-bottom: #f2d6c7;
        --card-right-panel-top: #f2faec;
        --card-right-panel-bottom: #d7e8c8;
      }

      .card-face-header,
      .card-face-typeline,
      .card-face-rules {
        border: 1.5px solid transparent;
        background:
          linear-gradient(
            180deg,
            color-mix(in srgb, var(--card-panel-top) 94%, white 6%),
            color-mix(in srgb, var(--card-panel-bottom) 88%, rgba(214, 192, 141, 0.92) 12%)
          ) padding-box,
          linear-gradient(90deg, rgba(255, 255, 255, 0.18), transparent 35%, rgba(255, 255, 255, 0.12)) padding-box;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.78),
          inset 0 -1px 0 rgba(133, 101, 36, 0.12),
          inset 0 0 0 1px rgba(255, 250, 239, 0.32),
          0 0.45rem 0.9rem rgba(94, 65, 19, 0.1);
      }

      .card-face-header,
      .card-face-typeline {
        background:
          radial-gradient(
            ellipse at center,
            rgba(255, 255, 255, 0) 56%,
            rgba(118, 81, 22, 0.12) 86%,
            rgba(80, 50, 10, 0.2) 100%
          ) padding-box,
          linear-gradient(
            180deg,
            color-mix(in srgb, var(--card-panel-top) 94%, white 6%),
            color-mix(in srgb, var(--card-panel-bottom) 88%, rgba(214, 192, 141, 0.92) 12%)
          ) padding-box,
          linear-gradient(90deg, rgba(255, 255, 255, 0.18), transparent 35%, rgba(255, 255, 255, 0.12)) padding-box,
          linear-gradient(
            135deg,
            rgba(255, 253, 244, 0.98) 0%,
            rgba(238, 214, 154, 0.96) 30%,
            color-mix(in srgb, var(--card-panel-border) 48%, rgba(184, 132, 30, 0.96) 52%) 58%,
            color-mix(in srgb, var(--card-accent) 36%, rgba(92, 56, 10, 0.9) 64%) 100%
          ) border-box;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.82),
          inset 0 -1px 0 rgba(133, 101, 36, 0.14),
          inset 0 0 0 1px rgba(255, 250, 239, 0.36),
          0 0 0 1px rgba(121, 82, 20, 0.12),
          0 0.45rem 0.9rem rgba(94, 65, 19, 0.12);
      }

      .card-face-header,
      .card-face-typeline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: clamp(0.35rem, 2cqw, 0.6rem);
        min-height: clamp(1.9rem, 12.4cqw, 2.55rem);
        padding: clamp(0.16rem, 1.05cqw, 0.26rem) clamp(0.4rem, 2.4cqw, 0.6rem);
        border-radius: 10px / 18px;
      }

      .card-face-title-wrap h3 {
        margin: 0;
        font-size: var(--card-title-size);
        line-height: 0.96;
        letter-spacing: -0.02em;
        font-family: var(--card-display-font);
      }

      .card-face-title-wrap {
        display: grid;
        gap: 0.14rem;
        min-width: 0;
      }

      .card-face-mana-wrap {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        align-self: center;
      }

      .card-face-mana-group {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: end;
        gap: clamp(0.08rem, 0.55cqw, 0.16rem);
        max-width: min(40cqw, 8.5rem);
      }

      .card-face-mana {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: clamp(1rem, 5.7cqw, 1.26rem);
        height: clamp(1rem, 5.7cqw, 1.26rem);
        min-width: 0;
        min-height: 0;
        padding: 0;
        border: 0;
        background: transparent;
        box-shadow: none;
        font-weight: 700;
        font-size: clamp(0.72rem, 4.1cqw, 0.92rem);
      }

      .card-face-mana-token {
        flex: 0 0 auto;
      }

      .card-face-art {
        overflow: hidden;
        margin: clamp(0.3rem, 1.8cqw, 0.45rem) 0;
        border-radius: 0;
        border: 2px solid var(--card-art-frame);
        background: var(--card-art-backdrop);
        box-shadow:
          inset 0 0 0 1px rgba(255, 255, 255, 0.08),
          0 0.35rem 0.85rem rgba(39, 24, 9, 0.18);
      }

      .card-face-art-image,
      .card-face-art-fallback {
        width: 100%;
        height: 100%;
        min-height: clamp(7.5rem, 62cqw, 13rem);
      }

      .card-face-art-image {
        display: block;
        object-fit: cover;
      }

      .card-face-art-fallback {
        display: grid;
        place-content: center;
        gap: clamp(0.25rem, 1.8cqw, 0.5rem);
        padding: clamp(0.55rem, 4.5cqw, 1rem);
        text-align: center;
        background:
          radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.2), transparent 30%),
          repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0 10px, rgba(218, 193, 145, 0.16) 10px 20px),
          linear-gradient(160deg, rgba(255, 255, 255, 0.96), rgba(226, 205, 162, 0.88));
        color: var(--muted);
        font-size: clamp(0.74rem, 4.2cqw, 1rem);
      }

      .card-face-typeline {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: clamp(0.35rem, 2cqw, 0.7rem);
        min-height: clamp(1.45rem, 8.5cqw, 1.8rem);
        padding: clamp(0.06rem, 0.45cqw, 0.12rem) clamp(0.38rem, 2.2cqw, 0.55rem);
        border-radius: clamp(6px, 2.2cqw, 8px);
        margin-top: clamp(-0.72rem, -4.6cqw, -0.38rem);
        margin-right: clamp(-0.2rem, -1.2cqw, -0.36rem);
        margin-bottom: clamp(-0.52rem, -3.4cqw, -0.28rem);
        margin-left: clamp(-0.2rem, -1.2cqw, -0.36rem);
        background: linear-gradient(
          180deg,
          var(--card-panel-top),
          color-mix(in srgb, var(--card-panel-bottom) 94%, rgba(214, 192, 141, 1) 6%)
        );
        font-size: var(--card-typeline-size);
        font-weight: 700;
        line-height: 0.98;
        letter-spacing: 0.01em;
        isolation: isolate;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.78),
          inset 0 -1px 0 rgba(133, 101, 36, 0.1),
          0 0.2rem 0.36rem rgba(74, 49, 15, 0.14);
      }

      .card-face-typeline span:first-child {
        min-width: 0;
        flex: 1 1 auto;
        align-self: center;
      }

      .card-face-typeline span:last-child {
        flex-shrink: 0;
        align-self: center;
      }

      .card-face-rarity-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: clamp(0.78rem, 4.2cqw, 1rem);
        height: clamp(0.72rem, 3.8cqw, 0.9rem);
        font-size: clamp(0.34rem, 1.8cqw, 0.42rem);
        font-weight: 800;
        letter-spacing: 0.03em;
        color: #2b1e0f;
        text-transform: uppercase;
      }

      .card-face-rarity-badge-mark {
        width: 92%;
        height: 92%;
        display: block;
        background-color: currentColor;
        -webkit-mask-position: center;
        mask-position: center;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        -webkit-mask-size: contain;
        mask-size: contain;
        filter: drop-shadow(0 0.05rem 0.08rem rgba(255, 255, 255, 0.55))
          drop-shadow(0 0.08rem 0.16rem rgba(69, 45, 12, 0.24));
      }

      .card-face-rarity-badge.is-common {
        color: #262626;
      }

      .card-face-rarity-badge.is-uncommon {
        color: #9ca3af;
      }

      .card-face-rarity-badge.is-rare {
        color: #d4a739;
      }

      .card-face-rarity-badge.is-mythic {
        color: #d97706;
      }

      .card-face-rarity-badge.is-na {
        width: auto;
        min-width: clamp(1.2rem, 7cqw, 1.55rem);
        padding-inline: 0.22rem;
        border-radius: 999px;
        border: 1px solid rgba(58, 43, 16, 0.32);
        background: rgba(255, 251, 244, 0.8);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
      }

      .card-face-meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
      }

      .card-face-status {
        justify-self: start;
        padding-left: clamp(0.2rem, 1.2cqw, 0.35rem);
        color: var(--muted);
        font-size: clamp(0.68rem, 3.6cqw, 0.82rem);
        font-weight: 700;
        letter-spacing: 0.02em;
        text-transform: capitalize;
      }

      .card-face-status.draft {
        color: #9a3412;
      }

      .card-face-status.templating {
        color: #1d4ed8;
      }

      .card-face-status.balanced {
        color: #166534;
      }

      .card-face-status.approved {
        color: #3f6212;
      }

      .card-face-preview-button {
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--accent);
        font: inherit;
        font-size: clamp(0.68rem, 3.6cqw, 0.82rem);
        font-weight: 700;
        letter-spacing: 0.02em;
        cursor: pointer;
        text-decoration: underline;
        text-underline-offset: 0.18em;
      }

      .card-face-preview-button:focus-visible,
      .card-preview-close:focus-visible,
      .card-preview-nav:focus-visible {
        outline: 2px solid rgba(154, 52, 18, 0.45);
        outline-offset: 3px;
        border-radius: 999px;
      }

      .card-preview-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 1.25rem;
        background: rgba(28, 17, 8, 0.58);
        backdrop-filter: blur(6px);
      }

      .card-preview-modal {
        width: min(92vw, 38rem);
        display: grid;
        gap: 0.85rem;
      }

      .card-preview-toolbar {
        display: flex;
        justify-content: flex-end;
      }

      .card-preview-close {
        justify-self: center;
        min-height: 2.25rem;
        padding: 0.45rem 0.8rem;
        border-radius: 999px;
        border: 1px solid rgba(255, 248, 241, 0.35);
        background: rgba(45, 28, 11, 0.72);
        color: #fff8f1;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .card-preview-nav {
        min-width: 3.1rem;
        min-height: 3.1rem;
        padding: 0;
        border-radius: 16px;
        border: 1px solid rgba(255, 248, 241, 0.35);
        background: rgba(45, 28, 11, 0.72);
        color: #fff8f1;
        font: inherit;
        font-size: 1.4rem;
        font-weight: 700;
        cursor: pointer;
      }

      .card-preview-nav:disabled {
        opacity: 0.32;
        cursor: default;
      }

      .card-preview-stage {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 0.9rem;
      }

      .card-preview-shell {
        width: min(100%, 32rem);
        justify-self: center;
        container-type: inline-size;
      }

      .card-preview-nav-left {
        justify-self: end;
      }

      .card-preview-nav-right {
        justify-self: start;
      }

      .card-face-preview {
        width: 100%;
      }

      .card-face-rules {
        display: grid;
        align-content: start;
        gap: clamp(0.2rem, 1.7cqw, 0.5rem);
        min-height: clamp(4.2rem, 32cqw, 6.75rem);
        padding: clamp(0.72rem, 4.8cqw, 1rem) clamp(0.45rem, 3.4cqw, 0.75rem)
          clamp(0.55rem, 4cqw, 0.9rem);
        border-radius: 0;
      }

      .card-face-rules p {
        margin: 0;
        color: #2d2416;
        font-size: var(--card-rules-size);
        line-height: 1.08;
        font-family: var(--card-rules-font);
      }

      .card-face-rules-line {
        display: -webkit-box;
        overflow: hidden;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        text-wrap: pretty;
      }

      .card-face-rules-line.is-flavor {
        font-style: italic;
        color: color-mix(in srgb, #2d2416 78%, var(--card-accent) 22%);
        -webkit-line-clamp: 3;
      }

      .card-face-rules-line.has-flavor-divider {
        margin-top: clamp(0.24rem, 1.8cqw, 0.42rem);
        padding-top: clamp(0.36rem, 2.5cqw, 0.58rem);
        border-top: 2px solid rgba(102, 74, 28, 0.42);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.58);
      }

      .card-face-inline-mana {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1em;
        height: 1em;
        margin: 0 0.02em;
        font-size: 0.68em;
        vertical-align: -0.08em;
      }

      .card-face-mana-token img,
      .card-face-inline-mana img {
        display: block;
        width: 100%;
        height: 100%;
      }

      .card-face-reminder-text {
        color: color-mix(in srgb, #2d2416 70%, var(--card-accent) 30%);
        font-size: 0.92em;
        font-style: italic;
      }

      .card-face-rules-subline {
        color: var(--card-accent);
        display: -webkit-box;
        overflow: hidden;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        font-size: clamp(0.58rem, 3cqw, 0.68rem);
        line-height: 1.05;
        letter-spacing: 0.01em;
        text-transform: none;
      }

      .card-face-footer {
        display: grid;
        gap: clamp(0.06rem, 0.55cqw, 0.14rem);
        margin-top: 0;
        margin-right: calc(var(--card-face-padding) * -1);
        margin-bottom: calc(var(--card-face-padding) * -1);
        margin-left: calc(var(--card-face-padding) * -1);
        padding: clamp(0.2rem, 1.1cqw, 0.32rem) clamp(0.22rem, 1.4cqw, 0.34rem)
          clamp(0.16rem, 1cqw, 0.24rem);
        border-radius: 0 0 clamp(12px, 4.5cqw, 18px) clamp(12px, 4.5cqw, 18px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: linear-gradient(180deg, rgba(36, 32, 30, 0.98), rgba(6, 5, 5, 0.99));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 0 -1px 0 rgba(0, 0, 0, 0.6);
        font-size: var(--card-footer-size);
        line-height: 1;
        color: rgba(244, 238, 228, 0.92);
      }

      .card-face-footer-top {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: clamp(0.2rem, 1.2cqw, 0.4rem);
      }

      .card-face-footer-printline {
        display: flex;
        align-items: flex-end;
        gap: clamp(0.14rem, 0.9cqw, 0.28rem);
        min-width: 0;
        flex: 1 1 auto;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        opacity: 0.88;
      }

      .card-face-footer-printline span:first-child {
        min-width: 0;
      }

      .card-face-footer-stats {
        display: grid;
        justify-items: center;
        gap: 0.08rem;
        flex-shrink: 0;
      }

      .card-face-footer-artist {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: clamp(0.44rem, 2.15cqw, 0.54rem);
        letter-spacing: 0.02em;
        color: rgba(236, 228, 216, 0.78);
      }

      .card-face-footer-bottom {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: clamp(0.14rem, 0.9cqw, 0.28rem);
      }

      .card-face-stats-box {
        display: grid;
        place-items: center;
        min-width: clamp(2.05rem, 13.2cqw, 2.75rem);
        padding: clamp(0.1rem, 0.7cqw, 0.18rem) clamp(0.22rem, 1.25cqw, 0.34rem);
        border-radius: clamp(8px, 3cqw, 10px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: linear-gradient(180deg, rgba(58, 55, 53, 0.92), rgba(16, 14, 14, 0.96));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          0 0.08rem 0.18rem rgba(0, 0, 0, 0.28);
        text-align: center;
        flex-shrink: 0;
      }

      .card-face-stats-box strong {
        color: rgba(248, 243, 236, 0.96);
        font-size: clamp(0.78rem, 4.4cqw, 1rem);
        line-height: 1;
      }

      .card-face-collector-number {
        flex-shrink: 0;
        font-size: clamp(0.48rem, 2.5cqw, 0.58rem);
        line-height: 1;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(236, 228, 216, 0.82);
      }

      .card-face-tile.is-draftlike {
        --card-frame-ink: color-mix(in srgb, var(--card-frame-ink) 62%, #9a3412 38%);
        --card-panel-border: color-mix(in srgb, var(--card-panel-border) 72%, #b45309 28%);
      }

      .card-face-tile.is-draftlike .card-face::after {
        content: "";
        position: absolute;
        inset: clamp(0.28rem, 1.5cqw, 0.4rem);
        border-radius: clamp(15px, 6cqw, 21px);
        border: 1px dashed rgba(180, 83, 9, 0.35);
        pointer-events: none;
      }

      .card-face-tile.is-incomplete .card-face-rules {
        background:
          linear-gradient(180deg, color-mix(in srgb, var(--card-panel-top) 92%, #fff7ed 8%), color-mix(in srgb, var(--card-panel-bottom) 84%, #fed7aa 16%)),
          linear-gradient(90deg, rgba(255, 255, 255, 0.18), transparent 35%, rgba(255, 255, 255, 0.12));
      }

      .card-face-tile.has-validation-warning .card-face-header {
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.72),
          inset 0 -1px 0 rgba(133, 101, 36, 0.08),
          0 0 0 1px rgba(185, 28, 28, 0.14),
          0 0.55rem 1rem rgba(94, 65, 19, 0.06);
      }

      .card-face-tile.has-validation-warning .card-face-status::before {
        content: "!";
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.1em;
        height: 1.1em;
        margin-right: 0.35rem;
        border-radius: 999px;
        background: rgba(185, 28, 28, 0.12);
        color: #991b1b;
        font-size: 0.86em;
      }

      .deck-results,
      .deck-contents-grid,
      .collection-results,
      .featured-card-grid {
        display: grid;
        gap: 1rem;
      }

      .deck-result,
      .deck-card-row,
      .collection-result,
      .featured-card {
        display: grid;
        gap: 1rem;
        padding: 1rem;
        border-radius: 24px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.72);
      }

      .deck-result-header,
      .deck-card-header,
      .collection-result-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: start;
        gap: 0.75rem;
      }

      .deck-result-header h3,
      .deck-card-header h3,
      .collection-result-header h3 {
        margin: 0 0 0.35rem;
        font-size: 1.35rem;
      }

      .deck-result-header p,
      .deck-card-header p,
      .collection-result-header p {
        margin: 0;
      }

      .status-chip-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      .deck-stat-grid,
      .status-summary-grid {
        display: grid;
        gap: 0.85rem;
      }

      @media (min-width: 760px) {
        .deck-stat-grid,
        .status-summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .deck-card-preview {
        min-height: 10rem;
      }

      .deck-card-image,
      .deck-card-fallback,
      .deck-commander-image,
      .deck-commander-fallback {
        width: 100%;
        height: 100%;
        min-height: 10rem;
        border-radius: 18px;
      }

      .deck-card-image,
      .deck-commander-image {
        object-fit: cover;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.8);
      }

      .deck-card-body {
        display: grid;
        gap: 0.9rem;
      }

      .featured-card-grid {
        grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
      }

      @media (min-width: 880px) {
        .deck-card-row {
          grid-template-columns: 10rem minmax(0, 1fr);
          align-items: start;
        }
      }

      .card-result {
        display: grid;
        gap: 1rem;
        padding: 1rem;
        border-radius: 24px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.72);
      }

      @media (min-width: 880px) {
        .card-result {
          grid-template-columns: 14rem minmax(0, 1fr);
          align-items: start;
        }
      }

      .card-result-preview {
        min-height: 12rem;
      }

      .card-preview-image,
      .card-preview-fallback {
        width: 100%;
        height: 100%;
        min-height: 12rem;
        border-radius: 18px;
      }

      .card-preview-image {
        object-fit: cover;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.8);
      }

      .card-preview-fallback {
        display: grid;
        place-content: center;
        gap: 0.45rem;
        padding: 1rem;
        text-align: center;
        border: 1px dashed rgba(154, 52, 18, 0.22);
        background:
          radial-gradient(circle at 20% 20%, rgba(251, 191, 36, 0.22), transparent 30%),
          linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(239, 224, 201, 0.75));
        color: var(--muted);
      }

      .card-result-body {
        display: grid;
        gap: 0.9rem;
      }

      .card-result-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: start;
        gap: 0.75rem;
      }

      .card-result-header h3 {
        margin: 0 0 0.35rem;
        font-size: 1.35rem;
      }

      .card-result-header p {
        margin: 0;
      }

      .card-result-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem 1rem;
        color: var(--muted);
      }

      .card-result-meta span {
        display: inline-flex;
        gap: 0.35rem;
      }

      .card-result-signals,
      .card-result-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      .status-badge,
      .signal-badge,
      .tag-chip {
        display: inline-flex;
        align-items: center;
        min-height: 2rem;
        padding: 0.45rem 0.7rem;
        border-radius: 999px;
        font-size: 0.86rem;
        font-weight: 700;
      }

      .status-badge {
        border: 1px solid transparent;
        text-transform: capitalize;
      }

      .status-badge.draft {
        background: rgba(120, 53, 15, 0.11);
        border-color: rgba(120, 53, 15, 0.2);
        color: #9a3412;
      }

      .status-badge.templating {
        background: rgba(2, 132, 199, 0.12);
        border-color: rgba(2, 132, 199, 0.22);
        color: #0f766e;
      }

      .status-badge.balanced {
        background: rgba(37, 99, 235, 0.11);
        border-color: rgba(37, 99, 235, 0.2);
        color: #1d4ed8;
      }

      .status-badge.approved {
        background: rgba(22, 163, 74, 0.11);
        border-color: rgba(22, 163, 74, 0.2);
        color: #15803d;
      }

      .signal-badge.neutral,
      .tag-chip {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid var(--border);
        color: var(--muted);
      }

      .signal-badge.warning {
        background: rgba(217, 119, 6, 0.11);
        border: 1px solid rgba(217, 119, 6, 0.22);
        color: #b45309;
      }

      .signal-badge.danger {
        background: rgba(185, 28, 28, 0.11);
        border: 1px solid rgba(185, 28, 28, 0.2);
        color: #b91c1c;
      }

      .detail-layout {
        display: grid;
        gap: 1rem;
      }

      .detail-hero {
        display: grid;
        gap: 1rem;
      }

      @media (min-width: 960px) {
        .detail-hero {
          grid-template-columns: 20rem minmax(0, 1fr);
          align-items: start;
        }
      }

      .detail-hero-media {
        min-height: 18rem;
      }

      .card-detail-media {
        display: grid;
        gap: 0.45rem;
        margin: 0;
      }

      .card-detail-image,
      .card-detail-fallback {
        width: 100%;
        min-height: 18rem;
        border-radius: 22px;
      }

      .card-detail-image {
        object-fit: cover;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.8);
      }

      .card-detail-image-credit {
        display: flex;
        justify-content: flex-end;
        margin: 0;
        font-size: 0.82rem;
        color: var(--muted);
      }

      .detail-hero-body {
        display: grid;
        gap: 1rem;
      }

      .detail-hero-header {
        display: flex;
        flex-wrap: wrap;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .detail-hero-header h2 {
        margin: 0 0 0.4rem;
        font-size: clamp(2rem, 4vw, 3rem);
      }

      .detail-card-nameblock {
        display: grid;
        gap: 0.2rem;
      }

      .detail-card-nameblock > p {
        margin: 0;
      }

      .detail-stat-grid {
        display: grid;
        gap: 0.85rem;
      }

      @media (min-width: 760px) {
        .detail-stat-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .detail-columns {
        display: grid;
        gap: 1rem;
      }

      @media (min-width: 960px) {
        .detail-columns {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .detail-section {
        display: grid;
        gap: 1rem;
      }

      .detail-copy {
        display: grid;
        gap: 0.8rem;
      }

      .detail-flavor {
        font-style: italic;
      }

      .detail-definition-list {
        display: grid;
        gap: 0.75rem;
        margin: 0;
      }

      .detail-definition-list div {
        display: grid;
        gap: 0.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--border);
      }

      .detail-definition-list dt {
        color: var(--muted);
        font-size: 0.9rem;
        font-weight: 700;
      }

      .detail-definition-list dd {
        margin: 0;
      }

      .detail-placeholder {
        color: #b45309;
        font-style: italic;
      }

      .detail-links,
      .detail-list {
        display: grid;
        gap: 0.7rem;
      }

      .detail-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        padding: 0.85rem 1rem;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.74);
        color: var(--ink);
        text-decoration: none;
      }

      .warning-callout {
        padding: 0.95rem 1rem;
        border-radius: 18px;
        border: 1px solid rgba(217, 119, 6, 0.22);
        background: rgba(217, 119, 6, 0.09);
        color: var(--ink);
      }

      .warning-callout ul,
      .warning-callout p {
        margin-bottom: 0;
      }

      .neutral-callout {
        border-color: var(--border);
        background: rgba(255, 255, 255, 0.72);
      }

      @keyframes pulse {
        0%,
        100% {
          transform: scale(0.96);
          opacity: 0.76;
        }

        50% {
          transform: scale(1);
          opacity: 1;
        }
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.__CLOUD_ARCANUM_CONFIG__ = { apiBaseUrl: ${JSON.stringify(apiBaseUrl)} };
    </script>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`;
}
