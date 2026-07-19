// ─────────────────────────────────────────────────────────────────────
// Domain types for "Tablero Inteligente BOL".
// These mirror the mock data shapes and will map 1:1 to the backend API
// / relational schema (BDR) implemented in a later phase.
// ─────────────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

export type Sentiment = 'pos' | 'neg' | 'neutral' | 'accent';
export type Tone = 'neutral' | 'accent' | 'pos' | 'neg' | 'info';

/** Cadencia real con la que se publica/actualiza un indicador. */
export type Periodicidad = 'diaria' | 'semanal' | 'mensual' | 'trimestral' | 'semestral' | 'anual';

/** Punto de una serie histórica fechada (f = fecha ISO `YYYY-MM-DD`). */
export interface SeriePunto {
  f: string;
  v: number;
}

// ─── MÓDULO A — Indicadores macro ─────────────────────────────────────
export interface KpiExtra {
  label: string;
  value: string;
  tone: 'neg' | 'pos' | 'neutral';
}

export interface Kpi {
  id: string;
  label: string;
  value: number;
  unit?: string;
  /** Display formatter for the headline value. */
  fmt: (v: number) => string;
  delta: number;
  deltaLabel: string;
  sentiment: Sentiment;
  /** Short sparkline series for the cards (derived from `history`). */
  spark: number[];
  /** Real update cadence of the indicator. */
  periodicidad?: Periodicidad;
  /** Full dated, sourced historical series powering the detail modal. */
  history?: SeriePunto[];
  source: string;
  asof: string;
  def: string;
  extra?: KpiExtra;
}

// ─── MÓDULO B — Bloqueos ──────────────────────────────────────────────
export type Severidad = 'alta' | 'media' | 'baja';

export interface Bloqueo {
  id: string;
  dept: string;
  ruta: string;
  km: string;
  /** Real geographic coordinates; projected onto the map via boliviaGeo.project(). */
  lon: number;
  lat: number;
  sector: string;
  motivo: string;
  /** Day number of the blockade. */
  dia: number;
  severidad: Severidad;
  fuente: string;
}

// ─── Cruce electoral (presidencial 2025 + subnacional 2026) ───────────
export type Candidato = 'paz' | 'quiroga' | 'andronico' | 'doria' | 'otro';
/** Capa activa del mapa de bloqueos. */
export type MapLayer = 'bloqueos' | 'pres2025' | 'municipal' | 'localidades';

/** Punto de localidad (presidencial 2025, 1ª vuelta) para el scatter del mapa.
 *  p = índice del partido ganador en PARTIDOS_2025; t = votos válidos; n = nombre. */
export interface LocPunto {
  lon: number;
  lat: number;
  p: number;
  t: number;
  n: string;
}

/** Resultado electoral por departamento, para cruzarlo con los bloqueos en el mapa. */
export interface DeptEleccion {
  id: string; // slug (coincide con boliviaGeo / deptSlug)
  nombre: string;
  // Presidencial 2025 · 1ª vuelta (17-ago) — % de voto válido
  fr_paz: number;
  fr_quiroga: number;
  fr_doria: number;
  fr_andronico: number;
  fr_winner: Candidato;
  // Presidencial 2025 · balotaje (19-oct)
  ro_paz: number;
  ro_quiroga: number;
  ro_winner: 'paz' | 'quiroga';
  // Subnacional 2026 (1ª vuelta 22-mar) — gobierno municipal de la capital
  muni_partido: string;
  muni_alcalde: string;
}

// ─── MÓDULO C — Mercados ──────────────────────────────────────────────
export interface Bono {
  id: string;
  name: string;
  price: number;
  yield: number;
  spread: number;
  chg: number;
}

export interface Rating {
  agencia: string;
  rating: string;
  outlook: string;
  actualizado: string;
}

export interface Mercados {
  bonos: Bono[];
  embi: { value: number; chg: number; series: number[] };
  ratings: Rating[];
  /** value = null cuando no hay cotización pública (Bolivia no tiene CDS líquido). */
  cds5y: { value: number | null; chg: number; note: string };
  /** Composición RIN (% oro / divisas / DEG). */
  reservas: { oro: number; divisas: number; deg: number };
}

// ─── MÓDULO D — Noticias ──────────────────────────────────────────────
export type NewsTag = 'Económico' | 'Político' | 'Social' | 'Internacional' | 'Sectorial';

export interface Noticia {
  id: string;
  t: string;
  mins: number;
  fuente: string;
  tag: NewsTag;
  titular: string;
  resumen: string;
  breaking: boolean;
  body?: string;
  keywords?: string[];
  relacionados?: string[];
  url?: string;
}

