# Liên Đoàn Kateri Tekakwitha

Astro website for the Kateri Tekakwitha League of Chapters, VEYM Canada. The homepage is one continuous landing page, with an announcement archive and a compact resource library. Keystatic manages all routine organization content.

Completed build, browser, CMS, accessibility, and performance checks are recorded in [the verification report](docs/VERIFICATION.md).

## Start here

| You want to…                                         | Read this                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Upload this folder to a new GitHub repository        | [GitHub handoff](docs/GITHUB_HANDOFF.md)                                                                          |
| Understand the code and make your first change       | [Developer guide](docs/DEVELOPER_GUIDE.md)                                                                        |
| Work with the development team                       | [Contributing](CONTRIBUTING.md)                                                                                   |
| Edit announcements, uploads, chapters, or leadership | [Webmaster instructions below](#for-the-next-webmaster)                                                           |
| Launch the live website                              | [Production setup](#production-github-setup), [deployment](#deployment), and [migration notes](docs/MIGRATION.md) |
| Check asset sources and licenses                     | [Third-party notices](THIRD_PARTY_NOTICES.md)                                                                     |

Git-tracked source excludes installed dependencies and generated build output. A local development folder may still contain them; together they can be far larger than the repository. Everything needed to recreate them is included. Upload the contents of this folder at the repository root, including dotfiles; uploading to GitHub does not by itself deploy the website.

## Run locally

Install Node.js 22.12+ (Node 24 LTS recommended) and npm, then:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:4321/`. The editor is at `http://127.0.0.1:4321/keystatic/`. Local editing needs no GitHub credentials. Keep the development server bound to loopback; it intentionally allows local filesystem editing.

```sh
npm run check     # strict TypeScript and Astro diagnostics
npm test          # announcement expiry, scheduling, and registration tests
npm run validate  # upload paths, file types, referenced assets, content dates
npm run build     # validation followed by the production build
npm run start     # serve the production build
```

Astro's Node adapter serves the public HTML and the authenticated CMS. There is no React hydration on public pages. React is used only by Keystatic. The navigation enhancement and resource filter are small progressive enhancements: all content and links remain usable without JavaScript.

Public production HTML includes its small stylesheets and uses native gzip compression when accepted by the browser. The middleware sends `Vary: Accept-Encoding` and leaves editor/API responses and already encoded responses untouched. Hosting proxies can continue to compress static CSS/JavaScript assets as appropriate.

## For the next webmaster

### Sign in

Open `/keystatic/` on the production site and choose **Sign in with GitHub**. Your GitHub account needs write access to the website repository, and the website's GitHub App must be installed on that repository. Ask the current webmaster for an invitation. Do not share credentials.

Select the publishing branch configured by your webmaster, normally `main`. Saving commits the content to GitHub. The host must rebuild and deploy when that branch changes; wait for the successful deployment before expecting public changes. The content collections are bundled at build time, not fetched from GitHub on each visit.

### Publish an announcement

1. Choose **Announcements → Create entry**.
2. Enter a title, URL slug, publication date, short summary, and full description. Separate paragraphs with a blank line. Descriptions are plain text; HTML is not executed.
3. Add an approved Vietnamese title or description if available. Empty optional translations are omitted publicly.
4. For an event, enter its start date, end date, location, registration URL, and registration deadline. Dates are calendar dates in Ontario; a deadline remains open through that day.
5. For a notice without an event date, enter **Show as current through**. Use a separate follow-up notice for post-event work.
6. Turn on **Active**. Turn on **Featured on homepage** to give it priority. Featured notices sort first, then newest publication date. Future publication dates are hidden until that Ontario date; inactive and expired notices remain in the public archive. Inactive means archived, **not private**.
7. Save. Check the deployed announcement and its downloads.

The homepage, archive, and detail routes render on the server so expiry and registration closing take effect without a scheduled rebuild. A content edit still requires a deployment. Do not put long-lived CDN caching on these HTML routes.

### Upload PDFs and other files

Under an announcement, add as many **Attachments** as needed. Every attachment needs a descriptive label and a file. Dedicated English and Vietnamese PDF fields are also available. Accepted document types: PDF, DOCX, XLSX, PPTX, TXT, CSV; maximum 20 MB per file. Executables, scripts, SVG, and macro-enabled Office files are rejected. The build also checks file signatures and paths.

Keystatic gives uploads a filename based on the entry and field, avoiding arbitrary user filenames. Keep URL slugs lowercase with hyphens. Files are public blank forms and materials only: do not upload completed consent forms, lists of children, private member details, or credentials. This is not a private document submission portal.

For a reusable file, use **Resources & forms**. Enter a title, explanation, category, language, and publication/update date. Choose **either** an uploaded file **or** an external URL. Use **Show on homepage** for common documents and **Display order** to control ordering. Only the first four featured resources appear on the homepage; all remain in the library. Resource labels show the file type or an external-link indicator.

### Change chapters or leadership

Choose **Chapters / Các Đoàn** or **Leadership / Ban Thường Vụ**, open an entry, and edit the fields. The directory is alphabetical by đoàn name and numbers are assigned in that order; **Display order** controls the map and its Previous/Next sequence. The leadership chart groups people by the **Role** field: chaplain, president, vice presidents, then treasurer and secretary. Other roles follow those tiers. Upload portraits or chapter crests only if available and approved; add an image description. The map shows each chapter crest when supplied. Anrê Dũng Lạc currently uses the Kateri league crest because its own crest has not been verified. Change the leadership term under **Site settings**.

The chapter section opens with an interactive map of southern Ontario and a province overview. Hover, focus, or tap a crest marker to show its chapter; **List view** preserves the full chapter directory. The map uses the same managed chapter names, parish details, and links as the list. The đoàn name itself links to its website or social page; the list omits crests. **Map latitude** and **Map longitude** locate the approximate community centre, not an exact meeting address. Leave them empty to keep a chapter only in the list. Chapters outside the displayed southern Ontario area also remain in the list. Crests sit at those coordinates, so update the coordinates if a chapter moves substantially. Nearby Toronto-area crests can be selected individually or browsed with the Previous/Next controls. Without JavaScript, the full list is shown automatically.

Map outlines are locally stored public-domain [Natural Earth province boundaries](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-1-states-provinces/), projected into a lightweight SVG. No map service, API key, tracking, or map library is required. British racing green and the rest of the site palette are controlled by the CSS variables at the beginning of `src/styles/global.css`.

### Change global content

**Site settings** controls names, motto, introduction, About copy, history, official contact email, social links, affiliation, league logo and patron image, footer, leadership term, and search metadata. In the About and history fields, blank lines separate paragraphs, and lines beginning with a hyphen make the diocesan chapter list (indent chapters beneath each diocese by two spaces). In the patron biography field, blank lines separate paragraphs. Enter patron dates one per line as `Label: value` (for example, `Baptized: April 18, 1676`). Editor notes are not rendered. Use these notes for content awaiting confirmation. Navigation and general interface labels live in the components.

Images are uploaded into `src/assets/images/` and rendered using Astro's image tools. Keep website images in WebP and resize unusually large source artwork before uploading it. The public visitor receives appropriately sized WebP images with explicit dimensions. The tiny PNG favicon and Apple touch icon remain PNG for icon compatibility. Vietnamese and Latin font subsets are self-hosted; no Google Fonts request is made by visitors.

## Production GitHub setup

1. Follow [the GitHub handoff guide](docs/GITHUB_HANDOFF.md) to create an organization-owned repository and upload this project, including `package-lock.json`, content, fonts, public documents, and dotfiles. Exclude real `.env` files, `node_modules`, `dist`, `.astro`, and any local reports or research downloads.
2. Copy `.env.example` to `.env` locally. Set `PUBLIC_GITHUB_REPO=organization/repository` and temporarily set `PUBLIC_KEYSTATIC_MODE=github` to use the GitHub setup flow locally. This variable is unnecessary in production: production always uses GitHub storage.
3. Follow [Keystatic's GitHub App setup](https://keystatic.com/docs/github-mode) from `/keystatic/`. Install the app only on the website repository. Grant each editor repository write access.
4. Configure the GitHub App homepage as `https://kateri.veym.ca/` and its callback as `https://kateri.veym.ca/api/keystatic/github/oauth/callback`. Add the equivalent localhost callback if needed for local setup.
5. Save these variables in the hosting provider's secret settings, not Git:

| Variable                           | Where needed | Purpose                                            |
| ---------------------------------- | ------------ | -------------------------------------------------- |
| `PUBLIC_GITHUB_REPO`               | Build        | Repository `owner/name` (public, not a secret)     |
| `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Build        | GitHub App slug (public)                           |
| `KEYSTATIC_GITHUB_CLIENT_ID`       | Runtime      | GitHub App client ID                               |
| `KEYSTATIC_GITHUB_CLIENT_SECRET`   | Runtime      | GitHub App client secret                           |
| `KEYSTATIC_SECRET`                 | Runtime      | Strong random encryption secret generated by setup |
| `HOST`                             | Runtime      | `0.0.0.0` behind your host's proxy                 |
| `PORT`                             | Runtime      | The port provided by your hosting platform         |

The admin and API return HTTP 503 until production GitHub configuration is present; production never falls back to local editing. Credentials must be provisioned to test production login. Admin routes return `X-Robots-Tag: noindex, nofollow`, are excluded from the sitemap, and are disallowed in robots.txt.

## Deployment

Use a Node-capable host connected to the GitHub repository. A static-file-only host such as GitHub Pages cannot run Keystatic's API. No hosting account or GitHub repository was supplied with the original workspace.

Configure:

- Build command: `npm ci && npm run check && npm test && npm run build`
- Start command: `npm run start`
- Node version: 24 LTS
- Auto-deploy: push to the production branch
- HTTPS: required, with `kateri.veym.ca` routed to the Node application

`astro.config.mjs` fixes canonical URLs and sitemap URLs to `https://kateri.veym.ca`. Configure your host to redirect alternate domains and HTTP to this domain over HTTPS. Serve `dist/client/` assets with long immutable caching for hashed files. Public `/uploads/` files are static documents; do not execute them. Keep the Node server available for all public HTML and `/api/keystatic/` requests. Let the Node adapter handle image optimization. The sitemap is emitted to `dist/client/sitemap-index.xml` and `sitemap-0.xml`.

In the host's environment settings, make `PUBLIC_GITHUB_REPO` and `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` available during the build. Supply private `KEYSTATIC_*` credentials at runtime using the host's secret settings. Keep them out of source files and build commands.

Before changing DNS, follow [the migration notes](docs/MIGRATION.md). Existing WordPress subsites, document URLs, and unselected articles must remain available via the old host or a deliberate archive migration. The project includes redirects for verified replacements; it does not silently discard the rest of the old site.

After deployment, check the homepage, an announcement, a download, mobile menu, `/resources/`, `/robots.txt`, `/sitemap-index.xml`, and a full sign-in/edit/deploy cycle. Keep the previous deployment available for rollback. Restoring an earlier Git commit and redeploying rolls back both content and code.

## Maintenance

Run `npm audit` and update dependencies regularly, then repeat the checks above. Do not use blanket forced upgrades without testing the CMS. Keep the organization in control of the repository, GitHub App, host, domain, and recovery access. Remove outgoing editors' repository access when leadership changes. Back up the repository and legacy WordPress data before migration.

Content schemas: `keystatic.config.ts` and `src/content.config.ts`. Public presentation: `src/components/`, `src/pages/`, `src/styles/`. Redirects: `src/data/redirects.json`. Verified sources and unresolved content: [MIGRATION.md](docs/MIGRATION.md).
