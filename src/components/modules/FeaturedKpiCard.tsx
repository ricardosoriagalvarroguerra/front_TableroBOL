import { useMemo } from 'react';
import { useTheme } from '../../theme';
import { Delta } from '../primitives/Delta';
import { Frescura, frescuraTexto } from '../primitives/Frescura';
import { scaleLinear } from 'd3-scale';
import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
import { polarityOf, deltaTone, trendTone } from '../../tone';
import type { Kpi } from '../../types';

interface FeaturedKpiCardProps {
  k: Kpi;
  onClick?: (k: Kpi) => void;
  /** Banda objetivo (p. ej. rango meta de inflación) dibujada detrás de la serie. */
  band?: [number, number];
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
/** «2026-11-14» → «nov 26». */
const fechaCorta = (f: string) => {
  const [y, m] = f.split('-').map(Number);
  return `${MESES[(m || 1) - 1]} ${String(y).slice(2)}`;
};

const W = 300;
const H = 64;
export function FeaturedKpiCard({ k, onClick, band }: FeaturedKpiCardProps) {
  const theme = useTheme();
  const pol = polarityOf(k.id);
  const tone = trendTone(pol, k.spark);
  const color = tone === 'pos' ? 'var(--pos)' : tone === 'neg' ? 'var(--neg)' : 'var(--fg-muted)';

  // Escala Y común a la serie y a la banda, para que la banda quede a escala.
  const geo = useMemo(() => {
    const all = band ? [...k.spark, band[0], band[1]] : k.spark;
    let lo = Math.min(...all);
    let hi = Math.max(...all);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.1;
    const x = scaleLinear().domain([0, Math.max(1, k.spark.length - 1)]).range([2, W - 3]);
    const y = scaleLinear().domain([lo - pad, hi + pad]).range([H, 0]);
    const pts = k.spark.map((v, i) => [x(i), y(v)] as [number, number]);
    const lg = d3line<[number, number]>().x((d) => d[0]).y((d) => d[1]).curve(curveMonotoneX);
    const ag = d3area<[number, number]>().x((d) => d[0]).y0(H).y1((d) => d[1]).curve(curveMonotoneX);
    return { y, path: lg(pts) ?? '', area: ag(pts) ?? '', last: pts[pts.length - 1] };
  }, [k.spark, band]);
  const win = k.history?.slice(-k.spark.length);
  const p0 = win?.length ? fechaCorta(win[0].f) : undefined;
  const pN = win?.length ? fechaCorta(win[win.length - 1].f) : undefined;

  return (
    <button
      onClick={() => onClick && onClick(k)}
      className="card card-hover text-left flex flex-col p-5 h-full"
      style={{ minHeight: 184 }}
      title={k.def}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[12px] text-muted">{k.label}</div>
        <Delta value={k.delta} label={k.deltaLabel} sentiment={deltaTone(pol, k.delta)} />
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
        <span className="mono text-[38px] leading-none" style={{ letterSpacing: '-0.03em' }}>
          {k.fmt(k.value)}
        </span>
        {k.unit && <span className="mono text-[12px] text-muted">{k.unit}</span>}
      </div>
      {k.extra && (
        <div className="mt-2 text-[11.5px] text-muted">
          {k.extra.label} {k.extra.value}
        </div>
      )}

      <div className="mt-auto pt-3 flex-1 flex flex-col justify-end min-h-[80px]">
        <svg key={theme} viewBox={`0 0 ${W} ${H}`} className="w-full block flex-1" style={{ minHeight: 64, maxHeight: 150, overflow: 'visible' }} preserveAspectRatio="none">
          {band && (
            <rect x="0" width={W} y={geo.y(band[1])} height={Math.max(0, geo.y(band[0]) - geo.y(band[1]))} style={{ fill: 'var(--pos-soft)' }} />
          )}
          <path d={geo.path} strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ fill: 'none', stroke: color }} />
          
        </svg>
        <div className="mt-2 flex items-center justify-between text-[11px] text-subtle">
          <span>{p0 ?? ''}</span>
                    <span className="flex items-center gap-1.5" title={frescuraTexto(k.fecha, k.periodicidad) ?? undefined}>
            <Frescura fecha={k.fecha} periodicidad={k.periodicidad} />
            {pN ?? k.asof}
          </span>
        </div>
      </div>
    </button>
  );
}
