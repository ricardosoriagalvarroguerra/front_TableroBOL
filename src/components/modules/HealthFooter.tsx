import type { Fuente, FuenteStatus } from '../../types';

interface HealthFooterProps {
  fuentes: Fuente[];
  now: string;
  source?: 'api' | 'mock' | 'loading';
}

const dot = (st: FuenteStatus): string =>
  st === 'live'
    ? 'var(--pos)'
    : st === 'ok'
      ? 'var(--pos)'
      : st === 'lag'
        ? 'var(--accent)'
        : st === 'cold'
          ? 'var(--fg-subtle)'
          : 'var(--neg)';

export function HealthFooter({ fuentes, now, source }: HealthFooterProps) {
  const origen =
    source === 'api' ? 'BDR en vivo' : source === 'mock' ? 'datos locales' : '…';
  return (
    <div className="border-t border-token px-4 py-2 flex items-center gap-4 overflow-x-auto scrollbar-thin">
      <div className="mono text-[9px] uppercase tracking-[0.18em] text-subtle whitespace-nowrap">
        F · Fuentes
      </div>
      {fuentes.map((f) => (
        <div key={f.id} className="flex items-center gap-1.5 whitespace-nowrap">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${f.status === 'live' ? 'pulse-dot' : ''}`}
            style={{ background: dot(f.status) }}
          />
          <span className="mono text-[10px] text-muted">{f.name}</span>
          <span className="mono text-[9px] text-subtle">{f.latency != null ? `${f.latency}ms` : '—'}</span>
          <span className="mono text-[9px] text-subtle">· {f.last}</span>
        </div>
      ))}
      <div className="ml-auto mono text-[9px] uppercase tracking-[0.18em] text-subtle whitespace-nowrap">
        {origen} · uptime 99,4% · sesión {now}
      </div>
    </div>
  );
}
