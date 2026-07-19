// Gráfico del régimen cambiario: oficial (TCO) vs paralelo, con la BRECHA entre
// ambos sombreada (se ve cómo el salto del 29-jun cierra la brecha) y una
// anotación vertical del hito del cambio de régimen. Construido con D3:
// d3-scale (escalas), d3-shape (líneas/área), d3-axis (eje temporal), d3-array
// (bisector para el hover). React maneja el SVG y el estado.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { scaleUtc, scaleLinear } from 'd3-scale';
import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
import { axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { bisector } from 'd3-array';
import { useTheme } from '../../theme';
import type { SeriePunto } from '../../types';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parse(f: string): Date {
  const [y, m, d] = f.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}
function tipLabel(d: Date): string {
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export interface ExchangeRateChartProps {
  oficial: SeriePunto[];
  paralelo: SeriePunto[];
  /** Línea vertical anotada (p.ej. el fin del tipo de cambio fijo). */
  hito?: { f: string; label: string };
  fmt?: (v: number) => string;
}

const W = 720;
const H = 264;
const M = { top: 16, right: 14, bottom: 22, left: 36 };

export function ExchangeRateChart({ oficial, paralelo, hito, fmt = (v) => v.toFixed(2) }: ExchangeRateChartProps) {
  const theme = useTheme();
  const axisRef = useRef<SVGGElement>(null);
  const [hi, setHi] = useState<number | null>(null);

  const ofPts = useMemo(() => oficial.map((p) => ({ d: parse(p.f), v: p.v })), [oficial]);
  const paPts = useMemo(() => paralelo.map((p) => ({ d: parse(p.f), v: p.v })), [paralelo]);

  // merge por fecha (ambas series son diarias) para el área de la brecha y el hover
  const merged = useMemo(() => {
    const byDate = new Map<number, { d: Date; of?: number; pa?: number }>();
    for (const p of ofPts) byDate.set(p.d.getTime(), { d: p.d, of: p.v });
    for (const p of paPts) {
      const e = byDate.get(p.d.getTime());
      if (e) e.pa = p.v;
      else byDate.set(p.d.getTime(), { d: p.d, pa: p.v });
    }
    return [...byDate.values()].sort((a, b) => a.d.getTime() - b.d.getTime());
  }, [ofPts, paPts]);

  const { x, y, ofLine, paLine, gapArea, yTicks } = useMemo(() => {
    const all = [...ofPts, ...paPts];
    const ds = all.map((p) => p.d.getTime());
    const xs = scaleUtc()
      .domain([new Date(Math.min(...ds)), new Date(Math.max(...ds))])
      .range([M.left, W - M.right]);
    const vs = all.map((p) => p.v);
    const vmin = Math.min(...vs);
    const vmax = Math.max(...vs);
    const pad = (vmax - vmin) * 0.12 || 1;
    const ys = scaleLinear().domain([vmin - pad, vmax + pad]).range([H - M.bottom, M.top]);

    const l = d3line<{ d: Date; v: number }>().x((p) => xs(p.d)).y((p) => ys(p.v)).curve(curveMonotoneX);
    // área entre las dos líneas (solo donde hay ambos valores)
    const both = merged.filter((p) => p.of != null && p.pa != null) as { d: Date; of: number; pa: number }[];
    const a = d3area<{ d: Date; of: number; pa: number }>()
      .x((p) => xs(p.d))
      .y0((p) => ys(p.pa))
      .y1((p) => ys(p.of))
      .curve(curveMonotoneX);
    return {
      x: xs,
      y: ys,
      ofLine: l(ofPts) ?? '',
      paLine: l(paPts) ?? '',
      gapArea: a(both) ?? '',
      yTicks: ys.ticks(4),
    };
  }, [ofPts, paPts, merged]);

  useEffect(() => {
    if (!axisRef.current) return;
    const g = select(axisRef.current);
    g.call(axisBottom(x).ticks(6).tickSize(0).tickPadding(8).tickFormat((d) => {
      const dt = d as Date;
      return `${MESES[dt.getUTCMonth()]} ${String(dt.getUTCFullYear()).slice(2)}`;
    }));
    g.select('.domain').remove();
    g.selectAll('text')
      .attr('fill', 'var(--fg-subtle)')
      .attr('font-size', '9')
      .attr('font-family', '"JetBrains Mono", monospace');
  }, [x, theme]);

  const bisect = useMemo(() => bisector<{ d: Date }, Date>((p) => p.d).center, []);
  function onMove(e: MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    const i = bisect(merged, x.invert(mx));
    setHi(Math.max(0, Math.min(merged.length - 1, i)));
  }

  if (!merged.length) return null;

  const OFC = 'var(--neg)';
  const PAC = 'var(--fg-muted)';
  const hitoX = hito ? x(parse(hito.f)) : null;

  const cur = hi != null ? merged[hi] : null;
  const hx = cur ? x(cur.d) : 0;

  return (
    <div>
      {/* leyenda */}
      <div className="flex items-center gap-4 mb-1.5 mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <span style={{ width: 14, height: 2, background: OFC, display: 'inline-block' }} /> Oficial · TCO
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ width: 14, height: 0, borderTop: `2px dashed ${PAC}`, display: 'inline-block' }} /> Paralelo · P2P
        </span>
        <span className="flex items-center gap-1.5 text-subtle">
          <span style={{ width: 12, height: 8, background: OFC, opacity: 0.12, display: 'inline-block' }} /> brecha
        </span>
      </div>

      <svg key={theme} viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ overflow: 'visible' }}>
        {/* grid + eje Y */}
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={M.left} y1={y(t)} x2={W - M.right} y2={y(t)} strokeWidth="0.5" strokeDasharray="2 3" style={{ stroke: 'var(--border)' }} />
            <text x={M.left - 6} y={y(t)} dy="3" textAnchor="end" fontSize="9" fontFamily='"JetBrains Mono", monospace' style={{ fill: 'var(--fg-subtle)' }}>
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        {/* brecha sombreada entre líneas */}
        <path d={gapArea} opacity="0.12" style={{ fill: OFC }} />

        {/* líneas */}
        <path d={paLine} strokeWidth="1.4" strokeDasharray="3 2" style={{ fill: 'none', stroke: PAC }} />
        <path d={ofLine} strokeWidth="1.75" style={{ fill: 'none', stroke: OFC }} />

        {/* anotación del hito (fin del TC fijo) */}
        {hitoX != null && (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={hitoX} y1={M.top} x2={hitoX} y2={H - M.bottom} strokeWidth="1" strokeDasharray="3 2" style={{ stroke: 'var(--accent)' }} />
            <rect x={Math.min(hitoX + 4, W - 128)} y={M.top} width="122" height="15" rx="3" style={{ fill: 'var(--accent)', opacity: 0.14 }} />
            <text x={Math.min(hitoX + 8, W - 124)} y={M.top + 11} fontSize="9" fontFamily='"JetBrains Mono", monospace' style={{ fill: 'var(--accent)' }}>
              {hito!.label}
            </text>
          </g>
        )}

        <g ref={axisRef} transform={`translate(0 ${H - M.bottom})`} />

        {/* hover */}
        {cur && (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={hx} y1={M.top} x2={hx} y2={H - M.bottom} strokeWidth="0.75" strokeDasharray="2 2" style={{ stroke: 'var(--border-strong)' }} />
            {cur.of != null && <circle cx={hx} cy={y(cur.of)} r="3.2" strokeWidth="1.5" style={{ fill: OFC, stroke: 'var(--bg-elev)' }} />}
            {cur.pa != null && <circle cx={hx} cy={y(cur.pa)} r="3.2" strokeWidth="1.5" style={{ fill: PAC, stroke: 'var(--bg-elev)' }} />}
            <g transform={`translate(${Math.min(Math.max(hx - 62, 2), W - 126)} ${M.top})`}>
              <rect width="124" height="46" rx="4" style={{ fill: 'var(--bg-elev)', stroke: 'var(--border-strong)' }} />
              <text x="8" y="14" fontSize="9" fontFamily='"JetBrains Mono", monospace' style={{ fill: 'var(--fg-subtle)' }}>{tipLabel(cur.d)}</text>
              <text x="8" y="28" fontSize="11" fontFamily='"JetBrains Mono", monospace' style={{ fill: OFC }}>
                of {cur.of != null ? fmt(cur.of) : 's/d'}
              </text>
              <text x="8" y="40" fontSize="11" fontFamily='"JetBrains Mono", monospace' style={{ fill: 'var(--fg-muted)' }}>
                par {cur.pa != null ? fmt(cur.pa) : 's/d'}
              </text>
            </g>
          </g>
        )}

        <rect x="0" y="0" width={W} height={H} fill="transparent" style={{ cursor: 'crosshair' }} onMouseMove={onMove} onMouseLeave={() => setHi(null)} />
      </svg>
    </div>
  );
}
