# Cloud Arena Web

This app owns the Arena frontend.

Use this app for:

- interactive battle UI
- legacy replay and trace viewer UI
- Arena-specific API clients and view models
- Arena display models and battle presentation

Do not add new gameplay features to the replay surface; treat it as frozen
support code that may eventually be removed.

Avoid depending on Arcanum implementation code. If you need a link back to Arcanum, keep it at the URL/config level.
