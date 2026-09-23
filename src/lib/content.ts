import { getEntry } from "astro:content";
import type { ImageMetadata } from "astro";

const images = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.webp",
  { eager: true },
);
export function managedImage(path: string) {
  const image = images[path]?.default;
  if (!image) throw new Error(`Managed image not found: ${path}`);
  return image;
}
export async function siteSettings() {
  const entry = await getEntry("settings", "site");
  if (!entry) throw new Error("Site settings are missing");
  return entry.data;
}
export type Settings = Awaited<ReturnType<typeof siteSettings>>;
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
export const fileType = (value: string) =>
  value.split(".").pop()?.toUpperCase() || "FILE";
export const paragraphs = (value: string) =>
  value.split(/\n\s*\n/).filter(Boolean);
export const byOrder = <T extends { data: { order: number } }>(a: T, b: T) =>
  a.data.order - b.data.order;
