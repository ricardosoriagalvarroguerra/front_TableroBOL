import type { AnalisisData } from '../../types';

interface TesisPanelProps {
  data: AnalisisData;
  onVerAnalisis?: () => void;
}

/** Tesis: titular + tres ideas. Sin caja, como encabezado editorial. */
export function TesisPanel({ data, onVerAnalisis }: TesisPanelProps) {
  const { tesis } = data;
  return (
    <section className="py-2">
      <div className="text-[11.5px] text-subtle">Lectura al {data.asof}</div>
      <h2 className="mt-2 max-w-[860px] text-[22px] sm:text-[26px] leading-[1.2] font-semibold tracking-[-0.02em] text-balance">
        {tesis.titulo}
      </h2>
      <ul className="mt-4 grid gap-x-8 gap-y-2 md:grid-cols-3 max-w-[1100px]">
        {tesis.puntos.slice(0, 3).map((p, i) => (
          <li key={i} className="text-[13px] text-muted leading-snug flex gap-2">
            <span className="text-accent">—</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      {onVerAnalisis && (
        <button onClick={onVerAnalisis} className="mt-4 text-[12.5px] text-accent hover:underline underline-offset-4">
          Ver análisis completo →
        </button>
      )}
    </section>
  );
}
