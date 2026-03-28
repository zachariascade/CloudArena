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
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          align-items: stretch;
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
      }

      @media (min-width: 960px) {
        .nav {
          justify-content: flex-end;
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

      .status {
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.7rem 0.9rem;
        border-radius: 999px;
        background: rgba(154, 52, 18, 0.08);
        color: var(--accent);
        font-weight: 600;
      }

      code {
        font-family: "SFMono-Regular", Consolas, monospace;
        font-size: 0.95em;
      }

      .nav a {
        display: inline-flex;
        align-items: center;
        min-height: 2.7rem;
        padding: 0.75rem 1rem;
        border-radius: 999px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.7);
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
        background: rgba(255, 255, 255, 0.86);
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

        .status {
          width: 100%;
          justify-content: center;
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
        min-height: 2.8rem;
        padding: 0.72rem 1rem;
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
        --card-panel-top: rgba(255, 251, 236, 0.98);
        --card-panel-bottom: rgba(241, 228, 189, 0.92);
        --card-panel-border: rgba(95, 74, 36, 0.34);
        --card-accent: #7c5b24;
        --card-highlight: rgba(255, 250, 229, 0.55);
        --card-art-frame: rgba(70, 46, 16, 0.46);
        --card-art-backdrop: rgba(27, 17, 8, 0.88);
        --card-display-font: "Cochin", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
        --card-rules-font: "Baskerville", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", serif;
        --card-title-size: clamp(0.98rem, 7.1cqw, 1.5rem);
        --card-typeline-size: clamp(0.68rem, 3.8cqw, 0.84rem);
        --card-rules-size: clamp(0.68rem, 3.9cqw, 0.9rem);
        --card-footer-size: clamp(0.58rem, 3.15cqw, 0.72rem);
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
        padding: clamp(0.45rem, 2.2cqw, 0.7rem);
        border-radius: clamp(18px, 7cqw, 24px);
        border: 2px solid var(--card-frame-ink);
        background:
          radial-gradient(circle at 50% 0%, var(--card-frame-top), transparent 38%),
          radial-gradient(circle at 12% 18%, rgba(255, 255, 255, 0.36), transparent 24%),
          linear-gradient(180deg, color-mix(in srgb, var(--card-frame-mid) 40%, white) 0%, var(--card-frame-mid) 22%, color-mix(in srgb, var(--card-frame-mid) 36%, white) 55%, var(--card-frame-base) 100%);
        box-shadow:
          0 10px 24px var(--card-frame-shadow),
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
          inset 0 0 0 2px var(--card-highlight),
          inset 0 0 0 4px rgba(255, 255, 255, 0.18);
      }

      .tone-white .card-face {
        --card-frame-top: rgba(255, 255, 247, 0.88);
        --card-frame-mid: #ddc98e;
        --card-frame-base: #ccb273;
        --card-frame-ink: rgba(97, 83, 48, 0.3);
        --card-frame-shadow: rgba(69, 54, 26, 0.16);
        --card-panel-bottom: rgba(245, 238, 213, 0.96);
        --card-accent: #746036;
      }

      .tone-blue .card-face {
        --card-frame-top: rgba(230, 245, 255, 0.82);
        --card-frame-mid: #8eadc5;
        --card-frame-base: #6c8ca6;
        --card-frame-ink: rgba(55, 82, 112, 0.28);
        --card-frame-shadow: rgba(35, 64, 91, 0.19);
        --card-panel-bottom: rgba(219, 235, 246, 0.94);
        --card-accent: #295273;
      }

      .tone-black .card-face {
        --card-frame-top: rgba(231, 224, 233, 0.72);
        --card-frame-mid: #84758f;
        --card-frame-base: #6d5f78;
        --card-frame-ink: rgba(69, 56, 80, 0.32);
        --card-frame-shadow: rgba(39, 27, 51, 0.22);
        --card-panel-bottom: rgba(217, 207, 223, 0.94);
        --card-accent: #503f5f;
      }

      .tone-red .card-face {
        --card-frame-top: rgba(255, 233, 225, 0.82);
        --card-frame-mid: #d78960;
        --card-frame-base: #be6d47;
        --card-frame-ink: rgba(112, 59, 33, 0.28);
        --card-frame-shadow: rgba(88, 43, 17, 0.2);
        --card-panel-bottom: rgba(244, 219, 207, 0.94);
        --card-accent: #964b24;
      }

      .tone-green .card-face {
        --card-frame-top: rgba(232, 246, 226, 0.82);
        --card-frame-mid: #93b36d;
        --card-frame-base: #779756;
        --card-frame-ink: rgba(69, 93, 45, 0.28);
        --card-frame-shadow: rgba(41, 67, 24, 0.2);
        --card-panel-bottom: rgba(220, 235, 207, 0.94);
        --card-accent: #456129;
      }

      .tone-multicolor .card-face {
        --card-frame-top: rgba(255, 244, 224, 0.84);
        --card-frame-mid: #d8ab5d;
        --card-frame-base: #b78b47;
        --card-frame-ink: rgba(102, 72, 24, 0.3);
        --card-frame-shadow: rgba(83, 55, 13, 0.22);
        --card-panel-bottom: rgba(240, 226, 188, 0.95);
        --card-accent: #8f641e;
      }

      .tone-colorless .card-face {
        --card-frame-top: rgba(243, 242, 238, 0.84);
        --card-frame-mid: #bdb7a7;
        --card-frame-base: #a8a18e;
        --card-frame-ink: rgba(95, 90, 79, 0.28);
        --card-frame-shadow: rgba(59, 52, 40, 0.18);
        --card-panel-bottom: rgba(235, 232, 223, 0.95);
        --card-accent: #68604f;
      }

      .card-face-header,
      .card-face-typeline,
      .card-face-rules,
      .card-face-footer {
        border: 1px solid var(--card-panel-border);
        background:
          linear-gradient(180deg, var(--card-panel-top), var(--card-panel-bottom)),
          linear-gradient(90deg, rgba(255, 255, 255, 0.18), transparent 35%, rgba(255, 255, 255, 0.12));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.72),
          inset 0 -1px 0 rgba(133, 101, 36, 0.08),
          0 0.55rem 1rem rgba(94, 65, 19, 0.06);
      }

      .card-face-header,
      .card-face-typeline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: clamp(0.35rem, 2cqw, 0.6rem);
        min-height: clamp(2.2rem, 14cqw, 3rem);
        padding: clamp(0.25rem, 1.6cqw, 0.35rem) clamp(0.4rem, 2.4cqw, 0.6rem);
        border-radius: clamp(12px, 4.5cqw, 15px);
      }

      .card-face-title-wrap h3 {
        margin: 0;
        font-size: var(--card-title-size);
        line-height: 0.96;
        letter-spacing: -0.02em;
        font-family: var(--card-display-font);
      }

      .card-face-mana-wrap {
        flex-shrink: 0;
      }

      .card-face-mana-group {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: end;
        gap: clamp(0.14rem, 0.9cqw, 0.22rem);
        max-width: min(40cqw, 8.5rem);
      }

      .card-face-mana {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: clamp(2.2rem, 15cqw, 3.2rem);
        min-height: clamp(1.5rem, 9.5cqw, 2rem);
        padding: clamp(0.12rem, 0.8cqw, 0.2rem) clamp(0.3rem, 1.8cqw, 0.55rem);
        border-radius: 999px;
        border: 1px solid var(--card-panel-border);
        background: rgba(255, 255, 255, 0.88);
        font-weight: 700;
        font-size: clamp(0.72rem, 4.1cqw, 0.92rem);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.78),
          0 0.14rem 0.35rem rgba(78, 55, 20, 0.12);
      }

      .card-face-mana-token {
        min-width: clamp(1.35rem, 8.4cqw, 1.8rem);
        padding-inline: 0;
        border-radius: 999px;
      }

      .card-face-mana-token.token-w,
      .card-face-inline-mana.token-w {
        background: linear-gradient(180deg, #fffaf0, #ead9ac);
      }

      .card-face-mana-token.token-u,
      .card-face-inline-mana.token-u {
        background: linear-gradient(180deg, #eef8ff, #9ec3e4);
      }

      .card-face-mana-token.token-b,
      .card-face-inline-mana.token-b {
        background: linear-gradient(180deg, #ece6f0, #9a8aa8);
      }

      .card-face-mana-token.token-r,
      .card-face-inline-mana.token-r {
        background: linear-gradient(180deg, #fff0e8, #e3a17a);
      }

      .card-face-mana-token.token-g,
      .card-face-inline-mana.token-g {
        background: linear-gradient(180deg, #eef8e8, #9fc581);
      }

      .card-face-art {
        overflow: hidden;
        margin: clamp(0.3rem, 1.8cqw, 0.45rem) 0;
        border-radius: clamp(14px, 5.5cqw, 18px);
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
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: clamp(0.35rem, 2cqw, 0.7rem);
        margin-bottom: clamp(0.3rem, 1.8cqw, 0.45rem);
        font-size: var(--card-typeline-size);
        font-weight: 700;
        line-height: 1.08;
        letter-spacing: 0.01em;
      }

      .card-face-typeline span:first-child {
        min-width: 0;
        flex: 1 1 auto;
      }

      .card-face-typeline span:last-child {
        flex-shrink: 0;
      }

      .card-face-rarity-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: clamp(0.95rem, 5.4cqw, 1.2rem);
        height: clamp(0.95rem, 5.4cqw, 1.2rem);
        border-radius: 999px;
        border: 1px solid rgba(58, 43, 16, 0.38);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.7),
          0 0.08rem 0.18rem rgba(80, 55, 20, 0.16);
        font-size: clamp(0.34rem, 1.8cqw, 0.42rem);
        font-weight: 800;
        letter-spacing: 0.03em;
        color: #20170d;
        text-transform: uppercase;
      }

      .card-face-rarity-badge.is-common {
        background: linear-gradient(180deg, #57534e, #111827);
      }

      .card-face-rarity-badge.is-uncommon {
        background: linear-gradient(180deg, #f5f5f4, #a8a29e);
      }

      .card-face-rarity-badge.is-rare {
        background: linear-gradient(180deg, #fde68a, #ca8a04);
      }

      .card-face-rarity-badge.is-mythic {
        background: linear-gradient(180deg, #fbbf24, #c2410c);
      }

      .card-face-rarity-badge.is-na {
        background: linear-gradient(180deg, #f8fafc, #cbd5e1);
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
      .card-preview-close:focus-visible {
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

      .card-preview-close {
        justify-self: end;
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

      .card-preview-shell {
        width: min(100%, 32rem);
        justify-self: center;
        container-type: inline-size;
      }

      .card-face-preview {
        width: 100%;
      }

      .card-face-rules {
        display: grid;
        align-content: start;
        gap: clamp(0.2rem, 1.7cqw, 0.5rem);
        min-height: clamp(4.2rem, 32cqw, 6.75rem);
        padding: clamp(0.45rem, 3.4cqw, 0.75rem) clamp(0.45rem, 3.4cqw, 0.75rem)
          clamp(0.55rem, 4cqw, 0.9rem);
        border-radius: clamp(12px, 4.5cqw, 15px);
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

      .card-face-inline-mana {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1.2em;
        height: 1.2em;
        margin: 0 0.04em;
        border: 1px solid rgba(95, 74, 36, 0.28);
        border-radius: 999px;
        font-size: 0.72em;
        font-weight: 700;
        vertical-align: 0.02em;
        background: linear-gradient(180deg, #fffaf0, #d7c69a);
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
        gap: clamp(0.12rem, 1cqw, 0.25rem);
        margin-top: clamp(0.3rem, 1.8cqw, 0.45rem);
        padding: clamp(0.3rem, 2.1cqw, 0.45rem) clamp(0.45rem, 2.8cqw, 0.65rem)
          clamp(0.38rem, 2.6cqw, 0.55rem);
        border-radius: clamp(12px, 4.5cqw, 15px);
        font-size: var(--card-footer-size);
        line-height: 1.05;
        color: #2f2414;
      }

      .card-face-footer-top {
        display: flex;
        justify-content: space-between;
        align-items: end;
        gap: clamp(0.35rem, 2cqw, 0.7rem);
      }

      .card-face-footer-printline {
        display: flex;
        align-items: flex-end;
        gap: clamp(0.25rem, 1.8cqw, 0.5rem);
        min-width: 0;
        flex: 1 1 auto;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .card-face-footer-printline span:first-child {
        min-width: 0;
      }

      .card-face-footer-stats {
        display: grid;
        justify-items: center;
        gap: 0.14rem;
        flex-shrink: 0;
      }

      .card-face-footer-artist {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: clamp(0.5rem, 2.7cqw, 0.62rem);
        letter-spacing: 0.02em;
        color: color-mix(in srgb, #2f2414 78%, var(--card-accent) 22%);
      }

      .card-face-footer-bottom {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: clamp(0.25rem, 1.8cqw, 0.5rem);
      }

      .card-face-stats-box {
        display: grid;
        place-items: center;
        min-width: clamp(2.5rem, 16cqw, 3.4rem);
        padding: clamp(0.18rem, 1.2cqw, 0.28rem) clamp(0.32rem, 1.8cqw, 0.48rem);
        border-radius: clamp(10px, 3.8cqw, 14px);
        border: 1px solid var(--card-panel-border);
        background: linear-gradient(180deg, rgba(255, 251, 236, 0.98), rgba(232, 213, 169, 0.92));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.76),
          0 0.22rem 0.45rem rgba(80, 55, 20, 0.12);
        text-align: center;
        flex-shrink: 0;
      }

      .card-face-stats-box strong {
        font-size: clamp(0.78rem, 4.4cqw, 1rem);
        line-height: 1;
      }

      .card-face-collector-number {
        flex-shrink: 0;
        font-size: clamp(0.48rem, 2.5cqw, 0.58rem);
        line-height: 1;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: color-mix(in srgb, #2f2414 74%, var(--card-accent) 26%);
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
