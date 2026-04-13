# Printable Cards Plan

## 1. Purpose

This document turns the idea of a printable card view for Cloud Arcanum into an implementation plan.

The target is a print-first view that:

- Shows only cards
- Preserves full card colors and frame styling
- Includes bleed around each card
- Maximizes card count per page
- Prints cleanly from browser print preview or a future PDF export

This plan assumes the existing card data and card-face rendering logic remain the source of truth.

## 2. Product Goal

The printable view should behave like a production sheet:

- A user chooses a card subset
- The app lays out cards into fixed pages
- Each page is packed as tightly as possible for the selected paper size
- The browser print dialog or PDF export then emits the final sheet

The user experience should feel like a print utility, not a browsing screen.

## 3. Recommended Build Strategy

### 3.1 Start With A Dedicated Print Route

Recommended first pass:

- Add a route such as `/cards/print`
- Feed it from the same card query/filter state as the normal cards page
- Render a simplified, non-interactive card sheet
- Use browser print preview first

Why this is the right starting point:

- It reuses the existing API and card model
- It avoids a separate rendering pipeline too early
- It lets us tune page geometry before committing to PDF generation

### 3.2 Keep The Print Layout Separate From The Browser Gallery

The print view should not be the same component tree as the on-screen gallery.

Recommended separation:

- `CardsPage` remains the browsing UI
- `PrintableCardsPage` becomes the print-only route
- `PrintableCardSheet` owns page packing and page breaks
- `PrintableCardFace` owns the paper-safe card rendering

That keeps print-specific rules from leaking into the normal browsing experience.

### 3.3 Prefer Browser Print Before Server PDF

Recommended order:

1. Browser print preview with `@media print`
2. Optional “Download PDF” later using the same print sheet component

This keeps the first version fast to ship and easy to debug.

### 3.4 Locked Defaults

These are the default decisions for v1:

- Support `Letter` and `A4`
- Auto-pick orientation from the available page fit, with `landscape` as the default starting point
- Reuse the existing card data model and card-face structure
- Print the full card color treatment, including true bleed
- Use the current cards filters as print input
- Include crop marks as a toggle, not as mandatory decoration
- Keep missing art visible using the existing fallback rendering
- Keep the print route mostly blank, with only a minimal toolbar
- Design the layout so server-side PDF export can reuse it later

## 4. Layout Decisions

### 4.1 Card Geometry

Use physical units, not viewport units.

Base assumptions:

- Standard trading card size: `2.5in x 3.5in`
- Bleed: `0.125in` on each edge
- Total card box including bleed: `2.75in x 3.75in`

Recommended internal zones:

- Bleed box: full card box including the bleed edge
- Trim line: the intended final card boundary
- Safe area: content inset from the trim line

That gives us a clean way to render color into the bleed while keeping text and symbols safely inside the trim.

### 4.2 Page Size And Orientation

The printable view should support at least:

- Letter
- A4

To maximize cards per page, pick the orientation that fits the most cards for the chosen paper size and keep `landscape` as the default if the fit is tied or not yet computed.

Recommended approach:

- Allow the print route to choose `portrait` or `landscape`
- Compute the best fit from page dimensions and card box size
- Default to the denser orientation unless the user overrides it

In practice:

- Letter often benefits from landscape for denser packing
- A4 often benefits from landscape as well if the goal is pure card count

### 4.3 Grid Packing Rule

The layout should be computed from the physical page box:

```text
usableWidth = pageWidth - leftMargin - rightMargin
usableHeight = pageHeight - topMargin - bottomMargin

columns = floor(usableWidth / cardBoxWidth)
rows = floor(usableHeight / cardBoxHeight)
cardsPerPage = columns * rows
```

Recommended behavior:

- Use the largest whole number of columns and rows that fit
- Do not scale cards down just to squeeze in fractional space unless that is an explicit mode
- Keep each card unbroken across pages

This is the safest way to maximize density without making the cards tiny or awkward.

### 4.4 Fit Modes

Recommended fit modes:

- `tight`: maximize cards per page using the smallest practical margins
- `safe`: slightly larger margins for printer variability
- `calibration`: optional page with markers to verify trim and bleed

