import { z } from "zod";

import {
  baseNamedEntitySchema,
  cardIdSchema,
  deckIdSchema,
  setIdSchema,
  uniqueStringArray,
  universeIdSchema,
} from "./types.js";

export const deckCardEntrySchema = z.object({
  cardId: cardIdSchema,
  quantity: z.number().int().min(1),
});

export const deckSchema = baseNamedEntitySchema(deckIdSchema).extend({
  universeId: universeIdSchema,
  setIds: z.array(setIdSchema).superRefine((value, ctx) => {
    if (new Set(value).size !== value.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "setIds must be unique.",
      });
    }
  }),
  format: z.string().min(1),
  commander: cardIdSchema.nullable(),
  cards: z.array(deckCardEntrySchema).min(1),
  tags: uniqueStringArray(),
  notes: z.string().nullable(),
});

export type DeckCardEntry = z.infer<typeof deckCardEntrySchema>;
export type Deck = z.infer<typeof deckSchema>;
