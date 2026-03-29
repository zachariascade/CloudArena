# Cards Grid Implementation Plan

## Goal

Turn the current cards page from a text-forward results list into a visual grid that feels much closer to browsing real trading cards.

The target experience is:

- The main browsing surface is a responsive grid of card faces.
- Each card tile communicates most of the card's identity visually instead of through metadata rows.
- Missing or incomplete assets still render clearly and intentionally.
- We preserve the current search/filter URL model and typed API boundaries while upgrading presentation.

## Current UI Snapshot

Today the cards page is built around:

- A strong search/filter panel
- A list-style `CardGalleryItem`
- A rectangular preview image area plus metadata rows, badges, and tags
- Fallback rendering for missing or placeholder images

That means the data plumbing is already in good shape. The biggest gap is presentation and the data density of each card tile.

## Design Direction

We should not try to fake a full Magic card in one jump by baking text onto images immediately.

Instead, we should move in three layers:

1. Build a card-frame grid component that visually resembles a real card.
2. Render structured card data into that frame with HTML/CSS.
3. Decide later whether we need generated composite art assets, canvas rendering, or export-quality card images.

This gives us a much faster path to a convincing browse experience without changing the API contract too early.

## Product Decisions To Confirm

- Whether the cards page should become grid-only or support `grid/list` toggle
- Whether draft/incomplete cards should render in the same frame style or a visibly distinct prototype frame
- Whether filters stay above the grid full-width or collapse into a sidebar on desktop
- Whether clicking a card opens detail immediately or supports hover/quick actions first
- Whether we want true MTG-like text layout with mana symbols and rules formatting in phase 1, or a simplified approximation first

My recommendation:

- Start with grid-first, no list toggle yet
- Keep filters above the grid for now
- Use one frame system with visual states for draft/incomplete/validation
- Keep click behavior simple: clicking the card opens detail
- Approximate mana symbols and rules layout first, then refine

## Confirmed Decisions

These decisions are now locked in for the first implementation pass:

- [x] Cards page will be grid-only for now
- [x] Draft and incomplete cards will use the same frame system with visible state styling
- [x] Filters will remain above the grid instead of moving to a sidebar
- [x] Clicking a card opens the detail page
- [x] First version will be a simplified card-face approximation, not a full MTG-faithful layout
- [x] We can introduce a richer grid-oriented API model later if the current list shape becomes limiting

## Implementation Strategy

### Phase 1: Card Surface Architecture

Goal: replace the current list item with a reusable card-face component.

TODO:

- [x] Create a dedicated `CardFaceTile` component for the cards page
- [x] Define a fixed card aspect ratio that resembles paper cards
- [x] Split the tile into card-face regions: title bar, art box, typeline row, rules box, footer
- [x] Move card-specific formatting helpers out of the current page component if reuse starts growing
- [x] Keep the whole tile clickable to preserve easy navigation
- [x] Ensure the tile works with both real art and preview-pending fallback art

Notes:

- This phase is purely frontend composition and CSS.
- The existing `CardListItem` contract may already be enough for an MVP card grid, but likely not enough for a rich final card face.

### Phase 2: Grid Layout

Goal: make the browse surface feel like a gallery of real cards.

TODO:

- [x] Replace the vertical `.cards-gallery` list with a responsive card grid
- [x] Choose desktop breakpoints for 2, 3, 4, and possibly 5 columns
- [x] Add tighter spacing and visual rhythm so the cards read as a collection
- [x] Keep cards legible on mobile with 1-2 columns and full-width tiles
- [ ] Verify filter changes do not cause jarring layout shifts
- [ ] Decide whether infinite scroll or pagination is needed once the grid becomes denser

Notes:

- The grid should be visually primary, with metadata outside the card minimized.
- We should preserve current empty/loading/error states with only light visual adjustments.

### Phase 3: Encode More Card Data Into The Tile

Goal: make each tile communicate more like a real card face.

TODO:

