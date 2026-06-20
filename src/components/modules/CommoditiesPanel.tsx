import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import { Delta } from '../primitives/Delta';
import { deltaTone } from '../../tone';
import { metricKpi } from '../../metricKpi';
import type { Commodity, Kpi } from '../../types';

interface CommoditiesPanelProps {
  data: Commodity[];
  onOpen?: (k: Kpi) => void;
}

const fmtPrecio = (v: number) =>
  v >= 1000 ? v.toLocaleString('es-BO', { maximumFractionDigits: 0 }) : v.toFixed(2);

export function CommoditiesPanel({ data, onOpen }: CommoditiesPanelProps) {
  return (
    <Panel className="flex flex-col h-full">
      <SectionTitle id="X ·" title="Commodities · exportación" right={<span>Trading Economics</span>} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="grid grid-cols-12 px-3 pt-2 pb-1.5 mono text-[9px] uppercase tracking-wider text-subtle">
          <div className="col-span-5">Commodity</div>
          <div className="col-span-4 text-right">Precio</div>
          <div className="col-span-3 text-right">Δ mes</div>
        </div>
        {data.map((c) => (
          <button
            key={c.id}
            onClick={() =>
              onOpen?.(
                metricKpi({
                  id: c.id, label: c.label, value: c.value, unit: c.unit, fmt: fmtPrecio,
                  delta: c.chgMensual ?? 0,
                  deltaLabel: c.chgMensual != null ? `${c.chgMensual > 0 ? '+' : ''}${c.chgMensual.toFixed(1)}%` : 's/d',
                  sentiment: c.polarity === 'none' || c.chgMensual == null ? 'neutral' : deltaTone(c.polarity, c.chgMensual),
                  source: c.source, asof: c.asof,
                  def: `${c.label} (${c.unit}). Var. mensual ${c.chgMensual ?? 's/d'}% · anual ${c.chgAnual ?? 's/d'}%.${c.nota ? ' ' + c.nota : ''}`,
                }),
              )
            }
            className="w-full grid grid-cols-12 items-center px-3 py-2 border-t border-token row-hover text-left"
          >
            <div className="col-span-5">
              <div className="text-[12px]">{c.label}</div>
              <div className="mono text-[9px] text-subtle">{c.unit}</div>
            </div>
            <div className="col-span-4 text-right mono text-[13px]">{fmtPrecio(c.value)}</div>
            <div className="col-span-3 text-right">
              {c.chgMensual != null ? (
                <Delta
                  value={c.polarity === 'up' ? c.chgMensual : -Math.abs(c.chgMensual)}
                  label={`${c.chgMensual > 0 ? '+' : ''}${c.chgMensual.toFixed(1)}%`}
                  sentiment={c.polarity === 'none' ? 'neutral' : deltaTone(c.polarity, c.chgMensual)}
                />
              ) : (
                <span className="mono text-[11px] text-subtle">s/d</span>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-token mono text-[9px] text-subtle leading-snug">
        Oro: ~95% de las RIN del BCB. Henry Hub es referencia (el gas boliviano se exporta con fórmulas
        indexadas a derivados de petróleo). Clic en cualquier fila para ver su serie histórica.
      </div>
    </Panel>
  );
}
