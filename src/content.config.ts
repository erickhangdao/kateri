import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const optionalText = z
  .string()
  .nullish()
  .transform((value) => value || "");
const webUrl = optionalText.refine(
  (value) => !value || /^https?:\/\//.test(value),
  "Use an http(s) URL",
);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalDate = date
  .or(z.literal(""))
  .nullish()
  .transform((value) => value || "");
const imageFields = { image: optionalText, imageAlt: optionalText };
const loader = (name: string) =>
  glob({ pattern: "*.json", base: `./src/content/${name}` });
const announcements = defineCollection({
  loader: loader("announcements"),
  schema: z.object({
    title: z.string(),
    titleVi: optionalText,
    published: date,
    summary: z.string(),
    description: z.string(),
    descriptionVi: optionalText,
    ...imageFields,
    eventStart: optionalDate,
    eventEnd: optionalDate,
    expires: optionalDate,
    location: optionalText,
    registrationUrl: webUrl,
    registrationDeadline: optionalDate,
    secondaryUrl: webUrl,
    secondaryLabel: optionalText,
    active: z.boolean(),
    featured: z.boolean(),
    attachments: z
      .array(z.object({ label: z.string(), file: z.string() }))
      .default([]),
    englishPdf: optionalText,
    vietnamesePdf: optionalText,
    sourceUrl: webUrl,
    notes: optionalText,
  }),
});
const resources = defineCollection({
  loader: loader("resources"),
  schema: z.object({
    title: z.string(),
    titleVi: optionalText,
    description: z.string(),
    category: z.string(),
    file: optionalText,
    externalUrl: webUrl,
    language: z.string(),
    updated: date,
    order: z.number(),
    featured: z.boolean(),
    sourceUrl: webUrl,
    notes: optionalText,
  }),
});
const chapters = defineCollection({
  loader: loader("chapters"),
  schema: z.object({
    name: z.string(),
    patron: optionalText,
    city: z.string(),
    province: z.string(),
    latitude: z.number().min(-90).max(90).nullish(),
    longitude: z.number().min(-180).max(180).nullish(),
    parish: optionalText,
    website: webUrl,
    social: webUrl,
    ...imageFields,
    order: z.number(),
    notes: optionalText,
  }),
});
const leadership = defineCollection({
  loader: loader("leadership"),
  schema: z.object({
    name: z.string(),
    prefix: optionalText,
    role: z.string(),
    roleVi: optionalText,
    ...imageFields,
    email: optionalText,
    biography: optionalText,
    order: z.number(),
    notes: optionalText,
  }),
});
const settings = defineCollection({
  loader: loader("settings"),
  schema: z.object({
    name: z.string(),
    englishName: z.string(),
    shortName: z.string(),
    affiliation: z.string(),
    region: z.string(),
    motto: z.string(),
    mottoTranslation: z.string(),
    introduction: z.string(),
    introductionVi: optionalText,
    about: z.string(),
    history: z.string(),
    logo: z.string(),
    patronImage: optionalText,
    patronAlt: optionalText,
    patronText: z.string(),
    contactEmail: z.email(),
    contactText: z.string(),
    facebook: webUrl,
    instagram: webUrl,
    veymUrl: webUrl,
    leadershipTerm: z.string(),
    leadershipIntro: z.string(),
    footer: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    ogImage: z.string(),
    notes: optionalText,
  }),
});
export const collections = {
  announcements,
  resources,
  chapters,
  leadership,
  settings,
};