- [x] Render card name inside a title bar instead of above the image
- [x] Render mana cost as icon-like symbols or styled pips
- [x] Render `typeLine` in a dedicated typeline row
- [x] Render a shortened rules text block on the card face
- [x] Render power/toughness inside a lower-right stat box for creatures
- [x] Render loyalty/defense in alternate footer treatments when relevant
- [x] Render set code, rarity, and collector-ish info in a compact footer line
- [x] Decide how to surface tags without cluttering the face

Notes:

- We will probably need to truncate text aggressively for browse mode.
- The browse card should not try to show every field the detail page shows.

### Phase 4: Card Frame Visual System

Goal: make the cards look intentionally inspired by real card frames instead of generic app cards.

TODO:

- [x] Define CSS variables for frame tones by card color identity
- [x] Design a neutral frame for colorless or multi-color cards
- [x] Add borders, bevels, inner shadows, and panel treatments for title/rules/stat areas
- [x] Create distinct draft/incomplete styling that still feels like part of the same system
- [x] Add validation-warning treatment that is visible but not visually dominant
- [x] Add subtle motion only if it helps browsing, not generic hover clutter

Notes:

- This is the phase where the UI will stop feeling like a data dashboard and start feeling collectible.
- We should avoid trying to clone Wizards frames exactly; “inspired by” is safer and more flexible.

### Phase 5: Asset And Data Gaps

Goal: identify what the current API does not yet provide for a true card-face grid.

TODO:

- [x] Audit which card-face fields already exist on `CardListItem`
- [x] Decide whether `CardListItem` needs `oracleText`, `power`, `toughness`, `loyalty`, `defense`, and `artist`
- [x] Decide whether the list route should return a lightweight “grid card” view model instead of reusing `CardListItem`
- [x] Decide how mana symbols should be represented: raw text, parsed tokens, or precomputed display data
- [x] Decide whether rarity and set code belong on the list response or should be reformatted client-side
- [x] Confirm whether image dimensions/cropping metadata are needed for consistent art boxes

Recommendation:

- Add a dedicated grid-oriented card list model if the current list item becomes overloaded.
- Avoid making the browser parse complicated rules syntax if the API can provide presentation-friendly fields.

Phase 5 decisions:

- `CardListItem` now already carries the grid-critical fields we needed for the current browse surface: `name`, `typeLine`, `manaCost`, `rarity`, `oracleText`, `flavorText`, `power`, `toughness`, `loyalty`, `defense`, `setCode`, `image`, `draft`, `validation`, `tags`, and color identity data.
- `artist` is not needed on the browse card yet, so it should stay detail-only for now. If the footer becomes more collector-oriented later, we can revisit that in a dedicated grid model instead of continuing to widen the generic list item.
- The current list route can continue reusing `CardListItem` for now, because the field set is still understandable and directly tied to the cards page. If we add richer preview-only concerns such as parsed mana tokens, reminder-text segmentation, art-crop metadata, or collector-number formatting rules, we should introduce a dedicated `GridCardListItem` instead of overloading `CardListItem` further.
- Mana symbols should remain raw text in the API for the moment, with lightweight client parsing from `{...}` tokens. If mana rendering expands beyond simple pips, the API should expose precomputed display tokens rather than asking the browser to parse more rules syntax.
- `rarity` and `setCode` do belong on the list response because they are now part of the browse-surface footer and are stable, low-cost fields for the API to provide directly.
- Image dimensions or crop metadata are not required for the current frame because the art box is using intentional fixed-ratio cropping. If we later need focal-point preservation or mixed-aspect art handling, we should add explicit image presentation metadata rather than inferring it in the client.

Remaining real data gaps:

- Collector-number formatting is still derived from `card.id`, which is good enough for now but not a true collector field.
- Rules text is still truncated client-side, which is acceptable for browse mode but may eventually want API-provided preview text or parsed lines.
- The fallback art treatment still does not distinguish deeply between placeholder intent and genuinely missing assets beyond the current label/state styling.

### Phase 6: Typography And Rules Rendering

Goal: make the tile readable despite dense card text.

TODO:

- [x] Pick a more expressive serif/display type strategy for card title and rules text
- [x] Define a tighter typographic scale for title, typeline, rules, and footer
- [x] Add line clamping rules for browse-mode text
- [x] Decide how reminder text, italics, and line breaks should appear
- [x] Decide whether mana symbols inside rules text are in scope for the first release

