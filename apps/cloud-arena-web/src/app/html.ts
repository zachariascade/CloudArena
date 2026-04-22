import { renderCloudArcanumWebHtml } from "./base-html.js";
import type { CloudArenaContentMode, CloudArenaSessionMode } from "../lib/cloud-arena-web-lib.js";

const CLOUD_ARCANUM_CONFIG_SCRIPT_PATTERN =
  /window\.__CLOUD_ARCANUM_CONFIG__ = \{[\s\S]*?\};/;

export function renderCloudArenaWebHtml(
  cloudArcanumApiBaseUrl: string,
  arenaApiBaseUrl: string,
  cloudArcanumWebBaseUrl: string,
  contentMode: CloudArenaContentMode = "remote",
  sessionMode: CloudArenaSessionMode = "remote",
  routerMode: "browser" | "hash" = "browser",
  clientScriptSrc = "/assets/app.js",
  liveReload = false,
): string {
  const liveReloadScript = liveReload
    ? `<script>
        (function () {
          var endpoint = "/__cloud-arena-dev-version";
          var currentVersion = null;
          var isReloading = false;

          function reloadWhenChanged() {
            fetch(endpoint, { cache: "no-store" })
              .then(function (response) {
                return response.text();
              })
              .then(function (nextVersion) {
                if (currentVersion === null) {
                  currentVersion = nextVersion;
                  return;
                }

                if (nextVersion !== currentVersion && !isReloading) {
                  isReloading = true;
                  window.location.reload();
                }
              })
              .catch(function () {
                /* ignore transient reload probe failures */
              });
          }

          reloadWhenChanged();
          window.setInterval(reloadWhenChanged, 1000);
        })();
      </script>`
    : "";

  return renderCloudArcanumWebHtml(cloudArcanumApiBaseUrl, arenaApiBaseUrl)
    .replace("<title>Cloud Arcanum</title>", "<title>Cloud Arena</title>")
    .replace(
      CLOUD_ARCANUM_CONFIG_SCRIPT_PATTERN,
      `window.__CLOUD_ARCANUM_CONFIG__ = {
        apiBaseUrl: ${JSON.stringify(cloudArcanumApiBaseUrl)}
      };
      window.__CLOUD_ARENA_CONFIG__ = {
        apiBaseUrl: ${JSON.stringify(arenaApiBaseUrl)},
        contentMode: ${JSON.stringify(contentMode)},
        sessionMode: ${JSON.stringify(sessionMode)},
        routerMode: ${JSON.stringify(routerMode)},
        cloudArcanumApiBaseUrl: ${JSON.stringify(cloudArcanumApiBaseUrl)},
        cloudArcanumWebBaseUrl: ${JSON.stringify(cloudArcanumWebBaseUrl)}
      };`,
    )
    .replace('src="/assets/app.js"', `src=${JSON.stringify(clientScriptSrc)}`)
    .replace("</body>", `${liveReloadScript}</body>`);
}
