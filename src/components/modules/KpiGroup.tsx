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
      <div className="px-4 pt-3.5 pb-1">
        <span className="text-[12px] text-muted">{title}</span>
      </div>
      <div className="flex flex-col flex-1">
        {items.map((k) => {
          const pol = polarityOf(k.id);
          return (
            <button
              key={k.id}
              onClick={() => onOpen && onOpen(k)}
              className="w-full text-left px-4 py-2 row-hover flex-1"
              title={`${k.asof} · ${k.source}`}
            >
              <div className="text-[11px] text-subtle truncate">{k.label}</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="mono text-[17px] tabular-nums leading-none tracking-[-0.02em] shrink-0">
                  {k.fmt(k.value)}
                  {k.unit && <span className="text-subtle text-[9.5px] tracking-normal"> {k.unit}</span>}
                </span>
                <span className="flex-1 min-w-0 overflow-hidden">
                  <Delta compact value={k.delta} label={k.deltaLabel} sentiment={deltaTone(pol, k.delta)} />
                </span>
                <Sparkline data={k.spark} sentiment={trendTone(pol, k.spark)} width={44} height={20} />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
