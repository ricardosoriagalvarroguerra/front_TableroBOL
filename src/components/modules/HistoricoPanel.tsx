import { SeriesChart } from '../primitives/SeriesChart';
import { polarityOf } from '../../tone';
import type { Kpi } from '../../types';

interface HistoricoPanelProps {
  kpis: Kpi[];
  onOpen: (k: Kpi) => void;
}

const c1 = (v: number) => v.toFixed(1).replace('.', ',');

/** Serie anual 2015 → hoy de cada indicador, con promedio y extremos. */
function HistoricoCard({ k, onOpen }: { k: Kpi; onOpen: (k: Kpi) => void }) {
  const h = k.historico ?? [];
  // estadísticas sobre los años cerrados (excluye el dato vigente marcado con *)
  const cerrados = h.filter((p) => !p.periodo.includes('*'));
  const vals = cerrados.map((p) => p.valor);
  const prom = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
  const iMax = vals.indexOf(Math.max(...vals));
  const iMin = vals.indexOf(Math.min(...vals));
  const ult = h[h.length - 1];
  const pol = polarityOf(k.id);
  const vsProm = ult ? ult.valor - prom : 0;
  const favorable = pol === 'none' ? null : pol === 'up' ? vsProm >= 0 : vsProm <= 0;
  const neg = h.some((p) => p.valor < 0);
  const fmt = (v: number) => k.fmt(v);

  return (
    <button onClick={() => onOpen(k)} className="card card-hover text-left p-5 flex flex-col gap-3" title={k.historicoNota}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px]">{k.label}</span>
        <span className="text-[11px] text-subtle">
          {h[0]?.periodo}–{ult?.periodo.replace('*', '')}
        </span>
      </div>
      <SeriesChart
        data={h.map((p) => p.valor)}
        labels={h.map((p) => p.periodo.replace(/^20/, "'"))}
        kind={neg && k.id !== 'usdbob_oficial' ? 'bars' : 'line'}
        color="var(--fg-muted)"
        refs={[{ value: prom, label: `prom. ${fmt(prom)}`, color: 'var(--fg-subtle)' }]}
        fmt={(v) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString('es-BO') : c1(v))}
        height={150}
        neutralBars
      />
      <div className="grid grid-cols-3 gap-2 text-[11.5px]">
        <div>
          <div className="text-subtle">Mínimo</div>
          <div className="mono">
            {fmt(vals[iMin])} <span className="text-subtle">{cerrados[iMin]?.periodo}</span>
          </div>
        </div>
        <div>
          <div className="text-subtle">Máximo</div>
          <div className="mono">
            {fmt(vals[iMax])} <span className="text-subtle">{cerrados[iMax]?.periodo}</span>
          </div>
        </div>
        <div>
          <div className="text-subtle">Último vs prom.</div>
          <div className={`mono ${favorable == null ? '' : favorable ? 'text-pos' : 'text-neg'}`}>
            {vsProm > 0 ? '+' : ''}
            {Math.abs(vsProm) >= 100 ? Math.round(vsProm).toLocaleString('es-BO') : c1(vsProm)}
          </div>
        </div>
      </div>
    </button>
  );
}

export function HistoricoPanel({ kpis, onOpen }: HistoricoPanelProps) {
  const conHist = kpis.filter((k) => (k.historico?.length ?? 0) >= 5);
  if (!conHist.length) {
    return <div className="card p-8 text-center text-[13px] text-muted">Sin series históricas cargadas.</div>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {conHist.map((k) => (
        <HistoricoCard key={k.id} k={k} onOpen={onOpen} />
      ))}
    </div>
  );
}
