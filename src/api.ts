// Cliente del backend (Fastify). Las respuestas ya vienen con la forma que
// consumen los componentes; este módulo sólo tipa y centraliza los fetch.

import type { Bloqueo, Mercados, Noticia, Evento, Fuente, Kpi, ExternoData } from './types';
import { HISTORY, PERIODICIDAD, sparkFrom } from './data/series.ts';
import { EXTERNO } from './data/mockData';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5174';

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// Los indicadores del API no traen la función fmt(); la reconstruimos aquí.
export interface ApiKpi extends Omit<Kpi, 'fmt' | 'value' | 'unit' | 'def' | 'source'> {
  value: number | null;
  unit: string | null;
  def: string | null;
  source: string | null;
  decimales: number;
}

function makeFmt(codigo: string, decimales: number): (v: number) => string {
  if (codigo === 'rin') return (v) => v.toLocaleString('es-BO');
  return (v) => v.toFixed(decimales);
}

export function toKpi(k: ApiKpi): Kpi {
  // La serie histórica fechada (real, validada) vive en el bundle (src/data/series.ts)
  // y es la fuente del modal de detalle, idéntica online u offline. El API aporta el
  // valor vigente + delta; el sparkline corto se deriva de la misma serie.
  const h = HISTORY[k.id];
  return {
    ...k,
    value: k.value ?? 0,
    unit: k.unit ?? undefined,
    def: k.def ?? '',
    source: k.source ?? '',
    fmt: makeFmt(k.id, k.decimales),
    periodicidad: PERIODICIDAD[k.id] ?? k.periodicidad,
    history: h && h.length ? h : k.history,
    spark: h && h.length ? sparkFrom(h) : k.spark,
  };
}

export interface BloqueosResponse {
  resumen: { activos: number; departamentos: number };
  bloqueos: Bloqueo[];
}

export const api = {
  indicadores: (signal?: AbortSignal) => get<ApiKpi[]>('/api/indicadores', signal),
  bloqueos: (signal?: AbortSignal) => get<BloqueosResponse>('/api/bloqueos', signal),
  mercados: (signal?: AbortSignal) => get<Mercados>('/api/mercados', signal),
  externo: async (signal?: AbortSignal): Promise<ExternoData> => {
    // El API aún no sirve `analitica` (indicadores macro de la revisión de economista);
    // si falta, se rellena desde el bundle validado —igual que las series históricas—
    // para que el panel Externo nunca quede sin datos ni rompa la app.
    const data = await get<Omit<ExternoData, 'analitica'> & { analitica?: ExternoData['analitica'] }>(
      '/api/externo',
      signal,
    );
    return { ...data, analitica: data.analitica ?? EXTERNO.analitica };
  },
  noticias: (signal?: AbortSignal) => get<Noticia[]>('/api/noticias', signal),
  noticia: (codigo: string) => get<Noticia>(`/api/noticias/${codigo}`),
  eventos: (signal?: AbortSignal) => get<Evento[]>('/api/eventos', signal),
  fuentes: (signal?: AbortSignal) => get<Fuente[]>('/api/fuentes', signal),
};
