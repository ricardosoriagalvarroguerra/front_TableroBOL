import type { ReactNode } from 'react';
import type { Tone } from '../../types';

interface TagProps {
  children: ReactNode;
  tone?: Tone;
}

export function Tag({ children, tone = 'neutral' }: TagProps) {
  const map: Record<Tone, { bg: string; fg: string; bd: string }> = {
    neutral: { bg: 'var(--bg-sunk)', fg: 'var(--fg-muted)', bd: 'var(--border)' },
    accent: { bg: 'transparent', fg: 'var(--accent)', bd: 'var(--accent)' },
    pos: { bg: 'transparent', fg: 'var(--pos)', bd: 'var(--pos)' },
    neg: { bg: 'transparent', fg: 'var(--neg)', bd: 'var(--neg)' },
    info: { bg: 'transparent', fg: 'var(--info)', bd: 'var(--info)' },
  };
  const s = map[tone] || map.neutral;
  return (
    <span
      className="mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] border"
      style={{ background: s.bg, color: s.fg, borderColor: s.bd }}
    >
      {children}
    </span>
  );
}
