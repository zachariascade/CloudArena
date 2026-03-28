import { z } from "zod";

export const entityIdPrefixes = ["card", "deck", "set", "universe"] as const;
export type EntityIdPrefix = (typeof entityIdPrefixes)[number];

export type EntityId<TPrefix extends EntityIdPrefix> = `${TPrefix}_${string}`;

export type CardId = EntityId<"card">;
export type DeckId = EntityId<"deck">;
export type SetId = EntityId<"set">;
export type UniverseId = EntityId<"universe">;

export type ISODateTimeString = string;
export type Slug = string;

export const cardStatuses = [
  "draft",
  "templating",
  "balanced",
  "approved",
] as const;
export type CardStatus = (typeof cardStatuses)[number];

export const cardColors = ["W", "U", "B", "R", "G", "C"] as const;
export type CardColor = (typeof cardColors)[number];

export const cardRarities = [
  "common",
  "uncommon",
  "rare",
  "mythic",
  "special",
  "bonus",
] as const;
export type CardRarity = (typeof cardRarities)[number];

export const isoDateTimeSchema = z.string().datetime({ offset: true });
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/);

export const cardIdSchema = z
  .string()
  .regex(/^card_[a-z0-9]+(?:_[a-z0-9]+)*$/) as z.ZodType<CardId>;
export const deckIdSchema = z
  .string()
  .regex(/^deck_[a-z0-9]+(?:_[a-z0-9]+)*$/) as z.ZodType<DeckId>;
export const setIdSchema = z
  .string()
  .regex(/^set_[a-z0-9]+(?:_[a-z0-9]+)*$/) as z.ZodType<SetId>;
export const universeIdSchema = z
  .string()
  .regex(/^universe_[a-z0-9]+(?:_[a-z0-9]+)*$/) as z.ZodType<UniverseId>;

export const cardStatusSchema = z.enum(cardStatuses);
export const cardColorSchema = z.enum(cardColors);
export const cardRaritySchema = z.enum(cardRarities);

export const imageReferenceSchema = z.object({
  type: z.enum(["local", "remote", "generated", "placeholder"]),
  path: z.string().nullable(),
});

export const imagePromptSchema = z.object({
  version: z.literal("v1"),
  subject: z.string().min(1),
  scene: z.string().nullable(),
  composition: z.string().nullable(),
  lighting: z.string().nullable(),
  palette: z.string().nullable(),
  mood: z.string().nullable(),
  medium: z.string().nullable(),
  styleProfile: z.string().nullable(),
  negativePrompt: z.string().nullable(),
  notes: z.string().nullable(),
});

export const baseNamedEntitySchema = <TId extends z.ZodType<string>>(
  idSchema: TId,
) =>
  z.object({
    id: idSchema,
    name: z.string().min(1),
  });

export const uniqueStringArray = () =>
  z.array(z.string()).superRefine((value, ctx) => {
    if (new Set(value).size !== value.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Array items must be unique.",
      });
    }
  });

export const uniqueEnumArray = <TValues extends readonly [string, ...string[]]>(
  values: TValues,
) =>
  z.array(z.enum(values)).superRefine((value, ctx) => {
    if (new Set(value).size !== value.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Array items must be unique.",
      });
    }
  });

export type ImageReference = z.infer<typeof imageReferenceSchema>;
export type ImagePrompt = z.infer<typeof imagePromptSchema>;
export type BaseNamedEntity<TId extends EntityId<EntityIdPrefix>> = {
  id: TId;
  name: string;
};
