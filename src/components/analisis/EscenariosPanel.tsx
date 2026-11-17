import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import type { Escenario } from '../../types';

interface EscenariosPanelProps {
  items: Escenario[];
}

const COLOR = { base: 'var(--fg)', optimista: 'var(--pos)', riesgo: 'var(--neg)' } as const;
const f = (v: number | null) => (v == null ? 's/d' : `${v.toFixed(1).replace('.', ',')}%`);

/** Escenarios 2027: probabilidad, PIB/IPC y una línea; gatillos en tooltip. */
export function EscenariosPanel({ items }: EscenariosPanelProps) {
  return (
    <Panel>
      <SectionTitle title="Escenarios 2027" right={<span>probabilidad subjetiva</span>} />
      <div className="grid md:grid-cols-3">
        {items.map((e) => (
          <div key={e.id} className="px-5 py-5 cursor-help" title={`Gatillos: ${e.gatillos.join(' · ')}`}>
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-medium">{e.nombre}</span>
              <span className="mono text-[20px]" style={{ color: COLOR[e.id] }}>{e.probabilidad}%</span>
            </div>
            <div className="mt-2 h-1 rounded-full" style={{ background: 'var(--bg-sunk)' }}>
              <div className="h-1 rounded-full" style={{ width: `${e.probabilidad}%`, background: COLOR[e.id] }} />
            </div>
            <div className="mt-3 flex gap-5 text-[12px]">
              <span><span className="text-subtle">PIB </span><span className="mono">{f(e.pib2027)}</span></span>
              <span><span className="text-subtle">IPC </span><span className="mono">{f(e.ipc2027)}</span></span>
            </div>
            <p className="mt-2 text-[12.5px] text-muted leading-snug">{e.narrativa}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
