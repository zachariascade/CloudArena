# Cloud Arena API

This app owns the Arena backend.

Use this app for:

- session creation
- action submission
- reset and legacy replay export
- Arena-specific request and response handling

Replay export is kept only for compatibility with the current trace viewer
surface and should not be expanded further.

Avoid adding Arcanum catalog routes here.