// ─── MÓDULO E — Calendario ────────────────────────────────────────────
export type EventTone = 'info' | 'accent' | 'neg' | 'neutral';

export interface Evento {
  d: number;
  tag: string;
  title: string;
  tone: EventTone;
}

// ─── MÓDULO Externo & Deuda (commodities, deuda, balanza, combustibles) ──
export interface Commodity {
  id: string;
  label: string;
  value: number;
  unit: string;
  chgMensual: number | null; // % var. mensual
  chgAnual: number | null; // % var. anual
  /** 'up' = mayor precio favorece a Bolivia (exportador). */
  polarity: 'up' | 'down' | 'none';
  source: string;
  asof: string;
  nota?: string;
}

export interface ExternoData {
  commodities: Commodity[];
  deuda: {
    externaStock: number | null; // USD millones
    externaPct: number | null; // % del PIB
    totalPct: number | null; // deuda total % PIB
    asof: string;
    source: string;
  };
  balanza: {
    exportaciones: number | null; // USD millones
    importaciones: number | null;
    saldo: number | null;
    periodo: string;
    source: string;
  };
  combustibles: {
    especial: number | null; // Bs/litro
    premium: number | null;
    diesel: number | null;
    nota: string;
    source: string;
  };
  servicio: {
    y2026: number | null; // USD millones
    y2027: number | null;
    y2028: number | null;
    source: string;
  };
  /** Indicadores macro-financieros añadidos en la revisión de economista. */
  analitica: {
    gasExportUsd: number | null; // valor de exportación de gas, USD M
    gasExportPeriodo: string;
    gasExportVar: number | null; // % a/a
    ccPct: number | null; // cuenta corriente, % del PIB
    ccUsd: number | null; // cuenta corriente, USD M
    ccPeriodo: string;
    remesasUsd: number | null; // remesas recibidas, USD M
    remesasPeriodo: string;
    bolivianizacion: number | null; // % de depósitos en moneda nacional
    bolivPeriodo: string;
    finMonetarioFlujo: number | null; // crédito neto BCB→SPNF, Bs MM (flujo)
    finMonetarioProg: number | null; // programado, Bs MM
    finMonetarioPeriodo: string;
    fmiEstado: string;
    fmiMonto: number | null; // USD M
    fmiNota: string;
    source: string;
  };
}

// ─── MÓDULO F — Fuentes ───────────────────────────────────────────────
export type FuenteStatus = 'ok' | 'lag' | 'live' | 'cold' | 'down';

export interface Fuente {
  id: string;
  name: string;
  latency: number | null;
  status: FuenteStatus;
  last: string;
}

// ─── MÓDULO G — Monitor cambiario (régimen flexible desde 29-jun-2026) ──
/** Un hito de la cronología del cambio de régimen cambiario. */
export interface CambiarioHito {
  etiqueta: string; // fecha corta mostrada, p.ej. "26 jun"
  titulo: string; // qué ocurrió
  tono: Tone; // color del marcador
}

/** Un bloque de "lectura" cualitativa del economista. */
export interface CambiarioLectura {
  titulo: string;
  texto: string;
}

/**
 * Metadatos del régimen cambiario para el monitor dedicado. Las cotizaciones
 * VIVAS (oficial/paralelo/brecha/VRD) vienen de los KPIs `usdbob_*` y sus series
 * diarias en src/data/series.ts; este objeto aporta el contexto de régimen, las
 * reglas del TCO, la cronología de hitos, la presión estructural y la lectura.
 */
export interface CambiarioData {
  fijoValor: number; // 6.96 — antiguo tipo fijo
  fijoDesde: string; // "nov-2011"
  flexDesde: string; // "29-jun-2026"
  reglas: string[]; // reglas de cálculo/publicación del TCO
  hitos: CambiarioHito[]; // cronología del cambio de régimen
  umbralCombustible: number; // 10.4003 — umbral del subsidio (DS 5652)
  presion: {
    rinTotal: number; // RIN oficial última, USD M
    rinLiquidas: number; // divisas líquidas de la RIN, USD M
    rinEfectivaJul: number; // estimación de RIN efectiva en julio, USD M
    rinLiquidasJul: number; // divisas líquidas estimadas en julio, USD M
    coberturaDivisas: string; // cobertura de importaciones en divisas
    nota: string;
  };
  lectura: CambiarioLectura[]; // lectura cualitativa del economista
  source: string;
}
