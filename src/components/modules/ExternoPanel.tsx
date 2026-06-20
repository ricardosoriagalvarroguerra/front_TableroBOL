import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import type { ExternoData } from '../../types';

interface ExternoPanelProps {
  data: ExternoData;
}

const m = (v: number | null) => (v == null ? 's/d' : v.toLocaleString('es-BO', { maximumFractionDigits: 0 }));

export function ExternoPanel({ data }: ExternoPanelProps) {
  const { deuda, balanza, combustibles, servicio, analitica: a } = data;
  return (
    <Panel className="flex flex-col h-full">
      <SectionTitle id="EX ·" title="Externo & deuda" right={<span>USD · oficial</span>} />
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Deuda externa */}
        <div className="px-3 py-2.5 border-b border-token">
          <div className="mono text-[9px] uppercase tracking-wider text-subtle">Deuda externa pública</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="mono text-[22px]">{deuda.externaPct ?? 's/d'}</span>
            <span className="mono text-[10px] text-subtle">% del PIB</span>
            <span className="mono text-[11px] text-muted ml-auto">USD {m(deuda.externaStock)} M</span>
          </div>
          <div className="mono text-[9px] text-subtle mt-0.5">
            deuda pública total ~{deuda.totalPct ?? 's/d'}% PIB · {deuda.source} · {deuda.asof}
          </div>
        </div>

        {/* Balanza comercial */}
        <div className="px-3 py-2.5 border-b border-token">
          <div className="flex items-center justify-between">
            <div className="mono text-[9px] uppercase tracking-wider text-subtle">Balanza comercial</div>
            <div className="mono text-[9px] text-subtle">{balanza.periodo}</div>
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="mono text-[9px] uppercase tracking-wider text-subtle">Export.</div>
              <div className="mono text-[14px] text-pos">{m(balanza.exportaciones)}</div>
            </div>
            <div>
              <div className="mono text-[9px] uppercase tracking-wider text-subtle">Import.</div>
              <div className="mono text-[14px]">{m(balanza.importaciones)}</div>
            </div>
            <div>
              <div className="mono text-[9px] uppercase tracking-wider text-subtle">Saldo</div>
              <div className={`mono text-[14px] ${(balanza.saldo ?? 0) >= 0 ? 'text-pos' : 'text-neg'}`}>
                {(balanza.saldo ?? 0) >= 0 ? '+' : ''}
                {m(balanza.saldo)}
              </div>
            </div>
          </div>
          <div className="mono text-[9px] text-subtle mt-1">{balanza.source} · USD millones</div>
        </div>

        {/* Servicio de deuda */}
        <div className="px-3 py-2.5 border-b border-token">
          <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">
            Servicio de deuda externa
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {([['2026', servicio.y2026], ['2027', servicio.y2027], ['2028', servicio.y2028]] as const).map(
              ([y, v]) => (
                <div key={y} className="surface-sunk rounded-[4px] py-1.5">
                  <div className="mono text-[9px] text-subtle">{y}</div>
                  <div className="mono text-[13px]">{m(v)}</div>
                </div>
              ),
            )}
          </div>
          <div className="mono text-[9px] text-subtle mt-1">{servicio.source} · USD millones</div>
        </div>

        {/* Sector externo: flujos de divisas */}
        <div className="px-3 py-2.5 border-b border-token">
          <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">
            Sector externo · flujos de divisas
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="mono text-[9px] uppercase tracking-wider text-subtle">Export. gas</div>
              <div className="mono text-[14px] text-neg">{m(a.gasExportUsd)}</div>
              <div className="mono text-[8px] text-subtle">{a.gasExportVar != null ? `${a.gasExportVar}% a/a` : ''} · {a.gasExportPeriodo}</div>
            </div>
            <div>
              <div className="mono text-[9px] uppercase tracking-wider text-subtle">Cta. cte.</div>
              <div className={`mono text-[14px] ${(a.ccPct ?? 0) >= 0 ? 'text-pos' : 'text-neg'}`}>{a.ccPct ?? 's/d'}%</div>
              <div className="mono text-[8px] text-subtle">USD {m(a.ccUsd)} M · {a.ccPeriodo}</div>
            </div>
            <div>
              <div className="mono text-[9px] uppercase tracking-wider text-subtle">Remesas</div>
              <div className="mono text-[14px]">{m(a.remesasUsd)}</div>
              <div className="mono text-[8px] text-subtle">{a.remesasPeriodo}</div>
            </div>
          </div>
          <div className="mono text-[9px] text-subtle mt-1">{a.source} · USD millones</div>
        </div>

        {/* Monetario y liquidez */}
        <div className="px-3 py-2.5 border-b border-token">
          <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">Monetario y liquidez</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="surface-sunk rounded-[4px] py-1.5 px-2">
              <div className="mono text-[9px] text-subtle">Bolivianización</div>
              <div className="mono text-[15px] text-pos">{a.bolivianizacion ?? 's/d'}%</div>
              <div className="mono text-[8px] text-subtle">depósitos en Bs · {a.bolivPeriodo}</div>
            </div>
            <div className="surface-sunk rounded-[4px] py-1.5 px-2">
              <div className="mono text-[9px] text-subtle">Financ. monetario BCB→SPNF</div>
              <div className="mono text-[15px] text-neg">+{m(a.finMonetarioFlujo)}</div>
              <div className="mono text-[8px] text-subtle">Bs MM (prog. +{m(a.finMonetarioProg)}) · {a.finMonetarioPeriodo}</div>
            </div>
          </div>
        </div>

        {/* Programa FMI */}
        <div className="px-3 py-2.5 border-b border-token">
          <div className="flex items-center justify-between">
            <div className="mono text-[9px] uppercase tracking-wider text-subtle">Programa FMI</div>
            <span className="mono text-[9px] text-accent uppercase tracking-wider">{a.fmiEstado}</span>
          </div>
          <div className="mt-1 mono text-[18px]">~USD {m(a.fmiMonto)} M</div>
          <div className="mono text-[9px] text-subtle mt-0.5 leading-snug">{a.fmiNota}</div>
        </div>

        {/* Combustibles */}
        <div className="px-3 py-2.5">
          <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">
            Precio de combustibles · Bs/litro
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {([['Especial', combustibles.especial], ['Premium', combustibles.premium], ['Diésel', combustibles.diesel]] as const).map(
              ([l, v]) => (
                <div key={l}>
                  <div className="mono text-[9px] uppercase tracking-wider text-subtle">{l}</div>
                  <div className="mono text-[16px] text-accent">{v == null ? 's/d' : v.toFixed(2)}</div>
                </div>
              ),
            )}
          </div>
          <div className="mono text-[9px] text-subtle mt-1.5 leading-snug">{combustibles.nota}</div>
        </div>
      </div>
    </Panel>
  );
}
