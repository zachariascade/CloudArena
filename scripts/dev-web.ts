import { startCloudArcanumWebApp } from "../apps/cloud-arcanum-web/src/app/index.js";

const location = await startCloudArcanumWebApp();

console.log(
  `Cloud Arcanum web app listening at http://${location.host}:${location.port} (API: ${location.apiBaseUrl})`,
);
