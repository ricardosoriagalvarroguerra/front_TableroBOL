import type { ReactNode } from 'react';

export interface TabDef {
  id: string;
  label: string;
  badge?: ReactNode;
}

interface TabsProps {
  tabs: TabDef[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="sticky top-12 z-20 surface border-l-0 border-r-0 border-t-0">
      <div className="flex items-center gap-0.5 px-2 sm:px-3 overflow-x-auto scrollbar-thin">
        {tabs.map((t) => {
          const on = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={`relative mono text-[10px] uppercase tracking-[0.14em] px-3 h-9 whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                on ? '' : 'text-muted hover:text-accent'
              }`}
            >
              {t.label}
              {t.badge}
              {on && <span className="absolute left-2 right-2 -bottom-px h-[2px] bg-accent rounded-full" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
