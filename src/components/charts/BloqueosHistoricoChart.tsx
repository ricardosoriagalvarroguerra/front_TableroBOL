// Gráfico de la serie histórica DIARIA de bloqueos (Módulo B · pestaña
// «Histórico»), construido con D3.js. Multi-serie: Total + La Paz + Cochabamba
// + Santa Cruz. Eje X temporal real (por fecha), eje Y = nº de puntos de
// bloqueo. Hover por día con el desglose de las 4 series. Mismo enfoque que
// IndicatorChart (React maneja el SVG; D3 hace escalas, eje y geometría).

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { scaleUtc, scaleLinear } from 'd3-scale';
import { line as d3line, curveMonotoneX } from 'd3-shape';
import { axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { bisector } from 'd3-array';
import { useTheme } from '../../theme';
import {
  BLOQUEOS_HISTORICO,
  SERIES_HIST,
  BLOQUEOS_HISTORICO_META,
  type BloqueoDia,
} from '../../data/bloqueosHistorico';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
function parse(f: string): Date {
  const [y, m, d] = f.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}
function fechaLarga(d: Date): string {
  return `${d.getUTCDate()} ${MESES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const W = 720;
const H = 264;
const M = { top: 12, right: 12, bottom: 22, left: 24 };

type Pt = BloqueoDia & { d: Date };

export function BloqueosHistoricoChart() {
  const theme = useTheme();
  const axisRef = useRef<SVGGElement>(null);
  const [hi, setHi] = useState<number | null>(null);

  const pts = useMemo<Pt[]>(() => BLOQUEOS_HISTORICO.map((p) => ({ ...p, d: parse(p.f) })), []);

  const { x, y, paths } = useMemo(() => {
    const last = pts.length - 1;
    const xs = scaleUtc()
      .domain([pts[0].d, pts[last].d])
      .range([M.left, W - M.right]);
    const vmax = Math.max(...pts.map((p) => p.total));
    const ys = scaleLinear()
      .domain([0, vmax * 1.12])
      .range([H - M.bottom, M.top]);
    const paths = SERIES_HIST.map((s) => {
      const l = d3line<Pt>()
        .x((p) => xs(p.d))
        .y((p) => ys(p[s.key]))
        .curve(curveMonotoneX);
      return { ...s, dpath: l(pts) ?? '' };
    });
    return { x: xs, y: ys, paths };
  }, [pts]);

  // eje X temporal con d3-axis (sobre un <g> que React deja vacío)
  useEffect(() => {
    if (!axisRef.current) return;
    const g = select(axisRef.current);
    g.call(
      axisBottom<Date>(x)
        .ticks(7)
        .tickSize(0)
        .tickPadding(8)
        .tickFormat((d) => `${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`),
    );
    g.select('.domain').remove();
    g.selectAll('text')
      .attr('fill', 'var(--fg-subtle)')
      .attr('font-size', '9')
      .attr('font-family', '"JetBrains Mono", monospace');
  }, [x, theme]);

  const bisect = useMemo(() => bisector<Pt, Date>((p) => p.d).center, []);
  function onMove(e: MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    setHi(Math.max(0, Math.min(pts.length - 1, bisect(pts, x.invert(mx)))));
  }

  const hp = hi != null ? pts[hi] : null;
  const hx = hp ? x(hp.d) : 0;
  const boxW = 124;
  const boxH = 20 + SERIES_HIST.length * 13;
  const bx = Math.min(Math.max(hx + 10, 2), W - boxW - 2);
  const by = M.top;

  return (
    <div className="flex flex-col gap-2 w-full max-w-[1000px] mx-auto">
      {/* leyenda */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {SERIES_HIST.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 mono text-[9px] uppercase tracking-wider text-muted">
            <span className="inline-block w-3 h-[2px]" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
        <span className="mono text-[9px] uppercase tracking-wider text-subtle ml-auto">
          {BLOQUEOS_HISTORICO_META.reportes} reportes · pico {BLOQUEOS_HISTORICO_META.pico} ({BLOQUEOS_HISTORICO_META.picoFecha})
        </span>
      </div>

      <svg key={theme} viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ overflow: 'visible' }}>
        {/* gridlines + etiquetas del eje Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const yy = M.top + (H - M.bottom - M.top) * t;
          return (
            <g key={t}>
              <line x1={M.left} y1={yy} x2={W - M.right} y2={yy} strokeWidth="0.5" strokeDasharray="2 3" style={{ stroke: 'var(--border)' }} />
              <text x={2} y={yy + 3} fontSize="8" fontFamily='"JetBrains Mono", monospace' style={{ fill: 'var(--fg-subtle)' }}>
                {Math.round(y.invert(yy))}
              </text>
            </g>
          );
        })}

        {/* trazos por serie (Total más grueso) */}
        {paths.map((s) => (
          <path
            key={s.key}
            d={s.dpath}
            strokeWidth={s.key === 'total' ? 1.9 : 1.3}
            style={{ fill: 'none', stroke: s.color, opacity: s.key === 'total' ? 0.95 : 0.85 }}
          />
        ))}

        {/* puntos en los reportes reales de la ABC (sobre la línea Total) */}
        {pts.filter((p) => p.esReal).map((p, i) => (
          <circle key={i} cx={x(p.d)} cy={y(p.total)} r="2" style={{ fill: 'var(--fg-muted)' }} />
        ))}

        <g ref={axisRef} transform={`translate(0 ${H - M.bottom})`} />

        {/* hover por día */}
        {hp && (
          <g style={{ pointerEvents: 'none' }}>
            <line x1={hx} y1={M.top} x2={hx} y2={H - M.bottom} strokeWidth="0.75" strokeDasharray="2 2" style={{ stroke: 'var(--border-strong)' }} />
            {SERIES_HIST.map((s) => (
              <circle key={s.key} cx={hx} cy={y(hp[s.key])} r="2.6" strokeWidth="1.25" style={{ fill: s.color, stroke: 'var(--bg-elev)' }} />
            ))}
            <rect x={bx} y={by} width={boxW} height={boxH} rx="4" style={{ fill: 'var(--bg-elev)', stroke: 'var(--border-strong)' }} />
            <text x={bx + 7} y={by + 12} fontSize="9" fontFamily='"JetBrains Mono", monospace' style={{ fill: 'var(--fg-subtle)' }}>
              {fechaLarga(hp.d)}
              {hp.esReal ? '' : ' · interp.'}
            </text>
            {SERIES_HIST.map((s, i) => (
              <text key={s.key} x={bx + 7} y={by + 26 + i * 13} fontSize="10" fontFamily='"JetBrains Mono", monospace'>
                <tspan style={{ fill: s.color }}>● </tspan>
                <tspan style={{ fill: 'var(--fg)' }}>
                  {s.label}: {hp[s.key]}
                </tspan>
              </text>
            ))}
          </g>
        )}

        <rect x="0" y="0" width={W} height={H} fill="transparent" style={{ cursor: 'crosshair' }} onMouseMove={onMove} onMouseLeave={() => setHi(null)} />
      </svg>

      <div className="text-[10px] text-subtle leading-snug">{BLOQUEOS_HISTORICO_META.nota}</div>
    </div>
  );
}
