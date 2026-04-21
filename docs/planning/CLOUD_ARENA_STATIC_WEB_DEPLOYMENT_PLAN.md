# Cloud Arena Static Web Deployment Plan

## Purpose

Deploy Cloud Arena as a single static web app that can be served from GitHub Pages.

The target model is:

- no long-running Node server
- no required backend API for normal play
- engine and scenario logic bundled into the browser app
- static assets served from the same GitHub Pages site
- optional future cloud services added only for features that truly need them

This plan treats GitHub Pages as static hosting. It does not assume GitHub can run serverless functions.

## Product Goal

Make Cloud Arena playable from a public web URL with the lowest operational burden possible.

The deployed app should support:

- starting a battle
- choosing a scenario
- choosing a deck preset
- browsing the Cloud Arena card catalog for deckbuilding
- creating and editing browser-local saved decks
- choosing a browser-local saved deck for battle
- using a seed
- taking legal actions
- resetting or starting a new battle
- refreshing the browser without immediately losing the current run, if feasible

The first deployment does not need:

- accounts
- cloud saves
- multiplayer
- leaderboards
- shared replays
- server-authoritative anti-cheat

## Current State

Cloud Arena already has a strong separation between engine, API, and frontend:

- `src/cloud-arena/`
  - owns the engine, rules, scenarios, deck presets, actions, and battle state transitions
- `apps/cloud-arena-api/`
  - owns Fastify routes, an in-memory session service, card catalog endpoints, and filesystem-backed saved deck endpoints
- `apps/cloud-arena-web/`
  - owns the React UI, battle route, deckbuilder route, and API client

The current local runtime flow is:

- `npm run dev:arena:api` starts the Arena API
- `npm run dev:arena:web` starts the Arena web app
- the browser app calls the API to create sessions, submit actions, list cards, list decks, and save decks

The main deployment blockers are:

- the API-owned session model
  - the current session service stores state in an in-memory `Map`, which is fine for local development but not suitable for a static GitHub Pages app
- the API-owned deckbuilder persistence model
  - saved decks currently write JSON files under `data/cloud-arena/decks/`, which cannot happen from a GitHub Pages browser app

The deckbuilder functionality is already more than a future idea. The current web route and tests include:

- `apps/cloud-arena-web/src/routes/deckbuilder-page.tsx`
- `apps/cloud-arena-api/src/routes/cloud-arena-content.ts`
- `apps/cloud-arena-api/src/services/cloud-arena-decks.ts`
- `tests/cloud-arena/deck-storage.test.ts`
- `tests/cloud-arena/deckbuilder-page.test.ts`

## Recommended Architecture

Use an offline-first static browser architecture.

In this model, the browser app directly imports the Cloud Arena engine and owns the live session state. The API contract remains useful as a shape reference, but the default deployed app does not call a remote API for battle actions.

Recommended layers:

- engine layer
  - existing pure Cloud Arena engine under `src/cloud-arena/`
- content catalog layer
  - browser-compatible card and preset deck listing derived from bundled Cloud Arena definitions
- deck repository layer
  - browser-local saved deck CRUD backed by `localStorage` or `IndexedDB`
- session adapter layer
  - new browser-compatible session service that mirrors the current API session service behavior
- persistence layer
  - local battle recovery plus saved decks
- UI layer
  - existing React Cloud Arena battle UI and deckbuilder UI, wired to local adapters
- static build layer
  - generated `index.html`, bundled JS, copied SVG assets, and GitHub Pages workflow

## Why Static First

Static deployment is the best first step because:

- the combat engine is deterministic and already written in TypeScript
- the current API mostly wraps local engine calls and session state
- the card catalog and preset decks are already available from TypeScript modules
- the in-memory API session state would not survive normal serverless cold starts
- GitHub Pages can host the whole game without infrastructure
- the app remains easy to share and test

Server-backed features can still be added later as optional services.

## Key Technical Changes

### 1. Extract Snapshot Packaging From The API Service

Current snapshot construction lives inside:

- `apps/cloud-arena-api/src/services/cloud-arena-sessions.ts`

Move reusable, runtime-agnostic pieces into `src/cloud-arena/`, likely under one of:

- `src/cloud-arena/session/`
- `src/cloud-arena/view-model/`
- `src/cloud-arena/sessions/`

Reusable pieces should include:

- battle setup resolution
- player deck resolution, including preset decks and browser-saved decks
- action normalization
- legal action option creation
- action validation
- session snapshot creation
- reset behavior

The API app and browser app should both use the same session logic where possible.

### 2. Add A Browser Session Service

Add a client-compatible service, probably under:

