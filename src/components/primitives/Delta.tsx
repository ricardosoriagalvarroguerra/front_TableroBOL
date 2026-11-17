import type { Sentiment } from '../../types';

interface DeltaProps {
  value: number;
  label: string;
  sentiment?: Sentiment;
  /** Variante compacta (10px) para filas densas. */
  compact?: boolean;
}

export function Delta({ value, label, sentiment, compact }: DeltaProps) {
  const arrow = value > 0 ? '▲' : value < 0 ? '▼' : '◆';
  const cls = sentiment === 'pos' ? 'text-pos' : sentiment === 'neg' ? 'text-neg' : 'text-muted';
  return (
    <span className={`mono ${compact ? 'text-[10px]' : 'text-[11px]'} ${cls} inline-flex items-center gap-1 whitespace-nowrap`}>
      <span className="text-[8px]">{arrow}</span>
      {label}
    </span>
  );
}
