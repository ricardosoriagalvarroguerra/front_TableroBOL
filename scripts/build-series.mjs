// Genera src/data/series.ts: series históricas REALES por indicador/métrica,
// consolidando la investigación de fuentes oficiales (BCB, INE, MEFP, YPFB,
// JPMorgan/Bloomberg Línea, Investing/cbonds, Trading Economics, paralelo.bo).
//
//   node scripts/build-series.mjs
//
// Procedencia por serie en docs/SOURCES.md. Corte del snapshot: 2026-06-14.
// Los puntos diarios del paralelo provienen del feed abierto paralelo.bo
// (CC-BY-4.0); el resto son valores fechados citados a su fuente.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/series.ts');
const CUTOFF = '2026-06-20';

// ── helpers ───────────────────────────────────────────────────────────────
const r2 = (v) => Math.round(v * 100) / 100;
function clean(points, round = r2) {
  const byd = {};
  for (const p of points) {
    if (!p || p.f == null || p.v == null || Number.isNaN(+p.v)) continue;
    if (p.f > CUTOFF) continue;
    byd[p.f] = round(+p.v);
  }
  return Object.entries(byd).map(([f, v]) => ({ f, v })).sort((a, b) => (a.f < b.f ? -1 : 1));
}
function readTmp(name) {
  const p = `/tmp/${name}`;
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}
function daily(from, to, v) {
  const out = [];
  const d = new Date(from + 'T00:00:00Z');
  const end = new Date(to + 'T00:00:00Z');
  while (d <= end) {
    out.push({ f: d.toISOString().slice(0, 10), v });
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const HISTORY = {};
const PERIODICIDAD = {};
const add = (id, per, points, round) => {
  PERIODICIDAD[id] = per;
  HISTORY[id] = clean(points, round);
};

// ── A · cambiario ───────────────────────────────────────────────────────
// USD oficial: peg fijo en 6,96 desde nov-2011 (BCB). Serie diaria plana 1 año.
add('usdbob_oficial', 'diaria', daily('2025-06-20', CUTOFF, 6.96));

// Paralelo + brecha: feed diario real paralelo.bo (mediana P2P, CC-BY-4.0).
const par = readTmp('paralelo_series.json');
if (par) {
  add('usdbob_paralelo', 'diaria', par.paralelo);
  add('brecha', 'diaria', par.brecha, (v) => Math.round(v * 10) / 10);
} else {
  console.warn('⚠ /tmp/paralelo_series.json ausente — paralelo/brecha vacíos');
}

// VRD · BCB (publicado diario desde 1-dic-2025; cifras fechadas citadas al BCB).
const A2_VRD = [
  { f: '2025-12-04', v: 9.30 }, { f: '2026-04-09', v: 9.61 }, { f: '2026-04-17', v: 9.63 },
  { f: '2026-06-01', v: 10.08 }, { f: '2026-06-03', v: 9.92 }, { f: '2026-06-08', v: 10.11 },
  { f: '2026-06-10', v: 10.00 }, { f: '2026-06-11', v: 10.03 }, { f: '2026-06-12', v: 10.07 },
  { f: '2026-06-18', v: 9.92 },
];
if (A2_VRD.length) add('vrd', 'diaria', A2_VRD);

// ── A · monetario / fiscal / actividad ───────────────────────────────────
// IPC interanual (INE / tabla "Indicadores de Inflación" del BCB). 35 meses.
// CORRECCIÓN: feb-2026 = 17,41 (IPC); el 19,73 previo era el IPM (mayorista).
add('ipc', 'mensual', [
  { f: '2023-06-30', v: 2.73 }, { f: '2023-07-31', v: 2.70 }, { f: '2023-08-31', v: 3.06 },
  { f: '2023-09-30', v: 2.85 }, { f: '2023-10-31', v: 2.08 }, { f: '2023-12-31', v: 2.12 },
  { f: '2024-01-31', v: 1.86 }, { f: '2024-02-29', v: 2.52 }, { f: '2024-03-31', v: 3.06 },
  { f: '2024-04-30', v: 3.46 }, { f: '2024-05-31', v: 3.52 }, { f: '2024-06-30', v: 3.84 },
  { f: '2024-07-31', v: 3.95 }, { f: '2024-08-31', v: 5.19 }, { f: '2024-09-30', v: 6.18 },
  { f: '2024-10-31', v: 7.94 }, { f: '2024-11-30', v: 9.51 }, { f: '2024-12-31', v: 9.97 },
  { f: '2025-01-31', v: 12.03 }, { f: '2025-02-28', v: 13.22 }, { f: '2025-03-31', v: 14.63 },
  { f: '2025-04-30', v: 15.01 }, { f: '2025-05-31', v: 18.46 }, { f: '2025-06-30', v: 23.96 },
  { f: '2025-07-31', v: 24.86 }, { f: '2025-08-31', v: 24.15 }, { f: '2025-09-30', v: 23.32 },
  { f: '2025-10-31', v: 22.23 }, { f: '2025-11-30', v: 20.96 }, { f: '2025-12-31', v: 20.40 },
  { f: '2026-01-31', v: 19.64 }, { f: '2026-02-28', v: 17.41 }, { f: '2026-03-31', v: 15.05 },
  { f: '2026-04-30', v: 14.18 }, { f: '2026-05-31', v: 12.51 },
], (v) => Math.round(v * 100) / 100);

// PIB real, variación anual (INE; 2023 vía La Razón citando INE/MEFP). 5 años.
add('pib', 'anual', [
  { f: '2021-12-31', v: 6.11 }, { f: '2022-12-31', v: 3.48 }, { f: '2023-12-31', v: 3.10 },
  { f: '2024-12-31', v: 0.73 }, { f: '2025-12-31', v: -1.58 },
], (v) => Math.round(v * 100) / 100);

// RIN · BCB (cortes oficiales fin de periodo; PDFs/comunicados primarios BCB).
const A2_RIN = [
  { f: '2021-12-31', v: 4752.5 }, { f: '2022-12-31', v: 3796 }, { f: '2023-12-31', v: 1709 },
  { f: '2024-12-31', v: 1976 }, { f: '2025-04-30', v: 2618 }, { f: '2025-08-31', v: 2881 },
  { f: '2025-09-30', v: 3275 }, { f: '2025-12-31', v: 3713.3 }, { f: '2026-03-31', v: 3542.9 },
];
if (A2_RIN.length) add('rin', 'trimestral', A2_RIN, Math.round);

// Deuda externa pública % PIB (BCB · DEPEX; informes anuales/trimestrales primarios).
const A2_DEUDA = [
  { f: '2021-12-31', v: 31.2 }, { f: '2022-12-31', v: 30.0 }, { f: '2023-12-31', v: 29.9 },
  { f: '2024-12-31', v: 28.4 }, { f: '2025-12-31', v: 24.6 }, { f: '2026-03-31', v: 24.3 },
];
if (A2_DEUDA.length) add('deuda_externa', 'trimestral', A2_DEUDA, (v) => Math.round(v * 10) / 10);

// Balanza comercial · saldo mensual (INE). USD millones.
add('balanza_saldo', 'mensual', [
  { f: '2024-05-31', v: 67.9 }, { f: '2024-06-30', v: 154.7 }, { f: '2024-08-31', v: 51.4 },
  { f: '2024-09-30', v: 68.9 }, { f: '2024-10-31', v: -22.5 }, { f: '2024-11-30', v: -43.5 },
  { f: '2024-12-31', v: -97.6 }, { f: '2025-01-31', v: -183.0 }, { f: '2025-02-28', v: -144.0 },
  { f: '2025-03-31', v: -29.0 }, { f: '2025-04-30', v: -137.1 }, { f: '2025-05-31', v: 13.0 },
  { f: '2025-06-30', v: 75.4 }, { f: '2025-07-31', v: 28.0 }, { f: '2025-08-31', v: -85.4 },
  { f: '2025-09-30', v: 70.0 }, { f: '2025-10-31', v: 17.0 }, { f: '2025-11-30', v: 57.1 },
  { f: '2025-12-31', v: 159.4 }, { f: '2026-01-31', v: 377.0 }, { f: '2026-02-28', v: 430.0 },
  { f: '2026-03-31', v: 475.0 }, { f: '2026-04-30', v: 108.0 },
], (v) => Math.round(v * 10) / 10);

// ── A · energía / laboral / fiscal (A4, desde /tmp/a4.json) ──────────────
const a4 = readTmp('a4.json');
if (a4) {
  const get = (id) => (a4.series.find((s) => s.indicador_id === id)?.puntos ?? []);
  add('fiscal', 'anual', get('fiscal'), (v) => Math.round(v * 10) / 10);
  add('gas', 'anual', get('gas'), (v) => Math.round(v * 100) / 100);
  add('salario_minimo', 'anual', get('salario_minimo'), Math.round);
  const COMM = { oro: 'commodity_oro', plata: 'commodity_plata', zinc: 'commodity_zinc',
    estano: 'commodity_estano', gas_hh: 'commodity_gas_hh', soya: 'commodity_soya' };
  for (const [id, src] of Object.entries(COMM)) add(id, 'mensual', get(src), (v) => Math.round(v * 100) / 100);
} else {
  console.warn('⚠ /tmp/a4.json ausente — fiscal/gas/salario/commodities vacíos');
}

// ── C · mercados ──────────────────────────────────────────────────────────
// EMBI Bolivia (JPMorgan; lecturas fechadas Invenómica/Bloomberg Línea). pb.
add('embi', 'mensual', [
  { f: '2023-11-29', v: 2046 }, { f: '2023-12-29', v: 2233 }, { f: '2024-01-02', v: 2121 },
  { f: '2024-03-05', v: 1701 }, { f: '2024-06-25', v: 1980 }, { f: '2024-07-17', v: 2096 },
  { f: '2024-08-26', v: 2297 }, { f: '2024-09-20', v: 2318 }, { f: '2024-12-31', v: 2065 },
  { f: '2025-01-02', v: 2087 }, { f: '2025-04-21', v: 2242 }, { f: '2025-08-15', v: 1525 },
  { f: '2025-08-18', v: 1207 }, { f: '2025-11-10', v: 930 }, { f: '2025-11-26', v: 656 },
  { f: '2025-12-31', v: 673 }, { f: '2026-02-15', v: 477 }, { f: '2026-05-22', v: 605 },
  { f: '2026-05-31', v: 576 }, { f: '2026-06-19', v: 444 },
], Math.round);

// Bono 2028 (4,50%) — precio % del nominal (Investing/GlobalCapital/Bloomberg).
add('BOL28', 'mensual', [
  { f: '2023-10-10', v: 45 }, { f: '2025-08-18', v: 79 }, { f: '2025-09-19', v: 77 },
  { f: '2026-04-04', v: 93.31 }, { f: '2026-05-18', v: 97.38 }, { f: '2026-05-21', v: 94.53 },
  { f: '2026-05-27', v: 92.88 }, { f: '2026-06-11', v: 94.38 }, { f: '2026-06-12', v: 94.88 },
], (v) => Math.round(v * 100) / 100);

// Bono 2031 (9,45%) — precio % del nominal (cbonds/Bloomberg Línea-IIF). Línea nueva, ilíquida.
add('BOL31', 'mensual', [
  { f: '2026-05-07', v: 98.84 }, { f: '2026-05-22', v: 96.6 },
], (v) => Math.round(v * 100) / 100);

// ── derivados ─────────────────────────────────────────────────────────
// Brecha paralelo/VRD: el VRD es el tipo de cambio de facto del BCB; esta brecha
// (casi cerrada) muestra que la unificación cambiaria ya ocurre de hecho.
if (par && A2_VRD.length) {
  const ps = par.paralelo;
  const parAt = (f) => { let b = null; for (const p of ps) { if (p.f <= f) b = p.v; else break; } return b; };
  const bv = A2_VRD.map((v) => { const pp = parAt(v.f); return pp ? { f: v.f, v: Math.round((pp / v.v - 1) * 1000) / 10 } : null; }).filter(Boolean);
  const lp = ps[ps.length - 1];
  if (lp) bv.push({ f: CUTOFF, v: Math.round((lp.v / A2_VRD[A2_VRD.length - 1].v - 1) * 1000) / 10 });
  add('brecha_vrd', 'diaria', bv, (v) => Math.round(v * 10) / 10);
}
// Cobertura de importaciones (RIN total / importaciones mensuales prom. ~USD 950 M).
if (A2_RIN.length) {
  const IMP = 950;
  add('cobertura_importaciones', 'trimestral', A2_RIN.map((r) => ({ f: r.f, v: r.v / IMP })), (v) => Math.round(v * 10) / 10);
}

// ── emitir src/data/series.ts ─────────────────────────────────────────────
const ids = Object.keys(HISTORY);
const body = ids.map((id) => {
  const pts = HISTORY[id].map((p) => `{f:'${p.f}',v:${p.v}}`).join(',');
  return `  '${id}': [${pts}],`;
}).join('\n');
const pers = ids.map((id) => `  '${id}': '${PERIODICIDAD[id]}',`).join('\n');

const ts = `// AUTO-GENERADO por scripts/build-series.mjs — no editar a mano.
// Series históricas REALES de fuentes oficiales/primarias. Procedencia por serie
// en docs/SOURCES.md. Corte del snapshot: ${CUTOFF}.
import type { Periodicidad, SeriePunto } from '../types';

/** Cadencia real de actualización por indicador/métrica. */
export const PERIODICIDAD: Record<string, Periodicidad> = {
${pers}
};

/** Serie histórica fechada (real) por id. f = fecha ISO, v = valor. */
export const HISTORY: Record<string, SeriePunto[]> = {
${body}
};

/** Sparkline corto para las tarjetas: últimos n valores de la serie. */
export function sparkFrom(h: SeriePunto[] | undefined, n = 24): number[] {
  if (!h || !h.length) return [];
  return h.slice(-n).map((p) => p.v);
}
`;

writeFileSync(OUT, ts);
const counts = ids.map((id) => `${id}:${HISTORY[id].length}`).join(' · ');
console.log(`✓ wrote ${OUT}`);
console.log(`  ${ids.length} series — ${counts}`);
