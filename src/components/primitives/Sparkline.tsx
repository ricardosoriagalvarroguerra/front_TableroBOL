// Sparkline de las tarjetas de indicadores — construido con D3 (d3-scale + d3-shape).
import { useTheme } from '../../theme';
import { scaleLinear } from 'd3-scale';
import { line as d3line, area as d3area, curveMonotoneX } from 'd3-shape';
import type { Sentiment } from '../../types';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  sentiment?: Sentiment;
  filled?: boolean;
}

export function Sparkline({
  data,
  width = 110,
  height = 24,
  sentiment = 'neutral',
  filled = true,
}: SparklineProps) {
  const theme = useTheme();
  if (!data || !data.length) return null;

  const x = scaleLinear().domain([0, Math.max(1, data.length - 1)]).range([0, width]);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const y = scaleLinear()
    .domain(min === max ? [min - 1, max + 1] : [min, max])
    .range([height - 1, 1]);

  const lineGen = d3line<number>().x((_, i) => x(i)).y((v) => y(v)).curve(curveMonotoneX);
  const areaGen = d3area<number>().x((_, i) => x(i)).y0(height).y1((v) => y(v)).curve(curveMonotoneX);
  const d = lineGen(data) ?? '';
  const a = areaGen(data) ?? '';

  const color =
    sentiment === 'pos'
      ? 'var(--pos)'
      : sentiment === 'neg'
        ? 'var(--neg)'
        : sentiment === 'accent'
          ? 'var(--accent)'
          : 'var(--fg-muted)';

  return (
    <svg key={theme} width={width} height={height} className="block" style={{ overflow: 'visible' }}>
      {filled && <path d={a} opacity="0.08" style={{ fill: color }} />}
      <path d={d} strokeWidth="1" style={{ fill: 'none', stroke: color }} />
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1])} r="1.6" style={{ fill: color }} />
    </svg>
  );
}
