# Cloud Arena Web

Cloud Arena can run as a fully static app with local content, local deck storage, and browser-local battle sessions.

## Static Build

```bash
npm run build:arena:static
```

The static site is emitted to:

```text
dist/apps/cloud-arena-web/static
```

The static build uses hash routing, so GitHub Pages routes look like:

```text
/#/
/#/decks
```

Card art is copied into `images/cards` inside the static output and is loaded with relative URLs.

## Preview

```bash
npm run preview:arena:static
```

The preview server defaults to:

```text
http://127.0.0.1:4322
```

## GitHub Pages

The workflow at `.github/workflows/deploy-cloud-arena.yml` builds and deploys `dist/apps/cloud-arena-web/static`.

Repository Pages settings should use GitHub Actions as the source.
