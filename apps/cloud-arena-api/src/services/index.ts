import {
  createCloudArenaSessionService,
  type CloudArenaSessionService,
} from "./cloud-arena-sessions.js";

import { CLOUD_ARENA_API_NAME } from "../constants.js";

export type CloudArenaApiServices = {
  app: {
    name: string;
  };
  cloudArenaSessions: CloudArenaSessionService;
};

export function createCloudArenaApiServices(): CloudArenaApiServices {
  return {
    app: {
      name: CLOUD_ARENA_API_NAME,
    },
    cloudArenaSessions: createCloudArenaSessionService(),
  };
}
