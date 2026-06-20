import type { Sentiment } from '../../types';

interface DeltaProps {
  value: number;
  label: string;
  sentiment?: Sentiment;
}

export function Delta({ value, label, sentiment }: DeltaProps) {
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '◆';
  const cls = sentiment === 'pos' ? 'text-pos' : sentiment === 'neg' ? 'text-neg' : 'text-muted';
  return (
    <span className={`mono text-[11px] ${cls} inline-flex items-center gap-1`}>
      <span className="text-[8px]">{arrow}</span>
      {label}
    </span>
  );
}
