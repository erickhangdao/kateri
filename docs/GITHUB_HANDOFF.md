# Upload this project to GitHub

This folder is a complete source-code project. Place its **contents at the root of the GitHub repository**: `package.json` should be beside `README.md`, `src/`, and `public/`, not inside an extra nested `Kateri/` folder.

The handoff removes installed dependencies, builds, research downloads, browser binaries, and temporary reports. Those generated files are unnecessary for GitHub. A new developer recreates what is needed with `npm ci` and `npm run build`.

## Before uploading

Use a repository owned by the organization so future leadership can manage access. Choose its visibility deliberately: a public repository exposes source code, content JSON, editor notes, and uploaded public documents. “Not displayed on the website” does not mean private in GitHub.

Keep these root entries, including the dotfiles:

```text
.github/          .editorconfig
.gitattributes    .gitignore          .nvmrc
.env.example      CONTRIBUTING.md
README.md         THIRD_PARTY_NOTICES.md
astro.config.mjs  keystatic.config.ts  package.json
package-lock.json tsconfig.json
docs/             public/             scripts/
src/              tests/
```

Only `.env.example` belongs in GitHub; its values are empty or illustrative. A real `.env`, private key, or authentication token does not belong there. If you install or run the project before uploading, `node_modules/`, `.astro/`, and `dist/` may reappear. Do not upload them. **The GitHub website's file uploader does not use your local `.gitignore` as a filter.**

## Option A: upload in your browser

1. Create an empty repository in the intended organization. Do not generate another README, license, or `.gitignore`; this project already supplies the relevant setup files. Repository ownership and a source-code license are separate decisions.
2. Choose the repository's upload-existing-files action, or **Add file → Upload files**.
3. Drag the source folders and root files listed above into the uploader. Include `.github/` and all root dotfiles. In Windows File Explorer, enable **View → Show → Hidden items** if needed; verify the uploaded list before committing.
4. Commit the upload with a message such as “Initial Kateri website.” Keep `package.json` at the repository root.
5. Check the repository tree against the list above. In particular, confirm `.github/workflows/verify.yml`, `.env.example`, the fonts and their license files, the PDF/DOCX resources, and `package-lock.json` arrived.
6. Open **Actions** and inspect **Verify website**. It installs dependencies, checks types, runs tests, validates content, and builds the site. A successful run has a green check. If Actions are disabled by organization policy, an organization administrator must enable them or arrange an equivalent check.

GitHub's browser upload limit is 100 files per upload and 25 MiB per file. If necessary, upload in batches while preserving folder paths, or use GitHub Desktop. See [GitHub's file-upload instructions](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## Option B: publish with GitHub Desktop

Create an empty local repository through GitHub Desktop, then copy this project's contents into that repository's working folder. Include the dotfiles. Review the **Changes** list, create the initial commit, and use **Publish repository** to select the organization and visibility. Do not overwrite an existing project's files. GitHub Desktop respects `.gitignore`, which makes it easier to exclude generated files if you have already run the site locally.

For a terminal-based workflow, follow [GitHub's guide for existing local code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github). The handoff itself does not create a remote repository, Git history, or a commit on your behalf.

## Confirm a fresh download works

Clone the uploaded repository into a different folder, or download its ZIP and extract it. Install Node.js 24 with npm, open a terminal in the extracted folder, and run:

```sh
npm ci
npm run check
npm test
npm run build
npm run dev
```

Visit `http://127.0.0.1:4321/` and `http://127.0.0.1:4321/keystatic/`. No GitHub credentials are needed for local editing. The production build intentionally disables the editor until its GitHub credentials are configured.

## Uploading is separate from launching

Publishing the repository stores the code. It does not automatically replace `kateri.veym.ca` or publish a working CMS. This project needs a Node-capable host; enabling GitHub Pages alone will not run its server or Keystatic API.

Follow [README.md's production setup](../README.md#production-github-setup) to create the GitHub App, configure build/runtime variables, and connect a host that rebuilds after GitHub commits. The included GitHub workflow verifies code; it is not a deployment workflow.

Before switching the domain, preserve the legacy WordPress routes listed in [MIGRATION.md](MIGRATION.md). Then verify a real editor sign-in, content save, GitHub commit, and deployment from end to end. Keep the prior deployment available until the new one has been checked.
