import type { ReactNode } from 'react';

interface SectionTitleProps {
  /** Código del módulo (se conserva por compatibilidad; no se muestra). */
  id?: string;
  title: string;
  right?: ReactNode;
  /** Bajada opcional; se muestra como tooltip para no sumar texto. */
  sub?: string;
}

export function SectionTitle({ title, right, sub }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 h-12 border-b border-token" title={sub}>
      <span className="text-[13px] font-medium truncate">{title}</span>
      <div className="flex items-center gap-2 text-[11px] text-subtle shrink-0">{right}</div>
    </div>
  );
}
