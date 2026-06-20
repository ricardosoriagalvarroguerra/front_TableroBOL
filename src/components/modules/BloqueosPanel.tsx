import { useMemo, useState, useEffect, Fragment } from 'react';
import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import { Tag } from '../primitives/Tag';
import { BoliviaMap } from '../BoliviaMap';
import { deptSlug } from '../../data/boliviaGeo';
import { ELEC_BY_ID, CAND_LABEL, ELEC_NACIONAL, PARTIDO_COLOR_2025, PARTIDO_LABEL_2025 } from '../../data/elecciones';
import { loadLocalidades, GRANULARIDADES, type Granularidad } from '../../data/localidadesLoader';
import { BLOQUEOS_INFO } from '../../data/mockData';
import type { Bloqueo, Severidad, Tone, MapLayer, LocPunto } from '../../types';

type SortKey = 'antig' | 'impacto';

interface BloqueosPanelProps {
  bloqueos: Bloqueo[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

const severidadTone: Record<Severidad, Tone> = { alta: 'neg', media: 'accent', baja: 'neutral' };
const impactWeight: Record<Severidad, number> = { alta: 3, media: 2, baja: 1 };

const LAYERS: { id: MapLayer; label: string }[] = [
  { id: 'bloqueos', label: 'Bloqueos' },
  { id: 'pres2025', label: "Presidencial '25" },
  { id: 'municipal', label: "Municipal '26" },
  { id: 'localidades', label: "Localidades '25" },
];

const GRAN_LABEL: Record<Granularidad, string> = {
  departamento: 'departamentos', provincia: 'provincias', municipio: 'municipios', localidad: 'localidades',
};

const Sw = ({ color, op = 1 }: { color: string; op?: number }) => (
  <span
    className="inline-block w-2.5 h-2.5 rounded-[2px] shrink-0"
    style={{ background: color, opacity: op }}
  />
);

export function BloqueosPanel({ bloqueos, selectedId, setSelectedId }: BloqueosPanelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('antig');
  const [layer, setLayer] = useState<MapLayer>('pres2025');
  const [granularidad, setGranularidad] = useState<Granularidad>('municipio');
  const [locData, setLocData] = useState<LocPunto[]>([]);
  const [locLoading, setLocLoading] = useState(false);

  // carga perezosa del nivel activo (solo en la capa de localidades; queda cacheado)
  useEffect(() => {
    if (layer !== 'localidades') return;
    let alive = true;
    setLocLoading(true);
    loadLocalidades(granularidad).then((d) => {
      if (alive) {
        setLocData(d);
        setLocLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [layer, granularidad]);

  const ordered = useMemo(() => {
    const c = [...bloqueos];
    if (sort === 'antig') c.sort((a, b) => b.dia - a.dia);
    else c.sort((a, b) => impactWeight[b.severidad] - impactWeight[a.severidad]);
    return c;
  }, [bloqueos, sort]);

  const deptCount = new Set(bloqueos.map((b) => b.dept)).size;

  // cruce bloqueos × ganador del balotaje
  const cross = useMemo(() => {
    let paz = 0, quiroga = 0, otros = 0;
    for (const b of bloqueos) {
      const e = ELEC_BY_ID[deptSlug(b.dept)];
      if (!e) otros++;
      else if (e.ro_winner === 'paz') paz++;
      else quiroga++;
    }
    return { paz, quiroga, otros, total: bloqueos.length };
  }, [bloqueos]);
  const pazPct = cross.total ? Math.round((cross.paz / cross.total) * 100) : 0;

  const hoverE = hoveredId ? ELEC_BY_ID[hoveredId] : null;
  const hoverCount = hoveredId ? bloqueos.filter((b) => deptSlug(b.dept) === hoveredId).length : 0;

  return (
    <Panel className="flex flex-col h-full">
      <SectionTitle
        id="B ·"
        title="Bloqueos × mapa electoral"
        right={
          <Fragment>
            <span className="text-neg pulse-dot">●</span>
            <span>
              {BLOQUEOS_INFO.total} activos · {deptCount} dptos.
            </span>
          </Fragment>
        }
      />
      <div className="flex flex-col md:flex-row min-h-0 md:h-[470px]">
        {/* mapa */}
        <div className="relative flex-1 min-h-[320px] md:min-h-0 p-3 md:p-6" style={{ minWidth: 0 }}>
          {/* selector de capa */}
          <div className="absolute top-2 right-2 z-10 flex flex-wrap justify-end gap-1 max-w-[72%]">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLayer(l.id)}
                className={`mono text-[9px] uppercase tracking-wider px-2 py-1 rounded-[4px] border backdrop-blur ${
                  layer === l.id
                    ? 'border-accent text-accent'
                    : 'border-token text-subtle hover:text-muted'
                }`}
                style={{ background: 'color-mix(in srgb, var(--bg-elev) 75%, transparent)' }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* leyenda */}
          <div
            className="absolute top-2 left-2 z-10 surface-sunk rounded-[5px] px-2.5 py-2 mono text-[9px] text-muted space-y-1"
            style={{ pointerEvents: 'none', background: 'color-mix(in srgb, var(--bg-elev) 80%, transparent)' }}
          >
            {layer === 'bloqueos' && (
              <Fragment>
                <div className="flex items-center gap-1.5"><Sw color="var(--neg)" /> alta</div>
                <div className="flex items-center gap-1.5"><Sw color="var(--neg)" op={0.6} /> media</div>
                <div className="flex items-center gap-1.5"><Sw color="var(--neg)" op={0.35} /> baja · más oscuro = más puntos</div>
              </Fragment>
            )}
            {layer === 'pres2025' && (
              <Fragment>
                <div className="flex items-center gap-1.5"><Sw color="var(--accent)" /> ganó Paz (balotaje)</div>
                <div className="flex items-center gap-1.5"><Sw color="var(--fg-muted)" /> ganó Quiroga</div>
                <div className="flex items-center gap-1.5"><Sw color="var(--neg)" /> bloqueo · int. = margen</div>
              </Fragment>
            )}
            {layer === 'municipal' && (
              <Fragment>
                <div className="text-accent">sigla = alcaldía 2026</div>
                <div className="flex items-center gap-1.5"><Sw color="var(--neg)" /> bloqueo</div>
              </Fragment>
            )}
            {layer === 'localidades' && (
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                {[8, 3, 7, 0, 2, 5, 4].map((pi) => (
                  <div key={pi} className="flex items-center gap-1.5">
                    <Sw color={PARTIDO_COLOR_2025[pi]} /> {PARTIDO_LABEL_2025[pi]}
                  </div>
                ))}
                <div className="col-span-2 flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full border-2 shrink-0" style={{ borderColor: 'var(--fg)' }} /> bloqueo
                </div>
              </div>
            )}
          </div>

          {/* selector de granularidad (solo en la capa de localidades) */}
          {layer === 'localidades' && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
              <span className="mono text-[9px] uppercase tracking-wider text-subtle mr-0.5">ver por</span>
              {GRANULARIDADES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGranularidad(g.id)}
                  className={`mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] border ${
                    granularidad === g.id ? 'border-accent text-accent' : 'border-token text-subtle hover:text-muted'
                  }`}
                  style={{ background: 'color-mix(in srgb, var(--bg-elev) 80%, transparent)' }}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          <BoliviaMap
            bloqueos={bloqueos}
            layer={layer}
            localidadesData={layer === 'localidades' ? locData : []}
            granularidad={granularidad}
            hoveredId={hoveredId}
            setHoveredId={setHoveredId}
            onSelect={setSelectedId}
          />

          {/* lectura del cruce / detalle del departamento */}
          <div
            className="absolute bottom-2 left-2 right-2 z-10 surface-sunk rounded-[5px] px-3 py-2 text-[11px] leading-snug"
            style={{ pointerEvents: 'none', background: 'color-mix(in srgb, var(--bg-elev) 88%, transparent)' }}
          >
            {hoverE ? (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="mono text-[10px] uppercase tracking-wider text-fg">{hoverE.nombre}</span>
                  <span className="mono text-[9px] text-neg">{hoverCount} bloqueo{hoverCount === 1 ? '' : 's'}</span>
                </div>
                <div className="text-muted">
                  Balotaje ’25: ganó <span className="text-fg">{CAND_LABEL[hoverE.ro_winner]}</span>{' '}
                  {(hoverE.ro_winner === 'paz' ? hoverE.ro_paz : hoverE.ro_quiroga).toFixed(1)}%
                </div>
                <div className="mono text-[9px] text-subtle">
                  1ª v. · Paz {hoverE.fr_paz} · Quiroga {hoverE.fr_quiroga} · Andrónico {hoverE.fr_andronico} · Alcaldía ’26: {hoverE.muni_partido}
                </div>
              </div>
            ) : layer === 'pres2025' ? (
              <div>
                <span className="text-fg mono text-[12px]">{cross.paz}/{cross.total}</span> bloqueos ({pazPct}%) caen
                en departamentos que <span className="text-accent">Paz ganó</span> el balotaje. La base andina que lo
                eligió —La Paz, Cochabamba, Oruro, Potosí— hoy exige su renuncia.
              </div>
            ) : layer === 'municipal' ? (
              <div>
                Subnacionales 1ª v. {ELEC_NACIONAL.muniFecha}: las 9 capitales las ganaron <span className="text-accent">partidos regionales</span> (ni MAS ni PDC). Poder local fragmentado; el conflicto es corporativo (cocaleros, COB, Túpac Katari), no municipal.
              </div>
            ) : layer === 'localidades' ? (
              <div>
                {locLoading ? (
                  <span className="text-subtle">cargando {GRAN_LABEL[granularidad]}…</span>
                ) : (
                  <>
                    <span className="text-fg mono text-[12px]">{locData.length.toLocaleString('es-BO')}</span>{' '}
                    {GRAN_LABEL[granularidad]} · presidencial 2025 (1ª v., OEP). Color = partido ganador, tamaño = votos.{' '}
                    <span className="text-pos">PDC/Paz</span> domina; <span style={{ color: '#38bdf8' }}>AP/Andrónico</span>{' '}
                    en el altiplano y el Chapare; <span className="text-neg">LIBRE/Quiroga</span> en oriente y ciudades.
                    Anillos = bloqueos. Rueda para acercar, arrastra para mover.
                  </>
                )}
              </div>
            ) : (
              <div>
                <span className="text-fg mono text-[12px]">{BLOQUEOS_INFO.total}</span> puntos activos al {BLOQUEOS_INFO.asof}
                {' '}· pico {BLOQUEOS_INFO.pico} ({BLOQUEOS_INFO.picoFecha}). {BLOQUEOS_INFO.nota} Muestra de {cross.total} puntos georreferenciados.
              </div>
            )}
          </div>
        </div>

        {/* listado */}
        <div className="w-full md:w-[280px] lg:w-[300px] flex flex-col border-t md:border-t-0 md:border-l border-token shrink-0 max-h-[280px] md:max-h-none">
          <div className="px-3 h-8 flex items-center justify-between border-b border-token shrink-0">
            <div className="mono text-[9px] uppercase tracking-wider text-subtle">Listado</div>
            <div className="flex gap-1">
              {(['antig', 'impacto'] as SortKey[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] border ${
                    sort === s
                      ? 'border-strong-token'
                      : 'border-transparent text-muted hover:border-token'
                  }`}
                >
                  {s === 'antig' ? 'antigüedad' : 'impacto'}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto scrollbar-thin flex-1">
            {ordered.map((b) => {
              const e = ELEC_BY_ID[deptSlug(b.dept)];
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedId(b.id)}
                  onMouseEnter={() => setHoveredId(deptSlug(b.dept))}
                  onMouseLeave={() => setHoveredId(null)}
                  className="w-full text-left px-3 py-2 border-b border-token row-hover"
                  style={selectedId === b.id ? { background: 'var(--bg-sunk)' } : {}}
                >
                  <div className="flex items-center justify-between">
                    <span className="mono text-[10px] text-muted uppercase tracking-wider">{b.dept}</span>
                    <Tag tone={severidadTone[b.severidad]}>D{b.dia}</Tag>
                  </div>
                  <div className="text-[12px] leading-tight mt-1">{b.km}</div>
                  <div className="text-[11px] text-muted leading-snug mt-0.5">{b.sector}</div>
                  {e && (
                    <div className="mono text-[8.5px] text-subtle uppercase tracking-wider mt-0.5">
                      balotaje: ganó {e.ro_winner === 'paz' ? 'Paz' : 'Quiroga'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
