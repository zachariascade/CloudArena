#!/bin/sh

set -eu

if command -v /opt/homebrew/bin/node >/dev/null 2>&1; then
  exec /opt/homebrew/bin/node "$@"
fi

CURRENT_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"

if [ "$CURRENT_MAJOR" -ge 18 ]; then
  exec node "$@"
fi

echo "Cloud Arcanum requires Node 18+. Install or activate a newer Node runtime." >&2
exit 1
