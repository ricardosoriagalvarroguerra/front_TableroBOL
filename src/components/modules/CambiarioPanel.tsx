// Monitor dedicado del régimen cambiario (el "blanqueo" del dólar oficial).
// Compone las cotizaciones vivas (KPIs usdbob_* que llegan por props) con las
// series diarias (kpi.history) y los metadatos de régimen (CAMBIARIO, bundle).

import { useMemo, useState } from 'react';
import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import { Delta } from '../primitives/Delta';
import { Sparkline } from '../primitives/Sparkline';
import { ExchangeRateChart } from '../charts/ExchangeRateChart';
import { deltaTone } from '../../tone';
import { CAMBIARIO } from '../../data/mockData';
import type { Kpi, SeriePunto, Tone } from '../../types';

interface CambiarioPanelProps {
  indicadores: Kpi[];
  onOpen?: (k: Kpi) => void;
}

const RANGES: { k: string; d?: number }[] = [{ k: '1M', d: 32 }, { k: '3M', d: 95 }, { k: 'Máx' }];
const FLEX_INICIO = 9.73; // primer TCO del régimen flexible (29-jun-2026)

function recortar(serie: SeriePunto[], dias?: number): SeriePunto[] {
  if (!dias || serie.length < 2) return serie;
  const lastMs = Date.parse(serie[serie.length - 1].f);
  const cut = lastMs - dias * 86_400_000;
  const sub = serie.filter((p) => Date.parse(p.f) >= cut);
  return sub.length >= 2 ? sub : serie;
}

const toneCls: Record<Tone, string> = {
  neg: 'text-neg', pos: 'text-pos', accent: 'text-accent', info: 'text-accent', neutral: 'text-muted',
};
const toneBg: Record<Tone, string> = {
  neg: 'var(--neg)', pos: 'var(--pos)', accent: 'var(--accent)', info: 'var(--accent)', neutral: 'var(--fg-muted)',
};

function QuoteCard({ k, label, sub, onOpen }: { k?: Kpi; label: string; sub: string; onOpen?: (k: Kpi) => void }) {
  if (!k) return null;
  // para el dólar, subir = depreciación = desfavorable (rojo); brecha que baja = favorable (verde)
  const sent = deltaTone('down', k.delta);
  return (
    <button
      onClick={() => onOpen?.(k)}
      className="surface rounded-[5px] p-3 text-left flex flex-col hover:ring-accent transition-shadow"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[9px] uppercase tracking-[0.14em] text-subtle">{label}</span>
        <Delta value={k.delta} label={k.deltaLabel} sentiment={sent} />
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="mono text-[27px] leading-none" style={{ letterSpacing: '-0.02em' }}>{k.fmt(k.value)}</span>
        {k.unit && <span className="mono text-[10px] text-muted">{k.unit}</span>}
      </div>
      <div className="mono text-[9px] text-subtle mt-1.5">{sub}</div>
    </button>
  );
}

function Metric({ label, value, sub, tone = 'neg' }: { label: string; value: string; sub: string; tone?: Tone }) {
  return (
    <div className="surface-sunk rounded-[4px] px-3 py-2">
      <div className="mono text-[9px] uppercase tracking-wider text-subtle">{label}</div>
      <div className={`mono text-[19px] leading-tight mt-0.5 ${toneCls[tone]}`}>{value}</div>
      <div className="mono text-[8px] text-subtle mt-0.5">{sub}</div>
    </div>
  );
}

