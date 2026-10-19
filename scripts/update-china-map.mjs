import fs from "node:fs";

// China GeoAtlas boundary: https://geo.datav.aliyun.com/areas_v3/bound/100000.json
// DataV documents GeoAtlas administrative-area data as sourced from Amap.
// Keep all components of the national geometry, including offshore islands.
const file = "app/components/insight-world-data.ts";
const existing = fs.readFileSync(file, "utf8");
const paths = JSON.parse(
  existing.slice(existing.indexOf("["), existing.lastIndexOf("]") + 1),
);
const response = await fetch(
  "https://geo.datav.aliyun.com/areas_v3/bound/100000.json",
);
if (!response.ok)
  throw new Error(`GeoAtlas download failed: ${response.status}`);
const source = await response.json();
const feature = source.features.find(
  (item) => Number(item.properties.adcode) === 100000,
);
if (!feature || feature.geometry.type !== "MultiPolygon")
  throw new Error("Unexpected China boundary format");
const point = ([longitude, latitude]) =>
  `${((longitude + 180) * 2.5).toFixed(3)},${((83 - latitude) * 2.5).toFixed(3)}`;
const path = feature.geometry.coordinates
  .flatMap((polygon) => polygon.map((ring) => `M${ring.map(point).join("L")}Z`))
  .join("");
const replaced = paths.filter(
  (item) =>
    !["CN", "TW", "HK", "MO"].includes(item.code) &&
    !["Spratly Islands", "Scarborough Reef"].includes(item.name),
);
// Render the complete national outline last so incompatible legacy border
// fragments cannot show through it. There is a single CN interaction target.
replaced.push({ code: "CN", name: "China", path });
fs.writeFileSync(
  file,
  "// World boundaries: Natural Earth; China national geometry: DataV GeoAtlas (Amap).\nexport const worldPaths = " +
    JSON.stringify(replaced) +
    ";\n",
);
console.log(
  `Updated unified CN geometry: ${feature.geometry.coordinates.length} components; no separate TW/HK/MO country shapes.`,
);
