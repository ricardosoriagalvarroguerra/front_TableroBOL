// ─────────────────────────────────────────────────────────────────────
// Serie histórica DIARIA de puntos de bloqueo en la Red Vial Fundamental
// reportados por la ABC (Administradora Boliviana de Carreteras),
// 1-abr → 23-jun 2026, con desglose por departamento.
//
// Fuentes (cifras de la ABC citadas por prensa; el portal oficial
// transitabilidad.abc.gob.bo no es accesible — CAPTCHA):
//   · Visión360 — mapa de transitabilidad (track matutino, base de la serie)
//   · ABI · Opinión · La Patria · Red Uno · Correo del Sur · El Deber · Infobae
//   · Cronología: Wikipedia «Protestas en Bolivia de 2026»
//
// Metodología: los días marcados `esReal` son reportes reales de la ABC; los
// días intermedios (la ABC no publica todos los días) se interpolan
// linealmente. Distintos medios toman la «foto» a horas distintas, por lo que
// el pico citado varía (Visión360 ~94 el 30-may; Opinión/ABI llegaron a 93–103
// a inicios de junio). Se usa el track de Visión360 como base por consistencia.
// ─────────────────────────────────────────────────────────────────────

export type SerieKey = 'total' | 'cochabamba' | 'lapaz' | 'santacruz';

export interface BloqueoDia {
  f: string; // YYYY-MM-DD
  lapaz: number;
  cochabamba: number;
  santacruz: number;
  otros: number; // Oruro + Potosí + Chuquisaca + Pando + Beni
  total: number;
  esReal: boolean; // true = reporte real de la ABC ese día (no interpolado)
}

interface Ancla {
  f: string;
  lp: number;
  cb: number;
  sc: number;
  t: number;
}

// Reportes reales de la ABC (cifra explícita citada por prensa). lp/cb/sc =
// La Paz / Cochabamba / Santa Cruz; t = total nacional de puntos.
const ANCLAS: Ancla[] = [
  { f: '2026-04-01', lp: 0, cb: 0, sc: 0, t: 0 }, // abril: sin cortes en la RVF
  { f: '2026-04-30', lp: 1, cb: 0, sc: 0, t: 1 }, // primer corte aislado (La Paz)
  { f: '2026-05-01', lp: 1, cb: 0, sc: 0, t: 2 }, // inicio del paro indefinido de la COB
  { f: '2026-05-07', lp: 11, cb: 0, sc: 1, t: 17 }, // Visión360
  { f: '2026-05-11', lp: 14, cb: 2, sc: 1, t: 38 }, // ABI (total real; desglose aprox.)
  { f: '2026-05-19', lp: 16, cb: 5, sc: 1, t: 32 }, // Visión360
  { f: '2026-05-20', lp: 17, cb: 11, sc: 2, t: 46 }, // Visión360
  { f: '2026-05-21', lp: 17, cb: 9, sc: 2, t: 48 }, // Visión360
  { f: '2026-05-26', lp: 20, cb: 14, sc: 2, t: 56 }, // Visión360
  { f: '2026-05-27', lp: 21, cb: 12, sc: 3, t: 64 }, // Visión360
  { f: '2026-05-28', lp: 21, cb: 12, sc: 3, t: 66 }, // Visión360
  { f: '2026-05-30', lp: 22, cb: 21, sc: 2, t: 94 }, // Visión360 (pico del track)
  { f: '2026-06-01', lp: 20, cb: 31, sc: 3, t: 91 }, // Visión360
  { f: '2026-06-02', lp: 20, cb: 31, sc: 2, t: 91 }, // Visión360
  { f: '2026-06-03', lp: 20, cb: 27, sc: 2, t: 86 }, // Visión360
  { f: '2026-06-06', lp: 19, cb: 23, sc: 1, t: 78 }, // La Patria
  { f: '2026-06-07', lp: 20, cb: 26, sc: 3, t: 84 }, // Visión360
  { f: '2026-06-08', lp: 21, cb: 27, sc: 2, t: 86 }, // Visión360 (Opinión/ABI citaron 93)
  { f: '2026-06-10', lp: 22, cb: 28, sc: 2, t: 94 }, // Red Uno
  { f: '2026-06-12', lp: 21, cb: 30, sc: 4, t: 84 }, // Visión360
  { f: '2026-06-13', lp: 20, cb: 28, sc: 3, t: 77 }, // Opinión (AM)
  { f: '2026-06-16', lp: 19, cb: 17, sc: 1, t: 50 }, // Visión360
  { f: '2026-06-17', lp: 20, cb: 13, sc: 1, t: 49 }, // ABI / Correo del Sur
  { f: '2026-06-18', lp: 18, cb: 15, sc: 2, t: 43 }, // Visión360
  { f: '2026-06-20', lp: 19, cb: 12, sc: 1, t: 42 }, // estado de excepción (20-jun)
  { f: '2026-06-21', lp: 0, cb: 11, sc: 1, t: 13 }, // Opinión (PM) — La Paz ya en 0
  { f: '2026-06-22', lp: 0, cb: 9, sc: 0, t: 10 }, // Infobae — resiste el Trópico (CBBA)
  { f: '2026-06-23', lp: 0, cb: 0, sc: 0, t: 0 }, // ABC: carreteras libres (54 días)
];

