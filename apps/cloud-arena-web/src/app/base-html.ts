export function renderCloudArcanumWebHtml(
  apiBaseUrl: string,
  arenaApiBaseUrl: string,
): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Cloud Arcanum</title>
    <style>
      :root {
        color-scheme: light;
        --arena-ui-bg: #f7f0e6;
        --arena-ui-surface: rgba(255, 252, 247, 0.9);
        --arena-ui-ink: #1c1713;
        --arena-ui-muted: #5f544c;
        --arena-ui-accent: #9a3412;
        --arena-ui-border: rgba(95, 84, 76, 0.18);
        --arena-ui-shadow: rgba(28, 23, 19, 0.08);
        --arena-ui-backdrop: rgba(20, 15, 12, 0.28);
        --bg: var(--arena-ui-bg);
        --panel: var(--arena-ui-surface);
        --ink: var(--arena-ui-ink);
        --muted: var(--arena-ui-muted);
        --accent: var(--arena-ui-accent);
        --accent-strong: color-mix(in srgb, var(--arena-ui-accent) 74%, black 26%);
        --border: var(--arena-ui-border);
        --display-card-width: clamp(13rem, 15vw, 16rem);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100dvh;
        height: 100dvh;
        overflow: hidden;
        font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top, color-mix(in srgb, var(--accent) 22%, transparent), transparent 34%),
          linear-gradient(
            160deg,
            color-mix(in srgb, var(--bg) 20%, white 80%) 0%,
            var(--bg) 52%,
            color-mix(in srgb, var(--bg) 42%, var(--accent) 58%) 100%
          );
      }

      #root {
        min-height: 100dvh;
        height: 100dvh;
        overflow: hidden;
      }

      .app-shell {
        position: relative;
        display: block;
        gap: 0.9rem;
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 1rem;
        overflow: hidden;
        isolation: isolate;
      }

      .app-shell.is-full-bleed {
        padding: 0;
      }

      .app-shell.is-battle-page::before {
        content: "";
        position: absolute;
        inset: 0;
        z-index: 0;
        background:
          linear-gradient(180deg, rgba(6, 18, 56, 0.26), rgba(6, 18, 56, 0.7)),
          url("https://cdn.prod.website-files.com/639281d335ff5f86b30762e7/68e3855912fe821b006210b2_new-Paradiso%20Artwork_Website%20Banner.png") center center / cover no-repeat,
          radial-gradient(circle at 50% 12%, rgba(247, 200, 84, 0.18), transparent 22%),
          linear-gradient(135deg, #10284f 0%, #0a1432 48%, #081028 100%);
        pointer-events: none;
      }

      .app-header {
        position: fixed;
        top: 1rem;
        left: 1rem;
        right: 1rem;
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        min-height: 0;
        padding: 1rem 1.1rem;
        transform: translateY(calc(-100% - 0.5rem));
        opacity: 0;
        pointer-events: none;
        transition:
          transform 180ms ease,
          opacity 160ms ease;
        will-change: transform, opacity;
      }

      .app-header.is-visible {
        transform: translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      .app-header-brand {
        min-width: 0;
      }

      .app-header-brand-link {
        color: inherit;
        text-decoration: none;
      }

      .app-header-brand h1 {
        margin: 0;
        font-size: clamp(2rem, 3.6vw, 3.4rem);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }

      .cloud-arena-menu-button {
        display: inline-flex;
        align-items: center;
        gap: 0.65rem;
        min-height: 2.8rem;
        padding: 0.68rem 0.9rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.2);
        background: rgba(255, 255, 255, 0.7);
        color: var(--ink);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition:
          transform 140ms ease,
          border-color 140ms ease,
          background 140ms ease;
      }

      .cloud-arena-menu-button:hover {
        transform: translateY(-1px);
        border-color: rgba(154, 52, 18, 0.3);
        background: rgba(255, 255, 255, 0.92);
      }

      .cloud-arena-menu-icon {
        display: inline-grid;
        gap: 0.22rem;
        width: 1rem;
      }

      .cloud-arena-menu-icon span {
        display: block;
        width: 100%;
        height: 2px;
        border-radius: 999px;
        background: currentColor;
      }

      .panel {
        padding: 2rem;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--panel);
        backdrop-filter: blur(10px);
        box-shadow: 0 20px 60px rgba(28, 23, 19, 0.08);
      }

      .app-shell.is-battle-page .panel,
      .app-shell.is-battle-page .cloud-arena-hud-card,
      .app-shell.is-battle-page .cloud-arena-game-admin-menu,
      .app-shell.is-battle-page .cloud-arena-game-log-menu,
      .app-shell.is-battle-page .trace-viewer-stat-chip,
      .app-shell.is-battle-page .trace-viewer-inline-action,
      .app-shell.is-battle-page .trace-viewer-log-turn,
      .app-shell.is-battle-page .warning-callout,
      .app-shell.is-battle-page .cloud-arena-inspector-panel {
        background: rgba(255, 251, 246, 0.5);
        backdrop-filter: blur(10px);
      }

      .app-shell.is-battle-page .cloud-arena-hud-card-enemy {
        background:
          radial-gradient(circle at top left, rgba(248, 113, 113, 0.16), transparent 42%),
          linear-gradient(145deg, rgba(255, 244, 244, 0.58), rgba(247, 224, 224, 0.5));
      }

      .app-shell.is-battle-page .cloud-arena-hud-card-player {
        background:
          radial-gradient(circle at top left, rgba(96, 165, 250, 0.14), transparent 42%),
          linear-gradient(145deg, rgba(246, 250, 255, 0.58), rgba(226, 235, 248, 0.5));
      }

      .app-shell.is-battle-page .cloud-arena-hud-stat-pill {
        background: rgba(255, 255, 255, 0.4);
      }

      .app-shell.is-battle-page .cloud-arena-game-admin-menu,
      .app-shell.is-battle-page .cloud-arena-game-log-menu {
        background: rgba(255, 251, 246, 0.46);
      }

      .app-header.panel {
        padding: 1rem 1.1rem;
      }

      .page-layout {
        min-height: 0;
        overflow: visible;
      }

      .app-shell-stage {
        position: relative;
        display: grid;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }

      .app-shell-stage-content {
        position: relative;
        z-index: 1;
        min-height: 0;
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .app-shell-backdrop {
        position: absolute;
        inset: 0;
        z-index: 20;
        border: none;
        background: rgba(20, 15, 12, 0.28);
        opacity: 0;
        pointer-events: none;
        transition: opacity 160ms ease;
      }

      .app-shell-backdrop.is-open {
        opacity: 1;
        pointer-events: auto;
      }

      .app-shell-sidebar {
        position: absolute;
        top: 0.45rem;
        right: 0.45rem;
        bottom: 0.45rem;
        z-index: 30;
        display: grid;
        gap: 1rem;
        width: min(26rem, calc(100vw - 1rem));
        padding: 1rem;
        overflow: hidden;
        transform: translateX(calc(100% + 1rem));
        transition: transform 180ms ease;
      }

      .app-shell-sidebar.is-open {
        transform: translateX(0);
      }

      .app-shell-sidebar-section {
        display: grid;
        gap: 0.65rem;
      }

      .app-shell-sidebar-section > strong {
        color: var(--accent);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .app-shell-sidebar-nav {
        display: grid;
        gap: 0.55rem;
      }

      .app-shell-sidebar-nav a {
        display: inline-flex;
        align-items: center;
        min-height: 2.75rem;
        padding: 0.7rem 0.95rem;
        border-radius: 16px;
        border: 1px solid transparent;
        background: rgba(255, 255, 255, 0.68);
        color: var(--ink);
        text-decoration: none;
        font-weight: 700;
        letter-spacing: 0.01em;
        transition:
          transform 140ms ease,
          border-color 140ms ease,
          background 140ms ease;
      }

      .app-shell-sidebar-nav a:hover {
        transform: translateY(-1px);
        border-color: rgba(154, 52, 18, 0.28);
        background: rgba(255, 255, 255, 0.92);
      }

      .app-shell-sidebar-nav a.active {
        background: rgba(154, 52, 18, 0.12);
        border-color: rgba(154, 52, 18, 0.32);
        color: var(--accent);
      }

      .cloud-arena-theme-panel {
        display: grid;
        gap: 0.9rem;
      }

      .cloud-arena-theme-header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.85rem;
      }

      .cloud-arena-theme-header strong {
        display: block;
        margin-top: 0.15rem;
        font-size: 1rem;
      }

      .cloud-arena-theme-grid {
        display: grid;
        gap: 0.75rem;
      }

      .cloud-arena-theme-field {
        gap: 0.35rem;
      }

      .cloud-arena-theme-field small {
        color: var(--muted);
        font-size: 0.8rem;
        line-height: 1.35;
      }

      .cloud-arena-theme-field input[type="color"] {
        min-height: 3rem;
        padding: 0.22rem;
        cursor: pointer;
      }

      .cloud-arena-theme-field input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
      }

      .cloud-arena-theme-field input[type="color"]::-webkit-color-swatch {
        border: none;
        border-radius: 10px;
      }

      .cloud-arena-theme-reset {
        align-self: start;
      }

      .cloud-arena-theme-note {
        margin: 0;
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.45;
      }

      .card-face-tile,
      .display-card,
      .display-card-shell,
      .display-card-static-face,
      .cloud-arena-summary-card,
      .trace-viewer-card,
      .trace-viewer-battlefield-card,
      .trace-viewer-hand-card,
      .deckbuilder-card-button,
      .deckbuilder-card-face,
      .card-preview-modal,
      .card-preview-shell,
      .card-result-preview,
      .card-detail-media,
      .card-detail-fallback {
        --bg: #f7f0e6;
        --panel: rgba(255, 252, 247, 0.9);
        --ink: #1c1713;
        --muted: #5f544c;
        --accent: #9a3412;
        --accent-strong: color-mix(in srgb, #9a3412 74%, black 26%);
        --border: rgba(95, 84, 76, 0.18);
      }

      @media (max-width: 659px) {
        .app-shell {
          padding: 0.75rem;
        }

        .app-header.panel {
          padding: 0.95rem 1rem;
        }

        .app-header {
          top: 0.75rem;
          left: 0.75rem;
          right: 0.75rem;
        }

        .app-header-brand h1 {
          font-size: clamp(1.8rem, 8vw, 2.4rem);
        }

        .app-shell-sidebar {
          width: min(92vw, 23rem);
        }
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

      .cloud-arena-live-layout {
        gap: 0.75rem;
      }

      .cloud-arena-game-frame {
        display: flex;
        flex-direction: column;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }

      .cloud-arena-game-screen {
        display: grid;
        grid-template-rows: minmax(0, 1fr);
        gap: 0.75rem;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }

      .cloud-arena-game-summary {
        flex: 1 1 24rem;
        margin-bottom: 0;
      }

      .cloud-arena-game-admin-menu,
      .cloud-arena-game-log-menu {
        display: grid;
        gap: 0.65rem;
        min-width: min(24rem, 100%);
        padding: 0.68rem 0.78rem;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.72);
      }

      .cloud-arena-game-admin-menu summary,
      .cloud-arena-game-log-menu summary {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        width: fit-content;
        cursor: pointer;
        list-style: none;
        color: var(--accent);
        font-weight: 800;
      }

      .cloud-arena-game-admin-menu summary::-webkit-details-marker,
      .cloud-arena-game-log-menu summary::-webkit-details-marker {
        display: none;
      }

      .cloud-arena-game-admin-menu summary::before,
      .cloud-arena-game-log-menu summary::before {
        content: "▸";
        font-size: 0.86rem;
        transition: transform 140ms ease;
      }

      .cloud-arena-game-admin-menu[open] summary::before,
      .cloud-arena-game-log-menu[open] summary::before {
        transform: rotate(90deg);
      }

      .cloud-arena-game-admin-panel,
      .cloud-arena-game-log-panel {
        display: grid;
        gap: 0.65rem;
        min-height: 0;
        max-height: min(36dvh, 24rem);
        overflow: auto;
      }

      .cloud-arena-game-admin-grid {
        display: grid;
        gap: 0.75rem;
      }

      @media (min-width: 760px) {
        .cloud-arena-game-admin-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .cloud-arena-game-admin-actions {
        justify-content: flex-start;
      }

      .cloud-arena-game-admin-note {
        font-size: 0.92rem;
      }

      .cloud-arena-start-layout {
        display: grid;
        gap: 1rem;
      }

      .cloud-arena-start-hero {
        display: grid;
        gap: 1.25rem;
        min-width: 0;
        width: 100%;
        min-height: 100%;
        padding: clamp(1.5rem, 4vw, 3rem);
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(circle at 18% 16%, rgba(247, 200, 84, 0.04), transparent 16%),
          radial-gradient(circle at 82% 18%, rgba(92, 132, 255, 0.04), transparent 15%),
          linear-gradient(160deg, rgba(6, 16, 42, 0.06), rgba(7, 18, 45, 0.02) 54%, rgba(7, 18, 45, 0.08));
        color: #fff4e8;
        border: none;
        border-radius: 0;
        box-shadow: none;
      }

      .cloud-arena-start-hero::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.015) 20%, transparent 42%),
          radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.02), transparent 32%);
        mix-blend-mode: screen;
        opacity: 0.16;
        pointer-events: none;
      }

      .cloud-arena-start-hero::after {
        content: "";
        position: absolute;
        inset: auto -5rem -4rem auto;
        width: 15rem;
        height: 15rem;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255, 226, 143, 0.04), transparent 68%);
        pointer-events: none;
      }

      .cloud-arena-start-screen {
        position: relative;
        display: grid;
        place-items: stretch;
        min-height: 100%;
        padding: 0;
        overflow: hidden;
        background:
          linear-gradient(180deg, rgba(6, 18, 56, 0.2), rgba(6, 18, 56, 0.76)),
          url("https://cdn.prod.website-files.com/639281d335ff5f86b30762e7/68e3855912fe821b006210b2_new-Paradiso%20Artwork_Website%20Banner.png") center center / cover no-repeat,
          radial-gradient(circle at 50% 12%, rgba(247, 200, 84, 0.4), transparent 22%),
          linear-gradient(135deg, #10284f 0%, #0a1432 48%, #081028 100%);
      }

      .cloud-arena-start-backdrop {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 12%, rgba(255, 224, 132, 0.04), transparent 18%),
          radial-gradient(circle at 50% 70%, rgba(14, 36, 92, 0.08), transparent 28%);
      }

      .cloud-arena-start-orb,
      .cloud-arena-start-rift {
        position: absolute;
        inset: auto;
        border-radius: 999px;
        filter: blur(10px);
      }

      .cloud-arena-start-orb-left {
        left: 10%;
        bottom: 14%;
        width: clamp(10rem, 20vw, 18rem);
        height: clamp(10rem, 20vw, 18rem);
        background: radial-gradient(circle, rgba(247, 200, 84, 0.06), transparent 64%);
      }

      .cloud-arena-start-orb-right {
        right: 12%;
        top: 14%;
        width: clamp(8rem, 16vw, 14rem);
        height: clamp(8rem, 16vw, 14rem);
        background: radial-gradient(circle, rgba(92, 132, 255, 0.06), transparent 66%);
      }

      .cloud-arena-start-rift {
        left: 50%;
        top: 50%;
        width: min(72vw, 42rem);
        height: min(72vw, 42rem);
        transform: translate(-50%, -50%);
        background:
          radial-gradient(circle, rgba(255, 255, 255, 0.04), transparent 34%),
          conic-gradient(from 180deg, rgba(255, 226, 143, 0.01), rgba(255, 226, 143, 0.04), rgba(92, 132, 255, 0.03), rgba(255, 226, 143, 0.01));
        opacity: 0.18;
        animation: cloud-arena-rift-pulse 11s ease-in-out infinite;
      }

      .cloud-arena-start-rift-secondary {
        width: min(42vw, 22rem);
        height: min(42vw, 22rem);
        opacity: 0.06;
        filter: blur(20px);
        animation-duration: 17s;
      }

      .cloud-arena-start-copy {
        display: grid;
        gap: 0.45rem;
        max-width: 38rem;
        position: relative;
        z-index: 1;
      }

      .cloud-arena-start-copy h2 {
        margin: 0;
        font-size: clamp(2.8rem, 6vw, 5rem);
        line-height: 0.95;
        letter-spacing: -0.06em;
        text-wrap: balance;
        text-shadow: 0 18px 32px rgba(0, 0, 0, 0.28);
      }

      .cloud-arena-start-copy p,
      .cloud-arena-start-hint {
        margin: 0;
        color: rgba(239, 246, 255, 0.98);
        line-height: 1.45;
      }

      .cloud-arena-start-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        align-items: center;
      }

      .cloud-arena-start-primary,
      .cloud-arena-start-secondary {
        min-width: 10.5rem;
      }

      .cloud-arena-start-kicker {
        color: rgba(255, 232, 172, 0.94);
      }

      .cloud-arena-start-press-start {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        width: fit-content;
        color: rgba(255, 235, 186, 0.98);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .cloud-arena-start-press-start::before,
      .cloud-arena-start-press-start::after {
        content: "";
        display: block;
        width: 2rem;
        height: 1px;
        background: currentColor;
        opacity: 0.55;
      }

      .cloud-arena-start-press-start::after {
        animation: cloud-arena-press-start-blink 1.4s steps(2, end) infinite;
      }

      .cloud-arena-start-stage {
        position: relative;
        z-index: 1;
        display: grid;
        gap: 1rem;
      }

      @media (min-width: 1040px) {
        .cloud-arena-start-stage {
          grid-template-columns: minmax(0, 1fr) minmax(0, 0.92fr) minmax(20rem, 1.22fr);
          align-items: start;
        }
      }

      .cloud-arena-start-menu {
        display: grid;
        gap: 0.75rem;
      }

      .cloud-arena-start-menu-item {
        display: grid;
        gap: 0.25rem;
        width: 100%;
        padding: 1rem 1.05rem;
        border-radius: 22px;
        border: 1px solid rgba(194, 213, 255, 0.06);
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.05), transparent 36%),
          rgba(6, 16, 42, 0.14);
        color: #eef4ff;
        text-align: left;
        text-decoration: none;
        font: inherit;
        cursor: pointer;
        transition:
          transform 160ms ease,
          border-color 160ms ease,
          background 160ms ease,
          box-shadow 160ms ease;
      }

      .cloud-arena-start-menu-item strong {
        font-size: 1.1rem;
        letter-spacing: 0.01em;
      }

      .cloud-arena-start-menu-item span {
        color: rgba(224, 235, 255, 0.82);
        font-size: 0.93rem;
        line-height: 1.4;
      }

      .cloud-arena-start-menu-item:hover,
      .cloud-arena-start-menu-item:focus-visible {
        transform: translateY(-1px);
        border-color: rgba(247, 200, 84, 0.16);
        box-shadow: 0 18px 34px rgba(1, 10, 28, 0.08);
      }

      .cloud-arena-start-menu-item.is-primary {
        border-color: rgba(194, 213, 255, 0.06);
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.05), transparent 36%),
          rgba(6, 16, 42, 0.14);
        box-shadow: none;
        animation: none;
      }

      .cloud-arena-start-menu-item-subtle {
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.04), transparent 36%),
          rgba(255, 255, 255, 0.02);
      }

      @keyframes cloud-arena-press-start-blink {
        0%,
        45% {
          opacity: 0.18;
        }

        50%,
        100% {
          opacity: 0.98;
        }
      }

      @keyframes cloud-arena-menu-glow {
        0%,
        100% {
          box-shadow: 0 20px 38px rgba(96, 36, 9, 0.22);
        }

        50% {
          box-shadow: 0 22px 44px rgba(96, 36, 9, 0.3);
        }
      }

      @keyframes cloud-arena-rift-pulse {
        0%,
        100% {
          transform: translate(-50%, -50%) scale(0.98) rotate(0deg);
        }

        50% {
          transform: translate(-50%, -50%) scale(1.05) rotate(8deg);
        }
      }

      .cloud-arena-run-screen {
        width: 100%;
        height: 100%;
        min-height: 100%;
        overflow: hidden;
      }

      /* ── Bestiary ─────────────────────────────────────────────── */

      .cloud-arena-bestiary {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 100%;
        overflow: hidden;
      }

      .cloud-arena-bestiary-layout {
        position: relative;
        z-index: 1;
        padding-inline: 0;
      }

      .cloud-arena-bestiary-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.25rem;
        max-width: none;
        padding-inline: clamp(1.5rem, 4vw, 3rem);
      }

      .cloud-arena-bestiary-back {
        flex: 0 0 auto;
        width: auto;
      }

      .cloud-arena-bestiary-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.92);
        font-size: clamp(1.4rem, 3vw, 2rem);
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      .cloud-arena-bestiary-stage {
        grid-template-columns: minmax(0, 1fr);
        width: 100%;
        min-height: 0;
        height: 100%;
        overflow: hidden;
        padding-inline: 0.75rem;
      }

      .cloud-arena-bestiary-column {
        grid-template-rows: minmax(0, 1fr);
        width: 100%;
        max-width: none;
      }

      .cloud-arena-bestiary-scroll-pane {
        width: 100%;
        padding-right: 0.35rem;
      }

      .cloud-arena-bestiary-panel {
        --display-card-width: clamp(11rem, 13vw, 14rem);
        width: 100%;
        max-width: none;
        box-sizing: border-box;
        padding: 1.5rem;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 24px;
        background: rgba(255, 251, 246, 0.08);
        backdrop-filter: blur(10px);
        box-shadow: 0 20px 60px rgba(6, 12, 40, 0.32);
      }

      .cloud-arena-bestiary-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(var(--display-card-width), 1fr));
        align-items: start;
      }

      .cloud-arena-bestiary-entry {
        position: relative;
        display: grid;
        justify-items: center;
      }

      .cloud-arena-bestiary-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 29;
        background: rgba(6, 12, 36, 0.6);
        backdrop-filter: blur(2px);
        cursor: pointer;
      }

      /* ─────────────────────────────────────────────────────────── */

      .cloud-arena-run-hero {
        gap: 1.15rem;
        grid-template-rows: auto minmax(0, 1fr);
        min-height: 0;
        height: 100%;
      }

      .cloud-arena-run-copy {
        max-width: 35rem;
      }

      .cloud-arena-run-copy p {
        max-width: 38rem;
      }

      .cloud-arena-run-actions {
        max-width: 46rem;
      }

      .cloud-arena-run-launch {
        min-width: 10.5rem;
      }

      .cloud-arena-run-stage {
        grid-template-columns: minmax(0, 1fr);
        align-items: start;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }

      @media (min-width: 1040px) {
        .cloud-arena-run-stage {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .cloud-arena-run-column,
      .cloud-arena-run-summary {
        display: grid;
        gap: 0.75rem;
        align-content: start;
        min-width: 0;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }

      .cloud-arena-run-column {
        grid-template-rows: auto minmax(0, 1fr);
        gap: 0.45rem;
      }

      .cloud-arena-run-summary {
        grid-template-rows: minmax(0, 1fr) auto;
        justify-items: center;
      }

      .cloud-arena-run-summary {
        max-width: none;
        overflow: visible;
        --display-card-width: clamp(10rem, 11vw, 13rem);
      }

      .cloud-arena-run-enemy-stack {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: var(--display-card-width);
        align-items: start;
        justify-content: center;
        width: 100%;
        min-width: 0;
        min-height: 0;
        overflow-x: visible;
        overflow-y: visible;
        padding: 0.2rem 0.2rem 0.85rem;
        scroll-snap-type: x proximity;
      }

      .cloud-arena-run-enemy-card-shell {
        flex: 0 0 auto;
        position: relative;
        z-index: var(--hand-card-stack-z, 0);
        padding-bottom: 1.2rem;
        min-height: 100%;
        scroll-snap-align: start;
        inset-inline-start: calc(
          var(--hand-card-stack-shift, 0rem) * var(--hand-card-stack-x-scale, 1) * var(--hand-card-stack-index, 0) * -1
        );
        margin-block-start: calc(var(--hand-card-stack-lift, 0rem) * var(--hand-card-stack-y-scale, 1));
        transform:
          translate3d(0, 0, 0)
          rotate(calc(var(--hand-card-stack-tilt, 0deg) * var(--hand-card-stack-tilt-scale, 1)));
        transform-origin: 50% 88%;
        will-change: transform;
      }

      .cloud-arena-run-enter-battle {
        justify-self: stretch;
        width: 100%;
        border: 1px solid rgba(181, 141, 43, 0.55);
        background: linear-gradient(135deg, rgba(255, 235, 181, 0.98), rgba(214, 168, 61, 0.98));
        color: #5a3d10;
        box-shadow: 0 14px 30px rgba(122, 79, 8, 0.18);
      }

      .cloud-arena-run-enter-battle:hover:enabled {
        border-color: rgba(181, 141, 43, 0.7);
        background: linear-gradient(135deg, rgba(255, 241, 205, 1), rgba(224, 182, 74, 1));
        color: #4c3210;
      }

      .cloud-arena-run-summary-actions {
        display: grid;
        gap: 0.6rem;
        margin-top: 0.25rem;
      }

      .cloud-arena-run-scroll-pane {
        display: grid;
        gap: 0.35rem;
        min-height: 0;
        height: 100%;
        overflow: auto;
        padding-right: 0.2rem;
      }

      .cloud-arena-run-card-grid {
        display: grid;
        gap: 0.45rem;
        align-content: start;
      }

      .cloud-arena-run-scenario-grid {
        width: min(100%, 22rem);
        margin-inline: auto;
        align-content: start;
        gap: 0.3rem;
      }

      .cloud-arena-run-scenario-grid .cloud-arena-run-option {
        min-height: 2.7rem;
        padding-block: 0.38rem;
        padding-inline: 1rem;
        gap: 0.06rem;
      }

      .cloud-arena-run-scenario-grid .cloud-arena-run-option strong {
        font-size: 0.93rem;
        line-height: 1;
      }

      .cloud-arena-run-deck-group {
        display: grid;
        gap: 0.3rem;
      }

      .cloud-arena-run-group-label {
        color: rgba(255, 232, 172, 0.94);
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .cloud-arena-run-option {
        gap: 0.26rem;
        padding: 1rem 1.05rem;
        border-radius: 22px;
        border-color: rgba(194, 213, 255, 0.2);
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.06), transparent 36%),
          rgba(3, 10, 30, 0.44);
        color: #eef4ff;
      }

      .cloud-arena-run-option:hover:enabled,
      .cloud-arena-run-option:focus-visible:enabled {
        border-color: rgba(247, 200, 84, 0.3);
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.08), transparent 36%),
          rgba(5, 14, 36, 0.56);
      }

      .cloud-arena-run-option.is-selected:hover:enabled,
      .cloud-arena-run-option.is-selected:focus-visible:enabled {
        transform: none;
        border-color: rgba(188, 139, 26, 0.62);
        background:
          radial-gradient(circle at top left, rgba(255, 244, 192, 0.38), transparent 36%),
          linear-gradient(135deg, rgba(245, 215, 116, 0.4), rgba(193, 134, 19, 0.46));
        color: #fff7df;
        box-shadow:
          inset 0 0 0 1px rgba(255, 247, 214, 0.12),
          0 18px 34px rgba(91, 59, 8, 0.14);
      }

      .cloud-arena-run-option.is-selected {
        border-color: rgba(188, 139, 26, 0.62);
        background:
          radial-gradient(circle at top left, rgba(255, 244, 192, 0.38), transparent 36%),
          linear-gradient(135deg, rgba(245, 215, 116, 0.4), rgba(193, 134, 19, 0.46));
        color: #fff7df;
        box-shadow:
          inset 0 0 0 1px rgba(255, 247, 214, 0.12),
          0 18px 34px rgba(91, 59, 8, 0.14);
      }

      .cloud-arena-run-option strong {
        font-size: 1.05rem;
      }

      .cloud-arena-run-option span {
        color: rgba(224, 235, 255, 0.82);
        font-size: 0.93rem;
        line-height: 1.4;
      }

      .cloud-arena-run-option:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .cloud-arena-run-summary strong {
        font-size: 1rem;
      }

      .cloud-arena-run-summary p {
        margin: 0;
        color: rgba(239, 246, 255, 0.98);
        line-height: 1.45;
      }

      .cloud-arena-run-summary-actions {
        display: grid;
        gap: 0.6rem;
        margin-top: 0.25rem;
      }

      .cloud-arena-game-finished {
        margin-top: 0.1rem;
      }

      .cloud-arena-finish-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 140;
        display: grid;
        place-items: center;
        padding: 1rem;
        background: rgba(18, 12, 8, 0.72);
        backdrop-filter: blur(10px);
      }

      .cloud-arena-finish-modal {
        width: min(92vw, 34rem);
        display: grid;
        gap: 1rem;
        padding: 1.25rem;
        text-align: center;
      }

      .cloud-arena-finish-modal-header {
        display: grid;
        gap: 0.55rem;
      }

      .cloud-arena-finish-modal-header strong {
        font-size: clamp(2rem, 5vw, 3.6rem);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }

      .cloud-arena-finish-modal-header span {
        color: var(--muted);
        font-size: 1rem;
        line-height: 1.45;
      }

      .cloud-arena-finish-modal-actions {
        justify-content: center;
      }

      .cloud-arena-finish-modal-retry {
        min-width: 10rem;
        min-height: 2.8rem;
        padding: 0.65rem 1.1rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.22);
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(154, 52, 18, 0.12));
        color: var(--accent);
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .cloud-arena-finish-modal-retry:hover:enabled {
        border-color: rgba(154, 52, 18, 0.34);
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.24), rgba(154, 52, 18, 0.16));
      }

      .cloud-arena-finish-modal-retry:disabled {
        opacity: 0.62;
        cursor: default;
      }

      /* ── Campaign page ─────────────────────────────────────────── */

      .cloud-arena-campaign-hero {
        gap: 1.15rem;
        grid-template-rows: auto minmax(0, 1fr);
        min-height: 0;
        height: 100%;
      }

      .cloud-arena-campaign-stage {
        grid-template-columns: minmax(0, 1fr);
        align-items: start;
        min-height: 0;
        height: 100%;
        overflow: auto;
      }

      @media (min-width: 900px) {
        .cloud-arena-campaign-stage {
          grid-template-columns: minmax(0, 1.6fr) minmax(14rem, 1fr);
        }
      }

      .cloud-arena-campaign-progress {
        margin: 0;
        font-size: 1rem;
        color: rgba(224, 235, 255, 0.6);
        font-weight: 600;
      }

      .cloud-arena-campaign-track-col {
        display: grid;
        gap: 1rem;
        align-content: start;
        overflow: auto;
        padding-right: 0.2rem;
      }

      .cloud-arena-campaign-track {
        display: grid;
        gap: 0;
      }

      .cloud-arena-campaign-level-row {
        display: grid;
      }

      /* connector line between levels */
      .cloud-arena-campaign-connector {
        height: 0.6rem;
        width: 2px;
        background: rgba(194, 213, 255, 0.14);
        margin-left: calc(1.05rem + 1.5rem - 1px);
      }

      /* level card — extends cloud-arena-run-option */
      .cloud-arena-campaign-level {
        text-align: left;
        border-radius: 22px;
      }

      .cloud-arena-campaign-level.is-complete {
        border-color: rgba(74, 222, 128, 0.32);
        background:
          radial-gradient(circle at top left, rgba(74, 222, 128, 0.12), transparent 36%),
          rgba(3, 22, 12, 0.44);
        color: rgba(167, 243, 208, 0.92);
        opacity: 1;
        cursor: default;
      }

      .cloud-arena-campaign-level.is-unlocked {
        border-color: rgba(188, 139, 26, 0.62);
        background:
          radial-gradient(circle at top left, rgba(255, 244, 192, 0.38), transparent 36%),
          linear-gradient(135deg, rgba(245, 215, 116, 0.4), rgba(193, 134, 19, 0.46));
        color: #fff7df;
        box-shadow:
          inset 0 0 0 1px rgba(255, 247, 214, 0.12),
          0 18px 34px rgba(91, 59, 8, 0.14);
      }

      .cloud-arena-campaign-level.is-unlocked:hover:enabled {
        border-color: rgba(214, 165, 38, 0.75);
        background:
          radial-gradient(circle at top left, rgba(255, 248, 210, 0.44), transparent 36%),
          linear-gradient(135deg, rgba(250, 225, 130, 0.46), rgba(200, 145, 28, 0.52));
      }

      .cloud-arena-campaign-level-meta {
        display: flex;
        align-items: center;
        gap: 0.9rem;
      }

      .cloud-arena-campaign-level-badge {
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        width: 2.2rem;
        height: 2.2rem;
        border-radius: 50%;
        border: 1.5px solid currentColor;
        font-size: 0.88rem;
        font-weight: 800;
        opacity: 0.72;
      }

      .cloud-arena-campaign-level.is-unlocked .cloud-arena-campaign-level-badge {
        opacity: 1;
      }

      .cloud-arena-campaign-level-body {
        display: grid;
        gap: 0.15rem;
      }

      .cloud-arena-campaign-note {
        color: rgba(224, 235, 255, 0.5);
        font-size: 0.93rem;
        margin: 0;
      }

      /* complete state */
      .cloud-arena-campaign-complete {
        display: grid;
        gap: 0.75rem;
      }

      .cloud-arena-campaign-complete strong {
        font-size: clamp(1.4rem, 3vw, 2rem);
        font-weight: 900;
        color: rgba(167, 243, 208, 0.95);
      }

      .cloud-arena-campaign-complete p {
        color: rgba(224, 235, 255, 0.6);
        margin: 0;
      }

      .cloud-arena-campaign-cta {
        justify-self: start;
        width: auto;
      }

      /* abandon link */
      .cloud-arena-campaign-abandon {
        font: inherit;
        font-size: 0.82rem;
        color: rgba(224, 235, 255, 0.38);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        text-decoration: underline;
        text-underline-offset: 3px;
        justify-self: start;
      }

      .cloud-arena-campaign-abandon:hover {
        color: rgba(224, 235, 255, 0.62);
      }

      /* deck panel */
      .cloud-arena-campaign-deck-col {
        display: grid;
        gap: 1rem;
        align-content: start;
        position: sticky;
        top: 0;
      }

      .cloud-arena-campaign-deck-body {
        display: grid;
        gap: 0.6rem;
        padding: 1rem 1.05rem;
        border-radius: 22px;
        border: 1px solid rgba(194, 213, 255, 0.08);
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.04), transparent 36%),
          rgba(3, 10, 30, 0.44);
        max-height: calc(100dvh - 12rem);
        overflow-y: auto;
      }

      .cloud-arena-campaign-deck-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        gap: 0.22rem;
      }

      .cloud-arena-campaign-deck-entry {
        display: flex;
        gap: 0.5rem;
        font-size: 0.86rem;
        color: rgba(224, 235, 255, 0.82);
        align-items: baseline;
      }

      .cloud-arena-campaign-deck-count {
        color: rgba(224, 235, 255, 0.42);
        font-variant-numeric: tabular-nums;
        min-width: 1.4rem;
      }

      /* ── Reward modal ──────────────────────────────────────────── */

      .cloud-arena-reward-modal {
        width: min(94vw, 42rem);
        display: grid;
        gap: 1.25rem;
        padding: 1.5rem 1.25rem;
        text-align: center;
      }

      .cloud-arena-reward-choices {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
      }

      @media (max-width: 560px) {
        .cloud-arena-reward-choices {
          grid-template-columns: 1fr;
        }
      }

      .cloud-arena-reward-choice {
        display: grid;
        gap: 0.35rem;
        padding: 1rem 0.75rem;
        border-radius: 0.6rem;
        border: 1px solid rgba(239, 246, 255, 0.1);
        background: rgba(239, 246, 255, 0.04);
        color: inherit;
        font: inherit;
        cursor: pointer;
        text-align: center;
        transition: border-color 0.15s, background 0.15s, transform 0.1s;
      }

      .cloud-arena-reward-choice:hover:enabled {
        border-color: var(--accent);
        background: rgba(217, 119, 6, 0.1);
        transform: translateY(-2px);
      }

      .cloud-arena-reward-choice:disabled {
        opacity: 0.55;
        cursor: default;
      }

      .cloud-arena-reward-choice-cost {
        font-size: 0.8rem;
        color: var(--muted);
        font-variant-numeric: tabular-nums;
      }

      .cloud-arena-reward-choice-cost::before {
        content: "Cost ";
      }

      .cloud-arena-reward-choice-name {
        font-size: 0.95rem;
        font-weight: 700;
        color: rgba(239, 246, 255, 0.95);
      }

      .cloud-arena-reward-choice-type {
        font-size: 0.75rem;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .cloud-arena-reward-processing {
        color: var(--muted);
        font-size: 0.9rem;
        margin: 0;
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

      .cloud-arena-battle-shell {
        display: grid;
        min-height: 0;
        height: 100%;
        overflow: visible;
        background: transparent;
      }

      .cloud-arena-battle-window {
        position: relative;
        display: grid;
        gap: 0.9rem;
        min-height: 0;
        height: 100%;
        overflow: visible;
      }

      .cloud-arena-battle-main {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        min-height: 0;
        height: 100%;
      }

      .cloud-arena-battlefield-stage {
        flex: 1 1 auto;
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 0.8rem;
        min-height: 0;
        align-items: stretch;
      }

      @media (max-width: 699px) {
        .cloud-arena-battlefield-stage {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .cloud-arena-hud-band {
        display: grid;
        gap: 0.75rem;
      }

      @media (min-width: 860px) {
        .cloud-arena-hud-band {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .cloud-arena-hud-card {
        display: grid;
        gap: 0.55rem;
        min-width: 0;
        padding: 0.9rem 1rem;
        border-radius: 18px;
        border: 1px solid var(--border);
        text-align: left;
        background:
          radial-gradient(circle at top left, rgba(255, 255, 255, 0.22), transparent 42%),
          rgba(255, 255, 255, 0.8);
        box-shadow: 0 18px 40px rgba(61, 32, 5, 0.08);
        transition:
          transform 160ms ease,
          box-shadow 160ms ease,
          border-color 160ms ease;
      }

      .cloud-arena-hud-card:hover,
      .cloud-arena-hud-card:focus-visible {
        transform: translateY(-1px);
        border-color: rgba(154, 52, 18, 0.22);
        box-shadow: 0 22px 46px rgba(61, 32, 5, 0.12);
      }

      .cloud-arena-hud-card-enemy {
        background:
          radial-gradient(circle at top left, rgba(248, 113, 113, 0.22), transparent 42%),
          linear-gradient(145deg, rgba(255, 244, 244, 0.92), rgba(247, 224, 224, 0.88));
      }

      .cloud-arena-hud-card-player {
        background:
          radial-gradient(circle at top left, rgba(96, 165, 250, 0.18), transparent 42%),
          linear-gradient(145deg, rgba(246, 250, 255, 0.92), rgba(226, 235, 248, 0.88));
      }

      .cloud-arena-hud-card-header {
        display: grid;
        gap: 0.18rem;
      }

      .cloud-arena-hud-card-header strong {
        font-size: 1.02rem;
      }

      .cloud-arena-hud-kicker {
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .cloud-arena-hud-stat-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 700;
      }

      .cloud-arena-hud-stat-pill {
        display: inline-flex;
        align-items: center;
        padding: 0.26rem 0.6rem;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(71, 85, 105, 0.14);
        color: var(--ink);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.01em;
      }

      .cloud-arena-hud-player-line {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.75rem;
        align-items: center;
      }

      .cloud-arena-hud-player-track {
        display: grid;
        gap: 0.45rem;
        min-width: 0;
      }

      .cloud-arena-hand-hud-block,
      .cloud-arena-hud-block {
        display: inline-grid;
        place-items: center;
        align-self: center;
        min-width: 2.7rem;
        min-height: 2.85rem;
        padding: 0.32rem 0.3rem 0.42rem;
        border-radius: 0;
        border: 1px solid rgba(30, 64, 175, 0.22);
        background: linear-gradient(180deg, rgba(96, 165, 250, 0.95), rgba(37, 99, 235, 0.95));
        color: #f8fbff;
        box-shadow: 0 14px 28px rgba(37, 99, 235, 0.18);
        clip-path: polygon(50% 0%, 86% 10%, 100% 34%, 93% 74%, 50% 100%, 7% 74%, 0% 34%, 14% 10%);
      }

      .cloud-arena-hand-hud-block-value,
      .cloud-arena-hud-block-value {
        font-size: 1.05rem;
        font-weight: 900;
        line-height: 1;
      }

      .cloud-arena-hud-health-bar {
        width: 100%;
        height: 0.52rem;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.16);
        border: 1px solid rgba(148, 163, 184, 0.14);
      }

      .cloud-arena-hud-health-bar-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #16a34a, #4ade80);
        transition:
          width 180ms ease,
          filter 180ms ease,
          box-shadow 180ms ease;
      }

      .cloud-arena-hud-card.is-health-dropping,
      .cloud-arena-hand-hud.is-health-dropping {
        animation: cloudArenaHealthDropPulse 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .cloud-arena-hud-card.is-health-rising,
      .cloud-arena-hand-hud.is-health-rising {
        animation: cloudArenaHealthRisePulse 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .cloud-arena-hud-health-bar.is-dropping,
      .cloud-arena-hand-hud-health-bar.is-dropping,
      .trace-viewer-health-bar.is-dropping {
        box-shadow:
          0 0 0 2px rgba(220, 38, 38, 0.5),
          0 0 0 10px rgba(248, 113, 113, 0.24),
          0 0 28px rgba(248, 113, 113, 0.42);
      }

      .cloud-arena-hud-health-bar.is-rising,
      .cloud-arena-hand-hud-health-bar.is-rising,
      .trace-viewer-health-bar.is-rising {
        box-shadow:
          0 0 0 2px rgba(22, 163, 74, 0.5),
          0 0 0 10px rgba(74, 222, 128, 0.24),
          0 0 28px rgba(74, 222, 128, 0.42);
      }

      .cloud-arena-hud-health-bar.is-dropping .cloud-arena-hud-health-bar-fill,
      .cloud-arena-hand-hud-health-bar.is-dropping .cloud-arena-hand-hud-health-bar-fill,
      .trace-viewer-health-bar.is-dropping .trace-viewer-health-bar-fill {
        filter: saturate(1.3) brightness(1.22);
        box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.3), 0 0 14px rgba(248, 113, 113, 0.32);
      }

      .cloud-arena-hud-health-bar.is-rising .cloud-arena-hud-health-bar-fill,
      .cloud-arena-hand-hud-health-bar.is-rising .cloud-arena-hand-hud-health-bar-fill,
      .trace-viewer-health-bar.is-rising .trace-viewer-health-bar-fill {
        filter: saturate(1.28) brightness(1.18);
        box-shadow: 0 0 0 1px rgba(74, 222, 128, 0.3), 0 0 14px rgba(74, 222, 128, 0.32);
      }

      .cloud-arena-hud-stat-row.is-dropping,
      .cloud-arena-hand-hud-stats.is-dropping {
        animation: cloudArenaHealthDropPulse 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .cloud-arena-hud-stat-row.is-rising,
      .cloud-arena-hand-hud-stats.is-rising {
        animation: cloudArenaHealthRisePulse 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .cloud-arena-hud-block.is-dropping,
      .cloud-arena-hand-hud-block.is-dropping {
        animation: cloudArenaHealthDropPulse 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
        box-shadow:
          0 0 0 2px rgba(59, 130, 246, 0.46),
          0 0 0 10px rgba(147, 197, 253, 0.22),
          0 0 24px rgba(96, 165, 250, 0.34);
        filter: saturate(1.15) brightness(1.08);
      }

      .cloud-arena-hud-block.is-rising,
      .cloud-arena-hand-hud-block.is-rising {
        animation: cloudArenaHealthRisePulse 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
        box-shadow:
          0 0 0 2px rgba(37, 99, 235, 0.52),
          0 0 0 10px rgba(96, 165, 250, 0.26),
          0 0 28px rgba(59, 130, 246, 0.42);
        filter: saturate(1.2) brightness(1.12);
      }

      .cloud-arena-hud-intent {
        margin: 0;
        color: var(--ink);
        font-size: 0.92rem;
        line-height: 1.35;
      }

      .cloud-arena-section-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .cloud-arena-section-heading span {
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .cloud-arena-battlefield-panel {
        display: grid;
        gap: 0.65rem;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }

      .cloud-arena-battlefield-panel .trace-viewer-board-scroll {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
      }

      .trace-viewer-battle-actions {
        display: flex;
        justify-content: center;
        margin-bottom: 0.9rem;
      }

      .trace-viewer-battle-action-button {
        min-width: 11rem;
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
        grid-template-columns: repeat(auto-fit, minmax(var(--display-card-width), var(--display-card-width)));
        justify-content: start;
      }

      .trace-viewer-board-scroll {
        display: flex;
        min-height: 0;
        overflow-x: auto;
        overflow-y: auto;
        padding: 0.15rem 0.15rem 0.45rem;
        scroll-snap-type: x proximity;
      }

      .trace-viewer-hand-scroll {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: var(--display-card-width);
        gap: 0;
        min-height: 0;
        height: auto;
        overflow-x: auto;
        overflow-y: visible;
        padding: 0.65rem 0.35rem 0.2rem;
        scroll-snap-type: x proximity;
        align-content: end;
        min-height: calc(var(--display-card-width) * 1.35 + 12px);
        --hand-card-rest-shift: calc(var(--display-card-width) * 0.6);
        --hand-card-hover-rise: 8px;
        clip-path: inset(-9999px -9999px 0 -9999px);
        --hand-card-selected-rise: 420px;
        --hand-card-stack-x-scale: 1;
        --hand-card-stack-y-scale: 1;
        --hand-card-stack-tilt-scale: 1;
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
        position: relative;
        filter: grayscale(0.9) saturate(0.72) brightness(0.94) contrast(0.92);
        box-shadow:
          inset 0 0 0 1px rgba(120, 94, 62, 0.18),
          0 10px 24px rgba(98, 57, 18, 0.08);
      }

      .trace-viewer-hand-card-disabled::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background:
          linear-gradient(180deg, rgba(120, 94, 62, 0.1), rgba(120, 94, 62, 0.03)),
          repeating-linear-gradient(135deg, rgba(120, 94, 62, 0.08) 0 0.45rem, transparent 0.45rem 0.95rem);
        box-shadow: inset 0 0 0 1px rgba(120, 94, 62, 0.12);
      }

      .trace-viewer-hand-card-pending {
        position: relative;
        filter: saturate(0.92) brightness(0.98);
        box-shadow:
          inset 0 0 0 1px rgba(154, 52, 18, 0.2),
          0 0 0 1px rgba(154, 52, 18, 0.08),
          0 14px 30px rgba(98, 57, 18, 0.18);
      }

      .trace-viewer-hand-card-pending::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(154, 52, 18, 0.04), rgba(154, 52, 18, 0));
        box-shadow: inset 0 0 0 1px rgba(154, 52, 18, 0.1);
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
        grid-auto-flow: column;
        grid-auto-columns: var(--display-card-width);
        align-items: start;
        width: max-content;
        min-width: 0;
        justify-content: start;
        align-content: start;
      }

      .cloud-arena-battlefield-card {
        --card-title-size: clamp(0.62rem, 2cqw, 0.82rem);
      }

      .cloud-arena-permanent-button {
        display: block;
        position: relative;
        z-index: 2;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        text-align: left;
      }

      .cloud-arena-permanent-button.is-targetable {
        border-radius: 18px;
        box-shadow:
          0 0 0 2px rgba(37, 99, 235, 0.52),
          0 0 0 8px rgba(59, 130, 246, 0.24),
          0 0 0 16px rgba(96, 165, 250, 0.12),
          0 18px 34px rgba(28, 23, 19, 0.16);
        animation: cloudArenaTargetPulse 1.45s ease-in-out infinite;
      }

      .cloud-arena-permanent-button.is-targetable::before {
        content: "";
        position: absolute;
        inset: -0.45rem;
        border-radius: 22px;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.22), transparent 58%),
          radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.12), transparent 68%);
        filter: blur(6px);
        opacity: 0.95;
      }

      .cloud-arena-permanent-button.is-targetable:hover {
        box-shadow:
          0 0 0 2px rgba(37, 99, 235, 0.62),
          0 0 0 10px rgba(59, 130, 246, 0.3),
          0 0 0 18px rgba(96, 165, 250, 0.18),
          0 22px 38px rgba(28, 23, 19, 0.18);
      }

      .cloud-arena-permanent-button.is-targetable-enemy {
        border-radius: 18px;
        box-shadow:
          0 0 0 2px rgba(185, 28, 28, 0.52),
          0 0 0 8px rgba(248, 113, 113, 0.22),
          0 0 0 16px rgba(251, 146, 60, 0.12),
          0 18px 34px rgba(28, 23, 19, 0.16);
        animation: cloudArenaTargetPulseRed 1.45s ease-in-out infinite;
      }

      .cloud-arena-permanent-button.is-targetable-enemy::before {
        content: "";
        position: absolute;
        inset: -0.45rem;
        border-radius: 22px;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 50%, rgba(248, 113, 113, 0.22), transparent 58%),
          radial-gradient(circle at 50% 50%, rgba(185, 28, 28, 0.12), transparent 68%);
        filter: blur(6px);
        opacity: 0.95;
      }

      .cloud-arena-permanent-button.is-targetable-enemy:hover {
        box-shadow:
          0 0 0 2px rgba(185, 28, 28, 0.62),
          0 0 0 10px rgba(248, 113, 113, 0.3),
          0 0 0 18px rgba(251, 146, 60, 0.18),
          0 22px 38px rgba(28, 23, 19, 0.18);
      }

      .trace-viewer-battlefield-slot {
        position: relative;
        width: var(--display-card-width);
        scroll-snap-align: start;
      }

      .cloud-arena-battlefield-piece-stack {
        position: relative;
        display: grid;
        z-index: 2;
        justify-items: center;
        width: 100%;
      }

      .cloud-arena-battlefield-piece-stack.is-action-menu-open {
        z-index: 6;
      }

      .cloud-arena-battlefield-piece-stack.is-raised .cloud-arena-permanent-button {
        z-index: 8;
      }

      .cloud-arena-battlefield-blocker-stack {
        position: relative;
        z-index: 3;
        display: grid;
        justify-items: center;
        width: 100%;
        margin-top: -50%;
        pointer-events: auto;
      }

      .cloud-arena-battlefield-blocker-card-shell {
        position: relative;
        width: 100%;
      }

      .cloud-arena-battlefield-blocker-card-shell + .cloud-arena-battlefield-blocker-card-shell {
        margin-top: -35%;
      }

      .cloud-arena-battlefield-attachment-stack {
        position: relative;
        z-index: 1;
        display: grid;
        justify-items: center;
        width: 100%;
        margin-top: -100%;
        pointer-events: auto;
      }

      .cloud-arena-battlefield-attachment-card-shell {
        position: relative;
        width: 100%;
      }

      .cloud-arena-battlefield-attachment-card {
        transform: scale(0.965);
        transform-origin: top center;
        filter: saturate(0.94) brightness(0.98);
        opacity: 0.97;
      }

      .cloud-arena-battlefield-attachment-card-shell + .cloud-arena-battlefield-attachment-card-shell {
        margin-top: -100%;
      }

      .cloud-arena-battlefield-active-attachment-overlay {
        position: absolute;
        inset: 0;
        z-index: 5;
        display: grid;
        justify-items: center;
        pointer-events: auto;
      }

      .cloud-arena-battlefield-action-play-overlay {
        position: absolute;
        inset: 0;
        z-index: 6;
        display: grid;
        justify-items: center;
        align-items: end;
        pointer-events: none;
        opacity: 1;
        transform: translateY(50%) scale(1);
        transition:
          opacity 320ms ease,
          transform 320ms ease;
      }

      .cloud-arena-battlefield-action-play-overlay.is-interactive {
        pointer-events: auto;
        cursor: pointer;
      }

      .cloud-arena-battlefield-action-play-overlay.is-fading {
        opacity: 0;
        transform: translateY(-0.35rem) scale(0.99);
      }

      .cloud-arena-battlefield-action-play-overlay-card {
        width: var(--display-card-width);
        max-width: var(--display-card-width);
        box-shadow:
          0 24px 42px rgba(20, 15, 10, 0.24),
          0 0 0 1px rgba(255, 255, 255, 0.18);
      }

      .trace-viewer-battlefield-slot.is-player-side.is-attacking .trace-viewer-battlefield-card {
        animation: cloudArenaBattleAttackRight 420ms ease-out both;
        transform-origin: 32% 84%;
      }

      .trace-viewer-battlefield-slot.is-enemy-side.is-attacking .trace-viewer-battlefield-card {
        animation: cloudArenaBattleAttackLeft 420ms ease-out both;
        transform-origin: 68% 84%;
      }

      .trace-viewer-battlefield-slot.is-player-side.is-attacking .cloud-arena-permanent-button {
        animation: cloudArenaBattleAttackRight 420ms ease-out both;
        transform-origin: 32% 84%;
        will-change: transform, filter;
        z-index: 2;
      }

      .trace-viewer-battlefield-slot.is-enemy-side.is-attacking .cloud-arena-permanent-button {
        animation: cloudArenaBattleAttackLeft 420ms ease-out both;
        transform-origin: 68% 84%;
        will-change: transform, filter;
        z-index: 2;
      }

      .trace-viewer-battlefield-slot.is-attacking .trace-viewer-battlefield-card {
        will-change: transform, filter;
        transform-origin: 50% 84%;
      }

      .trace-viewer-battlefield-slot.is-hit .trace-viewer-battlefield-card {
        animation: cloudArenaBattleHit 260ms ease-out both;
        transform-origin: 50% 84%;
      }

      .cloud-arena-permanent-death-overlay {
        position: absolute;
        inset: 0;
        z-index: 3;
        display: grid;
        place-items: start;
        pointer-events: none;
      }

      .cloud-arena-permanent-death-card {
        animation: cloudArenaBattleDeath 760ms ease-out both;
        transform-origin: 50% 72%;
        filter: saturate(0.88) brightness(1.02);
      }

      .cloud-arena-permanent-death-card .card-face {
        box-shadow:
          0 12px 18px rgba(28, 23, 19, 0.12),
          inset 0 0 0 3px rgba(14, 11, 9, 0.92),
          inset 0 0 0 2px var(--card-highlight),
          inset 0 0 0 4px rgba(255, 255, 255, 0.14);
      }

      @keyframes cloudArenaBattleAttackRight {
        0% {
          transform: translateY(0) scale(1) rotate(0deg);
          filter: saturate(1);
        }

        18% {
          transform: translate(4px, -4px) scale(1.02) rotate(-1deg);
          filter: saturate(1.1) brightness(1.04);
        }

        42% {
          transform: translate(28px, -14px) scale(1.11) rotate(-5deg);
          filter: saturate(1.18) brightness(1.1);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.14), 0 24px 34px rgba(28, 23, 19, 0.18);
        }

        68% {
          transform: translate(12px, -6px) scale(1.04) rotate(-2deg);
        }

        100% {
          transform: translateY(0) scale(1) rotate(0deg);
          filter: saturate(1);
          box-shadow: none;
        }
      }

      @keyframes cloudArenaBattleAttackLeft {
        0% {
          transform: translateY(0) scale(1) rotate(0deg);
          filter: saturate(1);
        }

        18% {
          transform: translate(-4px, -4px) scale(1.02) rotate(1deg);
          filter: saturate(1.1) brightness(1.04);
        }

        42% {
          transform: translate(-28px, -14px) scale(1.11) rotate(5deg);
          filter: saturate(1.18) brightness(1.1);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.14), 0 24px 34px rgba(28, 23, 19, 0.18);
        }

        68% {
          transform: translate(-12px, -6px) scale(1.04) rotate(2deg);
        }

        100% {
          transform: translateY(0) scale(1) rotate(0deg);
          filter: saturate(1);
          box-shadow: none;
        }
      }

      @keyframes cloudArenaBattleHit {
        0% {
          transform: translateX(0) scale(1);
          filter: brightness(1) saturate(1);
          box-shadow: none;
        }

        18% {
          transform: translateX(-4px) scale(0.995);
          filter: brightness(1.1) saturate(1.12);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
        }

        36% {
          transform: translateX(4px) scale(1.01);
        }

        54% {
          transform: translateX(-2px) scale(0.998);
        }

        72% {
          transform: translateX(1px) scale(1.005);
        }

        100% {
          transform: translateX(0) scale(1);
          filter: brightness(1) saturate(1);
          box-shadow: none;
        }
      }

      @keyframes cloudArenaBattleDeath {
        0% {
          transform: translateY(0) scale(1) rotate(0deg);
          opacity: 1;
          filter: saturate(1) brightness(1);
        }

        35% {
          transform: translateY(4px) scale(0.985) rotate(-1deg);
          opacity: 0.9;
          filter: saturate(0.88) brightness(1.06);
        }

        68% {
          transform: translateY(18px) scale(0.9) rotate(-4deg);
          opacity: 0.38;
          filter: saturate(0.6) brightness(0.95) blur(0.6px);
        }

        100% {
          transform: translateY(28px) scale(0.78) rotate(-6deg);
          opacity: 0;
          filter: saturate(0.45) brightness(0.9) blur(1px);
        }
      }

      @keyframes cloudArenaTargetPulse {
        0%,
        100% {
          transform: scale(1);
          filter: saturate(1.02) brightness(1);
        }

        50% {
          transform: scale(1.012);
          filter: saturate(1.12) brightness(1.04);
        }
      }

      @keyframes cloudArenaTargetPulseRed {
        0%,
        100% {
          transform: scale(1);
          filter: saturate(1.02) brightness(1);
        }

        50% {
          transform: scale(1.012);
          filter: saturate(1.16) brightness(1.05);
        }
      }

      @keyframes cloudArenaHealthDropPulse {
        0% {
          transform: translateY(0) scale(1);
          filter: saturate(1) brightness(1);
        }

        22% {
          transform: translateY(0.25rem) scale(0.985);
          filter: saturate(1.15) brightness(1.12);
        }

        50% {
          transform: translateY(-0.12rem) scale(1.012);
          filter: saturate(1.22) brightness(1.18);
        }

        100% {
          transform: translateY(0) scale(1);
          filter: saturate(1) brightness(1);
        }
      }

      @keyframes cloudArenaHealthRisePulse {
        0% {
          transform: translateY(0) scale(1);
          filter: saturate(1) brightness(1);
        }

        22% {
          transform: translateY(-0.25rem) scale(1.015);
          filter: saturate(1.2) brightness(1.15);
        }

        50% {
          transform: translateY(0.12rem) scale(0.992);
          filter: saturate(1.26) brightness(1.2);
        }

        100% {
          transform: translateY(0) scale(1);
          filter: saturate(1) brightness(1);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .trace-viewer-battlefield-slot.is-attacking .trace-viewer-battlefield-card,
        .trace-viewer-battlefield-slot.is-hit .trace-viewer-battlefield-card,
        .cloud-arena-permanent-death-card,
        .cloud-arena-start-rift,
        .cloud-arena-start-menu-item.is-primary,
        .cloud-arena-start-press-start::after,
        .cloud-arena-permanent-button.is-targetable,
        .cloud-arena-permanent-button.is-targetable-enemy,
        .display-card-shell.is-targetable,
        .display-card-shell.is-targetable-enemy,
        .display-card-shell.is-health-dropping,
        .display-card-shell.is-health-rising,
        .cloud-arena-hud-card.is-health-dropping,
        .cloud-arena-hud-card.is-health-rising,
        .cloud-arena-hand-hud.is-health-dropping,
        .cloud-arena-hand-hud.is-health-rising {
          animation: none;
        }
      }

      .cloud-arena-permanent-intent-bubble {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        max-width: 100%;
        padding: 0.2rem 0.52rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.16);
        background: linear-gradient(180deg, rgba(255, 250, 243, 0.98), rgba(249, 239, 222, 0.94));
        color: var(--ink);
        font-size: 0.68rem;
        font-weight: 800;
        line-height: 1;
        letter-spacing: 0.05em;
        box-shadow: 0 10px 18px rgba(98, 57, 18, 0.08);
        flex-wrap: wrap;
      }

      .cloud-arena-permanent-intent-bubble.is-attack {
        border-color: rgba(185, 28, 28, 0.2);
        background: linear-gradient(180deg, rgba(239, 68, 68, 0.98), rgba(185, 28, 28, 0.94));
        color: #fff;
      }

      .cloud-arena-permanent-intent-bubble.is-spawn {
        border-color: rgba(180, 83, 9, 0.18);
        background: linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(254, 240, 138, 0.42));
      }

      .cloud-arena-permanent-intent-bubble.is-block {
        border-color: rgba(37, 99, 235, 0.18);
        background: linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(219, 234, 254, 0.92));
      }

      .cloud-arena-permanent-intent-bubble.is-power {
        border-color: rgba(22, 163, 74, 0.18);
        background: linear-gradient(180deg, rgba(240, 253, 244, 0.98), rgba(220, 252, 231, 0.92));
      }

      .cloud-arena-permanent-intent-bubble.is-neutral {
        border-color: rgba(95, 84, 76, 0.14);
        background: linear-gradient(180deg, rgba(255, 251, 246, 0.98), rgba(245, 238, 228, 0.94));
      }

      .cloud-arena-permanent-intent-badge {
        display: grid;
        place-items: center;
        width: 1.1rem;
        height: 1.1rem;
        border-radius: 4px;
        background: linear-gradient(180deg, #ef4444, #b91c1c);
        color: #fff;
        font-size: 0.72rem;
        font-weight: 900;
        line-height: 1;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
      }

      .cloud-arena-permanent-intent-label,
      .cloud-arena-permanent-intent-detail {
        min-width: 0;
      }

      .cloud-arena-permanent-intent-detail {
        font-size: 0.62rem;
        opacity: 0.88;
      }

      .cloud-arena-permanent-intent-bubble.is-attack .cloud-arena-permanent-intent-detail {
        opacity: 0.82;
      }

      .cloud-arena-permanent-button:focus-visible {
        outline: 3px solid rgba(154, 52, 18, 0.3);
        outline-offset: 4px;
        border-radius: 18px;
      }

      .cloud-arena-permanent-action-face {
        position: relative;
        z-index: 7;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr) auto;
        gap: 0.8rem;
        width: 100%;
        aspect-ratio: 5 / 7;
        container-type: inline-size;
        padding: clamp(0.75rem, 4cqw, 1rem);
        border: 3px solid rgba(10, 8, 7, 0.96);
        border-radius: clamp(16px, 6cqw, 22px);
        background: rgba(255, 251, 246, 0.94);
        box-shadow:
          0 12px 24px rgba(28, 23, 19, 0.1),
          inset 0 0 0 1px rgba(255, 255, 255, 0.62);
      }

      .cloud-arena-permanent-action-face-header {
        display: flex;
        align-items: center;
        min-width: 0;
        padding-bottom: 0.55rem;
        border-bottom: 1px solid rgba(95, 84, 76, 0.18);
      }

      .cloud-arena-permanent-action-face-header h3 {
        margin: 0;
        min-width: 0;
        overflow: hidden;
        color: rgba(29, 23, 18, 0.96);
        font-size: clamp(0.86rem, 5cqw, 1.08rem);
        font-weight: 800;
        line-height: 1.18;
        text-overflow: ellipsis;
      }

      .cloud-arena-permanent-action-face-rules {
        min-height: 0;
        overflow: hidden;
      }

      .cloud-arena-permanent-action-face-list {
        display: grid;
        align-content: start;
        gap: clamp(0.42rem, 2.5cqw, 0.62rem);
        min-height: 0;
        max-height: 100%;
        overflow-y: auto;
      }

      .cloud-arena-permanent-menu-button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.6rem;
        min-height: clamp(1.85rem, 8cqw, 2.25rem);
        padding: clamp(0.36rem, 1.9cqw, 0.55rem) clamp(0.45rem, 2.4cqw, 0.7rem);
        border-radius: clamp(8px, 3cqw, 11px);
        border: 1px solid rgba(14, 11, 9, 0.16);
        background: rgba(255, 255, 255, 0.55);
        color: var(--ink);
        font: inherit;
        font-size: clamp(0.62rem, 3.2cqw, 0.82rem);
        font-weight: 700;
        text-align: left;
        cursor: pointer;
        white-space: nowrap;
      }

      .cloud-arena-permanent-menu-button:hover:enabled {
        border-color: rgba(154, 52, 18, 0.26);
        background: rgba(255, 247, 237, 0.96);
      }

      .cloud-arena-permanent-menu-button:disabled {
        opacity: 0.58;
        cursor: default;
      }

      .cloud-arena-permanent-menu-button-label {
        min-width: 0;
        white-space: nowrap;
      }

      .cloud-arena-permanent-action-face-back {
        justify-content: center;
      }

      .cloud-arena-ability-cost-chip {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.18rem;
        min-width: 1.45rem;
        padding: 0.12rem 0.45rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.18);
        background: rgba(255, 255, 255, 0.88);
        color: var(--ink);
        font-size: 0.68rem;
        font-weight: 800;
        line-height: 1;
        letter-spacing: 0.01em;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .cloud-arena-ability-cost-chip-part {
        display: inline-flex;
        align-items: center;
        gap: 0.18rem;
      }

      .cloud-arena-ability-cost-chip-separator {
        color: rgba(95, 84, 76, 0.88);
      }

      .cloud-arena-ability-cost-chip-icon {
        display: inline-grid;
        place-items: center;
        width: 0.9rem;
        height: 0.9rem;
      }

      .cloud-arena-ability-cost-chip-icon img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .cloud-arena-hand-card {
        --card-title-size: clamp(0.64rem, 2.3cqw, 0.9rem);
      }

      .cloud-arena-empty-slot {
        min-height: 16rem;
        place-content: center;
        text-align: center;
      }

      @media (max-width: 959px) {
        .cloud-arena-hand-tray {
          height: auto;
        }

        .cloud-arena-hand-tray-layout {
          grid-template-columns: minmax(0, 1fr);
        }

        .trace-viewer-hand-scroll {
          --hand-card-hover-rise: 6px;
          --hand-card-selected-rise: 260px;
          --hand-card-stack-x-scale: 0.7;
          --hand-card-stack-y-scale: 0.82;
          --hand-card-stack-tilt-scale: 0.8;
          min-height: calc(var(--display-card-width) * 1.24 + 18px);
        }

        .cloud-arena-hand-hud {
          width: min(100%, 22rem);
          min-height: 0;
        }

        .cloud-arena-pile-modal {
          width: min(98vw, 58rem);
          height: min(92dvh, 58rem);
        }

        .cloud-arena-pile-modal-grid {
          grid-template-columns: repeat(auto-fit, minmax(min(13rem, 44vw), 1fr));
        }

      }

      @media (max-width: 639px) {
        .cloud-arena-hand-tray {
          height: auto;
        }

        .trace-viewer-hand-scroll {
          --hand-card-hover-rise: 5px;
          --hand-card-selected-rise: 260px;
          --hand-card-stack-x-scale: 0.55;
          --hand-card-stack-y-scale: 0.72;
          --hand-card-stack-tilt-scale: 0.68;
          min-height: calc(var(--display-card-width) * 1.12 + 16px);
        }
      }

      .trace-viewer-card {
        display: grid;
        gap: 0.35rem;
        padding: 0.8rem 0.85rem;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.74);
      }

      .display-card {
        display: grid;
        gap: 0.7rem;
        min-width: 0;
      }

      .display-card-header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.75rem;
      }

      .display-card-nameblock {
        display: grid;
        gap: 0.18rem;
        min-width: 0;
      }

      .display-card-nameblock strong {
        font-size: 1.05rem;
        line-height: 1.2;
      }

      .display-card-nameblock span,
      .display-card-subtitle,
      .display-card-meta {
        color: var(--muted);
      }

      .display-card-subtitle,
      .display-card-meta {
        font-size: 0.88rem;
      }

      .display-card-meta {
        text-align: right;
      }

      .display-card-art-shell {
        display: grid;
        place-items: center;
        min-height: 7.5rem;
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(130, 94, 52, 0.14);
        background:
          radial-gradient(circle at top, rgba(251, 191, 36, 0.18), transparent 58%),
          linear-gradient(135deg, rgba(255, 248, 235, 0.96), rgba(239, 226, 195, 0.9));
      }

      .display-card-art-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .display-card-art-fallback {
        padding: 1rem;
        text-align: center;
        color: var(--muted);
      }

      .display-card-art-fallback strong {
        color: var(--ink);
      }

      .display-card-art-fallback-player {
        background:
          radial-gradient(circle at top, rgba(34, 197, 94, 0.18), transparent 55%),
          linear-gradient(160deg, rgba(245, 255, 248, 0.95), rgba(221, 242, 228, 0.92));
      }

      .display-card-art-fallback-enemy {
        background:
          radial-gradient(circle at top, rgba(220, 38, 38, 0.2), transparent 55%),
          linear-gradient(160deg, rgba(255, 245, 245, 0.95), rgba(248, 219, 219, 0.9));
      }

      .display-card-art-fallback-permanent {
        background:
          radial-gradient(circle at top, rgba(59, 130, 246, 0.16), transparent 55%),
          linear-gradient(160deg, rgba(245, 249, 255, 0.95), rgba(222, 232, 248, 0.9));
      }

      .display-card-badges,
      .display-card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.45rem;
      }

      .display-card-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.28rem 0.52rem;
        border-radius: 999px;
        background: rgba(154, 52, 18, 0.08);
        color: var(--muted);
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }

      .display-card-stats {
        display: grid;
        gap: 0.45rem;
        grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
      }

      .display-card-stat {
        display: grid;
        gap: 0.16rem;
        padding: 0.55rem 0.7rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.68);
      }

      .display-card-stat span {
        color: var(--muted);
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .display-card-text {
        display: grid;
        gap: 0.4rem;
      }

      .display-card-text-block {
        margin: 0;
        color: var(--ink);
      }

      .display-card-text-flavor {
        color: var(--muted);
        font-style: italic;
      }

      .display-card-action {
        min-height: 2.2rem;
      }

      .display-card-action-primary {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.18), rgba(154, 52, 18, 0.12));
        border-color: rgba(154, 52, 18, 0.2);
      }

      .display-card-shell {
        display: grid;
        gap: 0.4rem;
      }

      .display-card-shell.is-inspector-current {
        position: relative;
        border-radius: 22px;
        filter: saturate(1.05) brightness(1.02);
        box-shadow:
          0 0 0 2px rgba(249, 115, 22, 0.34),
          0 0 0 8px rgba(251, 191, 36, 0.12),
          0 14px 28px rgba(249, 115, 22, 0.12);
      }

      .display-card-shell.is-inspector-current::before {
        content: "";
        position: absolute;
        inset: -0.45rem;
        border-radius: 24px;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.14), transparent 64%),
          radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.1), transparent 78%);
        filter: blur(8px);
        opacity: 0.9;
      }

      .display-card-shell.is-inspector-current .card-face {
        box-shadow:
          0 10px 24px rgba(28, 23, 19, 0.08),
          inset 0 0 0 3px rgba(14, 11, 9, 0.92),
          inset 0 0 0 2px rgba(255, 220, 170, 0.88),
          inset 0 0 0 4px rgba(255, 255, 255, 0.24);
      }

      .display-card-shell.is-targetable {
        position: relative;
        border-radius: 22px;
        box-shadow:
          0 0 0 2px rgba(37, 99, 235, 0.48),
          0 0 0 8px rgba(59, 130, 246, 0.18),
          0 0 0 16px rgba(96, 165, 250, 0.1);
        animation: cloudArenaTargetPulse 1.45s ease-in-out infinite;
      }

      .display-card-shell.is-targetable::before {
        content: "";
        position: absolute;
        inset: -0.4rem;
        border-radius: 24px;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 50%, rgba(96, 165, 250, 0.24), transparent 62%),
          radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.12), transparent 74%);
        filter: blur(8px);
        opacity: 0.95;
      }

      .display-card-shell.is-targetable .card-face {
        box-shadow:
          0 10px 24px rgba(28, 23, 19, 0.08),
          inset 0 0 0 3px rgba(14, 11, 9, 0.92),
          inset 0 0 0 2px rgba(167, 206, 255, 0.82),
          inset 0 0 0 4px rgba(255, 255, 255, 0.22);
      }

      .display-card-shell.is-targetable-enemy {
        position: relative;
        border-radius: 22px;
        box-shadow:
          0 0 0 2px rgba(185, 28, 28, 0.48),
          0 0 0 8px rgba(248, 113, 113, 0.18),
          0 0 0 16px rgba(251, 146, 60, 0.1);
        animation: cloudArenaTargetPulseRed 1.45s ease-in-out infinite;
      }

      .display-card-shell.is-targetable-enemy::before {
        content: "";
        position: absolute;
        inset: -0.4rem;
        border-radius: 24px;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 50%, rgba(248, 113, 113, 0.24), transparent 62%),
          radial-gradient(circle at 50% 50%, rgba(185, 28, 28, 0.12), transparent 74%);
        filter: blur(8px);
        opacity: 0.95;
      }

      .display-card-shell.is-targetable-enemy .card-face {
        box-shadow:
          0 10px 24px rgba(28, 23, 19, 0.08),
          inset 0 0 0 3px rgba(14, 11, 9, 0.92),
          inset 0 0 0 2px rgba(255, 185, 185, 0.8),
          inset 0 0 0 4px rgba(255, 255, 255, 0.22);
      }

      .display-card-shell.is-health-dropping {
        position: relative;
        border-radius: 22px;
        outline: 2px solid rgba(248, 113, 113, 0.42);
        animation: cloudArenaHealthDropPulse 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .display-card-shell.is-health-rising {
        position: relative;
        border-radius: 22px;
        outline: 2px solid rgba(74, 222, 128, 0.42);
        animation: cloudArenaHealthRisePulse 720ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      .display-card-shell.is-health-dropping::before {
        content: "";
        position: absolute;
        inset: -0.6rem;
        border-radius: 24px;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 50%, rgba(248, 113, 113, 0.34), transparent 55%),
          radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.18), transparent 72%);
        filter: blur(12px);
        opacity: 1;
      }

      .display-card-shell.is-health-rising::before {
        content: "";
        position: absolute;
        inset: -0.6rem;
        border-radius: 24px;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 50%, rgba(74, 222, 128, 0.32), transparent 55%),
          radial-gradient(circle at 50% 50%, rgba(22, 163, 74, 0.18), transparent 72%);
        filter: blur(12px);
        opacity: 1;
      }

      .display-card-shell.is-health-dropping .trace-viewer-health-bar {
        box-shadow:
          0 0 0 2px rgba(220, 38, 38, 0.5),
          0 0 0 10px rgba(248, 113, 113, 0.24),
          0 0 28px rgba(248, 113, 113, 0.42);
      }

      .display-card-shell.is-health-dropping .trace-viewer-health-bar-fill {
        filter: saturate(1.3) brightness(1.22);
        box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.3), 0 0 14px rgba(248, 113, 113, 0.32);
      }

      .display-card-shell.is-health-rising .trace-viewer-health-bar {
        box-shadow:
          0 0 0 2px rgba(22, 163, 74, 0.5),
          0 0 0 10px rgba(74, 222, 128, 0.24),
          0 0 28px rgba(74, 222, 128, 0.42);
      }

      .display-card-shell.is-health-rising .trace-viewer-health-bar-fill {
        filter: saturate(1.28) brightness(1.18);
        box-shadow: 0 0 0 1px rgba(74, 222, 128, 0.3), 0 0 14px rgba(74, 222, 128, 0.32);
      }

      .display-card-shell.is-exhausted {
        position: relative;
        filter: grayscale(0.9) saturate(0.72) brightness(0.94) contrast(0.92);
        box-shadow:
          inset 0 0 0 1px rgba(120, 94, 62, 0.18),
          0 10px 24px rgba(98, 57, 18, 0.08);
      }

      .display-card-shell.is-exhausted::after,
      .display-card-shell.is-tapped::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background:
          linear-gradient(180deg, rgba(120, 94, 62, 0.1), rgba(120, 94, 62, 0.03)),
          repeating-linear-gradient(135deg, rgba(120, 94, 62, 0.08) 0 0.45rem, transparent 0.45rem 0.95rem);
        box-shadow: inset 0 0 0 1px rgba(120, 94, 62, 0.12);
      }

      .display-card-shell.is-tapped {
        position: relative;
        filter: grayscale(0.9) saturate(0.72) brightness(0.94) contrast(0.92);
        box-shadow:
          inset 0 0 0 1px rgba(120, 94, 62, 0.18),
          0 10px 24px rgba(98, 57, 18, 0.08);
      }

      .display-card-character-layout {
        display: grid;
        grid-template-columns: minmax(0, var(--display-card-width)) minmax(12rem, 1fr);
        align-items: start;
        gap: 1.15rem;
      }

      .display-card-character-layout-enemy {
        grid-template-columns: minmax(12rem, 1fr) minmax(0, var(--display-card-width));
      }

      .display-card-enemy-stack {
        display: grid;
        gap: 0.55rem;
      }

      .display-card-main-column {
        display: grid;
        gap: 0.4rem;
        min-width: 0;
      }

      .display-card-shell {
        position: relative;
        overflow: visible;
      }

      .display-card-static-face {
        display: block;
      }

      .card-face-keyword-trigger {
        display: inline-flex;
        align-items: baseline;
        border-radius: 0.2rem;
        cursor: help;
      }

      .card-face-keyword-trigger,
      .card-face-keyword-trigger strong,
      .card-face-keyword-trigger span {
        text-decoration: none;
      }

      .card-face-keyword-trigger:hover,
      .card-face-keyword-trigger:focus-visible {
        text-decoration: none;
      }

      .card-face-keyword-trigger:focus-visible {
        outline: 2px solid rgba(154, 52, 18, 0.36);
        outline-offset: 2px;
      }

      .display-card-keyword-tooltip {
        position: absolute;
        top: 0.5rem;
        left: calc(100% + 0.65rem);
        z-index: 40;
        display: grid;
        gap: 0.45rem;
        width: min(15rem, 72vw);
        padding: 0.65rem 0.75rem;
        border: 1px solid rgba(95, 74, 36, 0.24);
        border-radius: 8px;
        background: rgba(255, 252, 246, 0.97);
        box-shadow: 0 12px 28px rgba(55, 31, 8, 0.18);
        opacity: 0;
        pointer-events: none;
        transform: translateX(-0.2rem);
        transition: opacity 120ms ease, transform 120ms ease;
      }

      .display-card-keyword-tooltip.is-visible {
        opacity: 1;
        transform: translateX(0);
      }

      .display-card-keyword-tooltip-list {
        display: grid;
        gap: 0.45rem;
      }

      .display-card-keyword-tooltip-entry {
        display: grid;
        gap: 0.14rem;
        color: #3d2d17;
        font-size: 0.76rem;
        line-height: 1.2;
      }

      .display-card-keyword-tooltip-entry.is-active strong {
        color: var(--accent);
      }

      .display-card-keyword-tooltip-entry strong {
        font-size: 0.78rem;
      }

      .display-card-actions-inline,
      .display-card-badges-inline {
        display: inline-flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 0.45rem;
      }

      .display-card-stat-row {
        margin-top: 0.2rem;
      }

      .display-card-health-panel {
        display: grid;
        gap: 0.3rem;
        padding: 0.5rem 0.65rem;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.62);
      }

      .display-card-health-panel.is-defending {
        border-color: rgba(37, 99, 235, 0.22);
        background:
          radial-gradient(circle at top left, rgba(147, 197, 253, 0.34), transparent 56%),
          linear-gradient(180deg, rgba(239, 246, 255, 0.98), rgba(219, 234, 254, 0.92));
      }

      .display-card-player > .display-card-character-layout > .display-card-health-panel,
      .display-card-enemy > .display-card-character-layout > .display-card-health-panel {
        align-self: stretch;
        min-height: 100%;
        align-content: end;
      }

      .display-card-enemy-stack > .display-card-health-panel {
        width: 100%;
      }

      .display-card-energy-panel {
        display: grid;
        gap: 0.35rem;
      }

      .display-card-energy-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.65rem;
      }

      .display-card-energy-label {
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .display-card-energy-orb {
        display: inline-grid;
        place-items: center;
        min-width: 3rem;
        min-height: 3rem;
        padding: 0.3rem 0.4rem;
        border-radius: 999px;
        border: 1px solid rgba(161, 98, 7, 0.34);
        background:
          radial-gradient(circle at 30% 28%, rgba(255, 255, 255, 0.72), transparent 34%),
          linear-gradient(180deg, #fef08a, #facc15 58%, #eab308);
        color: #422006;
        box-shadow:
          inset 0 1px 1px rgba(255, 255, 255, 0.45),
          0 10px 18px rgba(202, 138, 4, 0.2);
      }

      .display-card-energy-orb strong {
        font-size: 0.92rem;
        font-weight: 900;
        letter-spacing: 0.01em;
        line-height: 1;
      }

      .display-card-health-strip {
        display: grid;
        align-items: center;
        gap: 0.65rem;
      }

      .display-card-health-panel.is-defending .display-card-health-strip {
        align-items: stretch;
      }

      .display-card-health-meter {
        display: grid;
        gap: 0;
        width: 100%;
        min-width: 0;
      }

      .display-card-health-row {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        width: 100%;
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .display-card-health-row strong {
        flex: 0 0 auto;
        color: var(--ink);
        font-size: 0.9rem;
        letter-spacing: 0;
        text-transform: none;
      }

      .display-card-health-row .trace-viewer-health-bar {
        flex: 1 1 auto;
        min-width: 0;
        height: 0.65rem;
      }

      .display-card-info-button {
        flex: 0 0 auto;
        display: inline-grid;
        place-items: center;
        width: 1.35rem;
        height: 1.35rem;
        margin-left: 0.15rem;
        padding: 0;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.24);
        background: linear-gradient(180deg, rgba(255, 251, 245, 0.98), rgba(248, 236, 222, 0.96));
        color: var(--accent);
        box-shadow: 0 5px 10px rgba(98, 57, 18, 0.08);
        cursor: pointer;
      }

      .display-card-info-button span {
        font-size: 0.92rem;
        font-weight: 900;
        line-height: 1;
        transform: translateY(-0.02rem);
      }

      .display-card-info-button:hover {
        border-color: rgba(154, 52, 18, 0.38);
        background: linear-gradient(180deg, rgba(255, 247, 237, 1), rgba(249, 228, 200, 0.98));
      }

      .display-card-info-button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      .display-card-block-pill {
        display: grid;
        place-items: center;
        flex: 0 0 auto;
      }

      .display-card-block-inline {
        display: inline-flex;
        place-items: center;
        flex: 0 0 auto;
        margin-left: 0.15rem;
      }

      .display-card-block-icon {
        position: relative;
        display: grid;
        place-items: center;
        width: 2.7rem;
        height: 3rem;
        color: #f6efe1;
        font-weight: 800;
        font-size: 1rem;
        line-height: 1;
        background: linear-gradient(180deg, #8b97a8, #667384);
        border: 1px solid rgba(37, 48, 63, 0.28);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          0 6px 14px rgba(37, 48, 63, 0.12);
        clip-path: polygon(50% 0%, 90% 14%, 90% 58%, 50% 100%, 10% 58%, 10% 14%);
      }

      .display-card-block-icon.is-enemy {
        color: #eff6ff;
        background:
          radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.34), transparent 32%),
          linear-gradient(180deg, #60a5fa, #2563eb 58%, #1d4ed8);
        border-color: rgba(37, 99, 235, 0.45);
        box-shadow:
          inset 0 1px 1px rgba(255, 255, 255, 0.34),
          0 10px 16px rgba(37, 99, 235, 0.28);
      }

      .display-card-block-icon.is-inline {
        width: 1.6rem;
        height: 1.72rem;
        font-size: 0.78rem;
        box-shadow:
          inset 0 1px 1px rgba(255, 255, 255, 0.26),
          0 6px 10px rgba(37, 99, 235, 0.18);
      }

      .display-card-block-value {
        transform: translateY(-0.06rem);
      }

      .display-card-intent-banner {
        padding: 0.5rem 0.65rem;
        border-radius: 12px;
        border: 1px solid rgba(185, 28, 28, 0.18);
        background: linear-gradient(180deg, rgba(254, 242, 242, 0.96), rgba(254, 226, 226, 0.9));
        color: #991b1b;
        font-size: 0.9rem;
        font-weight: 700;
        line-height: 1.35;
      }

      @media (max-width: 959px) {
        .display-card-character-layout,
        .display-card-character-layout-enemy {
          grid-template-columns: minmax(0, 1fr);
        }
      }

      .cloud-arena-summary-card {
        justify-self: stretch;
        width: 100%;
      }

      .cloud-arena-summary-card.display-card-player,
      .cloud-arena-summary-card.display-card-enemy {
        max-width: none;
      }

      .cloud-arena-summary-card.display-card-player.card-face-tile,
      .cloud-arena-summary-card.display-card-enemy.card-face-tile {
        width: 100%;
      }

      .cloud-arena-summary-card.display-card-player,
      .cloud-arena-summary-card.display-card-enemy {
        --card-title-size: clamp(0.68rem, 4.3cqw, 1.02rem);
      }

      .trace-viewer-hand-card.card-face-tile {
        min-height: 100%;
      }

      .cloud-arena-hand-tray {
        min-height: 0;
        height: auto;
        align-self: stretch;
        width: 100%;
        margin-top: auto;
      }

      .cloud-arena-hand-tray-layout {
        display: grid;
        grid-template-columns: minmax(20rem, 25rem) minmax(0, 1fr);
        gap: 0.5rem;
        min-height: 0;
        height: auto;
        align-items: start;
        align-content: end;
      }

      .cloud-arena-hand-hud {
        display: grid;
        gap: 0.55rem;
        align-self: start;
        align-content: start;
        min-height: 0;
        height: auto;
        min-width: 0;
        padding: 0.82rem;
        border: 1px solid rgba(130, 153, 190, 0.22);
        border-radius: 22px;
        background:
          radial-gradient(circle at top left, rgba(219, 234, 254, 0.92), transparent 42%),
          linear-gradient(180deg, rgba(243, 248, 255, 0.98), rgba(225, 235, 248, 0.94));
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.72),
          0 14px 34px rgba(55, 73, 110, 0.1);
      }

      .cloud-arena-hand-hud-header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 0.6rem;
      }

      .cloud-arena-hand-hud-header strong {
        font-size: 1.08rem;
        line-height: 1.15;
      }

      .cloud-arena-hand-hud-slot-count {
        flex-shrink: 0;
        padding: 0.22rem 0.48rem;
        border-radius: 999px;
        border: 1px solid rgba(30, 64, 175, 0.14);
        background: rgba(255, 255, 255, 0.7);
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }

      .cloud-arena-hand-hud-line {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: start;
        gap: 0.7rem;
      }

      .cloud-arena-hand-hud-track {
        display: grid;
        gap: 0.45rem;
        min-width: 0;
        flex: 1 1 auto;
        align-self: start;
      }

      .cloud-arena-hand-hud-block,
      .cloud-arena-hud-block {
        display: grid;
        place-items: center;
        align-self: start;
        min-width: 2.4rem;
        min-width: 2.7rem;
        min-height: 2.85rem;
        padding: 0.32rem 0.3rem 0.42rem;
        border-radius: 0;
        border: 1px solid rgba(30, 64, 175, 0.2);
        background: linear-gradient(180deg, rgba(96, 165, 250, 0.96), rgba(37, 99, 235, 0.96));
        color: #f8fbff;
        box-shadow: 0 14px 28px rgba(37, 99, 235, 0.18);
        clip-path: polygon(50% 0%, 86% 10%, 100% 34%, 93% 74%, 50% 100%, 7% 74%, 0% 34%, 14% 10%);
      }

      .cloud-arena-hand-hud-health-bar {
        display: block;
        width: 100%;
        height: 0.82rem;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(148, 163, 184, 0.18);
        border: 1px solid rgba(148, 163, 184, 0.16);
      }

      .cloud-arena-hand-hud-health-bar-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #b91c1c, #ef4444);
      }

      .cloud-arena-hand-hud-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 0.8rem;
        color: var(--ink);
        font-size: 0.88rem;
        font-weight: 700;
      }

      .cloud-arena-hand-hud-piles {
        display: grid;
        gap: 0.45rem;
        align-content: start;
      }

      .cloud-arena-hand-hud-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.2rem;
      }

      .cloud-arena-hand-hud-pile-button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.8rem;
        min-height: 1.95rem;
        padding: 0.36rem 0.62rem;
        border-radius: 12px;
        border: 1px solid rgba(154, 52, 18, 0.16);
        background: rgba(255, 255, 255, 0.76);
        color: var(--ink);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        text-align: left;
      }

      .cloud-arena-hand-hud-pile-button strong {
        min-width: 1.55rem;
        text-align: right;
      }

      .cloud-arena-hand-hud-end-turn-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.6rem;
        min-width: 9.2rem;
        min-height: 2.45rem;
        padding: 0.46rem 0.92rem;
        border-radius: 14px;
        border: 1px solid rgba(154, 52, 18, 0.22);
        background: linear-gradient(180deg, rgba(255, 251, 235, 0.98), rgba(255, 237, 213, 0.96));
        color: var(--accent-strong);
        font: inherit;
        font-weight: 800;
        letter-spacing: 0.02em;
        cursor: pointer;
        box-shadow: 0 10px 22px rgba(154, 52, 18, 0.12);
        transition:
          transform 140ms ease,
          box-shadow 140ms ease,
          border-color 140ms ease,
          background 140ms ease,
          color 140ms ease;
      }

      .cloud-arena-hand-hud-end-turn-button strong {
        color: var(--muted);
        font-size: 0.82rem;
        letter-spacing: 0.08em;
      }

      .cloud-arena-hand-hud-end-turn-button:hover:not(:disabled) {
        transform: translateY(-1px);
        border-color: rgba(154, 52, 18, 0.34);
        background: linear-gradient(180deg, rgba(255, 247, 237, 1), rgba(255, 228, 196, 0.98));
        box-shadow: 0 14px 28px rgba(154, 52, 18, 0.16);
      }

      .cloud-arena-hand-hud-end-turn-button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
      }

      .cloud-arena-hand-hud-end-turn-button:disabled {
        cursor: not-allowed;
        color: rgba(120, 113, 108, 0.84);
        background: rgba(255, 255, 255, 0.76);
        border-color: rgba(120, 113, 108, 0.18);
        box-shadow: none;
      }

      .cloud-arena-pile-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 120;
        display: grid;
        place-items: center;
        padding: 0.9rem;
        background: rgba(20, 15, 12, 0.52);
        backdrop-filter: blur(7px);
      }

      .cloud-arena-pile-modal {
        width: min(98vw, 92rem);
        height: min(92dvh, 62rem);
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 0.85rem;
        padding: 1.1rem;
      }

      .cloud-arena-pile-modal-header {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 1rem;
      }

      .cloud-arena-pile-modal-title {
        display: grid;
        gap: 0.15rem;
      }

      .cloud-arena-pile-modal-title strong {
        font-size: 1.05rem;
        letter-spacing: 0.01em;
      }

      .cloud-arena-pile-modal-title span {
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .cloud-arena-pile-modal-close {
        min-height: 2.25rem;
        padding: 0.42rem 0.8rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.2);
        background: rgba(255, 251, 246, 0.94);
        color: var(--accent);
        font: inherit;
        font-weight: 800;
        cursor: pointer;
      }

      .cloud-arena-pile-modal-scroll {
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 0.2rem;
      }

      .cloud-arena-pile-modal-grid {
        display: grid;
        gap: 0.85rem;
        width: 100%;
        grid-template-columns: repeat(auto-fill, minmax(min(16rem, 18vw), min(16rem, 18vw)));
        grid-auto-rows: max-content;
        justify-content: start;
        align-items: start;
      }

      .cloud-arena-pile-modal-card {
        max-width: none;
      }

      .cloud-arena-pile-modal-empty {
        display: grid;
        place-items: center;
        min-height: 10rem;
        border-radius: 18px;
        border: 1px dashed rgba(95, 84, 76, 0.24);
        background: rgba(255, 255, 255, 0.65);
        color: var(--muted);
        font-weight: 700;
      }

      .cloud-arena-hand-card-shell {
        flex: 0 0 auto;
        position: relative;
        z-index: var(--hand-card-stack-z, 0);
        padding-bottom: 0.9rem;
        scroll-snap-align: start;
        inset-inline-start: calc(
          var(--hand-card-stack-shift, 0rem) * var(--hand-card-stack-x-scale, 1) * var(--hand-card-stack-index, 0) * -1
        );
        margin-block-start: calc(var(--hand-card-stack-lift, 0rem) * var(--hand-card-stack-y-scale, 1));
        transform: translate3d(0, 0, 0)
          rotate(calc(var(--hand-card-stack-tilt, 0deg) * var(--hand-card-stack-tilt-scale, 1)));
        transform-origin: 50% 88%;
        transition:
          transform 180ms ease,
          filter 180ms ease;
        will-change: transform;
      }

      .cloud-arena-hand-card-shell:not(:hover):not(:focus-within):not(.is-selected) {
        transform:
          translate3d(0, var(--hand-card-rest-shift, 0px), 0)
          rotate(calc(var(--hand-card-stack-tilt, 0deg) * var(--hand-card-stack-tilt-scale, 1)));
      }

      .cloud-arena-hand-card-shell:hover,
      .cloud-arena-hand-card-shell:focus-within {
        z-index: 1000;
        filter: saturate(1.05) brightness(1.02);
        transform:
          translate3d(0, 0, 0)
          scale(1.01)
          rotate(0deg);
      }

      .cloud-arena-hand-card-shell.is-selected {
        z-index: 1400;
        filter: saturate(1.08) brightness(1.03);
        transform:
          translate3d(
            0,
            calc(
              var(--hand-card-stack-lift, 0rem) * -1.15
              - var(--hand-card-rest-shift, 0px)
              - var(--hand-card-selected-rise, 30rem)
            ),
            0
          )
          scale(1.05)
          rotate(0deg);
      }

      .cloud-arena-hand-card-shell.is-selected:hover,
      .cloud-arena-hand-card-shell.is-selected:focus-within {
        z-index: 1500;
        filter: saturate(1.1) brightness(1.05);
        transform:
          translate3d(
            0,
            calc(
              var(--hand-card-stack-lift, 0rem) * -1.15
              - var(--hand-card-rest-shift, 0px)
              - calc(var(--hand-card-selected-rise, 30rem) * 1.12)
            ),
            0
          )
          scale(1.08)
          rotate(0deg);
      }

      .cloud-arena-card-details-button {
        position: absolute;
        left: 50%;
        bottom: 0.1rem;
        transform: translateX(-50%);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 1.45rem;
        padding: 0.2rem 0.55rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.2);
        background: rgba(255, 251, 246, 0.92);
        color: var(--accent);
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(98, 57, 18, 0.08);
        white-space: nowrap;
        z-index: 3;
      }

      .cloud-arena-card-details-button:hover {
        color: var(--accent-strong);
        border-color: rgba(154, 52, 18, 0.3);
        background: rgba(255, 247, 237, 0.98);
      }

      .cloud-arena-card-details-button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
      }

      .cloud-arena-battlefield-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
      }

      .cloud-arena-battlefield-details-button {
        position: static;
        transform: none;
        margin-top: 0;
      }

      .cloud-arena-action-summary-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
      }

      .cloud-arena-inspector-panel {
        position: fixed;
        left: 50%;
        top: 50%;
        z-index: 30;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        width: min(72rem, calc(100vw - 2rem));
        height: min(88dvh, calc(100dvh - 2rem));
        max-height: none;
        padding: 1.1rem 1.2rem;
        overflow: auto;
        pointer-events: auto;
        transform: translate(-50%, -50%);
        box-shadow: 0 28px 70px rgba(28, 23, 19, 0.24);
        border-color: rgba(95, 84, 76, 0.24);
        background: rgba(255, 251, 246, 0.96);
        backdrop-filter: blur(16px);
      }

      .cloud-arena-inspector-tabs {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.3rem;
        border-radius: 999px;
        border: 1px solid rgba(95, 84, 76, 0.14);
        background: rgba(255, 255, 255, 0.64);
        width: fit-content;
        flex: 0 0 auto;
        align-self: flex-start;
      }

      .cloud-arena-inspector-tab {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 2rem;
        padding: 0.3rem 0.8rem;
        border: 0;
        border-radius: 999px;
        background: transparent;
        color: var(--muted);
        font: inherit;
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.04em;
        cursor: pointer;
      }

      .cloud-arena-inspector-tab.is-active {
        background: linear-gradient(135deg, rgba(255, 241, 230, 0.98), rgba(248, 226, 203, 0.9));
        color: var(--accent);
        box-shadow: inset 0 0 0 1px rgba(154, 52, 18, 0.16);
      }

      .cloud-arena-inspector-tab:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }

      .cloud-arena-inspector-body {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
      }

      .cloud-arena-inspector-definition {
        display: grid;
        gap: 0.65rem;
        min-height: 0;
      }

      .cloud-arena-inspector-definition-title {
        color: var(--accent);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .cloud-arena-inspector-definition-json {
        margin: 0;
        max-height: none;
        padding: 0.8rem 0.85rem;
        border-radius: 14px;
        border: 1px solid rgba(130, 94, 52, 0.14);
        background: rgba(255, 255, 255, 0.7);
        color: var(--ink);
        font-family: "SFMono-Regular", Consolas, monospace;
        font-size: 0.74rem;
        line-height: 1.45;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .cloud-arena-inspector-cards {
        display: grid;
        gap: 0.9rem;
        grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr));
        align-items: start;
        --display-card-width: clamp(12rem, 18vw, 15rem);
      }

      .cloud-arena-inspector-card {
        max-width: none;
      }

      .cloud-arena-inspector-empty {
        display: grid;
        place-items: center;
        min-height: 12rem;
        padding: 1rem;
        border-radius: 18px;
        border: 1px dashed rgba(95, 84, 76, 0.24);
        background: rgba(255, 255, 255, 0.65);
        color: var(--muted);
        font-weight: 700;
      }

      .cloud-arena-battle-sidepanel {
        min-height: 0;
      }

      @media (max-width: 1159px) {
        .cloud-arena-inspector-panel {
          width: min(42rem, calc(100vw - 1.5rem));
          height: min(84dvh, calc(100dvh - 1.5rem));
        }
      }

      @media (max-width: 699px) {
        .cloud-arena-inspector-panel {
          width: calc(100vw - 1rem);
          height: calc(100dvh - 1rem);
          padding: 1rem;
        }
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
        grid-template-columns: repeat(auto-fit, minmax(var(--display-card-width), var(--display-card-width)));
        gap: 1rem;
        align-items: start;
        justify-content: center;
        justify-items: center;
      }

      @media (min-width: 640px) {
        .cards-gallery {
          grid-template-columns: repeat(auto-fit, minmax(var(--display-card-width), var(--display-card-width)));
          gap: 1.1rem;
        }
      }

      @media (min-width: 900px) {
        .cards-gallery {
          grid-template-columns: repeat(auto-fit, minmax(var(--display-card-width), var(--display-card-width)));
          gap: 1.25rem;
        }
      }

      @media (min-width: 1240px) {
        .cards-gallery {
          grid-template-columns: repeat(auto-fit, minmax(var(--display-card-width), var(--display-card-width)));
          gap: 1.35rem;
        }
      }

      @media (min-width: 1680px) {
        .cards-gallery {
          grid-template-columns: repeat(auto-fit, minmax(var(--display-card-width), var(--display-card-width)));
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
        --card-rules-size: clamp(0.78rem, 4.4cqw, 1.02rem);
        --card-footer-size: clamp(0.5rem, 2.55cqw, 0.62rem);
        color: var(--ink);
        display: grid;
        gap: 0.35rem;
        width: min(100%, var(--display-card-width));
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
        color: var(--ink);
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
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
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

      .card-face-preview-button-label {
        min-width: 0;
      }

      .card-face-preview-button-cost {
        transform: translateY(-0.02em);
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
        --display-card-width: 100%;
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
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        text-wrap: pretty;
      }

      .card-face-rules-line.is-flavor {
        font-style: italic;
        color: color-mix(in srgb, #2d2416 78%, var(--card-accent) 22%);
        -webkit-line-clamp: 4;
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

      .deckbuilder-shell {
        display: grid;
        gap: 1rem;
        min-height: 0;
      }

      .deckbuilder-overview {
        display: grid;
        gap: 1rem;
      }

      .deckbuilder-overview-header,
      .deckbuilder-deck-item-header,
      .deckbuilder-entry-header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: start;
        gap: 0.75rem;
      }

      .deckbuilder-overview-header strong,
      .deckbuilder-deck-item strong,
      .deckbuilder-entry-header strong {
        display: block;
        margin-bottom: 0.3rem;
        font-size: 1.15rem;
      }

      .deckbuilder-overview-actions,
      .deckbuilder-card-actions,
      .deckbuilder-footer-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }

      .deckbuilder-grid {
        display: grid;
        gap: 1rem;
        min-height: 0;
      }

      @media (min-width: 1200px) {
        .deckbuilder-grid {
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        }
      }

      .deckbuilder-column {
        display: grid;
        gap: 1rem;
        min-height: 0;
      }

      .deckbuilder-toolbar {
        display: grid;
        gap: 0.85rem;
      }

      @media (min-width: 760px) {
        .deckbuilder-toolbar {
          grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
        }
      }

      .deckbuilder-list,
      .deckbuilder-deck-entries {
        display: grid;
        gap: 0.85rem;
        min-height: 0;
      }

      .deckbuilder-list {
        max-height: 30rem;
        overflow: auto;
        padding-right: 0.2rem;
      }

      .deckbuilder-deck-entries {
        max-height: 24rem;
        overflow: auto;
        padding-right: 0.2rem;
      }

      .deckbuilder-card-result,
      .deckbuilder-deck-item,
      .deckbuilder-deck-entry {
        display: grid;
        gap: 0.9rem;
        padding: 1rem;
        border-radius: 24px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.72);
      }

      .deckbuilder-deck-item {
        text-align: left;
        cursor: pointer;
        transition:
          transform 140ms ease,
          border-color 140ms ease,
          background 140ms ease;
      }

      .deckbuilder-deck-item:hover {
        transform: translateY(-1px);
        border-color: rgba(154, 52, 18, 0.28);
        background: rgba(255, 255, 255, 0.92);
      }

      .deckbuilder-deck-item.is-active {
        border-color: rgba(154, 52, 18, 0.42);
        background: rgba(154, 52, 18, 0.1);
      }

      .deckbuilder-deck-item p,
      .deckbuilder-entry-header p {
        margin: 0;
      }

      .deckbuilder-footer {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .deckbuilder-top-panel,
      .deckbuilder-catalog-panel {
        display: grid;
        gap: 1rem;
      }

      .deckbuilder-top-row,
      .deckbuilder-catalog-header {
        display: grid;
        gap: 1rem;
      }

      .deckbuilder-top-row {
        align-items: start;
      }

      @media (min-width: 900px) {
        .deckbuilder-top-row {
          grid-template-columns: minmax(18rem, 1fr) auto;
        }

        .deckbuilder-catalog-header {
          grid-template-columns: minmax(0, 1fr) minmax(20rem, 28rem);
          align-items: end;
        }
      }

      .deckbuilder-top-actions,
      .deckbuilder-catalog-controls,
      .deckbuilder-modal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.65rem;
      }

      .deckbuilder-metadata-grid {
        display: grid;
        gap: 0.85rem;
      }

      @media (min-width: 760px) {
        .deckbuilder-metadata-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      .deckbuilder-status-row {
        align-items: center;
      }

      .deckbuilder-card-grid {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(var(--display-card-width), var(--display-card-width)));
        justify-content: center;
        align-items: start;
      }

      .deckbuilder-card-button {
        position: relative;
        display: grid;
        justify-items: center;
        gap: 0.55rem;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: pointer;
        transition:
          transform 140ms ease,
          filter 140ms ease,
          opacity 140ms ease;
      }

      .deckbuilder-card-button:hover {
        transform: translateY(-2px);
      }

      .deckbuilder-card-button:focus-visible {
        outline: 3px solid rgba(154, 52, 18, 0.32);
        outline-offset: 0.45rem;
        border-radius: 28px;
      }

      .deckbuilder-card-button.is-unselected {
        filter: grayscale(1) saturate(0.65);
        opacity: 0.58;
      }

      .deckbuilder-card-button.is-selected {
        filter: none;
        opacity: 1;
      }

      .deckbuilder-card-selection-chip {
        display: inline-flex;
        align-items: center;
        min-width: 2.15rem;
        min-height: 2.15rem;
        justify-content: center;
        padding: 0.35rem 0.5rem;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.28);
        background: rgba(255, 252, 247, 0.92);
        color: var(--accent);
        font-size: 0.82rem;
        font-weight: 700;
        box-shadow: 0 8px 20px rgba(28, 23, 19, 0.1);
      }

      .deckbuilder-card-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.65rem;
        width: var(--display-card-width);
      }

      .deckbuilder-card-copy-controls {
        display: inline-flex;
        gap: 0.45rem;
      }

      .deckbuilder-card-copy-button {
        width: 2.15rem;
        height: 2.15rem;
        padding: 0;
        border-radius: 999px;
        border: 1px solid rgba(154, 52, 18, 0.22);
        background: rgba(255, 252, 247, 0.94);
        color: var(--accent);
        font: inherit;
        font-size: 1.2rem;
        font-weight: 800;
        line-height: 1;
        box-shadow: 0 8px 20px rgba(28, 23, 19, 0.1);
        cursor: pointer;
        transition:
          transform 140ms ease,
          border-color 140ms ease,
          background 140ms ease;
      }

      .deckbuilder-card-copy-button:hover {
        transform: translateY(-1px);
        border-color: rgba(154, 52, 18, 0.34);
        background: rgba(255, 255, 255, 1);
      }

      .deckbuilder-card-copy-button:focus-visible {
        outline: 3px solid rgba(154, 52, 18, 0.22);
        outline-offset: 2px;
      }

      .deckbuilder-card-face {
        width: var(--display-card-width);
      }

      .deckbuilder-empty-state {
        width: var(--display-card-width);
        min-height: 18rem;
      }

      .deckbuilder-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 80;
        display: grid;
        place-items: center;
        padding: 1rem;
        background: rgba(20, 15, 12, 0.42);
      }

      .deckbuilder-modal {
        display: grid;
        gap: 1rem;
        width: min(42rem, 100%);
      }

      .deckbuilder-modal-header {
        display: grid;
        gap: 0.35rem;
      }

      .deckbuilder-modal-header strong {
        font-size: 1.3rem;
      }

      .deckbuilder-modal-fields {
        display: grid;
        gap: 0.85rem;
      }

      .deckbuilder-modal-fields .field input {
        width: 100%;
      }

      .deckbuilder-modal-error {
        margin: 0;
        padding: 0.8rem 0.9rem;
        border-radius: 16px;
        border: 1px solid rgba(185, 28, 28, 0.2);
        background: rgba(254, 242, 242, 0.92);
        color: #991b1b;
        font-weight: 600;
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
      window.__CLOUD_ARCANUM_CONFIG__ = {
        apiBaseUrl: ${JSON.stringify(apiBaseUrl)},
        arenaApiBaseUrl: ${JSON.stringify(arenaApiBaseUrl)}
      };
    </script>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`;
}
