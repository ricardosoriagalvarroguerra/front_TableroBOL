import type { ReactNode } from 'react';

interface InsightProps {
  title?: string;
  children: ReactNode;
  tone?: 'accent' | 'info' | 'pos' | 'neg';
  className?: string;
}

/** Lectura analítica: una línea sobria, sin caja de color. */
export function Insight({ children, className = '' }: InsightProps) {
  return (
    <p className={`text-[13px] leading-relaxed text-muted max-w-[880px] pl-3 ${className}`} style={{ borderLeft: '2px solid var(--accent)' }}>
      {children}
    </p>
  );
}
