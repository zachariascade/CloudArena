import { z } from "zod";

import { baseNamedEntitySchema, setIdSchema, universeIdSchema } from "./types.js";

export const setSchema = baseNamedEntitySchema(setIdSchema).extend({
  universeId: universeIdSchema,
  code: z.string().regex(/^[A-Z0-9]{2,8}$/),
  description: z.string().nullable(),
});

export type SetRecord = z.infer<typeof setSchema>;
