// Hook de datos del tablero. Intenta el backend; si falla, cae a los datos
// embebidos (mockData) para que la UI funcione siempre, online u offline.

import { useEffect, useState } from 'react';
import { api, toKpi } from './api';
import { KPIS, BLOQUEOS, BLOQUEOS_INFO, MERCADOS, EXTERNO, NOTICIAS, EVENTOS, FUENTES, ANALISIS } from './data/mockData';
import type { Kpi, Bloqueo, Mercados, ExternoData, Noticia, Evento, Fuente, AnalisisData } from './types';

export interface DashboardData {
  indicadores: Kpi[];
  bloqueos: Bloqueo[];
  resumen: { activos: number; departamentos: number };
  mercados: Mercados;
  externo: ExternoData;
  noticias: Noticia[];
  eventos: Evento[];
  fuentes: Fuente[];
  analisis: AnalisisData;
}

function fromMock(): DashboardData {
  return {
    indicadores: KPIS,
    // si el último corte ABC no tiene puntos activos, la lista georreferenciada (ola de
    // mayo–junio) no se muestra como vigente; queda en la serie histórica del panel.
    bloqueos: BLOQUEOS_INFO.total ? BLOQUEOS : [],
    // el conteo vigente sale del corte ABC (BLOQUEOS_INFO); la lista es la última ola georreferenciada
    resumen: {
      activos: BLOQUEOS_INFO.total,
      departamentos: BLOQUEOS_INFO.total ? new Set(BLOQUEOS.map((b) => b.dept)).size : 0,
    },
    mercados: MERCADOS,
    externo: EXTERNO,
    noticias: NOTICIAS,
    eventos: EVENTOS,
    fuentes: FUENTES,
    analisis: ANALISIS,
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
        // El análisis es opcional en el backend: si el endpoint no existe (API
        // anterior), se conserva la capa analítica embebida.
        const analisis = await api.analisis(ctrl.signal).catch(() => ANALISIS);
        setData({
          indicadores: indicadores.map(toKpi),
          bloqueos: bloqueos.bloqueos,
          resumen: bloqueos.resumen,
          mercados,
          externo,
          noticias,
          eventos,
          fuentes,
          analisis,
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
