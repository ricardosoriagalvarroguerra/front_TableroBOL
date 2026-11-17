import type { Fuente, FuenteStatus } from '../../types';

interface HealthFooterProps {
  fuentes: Fuente[];
  now: string;
  source?: 'api' | 'mock' | 'loading';
  snapshot?: string;
}

const dot = (st: FuenteStatus): string =>
  st === 'live' || st === 'ok' ? 'var(--pos)' : st === 'lag' ? 'var(--accent)' : st === 'cold' ? 'var(--fg-subtle)' : 'var(--neg)';
const label = (st: FuenteStatus) =>
  st === 'live' ? 'en vivo' : st === 'ok' ? 'al día' : st === 'lag' ? 'con rezago' : st === 'cold' ? 'sin actualizar' : 'caída';

export function HealthFooter({ fuentes, now, source, snapshot }: HealthFooterProps) {
  const origen = source === 'api' ? 'BDR en vivo' : source === 'mock' ? 'datos embebidos' : '…';
  const ok = fuentes.filter((f) => f.status === 'ok' || f.status === 'live').length;
  return (
    <footer className="border-t border-token">
      <div className="px-4 sm:px-6 py-3 flex items-center gap-5 overflow-x-auto scrollbar-thin">
        <div className="whitespace-nowrap flex items-center gap-2">
          <span className="text-[11px] text-muted">
            Fuentes {ok}/{fuentes.length} al día
          </span>
        </div>
        {fuentes.map((f) => (
          <div key={f.id} className="flex items-center gap-1.5 whitespace-nowrap" title={`${f.name} · ${label(f.status)} · último dato ${f.last}`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${f.status === 'live' ? 'pulse-dot' : ''}`} style={{ background: dot(f.status) }} />
            <span className="text-[11px] text-subtle">{f.name.split(' · ')[0]}</span>
          </div>
        ))}
        <div className="ml-auto text-[11px] text-subtle whitespace-nowrap" title={`sesión ${now}`}>
          {origen} · corte {snapshot}
        </div>
      </div>
    </footer>
  );
}
