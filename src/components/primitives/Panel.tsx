import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = '' }: PanelProps) {
  return <div className={`surface rounded-[5px] overflow-hidden ${className}`}>{children}</div>;
}
