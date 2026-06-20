// Hook de datos del tablero. Intenta el backend; si falla, cae a los datos
// embebidos (mockData) para que la UI funcione siempre, online u offline.

import { useEffect, useState } from 'react';
import { api, toKpi } from './api';
import { KPIS, BLOQUEOS, MERCADOS, EXTERNO, NOTICIAS, EVENTOS, FUENTES } from './data/mockData';
import type { Kpi, Bloqueo, Mercados, ExternoData, Noticia, Evento, Fuente } from './types';

export interface DashboardData {
  indicadores: Kpi[];
  bloqueos: Bloqueo[];
  resumen: { activos: number; departamentos: number };
  mercados: Mercados;
  externo: ExternoData;
  noticias: Noticia[];
  eventos: Evento[];
  fuentes: Fuente[];
}

function fromMock(): DashboardData {
  return {
    indicadores: KPIS,
    bloqueos: BLOQUEOS,
    resumen: {
      activos: BLOQUEOS.length,
      departamentos: new Set(BLOQUEOS.map((b) => b.dept)).size,
    },
    mercados: MERCADOS,
    externo: EXTERNO,
    noticias: NOTICIAS,
    eventos: EVENTOS,
    fuentes: FUENTES,
  };
}

export type DataSource = 'api' | 'mock' | 'loading';

export function useDashboardData(): DashboardData & { source: DataSource; reload: () => void } {
  const [data, setData] = useState<DashboardData>(fromMock);
  const [source, setSource] = useState<DataSource>('loading');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const [indicadores, bloqueos, mercados, externo, noticias, eventos, fuentes] =
          await Promise.all([
            api.indicadores(ctrl.signal),
            api.bloqueos(ctrl.signal),
            api.mercados(ctrl.signal),
            api.externo(ctrl.signal),
            api.noticias(ctrl.signal),
            api.eventos(ctrl.signal),
            api.fuentes(ctrl.signal),
          ]);
        setData({
          indicadores: indicadores.map(toKpi),
          bloqueos: bloqueos.bloqueos,
          resumen: bloqueos.resumen,
          mercados,
          externo,
          noticias,
          eventos,
          fuentes,
        });
        setSource('api');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setSource('mock'); // mantiene el fallback
      }
    })();
    return () => ctrl.abort();
  }, [tick]);

  return { ...data, source, reload: () => setTick((t) => t + 1) };
}
