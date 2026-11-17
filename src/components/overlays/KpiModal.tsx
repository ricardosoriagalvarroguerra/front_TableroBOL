import { useEffect, useMemo, useState } from 'react';
import { Delta } from '../primitives/Delta';
import { SeriesChart } from '../primitives/SeriesChart';
import { Insight } from '../primitives/Insight';
import { polarityOf, deltaTone, trendTone } from '../../tone';
import { IndicatorChart } from '../charts/IndicatorChart';
import type { Kpi, Periodicidad, SeriePunto } from '../../types';

interface KpiModalProps {
  kpi: Kpi | null;
  onClose: () => void;
  /** Lectura analítica del tablero para este indicador. */
  lectura?: string;
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

interface RangeOpt { k: string; months?: number }
function rangesFor(per?: Periodicidad): RangeOpt[] {
  if (per === 'diaria') return [{ k: '3M', months: 3 }, { k: '6M', months: 6 }, { k: '1A', months: 12 }, { k: 'Máx' }];
  if (per === 'mensual') return [{ k: '1A', months: 12 }, { k: '3A', months: 36 }, { k: 'Máx' }];
  return [{ k: 'Máx' }];
}
const defaultRange = (per?: Periodicidad) => (per === 'diaria' ? '6M' : 'Máx');

type Vista = 'historico' | 'reciente';

export function KpiModal({ kpi, onClose, lectura }: KpiModalProps) {
  const per = kpi?.periodicidad;
  const ranges = useMemo(() => rangesFor(per), [per]);
  const [range, setRange] = useState<string>(() => defaultRange(per));
  const tieneHist = (kpi?.historico?.length ?? 0) >= 5;
  const [vista, setVista] = useState<Vista>('reciente');

  useEffect(() => {
    setRange(defaultRange(per));
    setVista((kpi?.historico?.length ?? 0) >= 5 ? 'historico' : 'reciente');
  }, [kpi, per]);

  useEffect(() => {
    if (!kpi) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [kpi]);

  // Serie fechada real (BDR · indicador_observaciones). Sin historia fechada, el
  // spark recibe fechas mensuales sintéticas sólo para dibujar el eje.
  const full: SeriePunto[] = useMemo(() => {
    if (!kpi) return [];
    if (kpi.history && kpi.history.length) return kpi.history;
    const n = kpi.spark.length;
    return kpi.spark.map((v, i) => {
      const idx = 2026 * 12 + 10 - (n - 1 - i);
      return { f: `${Math.floor(idx / 12)}-${String((idx % 12) + 1).padStart(2, '0')}-01`, v };
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

  const hist = vista === 'historico' && tieneHist;
  const vals = hist ? kpi.historico!.map((h) => h.valor) : data.map((p) => p.v);
  const labels = hist ? kpi.historico!.map((h) => h.periodo) : undefined;
  const pol = polarityOf(kpi.id);
  const tone = trendTone(pol, vals);
  const color = tone === 'pos' ? 'var(--pos)' : tone === 'neg' ? 'var(--neg)' : 'var(--fg-muted)';
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 0;
  const avg = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
  const cambio = vals.length > 1 ? vals[vals.length - 1] - vals[0] : 0;
  const unit = kpi.unit ? ` ${kpi.unit}` : '';
  const neg = vals.some((v) => v < 0);
  const desde = hist ? labels![0] : data.length ? axisLabel(data[0].f, per) : '';
  const hasta = hist ? labels![labels!.length - 1] : data.length ? axisLabel(data[data.length - 1].f, per) : '';
  const stats = [
    { l: 'Mínimo', v: kpi.fmt(min) + unit },
    { l: 'Máximo', v: kpi.fmt(max) + unit },
    { l: 'Promedio', v: kpi.fmt(avg) + unit },
    { l: `Cambio ${desde} → ${hasta}`, v: `${cambio > 0 ? '+' : ''}${kpi.fmt(cambio)}`, c: deltaTone(pol, cambio) },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(3,4,7,0.6)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${kpi.label}: serie histórica`}
    >
      <div className="card w-full max-w-[880px] flex flex-col fade-up overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh' }}>
        <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-token">
          <div className="min-w-0">
            <div className="eyebrow">{kpi.label}</div>
            <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
              <span className="mono text-[34px] leading-none font-medium" style={{ letterSpacing: '-0.03em' }}>
                {kpi.fmt(kpi.value)}
              </span>
              {kpi.unit && <span className="mono text-[12px] text-muted">{kpi.unit}</span>}
              <Delta value={kpi.delta} label={kpi.deltaLabel} sentiment={deltaTone(pol, kpi.delta)} />
              <span className="mono text-[10px] text-subtle">· {kpi.asof}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-[11.5px] text-muted hover:text-accent shrink-0 surface-sunk rounded-[7px] px-2.5 h-8">
            Cerrar <span className="kbd ml-1">esc</span>
          </button>
        </div>

        <div className="overflow-y-auto scrollbar-thin">
          <div className="px-5 pt-4 flex items-center gap-1 flex-wrap">
            {tieneHist &&
              (['historico', 'reciente'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={`text-[12px] px-2.5 h-7 rounded-[6px] ${vista === v ? '' : 'text-muted'}`}
                  style={vista === v ? { background: 'var(--bg-sunk)' } : undefined}
                >
                  {v === 'historico' ? `${kpi.historico![0].periodo}–hoy` : 'Serie reciente'}
                </button>
              ))}
            {!hist && ranges.length > 1 && (
              <div className={`flex items-center gap-1 ${tieneHist ? 'ml-3 pl-3 border-l border-token' : ''}`}>
                {ranges.map((r) => (
                  <button
                    key={r.k}
                    onClick={() => setRange(r.k)}
                    className={`mono text-[11px] px-2 h-7 rounded-[6px] ${range === r.k ? '' : 'text-subtle hover:text-muted'}`}
                    style={range === r.k ? { background: 'var(--bg-sunk)' } : undefined}
                  >
                    {r.k}
                  </button>
                ))}
              </div>
            )}
            {hist && kpi.historicoNota && <span className="ml-auto text-[11px] text-subtle">{kpi.historicoNota}</span>}
          </div>

          <div className="px-5 pt-4">
            {hist ? (
              <SeriesChart
                data={vals}
                labels={labels}
                color={color}
                kind={neg ? 'bars' : 'line'}
                fmt={(v) => kpi.fmt(v)}
                height={230}
                showValues={vals.length <= 12}
              />
            ) : (
              <IndicatorChart data={data} color={color} fmt={kpi.fmt} unit={kpi.unit} periodicidad={per} />
            )}
          </div>

          <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.l} className="rounded-[10px] px-3 py-2 border border-token">
                <div className="text-[11px] text-subtle truncate" title={s.l}>{s.l}</div>
                <div className={`mono text-[14px] mt-0.5 ${s.c === 'pos' ? 'text-pos' : s.c === 'neg' ? 'text-neg' : ''}`}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-3 text-[12.5px] leading-relaxed text-muted">{kpi.def}</div>
          {lectura && (
            <div className="px-5 pb-4">
              <Insight>{lectura}</Insight>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-token grid grid-cols-3 gap-6 text-[11.5px]">
          <div>
            <div className="eyebrow">Fuente</div>
            <div className="mt-0.5">{kpi.source}</div>
          </div>
          <div>
            <div className="eyebrow">Último dato</div>
            <div className="mt-0.5 mono">{kpi.asof}</div>
          </div>
          <div>
            <div className="eyebrow">Polaridad</div>
            <div className="mt-0.5 text-muted">
              {pol === 'up' ? 'subir es favorable' : pol === 'down' ? 'bajar es favorable' : 'neutral (instrumento/precio)'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