export function CambiarioPanel({ indicadores, onOpen }: CambiarioPanelProps) {
  const [range, setRange] = useState('3M');
  const byId = useMemo(() => Object.fromEntries(indicadores.map((k) => [k.id, k])) as Record<string, Kpi>, [indicadores]);
  const oficial = byId['usdbob_oficial'];
  const paralelo = byId['usdbob_paralelo'];
  const brecha = byId['brecha'];
  const vrd = byId['vrd'];

  const dias = RANGES.find((r) => r.k === range)?.d;
  const ofSerie = useMemo(() => recortar(oficial?.history ?? [], dias), [oficial, dias]);
  const paSerie = useMemo(() => recortar(paralelo?.history ?? [], dias), [paralelo, dias]);
  const brSerie = useMemo(() => recortar(brecha?.history ?? [], dias), [brecha, dias]);

  // métricas de depreciación derivadas de la serie/valor vigente
  const val = oficial?.value ?? 10.85;
  const deprFlex = (val / FLEX_INICIO - 1) * 100;
  const deprFijo = (val / CAMBIARIO.fijoValor - 1) * 100;
  // ritmo semanal medio desde el arranque del régimen (29-jun → última fecha de la serie)
  const semRitmo = useMemo(() => {
    const full = oficial?.history ?? [];
    const inicio = full.find((p) => p.f >= '2026-06-29');
    const fin = full[full.length - 1];
    if (!inicio || !fin) return null;
    const semanas = Math.max(1, (Date.parse(fin.f) - Date.parse(inicio.f)) / (7 * 86_400_000));
    return ((fin.v / inicio.v - 1) * 100) / semanas;
  }, [oficial]);

  const nf = (v: number, d = 1) => v.toLocaleString('es-BO', { minimumFractionDigits: d, maximumFractionDigits: d });
  const p = CAMBIARIO.presion;

  return (
    <div className="flex flex-col gap-2">
      {/* ── Tira de cotizaciones vivas ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <QuoteCard k={oficial} label="Oficial · TCO" sub={`${oficial?.asof ?? ''} · vs fijo +${nf(deprFijo)}%`} onOpen={onOpen} />
        <QuoteCard k={vrd} label="Referencial venta" sub="tope = TCO + Bs 0,10" onOpen={onOpen} />
        <QuoteCard k={paralelo} label="Paralelo · P2P" sub={`${paralelo?.asof ?? ''} · informal`} onOpen={onOpen} />
        <QuoteCard k={brecha} label="Brecha oficial/paralelo" sub="antes del blanqueo ~42%" onOpen={onOpen} />
      </div>

      {/* ── Cuerpo: hero (izq) + rail (der) ────────────────────────── */}
      <div className="grid grid-cols-12 gap-2">
        {/* Columna principal */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-2">
          <Panel className="p-3">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="mono text-[11px] uppercase tracking-[0.14em] text-muted">El fin del tipo de cambio fijo</div>
                <div className="mono text-[9px] text-subtle mt-0.5">Bs/USD · oficial (TCO) vs paralelo · diario</div>
              </div>
              <div className="flex items-center gap-1">
                {RANGES.map((r) => (
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
            </div>
            <ExchangeRateChart
              oficial={ofSerie}
              paralelo={paSerie}
              hito={{ f: '2026-06-26', label: '26-jun · fin del TC fijo' }}
              fmt={(v) => v.toFixed(2)}
            />
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Metric label="Desde el blanqueo" value={`+${nf(deprFlex)}%`} sub={`29-jun (${nf(FLEX_INICIO, 2)}) → hoy`} tone="neg" />
              <Metric label="Vs tipo fijo Bs 6,96" value={`+${nf(deprFijo)}%`} sub="anclado 15 años (2011)" tone="neg" />
              <Metric label="Ritmo medio" value={semRitmo != null ? `~+${nf(semRitmo)}%/sem` : 's/d'} sub="depreciación semanal" tone="neg" />
            </div>
          </Panel>

          {/* Cierre de la brecha */}
          <Panel className="p-3">
            <div className="flex items-center justify-between">
              <div className="mono text-[10px] uppercase tracking-[0.14em] text-muted">Cierre de la brecha · unificación</div>
              <div className="mono text-[9px] text-subtle">paralelo / oficial − 1</div>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="shrink-0">
                <div className="flex items-baseline gap-1">
                  <span className={`mono text-[26px] leading-none ${(brecha?.value ?? 0) <= 3 ? 'text-pos' : 'text-neg'}`}>
                    {brecha ? brecha.fmt(brecha.value) : 's/d'}
                  </span>
                  <span className="mono text-[11px] text-muted">%</span>
                </div>
                <div className="mono text-[9px] text-subtle mt-1">antes ~42% → hoy ≈0</div>
              </div>
              <div className="flex-1 min-w-0">
                <Sparkline data={brSerie.map((s) => s.v)} sentiment="pos" width={420} height={44} />
              </div>
            </div>
            <div className="mono text-[10px] text-muted leading-snug mt-2">
              El TCO flexible alcanzó al paralelo y borró el premio informal: la brecha colapsó de ~42% a ≈0. Es la
              <span className="text-fg"> unificación cambiaria de facto</span>, el objetivo declarado de la medida.
            </div>
          </Panel>
        </div>

        {/* Rail derecho */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
          {/* Régimen y reglas */}
          <Panel>
            <SectionTitle id="RG ·" title="Régimen" right={<span className="text-accent">flexible</span>} />
            <div className="px-3 py-2.5">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="surface-sunk rounded-[4px] px-2 py-1.5">
                  <div className="mono text-[8px] uppercase tracking-wider text-subtle">Antes</div>
                  <div className="mono text-[15px]">Bs {nf(CAMBIARIO.fijoValor, 2)}</div>
                  <div className="mono text-[8px] text-subtle">fijo · {CAMBIARIO.fijoDesde}</div>
                </div>
                <div className="surface-sunk rounded-[4px] px-2 py-1.5">
                  <div className="mono text-[8px] uppercase tracking-wider text-subtle">Desde</div>
                  <div className="mono text-[15px] text-accent">{CAMBIARIO.flexDesde}</div>
                  <div className="mono text-[8px] text-subtle">TCO diario · BCB</div>
                </div>
              </div>
              <ul className="flex flex-col gap-1">
                {CAMBIARIO.reglas.map((r, i) => (
                  <li key={i} className="mono text-[10px] text-muted leading-snug flex gap-1.5">
                    <span className="text-accent shrink-0">·</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          {/* Cronología */}
          <Panel>
            <SectionTitle id="CR ·" title="Cronología del cambio" />
            <div className="px-3 py-2">
              {CAMBIARIO.hitos.map((h, i) => (
                <div key={i} className="flex gap-2.5 py-1.5 border-b border-token last:border-0">
                  <div className="flex flex-col items-center pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toneBg[h.tono] }} />
                    {i < CAMBIARIO.hitos.length - 1 && <span className="w-px flex-1 mt-1" style={{ background: 'var(--border)' }} />}
                  </div>
                  <div className="min-w-0">
                    <div className={`mono text-[10px] ${toneCls[h.tono]}`}>{h.etiqueta}</div>
                    <div className="text-[11px] text-muted leading-snug">{h.titulo}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Presión estructural */}
          <Panel>
            <SectionTitle id="PR ·" title="Presión estructural" right={<span>RIN · BCB</span>} />
            <div className="px-3 py-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Metric label="RIN total" value={`$${p.rinTotal.toLocaleString('es-BO')} M`} sub="31-may · ~79% oro" tone="neutral" />
                <Metric label="Divisas líquidas" value={`$${p.rinLiquidas} M`} sub="lo defendible del TC" tone="neg" />
                <Metric label="RIN efectiva jul" value={`~$${p.rinEfectivaJul.toLocaleString('es-BO')} M`} sub={`líquidas ~$${p.rinLiquidasJul} M`} tone="neg" />
                <Metric label="Cobertura divisas" value={p.coberturaDivisas} sub="de importaciones" tone="neg" />
              </div>
              <div className="mono text-[9px] text-subtle leading-snug mt-2">{p.nota}</div>
            </div>
          </Panel>
        </div>

        {/* Lectura del economista — ancho completo */}
        <div className="col-span-12">
          <Panel>
            <SectionTitle id="LE ·" title="Lectura del economista" right={<span>{CAMBIARIO.source}</span>} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              {CAMBIARIO.lectura.map((l, i) => (
                <div key={i} className="px-3 py-2.5 border-b md:border-r border-token last:border-r-0">
                  <div className="mono text-[10px] text-accent uppercase tracking-[0.1em] leading-snug mb-1">{l.titulo}</div>
                  <div className="text-[11px] text-muted leading-snug">{l.texto}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
