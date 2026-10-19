import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../app/components/insight-world-data.ts", import.meta.url),
  "utf8",
);
const paths = JSON.parse(
  source.slice(source.indexOf("["), source.lastIndexOf("]") + 1),
);
const china = paths.find((item) => item.code === "CN");
const rings = [...china.path.matchAll(/M([^Z]+)Z/g)].map((match) =>
  match[1].split("L").map((pair) => pair.split(",").map(Number)),
);
function contains(lon, lat) {
  const x = (lon + 180) * 2.5,
    y = (83 - lat) * 2.5;
  return rings.some((ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i],
        [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
        inside = !inside;
    }
    return inside;
  });
}

test("China uses one complete geometry and one country interaction identity", () => {
  assert.equal(paths.filter((item) => item.code === "CN").length, 1);
  assert.ok(!paths.some((item) => ["TW", "HK", "MO"].includes(item.code)));
  assert.equal(paths.at(-1).code, "CN");
});

test("national geometry contains representative locations across China", () => {
  for (const [name, lon, lat] of [
    ["北京", 116.4, 39.9],
    ["乌鲁木齐", 87.617, 43.792],
    ["拉萨", 91.132, 29.66],
    ["台北", 121.509, 25.044],
    ["香港", 114.16, 22.3],
    ["澳门", 113.54, 22.19],
  ]) {
    assert.ok(
      contains(lon, lat),
      `${name} must belong to the unified CN geometry`,
    );
  }
});

test("map does not add special political callout labels", async () => {
  const map = await readFile(
    new URL("../app/components/insight-map.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(!/中国台湾|中国西藏|中国新疆/.test(map));
});
