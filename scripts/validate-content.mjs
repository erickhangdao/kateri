import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { resolve, extname } from "node:path";

const root = process.cwd();
const failures = [];
const documentTypes = new Set([
  ".pdf",
  ".docx",
  ".xlsx",
  ".pptx",
  ".txt",
  ".csv",
]);
const imageTypes = new Set([".webp"]);
const paths = [];
const dates = [
  "published",
  "updated",
  "eventStart",
  "eventEnd",
  "expires",
  "registrationDeadline",
];
function validate(value, path = "") {
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) {
    const location = `${path}.${key}`;
    if (typeof item === "object") {
      validate(item, location);
      continue;
    }
    if (typeof item !== "string" || !item) continue;
    if (
      dates.includes(key) &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(item) ||
        new Date(`${item}T12:00:00Z`).toISOString().slice(0, 10) !== item)
    )
      failures.push(`${location}: invalid date`);
    if (
      [
        "file",
        "englishPdf",
        "vietnamesePdf",
        "image",
        "patronImage",
        "logo",
        "ogImage",
      ].includes(key)
    ) {
      const isDocument = ["file", "englishPdf", "vietnamesePdf"].includes(key);
      const allowed = isDocument
        ? /^\/uploads\/[a-z0-9][a-z0-9._/-]*$/
        : /^\/src\/assets\/images\/[a-z0-9][a-z0-9._/-]*$/;
      if (
        !allowed.test(item) ||
        item.includes("..") ||
        item.includes("//") ||
        !(isDocument ? documentTypes : imageTypes).has(
          extname(item).toLowerCase(),
        )
      )
        failures.push(
          `${location}: invalid or unsafe upload path ${item}. Use lowercase letters, digits and hyphens.`,
        );
      const local = resolve(root, isDocument ? `public${item}` : item.slice(1));
      if (!existsSync(local))
        failures.push(`${location}: file does not exist: ${item}`);
      else paths.push(local);
      if (
        (key === "englishPdf" || key === "vietnamesePdf") &&
        extname(item) !== ".pdf"
      )
        failures.push(`${location}: must be a PDF`);
    }
    if (
      [
        "website",
        "social",
        "facebook",
        "instagram",
        "veymUrl",
        "externalUrl",
        "registrationUrl",
        "secondaryUrl",
        "sourceUrl",
      ].includes(key)
    ) {
      try {
        const url = new URL(item);
        if (
          !["http:", "https:"].includes(url.protocol) ||
          url.username ||
          url.password
        )
          throw new Error();
      } catch {
        failures.push(`${location}: invalid web URL`);
      }
    }
    if (
      ["email", "contactEmail"].includes(key) &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item)
    )
      failures.push(`${location}: invalid email`);
  }
}
for (const type of [
  "announcements",
  "resources",
  "chapters",
  "leadership",
  "settings",
]) {
  for (const name of readdirSync(`src/content/${type}`)) {
    if (!/^[a-z0-9-]+\.json$/.test(name)) {
      failures.push(`Invalid content filename ${name}`);
      continue;
    }
    const entry = JSON.parse(
      readFileSync(`src/content/${type}/${name}`, "utf8"),
    );
    validate(entry, `${type}/${name}`);
    if (type === "announcements") {
      if (
        entry.eventEnd &&
        (!entry.eventStart || entry.eventEnd < entry.eventStart)
      )
        failures.push(`${name}: event end must follow start`);
      if (entry.expires && entry.eventEnd && entry.expires > entry.eventEnd)
        failures.push(
          `${name}: a completed event cannot remain current; create a separate follow-up notice`,
        );
      if (entry.active && !entry.expires && !entry.eventStart)
        failures.push(`${name}: set an expiry date for an active notice`);
      if (entry.image && !entry.imageAlt)
        failures.push(`${name}: describe the announcement image`);
      for (const attachment of entry.attachments || [])
        if (!attachment.file || !attachment.label?.trim())
          failures.push(`${name}: each attachment needs a file and a label`);
    }
    if (
      type === "resources" &&
      Boolean(entry.file) === Boolean(entry.externalUrl)
    )
      failures.push(`${name}: choose exactly one file or external URL`);
  }
}
function inspectUploads(directory, allowed) {
  if (!existsSync(directory)) return;
  for (const file of readdirSync(directory, { withFileTypes: true })) {
    const path = `${directory}/${file.name}`;
    if (file.isDirectory()) inspectUploads(path, allowed);
    else if (file.name !== ".gitkeep") {
      if (!allowed.has(extname(file.name).toLowerCase()))
        failures.push(`Disallowed uploaded file: ${path}`);
      if (!/^[a-z0-9][a-z0-9._-]*$/.test(file.name))
        failures.push(
          `Rename upload using lowercase letters, digits and hyphens: ${path}`,
        );
      if (statSync(path).size > 20 * 1024 * 1024)
        failures.push(`Upload exceeds 20 MB: ${path}`);
      const header = readFileSync(path).subarray(0, 512).toString("latin1");
      const ext = extname(file.name).toLowerCase();
      if (ext === ".webp" && !(header.startsWith("RIFF") && header.slice(8, 12) === "WEBP"))
        failures.push(`Invalid WebP signature: ${path}`);
      if (ext === ".pdf" && !header.startsWith("%PDF-"))
        failures.push(`Invalid PDF signature: ${path}`);
      if ([".docx", ".xlsx", ".pptx"].includes(ext) && !header.startsWith("PK"))
        failures.push(`Invalid Office document signature: ${path}`);
      if (/^MZ|^\x7fELF|<script|<\?php/i.test(header.trim()))
        failures.push(`Executable content detected: ${path}`);
    }
  }
}
inspectUploads("public/uploads", documentTypes);
inspectUploads("src/assets/images", imageTypes);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  `Content validated: dates, links, attachments, safe upload paths and ${new Set(paths).size} referenced assets.`,
);
