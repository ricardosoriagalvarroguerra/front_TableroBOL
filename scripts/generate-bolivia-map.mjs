// Build-time generator: real Bolivia department geometry → compact SVG paths.
//
// Source: geoBoundaries ADM1 (CC-BY 4.0) · wmgeolab/geoBoundaries
//   https://www.geoboundaries.org/  · Bolivia (BOL) ADM1, simplified geometry.
//
// Pipeline: load GeoJSON → Douglas–Peucker simplify (lon/lat) → fit a Mercator
// projection to a tight viewBox → emit src/data/boliviaGeo.ts with per-department
// SVG path `d`, label centroids, the projection constants, and a runtime
// project(lon,lat) so blockade markers land with the exact same projection.
//
// Re-run after changing the source data or tolerance:  npm run gen:map

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { geoMercator, geoPath, geoArea } from 'd3-geo';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, 'bolivia-adm1.geojson');
const OUT = resolve(__dirname, '../src/data/boliviaGeo.ts');

// viewBox + layout knobs
const WIDTH = 760;
const PAD = 22;
const SIMPLIFY_TOLERANCE = 0.035; // degrees (~2px at this scale)
const COORD_DECIMALS = 1;

const RAD = Math.PI / 180;

// slug: strip diacritics + spaces → stable id ("Potosí" → "potosi")
const slug = (name) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');

// ── Douglas–Peucker on a single ring (planar in lon/lat; fine for one country)
function simplifyRing(points, tol) {
  if (points.length < 3) return points;
  const sqTol = tol * tol;
  const sqSegDist = (p, a, b) => {
    let x = a[0];
    let y = a[1];
    let dx = b[0] - x;
    let dy = b[1] - y;
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = b[0];
        y = b[1];
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }
    dx = p[0] - x;
    dy = p[1] - y;
    return dx * dx + dy * dy;
  };
  const keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxd = 0;
    let idx = -1;
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last]);
      if (d > maxd) {
        idx = i;
        maxd = d;
      }
    }
    if (maxd > sqTol && idx !== -1) {
      keep[idx] = true;
      stack.push([first, idx], [idx, last]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function simplifyGeometry(geom, tol) {
  const ring = (r) => {
    const s = simplifyRing(r, tol);
    return s.length >= 4 ? s : r; // never collapse a ring below a triangle
  };
  if (geom.type === 'Polygon') {
    return { type: 'Polygon', coordinates: geom.coordinates.map(ring) };
  }
  if (geom.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geom.coordinates.map((poly) => poly.map(ring)),
    };
  }
  return geom;
}

// d3-geo uses spherical winding: an exterior ring wound the "wrong" way is read
// as its complement (≈ the whole globe). geoBoundaries data is wound the other
// way, so detect it (interpreted area > half the sphere) and reverse the rings.
function fixWinding(feature) {
  if (geoArea(feature) <= 2 * Math.PI) return feature;
  const reverse = (poly) => poly.map((ring) => ring.slice().reverse());
  const g = feature.geometry;
  if (g.type === 'Polygon') g.coordinates = reverse(g.coordinates);
  else if (g.type === 'MultiPolygon') g.coordinates = g.coordinates.map(reverse);
  return feature;
}

// ── load + simplify ───────────────────────────────────────────────────
const raw = JSON.parse(readFileSync(SRC, 'utf8'));
const features = raw.features.map((f) =>
  fixWinding({
    type: 'Feature',
    properties: { id: slug(f.properties.shapeName), name: f.properties.shapeName },
    geometry: simplifyGeometry(f.geometry, SIMPLIFY_TOLERANCE),
  }),
);
const fc = { type: 'FeatureCollection', features };

// ── fit projection to a tight viewBox ─────────────────────────────────
const innerW = WIDTH - 2 * PAD;
const projection = geoMercator().fitWidth(innerW, fc);
let path = geoPath(projection);
const bounds = path.bounds(fc); // [[x0,y0],[x1,y1]]
const innerH = bounds[1][1] - bounds[0][1];
const HEIGHT = Math.ceil(innerH + 2 * PAD);

// shift translate so the content starts at PAD,PAD
const [tx0, ty0] = projection.translate();
projection.translate([tx0 - bounds[0][0] + PAD, ty0 - bounds[0][1] + PAD]);
path = geoPath(projection);

const scale = projection.scale();
const [tx, ty] = projection.translate();

// runtime forward Mercator (rotate [0,0,0], center [0,0]) — must match d3
const projectLocal = (lon, lat) => [
  tx + scale * (lon * RAD),
  ty - scale * Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2)),
];

