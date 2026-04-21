import { startCloudArenaApiServer } from "../apps/cloud-arena-api/src/server.js";

const location = await startCloudArenaApiServer();

console.log(`Cloud Arena API listening at http://${location.host}:${location.port}`);
