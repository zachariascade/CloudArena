import React from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { createCloudArcanumRouter } from "../routes/index.js";
import { getCloudArcanumRuntimeConfig } from "../lib/index.js";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Cloud Arcanum root container was not found.");
}

const runtimeConfig = getCloudArcanumRuntimeConfig();
const router = createCloudArcanumRouter(runtimeConfig);
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