Start with `tight` and `safe`. Add `calibration` as a toolbar toggle for sheet verification.

## 5. Route And Component Structure

### 5.1 New Route

Recommended route:

- `/cards/print`

Possible query parameters:

- `setId`
- `deckId`
- `universeId`
- `status`
- `color`
- `rarity`
- `q`
- `pageSize`
- `orientation`
- `fit`
- `themeId`

That makes the print sheet deep-linkable and repeatable.

Concrete routing todo:

- Add a `print` child route under the cards section
- Parse the same list filters used by `/cards`
- Add print-specific query params for `pageSize`, `orientation`, `fit`, and `showCropMarks`
- Keep the route bookmarkable so a specific sheet can be recreated later

### 5.2 New Frontend Components

Recommended component split:

- `PrintableCardsPage`
  - loads the selected cards
  - decides page size and layout mode
  - renders sheet pages
- `PrintableCardSheet`
  - receives a flat card list
  - chunks cards into pages based on grid math
  - renders page wrappers
- `PrintableCardGrid`
  - lays out the cards in a fixed `columns x rows` grid
- `PrintableCardFace`
  - renders the card artwork, frame, mana, rules text, and footer
  - removes interactive buttons and hover states
- `PrintToolbar`
  - optional on-screen controls for page size, fit, and print action

Concrete component todo:

- Create a print route page that fetches the filtered card list
- Create a sheet component that splits cards into fixed pages
- Create a card component that renders only the printable face
- Create a small toolbar with page-size, orientation, fit, crop-mark, and print controls
- Keep the print components separate from the browsing card gallery

### 5.3 Reuse Existing Card Rendering

The existing card face renderer already has the right structure for this:

- title
- mana cost
- art
- type line
- rules text
- footer metadata

Recommended rule:

- Reuse the same derived card model where possible
- Strip interactivity and preview behavior for print
- Keep the actual visual treatment as close to the current card face as possible

That preserves consistency between what users browse and what they print.

## 6. Print Styling Rules

### 6.1 Global Print Rules

The print stylesheet should:

- Hide the normal app shell
- Hide navigation, filters, buttons, and dialogs
- Force color accuracy
- Remove screen-only shadows and blur effects unless they improve print legibility
- Prevent cards from splitting across page boundaries

Concrete styling todo:

- Add a dedicated print stylesheet block in `apps/cloud-arcanum-web/src/app/html.ts`
- Hide the global app shell, nav, and non-print controls during print
- Apply exact color print settings globally
- Use `@page` rules for paper size and margin control
- Ensure the printable sheet is centered and page-broken cleanly

Recommended CSS concepts:

```css
@media print {
  @page {
    size: letter landscape;
    margin: 0.125in;
  }

  * {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
```

### 6.2 Card-Specific Print Rules

Each printed card should:

- Use exact physical dimensions
- Keep the bleed visible to the page edge of the card box
- Avoid browser scaling surprises
- Avoid page-break fragmentation

Recommended card box behavior:

- `width` and `height` in `in` or `mm`
- `break-inside: avoid`
- `page-break-inside: avoid`
- `overflow: hidden`

Concrete card styling todo:

- Convert the printable card face to fixed physical dimensions
- Add a bleed frame that extends beyond the trim area
- Add a safe-area inset for text and symbols
- Keep footer and rules text readable at print scale
- Add optional crop marks outside the trim line

### 6.3 Color Fidelity

To preserve the card colors:

- Keep the card frame and background colors in CSS
- Ensure the print theme does not flatten the palette
- Use solid background fills behind the art and frame

Important note:

- Browser print settings and the printer itself still control the final ink output
- If the printer does not support borderless printing, the bleed will only help if the sheet is trimmed after printing

Concrete color todo:

- Keep the card frame backgrounds and art overlays in CSS instead of flattening them into screenshots
- Verify that the print route does not disable background colors
- Check the final output in browser print preview with destination colors preserved

## 7. Page Packing Plan

### 7.1 Chunking Algorithm

The print route should not rely on natural DOM flow alone.

Recommended algorithm:

