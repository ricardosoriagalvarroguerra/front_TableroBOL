import type { ReactNode } from 'react';

interface SectionTitleProps {
  id: string;
  title: string;
  right?: ReactNode;
}

export function SectionTitle({ id, title, right }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between px-3 h-8 border-b border-token">
      <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.14em] text-muted">
        <span className="text-subtle">{id}</span>
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-2 mono text-[10px] text-subtle">{right}</div>
    </div>
  );
}