- `apps/cloud-arena-web/src/lib/cloud-arena-local-session.ts`

The service should expose methods similar to the current API client:

- `createCloudArenaSession(request)`
- `getCloudArenaSession(sessionId)`
- `applyCloudArenaAction(sessionId, { action })`
- `resetCloudArenaSession(sessionId)`

Keeping the method names close to `CloudArenaApiClient` makes the UI migration smaller.

The local service should own:

- current session record
- session id generation
- current `BattleState`
- action history
- reset source
- snapshot generation
- optional persistence

Use `crypto.randomUUID()` in the browser when available. If older browser support matters, add a small fallback id helper.

### 3. Extract Browser-Compatible Content And Deck Logic

The current deckbuilder is API-backed:

- card list data comes from `GET /api/cloud-arena/cards`
- deck list and detail data come from `GET /api/cloud-arena/decks`
- deck save/update/delete calls write JSON files through the API service

Relevant files:

- `apps/cloud-arena-api/src/services/cloud-arena-decks.ts`
- `apps/cloud-arena-api/src/routes/cloud-arena-content.ts`
- `apps/cloud-arena-web/src/routes/deckbuilder-page.tsx`
- `apps/cloud-arena-web/src/lib/cloud-arena-api-client.ts`

For static deployment, split deck logic into two parts:

- shared pure deck/content helpers
  - card summary creation
  - card search matching
  - preset deck summary/detail creation
  - saved deck validation
  - saved deck expansion
  - deck source resolution from an injected saved-deck collection
- runtime storage adapters
  - Node filesystem adapter for local API development
  - browser storage adapter for GitHub Pages

Likely shared module locations:

- `src/cloud-arena/decks/`
- `src/cloud-arena/content/`
- `src/cloud-arena/storage/`

The browser adapter should not import Node modules such as:

- `node:fs`
- `node:fs/promises`
- `node:path`
- `node:crypto`

### 4. Add A Browser Deck Repository

Add a client-compatible deck repository, probably under:

- `apps/cloud-arena-web/src/lib/cloud-arena-local-decks.ts`

The repository should expose methods similar to the deck-related API client:

- `listCloudArenaCards(query?)`
- `listCloudArenaDecks(query?)`
- `getCloudArenaDeck(deckId)`
- `createCloudArenaDeck(body)`
- `updateCloudArenaDeck(deckId, body)`
- `deleteCloudArenaDeck(deckId)`

It should store saved deck data in browser storage rather than repository files.

Recommended storage model:

- persist saved decks in `localStorage` for MVP
- store one versioned JSON payload under a Cloud Arena-specific key
- reserve IndexedDB as a future option if deck data grows large

Recommended persisted payload:

- schema version
- saved deck records
- updated timestamp

The same repository should also provide preset deck summaries/details from bundled TypeScript definitions so the deckbuilder can list both preset and saved decks without a server.

### 5. Introduce Session And Content Controller Hooks

The interactive page currently constructs an API client and makes async API calls.

Relevant file:

- `apps/cloud-arena-web/src/routes/interactive-page.tsx`
- `apps/cloud-arena-web/src/routes/deckbuilder-page.tsx`

Replace direct API dependencies with controller abstractions.

Potential shape:

- `createCloudArenaSessionController({ mode })`
- `createCloudArenaContentController({ mode })`
- `useCloudArenaSessionController()`
- `useCloudArenaContentController()`

Initial deployment can support only local mode. A later version can support both:

- `local`
- `remote`

This keeps the UI independent from whether battles and deckbuilder operations are resolved by the browser or an API.

### 6. Add Local Persistence

For a nicer deployed experience, persist both saved decks and the current battle session.

For battle recovery, persist:

- scenario id
- deck id
- seed
- shuffle setting
- action history

For deckbuilder persistence, persist:

- saved deck id
- name
- card entries
- tags
- notes

Prefer reconstructing state from setup plus action history instead of storing raw mutable engine state forever. This makes persistence more resilient when the engine shape changes.

Basic recovery flow:

- load saved setup and actions
- load browser-saved decks
- create the original battle
- replay actions through `applyBattleAction`
- if replay fails because the engine changed, discard the save and start a fresh battle

Battle recovery can be deferred until after the first static deployment if needed. Deckbuilder persistence cannot be deferred if the static app promises saved decks.

### 7. Generate Static HTML

The current web app is served by a Node HTTP server:

- `apps/cloud-arena-web/src/app/index.ts`

For GitHub Pages, add a static export script that writes an `index.html` file into the built client output.

Likely script:

- `scripts/build-arena-static-site.ts`

