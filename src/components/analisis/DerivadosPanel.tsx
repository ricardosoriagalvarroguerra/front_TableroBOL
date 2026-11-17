import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import { estadoColor, type Derivado } from '../../analytics';

interface DerivadosPanelProps {
  items: Derivado[];
}

const SIN_SIGNO = new Set(['cob_liquida', 'servicio_rin']);
const fmt = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1).replace('.', ',')}`;

/** Indicadores derivados: cifra + fórmula; la interpretación va en el tooltip. */
export function DerivadosPanel({ items }: DerivadosPanelProps) {
  return (
    <Panel>
      <SectionTitle title="Indicadores derivados" right={<span>calculados en vivo</span>} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {items.map((d) => (
          <div key={d.id} className="px-5 py-4 cursor-help" title={d.lectura}>
            <div className="eyebrow truncate">{d.label}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="mono text-[24px] leading-none" style={{ color: estadoColor(d.estado) }}>
                {d.value == null ? 's/d' : SIN_SIGNO.has(d.id) ? d.value.toFixed(1).replace('.', ',') : fmt(d.value)}
              </span>
              <span className="text-[11px] text-subtle">{d.unit}</span>
            </div>
            <div className="mt-2 text-[11px] text-subtle leading-snug">{d.formula}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
