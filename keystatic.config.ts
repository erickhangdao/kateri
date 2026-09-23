import { collection, config, fields, singleton } from "@keystatic/core";
import { createElement, useRef } from "react";

const text = (label: string, multiline = false) =>
  fields.text({ label, multiline });
const url = (label: string) => fields.url({ label });
type Asset = { data: Uint8Array; extension: string; filename: string } | null;
async function convertToWebp(value: NonNullable<Asset>): Promise<NonNullable<Asset>> {
  const inputType: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    avif: "image/avif",
  };
  const type = inputType[value.extension.toLowerCase()];
  if (!type) throw new Error("Upload a PNG, JPEG, AVIF, or WebP image.");
  const source = new Blob([Uint8Array.from(value.data)], { type });
  const bitmap = await createImageBitmap(source);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image conversion is unavailable in this browser.");
    context.drawImage(bitmap, 0, 0);
    const encoded = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("WebP conversion failed.")),
        "image/webp",
        0.92,
      );
    });
    if (encoded.type !== "image/webp")
      throw new Error("This browser cannot create WebP images.");
    return {
      data: new Uint8Array(await encoded.arrayBuffer()),
      extension: "webp",
      filename: value.filename.replace(/\.[^.]+$/, "") + ".webp",
    };
  } finally {
    bitmap.close();
  }
}
function safeAsset(
  field: ReturnType<typeof fields.file>,
  extensions: string[],
): ReturnType<typeof fields.file> {
  return {
    ...field,
    serialize(value, args) {
      const clean = (name: string) =>
        name
          .replace(/([a-z])([A-Z])/g, "$1-$2")
          .toLowerCase()
          .replace(/[^a-z0-9./_-]/g, "-");
      return field.serialize(
        value
          ? {
              ...value,
              extension: value.extension.toLowerCase(),
              filename: clean(value.filename),
            }
          : value,
        {
          ...args,
          suggestedFilenamePrefix: args.suggestedFilenamePrefix
            ? clean(args.suggestedFilenamePrefix)
            : undefined,
        },
      );
    },
    validate(value: Asset) {
      if (value) {
        if (!extensions.includes(value.extension.toLowerCase()))
          throw new Error(
            extensions.length === 1 && extensions[0] === "webp"
              ? "Wait for WebP conversion to finish, or upload a WebP file."
              : `Allowed file types: ${extensions.join(", ")}`,
          );
        if (
          extensions.length === 1 &&
          extensions[0] === "webp" &&
          !(
            new TextDecoder().decode(value.data.slice(0, 4)) === "RIFF" &&
            new TextDecoder().decode(value.data.slice(8, 12)) === "WEBP"
          )
        )
          throw new Error("The image must contain valid WebP data.");
        if (value.data.byteLength > 20 * 1024 * 1024)
          throw new Error("Files must be smaller than 20 MB.");
        const header = new TextDecoder().decode(value.data.slice(0, 512));
        if (/^MZ|^\x7fELF|<script|<\?php/i.test(header.trim()))
          throw new Error("Executable files are not permitted.");
      }
      return field.validate(value);
    },
  };
}
const image = (label: string) => {
  const field = safeAsset(
    fields.image({
      label,
      description: "PNG, JPEG, and AVIF uploads are converted to WebP before saving.",
      directory: "src/assets/images",
      publicPath: "/src/assets/images/",
    }),
    ["webp"],
  );
  function WebpImageInput(props: Parameters<typeof field.Input>[0]) {
    const currentUpload = useRef(0);
    return createElement(field.Input, {
      ...props,
      onChange(value) {
        const upload = ++currentUpload.current;
        props.onChange(value);
        if (!value || value.extension.toLowerCase() === "webp") return;
        void convertToWebp(value)
          .then((converted) => {
            if (upload === currentUpload.current) props.onChange(converted);
          })
          .catch(() => {
            // A failed conversion leaves an invalid selection that cannot be saved.
          });
      },
    });
  }
  return { ...field, Input: WebpImageInput };
};
const file = (
  label: string,
  folder = "documents",
  accept = ".pdf,.docx,.xlsx,.pptx,.txt,.csv",
) =>
  safeAsset(
    fields.file({
      label,
      description: `Public blank documents only. Accepted: ${accept}. Maximum 20 MB.`,
      directory: folder ? `public/uploads/${folder}` : "public/uploads",
      publicPath: folder ? `/uploads/${folder}/` : "/uploads/",
    }),
    accept.split(",").map((extension) => extension.slice(1)),
  );
const notes = text("Editor notes (not displayed publicly)", true);
const order = fields.integer({ label: "Display order", defaultValue: 10 });
const repo = import.meta.env.PUBLIC_GITHUB_REPO || "unconfigured/kateri";

