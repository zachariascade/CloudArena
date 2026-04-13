# Apps

This folder contains the product app boundaries for the monorepo.

- `cloud-arcanum-api/` owns MTG-style catalog, metadata, and validation APIs
- `cloud-arcanum-web/` owns Arcanum browsing, display, and deck-oriented UI
- `cloud-arena-api/` owns Arena sessions, actions, and battle API behavior
- `cloud-arena-web/` owns Arena battle and replay UI

Default rule:

- product code should stay inside its own app pair
- cross-product integrations should happen through narrow URLs, APIs, or shared `src/domain/**` primitives
