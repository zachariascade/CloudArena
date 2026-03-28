import { z } from "zod";

import {
  baseNamedEntitySchema,
  cardColorSchema,
  cardIdSchema,
  cardRaritySchema,
  cardStatusSchema,
  imagePromptSchema,
  imageReferenceSchema,
  isoDateTimeSchema,
  setIdSchema,
  slugSchema,
  uniqueEnumArray,
  uniqueStringArray,
} from "./types.js";

export const cardSchema = baseNamedEntitySchema(cardIdSchema)
  .extend({
    slug: slugSchema,
    setId: setIdSchema,
    typeLine: z.string().min(1),
    manaCost: z.string().nullable(),
    manaValue: z.number().min(0).nullable(),
    colors: uniqueEnumArray(["W", "U", "B", "R", "G", "C"]),
    colorIdentity: uniqueEnumArray(["W", "U", "B", "R", "G", "C"]),
    rarity: cardRaritySchema.nullable(),
    oracleText: z.string().nullable(),
    flavorText: z.string().nullable(),
    power: z.string().nullable(),
    toughness: z.string().nullable(),
    loyalty: z.string().nullable(),
    defense: z.string().nullable(),
    artist: z.string().nullable(),
    image: imageReferenceSchema,
    imagePrompt: imagePromptSchema.nullable(),
    mechanics: uniqueStringArray(),
    tags: uniqueStringArray(),
    status: cardStatusSchema,
    notes: z.string().nullable(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
  })
  .superRefine((value, ctx) => {
    if (value.status === "balanced" || value.status === "approved") {
      if (value.manaCost === null || value.manaCost.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "manaCost is required when status is balanced or approved.",
          path: ["manaCost"],
        });
      }

      if (value.manaValue === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "manaValue is required when status is balanced or approved.",
          path: ["manaValue"],
        });
      }

      if (value.rarity === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "rarity is required when status is balanced or approved.",
          path: ["rarity"],
        });
      }

      if (value.oracleText === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "oracleText is required when status is balanced or approved.",
          path: ["oracleText"],
        });
      }
    }
  });

export type Card = z.infer<typeof cardSchema>;
