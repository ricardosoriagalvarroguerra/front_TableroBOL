import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import type { Evento } from '../../types';

interface CalendarioPanelProps {
  eventos: Evento[];
  /** Fecha ancla (d = 0) de los eventos: el corte del snapshot. */
  base: Date;
}

const DIAS = 30;
const corta = (d: Date) => d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '');
const dow = (d: Date) => d.toLocaleDateString('es-BO', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');

/** Agenda de 30 días: franja de densidad + lista agrupada por semana (sin solapes). */
export function CalendarioPanel({ eventos, base }: CalendarioPanelProps) {
  const fecha = (d: number) => new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + d));
  const orden = [...eventos].sort((a, b) => a.d - b.d);
  const semanas = [0, 1, 2, 3, 4].map((w) => orden.filter((e) => Math.floor(e.d / 7) === w)).filter((s) => s.length);

  return (
    <Panel className="flex flex-col">
      <SectionTitle
        id="E"
        title="Agenda · próximos 30 días"
        sub="Publicaciones oficiales, decisiones de política y hitos que pueden mover los datos"
        right={<span className="hidden sm:inline">{corta(fecha(0))} – {corta(fecha(DIAS))}</span>}
      />
      <div className="grid sm:grid-cols-2 xl:grid-cols-4">
        {semanas.map((s, w) => (
          <div key={w} className="px-5 py-4 flex flex-col gap-3">
            <div className="eyebrow">
              Semana {corta(fecha(Math.floor(s[0].d / 7) * 7))}
            </div>
            {s.map((e, i) => {
              const f = fecha(e.d);
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-8 shrink-0 mono text-[13px] leading-snug" title={dow(f)}>
                    {f.getUTCDate()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12.5px] leading-snug">{e.title}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: e.tone === 'accent' ? 'var(--accent)' : 'var(--fg-subtle)' }}>{e.tag}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Panel>
  );
}
