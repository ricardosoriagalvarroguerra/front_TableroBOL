import type { ReactNode } from 'react';

export interface TabDef {
  id: string;
  label: string;
  badge?: ReactNode;
  /** Código corto del módulo (p. ej. «AG»). */
  code?: string;
}

interface TabsProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <nav
      className="sticky top-14 z-20 backdrop-blur"
      style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)', borderBottom: '1px solid var(--border)' }}
      aria-label="Módulos del tablero"
    >
      <div className="flex items-center gap-1 px-4 sm:px-6 h-12 overflow-x-auto scrollbar-thin" role="tablist">
        {tabs.map((t, i) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(t.id)}
              title={`${t.label} [${i + 1}]`}
              className={`relative h-8 px-3 rounded-[7px] whitespace-nowrap flex items-center gap-2 text-[12.5px] transition-colors ${
                on ? 'font-medium' : 'text-muted hover:text-[color:var(--fg)]'
              }`}
              style={on ? { background: 'var(--bg-sunk)' } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
