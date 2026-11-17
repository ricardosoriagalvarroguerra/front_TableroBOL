import { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeContext } from './theme';
import { Header, formatNow } from './components/Header';
import { Tabs } from './components/Tabs';
import type { TabDef } from './components/Tabs';
import { KpiCard } from './components/modules/KpiCard';
import { FeaturedKpiCard } from './components/modules/FeaturedKpiCard';
import { KpiGroup } from './components/modules/KpiGroup';
import { FEATURED, GROUPS, SOLO_HISTORICO } from './kpiLayout';
import { BloqueosPanel } from './components/modules/BloqueosPanel';
import { BloqueosResumen } from './components/modules/BloqueosResumen';
import { MercadosPanel } from './components/modules/MercadosPanel';
import { CommoditiesPanel } from './components/modules/CommoditiesPanel';
import { ExternoPanel } from './components/modules/ExternoPanel';
import { CambiarioPanel } from './components/modules/CambiarioPanel';
import { NewsPanel } from './components/modules/NewsPanel';
import { CalendarioPanel } from './components/modules/CalendarioPanel';
import { HealthFooter } from './components/modules/HealthFooter';
import { KpiModal } from './components/overlays/KpiModal';
import { BloqueoDrawer } from './components/overlays/BloqueoDrawer';
import { NewsModal } from './components/overlays/NewsModal';
import { useDashboardData } from './useDashboardData';
import { HistoricoPanel } from './components/modules/HistoricoPanel';
import { RatingsPanel } from './components/modules/RatingsPanel';
import { TesisPanel } from './components/analisis/TesisPanel';
import { SemaforoPanel } from './components/analisis/SemaforoPanel';
import { DerivadosPanel } from './components/analisis/DerivadosPanel';
import { ProyeccionesPanel } from './components/analisis/ProyeccionesPanel';
import { EscenariosPanel } from './components/analisis/EscenariosPanel';
import { RiesgosPanel } from './components/analisis/RiesgosPanel';
import { Insight } from './components/primitives/Insight';
import { derivados } from './analytics';
import { SNAPSHOT, CAMBIARIO } from './data/mockData';
import { api } from './api';
import type { Kpi, Noticia, Theme } from './types';

type TabId = 'panorama' | 'analisis' | 'historico' | 'cambiario' | 'bloqueos' | 'externo' | 'mercados';
const TAB_ORDER: TabId[] = ['panorama', 'analisis', 'historico', 'cambiario', 'bloqueos', 'externo', 'mercados'];

