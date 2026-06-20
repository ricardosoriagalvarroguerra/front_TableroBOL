import type { RefObject } from 'react';
import type { Theme } from '../types';

export interface ClockParts {
  date: string;
  time: string;
  tz: string;
}

export function formatNow(d: Date): ClockParts {
  const dd = d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' });
  const hh = d.toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
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
}: HeaderProps) {
  const t = formatNow(now);
  return (
    <header
      className="sticky top-0 z-30 surface border-l-0 border-r-0 border-t-0"
      style={{ borderBottomColor: 'var(--border-strong)' }}
    >
      <div className="flex items-stretch h-12 px-3 sm:px-4 gap-2 sm:gap-4">
        {/* brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 pr-2 sm:pr-4 sm:border-r border-token shrink-0">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-accent pulse-dot" />
          </div>
          <div className="mono text-[11px] tracking-[0.18em] sm:tracking-[0.22em] uppercase whitespace-nowrap">
            Tablero BOL
          </div>
          <span className="hidden lg:inline mono text-[9px] uppercase tracking-wider text-subtle">
            v0.7 · 2026.05
          </span>
        </div>

        {/* search */}
        <div className="flex-1 flex items-center min-w-0 max-w-[640px]">
          <div className="surface-sunk rounded-[4px] flex items-center gap-2 px-2.5 h-8 w-full">
            <span className="mono text-[10px] text-subtle shrink-0">⌕</span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="flex-1 min-w-0 bg-transparent outline-none mono text-[12px] placeholder:text-subtle"
            />
            <span className="kbd hidden sm:inline">/</span>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
          <button
            onClick={onRefresh}
            title="Refrescar [R]"
            aria-label="Refrescar"
            className={`mono text-[10px] uppercase tracking-wider px-2 h-8 surface-sunk rounded-[4px] flex items-center gap-1.5 hover:ring-accent ${
              refreshing ? 'text-accent' : ''
            }`}
          >
            <span
              className={refreshing ? 'inline-block' : ''}
              style={refreshing ? { animation: 'spin 800ms linear' } : {}}
            >
              ↻
            </span>
            <span className="hidden md:inline">refrescar</span>
            <span className="kbd hidden md:inline">R</span>
          </button>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Modo [D]"
            aria-label="Cambiar modo"
            className="mono text-[10px] uppercase tracking-wider px-2 h-8 surface-sunk rounded-[4px] flex items-center gap-1.5 hover:ring-accent"
          >
            <span>{theme === 'dark' ? '○' : '●'}</span>
            <span className="hidden md:inline">{theme === 'dark' ? 'oscuro' : 'claro'}</span>
            <span className="kbd hidden md:inline">D</span>
          </button>
          <div className="hidden sm:flex px-3 h-8 surface-sunk rounded-[4px] items-center gap-3">
            <div className="mono text-[10px] text-muted leading-none flex items-center gap-2">
              <span className="text-subtle hidden md:inline">{t.date}</span>
              <span>
                {t.time}
                <span className="blink">_</span>
              </span>
            </div>
            <span className="hidden lg:inline mono text-[9px] text-subtle uppercase tracking-wider">
              {t.tz}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
