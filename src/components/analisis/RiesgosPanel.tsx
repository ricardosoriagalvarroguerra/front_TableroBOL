import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import type { RiesgoItem } from '../../types';

interface RiesgosPanelProps {
  items: RiesgoItem[];
}

const IMP = { alto: 3, medio: 2, bajo: 1 } as const;

/** Riesgos y oportunidades en dos columnas; el detalle va en el tooltip. */
export function RiesgosPanel({ items }: RiesgosPanelProps) {
  const col = (tipo: RiesgoItem['tipo']) =>
    items.filter((i) => i.tipo === tipo).sort((a, b) => IMP[b.impacto] - IMP[a.impacto]);
  return (
    <Panel className="h-full">
      <SectionTitle title="Riesgos y oportunidades" right={<span>por impacto</span>} />
      <div className="grid sm:grid-cols-2">
        {(['riesgo', 'oportunidad'] as const).map((t) => (
          <div key={t} className="px-5 py-4">
            <div className="eyebrow mb-3">{t === 'riesgo' ? 'Riesgos' : 'Oportunidades'}</div>
            <ul className="flex flex-col gap-3">
              {col(t).map((r) => (
                <li key={r.titulo} className="flex items-start gap-3 cursor-help" title={`${r.detalle} (${r.horizonte})`}>
                  <span className="flex gap-[3px] mt-[7px] shrink-0">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: i <= IMP[r.impacto] ? (t === 'riesgo' ? 'var(--neg)' : 'var(--pos)') : 'var(--border-strong)' }}
                      />
                    ))}
                  </span>
                  <span className="text-[13px] leading-snug">{r.titulo}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