export default function App() {
  const { indicadores, bloqueos, resumen, mercados, externo, noticias, eventos, fuentes, analisis, source, reload } =
    useDashboardData();

  const [theme, setTheme] = useState<Theme>('dark');
  const [now, setNow] = useState<Date>(() => new Date());
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<TabId>('panorama');
  const [openKpi, setOpenKpi] = useState<Kpi | null>(null);
  const [openNews, setOpenNews] = useState<Noticia | null>(null);
  const [selectedBloqueoId, setSelectedBloqueoId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [leidas, setLeidas] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('bol_leidas') ?? '[]'));
    } catch {
      return new Set();
    }
  });
  const searchRef = useRef<HTMLInputElement>(null);

  function marcarLeida(id: string) {
    setLeidas((prev) => {
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem('bol_leidas', JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
    setOpenNews(null);
  }

  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'dark') el.classList.add('dark');
    else el.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (e.key === 'Escape') (target as HTMLInputElement).blur();
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key.toLowerCase() === 'd') {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
      } else if (e.key.toLowerCase() === 'r') {
        triggerRefresh();
      } else if (/^[1-7]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setTab(TAB_ORDER[Number(e.key) - 1]);
        window.scrollTo({ top: 0 });
      } else if (e.key === 'Escape') {
        setOpenKpi(null);
        setOpenNews(null);
        setSelectedBloqueoId(null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function triggerRefresh() {
    setRefreshing(true);
    reload(); // re-fetch real desde el API
    setTimeout(() => setRefreshing(false), 700);
  }

  async function openNoticia(n: Noticia) {
    if (n.body != null) {
      setOpenNews(n);
      return;
    }
    try {
      setOpenNews(await api.noticia(n.id));
    } catch {
      setOpenNews(n);
    }
  }

  const bloqueoSel = bloqueos.find((b) => b.id === selectedBloqueoId) || null;

  const kpiFiltered = useMemo(() => {
    if (!query.trim()) return indicadores;
    const q = query.toLowerCase();
    return indicadores.filter(
      (k) => k.label.toLowerCase().includes(q) || (k.source ?? '').toLowerCase().includes(q),
    );
  }, [query, indicadores]);

  // organización del Módulo A: destacados (gráfico) + grupos por categoría
  const byId = useMemo(
    () => Object.fromEntries(indicadores.map((k) => [k.id, k])) as Record<string, Kpi>,
    [indicadores],
  );
  const featuredKpis = FEATURED.map((id) => byId[id]).filter(Boolean);
  const grouped = new Set([...FEATURED, ...GROUPS.flatMap((g) => g.ids), ...SOLO_HISTORICO]);
  const leftover = indicadores.filter((k) => !grouped.has(k.id));
  const groups = leftover.length
    ? [...GROUPS, { title: 'Otros', ids: leftover.map((k) => k.id) }]
    : GROUPS;
  const searching = query.trim().length > 0;

  const derived = useMemo(() => derivados(indicadores, externo, CAMBIARIO), [indicadores, externo]);
  // ancla del calendario: con la BDR en vivo los días se cuentan desde hoy; con
  // los datos embebidos, desde el corte del snapshot.
  const snapshotDate = useMemo(
    () => (source === 'api' ? new Date() : new Date(`${SNAPSHOT.iso}T12:00:00Z`)),
    [source],
  );
  const lectura = (k: string) => analisis.lecturas[k];

  const tabs: TabDef[] = [
    { id: 'panorama', label: 'Panorama' },
    { id: 'analisis', label: 'Análisis' },
    { id: 'historico', label: 'Histórico' },
    { id: 'cambiario', label: 'Cambiario' },
    { id: 'bloqueos', label: 'Conflictividad' },
    { id: 'externo', label: 'Externo y deuda' },
    { id: 'mercados', label: 'Mercados' },
  ];

  return (
    <ThemeContext.Provider value={theme}>
      <div className="min-h-screen flex flex-col">
        <Header
          theme={theme}
          setTheme={setTheme}
          refreshing={refreshing}
          onRefresh={triggerRefresh}
          searchRef={searchRef}
          query={query}
          setQuery={setQuery}
          now={now}
          snapshot={SNAPSHOT.fecha}
          source={source}
        />

        {/* KPI strip — siempre visible */}
        <section className="px-4 sm:px-6 pt-6 pb-4">
          {searching ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {kpiFiltered.map((k) => (
                <KpiCard key={k.id} k={k} onClick={setOpenKpi} />
              ))}
              {kpiFiltered.length === 0 && (
                <div className="col-span-full card p-6 text-center text-[12px] text-muted">
                  Sin coincidencias para «{query}»
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-3 grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-5 xl:col-span-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
                {featuredKpis.map((k) => (
                  <FeaturedKpiCard key={k.id} k={k} onClick={setOpenKpi} />
                ))}
              </div>
              <div className="lg:col-span-7 xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {groups.map((g) => (
                  <KpiGroup
                    key={g.title}
                    title={g.title}
                    items={g.ids.map((id) => byId[id]).filter(Boolean)}
                    onOpen={setOpenKpi}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Pestañas */}
        <Tabs tabs={tabs} active={tab} onChange={(id) => setTab(id as TabId)} />

        {/* Contenido de la pestaña activa */}
        <main key={tab} className="flex-1 px-4 sm:px-6 pt-6 pb-10">
          {tab === 'panorama' && (
            <section className="grid gap-4 grid-cols-12">
              <div className="col-span-12">
                <TesisPanel data={analisis} onVerAnalisis={() => setTab('analisis')} />
              </div>
              <div className="col-span-12">
                <SemaforoPanel items={analisis.semaforo} />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <BloqueosResumen
                  bloqueos={bloqueos}
                  resumen={resumen}
                  onSelect={setSelectedBloqueoId}
                  onVerMapa={() => setTab('bloqueos')}
                />
              </div>
              <div className="col-span-12 lg:col-span-7 h-[560px]">
                <NewsPanel noticias={noticias} onSelect={openNoticia} leidas={leidas} />
              </div>
              <div className="col-span-12">
                <CalendarioPanel eventos={eventos} base={snapshotDate} />
              </div>
            </section>
          )}

          {tab === 'analisis' && (
            <section className="grid gap-4 grid-cols-12">
              <div className="col-span-12">
                <DerivadosPanel items={derived} />
              </div>
              <div className="col-span-12 xl:col-span-7">
                <ProyeccionesPanel rows={analisis.proyecciones} />
              </div>
              <div className="col-span-12 xl:col-span-5">
                <RiesgosPanel items={analisis.riesgos} />
              </div>
              <div className="col-span-12">
                <EscenariosPanel items={analisis.escenarios} />
              </div>
            </section>
          )}

          {tab === 'historico' && (
            <section className="flex flex-col gap-4">
              <Insight>
                {lectura('historico') ??
                  'Series anuales desde 2015: cada cierre de año más el último dato disponible (marcado con *). La línea punteada es el promedio 2015–2025.'}
              </Insight>
              <HistoricoPanel kpis={indicadores} onOpen={setOpenKpi} />
            </section>
          )}

          {tab === 'cambiario' && (
            <section className="grid gap-4 grid-cols-12">
              {lectura('cambiario') && <div className="col-span-12"><Insight>{lectura('cambiario')}</Insight></div>}
              <div className="col-span-12">
                <CambiarioPanel indicadores={indicadores} onOpen={setOpenKpi} />
              </div>
            </section>
          )}

          {tab === 'bloqueos' && (
            <section className="grid gap-4 grid-cols-12">
              {lectura('bloqueos') && <div className="col-span-12"><Insight>{lectura('bloqueos')}</Insight></div>}
              <div className="col-span-12 min-h-[520px]">
                <BloqueosPanel
                  bloqueos={bloqueos}
                  selectedId={selectedBloqueoId}
                  setSelectedId={setSelectedBloqueoId}
                />
              </div>
            </section>
          )}

          {tab === 'externo' && (
            <section className="grid gap-4 grid-cols-12">
              {lectura('externo') && <div className="col-span-12"><Insight>{lectura('externo')}</Insight></div>}
              <div className="col-span-12 lg:col-span-6">
                <ExternoPanel data={externo} />
              </div>
              <div className="col-span-12 lg:col-span-6">
                <CommoditiesPanel data={externo.commodities} onOpen={setOpenKpi} />
              </div>
            </section>
          )}

          {tab === 'mercados' && (
            <section className="grid gap-4 grid-cols-12">
              {lectura('mercados') && <div className="col-span-12"><Insight>{lectura('mercados')}</Insight></div>}
              <div className="col-span-12 lg:col-span-7">
                <MercadosPanel data={mercados} onOpen={setOpenKpi} />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <RatingsPanel data={mercados} embi={byId['embi']?.history} />
              </div>
            </section>
          )}
        </main>

        {/* Footer F — siempre visible */}
        <HealthFooter fuentes={fuentes} now={formatNow(now).time} source={source} snapshot={SNAPSHOT.fecha} />

        {/* overlays */}
        <KpiModal kpi={openKpi} onClose={() => setOpenKpi(null)} lectura={openKpi ? analisis.kpiLecturas[openKpi.id] : undefined} />
        <NewsModal
          noticia={openNews}
          onClose={() => setOpenNews(null)}
          onMarcarLeida={marcarLeida}
          leida={openNews ? leidas.has(openNews.id) : false}
        />
        <BloqueoDrawer bloqueo={bloqueoSel} onClose={() => setSelectedBloqueoId(null)} />
      </div>
    </ThemeContext.Provider>
  );
}
