import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import { readdirSync, readFileSync } from "node:fs";
import { ontarioToday } from "./src/lib/announcements.mjs";

const pages = [
  "/",
  "/resources/",
  "/announcements/",
  "/privacy/",
  ...readdirSync("./src/content/announcements")
    .filter(
      (file) =>
        file.endsWith(".json") &&
        JSON.parse(readFileSync(`./src/content/announcements/${file}`, "utf8"))
          .published <= ontarioToday(),
    )
    .map((file) => `/announcements/${file.slice(0, -5)}/`),
];

export default defineConfig({
  site: "https://kateri.veym.ca",
  output: "server",
  // This small brochure site benefits from avoiding a CSS request before paint.
  build: { inlineStylesheets: "always" },
  adapter: node({ mode: "standalone" }),
  integrations: [
    react(),
    keystatic(),
    sitemap({
      customPages: pages.map((path) => `https://kateri.veym.ca${path}`),
      filter: (url) => !/keystatic|\/api\/|\/404/.test(url),
    }),
  ],
  // Keystatic's API uses extensionless URLs without trailing slashes.
  trailingSlash: "ignore",
  devToolbar: { enabled: false },
  vite: {
    // Keystatic is a separate editor application (~2.8 MB before compression).
    // Public pages do not load it. Preserve its dependency ordering and apply
    // an explicit editor budget instead of manually splitting vendor modules.
    build: { chunkSizeWarningLimit: 3000 },
    server: {
      watch: { usePolling: process.platform === "win32", interval: 250 },
    },
  },
  server: { host: "127.0.0.1" },
  image: { service: { entrypoint: "astro/assets/services/sharp" } },
});
