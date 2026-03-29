# Card Image Sourcing Reference

Use this document when a thread needs to find, download, and wire external card images into Cloud Arcanum.

## Goal

Future AI threads should be able to:

- find one suitable image source on the internet
- prefer reusable or public-domain sources
- automatically use the chosen image unless the user asks for options first
- download the chosen file locally
- store it where the app can render it
- update card JSON correctly
- record artist attribution on the image asset

## Default Workflow

Unless the user asks for multiple options first:

1. find one strong image candidate
2. confirm that the source has clear reuse rights
3. confirm the artist or other honest attribution from the source page
4. download the image
5. move it into `images/cards/`
6. update the card JSON to use the local file
7. record source provenance in `notes`
8. validate

## Best Prompt Pattern

When asking an AI thread to source an image, specify:

- the card name
- the desired tone or setting
- the source restrictions
- whether the thread should automatically download and wire the image

Good prompt example:

`Find one reusable or public-domain image for this card, download it into the project, and update the card JSON to use the local file.`

## Source Priorities

Prefer sources in this order:

1. museum or gallery open-access downloads
2. Wikimedia Commons public-domain files
3. other clearly reusable sources with explicit license terms

Prefer source pages that clearly identify:

- the artist
- the work title
- the source institution or collection
- the rights statement

Avoid:

- Pinterest reposts
- random blog mirrors
- low-resolution graphics
- sources without a clear rights statement

## Style Guidance

For Biblical cards, use the dedicated style guide:

- [BIBLICAL_IMAGE_STYLE_REFERENCE.md](/Users/cadezacharias/Documents/MTG/Cloud%20Arcanum/docs/reference/BIBLICAL_IMAGE_STYLE_REFERENCE.md)

If the card belongs to another universe or aesthetic, follow the closest relevant art direction for that setting instead.

## Download Workflow

1. Find a source page with a clear license or public-domain statement.
2. If possible, get the direct download URL rather than saving the HTML page URL as the asset.
3. Download the file into the repo.
4. Move the final renderable file into `images/cards/`.
5. Rename it to match the card file naming pattern.

Preferred image filename pattern:

- `images/cards/card_XXXX_slug.jpg`
- `images/cards/card_XXXX_slug.webp`
- `images/cards/card_XXXX_slug.avif`

Generic example:

- `images/cards/card_XXXX_card_slug.jpg`

## Important App Rule

Do not leave locally rendered card images in `assets/reference/` if the goal is to show them in the web app.

The app only treats local card images as renderable when:

- the card JSON uses `image.type: "local"`
- the `image.path` points to a file under `images/cards/`
- that exact relative path exists in the image inventory

This works:

```json
"image": {
  "type": "local",
  "path": "images/cards/card_XXXX_card_slug.jpg",
  "artist": "Confirmed Artist Name"
}
```

This does not render in the app as card art:

```json
"image": {
  "type": "local",
  "path": "assets/reference/sourced-image.jpg"
}
```

## Card JSON Update Rules

When a card image is finalized locally:

- set `image.type` to `local`
- set `image.path` to the `images/cards/...` relative path
- set `image.artist` when the attribution is confirmed
- optionally set `image.sourceUrl`, `image.license`, `image.creditText`, and `image.sourceNotes`
- update `notes` with a short provenance summary

Important:

- attribution belongs on the image asset, not only on the card root
- if a card has themed image variants, each variant should carry its own attribution
- do not guess the artist from style alone
- if the artist cannot be confirmed, leave the field blank rather than inventing one

Generic note pattern:

`Local reference image downloaded from a reusable or public-domain source and moved into images/cards for in-app rendering.`

If the image is still only a source page and has not been downloaded yet:

- `image.type` may be `remote`
- `image.path` may be the source URL

But that is a sourcing step, not the preferred final in-app state.

## Validation Step

After downloading or rewiring image paths:

1. run `npm run check`
2. run the validator

Recommended command:

```bash
./scripts/node18.sh ./node_modules/typescript/bin/tsc -p tsconfig.json && ./scripts/node18.sh dist/scripts/validate.js
```

## Minimal Checklist

- [ ] source has a clear rights statement
- [ ] source identifies the artist, or the attribution is honestly marked unknown
- [ ] image fits the card's style direction
- [ ] one final image has been selected
- [ ] file is downloaded locally
- [ ] file is moved into `images/cards/`
- [ ] filename matches the card id and slug pattern
- [ ] card JSON uses `image.type: "local"`
- [ ] card JSON points at `images/cards/...`
- [ ] card JSON includes `image.artist` when confirmed
- [ ] provenance note is recorded
- [ ] validation passes
