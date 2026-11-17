// Adaptador: construye un objeto `Kpi` para métricas clickeables que no son del
// Módulo A (EMBI, bonos soberanos, commodities), de modo que reusen el KpiModal
// y su serie histórica fechada real (src/data/series.ts) por id.

import { HISTORY, PERIODICIDAD, sparkFrom } from './data/series.ts';
import type { Kpi, SeriePunto } from './types';

interface MetricInput {
  id: string;
  label: string;
  value: number;
  unit?: string;
  fmt?: (v: number) => string;
  delta?: number;
  deltaLabel?: string;
  sentiment?: Kpi['sentiment'];
  source: string;
  asof: string;
  def: string;
  /** Serie fechada en vivo (API); por defecto, la del bundle. */
  history?: SeriePunto[];
  /** Fecha ISO del último dato (frescura). */
  fecha?: string;
}

export function metricKpi(o: MetricInput): Kpi {
  const h = o.history?.length ? o.history : HISTORY[o.id] ?? [];
  return {
    id: o.id,
    label: o.label,
    value: o.value,
    unit: o.unit,
    fmt: o.fmt ?? ((v) => v.toLocaleString('es-BO')),
    delta: o.delta ?? 0,
    deltaLabel: o.deltaLabel ?? '',
    sentiment: o.sentiment ?? 'neutral',
    spark: sparkFrom(h),
    periodicidad: PERIODICIDAD[o.id],
    history: h,
    source: o.source,
    asof: o.asof,
    def: o.def,
    fecha: o.fecha ?? h[h.length - 1]?.f,
  };
}
