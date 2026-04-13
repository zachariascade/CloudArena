import { renderCloudArcanumWebHtml } from "./base-html.js";

const CLOUD_ARCANUM_CONFIG_SCRIPT_PATTERN =
  /window\.__CLOUD_ARCANUM_CONFIG__ = \{[\s\S]*?\};/;

export function renderCloudArenaWebHtml(
  cloudArcanumApiBaseUrl: string,
  arenaApiBaseUrl: string,
  cloudArcanumWebBaseUrl: string,
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
        cloudArcanumApiBaseUrl: ${JSON.stringify(cloudArcanumApiBaseUrl)},
        cloudArcanumWebBaseUrl: ${JSON.stringify(cloudArcanumWebBaseUrl)}
      };`,
    );
}
