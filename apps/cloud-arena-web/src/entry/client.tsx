import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { createCloudArenaRouter } from "../routes/index.js";
import { getCloudArenaRuntimeConfig } from "../lib/cloud-arena-web-lib.js";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Cloud Arena root container was not found.");
}

const runtimeConfig = getCloudArenaRuntimeConfig();
const router = createCloudArenaRouter(runtimeConfig);
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
