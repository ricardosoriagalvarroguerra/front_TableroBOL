import { useMemo, Fragment } from 'react';
import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import { Tag } from '../primitives/Tag';
import type { Bloqueo, Severidad, Tone } from '../../types';

interface BloqueosResumenProps {
  bloqueos: Bloqueo[];
  resumen: { activos: number; departamentos: number };
  onSelect: (id: string) => void;
  onVerMapa: () => void;
}

const severidadTone: Record<Severidad, Tone> = { alta: 'neg', media: 'accent', baja: 'neutral' };

export function BloqueosResumen({ bloqueos, resumen, onSelect, onVerMapa }: BloqueosResumenProps) {
  const porDept = useMemo(() => {
    const m: Record<string, number> = {};
    bloqueos.forEach((b) => {
      m[b.dept] = (m[b.dept] || 0) + 1;
    });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [bloqueos]);

  const maxDept = Math.max(1, ...porDept.map(([, n]) => n));
  const top = useMemo(() => [...bloqueos].sort((a, b) => b.dia - a.dia).slice(0, 5), [bloqueos]);

  return (
    <Panel className="flex flex-col h-full">
      <SectionTitle
        id="B ·"
        title="Bloqueos · resumen"
        right={
          <Fragment>
            <span className="text-neg pulse-dot">●</span>
            <span>
              {resumen.activos} activos · {resumen.departamentos} dptos.
            </span>
          </Fragment>
        }
      />
      <div className="p-3 flex flex-col gap-3 flex-1 min-h-0">
        {/* barras por departamento */}
        <div className="space-y-1.5">
          {porDept.map(([dept, n]) => (
            <div key={dept} className="flex items-center gap-2">
              <span className="mono text-[10px] uppercase tracking-wider text-muted w-24 shrink-0 truncate">
                {dept}
              </span>
              <div className="flex-1 surface-sunk rounded-[3px] h-3 overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: `${(n / maxDept) * 100}%`, background: 'var(--neg)', opacity: 0.55 }}
                />
              </div>
              <span className="mono text-[11px] w-5 text-right">{n}</span>
            </div>
          ))}
        </div>

        {/* top por antigüedad */}
        <div className="border-t border-token pt-2 flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">
            Más prolongados
          </div>
          <div className="space-y-1">
            {top.map((b) => (
              <button
                key={b.id}
                onClick={() => onSelect(b.id)}
                className="w-full text-left flex items-center gap-2 px-1.5 py-1 rounded-[3px] row-hover"
              >
                <Tag tone={severidadTone[b.severidad]}>D{b.dia}</Tag>
                <span className="text-[11px] truncate flex-1">{b.km}</span>
                <span className="mono text-[9px] text-subtle uppercase tracking-wider shrink-0">
                  {b.dept}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onVerMapa}
          className="mono text-[10px] uppercase tracking-wider h-8 surface-sunk rounded-[4px] hover:ring-accent text-muted shrink-0"
        >
          Ver mapa completo →
        </button>
      </div>
    </Panel>
  );
}