Output target:

- `dist/apps/cloud-arena-web/static/`

Static output should include:

- `index.html`
- `assets/app.js`
- SVG assets emitted by esbuild
- source maps if desired

### 8. Make Asset Paths GitHub Pages Safe

The current arena web build uses:

- `--public-path=/assets`

That works when the app is hosted at a domain root. It does not work well when hosted under a GitHub Pages project path such as:

- `https://owner.github.io/repo-name/`

Update the build to support a configurable public path.

Recommended options:

- for GitHub Pages project sites: `/Cloud-Arcanum/assets`
- for local static preview: `./assets`

The build script can read an environment variable:

- `CLOUD_ARENA_PUBLIC_PATH`

### 9. Make Routing GitHub Pages Safe

The current app uses `createBrowserRouter`.

Relevant file:

- `apps/cloud-arena-web/src/routes/index.tsx`

GitHub Pages cannot serve arbitrary route fallbacks unless extra redirect tricks are added.

Recommended MVP:

- use hash routing for the static deployment
- keep browser routing for local/server mode if desired

Potential implementation:

- `createCloudArenaRouter(context, { routingMode: "browser" | "hash" })`
- use `createHashRouter` for static builds

The current app has at least two routes:

- `/`
- `/decks`

Hash routing is the simplest GitHub Pages-safe option for both.

### 10. Add A Static Preview Command

Add scripts for building and previewing the static site.

Potential `package.json` scripts:

- `build:arena:static`
- `preview:arena:static`

The preview command can use a simple local static server if one is already available, or a tiny Node script under `scripts/`.

Avoid making the preview script part of the production app architecture. It is only a local convenience.

### 11. Add GitHub Pages Deployment Workflow

Add a GitHub Actions workflow:

- `.github/workflows/deploy-cloud-arena.yml`

Recommended workflow steps:

- checkout
- setup Node 18 or newer
- `npm ci`
- `npm run build:types`
- `npm run build:arena:static`
- upload the static output as a Pages artifact
- deploy to GitHub Pages

The workflow should publish:

- `dist/apps/cloud-arena-web/static`

## Implementation Phases

### Phase 1: Shared Session Core

Goal:

- remove browser-incompatible coupling from the session logic

Work:

- move API session helper logic into shared Cloud Arena modules
- keep API behavior unchanged
- keep existing API tests passing
- add focused tests for shared session creation, legal actions, action application, and reset

Likely files:

- `src/cloud-arena/api-contract.ts`
- `src/cloud-arena/index.ts`
- new files under `src/cloud-arena/session/`
- `apps/cloud-arena-api/src/services/cloud-arena-sessions.ts`
- `tests/cloud-arena/session-service.test.ts`

### Phase 2: Shared Content And Deck Core

Goal:

- separate pure deckbuilder behavior from Node filesystem storage

Work:

- move card summary/list helpers into shared Cloud Arena modules
- move preset deck summary/detail helpers into shared Cloud Arena modules
- move saved deck validation and expansion into shared Cloud Arena modules
- keep filesystem read/write behavior in the API app or a Node-only adapter
- keep existing content route and deck storage tests passing
- add tests for browser-safe helpers that do not import Node modules

Likely files:

- `src/cloud-arena/api-contract.ts`
- `src/cloud-arena/card-summary.ts`
- new files under `src/cloud-arena/decks/`
- `apps/cloud-arena-api/src/services/cloud-arena-decks.ts`
- `tests/cloud-arena/deck-storage.test.ts`
- `tests/cloud-arena/deckbuilder-page.test.ts`

### Phase 3: Local Browser Deck Repository

Goal:

- make the deckbuilder usable without HTTP or filesystem writes

Work:

- add local card/deck repository for the browser
- store saved decks in versioned browser storage
- support create, update, delete, list, detail, and card catalog search
- preserve the existing deckbuilder UI behavior
- make the battle setup deck chooser read browser-saved decks

Likely files:

- `apps/cloud-arena-web/src/lib/cloud-arena-local-decks.ts`
- `apps/cloud-arena-web/src/lib/cloud-arena-content-controller.ts`
- `apps/cloud-arena-web/src/routes/deckbuilder-page.tsx`
- `apps/cloud-arena-web/src/routes/interactive-page.tsx`
- `tests/cloud-arena/deckbuilder-page.test.ts`

### Phase 4: Local Browser Session Adapter

Goal:

- make the frontend able to run battles without HTTP

Work:

- add local browser session adapter
- resolve selected deck ids through the local deck repository
- wire `interactive-page.tsx` to use the adapter
- preserve loading, submitting, reset, and error states
- keep current UI behavior intact
- add tests around local adapter behavior if practical

