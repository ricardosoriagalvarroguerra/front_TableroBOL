import { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeContext } from './theme';
import { Header, formatNow } from './components/Header';
import { Tabs } from './components/Tabs';
import type { TabDef } from './components/Tabs';
import { KpiCard } from './components/modules/KpiCard';
import { FeaturedKpiCard } from './components/modules/FeaturedKpiCard';
import { KpiGroup } from './components/modules/KpiGroup';
import { FEATURED, GROUPS } from './kpiLayout';
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
import { api } from './api';
import type { Kpi, Noticia, Theme } from './types';

type TabId = 'panorama' | 'cambiario' | 'bloqueos' | 'externo' | 'mercados';

export default function App() {
  const { indicadores, bloqueos, resumen, mercados, externo, noticias, eventos, fuentes, source, reload } =
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
  const grouped = new Set([...FEATURED, ...GROUPS.flatMap((g) => g.ids)]);
  const leftover = indicadores.filter((k) => !grouped.has(k.id));
  const groups = leftover.length
    ? [...GROUPS, { title: 'Otros', ids: leftover.map((k) => k.id) }]
    : GROUPS;
  const searching = query.trim().length > 0;

  const tabs: TabDef[] = [
    { id: 'panorama', label: 'Panorama' },
    {
      id: 'cambiario',
      label: 'Cambiario',
      badge: byId['usdbob_oficial'] ? (
        <span className="mono text-[9px] text-accent">{byId['usdbob_oficial'].fmt(byId['usdbob_oficial'].value)}</span>
      ) : undefined,
    },
    {
      id: 'bloqueos',
      label: 'Bloqueos',
      badge: <span className="mono text-[9px] text-neg">{resumen.activos}</span>,
    },
    { id: 'externo', label: 'Externo & Deuda' },
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
        />

        {/* KPI strip — siempre visible (command bar) */}
        <section className="px-3 sm:px-4 pt-3 sm:pt-4 pb-1">
          <div className="flex items-center justify-between mb-2 gap-3">
            <div className="mono text-[10px] uppercase tracking-[0.18em] text-subtle whitespace-nowrap">
              A · Indicadores macro
            </div>
            <div className="mono text-[10px] text-subtle hidden sm:flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="kbd">/</span> buscar
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd">D</span> modo
              </span>
              <span className="flex items-center gap-1">
                <span className="kbd">R</span> refrescar
              </span>
            </div>
          </div>
          {searching ? (
            // Búsqueda: vista plana con todas las coincidencias
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {kpiFiltered.map((k) => (
                <KpiCard key={k.id} k={k} onClick={setOpenKpi} />
              ))}
              {kpiFiltered.length === 0 && (
                <div className="col-span-full surface rounded-[5px] p-6 text-center mono text-[11px] text-muted uppercase tracking-wider">
                  Sin coincidencias para «{query}»
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-1 lg:grid-cols-12">
              {/* Destacados — tarjetas con gráfico */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {featuredKpis.map((k) => (
                  <FeaturedKpiCard key={k.id} k={k} onClick={setOpenKpi} />
                ))}
              </div>
              {/* Resto — agrupado por categoría en paneles compactos */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 content-start">
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
        <div className="flex-1 px-3 sm:px-4 pt-3">
          {tab === 'panorama' && (
            <section className="grid gap-2 grid-cols-12">
              <div className="col-span-12 lg:col-span-5 min-h-[360px]">
                <BloqueosResumen
                  bloqueos={bloqueos}
                  resumen={resumen}
                  onSelect={setSelectedBloqueoId}
                  onVerMapa={() => setTab('bloqueos')}
                />
              </div>
              <div className="col-span-12 lg:col-span-7 min-h-[360px]">
                <NewsPanel noticias={noticias} onSelect={openNoticia} leidas={leidas} />
              </div>
              <div className="col-span-12">
                <CalendarioPanel eventos={eventos} />
              </div>
            </section>
          )}

          {tab === 'cambiario' && (
            <section className="grid gap-2 grid-cols-12">
              <div className="col-span-12">
                <CambiarioPanel indicadores={indicadores} onOpen={setOpenKpi} />
              </div>
            </section>
          )}

          {tab === 'bloqueos' && (
            <section className="grid gap-2 grid-cols-12">
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
            <section className="grid gap-2 grid-cols-12">
              <div className="col-span-12 lg:col-span-6 min-h-[420px]">
                <ExternoPanel data={externo} />
              </div>
              <div className="col-span-12 lg:col-span-6 min-h-[420px]">
                <CommoditiesPanel data={externo.commodities} onOpen={setOpenKpi} />
              </div>
            </section>
          )}

          {tab === 'mercados' && (
            <section className="grid gap-2 grid-cols-12">
              <div className="col-span-12 lg:col-span-6 min-h-[520px]">
                <MercadosPanel data={mercados} onOpen={setOpenKpi} />
              </div>
              <div className="col-span-12 lg:col-span-6 min-h-[520px]">
                <CommoditiesPanel data={externo.commodities} onOpen={setOpenKpi} />
              </div>
            </section>
          )}
        </div>

        {/* Footer F — siempre visible */}
        <HealthFooter fuentes={fuentes} now={formatNow(now).time} source={source} />

        {/* overlays */}
        <KpiModal kpi={openKpi} onClose={() => setOpenKpi(null)} />
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
