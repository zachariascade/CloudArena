# Set Creation Minimal Reference

Use this document when a thread needs to create a new set card list directly.

## Required Outputs

Produce:

- one first-pass card list in Markdown

If the thread continues from list-building into card drafting, also produce:

- one quote-selection pass for the chosen cards
- one image-sourcing pass for the chosen cards
- one image-attribution pass for the chosen cards

## Card List Requirements

The card list should:

- be written in Markdown
- group entries by section
- give each entry a card name
- include a `Type Line` for each entry
- use checkbox items so the user can mark preferred entries
- leave all checkbox items unchecked in the first-pass list
- sort each section by checked boxes, with checked items first

Suggested sections:

- major figures
- secondary figures
- iconic events
- symbolic objects
- major locations
- supporting roles

## Source Boundary

When the set draws from Biblical material:

- use the Bible as the primary source boundary
- use extra-biblical material only as clearly labeled support material
- do not present extra-biblical tradition as though it were a Biblical passage
- prefer canonical passages first for major figures, events, objects, and locations

Useful extra-biblical support material may include:

- early Jewish tradition
- early Christian tradition
- named historical or theological texts
- later interpretive traditions that strongly shaped the subject's visual identity

If extra-biblical material is used, record that clearly in `notes`.

## Quote Sourcing Workflow

Use this workflow once the user has checked the strongest shortlist items and the thread is ready to draft actual card records or polished card concepts.

1. identify the strongest source passage for each selected card
2. prefer one short Biblical quotation when the card maps cleanly to a chapter-and-verse anchor
3. format direct Biblical flavor text like `"Quoted text." — Genesis 2:8`
4. keep the quotation short enough to read cleanly on a card
5. if no strong Biblical quotation fits, either write original flavor text or use a clearly labeled extra-biblical quotation
6. if using an extra-biblical quotation, record the exact work or tradition in `notes`
7. do a final pass for tone, readability, and source honesty

### Quote Rules

- prefer direct Biblical quotations for iconic scenes and named figures
- do not force a quotation onto every card if original flavor text reads better
- keep the quote tied to the card's actual subject, not just the broad set theme
- avoid stitching together multiple passages into one fake quotation
- avoid unattributed extra-biblical lines in `flavorText`
- if the source is uncertain, do not present it as settled

### Field Conventions

When the thread is editing canonical card JSON:

- put the final quote or original line in `flavorText`
- use `notes` to record non-obvious source provenance
- keep unresolved `flavorText` as `null` rather than inventing fake-final text

## Image Sourcing Workflow

Use this workflow once a card has an approved concept and is ready for art sourcing.

1. identify the card's visual subject and tone
2. check the closest relevant style guide before searching
3. prefer reusable or public-domain sources
4. confirm the artist or honest attribution from the source page
5. choose one strong image candidate unless the user asks for options first
6. download the actual image file locally
7. move it into `images/cards/` using the card id plus slug naming pattern
8. update the card JSON to use `image.type: "local"` and the matching `image.path`
9. record image-level attribution on the image asset
10. record the source provenance in `notes`
11. validate after the image is wired in

For Biblical cards, start here:

- [BIBLICAL_IMAGE_STYLE_REFERENCE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference/BIBLICAL_IMAGE_STYLE_REFERENCE.md)
- [CARD_IMAGE_SOURCING_REFERENCE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference/CARD_IMAGE_SOURCING_REFERENCE.md)

## Workflow TODO

- [ ] Gather the source material for the target set or setting slice
- [ ] Build the first-pass pools for major figures, secondary figures, iconic events, symbolic objects, major locations, and supporting roles
- [ ] Generate names, titles, and type lines for each item
- [ ] Write the results into a Markdown card list
- [ ] Ask the user to check the items they prefer
- [ ] Sort each section by checked boxes, with checked items first
- [ ] Revise titles and type lines based on the selected items
- [ ] For chosen cards, pull one strong quote candidate from the primary source material where appropriate
- [ ] For chosen cards, pull clearly labeled extra-biblical support quotations only when they add real value
- [ ] For chosen cards, source one image candidate using reusable or public-domain art when possible
- [ ] For chosen cards, confirm the artist or honest attribution from the image source page
- [ ] Record quote and image provenance in `notes` when editing canonical card JSON
- [ ] Store illustrator attribution on the image asset when editing canonical card JSON
- [ ] Repeat until the list has a strong shortlist

## Example Output

Use this as the main example of what the card list should look like:

- [PATRIARCHS_CARD_LIST.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/content/biblical-series/PATRIARCHS_CARD_LIST.md)

## Rules And Type References

For deeper rules and type guidance, use the full reference folder:

- [REFERENCE_INDEX.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference/REFERENCE_INDEX.md)
- [docs/reference/](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference)

Most useful starting references:

- [MAGIC_TYPE_TAXONOMY.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference/MAGIC_TYPE_TAXONOMY.md)
- [KEYWORD_ABILITIES.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference/KEYWORD_ABILITIES.md)
- [KEYWORD_ACTIONS.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference/KEYWORD_ACTIONS.md)

## Guidance

- go straight to the card list rather than writing a separate brief
- do not invent new card types unless there is a strong reason
- prefer official MTG type language
- keep names flavorful but readable
- use noncreature frames when they fit the concept better
- prioritize iconic people, events, objects, and places before minor material
- for Biblical sets, prefer Scripture first and label extra-biblical support material honestly
- when moving from list creation into card JSON, follow the existing `flavorText`, `notes`, `images/cards/`, and image attribution conventions already used in the repo
