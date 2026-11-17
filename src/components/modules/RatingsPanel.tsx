import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import { SeriesChart } from '../primitives/SeriesChart';
import type { Mercados, SeriePunto } from '../../types';

interface RatingsPanelProps {
  data: Mercados;
  /** Serie fechada del EMBI (pb). */
  embi?: SeriePunto[];
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const corta = (f: string) => {
  const [y, m] = f.split('-').map(Number);
  return `${MESES[(m || 1) - 1]} ${String(y).slice(2)}`;
};

/** Riesgo país (EMBI) desde 2025 y calificación soberana a fin de año. */
export function RatingsPanel({ data, embi = [] }: RatingsPanelProps) {
  const serie = embi.filter((p) => p.f >= '2025-01-01');
  const hist = data.ratingsHistoria ?? [];
  return (
    <Panel className="h-full flex flex-col">
      <SectionTitle title="Riesgo país y calificaciones" right={<span>EMBI · S&P · Moody’s · Fitch</span>} />
      <div className="px-5 pt-4">
        <div className="eyebrow mb-2">EMBI Bolivia, pb</div>
        {serie.length >= 2 && (
          <SeriesChart
            data={serie.map((p) => p.v)}
            labels={serie.map((p) => corta(p.f))}
            color="var(--fg-muted)"
            fmt={(v) => Math.round(v).toLocaleString('es-BO')}
            height={170}
          />
        )}
      </div>
      <div className="px-5 py-4">
        <div className="eyebrow mb-2">Calificación a fin de año</div>
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-token">
              <th className="text-left font-normal eyebrow py-2">Año</th>
              <th className="text-right font-normal eyebrow py-2">S&P</th>
              <th className="text-right font-normal eyebrow py-2">Moody’s</th>
              <th className="text-right font-normal eyebrow py-2">Fitch</th>
            </tr>
          </thead>
          <tbody>
            {hist.map((r) => (
              <tr key={r.anio} className="border-b border-token last:border-b-0">
                <td className="py-2 mono text-muted">{r.anio}</td>
                <td className="py-2 mono text-right">{r.sp ?? '—'}</td>
                <td className="py-2 mono text-right">{r.moodys ?? '—'}</td>
                <td className="py-2 mono text-right">{r.fitch ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 text-[11px] text-subtle">
          2026* = vigente. Las acciones de 2015–2024 están pendientes de verificación contra los comunicados de cada agencia.
        </div>
      </div>
    </Panel>
  );
}
