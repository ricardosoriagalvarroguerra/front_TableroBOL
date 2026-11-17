// Genera src/data/region.ts con el comparador regional (FMI WEO, API pública del
// DataMapper). Es el respaldo embebido de GET /api/region y la base del seed.
//
//   node scripts/build-region.mjs
//   (detrás de un proxy: NODE_USE_ENV_PROXY=1 node scripts/build-region.mjs)

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/region.ts');
const PAISES = [
  ['ARG', 'Argentina'], ['BOL', 'Bolivia'], ['BRA', 'Brasil'], ['CHL', 'Chile'], ['COL', 'Colombia'],
  ['ECU', 'Ecuador'], ['PER', 'Perú'], ['PRY', 'Paraguay'], ['URY', 'Uruguay'],
];
const INDICADORES = [
  ['NGDP_RPCH', 'Crecimiento del PIB real', '%', 'up'],
  ['PCPIEPCH', 'Inflación (dic/dic)', '%', 'down'],
  ['GGXWDG_NGDP', 'Deuda pública bruta', '% PIB', 'down'],
  ['GGXCNL_NGDP', 'Resultado fiscal', '% PIB', 'up'],
  ['BCA_NGDPD', 'Cuenta corriente', '% PIB', 'up'],
  ['LUR', 'Desempleo', '%', 'down'],
];
const DESDE = 2015, HASTA = 2027, PROY = 2026;

const datos = {};
for (const [id] of INDICADORES) {
  const res = await fetch(`https://www.imf.org/external/datamapper/api/v1/${id}`, {
    headers: { 'User-Agent': 'tablero-inteligente-build/0.9', Accept: '*/*' },
  });
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
  const json = await res.json();
  const v = json.values?.[id] ?? {};
  datos[id] = {};
  for (const [iso] of PAISES) {
    const serie = v[iso] ?? {};
    datos[id][iso] = Object.entries(serie)
      .map(([a, x]) => ({ anio: +a, valor: Math.round(x * 100) / 100, proyeccion: +a >= PROY }))
      .filter((p) => p.anio >= DESDE && p.anio <= HASTA && Number.isFinite(p.valor));
  }
}
const vintage = `WEO · descargado ${new Date().toISOString().slice(0, 10)}`;
const ts = `// AUTO-GENERADO por scripts/build-region.mjs — no editar a mano.
// Comparador regional: FMI, World Economic Outlook (API DataMapper). Años ≥ ${PROY} = proyección.
import type { RegionData } from '../types';

export const REGION: RegionData = ${JSON.stringify(
  {
    vintage,
    paises: PAISES.map(([iso, nombre]) => ({ iso, nombre })),
    indicadores: INDICADORES.map(([id, label, unidad, polaridad]) => ({ id, label, unidad, polaridad })),
    datos,
  },
  null,
  0,
)};
`;
writeFileSync(OUT, ts);
console.log(`✓ ${OUT} · ${vintage}`);
