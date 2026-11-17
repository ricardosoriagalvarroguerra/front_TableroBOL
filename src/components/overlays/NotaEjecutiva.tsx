// Nota ejecutiva imprimible: tesis, indicadores, semáforo, alertas y agenda en
// una página. «Imprimir / PDF» usa el diálogo del navegador (CSS de impresión en
// index.css: sólo se imprime .nota-print).
import { useEffect } from 'react';
import { PAIS } from '../../pais';
import { frescura } from '../../alertas';
import type { Alerta } from '../../alertas';
import type { AnalisisData, Evento, Kpi } from '../../types';

interface NotaProps {
  open: boolean;
  onClose: () => void;
  snapshot: string;
  analisis: AnalisisData;
  kpis: Kpi[];
  alertas: Alerta[];
  eventos: Evento[];
  base: Date;
  origen: string;
}

const ESTADO = { pos: 'favorable', neutral: 'mixto', neg: 'desfavorable' } as const;
const FRESCURA_TXT = { al_dia: '', rezago: ' · con rezago', desactualizado: ' · desactualizado' } as const;
const corta = (d: Date) => d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '');

export function NotaEjecutiva({ open, onClose, snapshot, analisis, kpis, alertas, eventos, base, origen }: NotaProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);
  if (!open) return null;
  const hoy = new Date();
  const agenda = [...eventos].sort((a, b) => a.d - b.d).slice(0, 8);
  const fecha = (d: number) => new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + d));

  return (
    <div className="nota-overlay fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(3,4,7,0.6)' }} onClick={onClose} role="dialog" aria-modal="true" aria-label="Nota ejecutiva">
      <div className="no-print sticky top-0 flex justify-end gap-2 px-6 py-3">
        <button onClick={(e) => { e.stopPropagation(); window.print(); }} className="surface-sunk rounded-[7px] px-3 h-8 text-[12px] hover:ring-accent">
          Imprimir / PDF
        </button>
        <button onClick={onClose} className="surface-sunk rounded-[7px] px-3 h-8 text-[12px] text-muted hover:ring-accent">
          Cerrar <span className="kbd ml-1">esc</span>
        </button>
      </div>
      <article
        className="nota-print mx-auto mb-10 max-w-[820px] rounded-[12px] px-10 py-9"
        style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-baseline justify-between gap-4 border-b border-token pb-3">
          <div className="text-[13px] font-semibold">{PAIS.tablero} · Nota ejecutiva</div>
          <div className="text-[11.5px] text-subtle">Datos al {snapshot} · {origen}</div>
        </header>

        <h1 className="mt-5 text-[22px] leading-tight font-semibold tracking-[-0.02em]">{analisis.tesis.titulo}</h1>
        <p className="mt-2 text-[13px] text-muted leading-relaxed">{analisis.tesis.bajada}</p>
        <ul className="mt-3 flex flex-col gap-1">
          {analisis.tesis.puntos.map((p, i) => (
            <li key={i} className="text-[12.5px] leading-snug flex gap-2"><span className="text-accent">—</span>{p}</li>
          ))}
        </ul>

        <h2 className="mt-6 eyebrow">Indicadores</h2>
        <table className="mt-2 w-full text-[12px]">
          <tbody>
            {kpis.map((k) => {
              const f = frescura(k, hoy);
              return (
                <tr key={k.id} className="border-b border-token">
                  <td className="py-1.5 pr-3">{k.label}</td>
                  <td className="py-1.5 pr-3 mono text-right whitespace-nowrap">{k.fmt(k.value)} {k.unit ?? ''}</td>
                  <td className="py-1.5 pr-3 mono text-right text-muted whitespace-nowrap">{k.deltaLabel}</td>
                  <td className="py-1.5 text-right text-subtle whitespace-nowrap">{k.asof}{f ? FRESCURA_TXT[f] : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-8">
          <section>
            <h2 className="eyebrow">Semáforo</h2>
            <ul className="mt-2 flex flex-col gap-1">
              {analisis.semaforo.map((s) => (
                <li key={s.id} className="text-[12px] flex justify-between gap-3">
                  <span>{s.dimension}</span>
                  <span className="text-muted">{s.score}/5 · {ESTADO[s.estado]} · {s.tendencia}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="eyebrow">Alertas</h2>
            <ul className="mt-2 flex flex-col gap-1.5">
              {alertas.length ? alertas.map((a) => (
                <li key={a.id} className="text-[12px] leading-snug"><span className={a.nivel === 'alta' ? 'text-neg' : a.nivel === 'media' ? 'text-accent' : 'text-muted'}>●</span> {a.titulo}</li>
              )) : <li className="text-[12px] text-muted">Sin alertas activas.</li>}
            </ul>
          </section>
        </div>

        <h2 className="mt-6 eyebrow">Agenda</h2>
        <ul className="mt-2 grid grid-cols-2 gap-x-8 gap-y-1">
          {agenda.map((e, i) => (
            <li key={i} className="text-[12px] flex gap-3"><span className="mono text-subtle w-[52px] shrink-0">{corta(fecha(e.d))}</span>{e.title}</li>
          ))}
        </ul>

        <footer className="mt-7 pt-3 border-t border-token text-[10.5px] text-subtle leading-relaxed">
          Lectura analítica del tablero, separada del dato de fuente. Fuentes y confianza de cada cifra en docs/SOURCES.md del repositorio.
        </footer>
      </article>
    </div>
  );
}