Likely files:

- `apps/cloud-arena-web/src/lib/cloud-arena-local-session.ts`
- `apps/cloud-arena-web/src/lib/cloud-arena-session-controller.ts`
- `apps/cloud-arena-web/src/routes/interactive-page.tsx`

### Phase 5: Static Build Output

Goal:

- produce a folder that can be uploaded to static hosting

Work:

- add static HTML generation
- make asset public path configurable
- copy or emit all required assets
- make runtime config unnecessary for local engine mode
- verify `index.html` can load the bundle from a static file server

Likely files:

- `scripts/build-arena-web-client.ts`
- `scripts/build-arena-static-site.ts`
- `apps/cloud-arena-web/src/app/html.ts`
- `apps/cloud-arena-web/src/lib/runtime-config.ts`
- `package.json`

### Phase 6: GitHub Pages Routing And Deployment

Goal:

- make the static output work on GitHub Pages

Work:

- add hash-router mode or basename support
- set public path for the repository Pages URL
- add GitHub Actions deploy workflow
- document repository Pages settings
- verify the deployed app URL loads, starts a battle, and accepts actions

Likely files:

- `apps/cloud-arena-web/src/routes/index.tsx`
- `.github/workflows/deploy-cloud-arena.yml`
- `README.md` or `apps/cloud-arena-web/README.md`

### Phase 7: Refresh Persistence

Goal:

- let a player refresh without losing saved decks or the current battle

Work:

- persist saved decks to browser storage
- persist setup and action history to `localStorage`
- replay action history on boot
- add a clear-save path when recovery fails
- include version metadata so incompatible saves can be discarded cleanly

Likely files:

- `apps/cloud-arena-web/src/lib/cloud-arena-local-decks.ts`
- `apps/cloud-arena-web/src/lib/cloud-arena-local-session.ts`
- `apps/cloud-arena-web/src/routes/interactive-page.tsx`
- `apps/cloud-arena-web/src/routes/deckbuilder-page.tsx`

## Serverless Backend Alternative

A serverless backend is only needed if Cloud Arena grows beyond local play.

Features that may justify serverless later:

- cloud saves
- multi-device deck sync
- public deck sharing
- shared replay links
- daily seeded challenges
- public leaderboards
- analytics
- account-bound unlocks

If that happens, avoid in-memory sessions. Use a durable store and represent runs as:

- setup config
- seed
- action history
- derived latest snapshot

Represent saved decks as:

- owner or anonymous share id, if accounts/sharing exist
- stable deck id
- name, tags, notes
- quantity-based card entries
- created and updated timestamps

Possible hosting options:

- Cloudflare Pages plus Workers and KV/D1
- Netlify or Vercel functions with a managed database
- Supabase for persistence with a static frontend

GitHub Pages alone should remain the static frontend host, not the backend.

## Testing Checklist

Before considering the deployment complete:

- `npm run check` passes
- `npm test -- tests/cloud-arena` passes
- static build command succeeds
- static preview loads `index.html`
- battle auto-creates on first load
- scenario selection works
- deck selection works
- deckbuilder card catalog loads without an API server
- deckbuilder preset decks load without an API server
- deckbuilder can create, update, delete, and reload browser-saved decks
- battle setup can select a browser-saved deck
- battle starts with a browser-saved deck
- legal actions update after each move
- reset works
- finish modal still appears
- saved decks survive refresh
- battle refresh recovery works, if battle persistence is included
- deployment workflow publishes the expected folder
- GitHub Pages URL loads assets with no 404s

## Open Decisions

- Should the deployed app always use local mode, or keep a runtime switch for remote API mode?
- Should static deployment use hash routing or a configured basename?
- Should battle refresh persistence ship in the first deployment or as a follow-up?
- Should saved browser decks be exportable/importable as JSON so users can back them up outside local browser storage?
- Should the filesystem-backed deck API remain the local authoring path, or should browser-local decks become the primary deckbuilder model?
- What should the public GitHub Pages path be?
- Should Cloud Arcanum catalog links point to a deployed catalog site, local routes, or be hidden in the Arena-only static app?

## Recommended First Milestone

Ship a static local-mode Cloud Arena build that supports one complete battle session from GitHub Pages.

Minimum success criteria:

- no API server required
- static `index.html` loads on GitHub Pages
- the engine runs in the browser
- the deckbuilder runs in the browser
- saved decks use browser storage
- the player can start, play, reset, and finish battles
- the player can create a saved deck and use it in battle
- the existing local API path remains available for development until it is intentionally retired
