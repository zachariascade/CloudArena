# Src

This folder is split by ownership.

- `domain/` is the small shared schema layer
- `cloud-arena/` is Arena-owned product logic

Default rule:

- do not add `src/shared/` unless there is a concrete, clearly domain-neutral need
- prefer product-owned modules over premature sharing