// sanity-check our closed-form against d3 for a few points
for (const [lon, lat] of [
  [-68, -16],
  [-63, -18],
  [-60, -12],
]) {
  const a = projection([lon, lat]);
  const b = projectLocal(lon, lat);
  const err = Math.hypot(a[0] - b[0], a[1] - b[1]);
  if (err > 0.01) {
    throw new Error(`projectLocal mismatch at ${lon},${lat}: d3=${a} local=${b} err=${err}`);
  }
}

const round = (n) => +n.toFixed(COORD_DECIMALS);
const roundPath = (d) => d.replace(/-?\d+\.?\d*/g, (m) => String(round(+m)));

const departments = features
  .map((f) => {
    const [cx, cy] = path.centroid(f);
    return {
      id: f.properties.id,
      name: f.properties.name,
      d: roundPath(path(f)),
      labelX: Math.round(cx),
      labelY: Math.round(cy),
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name, 'es'));

// ── blockades: recover real lon/lat from the prototype's linear projection
// original encoding was x=(lon+70)*58, y=(-lat-9.5)*55  → invert it.
// We print a paste-ready block; the [lon,lat] live with the records in mockData
// and the map projects them at runtime via project().
const BLOQUEO_SRC = [
  ['b1', 120, 425], ['b2', 70, 405], ['b3', 98, 393], ['b4', 240, 437],
  ['b5', 195, 445], ['b6', 162, 458], ['b7', 91, 459], ['b8', 198, 492],
  ['b9', 350, 567], ['b10', 306, 208], ['b11', 82, 160], ['b12', 313, 690],
];
const lonlat = BLOQUEO_SRC.map(([id, ox, oy]) => ({
  id,
  lon: +(ox / 58 - 70).toFixed(3),
  lat: +(-(oy / 55) - 9.5).toFixed(3),
}));

// ── emit ──────────────────────────────────────────────────────────────
const banner = `// AUTO-GENERATED by scripts/generate-bolivia-map.mjs — do not edit by hand.
// Source: geoBoundaries ADM1 (CC-BY 4.0) · https://www.geoboundaries.org/
// Bolivia, 9 departments. Mercator projection fitted to the viewBox below.
// Re-generate with: npm run gen:map\n`;

const ts = `${banner}
export interface DepartmentShape {
  id: string;
  name: string;
  /** SVG path data in viewBox coordinates. */
  d: string;
  /** Label anchor (projected centroid). */
  labelX: number;
  labelY: number;
}

export const MAP_VIEWBOX = { width: ${WIDTH}, height: ${HEIGHT} } as const;

/** Mercator projection constants this geometry was baked with. */
const PROJ = { scale: ${round(scale)}, tx: ${round(tx)}, ty: ${round(ty)} } as const;
const RAD = Math.PI / 180;

/** Project [lon, lat] into viewBox coordinates with the same projection used for the shapes. */
export function project(lon: number, lat: number): [number, number] {
  return [
    +(PROJ.tx + PROJ.scale * (lon * RAD)).toFixed(1),
    +(PROJ.ty - PROJ.scale * Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2))).toFixed(1),
  ];
}

/** Normalize a department name to its shape id (strips diacritics + spaces). */
export function deptSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .replace(/\\s+/g, '');
}

export const DEPARTMENTS: DepartmentShape[] = ${JSON.stringify(departments, null, 2)};
`;

writeFileSync(OUT, ts);

const bytes = Buffer.byteLength(ts, 'utf8');
console.log(`✓ wrote ${OUT}`);
console.log(`  viewBox ${WIDTH}×${HEIGHT}, ${departments.length} departments, ${ts.length} chars (${(bytes / 1024).toFixed(1)} KB)`);
console.log('  departments:', departments.map((d) => `${d.name}(${d.d.length}b)`).join(', '));
console.log('\n  blockade [lon, lat] for mockData (paste into each Bloqueo):');
for (const b of lonlat) {
  const [px, py] = projectLocal(b.lon, b.lat);
  console.log(`    ${b.id.padEnd(4)} lon: ${b.lon}, lat: ${b.lat}   → viewBox [${round(px)}, ${round(py)}]`);
}
