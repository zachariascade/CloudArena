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
): string {
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
    .replace('src="/assets/app.js"', `src=${JSON.stringify(clientScriptSrc)}`);
}
