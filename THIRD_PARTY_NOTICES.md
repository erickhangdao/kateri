# Assets and third-party material

## Map data

`src/data/ontario-map.json` is derived from Natural Earth's 1:50m Admin 1 states and provinces dataset, with large lakes excluded from land polygons. Natural Earth map data is public domain. See the [dataset page](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-1-states-provinces/) and the source metadata inside the JSON file. `scripts/generate-map.mjs` regenerates the local outline from a downloaded GeoJSON source.

## Fonts

The locally hosted Lora and Source Sans 3 font files are distributed with their included license texts:

- [Lora license](public/fonts/lora-license.txt)
- [Source Sans license](public/fonts/source-sans-license.txt)

Retain these files when redistributing the project. `src/styles/fonts.css` maps each font subset to its family and supported characters.

## Organization content, imagery, and documents

Kateri branding, the community photograph, patron image, and selected official documents were obtained from the existing Kateri/VEYM sites. Their provenance is listed in [the migration notes](docs/MIGRATION.md). Their inclusion does not place them in the public domain or grant a new reuse license. The organization should confirm continued publication rights as part of launch review.

## Software dependencies and repository licensing

Third-party packages retain their own licenses, available in installed package directories and upstream projects. `package-lock.json` records the package versions used by this project.

No blanket open-source license has been chosen for the organization's source code or content. Repository owners should decide that deliberately before offering reuse rights. The `private` flag in `package.json` prevents accidental npm package publication; it does not choose GitHub repository visibility or a copyright license.
