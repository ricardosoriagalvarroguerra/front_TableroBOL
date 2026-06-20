import { Tag } from '../primitives/Tag';
import { deptSlug } from '../../data/boliviaGeo';
import { ELEC_BY_ID, CAND_LABEL } from '../../data/elecciones';
import type { Bloqueo, Severidad, Tone } from '../../types';

interface BloqueoDrawerProps {
  bloqueo: Bloqueo | null;
  onClose: () => void;
}

const severidadTone: Record<Severidad, Tone> = {
  alta: 'neg',
  media: 'accent',
  baja: 'neutral',
};

export function BloqueoDrawer({ bloqueo, onClose }: BloqueoDrawerProps) {
  if (!bloqueo) return null;
  const e = ELEC_BY_ID[deptSlug(bloqueo.dept)];
  return (
    <div className="fixed inset-0 z-40" onClick={onClose} style={{ background: 'rgba(0,0,0,0.35)' }}>
      <aside
        className="absolute right-0 top-0 h-full w-[420px] max-w-full surface flex flex-col"
        onClick={(ev) => ev.stopPropagation()}
        style={{ borderLeft: '1px solid var(--border-strong)' }}
      >
        <div className="px-4 h-10 border-b border-token flex items-center justify-between">
          <div className="mono text-[10px] uppercase tracking-[0.18em] text-subtle">Bloqueo · ficha</div>
          <button
            onClick={onClose}
            className="mono text-[10px] text-muted hover:text-accent uppercase tracking-wider"
          >
            cerrar [esc]
          </button>
        </div>
        <div className="p-4 overflow-y-auto scrollbar-thin flex-1">
          <div className="flex items-center gap-2">
            <Tag tone={severidadTone[bloqueo.severidad]}>{bloqueo.severidad}</Tag>
            <Tag>D{bloqueo.dia}</Tag>
            <span className="mono text-[10px] text-subtle uppercase tracking-wider ml-auto">
              {bloqueo.dept}
            </span>
          </div>
          <h2 className="mt-3 text-[18px] leading-tight">{bloqueo.ruta}</h2>
          <div className="mono text-[11px] text-muted mt-0.5">{bloqueo.km}</div>

          <dl className="mt-5 space-y-3 text-[12px]">
            <div className="grid grid-cols-3 gap-2">
              <dt className="mono text-[9px] uppercase tracking-wider text-subtle col-span-1">Sector</dt>
              <dd className="col-span-2">{bloqueo.sector}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="mono text-[9px] uppercase tracking-wider text-subtle col-span-1">Motivo</dt>
              <dd className="col-span-2">{bloqueo.motivo}</dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="mono text-[9px] uppercase tracking-wider text-subtle col-span-1">Inicio</dt>
              <dd className="col-span-2 mono">
                hace {bloqueo.dia} día{bloqueo.dia > 1 ? 's' : ''}
              </dd>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <dt className="mono text-[9px] uppercase tracking-wider text-subtle col-span-1">Fuente</dt>
              <dd className="col-span-2">{bloqueo.fuente}</dd>
            </div>
          </dl>

          {/* contexto electoral del territorio (cruce) */}
          {e && (
            <div className="mt-5 surface-sunk rounded-[4px] p-3">
              <div className="mono text-[9px] uppercase tracking-wider text-subtle">
                Contexto electoral · {e.nombre}
              </div>
              <div className="mt-2 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Balotaje 2025 (19-oct)</span>
                  <span>
                    ganó <span className={e.ro_winner === 'paz' ? 'text-accent' : ''}>{CAND_LABEL[e.ro_winner]}</span>{' '}
                    <span className="mono">{(e.ro_winner === 'paz' ? e.ro_paz : e.ro_quiroga).toFixed(1)}%</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">1ª vuelta (17-ago)</span>
                  <span className="mono text-[10px]">
                    Paz {e.fr_paz} · Quir. {e.fr_quiroga} · Andr. {e.fr_andronico}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted">Alcaldía 2026</span>
                  <span>{e.muni_partido}</span>
                </div>
              </div>
              <div className="mono text-[9px] text-subtle mt-2 leading-snug">
                {e.ro_winner === 'paz'
                  ? 'Territorio que Paz ganó en el balotaje y que hoy lidera las protestas: su base andina (afín al MAS/Evo) lo rechaza.'
                  : 'Territorio que ganó la oposición a Paz (Quiroga); aquí los bloqueos son marginales.'}
              </div>
            </div>
          )}

          <div className="mt-4 surface-sunk rounded-[4px] p-3">
            <div className="mono text-[9px] uppercase tracking-wider text-subtle">Cronología</div>
            <ol className="mt-2 space-y-1.5 text-[11px]">
              <li className="flex gap-2">
                <span className="mono text-subtle w-10">D−{bloqueo.dia}</span>
                <span>Inicio de la medida. Pliego entregado a autoridades.</span>
              </li>
              <li className="flex gap-2">
                <span className="mono text-subtle w-10">D−{Math.max(0, bloqueo.dia - 1)}</span>
                <span>Diálogo fallido con representantes ministeriales.</span>
              </li>
              <li className="flex gap-2">
                <span className="mono text-subtle w-10">D−0</span>
                <span>Vigilia indefinida ratificada en asamblea.</span>
              </li>
            </ol>
          </div>

          <div className="mt-4 text-[10px] text-subtle leading-snug">
            Fuente de puntos: ABC · transitabilidad RVF (coordenadas aproximadas de la localidad/tramo).
            Cruce electoral: cómputo OEP 2025 + subnacionales 2026.
          </div>
        </div>
      </aside>
    </div>
  );
}
