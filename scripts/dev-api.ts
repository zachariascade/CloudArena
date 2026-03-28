import { startCloudArcanumApiServer } from "../apps/cloud-arcanum-api/src/server.js";

const location = await startCloudArcanumApiServer();

console.log(`Cloud Arcanum API listening at http://${location.host}:${location.port}`);
