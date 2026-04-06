# Card Concepts Export

This folder contains a flattened concept export for every entry found in the Biblical card-list markdown files under `docs/content/biblical-series/`.

The generated CSV keeps each original list entry, strips it down to a simpler display name, and assigns a broad concept label:

- `Genesis` for the Early World and Patriarchs lists
- `Gospels` for the Messianic Fulfillment list

Current output:

- `all-card-concepts.csv`

To regenerate it after the card lists change:

```bash
npm run export:card-concepts
```

CSV columns:

- `simple_name`: stripped name, usually the part before the comma
- `where_its_from`: broad concept label such as `Genesis` or `Gospels`
