import { startCloudArenaWebApp } from "../apps/cloud-arena-web/src/app/index.js";

const location = await startCloudArenaWebApp();

console.log(
  `Cloud Arena web app listening at http://${location.host}:${location.port} (Arena API: ${location.apiBaseUrl})`,
);
