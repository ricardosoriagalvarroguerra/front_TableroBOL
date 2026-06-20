import { Delta } from '../primitives/Delta';
import { Sparkline } from '../primitives/Sparkline';
import { polarityOf, deltaTone, trendTone } from '../../tone';
import type { Kpi } from '../../types';

interface KpiCardProps {
  k: Kpi;
  onClick?: (k: Kpi) => void;
}

export function KpiCard({ k, onClick }: KpiCardProps) {
  const pol = polarityOf(k.id);
  return (
    <button
      onClick={() => onClick && onClick(k)}
      className="surface rounded-[5px] text-left flex flex-col h-full p-3 hover:ring-accent transition-shadow"
      style={{ minHeight: 116 }}
    >
      <div className="flex items-start justify-between">
        <div className="mono text-[9px] uppercase tracking-[0.14em] text-subtle">{k.label}</div>
        <Delta value={k.delta} label={k.deltaLabel} sentiment={deltaTone(pol, k.delta)} />
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="mono text-[26px] font-medium leading-none" style={{ letterSpacing: '-0.02em' }}>
          {k.fmt(k.value)}
        </span>
        {k.unit && <span className="mono text-[11px] text-muted">{k.unit}</span>}
      </div>
      {k.extra && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="mono text-[9px] uppercase tracking-wider text-subtle">{k.extra.label}</span>
          <span
            className={`mono text-[11px] ${
              k.extra.tone === 'neg' ? 'text-neg' : k.extra.tone === 'pos' ? 'text-pos' : ''
            }`}
          >
            {k.extra.value}
          </span>
        </div>
      )}
      <div className="mt-auto pt-2 flex items-end justify-between">
        <Sparkline data={k.spark} sentiment={trendTone(pol, k.spark)} width={120} height={22} />
        <span className="mono text-[9px] text-subtle">{k.asof}</span>
      </div>
    </button>
  );
}
