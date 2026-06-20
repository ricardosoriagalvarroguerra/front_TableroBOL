import { Panel } from '../primitives/Panel';
import { Delta } from '../primitives/Delta';
import { Sparkline } from '../primitives/Sparkline';
import { polarityOf, deltaTone, trendTone } from '../../tone';
import type { Kpi } from '../../types';

interface KpiGroupProps {
  title: string;
  items: Kpi[];
  onOpen?: (k: Kpi) => void;
}

export function KpiGroup({ title, items, onOpen }: KpiGroupProps) {
  return (
    <Panel className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 h-8 border-b border-token">
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-muted">{title}</span>
        <span className="mono text-[9px] text-subtle">{items.length}</span>
      </div>
      <div className="flex flex-col">
        {items.map((k) => {
          const pol = polarityOf(k.id);
          return (
            <button
              key={k.id}
              onClick={() => onOpen && onOpen(k)}
              className="w-full text-left flex items-center gap-2 px-3 py-2.5 border-b border-token last:border-b-0 row-hover"
            >
              <span className="mono text-[9px] uppercase tracking-wider text-subtle flex-1 min-w-0 truncate">
                {k.label}
              </span>
              <span className="mono text-[15px] tabular-nums shrink-0">
                {k.fmt(k.value)}
                {k.unit && <span className="text-subtle text-[9px]"> {k.unit}</span>}
              </span>
              <span className="w-[68px] flex justify-end shrink-0">
                <Delta value={k.delta} label={k.deltaLabel} sentiment={deltaTone(pol, k.delta)} />
              </span>
              <span className="shrink-0">
                <Sparkline data={k.spark} sentiment={trendTone(pol, k.spark)} width={52} height={18} />
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
