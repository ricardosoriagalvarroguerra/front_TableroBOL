// Comparador regional (FMI WEO): ranking de los 9 países para un año y
// trayectoria 2015–2027 del país del tablero, el país hermano y la mediana.
// Agnóstico del país: lee PAIS de src/pais.ts.

import { useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3line } from 'd3-shape';
import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import { useTheme } from '../../theme';
import { PAIS } from '../../pais';
import type { RegionData, RegionPunto } from '../../types';

interface RegionPanelProps {
  data: RegionData;
}

const c1 = (v: number) => v.toFixed(1).replace('.', ',').replace('-', '−');
const mediana = (xs: number[]) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const valorEn = (serie: RegionPunto[] | undefined, anio: number) => serie?.find((p) => p.anio === anio);

const COLOR_PAIS = 'var(--accent)';
const COLOR_HERMANO = 'var(--info)';

function Ranking({ data, ind, anio }: { data: RegionData; ind: string; anio: number }) {
  const meta = data.indicadores.find((i) => i.id === ind)!;
  const filas = data.paises
    .map((p) => ({ ...p, punto: valorEn(data.datos[ind]?.[p.iso], anio) }))
    .filter((p) => p.punto)
    .sort((a, b) => (meta.polaridad === 'up' ? b.punto!.valor - a.punto!.valor : a.punto!.valor - b.punto!.valor));
  const max = Math.max(1, ...filas.map((f) => Math.abs(f.punto!.valor)));
  const hayNeg = filas.some((f) => f.punto!.valor < 0);
  const med = mediana(filas.map((f) => f.punto!.valor));
  const pos = filas.findIndex((f) => f.iso === PAIS.iso) + 1;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between text-[11.5px] text-subtle mb-1">
        <span>
          {meta.polaridad === 'up' ? 'Mayor es mejor' : 'Menor es mejor'} · {meta.unidad}
          {filas[0]?.punto?.proyeccion ? ' · proyección' : ''}
        </span>
        {pos > 0 && (
          <span>
            {PAIS.nombre}: <span className="text-[color:var(--fg)] mono">{pos}º</span> de {filas.length}
          </span>
        )}
      </div>
      {filas.map((f) => {
        const v = f.punto!.valor;
        const w = (Math.abs(v) / max) * (hayNeg ? 50 : 100);
        const propio = f.iso === PAIS.iso;
        const hermano = f.iso === PAIS.hermano.iso;
        const color = propio ? COLOR_PAIS : hermano ? COLOR_HERMANO : 'var(--fg-subtle)';
        return (
          <div key={f.iso} className="grid grid-cols-[92px_1fr_56px] items-center gap-3">
            <span className={`text-[12.5px] truncate ${propio || hermano ? '' : 'text-muted'}`} style={propio ? { color: COLOR_PAIS } : undefined}>
              {f.nombre}
            </span>
            <div className="relative h-[10px]">
              {hayNeg && <div className="absolute top-[-3px] bottom-[-3px] w-px" style={{ left: '50%', background: 'var(--border-strong)' }} />}
              <div
                className="absolute top-0 h-full rounded-[2px]"
                style={{
                  background: color,
                  opacity: propio || hermano ? 0.9 : 0.45,
                  width: `${w}%`,
                  left: hayNeg ? (v >= 0 ? '50%' : `${50 - w}%`) : 0,
                }}
              />
            </div>
            <span className="mono text-[12px] text-right">{c1(v)}</span>
          </div>
        );
      })}
      <div className="mt-1 text-[11px] text-subtle">Mediana regional: <span className="mono">{c1(med)}</span></div>
    </div>
  );
}

const W = 560;
const H = 220;
const PAD = { l: 34, r: 10, t: 12, b: 22 };

