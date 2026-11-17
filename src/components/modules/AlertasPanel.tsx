// Tira de alertas (reglas explícitas de src/alertas.ts). Una fila por alerta,
// con el detalle en una segunda línea tenue; sin cajas de color.
import type { Alerta } from '../../alertas';

const COLOR = { alta: 'var(--neg)', media: 'var(--accent)', info: 'var(--fg-subtle)' } as const;
const NOMBRE = { alta: 'Alta', media: 'Media', info: 'Info' } as const;

export function AlertasPanel({ alertas, onOpen }: { alertas: Alerta[]; onOpen?: (indicador: string) => void }) {
  if (!alertas.length) return null;
  return (
    <section className="card overflow-hidden fade-up" aria-label="Alertas">
      <div className="flex items-center justify-between px-5 h-11 border-b border-token">
        <span className="text-[13px] font-medium">Alertas</span>
        <span className="text-[11px] text-subtle">reglas explícitas sobre el último dato</span>
      </div>
      <ul className="grid md:grid-cols-2">
        {alertas.map((a) => (
          <li key={a.id} className="border-b border-token md:[&:nth-child(odd)]:border-r">
            <button
              onClick={() => a.indicador && onOpen?.(a.indicador)}
              disabled={!a.indicador}
              className="w-full text-left px-5 py-3 flex gap-3 items-start row-hover disabled:cursor-default"
            >
              <span className="mt-[5px] w-2 h-2 rounded-full shrink-0" style={{ background: COLOR[a.nivel] }} title={NOMBRE[a.nivel]} />
              <span className="min-w-0">
                <span className="block text-[13px] leading-snug">{a.titulo}</span>
                <span className="block text-[12px] text-muted leading-snug mt-0.5">{a.detalle}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