export default config({
  storage:
    import.meta.env.DEV && import.meta.env.PUBLIC_KEYSTATIC_MODE !== "github"
      ? { kind: "local" }
      : { kind: "github", repo: repo as `${string}/${string}` },
  ui: { brand: { name: "Liên Đoàn Kateri" } },
  collections: {
    announcements: collection({
      label: "Announcements",
      slugField: "title",
      path: "src/content/announcements/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        titleVi: text("Vietnamese title"),
        published: fields.date({
          label: "Publication date",
          validation: { isRequired: true },
        }),
        summary: text("Short summary", true),
        description: text(
          "Full description (paragraphs separated by a blank line)",
          true,
        ),
        descriptionVi: text("Approved Vietnamese description", true),
        image: image("Announcement image"),
        imageAlt: text("Image description"),
        eventStart: fields.date({ label: "Event start date" }),
        eventEnd: fields.date({ label: "Event end date" }),
        expires: fields.date({
          label: "Show as current through (Ontario date)",
          description:
            "Required for active notices without an event date. The notice moves to the archive afterward.",
        }),
        location: text("Location"),
        registrationUrl: url("Registration URL"),
        registrationDeadline: fields.date({ label: "Registration deadline" }),
        secondaryUrl: url("Additional link"),
        secondaryLabel: text("Additional link label"),
        active: fields.checkbox({ label: "Active", defaultValue: true }),
        featured: fields.checkbox({
          label: "Featured on homepage",
          defaultValue: false,
        }),
        attachments: fields.array(
          fields.object({
            label: text("Download label"),
            file: file("Upload file", "announcements"),
          }),
          {
            label: "Attachments",
            itemLabel: (item) => item.fields.label.value || "Document",
          },
        ),
        englishPdf: file("English announcement PDF", "announcements", ".pdf"),
        vietnamesePdf: file(
          "Vietnamese announcement PDF",
          "announcements",
          ".pdf",
        ),
        sourceUrl: url("Original source (for migration records)"),
        notes,
      },
    }),
    resources: collection({
      label: "Resources & forms",
      slugField: "title",
      path: "src/content/resources/*",
      format: { data: "json" },
      schema: {
        title: fields.slug({
          name: { label: "Title", validation: { isRequired: true } },
        }),
        titleVi: text("Vietnamese title"),
        description: text("Description", true),
        category: fields.select({
          label: "Category",
          options: [
            "Forms",
            "Training",
            "Nội Quy / Policies",
            "Liturgical / Prayer",
            "Nghiên Huấn",
            "Administrative",
            "Other",
          ].map((value) => ({ label: value, value })),
          defaultValue: "Forms",
        }),
        file: file("Upload file", ""),
        externalUrl: url("External URL (use instead of an upload)"),
        language: fields.select({
          label: "Language",
          options: ["English", "Tiếng Việt", "Bilingual"].map((value) => ({
            label: value,
            value,
          })),
          defaultValue: "English",
        }),
        updated: fields.date({
          label: "Publication / update date",
          validation: { isRequired: true },
        }),
        order,
        featured: fields.checkbox({
          label: "Show on homepage",
          defaultValue: false,
        }),
        sourceUrl: url("Original source"),
        notes,
      },
    }),
    chapters: collection({
      label: "Chapters / Các Đoàn",
      slugField: "name",
      path: "src/content/chapters/*",
      format: { data: "json" },
      schema: {
        name: fields.slug({
          name: {
            label: "Official chapter name",
            validation: { isRequired: true },
          },
        }),
        patron: text("Patron saint"),
        city: text("City"),
        province: text("Province"),
        latitude: fields.number({
          label: "Map latitude",
          description:
            "Approximate community centre; leave both coordinates empty to show this chapter only in the list.",
          validation: { min: -90, max: 90 },
        }),
        longitude: fields.number({
          label: "Map longitude",
          validation: { min: -180, max: 180 },
        }),
        parish: text("Parish / community"),
        address: text("Meeting address"),
        phone: text("Public chapter phone"),
        email: text("Public chapter email"),
        termStart: fields.date({ label: "BTV term start" }),
        termEnd: fields.date({ label: "BTV term end" }),
        btv: fields.array(
          fields.object({
            role: text("Role"),
            name: text("Person"),
          }),
          {
            label: "Ban Thường Vụ Đoàn",
            itemLabel: (item) => item.fields.role.value || "Role",
          },
        ),
        website: url("Website"),
        social: url("Social link"),
        image: image("Chapter crest"),
        imageAlt: text("Image description"),
        order,
        notes,
      },
    }),
    leadership: collection({
      label: "Leadership / Ban Thường Vụ",
      slugField: "name",
      path: "src/content/leadership/*",
      format: { data: "json" },
      schema: {
        name: fields.slug({
          name: { label: "Name", validation: { isRequired: true } },
        }),
        prefix: text("Title / religious prefix"),
        role: text("Role"),
        roleVi: text("Vietnamese role"),
        image: image("Portrait"),
        imageAlt: text("Image description"),
        email: text("Public email"),
        biography: text("Biography", true),
        order,
        notes,
      },
    }),
  },
  singletons: {
    settings: singleton({
      label: "Site settings",
      path: "src/content/settings/site",
      format: { data: "json" },
      schema: {
        name: text("Vietnamese name"),
        englishName: text("English name"),
        shortName: text("Short name"),
        affiliation: text("Affiliation"),
        region: text("Region"),
        motto: text("Motto"),
        mottoTranslation: text("Motto translation"),
        introduction: text("Introduction", true),
        introductionVi: text("Approved Vietnamese introduction", true),
        about: text("About introduction (two short paragraphs)", true),
        history: text("League history (Learn more)", true),
        logo: image("League crest"),
        patronImage: image("Patron saint image"),
        patronAlt: text("Patron image description"),
        patronSummary: text("Patron saint introduction", true),
        patronText: text("Full patron saint biography (Learn more)", true),
        patronFacts: text("Patron saint dates (one Label: value per line)", true),
        contactEmail: text("Contact email"),
        contactText: text("Contact invitation", true),
        facebook: url("Facebook"),
        instagram: url("Instagram"),
        veymUrl: url("VEYM Canada URL"),
        leadershipTerm: text("Leadership term"),
        leadershipIntro: text("Leadership introduction", true),
        footer: text("Footer text"),
        seoTitle: text("SEO title"),
        seoDescription: text("SEO description", true),
        ogImage: image("Default social image"),
        notes,
      },
    }),
  },
});
