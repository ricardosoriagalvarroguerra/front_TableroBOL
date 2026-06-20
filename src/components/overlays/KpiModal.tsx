import { useEffect, useMemo, useState } from 'react';
import { Delta } from '../primitives/Delta';
import { polarityOf, deltaTone, trendTone } from '../../tone';
import { IndicatorChart } from '../charts/IndicatorChart';
import type { Kpi, Periodicidad, SeriePunto } from '../../types';

interface KpiModalProps {
  kpi: Kpi | null;
  onClose: () => void;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function parse(f: string) {
  const [y, m, d] = f.split('-').map(Number);
  return { y, m: (m || 1) - 1, d: d || 1 };
}
function axisLabel(f: string, per?: Periodicidad) {
  if (!f) return '';
  const { y, m } = parse(f);
  if (per === 'anual') return String(y);
  return `${MESES[m]} ${String(y).slice(2)}`;
}
const CADENCIA: Record<string, string> = {
  diaria: 'diario', semanal: 'semanal', mensual: 'mensual',
  trimestral: 'trimestral', semestral: 'semestral', anual: 'anual',
};

interface RangeOpt { k: string; months?: number }
function rangesFor(per?: Periodicidad): RangeOpt[] {
  if (per === 'diaria') return [{ k: '3M', months: 3 }, { k: '6M', months: 6 }, { k: '1A', months: 12 }, { k: 'Máx' }];
  if (per === 'mensual') return [{ k: '1A', months: 12 }, { k: '3A', months: 36 }, { k: 'Máx' }];
  return [{ k: 'Máx' }];
}
const defaultRange = (per?: Periodicidad) => (per === 'diaria' ? '1A' : 'Máx');

export function KpiModal({ kpi, onClose }: KpiModalProps) {
  const per = kpi?.periodicidad;
  const ranges = useMemo(() => rangesFor(per), [per]);
  const [range, setRange] = useState<string>(() => defaultRange(per));

  useEffect(() => {
    setRange(defaultRange(per));
  }, [kpi, per]);

  // serie histórica REAL fechada (BDR · indicador_observaciones). Si por algún motivo
  // sólo hay spark sin fecha, se le asignan fechas mensuales sintéticas para el eje.
  const full: SeriePunto[] = useMemo(() => {
    if (!kpi) return [];
    if (kpi.history && kpi.history.length) return kpi.history;
    const n = kpi.spark.length;
    return kpi.spark.map((v, i) => {
      const idx = 2026 * 12 + 5 - (n - 1 - i);
      const y = Math.floor(idx / 12);
      const m = idx % 12;
      return { f: `${y}-${String(m + 1).padStart(2, '0')}-01`, v };
    });
  }, [kpi]);

  const data: SeriePunto[] = useMemo(() => {
    const opt = ranges.find((r) => r.k === range);
    if (!opt || !opt.months || !full.length) return full;
    const last = parse(full[full.length - 1].f);
    const cutISO = new Date(Date.UTC(last.y, last.m - opt.months, last.d)).toISOString().slice(0, 10);
    const sub = full.filter((p) => p.f >= cutISO);
    return sub.length >= 2 ? sub : full;
  }, [full, ranges, range]);

  if (!kpi) return null;

  const vals = data.map((p) => p.v);
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 0;
  const tone = trendTone(polarityOf(kpi.id), vals);
  const color = tone === 'pos' ? 'var(--pos)' : tone === 'neg' ? 'var(--neg)' : 'var(--fg-muted)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="surface rounded-[6px] w-full max-w-[860px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '86vh' }}
      >
        <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-token">
          <div>
            <div className="mono text-[9px] uppercase tracking-[0.18em] text-subtle">
              {kpi.label} · serie histórica{per ? ` · ${CADENCIA[per] ?? per}` : ''}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="mono text-[32px] leading-none" style={{ letterSpacing: '-0.02em' }}>
                {kpi.fmt(kpi.value)}
              </span>
              {kpi.unit && <span className="mono text-[12px] text-muted">{kpi.unit}</span>}
              <Delta value={kpi.delta} label={kpi.deltaLabel} sentiment={deltaTone(polarityOf(kpi.id), kpi.delta)} />
            </div>
            <div className="mt-1 text-[11px] text-muted max-w-[640px] leading-snug">{kpi.def}</div>
          </div>
          <button
            onClick={onClose}
            className="mono text-[10px] uppercase tracking-wider text-muted hover:text-accent shrink-0"
          >
            cerrar [esc]
          </button>
        </div>

        {/* selector de rango */}
        {ranges.length > 1 && (
          <div className="flex items-center gap-1 px-5 pt-3">
            {ranges.map((r) => (
              <button
                key={r.k}
                onClick={() => setRange(r.k)}
                className={`mono text-[10px] px-2 py-0.5 rounded-[4px] border ${
                  range === r.k ? 'border-accent text-accent' : 'border-token text-subtle hover:text-muted'
                }`}
              >
                {r.k}
              </button>
            ))}
          </div>
        )}

        <div className="p-5 pt-3">
          <IndicatorChart data={data} color={color} fmt={kpi.fmt} unit={kpi.unit} periodicidad={per} />
          <div className="mt-2 flex items-center justify-between mono text-[10px] text-subtle uppercase tracking-wider">
            <span>mín {kpi.fmt(min)}</span>
            <span>
              {data.length} obs · {data.length ? `${axisLabel(data[0].f, per)} → ${axisLabel(data[data.length - 1].f, per)}` : 'serie'}
            </span>
            <span>máx {kpi.fmt(max)}</span>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-token grid grid-cols-3 gap-6 text-[11px]">
          <div>
            <div className="mono text-[9px] uppercase tracking-wider text-subtle">Fuente</div>
            <div className="mt-0.5">{kpi.source}</div>
          </div>
          <div>
            <div className="mono text-[9px] uppercase tracking-wider text-subtle">Última actualización</div>
            <div className="mt-0.5 mono">{kpi.asof}</div>
          </div>
          <div>
            <div className="mono text-[9px] uppercase tracking-wider text-subtle">Conexión</div>
            <div className="mt-0.5 text-muted">BDR · v_indicadores_actuales</div>
          </div>
        </div>
      </div>
    </div>
  );
}
