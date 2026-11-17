import { estadoColor } from '../../analytics';
import type { SemaforoItem } from '../../types';

interface SemaforoPanelProps {
  items: SemaforoItem[];
  compact?: boolean;
}

const ARROW = { mejora: '↗', estable: '→', empeora: '↘' } as const;
const ARROW_C = { mejora: 'var(--pos)', estable: 'var(--fg-subtle)', empeora: 'var(--neg)' } as const;

/** Semáforo: una fila de dimensiones con punto de estado y tendencia. Detalle en tooltip. */
export function SemaforoPanel({ items }: SemaforoPanelProps) {
  return (
    <div className="card grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 overflow-hidden">
      {items.map((it) => (
        <div
          key={it.id}
          title={`${it.ancla} — ${it.lectura}`}
          className="px-4 py-3.5 flex flex-col gap-2 cursor-help border-token [&:not(:last-child)]:border-r"
        >
          <div className="text-[11.5px] text-muted truncate">{it.dimension}</div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: estadoColor(it.estado) }} />
            <span className="mono text-[15px]">{it.score}<span className="text-subtle text-[11px]">/5</span></span>
            <span className="ml-auto text-[13px]" style={{ color: ARROW_C[it.tendencia] }}>{ARROW[it.tendencia]}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
