import { useMemo } from 'react';
import { useTheme } from '../../theme';
import { buildLineChart } from '../../charts/line';
import type { Sentiment } from '../../types';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  sentiment?: Sentiment;
  filled?: boolean;
}

const colorOf = (s: Sentiment): string =>
  s === 'pos' ? 'var(--pos)' : s === 'neg' ? 'var(--neg)' : s === 'accent' ? 'var(--accent)' : 'var(--fg-muted)';

/** Sparkline sobrio: línea neutra; sólo el último punto lleva el color de la tendencia. */
export function Sparkline({ data, width = 110, height = 24, sentiment = 'neutral' }: SparklineProps) {
  const theme = useTheme();
  const chart = useMemo(() => buildLineChart(data, width, height, 2), [data, width, height]);
  if (!data || data.length < 2) return <svg width={width} height={height} />;
  const last = chart.points[chart.points.length - 1];
  return (
    <svg key={theme} width={width} height={height} className="block" style={{ overflow: 'visible' }}>
      <path d={chart.line} strokeWidth="1.25" style={{ fill: 'none', stroke: 'var(--fg-subtle)' }} />
      <circle cx={last[0]} cy={last[1]} r="2" style={{ fill: colorOf(sentiment) }} />
    </svg>
  );
}
