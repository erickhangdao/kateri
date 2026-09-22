import { readFileSync, writeFileSync } from "node:fs";

// Run from the project root. The source file is downloaded separately so normal
// installs and builds never depend on a third-party map service.
const sourceFile = process.argv[2];
if (!sourceFile) {
  console.error(
    "Usage: node scripts/generate-map.mjs path/to/provinces.geojson",
  );
  process.exit(1);
}
const source = JSON.parse(readFileSync(sourceFile, "utf8"));
// [west longitude, south latitude, east longitude, north latitude]
const bounds = [-83.7, 41.7, -78.15, 44.72];

function project([longitude, latitude], area, width, height) {
  return [
    ((longitude - area[0]) / (area[2] - area[0])) * width,
    ((area[3] - latitude) / (area[3] - area[1])) * height,
  ];
}

// Clip a polygon to the four edges of the displayed map rectangle.
function clip(points, area) {
  let output = points;
  for (const [axis, value, greater] of [
    [0, area[0], true],
    [0, area[2], false],
    [1, area[1], true],
    [1, area[3], false],
  ]) {
    const input = output;
    output = [];
    for (let index = 0; index < input.length; index++) {
      const start = input[index];
      const end = input[(index + 1) % input.length];
      const startInside = greater ? start[axis] >= value : start[axis] <= value;
      const endInside = greater ? end[axis] >= value : end[axis] <= value;
      if (startInside) output.push(start);
      if (startInside !== endInside) {
        const fraction = (value - start[axis]) / (end[axis] - start[axis]);
        output.push([
          start[0] + fraction * (end[0] - start[0]),
          start[1] + fraction * (end[1] - start[1]),
        ]);
      }
    }
  }
  return output;
}

function path(feature, area, width, height, clipped = true) {
  const polygons =
    feature.geometry.type === "Polygon"
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates;
  return polygons
    .flatMap((polygon) =>
      polygon.map((ring) => {
        const points = (clipped ? clip(ring, area) : ring).map((point) =>
          project(point, area, width, height),
        );
        if (points.length < 3) return "";
        return (
          "M" +
          points
            .map((point) => point.map((number) => number.toFixed(1)).join(","))
            .join("L") +
          "Z"
        );
      }),
    )
    .join("");
}

const ontario = source.features?.find(
  (feature) => feature.properties.name === "Ontario",
);
if (!ontario) throw new Error("The GeoJSON source must include Ontario.");
const neighbours = source.features.filter((feature) =>
  ["Michigan", "New York", "Ohio", "Pennsylvania"].includes(
    feature.properties.name,
  ),
);
if (neighbours.length !== 4)
  throw new Error("The GeoJSON source is missing neighbouring states.");

const output = {
  source: "Natural Earth 1:50m Admin 1 — public domain",
  sourceUrl:
    "https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-1-states-provinces/",
  bounds,
  ontario: path(ontario, bounds, 800, 600),
  neighbours: neighbours
    .map((feature) => path(feature, bounds, 800, 600))
    .join(""),
  overview: path(ontario, [-95.3, 41.5, -74.2, 57], 150, 164, false),
};
writeFileSync("src/data/ontario-map.json", JSON.stringify(output) + "\n");
console.log(
  "Updated src/data/ontario-map.json. Chapter content was not changed.",
);
