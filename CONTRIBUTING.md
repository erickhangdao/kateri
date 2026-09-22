# Contributing

Start with [the developer guide](docs/DEVELOPER_GUIDE.md). It assumes basic HTML, CSS, and JavaScript knowledge; previous Astro experience is not required. Routine announcements, forms, and leadership updates should use Keystatic as described in [README.md](README.md).

## Work on one small change

1. Get the latest `main` branch before starting. Coordinate with other developers and the webmaster, because CMS saves also create commits.
2. Create a branch with a descriptive name, such as `improve-chapter-navigation`.
3. Install the locked dependencies with `npm ci`, then run `npm run dev`.
4. Make the smallest change that solves the problem. Use the existing components, content fields, and CSS variables where possible.
5. Run `npm run check`, `npm test`, and `npm run build`. Check the changed feature in a browser, including mobile and keyboard use when relevant.
6. Review every changed file. Include new public assets and content JSON, but exclude `.env`, dependencies, generated output, logs, and personal files.
7. Push your branch and open a pull request. Explain the visible result, include screenshots for design changes, and list what you tested.
8. Ask another developer to review the pull request. Resolve checks or questions before merging. The verification workflow checks the project; deployment requires a separately configured host.

GitHub Desktop can perform the branch, commit, push, and pull-request steps. If using a terminal, run commands from the folder containing `package.json`.

## Project conventions

- Keep Vietnamese text in UTF-8 and preserve diacritics. Do not present unapproved translations as official content.
- Prefer Astro components and small browser scripts. Public pages do not need React.
- Use two-space indentation. `.editorconfig` describes the shared formatting conventions; `.gitattributes` normalizes text line endings.
- Keep organization information in the CMS collections instead of duplicating it in components.
- When adding a CMS field, update both `keystatic.config.ts` and `src/content.config.ts`, then update the rendering code and existing data if needed.
- Keep published slugs stable. Add a specific redirect when a public URL must change.
- Preserve the map's list fallback, keyboard support, touch targets, and the global reduced-motion styles.
- Test behavior that can regress, such as date calculations. Visual or content changes usually need a focused browser check rather than a new unit test.
- Use `npm install` only when intentionally changing dependencies, and commit both `package.json` and `package-lock.json`. Use `npm ci` for normal setup.
- Newer npm versions use the pinned `allowScripts` entry in `package.json` for esbuild's installer. If an upgrade changes that version, review the new install script before approving it; do not approve every dependency's scripts indiscriminately.

## Handling conflicts and mistakes

If two people edit the same content file, read both versions and keep the intended combined result. Do not select “ours” or “theirs” without checking the content. If a lockfile conflicts after a dependency change, ask the reviewer to help regenerate and verify it rather than hand-editing its dependency records.

To undo a published change, create a revert commit and redeploy it. Avoid rewriting shared branch history. If a real credential is accidentally committed, revoke or rotate it immediately; deleting the current file does not remove the value from Git history.
