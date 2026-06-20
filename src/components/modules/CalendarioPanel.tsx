import type { CSSProperties } from 'react';
import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import type { Evento } from '../../types';

interface CalendarioPanelProps {
  eventos: Evento[];
}

const fechaCorta = (d: Date) =>
  d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short' }).replace('.', '');

export function CalendarioPanel({ eventos }: CalendarioPanelProps) {
  const days = 30;
  const today = 0;
  const inicio = new Date();
  const fin = new Date(Date.now() + 30 * 86400000);
  return (
    <Panel className="flex flex-col">
      <SectionTitle
        id="E ·"
        title="Calendario · próximos 30 días"
        right={<span className="hidden sm:inline">{fechaCorta(inicio)} → {fechaCorta(fin)}</span>}
      />
      <div className="overflow-x-auto scrollbar-thin">
        <div className="px-4 pt-4 pb-3" style={{ minWidth: 720 }}>
          <div className="relative h-[88px]">
            {/* axis */}
            <div className="absolute left-0 right-0 top-[44px] h-px" style={{ background: 'var(--border)' }} />
            {/* ticks */}
            {Array.from({ length: 6 }, (_, i) => i * 5).map((d) => (
              <div
                key={d}
                className="absolute"
                style={{ left: `${(d / (days - 1)) * 100}%`, top: 44, transform: 'translateX(-50%)' }}
              >
                <div className="w-px h-1.5" style={{ background: 'var(--border-strong)' }} />
                <div
                  className="mono text-[9px] text-subtle mt-1 text-center"
                  style={{ transform: 'translateX(-50%)', position: 'absolute', left: 0 }}
                >
                  +{d}d
                </div>
              </div>
            ))}
            {/* today marker */}
            <div
              className="absolute"
              style={{ left: `${(today / (days - 1)) * 100}%`, top: 14, bottom: 14 }}
            >
              <div className="w-px h-full" style={{ background: 'var(--accent)' }} />
              <div
                className="absolute -top-1 -translate-x-1/2 mono text-[9px] uppercase tracking-wider text-accent"
                style={{ left: 0 }}
              >
                HOY
              </div>
            </div>
            {/* events */}
            {eventos.map((e, i) => {
              const x = (e.d / (days - 1)) * 100;
              const above = i % 2 === 0;
              const color =
                e.tone === 'accent'
                  ? 'var(--accent)'
                  : e.tone === 'info'
                    ? 'var(--info)'
                    : e.tone === 'neg'
                      ? 'var(--neg)'
                      : 'var(--fg-muted)';
              // anclar la etiqueta según el borde para que el texto no se corte
              const align = x < 18 ? 'left' : x > 82 ? 'right' : 'center';
              const vertical: CSSProperties = above ? { bottom: 12 } : { top: 12 };
              const labelStyle: CSSProperties =
                align === 'left'
                  ? { left: 0, ...vertical }
                  : align === 'right'
                    ? { right: 0, ...vertical }
                    : { left: '50%', transform: 'translateX(-50%)', ...vertical };
              const textAlign =
                align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
              return (
                <div
                  key={i}
                  className="absolute group"
                  style={{ left: `${x}%`, top: 44, transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: color, outline: '2px solid var(--bg-elev)' }}
                  />
                  <div className={`absolute whitespace-nowrap ${textAlign}`} style={labelStyle}>
                    <div className="mono text-[9px] uppercase tracking-wider" style={{ color }}>
                      {e.tag} · +{e.d}d
                    </div>
                    <div className="text-[11px] leading-tight">{e.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Panel>
  );
}
