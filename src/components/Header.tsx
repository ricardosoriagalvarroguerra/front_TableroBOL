import type { RefObject } from 'react';
import type { Kpi, Theme } from '../types';

export interface ClockParts {
  date: string;
  time: string;
  tz: string;
}

export function formatNow(d: Date): ClockParts {
  const dd = d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', timeZone: 'America/La_Paz' });
  const hh = d.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'America/La_Paz',
  });
  return { date: dd.replace('.', '').toUpperCase(), time: hh, tz: 'BOT · UTC−4' };
}

interface HeaderProps {
  theme: Theme;
  setTheme: (t: Theme | ((prev: Theme) => Theme)) => void;
  refreshing: boolean;
  onRefresh: () => void;
  searchRef: RefObject<HTMLInputElement>;
  query: string;
  setQuery: (q: string) => void;
  now: Date;
  /** Fecha de corte de los datos (snapshot). */
  snapshot: string;
  /** Indicadores para la cinta (obsoleto, no se muestra). */
  ticker?: Kpi[];
  source: 'api' | 'mock' | 'loading';
  /** Cantidad de alertas de nivel alto. */
  alertas?: number;
  /** Abre la nota ejecutiva. */
  onNota?: () => void;
}

/** Marca: cordillera estilizada (genérica) en ámbar. */
function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M2 19 L9 7 L13 13 L16 9 L22 19 Z" style={{ fill: 'var(--accent)' }} />
      <path d="M7.6 9.4 L9 7 L10.6 9.5 L9.6 9 L8.6 9.8 Z" style={{ fill: 'var(--bg)' }} opacity="0.55" />
    </svg>
  );
}

export function Header({
  theme,
  setTheme,
  refreshing,
  onRefresh,
  searchRef,
  query,
  setQuery,
  now,
  snapshot,
  source,
  alertas = 0,
  onNota,
}: HeaderProps) {
  const t = formatNow(now);
  const origen = source === 'api' ? 'BDR en vivo' : source === 'mock' ? 'datos embebidos' : 'conectando…';
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur"
      style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center h-14 px-4 sm:px-6 gap-3 sm:gap-5" title={origen}>
        {/* marca */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Mark />
          <div className="leading-tight">
            <div className="text-[13.5px] font-semibold tracking-[-0.01em] whitespace-nowrap">
              Tablero BOL
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-subtle">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${source === 'api' ? 'pulse-dot' : ''}`}
                style={{ background: source === 'api' ? 'var(--pos)' : source === 'mock' ? 'var(--accent)' : 'var(--fg-subtle)' }}
              />
              Datos al {snapshot}
              {alertas > 0 && (
                <span className="text-neg" title="Alertas de nivel alto (ver Panorama)">· {alertas} alerta{alertas > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        </div>

        {/* búsqueda */}
        <div className="flex-1 flex items-center min-w-0 max-w-[560px] mx-auto">
          <label className="surface-sunk rounded-[8px] flex items-center gap-2 px-3 h-9 w-full focus-within:ring-accent">
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden style={{ color: 'var(--fg-subtle)' }}>
              <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <line x1="11" y1="11" x2="15" y2="15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar indicador, fuente…"
              aria-label="Buscar indicadores"
              className="flex-1 min-w-0 bg-transparent outline-none text-[12.5px] placeholder:text-subtle"
            />
            <span className="kbd hidden sm:inline">/</span>
          </label>
        </div>

        {/* acciones */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onNota && (
            <button
              onClick={onNota}
              title="Nota ejecutiva imprimible [N]"
              className="h-9 px-3 surface-sunk rounded-[8px] text-[12px] text-muted hover:ring-accent hidden sm:flex items-center"
            >
              Nota
            </button>
          )}
          <button
            onClick={onRefresh}
            title="Refrescar [R]"
            aria-label="Refrescar"
            className={`h-9 w-9 surface-sunk rounded-[8px] flex items-center justify-center gap-1.5 text-[11.5px] hover:ring-accent ${
              refreshing ? 'text-accent' : 'text-muted'
            }`}
          >
            <span style={refreshing ? { display: 'inline-block', animation: 'spin 800ms linear' } : {}}>↻</span>

          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Modo claro/oscuro [D]"
            aria-label="Cambiar modo claro u oscuro"
            className="h-9 w-9 surface-sunk rounded-[8px] flex items-center justify-center gap-1.5 text-[11.5px] text-muted hover:ring-accent"
          >
            <span>{theme === 'dark' ? '☾' : '☀'}</span>

          </button>
          <span className="hidden lg:inline mono text-[12px] text-subtle tabular-nums pl-2">{t.time}</span>
        </div>
      </div>

    </header>
  );
}
