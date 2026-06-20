import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import { Delta } from '../primitives/Delta';
import { Sparkline } from '../primitives/Sparkline';
import { Donut } from '../primitives/Donut';
import { deltaTone, trendTone } from '../../tone';
import { metricKpi } from '../../metricKpi';
import type { Kpi, Mercados } from '../../types';

interface MercadosPanelProps {
  data: Mercados;
  onOpen?: (k: Kpi) => void;
}

const BONO_DEF: Record<string, string> = {
  BOL28: 'Bono soberano 4,50% · vto 2028 (emitido 2017). Precio en % del nominal; mercado secundario ilíquido.',
  BOL31: 'Bono soberano 9,45% · vto 2031, emitido 7-may-2026 (USD 1.000 M, yield de emisión 9,75%). Precio en % del nominal.',
  BOL30: 'Bono soberano 7,50% · vto 2030.',
};

export function MercadosPanel({ data, onOpen }: MercadosPanelProps) {
  return (
    <Panel className="flex flex-col h-full">
      <SectionTitle id="C ·" title="Mercados · soberanos" right={<span>USD · NY close</span>} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* bonds table */}
        <div className="px-3 py-2 border-b border-token">
          <div className="grid grid-cols-12 mono text-[9px] uppercase tracking-wider text-subtle pb-1.5">
            <div className="col-span-4">Bono</div>
            <div className="col-span-2 text-right">Precio</div>
            <div className="col-span-2 text-right">Yield</div>
            <div className="col-span-2 text-right">Spread</div>
            <div className="col-span-2 text-right">Δ</div>
          </div>
          {data.bonos.map((b) => (
            <button
              key={b.id}
              onClick={() =>
                onOpen?.(
                  metricKpi({
                    id: b.id, label: b.name, value: b.price, unit: '% nom.', fmt: (v) => v.toFixed(2),
                    delta: b.chg, deltaLabel: `${b.chg > 0 ? '+' : ''}${b.chg.toFixed(2)}`,
                    source: 'Investing.com · cbonds · Bloomberg Línea', asof: '12 jun',
                    def: `${BONO_DEF[b.id] ?? ''} Yield vigente ${b.yield.toFixed(1)}% · spread ${b.spread} pb.`,
                  }),
                )
              }
              className="w-full grid grid-cols-12 items-center py-1.5 text-[12px] text-left row-hover"
            >
              <div className="col-span-4">
                <div className="mono text-[10px] text-muted">{b.id}</div>
                <div className="text-[11px] text-muted/80 leading-tight">{b.name}</div>
              </div>
              <div className="col-span-2 mono text-right">{b.price.toFixed(2)}</div>
              <div className="col-span-2 mono text-right">{b.yield.toFixed(1)}%</div>
              <div className="col-span-2 mono text-right">
                {b.spread}
                <span className="text-subtle text-[9px]"> pb</span>
              </div>
              <div className="col-span-2 mono text-right">
                <span className={b.chg < 0 ? 'text-neg' : 'text-pos'}>
                  {b.chg > 0 ? '+' : ''}
                  {b.chg.toFixed(2)}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* EMBI — clickeable */}
        <button
          onClick={() =>
            onOpen?.(
              metricKpi({
                id: 'embi', label: 'EMBI Bolivia', value: data.embi.value, unit: 'pb',
                fmt: (v) => v.toLocaleString('es-BO'), delta: data.embi.chg,
                deltaLabel: `${data.embi.chg > 0 ? '+' : ''}${data.embi.chg} pb`, sentiment: 'neg',
                source: 'JPMorgan · Bloomberg Línea / Invenómica', asof: '19 jun',
                def: 'EMBI (riesgo país, JPMorgan): spread soberano en puntos básicos. Cierre de may-2026 en 576 pb (rango del mes 408–639).',
              }),
            )
          }
          className="w-full text-left px-3 py-3 border-b border-token row-hover"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="mono text-[9px] uppercase tracking-wider text-subtle">EMBI Bolivia</div>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="mono text-[22px]">{data.embi.value.toLocaleString('es-BO')}</span>
                <span className="mono text-[10px] text-subtle">pb</span>
                <Delta
                  value={data.embi.chg}
                  label={`${data.embi.chg > 0 ? '+' : ''}${data.embi.chg}`}
                  sentiment={deltaTone('down', data.embi.chg)}
                />
              </div>
            </div>
            <Sparkline data={data.embi.series} sentiment={trendTone('down', data.embi.series)} width={130} height={36} />
          </div>
        </button>

        {/* CDS */}
        <div className="px-3 py-2 border-b border-token flex items-center justify-between">
          <div>
            <div className="mono text-[9px] uppercase tracking-wider text-subtle">CDS 5Y</div>
            {data.cds5y.value != null ? (
              <div className="mono text-[16px] mt-0.5">
                {data.cds5y.value.toLocaleString('es-BO')}
                <span className="text-subtle text-[10px]"> pb</span>
              </div>
            ) : (
              <div className="mono text-[13px] mt-0.5 text-subtle">
                s/d <span className="text-[10px]">· {data.cds5y.note}</span>
              </div>
            )}
          </div>
          {data.cds5y.value != null && (
            <Delta value={data.cds5y.chg} label={`+${data.cds5y.chg} pb`} sentiment="neg" />
          )}
        </div>

        {/* ratings */}
        <div className="px-3 py-2 border-b border-token">
          <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">Rating soberano</div>
          <div className="space-y-1">
            {data.ratings.map((r) => (
              <div key={r.agencia} className="flex items-center justify-between text-[11px]">
                <span className="text-muted">{r.agencia}</span>
                <div className="flex items-center gap-2">
                  <span className="mono">{r.rating}</span>
                  <span
                    className={`mono text-[9px] uppercase tracking-wider ${
                      r.outlook === 'Negativo' ? 'text-neg' : 'text-muted'
                    }`}
                  >
                    {r.outlook}
                  </span>
                  <span className="mono text-[9px] text-subtle w-14 text-right">{r.actualizado}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* reservas composición */}
        <div className="px-3 py-2">
          <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">Composición RIN</div>
          <div className="flex items-center gap-3">
            <Donut
              size={68}
              data={[
                { v: data.reservas.oro, color: 'var(--accent)' },
                { v: data.reservas.divisas, color: 'var(--fg-muted)' },
                { v: data.reservas.deg, color: 'var(--border-strong)' },
              ]}
            />
            <div className="flex-1 space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-sm" style={{ background: 'var(--accent)' }} />
                  Oro
                </span>
                <span className="mono">{data.reservas.oro}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-sm" style={{ background: 'var(--fg-muted)' }} />
                  Divisas
                </span>
                <span className="mono">{data.reservas.divisas}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span
                    className="inline-block w-2 h-2 rounded-sm"
                    style={{ background: 'var(--border-strong)' }}
                  />
                  DEG
                </span>
                <span className="mono">{data.reservas.deg}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
