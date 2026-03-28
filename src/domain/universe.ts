import { z } from "zod";

import { baseNamedEntitySchema, universeIdSchema } from "./types.js";

export const universeSchema = baseNamedEntitySchema(universeIdSchema).extend({
  description: z.string().nullable(),
});

export type Universe = z.infer<typeof universeSchema>;
