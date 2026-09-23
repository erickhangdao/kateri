# Content inventory and launch migration

Source reviewed on September 21–22, 2026: [Kateri](https://kateri.veym.ca/), its [About page](https://kateri.veym.ca/about/), [Contact page](https://kateri.veym.ca/contact/), [Documents and Forms](https://kateri.veym.ca/documents-and-forms/), and [Emmaus II subsite](https://kateri.veym.ca/emmaus01/).

[Liên Đoàn JP2](https://liendoanjp2.veym.net/) informed the organization of the landing page: introduction, current announcement, chapters, leadership, resources, contact. Its design and its organization-specific facts were not copied.

## Selected content

| Material                                                | Destination / decision                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| League identity, 2019 establishment, Ontario region     | Editable Site settings; concise About section                                             |
| Seven chapters and parish/community links               | Chapters collection; names and city associations checked against About                    |
| Executive committee 2026–2029                           | Five verified leaders. About-page spelling takes precedence over abbreviated social posts |
| Emmaus II, August 27–30, 2026, Stayner                  | Archived announcement; registration not promoted                                          |
| September 18 Emmaus II post-camp assignment             | Featured notice linking the official assignment; expires August 30, 2027                  |
| Leadership announcement, September 1, 2026              | Current announcement linking readers to the leadership section                            |
| Youth leader promise and promotion application          | Downloaded official bilingual fillable PDF                                                |
| Hiệp Sĩ Trưởng Thành ceremony                           | Downloaded original DOCX                                                                  |
| Toronto, Hamilton, London safeguarding guidance         | External diocesan resources; source publication dates retained                            |
| Official email, Facebook, VEYM Canada                   | Editable contact / affiliation settings                                                   |
| Historic community Mass photograph, patron image | Reused existing Kateri assets; local copies and optimized rendering                       |

The league chaplain card uses the name and role published in the official [May 2026 Emmaus II lesson notice](https://kateri.veym.ca/emmaus01/2026/05/18/online-lessons/). The current About page lists only the five elected committee members; confirm the chaplain appointment for the 2026–2029 term before launch.

The archived Emmaus notice publication date is a migration reference derived from the poster media record (February 5, 2026; WordPress media ID 57130), not a newly announced event. Its source/event information is retained in editor notes.

## Content requiring leadership confirmation

- Confirm preferred spelling for the committee names, which differs slightly between About and embedded Facebook posts.
- The site owner confirmed the four published direct leadership email addresses. Other contact fields remain empty unless supplied.
- The old Parents/Guardians Consent Form – Liability Waiver entry has an empty body and no usable attached file. It is not offered as a download. Supply the approved blank form before adding it.
- The Vietnamese organization introduction and full notice translations remain empty with editor notes; no machine translation is presented as official copy.
- Confirm the permission to continue using historic photography. The image is explicitly captioned as community worship, with no claim that it depicts a current event.
- The initial resource dates describe source publication, not a claim of a newly approved policy edition.

## Assets and sources

| Local asset                                                  | Source                                                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `src/assets/images/community.webp`                            | `https://kateri.veym.ca/wp-content/uploads/2026/04/cropped-20171007_113751-1400x386-1.jpg`                    |
| `src/assets/images/crest.webp` and `public/icons/*.png` | Shield-only artwork derived from the user-provided `LD Kateri CoA (With maple leaf wreath).png`; wreath and motto excluded |
| `src/assets/images/hero-banner.webp` | User-provided `LD Kateri Banner (1640 x 624 px).png`; optimized for the hero background. |
| `src/assets/images/hero-coat-of-arms.webp` | User-provided `LD Kateri CoA (With maple leaf wreath)(1).png`; full coat of arms retained for the hero. |
| `src/assets/images/teresa-hai-dong/crest.webp` | User-provided `Teresa Hai Dong - Scarborough.png`; bottom motto banner removed and exterior made transparent. |
| `src/assets/images/patron.webp`                               | `https://kateri.veym.ca/wp-content/uploads/2022/03/kateri-2c.png`                                             |
| `public/uploads/forms/promise-and-promotion-application.pdf` | `https://veym.ca/veymasset/resources/forms/Don_xin_Thang_Cap_Viet_Anh_(v13)_fillable.pdf`                     |
| `public/uploads/documents/hstt-promise-ceremony.docx`        | `https://kateri.veym.ca/wp-content/uploads/2025/09/NGHI-THUC-TUYEN-HUA-HSTT-GENERAL.docx`                     |

## Redirects and preservation

`src/data/redirects.json` is the executable 301 mapping. It covers About, Contact, News, Documents and Forms, the leadership announcement, seven chapter entries, migrated resources, and the original ceremony DOCX. Test the exact mappings before DNS changes. Preserve URL slugs after publication.

The existing site contains many syndicated news items, daily prayers, older formation posts, registration/member routes, and an independently installed `/emmaus01/` WordPress subsite. Blindly redirecting all of those to the new homepage would remove meaningful destinations. They are not copied into the homepage.

Before launch, export WordPress content, media, and database. Establish a read-only legacy host and reverse-proxy the following existing paths to the legacy origin at the edge, before the new Astro handler (except exact migrated redirects):

- `/emmaus01/*` and `/teresahaidong/*`: retain the working formation/chapter subsites.
- `/wp-content/uploads/*`: retain media and document URLs not explicitly migrated.
- `/blog/*`, `/prayer/*`, `/phong-trao/*`, `/spirituality/*`, `/apologetics/*`, `/church/*`: retain useful older material and prayer resources pending an editorial archive review.
- Existing member/registration/event-management routes: decide whether the old authenticated services are still needed, then route to the old application if so. `/keystatic/` is for webmasters, not a replacement for member accounts.

Keep canonical handling consistent on the legacy origin. Do not point a legacy reverse proxy back at the new public domain (that would loop). An actual legacy hostname and host routing configuration cannot be supplied until the organization chooses its deployment infrastructure.

After the route inventory is approved, extend the exact redirect map for any additional replacements. Retire an old URL only when its content has an equivalent home or the organization has approved removal. No blanket redirect for all blog posts is installed.
