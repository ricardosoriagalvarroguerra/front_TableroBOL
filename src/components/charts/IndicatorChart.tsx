// Gráfico histórico de un indicador (Módulo A) construido con D3.js.
// d3-scale (scaleUtc/scaleLinear) para los ejes, d3-shape (area/line) para los
// trazos, d3-axis para el eje temporal real (espaciado por fecha, no por índice)
// y d3-array (bisector) para el hover por punto más cercano. React maneja el
// árbol SVG y el estado; D3 hace las escalas, el eje y la geometría.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { scaleUtc, scaleLinear } from 'd3-scale';
import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
import { axisBottom } from 'd3-axis';
import { select } from 'd3-selection';
import { bisector } from 'd3-array';
import { useTheme } from '../../theme';
import type { Periodicidad, SeriePunto } from '../../types';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parse(f: string): Date {
  const [y, m, d] = f.split('-').map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
}
function axisLabel(d: Date, per?: Periodicidad): string {
  const y = d.getUTCFullYear();
  if (per === 'anual') return String(y);
  return `${MESES[d.getUTCMonth()]} ${String(y).slice(2)}`;
}
function tipLabel(d: Date, per?: Periodicidad): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const da = d.getUTCDate();
  if (per === 'anual') return String(y);
  if (per === 'diaria') return `${da} ${MESES[m]} ${y}`;
  return `${MESES[m]} ${y}`;
}

interface IndicatorChartProps {
  data: SeriePunto[];
  color: string;
  fmt: (v: number) => string;
  unit?: string;
  periodicidad?: Periodicidad;
}

const W = 720;
const H = 240;
const M = { top: 10, right: 10, bottom: 22, left: 10 };

export function IndicatorChart({ data, color, fmt, unit, periodicidad }: IndicatorChartProps) {
  const theme = useTheme();
  const axisRef = useRef<SVGGElement>(null);
  const [hi, setHi] = useState<number | null>(null);

  const pts = useMemo(() => data.map((p) => ({ d: parse(p.f), v: p.v })), [data]);

  const { x, y, areaPath, linePath } = useMemo(() => {
    const last = pts.length - 1;
    const xs = scaleUtc()
      .domain([pts[0]?.d ?? new Date(0), pts[last]?.d ?? new Date()])
      .range([M.left, W - M.right]);
    const vs = pts.map((p) => p.v);
    const vmin = Math.min(...vs);
    const vmax = Math.max(...vs);
    const pad = (vmax - vmin) * 0.12 || Math.abs(vmax) * 0.12 || 1;
    const ys = scaleLinear()
      .domain([vmin - pad, vmax + pad])
      .range([H - M.bottom, M.top]);
    const a = d3area<{ d: Date; v: number }>()
      .x((p) => xs(p.d))
      .y0(H - M.bottom)
      .y1((p) => ys(p.v))
      .curve(curveMonotoneX);
    const l = d3line<{ d: Date; v: number }>()
      .x((p) => xs(p.d))
      .y((p) => ys(p.v))
      .curve(curveMonotoneX);
    return { x: xs, y: ys, areaPath: a(pts) ?? '', linePath: l(pts) ?? '' };
  }, [pts]);

  // eje X temporal con d3-axis (se pinta sobre un <g> que React deja vacío)
  useEffect(() => {
    if (!axisRef.current) return;
    const g = select(axisRef.current);
    g.call(
      axisBottom(x)
        .ticks(6)
        .tickSize(0)
        .tickPadding(8)
        .tickFormat((d) => axisLabel(d as Date, periodicidad)),
    );
    g.select('.domain').remove();
    g.selectAll('text')
      .attr('fill', 'var(--fg-subtle)')
      .attr('font-size', '9')
      .attr('font-family', '"JetBrains Mono", monospace');
  }, [x, periodicidad, theme]);

  const bisect = useMemo(() => bisector<{ d: Date; v: number }, Date>((p) => p.d).center, []);
  function onMove(e: MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    const i = bisect(pts, x.invert(mx));
    setHi(Math.max(0, Math.min(pts.length - 1, i)));
  }

  if (!pts.length) return null;

  const hx = hi != null ? x(pts[hi].d) : 0;
  const hy = hi != null ? y(pts[hi].v) : 0;
  const boxW = 128;
  const boxH = 34;
  const bx = Math.min(Math.max(hx - boxW / 2, 2), W - boxW - 2);
  const by = Math.max(hy - boxH - 12, 2);

  return (
    <svg key={theme} viewBox={`0 0 ${W} ${H}`} className="w-full block" style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75].map((t) => {
        const yy = M.top + (H - M.bottom - M.top) * t;
        return (
          <line key={t} x1={M.left} y1={yy} x2={W - M.right} y2={yy} strokeWidth="0.5" strokeDasharray="2 3" style={{ stroke: 'var(--border)' }} />
        );
      })}

      <path d={areaPath} opacity="0.1" style={{ fill: color }} />
      <path d={linePath} strokeWidth="1.5" style={{ fill: 'none', stroke: color }} />

      {pts.length <= 40 &&
        pts.map((p, i) => <circle key={i} cx={x(p.d)} cy={y(p.v)} r="2" style={{ fill: color }} />)}

      <g ref={axisRef} transform={`translate(0 ${H - M.bottom})`} />

      {hi != null && (
        <g style={{ pointerEvents: 'none' }}>
          <line x1={hx} y1={M.top} x2={hx} y2={H - M.bottom} strokeWidth="0.75" strokeDasharray="2 2" style={{ stroke: 'var(--border-strong)' }} />
          <circle cx={hx} cy={hy} r="3.4" strokeWidth="1.5" style={{ fill: color, stroke: 'var(--bg-elev)' }} />
          <rect x={bx} y={by} width={boxW} height={boxH} rx="4" style={{ fill: 'var(--bg-elev)', stroke: 'var(--border-strong)' }} />
          <text x={bx + 8} y={by + 13} fontSize="10" fontFamily='"JetBrains Mono", monospace' style={{ fill: 'var(--fg-subtle)' }}>
            {tipLabel(pts[hi].d, periodicidad)}
          </text>
          <text x={bx + 8} y={by + 27} fontSize="13" fontFamily='"JetBrains Mono", monospace' style={{ fill: 'var(--fg)' }}>
            {fmt(pts[hi].v)}
            {unit ? ` ${unit}` : ''}
          </text>
        </g>
      )}

      <rect x="0" y="0" width={W} height={H} fill="transparent" style={{ cursor: 'crosshair' }} onMouseMove={onMove} onMouseLeave={() => setHi(null)} />
    </svg>
  );
}
