import type { ReactNode } from 'react';
import type { Tone } from '../../types';

interface TagProps {
  children: ReactNode;
  tone?: Tone;
}

export function Tag({ children, tone = 'neutral' }: TagProps) {
  const map: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: 'var(--bg-sunk)', fg: 'var(--fg-muted)' },
    accent: { bg: 'var(--accent-soft)', fg: 'var(--accent)' },
    pos: { bg: 'var(--pos-soft)', fg: 'var(--pos)' },
    neg: { bg: 'var(--neg-soft)', fg: 'var(--neg)' },
    info: { bg: 'var(--info-soft)', fg: 'var(--info)' },
  };
  const s = map[tone] || map.neutral;
  return (
    <span
      className="mono text-[9px] uppercase tracking-wider px-1.5 py-[2px] rounded-[4px] whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}
    >
      {children}
    </span>
  );
}