1. Measure or predefine page size
2. Compute columns and rows from the available area
3. Calculate `cardsPerPage`
4. Slice the card list into chunks of `cardsPerPage`
5. Render one page wrapper per chunk

This guarantees predictable packing and avoids orphaned cards or uneven page breaks.

Concrete layout todo:

- Add a `computePrintableGrid` helper that accepts page size, margins, and card box dimensions
- Add a `chunkCardsForPages` helper that slices cards by `cardsPerPage`
- Render one page container per chunk
- Keep the page container sized in real print units
- Add tests for at least Letter and A4 calculations

### 7.2 Density Priority

If maximizing cards per page is the main goal, priority should be:

1. Fit more full cards on the page
2. Keep cards physically accurate
3. Preserve bleed
4. Keep text readable
5. Avoid scaling the card art down too aggressively

That order prevents the sheet from becoming cramped or unusable.

### 7.3 Optional Advanced Mode

If you later want even more density, consider a second mode:

- `mini-sheet`

That mode could:

- remove bleed
- reduce margins
- slightly reduce typography scale

This should be separate from the main print sheet so the default mode remains print-safe.

Concrete future todo:

- Leave room for a later mini-sheet mode, but do not build it in v1
- Keep the layout helper generic enough to support it later

## 8. Suggested Implementation Phases

### Phase 1: Print Route Skeleton

- Add `/cards/print` to the router
- Reuse the cards API client and filter parser
- Add print-specific query-string parsing for `pageSize`, `orientation`, `fit`, and `showCropMarks`
- Render a plain page shell that shows the selected cards
- Add a minimal toolbar with print controls
- Verify the route works with deep links and refresh

### Phase 2: Physical Page Layout

- Implement a physical layout helper for page width, page height, and margins
- Implement a card-box helper for trim size plus bleed
- Compute columns and rows from available page space
- Chunk cards into full pages using the computed capacity
- Prevent page fragmentation and card splitting
- Add unit tests for the packing math

### Phase 3: Print Styling

- Add a print-only CSS block in the shared HTML shell
- Hide the app chrome and all interactive controls during printing
- Set `print-color-adjust: exact` and `-webkit-print-color-adjust: exact`
- Define `@page` size and margins for Letter and A4
- Add page-break and overflow rules for each printed card
- Add crop-mark styling for the optional calibration mode

### Phase 4: Visual Refinement

- Build the printable card face from the existing card-face data
- Remove hover, modal, link, and status badge behavior from the print face
- Check that mana symbols, rules text, and footer metadata remain legible
- Verify art crops cleanly into the bleed area
- Compare the print face against the on-screen card for consistency

### Phase 5: Validation

- Test Letter and A4 in browser print preview
- Test portrait and landscape orientation choices
- Test tight and safe fit modes with small and full sheets
- Verify crop marks can be shown and hidden
- Verify missing-art fallback cards still print
- Verify the output remains stable after browser refresh
- If PDF export is added later, reuse the same sheet and rerun the same layout checks

## 9. Acceptance Criteria

The feature is ready when:

- A user can open a print-only card sheet route
- The sheet contains only cards
- Each card includes colors and bleed
- Cards are packed into the maximum whole-card grid for the selected paper size
- Letter and A4 both work
- The layout supports both `tight` and `safe` modes
- Crop marks can be turned on and off
- Print preview produces clean page breaks
- The normal browsing UI stays unchanged

## 10. Likely Files To Touch

Recommended initial touchpoints:

- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-web/src/routes/index.tsx`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-web/src/routes/print-cards-page.tsx`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-web/src/components/printable-card-sheet.tsx`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-web/src/components/printable-card-face.tsx`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-web/src/app/html.ts`
- `/Users/cadezacharias/Documents/MTG/Cloud Arcanum/apps/cloud-arcanum-web/src/lib/print-layout.ts`

## 11. Recommended Default Choices

If no print settings are specified, the first version should probably default to:

- `paperSize`: Letter
- `orientation`: Landscape
- `fit`: Tight
- `showCropMarks`: Off
- `theme`: Current card theme
- `output`: Browser print preview

That combination should generally maximize the number of cards per page while preserving the existing visual style.