Notes:

- Typography will make or break the realism here.
- We should not keep the current app-wide text treatment inside the card face.

Phase 6 decisions:

- Titles now use a more display-forward serif stack while rules text uses a separate bookish serif stack so the face reads with clearer hierarchy.
- The browse card uses a tighter type scale across title, typeline, rules, and footer so the interior feels denser and more card-like without becoming muddy at smaller sizes.
- Rules lines are clamped in browse mode, with flavor text allowed a slightly softer longer clamp than oracle-style lines.
- Parenthetical reminder text is rendered in italic, de-emphasized inline treatment instead of reading like full-strength oracle text.
- Inline mana symbols inside rules text are in scope for the first release and should continue to render as lightweight styled tokens for now.

### Phase 7: Interaction And Navigation

Goal: make the new card grid pleasant to browse, not just pretty.

TODO:

- [x] Make the full card tile keyboard-focusable and accessible
- [x] Preserve current deep-link behavior to `/cards/:cardId`
- [x] Decide whether hover reveals extra metadata or whether that remains detail-page only
- [x] Ensure filter changes preserve scroll position intentionally, not accidentally
- [x] Consider adding a quick “open detail” affordance on desktop if needed

Phase 7 decisions:

- The main card surface remains a real link to `/cards/:cardId`, so the full face stays keyboard-focusable and preserves the simple deep-link interaction model.
- Hover will not reveal extra metadata for now. The browse card should stay visually stable, and richer inspection should continue to live in the detail page or the explicit preview modal.
- Filter and sort changes now preserve scroll intentionally via `preventScrollReset`, so browsing the grid feels continuous instead of jumping back to the top.
- A separate quick “open detail” affordance is not needed right now because the whole face is already the detail affordance. The explicit secondary action under the card remains `Preview`, which serves a different purpose.
- The preview modal now has stronger keyboard accessibility with dialog semantics, `Escape` handling, and focus return to the trigger button.

### Phase 8: Fallback States For Incomplete Content

Goal: keep draft cards from looking broken.

TODO:

- [ ] Design a dedicated preview-pending art panel that still fits the card frame
- [ ] Show missing image vs placeholder image differently if that distinction matters
- [ ] Decide how unresolved mechanics are surfaced on-card without overwhelming the frame
- [ ] Keep validation issues visible but secondary to the card identity
- [ ] Ensure short/incomplete rules text still fills the card gracefully

Notes:

- Sarah is a good example of why fallback states need to feel designed, not accidental.

### Phase 9: Testing And Verification

Goal: make the visual rewrite safe to iterate on.

TODO:

- [ ] Add route rendering tests for the new card grid
- [ ] Add tests for fallback rendering with and without art
- [ ] Add tests for grid card truncation/conditional fields where practical
- [ ] Add tests for filter behavior remaining reflected in the URL
- [ ] Verify keyboard navigation across the grid
- [ ] Manually verify desktop and mobile layouts

## Suggested Build Order

If we want the shortest path to visible progress, I would sequence the work like this:

1. Create `CardFaceTile` and switch the page to a basic responsive grid.
2. Add the visual card frame regions without trying to encode every field yet.
3. Expand the list response or create a grid view model for rules text and stats.
4. Add mana/typeline/rules/footer treatments.
5. Refine fallback states for missing/incomplete art.
6. Add tests and polish.

## Likely API Follow-Up

I expect we will soon want one of these:

- Extend `CardListItem` with more browse-surface fields
- Add a new list shape specifically for the card-grid browse experience

My recommendation is the second option if we want the cards page to become heavily visual. It gives us freedom to shape exactly what the frontend needs without turning the current list model into a dumping ground.

## First Concrete Implementation Slice

If we start this work next, the first practical slice should be:

- [ ] Introduce `CardFaceTile`
- [ ] Convert the cards page from list to responsive grid
- [ ] Render title bar, art box, typeline, and simplified footer
- [ ] Keep rules text and stats minimal in the first slice
- [ ] Preserve existing search/filter behavior exactly as-is

That would give us a strong visual pivot quickly while keeping risk contained.
