// Hook de datos del tablero. Intenta el backend; si falla, cae a los datos
// embebidos (mockData) para que la UI funcione siempre, online u offline.

import { useEffect, useState } from 'react';
import { api, toKpi } from './api';
import { KPIS, BLOQUEOS, BLOQUEOS_INFO, MERCADOS, EXTERNO, NOTICIAS, EVENTOS, FUENTES, ANALISIS } from './data/mockData';
import type { Kpi, Bloqueo, Mercados, ExternoData, Noticia, Evento, Fuente, AnalisisData, RegionData } from './types';
import { REGION } from './data/region';
import { evaluarAlertas, type Alerta } from './alertas';

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
  region: RegionData;
  alertas: Alerta[];
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
    region: REGION,
    alertas: alertasLocales(KPIS, MERCADOS.reservas.oro),
  };
}

/** Reglas de alerta evaluadas en el cliente (mismo motor que el backend). */
function alertasLocales(kpis: Kpi[], oroPct?: number): Alerta[] {
  const map = Object.fromEntries(
    kpis.map((k) => [k.id, { id: k.id, label: k.label, value: k.value, delta: k.delta, fecha: k.fecha, periodicidad: k.periodicidad }]),
  );
  return evaluarAlertas({ kpis: map, oroPct, hoy: new Date() });
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
        // región y alertas son opcionales: con un API anterior se usan el bundle y las reglas locales
        const kpisApi = indicadores.map(toKpi);
        const [region, alertas] = await Promise.all([
          api.region(ctrl.signal).then((r) => (Object.keys(r.datos ?? {}).length ? r : REGION)).catch(() => REGION),
          api.alertas(ctrl.signal).catch(() => alertasLocales(kpisApi, mercados.reservas?.oro)),
        ]);
        setData({
          indicadores: kpisApi,
          bloqueos: bloqueos.bloqueos,
          resumen: bloqueos.resumen,
          mercados,
          externo,
          noticias,
          eventos,
          fuentes,
          analisis,
          region,
          alertas,
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
