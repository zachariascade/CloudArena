import { z } from "zod";

import {
  baseNamedEntitySchema,
  setIdSchema,
  setThemeSchema,
  themeIdSchema,
  universeIdSchema,
} from "./types.js";

export const setSchema = baseNamedEntitySchema(setIdSchema).extend({
  universeId: universeIdSchema,
  code: z.string().regex(/^[A-Z0-9]{2,8}$/),
  description: z.string().nullable(),
  themes: z.array(setThemeSchema).optional(),
  defaultThemeId: themeIdSchema.optional(),
  activeThemeId: themeIdSchema.optional(),
}).superRefine((value, ctx) => {
  const themeIds = value.themes?.map((theme) => theme.id) ?? [];

  if (new Set(themeIds).size !== themeIds.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Theme IDs must be unique.",
      path: ["themes"],
    });
  }

  if (value.defaultThemeId && !themeIds.includes(value.defaultThemeId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "defaultThemeId must reference a declared theme.",
      path: ["defaultThemeId"],
    });
  }

  if (value.activeThemeId && !themeIds.includes(value.activeThemeId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "activeThemeId must reference a declared theme.",
      path: ["activeThemeId"],
    });
  }
});

export type SetRecord = z.infer<typeof setSchema>;