function Trayectoria({ data, ind }: { data: RegionData; ind: string }) {
  const theme = useTheme();
  const series = data.datos[ind] ?? {};
  const anios = useMemo(() => {
    const s = new Set<number>();
    Object.values(series).forEach((xs) => xs.forEach((p) => s.add(p.anio)));
    return [...s].sort((a, b) => a - b);
  }, [series]);
  const med = anios.map((a) => ({ anio: a, valor: mediana(Object.values(series).map((xs) => valorEn(xs, a)?.valor).filter((v): v is number => v != null)) }));
  const propio = series[PAIS.iso] ?? [];
  const hermano = series[PAIS.hermano.iso] ?? [];
  const todos = [...propio, ...hermano, ...med].map((p) => p.valor).filter(Number.isFinite);
  if (!anios.length || !todos.length) return null;
  let lo = Math.min(...todos, 0);
  let hi = Math.max(...todos, 0);
  const pad = (hi - lo) * 0.08 || 1;
  lo -= pad;
  hi += pad;
  const x = scaleLinear().domain([anios[0], anios[anios.length - 1]]).range([PAD.l, W - PAD.r]);
  const y = scaleLinear().domain([lo, hi]).range([H - PAD.b, PAD.t]);
  const lg = d3line<{ anio: number; valor: number }>().x((p) => x(p.anio)).y((p) => y(p.valor)).defined((p) => Number.isFinite(p.valor));
  const primerProy = anios.find((a) => propio.find((p) => p.anio === a)?.proyeccion) ?? null;
  const ticks = y.ticks(5);

  return (
    <div>
      <svg key={theme} viewBox={`0 0 ${W} ${H}`} className="w-full block" role="img" aria-label="Trayectoria regional">
        {primerProy != null && (
          <g>
            <rect x={x(primerProy - 0.5)} y={PAD.t} width={W - PAD.r - x(primerProy - 0.5)} height={H - PAD.t - PAD.b} style={{ fill: 'var(--bg-sunk)' }} />
            <text x={W - PAD.r - 4} y={PAD.t + 11} textAnchor="end" style={{ fill: 'var(--fg-subtle)', fontSize: 10 }}>proyección FMI</text>
          </g>
        )}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} style={{ stroke: t === 0 ? 'var(--border-strong)' : 'var(--border)' }} />
            <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" className="mono" style={{ fill: 'var(--fg-subtle)', fontSize: 9.5 }}>{c1(t)}</text>
          </g>
        ))}
        {anios.filter((a) => a % 2 === 1 || a === anios[anios.length - 1]).map((a) => (
          <text key={a} x={x(a)} y={H - 6} textAnchor="middle" className="mono" style={{ fill: 'var(--fg-subtle)', fontSize: 9.5 }}>{`'${String(a).slice(2)}`}</text>
        ))}
        <path d={lg(med) ?? ''} strokeWidth="1.25" strokeDasharray="4 3" style={{ fill: 'none', stroke: 'var(--fg-subtle)' }} />
        <path d={lg(hermano) ?? ''} strokeWidth="1.5" style={{ fill: 'none', stroke: COLOR_HERMANO }} />
        <path d={lg(propio) ?? ''} strokeWidth="2" style={{ fill: 'none', stroke: COLOR_PAIS }} />
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-[11.5px] text-muted">
        <span className="flex items-center gap-1.5"><span className="w-3 h-[2px]" style={{ background: COLOR_PAIS }} />{PAIS.nombre}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-[2px]" style={{ background: COLOR_HERMANO }} />{PAIS.hermano.nombre}</span>
        <span className="flex items-center gap-1.5"><span className="w-3 border-t border-dashed" style={{ borderColor: 'var(--fg-subtle)' }} />Mediana de 9 países</span>
      </div>
    </div>
  );
}

export function RegionPanel({ data }: RegionPanelProps) {
  const [ind, setInd] = useState(data.indicadores[0]?.id ?? 'NGDP_RPCH');
  const [anio, setAnio] = useState(2025);
  const anios = Array.from({ length: 13 }, (_, i) => 2015 + i);
  if (!data.indicadores.length) {
    return <div className="card p-8 text-center text-[13px] text-muted">Sin datos regionales cargados.</div>;
  }
  return (
    <Panel>
      <SectionTitle title={`${PAIS.nombre} en la región`} right={<span>FMI · {data.vintage ?? 'WEO'}</span>} />
      <div className="px-5 pt-4 flex flex-wrap gap-1">
        {data.indicadores.map((i) => (
          <button
            key={i.id}
            onClick={() => setInd(i.id)}
            className={`text-[12px] px-2.5 h-7 rounded-[6px] ${ind === i.id ? '' : 'text-muted hover:text-[color:var(--fg)]'}`}
            style={ind === i.id ? { background: 'var(--bg-sunk)' } : undefined}
          >
            {i.label}
          </button>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-8 px-5 py-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="eyebrow">Año</span>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="surface-sunk rounded-[6px] h-7 px-2 text-[12px] mono"
              aria-label="Año del ranking"
            >
              {anios.map((a) => (
                <option key={a} value={a}>{a}{a >= 2026 ? ' (proy.)' : ''}</option>
              ))}
            </select>
          </div>
          <Ranking data={data} ind={ind} anio={anio} />
        </div>
        <div>
          <div className="eyebrow mb-3">Trayectoria 2015–2027</div>
          <Trayectoria data={data} ind={ind} />
        </div>
      </div>
    </Panel>
  );
}