const DAY = 86_400_000;
const toUTC = (f: string): number => {
  const [y, m, d] = f.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const iso = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
const lerp = (a: number, b: number, t: number): number => Math.round(a + (b - a) * t);

function construir(): BloqueoDia[] {
  const out: BloqueoDia[] = [];
  const reales = new Set(ANCLAS.map((a) => a.f));
  const start = toUTC(ANCLAS[0].f);
  const end = toUTC(ANCLAS[ANCLAS.length - 1].f);
  for (let ms = start; ms <= end; ms += DAY) {
    let lo = ANCLAS[0];
    let hi = ANCLAS[ANCLAS.length - 1];
    for (let i = 0; i < ANCLAS.length - 1; i++) {
      if (toUTC(ANCLAS[i].f) <= ms && ms <= toUTC(ANCLAS[i + 1].f)) {
        lo = ANCLAS[i];
        hi = ANCLAS[i + 1];
        break;
      }
    }
    const span = toUTC(hi.f) - toUTC(lo.f);
    const t = span === 0 ? 0 : (ms - toUTC(lo.f)) / span;
    const lapaz = lerp(lo.lp, hi.lp, t);
    const cochabamba = lerp(lo.cb, hi.cb, t);
    const santacruz = lerp(lo.sc, hi.sc, t);
    const total = lerp(lo.t, hi.t, t);
    const otros = Math.max(0, total - lapaz - cochabamba - santacruz);
    out.push({ f: iso(ms), lapaz, cochabamba, santacruz, otros, total, esReal: reales.has(iso(ms)) });
  }
  return out;
}

export const BLOQUEOS_HISTORICO: BloqueoDia[] = construir();

export const SERIES_HIST: { key: SerieKey; label: string; color: string }[] = [
  { key: 'total', label: 'Total', color: 'var(--fg-muted)' },
  { key: 'cochabamba', label: 'Cochabamba', color: 'var(--neg)' },
  { key: 'lapaz', label: 'La Paz', color: 'var(--accent)' },
  { key: 'santacruz', label: 'Santa Cruz', color: 'var(--pos)' },
];

export const BLOQUEOS_HISTORICO_META = {
  desde: '1 abr 2026',
  hasta: '23 jun 2026',
  pico: 94,
  picoFecha: '30 may',
  duracionDias: 54,
  reportes: ANCLAS.length,
  fuente: 'ABC · transitabilidad RVF (vía Visión360, ABI, Opinión, La Patria, Red Uno)',
  nota:
    'Puntos de bloqueo en la Red Vial Fundamental según los reportes de transitabilidad de la ABC. ' +
    'Abril sin cortes; conflicto del 1-may al 23-jun (54 días); pico ~94 (30-may) y meseta de 80–94 en la ' +
    'primera quincena de junio (Opinión/ABI llegaron a citar 93–103). Los días sin reporte público se interpolan.',
};
