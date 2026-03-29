# Cloud Arcanum App Shell UI Refresh TODO

## 1. Purpose

This document turns the current UI cleanup request into an execution checklist for multiple agents.

Requested outcomes:

- Make the cards page the default landing view
- Remove the overview page as a primary destination
- Restyle the primary navigation so cards, decks, and sets read like a true top header
- Make `Cloud Arcanum` feel like a proper page header instead of scaffold copy
- Remove engineering-flavored labels and helper text such as `Cards experience` and `Deck browsing`

## 2. Product Decisions

These decisions should be treated as settled unless a later pass intentionally reopens them.

- Cards should be the default landing route for the app
- The overview page should be removed, or reduced to a redirect rather than a standalone destination
- The top-of-page navigation should feel like the main site header, not a secondary control panel
- The brand area should present `Cloud Arcanum` as the main product header
- Section copy should be plain-language and user-facing, not implementation-facing

## 3. Parallel Work Split

Each agent should own a separate write scope to avoid conflicts.

### Agent 1: Default Route and Navigation Structure

Owner scope:

- `apps/cloud-arcanum-web/src/components/app-shell.tsx`
- `apps/cloud-arcanum-web/src/routes/index.tsx`

TODOs:

- [ ] Make `/cards` the effective default landing experience for the app
- [ ] Remove `Overview` from the primary navigation items
- [ ] Change the `/` route so it redirects to cards, or otherwise renders the cards experience directly
- [ ] Update not-found and route-error fallback links so they send users to cards first instead of overview
- [ ] Confirm the active nav state still works correctly after removing overview

Acceptance criteria:

- Visiting `/` lands on the cards experience
- There is no visible `Overview` tab in the main navigation
- Cards, decks, and sets remain easy to reach from the global header
- Broken-route recovery paths prefer cards as the main way back into the app

### Agent 2: Global Header and Top Navigation Styling

Owner scope:

- `apps/cloud-arcanum-web/src/components/app-shell.tsx`
- `apps/cloud-arcanum-web/src/app/html.ts`

TODOs:

- [ ] Redesign the header so `Cloud Arcanum` reads as the main page title
- [ ] Remove scaffold-oriented brand copy such as `Cloud Arcanum interface scaffold`
- [ ] Rework the navigation layout so cards, decks, and sets feel like a horizontal top header
- [ ] Reduce the feeling that nav is a separate pill panel floating beside the title
- [ ] Keep the result responsive on mobile without collapsing into a broken or crowded header

Acceptance criteria:

- The first thing a user sees is a clear, intentional page header
- The navigation reads like primary site navigation across the top
- The layout still works at mobile and desktop widths
- The visual result feels product-facing rather than internal-tool-facing

### Agent 3: Copy Cleanup Across Main Browse Pages

Owner scope:

- `apps/cloud-arcanum-web/src/routes/cards-page.tsx`
- `apps/cloud-arcanum-web/src/routes/decks-page.tsx`
- `apps/cloud-arcanum-web/src/routes/sets-page.tsx`
- `apps/cloud-arcanum-web/src/routes/index.tsx`

TODOs:

- [ ] Replace kickers like `Cards experience`, `Deck browsing`, and `Set browsing` with cleaner user-facing labels or remove them entirely
- [ ] Rewrite descriptions that sound implementation-heavy, such as references to deep-linkable query state, wiring, or shared UI primitives
- [ ] Simplify empty-state and error-state copy so it sounds calm and product-facing
- [ ] Keep useful guidance, but remove engineering terminology where it is not helpful to normal browsing
- [ ] Make cards, decks, and sets pages feel like a cohesive product voice

Acceptance criteria:

- No main browse page uses engineering-flavored headings or scaffold language
- Page descriptions are short, clear, and user-facing
- Error and empty states still help the user recover without talking about internal wiring
- The three main browse pages read as part of the same editorial voice

### Agent 4: QA and Consistency Pass

Owner scope:

- Review-only pass across the updated web app

TODOs:

- [ ] Verify the new default route does not break deep links to card, deck, set, or universe detail pages
- [ ] Verify header spacing and nav wrapping on narrow screens
- [ ] Verify no leftover overview references remain in visible UI copy
- [ ] Verify no obvious scaffold phrases remain in cards, decks, or sets routes
- [ ] Verify the app still feels coherent if universes remains available but is no longer emphasized in the top header

Acceptance criteria:

- The refreshed shell works for direct entry, fallback navigation, and deep links
- The visible UI no longer suggests the app is a scaffold or internal prototype
- Remaining navigation choices feel intentional rather than transitional

## 4. Open Question For The Implementing Team

This does not block the TODO split, but the team should make one intentional call during implementation:

- [ ] Decide whether `Universes` stays in the top header beside cards, decks, and sets, or moves to a lower-emphasis location

Current recommendation:

- Keep universes routable, but lower its visual priority if the goal is a simpler top header centered on cards, decks, and sets.

## 5. Definition of Done

This refresh is complete when:

- [ ] `/` behaves like the cards landing page
- [ ] The overview page is no longer presented as a main destination
- [ ] The header presents `Cloud Arcanum` like a real product page
- [ ] The primary nav reads like a top header
- [ ] Cards, decks, and sets pages no longer use engineering-flavored section copy
