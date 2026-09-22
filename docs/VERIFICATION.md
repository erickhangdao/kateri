# Verification record

Verified September 22, 2026 against the local production build using Node 24 and Chromium. These results describe the implementation before deployment; hosting and network conditions can change performance.

## Build and content

The version-control handoff was checked again from a clean `npm ci` installation using Node 24.19.0 and npm 11.19.1. All checks below passed, the dependency audit reported zero vulnerabilities, relative documentation links resolved, and the map regeneration script reproduced the existing geometry. The source handoff contains 90 files (approximately 2.5 MB), including the public images, fonts, PDF, and DOCX. Dependencies, builds, temporary browser reports, research downloads, and local tooling are removed after verification.

- `npm run check`: 25 files, zero errors, warnings, or hints.
- `npm test`: all six announcement tests passed, including date boundaries, future publication, registration closure, expiry, and ordering.
- `npm run build`: successful production build with content and upload validation.
- Locked production dependency audit: zero reported vulnerabilities.

Keystatic's editor application is approximately 2.8 MB before compression. The build has an explicit 3 MB warning budget for this dependency. Its normal module ordering is retained, and its production browser entry was successfully imported in Chromium. Public pages load none of this editor bundle and have no React hydration.

## Browser checks

- British racing green update and interactive chapter map: all seven markers select the correct chapter on hover; keyboard arrows and touch selection work. Map/List switching, existing chapter anchor links, and the no-JavaScript list fallback were verified in the production build. Both views have zero automated WCAG A/AA violations and no horizontal overflow at all six viewport widths below.
- Public HTML is compressed when the browser accepts gzip. Verified gzip decoding, identity responses, and explicit `gzip;q=0` negotiation. The updated homepage transfers approximately 21 KB of HTML compressed, versus 79 KB uncompressed. No map library or remote map requests are required.

- Homepage checked at 360, 390, 768, 1024, 1440, and 1920 pixels: no horizontal overflow or broken images; one primary heading, seven chapters, five leaders.
- Mobile navigation opens, follows section anchors, and closes after selection. Resource filtering works in the production build.
- Homepage, resources, announcement archive, two announcement details, and privacy page: HTTP 200, no JavaScript errors, no broken images, and no automated WCAG A/AA violations using axe-core's WCAG 2.0, 2.1, and 2.2 tags. Automated checks do not establish full WCAG conformance.
- All internal links and anchors discovered on those pages resolve. Robots and both sitemap files return HTTP 200. The old About route redirects permanently to the About section. Unknown announcement routes return HTTP 404.
- Canonical URLs and parseable JSON-LD were checked on those pages. Event markup is limited to actual events.
- Production admin and API return HTTP 503 with `noindex, nofollow` until GitHub settings and secrets are provided. Local editing remains available only through the development server.

## Editing workflow

Created a temporary announcement through Keystatic, uploaded a real PDF through its dedicated English attachment field, saved it, and confirmed the announcement appeared on the homepage and detail page. The download returned HTTP 200 and a valid PDF signature. The temporary entry and uploaded copy were removed after the test. Existing announcement fields also load correctly in the editor.

## Mobile Lighthouse

| Category       | Score |
| -------------- | ----: |
| Performance    |    94 |
| Accessibility  |   100 |
| Best practices |   100 |
| SEO            |   100 |

Latest default mobile simulation after the interactive map update: first contentful paint 2.4 seconds, largest contentful paint 2.6 seconds, cumulative layout shift 0.006, total blocking time 0 milliseconds. The original landing-page baseline scored 97 performance; the updated map build scored 94, slightly below the initial 95+ target. Results vary between runs and should be rechecked on the configured production host. Temporary browser reports and screenshots were removed from the source handoff; this document preserves the results. Future developers can generate fresh reports from their browser's Lighthouse panel.

## Remaining launch verification

- Complete a real production GitHub sign-in, edit, commit, and automatic deployment cycle once the repository, GitHub App, and hosting credentials exist. This could not be verified without those credentials.
- Preserve the legacy WordPress subsites, uploads, and retained articles as described in [MIGRATION.md](MIGRATION.md) before switching DNS.
- External resource and social destinations generally returned HTTP 200. The Diocese of London and VEYM Canada reject some automated requests with HTTP 403/406; their source links are retained and need a normal-browser check at launch. Social destinations may require login.
- Ask leadership to confirm the content items identified in the migration notes, including unavailable portraits, translations, and the missing approved consent form.

For routine editing and deployment instructions, see [README.md](../README.md).
