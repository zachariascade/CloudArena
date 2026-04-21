# Apps

This folder contains the active app boundaries for Cloud Arena.

- `cloud-arena-api/` owns Arena sessions, actions, and battle API behavior
- `cloud-arena-web/` owns Arena battle and replay UI

Default rule:

- product code should stay inside its own app pair
- integrations should happen through narrow URLs, APIs, or shared `src/domain/**` primitives
