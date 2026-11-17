import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { scaleLinear } from 'd3-scale';
import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
import { useTheme } from '../../theme';

export interface SeriesChartProps {
  data: number[];
  /** Etiquetas de período por punto (eje X). */
  labels?: string[];
  height?: number;
  color?: string;
  /** Banda objetivo sombreada (p. ej. rango meta 3–6%). */
  band?: [number, number];
  /** Líneas de referencia horizontales. */
  refs?: { value: number; label: string; color?: string }[];
  fmt?: (v: number) => string;
  /** 'line' (área+línea) o 'bars' (columnas ±, útil para déficits/variaciones). */
  kind?: 'line' | 'bars';
  /** Serie secundaria opcional (p. ej. TPM sobre la inflación). */
  overlay?: { data: number[]; color: string; label: string };
  showValues?: boolean;
  /** Barras en gris (último dato resaltado) en vez de verde/rojo por signo. */
  neutralBars?: boolean;
}

const W = 640;
const PAD = { l: 34, r: 12, t: 14, b: 22 };
const FONT = '"JetBrains Mono", ui-monospace, monospace';
const fmtDef = (v: number) => v.toFixed(1).replace('.', ',');

/** Gráfico de serie con ejes, banda meta, referencias y tooltip (d3 scales). */
export function SeriesChart({
  data,
  labels,
  height = 180,
  color = 'var(--info)',
  band,
  refs = [],
  fmt = fmtDef,
  kind = 'line',
  overlay,
  showValues = false,
  neutralBars = false,
}: SeriesChartProps) {
  const theme = useTheme();
  const [hi, setHi] = useState<number | null>(null);
  const H = height;

  const geo = useMemo(() => {
    const all = [...data, ...(overlay?.data ?? []), ...refs.map((r) => r.value), ...(band ?? [])];
    if (kind === 'bars') all.push(0);
    let min = Math.min(...all);
    let max = Math.max(...all);
    if (!isFinite(min)) { min = 0; max = 1; }
    if (min === max) { min -= 1; max += 1; }
    const span = max - min;
    min -= span * 0.12;
    max += span * 0.12;
    const n = data.length;
    const x = kind === 'bars'
      ? scaleLinear().domain([-0.5, n - 0.5]).range([PAD.l, W - PAD.r])
      : scaleLinear().domain([0, Math.max(1, n - 1)]).range([PAD.l + 6, W - PAD.r - 6]);
    const y = scaleLinear().domain([min, max]).range([H - PAD.b, PAD.t]).nice(4);
    const pts = data.map((v, i) => [x(i), y(v)] as [number, number]);
    const lineGen = d3line<[number, number]>().x((d) => d[0]).y((d) => d[1]).curve(curveMonotoneX);
    const areaGen = d3area<[number, number]>().x((d) => d[0]).y0(H - PAD.b).y1((d) => d[1]).curve(curveMonotoneX);
    const ov = overlay ? overlay.data.map((v, i) => [x(i), y(v)] as [number, number]) : null;
    return {
      x, y, pts,
      line: lineGen(pts) ?? '', area: areaGen(pts) ?? '',
      ovLine: ov ? (d3line<[number, number]>().x((d) => d[0]).y((d) => d[1]).curve(curveMonotoneX)(ov) ?? '') : '',
      ticks: y.ticks(4),
      bw: kind === 'bars' ? Math.min(34, ((W - PAD.l - PAD.r) / Math.max(1, n)) * 0.62) : 0,
    };
  }, [data, overlay, refs, band, kind, H]);

  function onMove(e: MouseEvent<SVGRectElement>) {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(geo.x.invert(px));
    setHi(Math.max(0, Math.min(data.length - 1, i)));
  }

  const step = labels && labels.length > 8 ? Math.ceil(labels.length / 7) : 1;
  const tip = hi != null ? geo.pts[hi] : null;
  const tipW = 118;

  return (
    <svg key={theme} viewBox={`0 0 ${W} ${H}`} className="w-full block select-none" style={{ overflow: 'visible' }}>
      {/* grilla + eje Y */}
      {geo.ticks.map((t) => (
        <g key={t}>
          <line x1={PAD.l} x2={W - PAD.r} y1={geo.y(t)} y2={geo.y(t)} strokeWidth="1" style={{ stroke: 'var(--border)' }} strokeDasharray={t === 0 ? undefined : '2 4'} />
          <text x={PAD.l - 6} y={geo.y(t) + 3} textAnchor="end" fontSize="9.5" fontFamily={FONT} style={{ fill: 'var(--fg-subtle)' }}>
            {fmt(t)}
          </text>
        </g>
      ))}
      {/* banda meta */}
      {band && (
        <g>
          <rect x={PAD.l} width={W - PAD.l - PAD.r} y={geo.y(band[1])} height={Math.max(0, geo.y(band[0]) - geo.y(band[1]))} style={{ fill: 'var(--pos-soft)' }} />
          <text x={W - PAD.r - 4} y={geo.y(band[1]) + 11} textAnchor="end" fontSize="9" fontFamily={FONT} style={{ fill: 'var(--pos)' }}>
            rango meta {fmt(band[0])}–{fmt(band[1])}
          </text>
        </g>
      )}
      {refs.map((r) => (
        <g key={r.label}>
          <line x1={PAD.l} x2={W - PAD.r} y1={geo.y(r.value)} y2={geo.y(r.value)} strokeWidth="1" strokeDasharray="5 4" style={{ stroke: r.color ?? 'var(--fg-subtle)' }} />
          <text x={PAD.l + 4} y={geo.y(r.value) - 4} fontSize="9" fontFamily={FONT} style={{ fill: r.color ?? 'var(--fg-subtle)' }}>
            {r.label}
          </text>
        </g>
      ))}

      {kind === 'line' ? (
        <g>
          <path d={geo.area} style={{ fill: color }} opacity="0.09" />
          <path d={geo.line} strokeWidth="2" style={{ fill: 'none', stroke: color }} strokeLinejoin="round" />
          {geo.pts.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={i === geo.pts.length - 1 ? 3.6 : 2.2} style={{ fill: i === geo.pts.length - 1 ? color : 'var(--bg-elev)', stroke: color }} strokeWidth="1.4" />
          ))}
        </g>
      ) : (
        <g>
          {data.map((v, i) => {
            const y0 = geo.y(0);
            const y1 = geo.y(v);
            const c = neutralBars ? (i === data.length - 1 ? 'var(--fg)' : 'var(--fg-subtle)') : v >= 0 ? 'var(--pos)' : 'var(--neg)';
            return (
              <rect key={i} x={geo.x(i) - geo.bw / 2} width={geo.bw} y={Math.min(y0, y1)} height={Math.max(1, Math.abs(y1 - y0))} rx="2"
                style={{ fill: c }} opacity={hi == null || hi === i ? (i === data.length - 1 ? 1 : 0.7) : 0.35} />
            );
          })}
        </g>
      )}
      {overlay && <path d={geo.ovLine} strokeWidth="1.6" strokeDasharray="4 3" style={{ fill: 'none', stroke: overlay.color }} />}

      {showValues && data.map((v, i) => (
        <text key={i} x={geo.pts[i][0]} y={(kind === 'bars' && v < 0 ? geo.y(v) + 12 : geo.pts[i][1] - 7)} textAnchor="middle" fontSize="9" fontFamily={FONT} style={{ fill: 'var(--fg-muted)' }}>
          {fmt(v)}
        </text>
      ))}

      {/* eje X */}
      {labels && labels.map((l, i) => (i % step === 0 || i === labels.length - 1) && (
        <text key={i} x={geo.x(i)} y={H - 6} textAnchor="middle" fontSize="9" fontFamily={FONT} style={{ fill: i === labels.length - 1 ? 'var(--fg-muted)' : 'var(--fg-subtle)' }}>
          {l}
        </text>
      ))}

      {tip && hi != null && (
        <g style={{ pointerEvents: 'none' }}>
          <line x1={tip[0]} x2={tip[0]} y1={PAD.t} y2={H - PAD.b} strokeDasharray="2 2" style={{ stroke: 'var(--border-strong)' }} />
          <rect x={Math.min(Math.max(tip[0] - tipW / 2, 2), W - tipW - 2)} y={2} width={tipW} height={overlay ? 46 : 34} rx="5" style={{ fill: 'var(--bg-elev)', stroke: 'var(--border-strong)' }} />
          <text x={Math.min(Math.max(tip[0] - tipW / 2, 2), W - tipW - 2) + 8} y={15} fontSize="9.5" fontFamily={FONT} style={{ fill: 'var(--fg-subtle)' }}>
            {labels?.[hi] ?? `${hi + 1} / ${data.length}`}
          </text>
          <text x={Math.min(Math.max(tip[0] - tipW / 2, 2), W - tipW - 2) + 8} y={29} fontSize="12" fontFamily={FONT} style={{ fill: 'var(--fg)' }}>
            {fmt(data[hi])}
          </text>
          {overlay && (
            <text x={Math.min(Math.max(tip[0] - tipW / 2, 2), W - tipW - 2) + 8} y={42} fontSize="9.5" fontFamily={FONT} style={{ fill: overlay.color }}>
              {overlay.label} {fmt(overlay.data[hi])}
            </text>
          )}
        </g>
      )}
      <rect x={PAD.l} y={0} width={W - PAD.l - PAD.r} height={H} fill="transparent" style={{ cursor: 'crosshair' }} onMouseMove={onMove} onMouseLeave={() => setHi(null)} />
    </svg>
  );
}
