import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import type { Proyeccion } from '../../types';

interface ProyeccionesPanelProps {
  rows: Proyeccion[];
}

const f = (v: number | null, d = 1) => (v == null ? '—' : v.toFixed(d).replace('.', ','));

const COLS: { key: keyof Proyeccion; label: string; d?: number; sign?: boolean }[] = [
  { key: 'pib2026', label: 'PIB 26' },
  { key: 'pib2027', label: 'PIB 27' },
  { key: 'ipc2026', label: 'IPC 26' },
  { key: 'ipc2027', label: 'IPC 27' },
  { key: 'tc2026', label: 'TC dic-26', d: 1 },
  { key: 'fiscal2026', label: 'Déficit 26' },
];

/** Tabla de proyecciones por fuente (consenso vs oficial vs organismos). */
export function ProyeccionesPanel({ rows }: ProyeccionesPanelProps) {
  // rango por columna para resaltar dispersión
  const rng = (k: keyof Proyeccion) => {
    const v = rows.map((r) => r[k]).filter((x): x is number => typeof x === 'number');
    return v.length ? [Math.min(...v), Math.max(...v)] : null;
  };
  return (
    <Panel className="h-full flex flex-col">
      <SectionTitle title="Proyecciones" sub="PIB e IPC en % · TC en Bs/USD · déficit del SPNF en % del PIB" right={<span>% salvo TC</span>} />
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-token">
              <th className="text-left font-normal eyebrow px-5 py-2.5">Fuente</th>
              {COLS.map((c) => (
                <th key={c.key} className="text-right font-normal eyebrow px-3 py-2 whitespace-nowrap">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.fuente} className="row-hover">
                <td className="px-5 py-2.5" title={r.fecha}>
                  {r.fuente}
                </td>
                {COLS.map((c) => {
                  const v = r[c.key] as number | null;
                                    return (
                    <td key={c.key} className={`px-3 py-2.5 text-right mono tabular-nums ${v == null ? 'text-subtle' : ''}`}>
                      {f(v, c.d)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-token">
              <td className="px-5 py-2.5 eyebrow">Rango</td>
              {COLS.map((c) => {
                const r = rng(c.key);
                return (
                  <td key={c.key} className="px-3 py-2 text-right mono text-[10.5px] text-muted whitespace-nowrap">
                    {r ? (r[0] === r[1] ? f(r[0], c.d) : `${f(r[0], c.d)} a ${f(r[1], c.d)}`) : '—'}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
