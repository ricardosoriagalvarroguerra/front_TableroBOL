// Punto de frescura del dato: verde = al día, ámbar = con rezago, rojo = desactualizado
// según la periodicidad del indicador (umbrales en src/alertas.ts · FRESCURA).
import { diasDesde, frescura } from '../../alertas';

const COLOR = { al_dia: 'var(--pos)', rezago: 'var(--accent)', desactualizado: 'var(--neg)' } as const;
const TXT = { al_dia: 'al día', rezago: 'con rezago', desactualizado: 'desactualizado' } as const;

export function frescuraTexto(fecha?: string, periodicidad?: string): string | null {
  const hoy = new Date();
  const f = frescura({ fecha, periodicidad }, hoy);
  const d = diasDesde(fecha, hoy);
  if (!f || d == null) return null;
  const hace = d <= 0 ? 'hoy' : d === 1 ? 'hace 1 día' : `hace ${d} días`;
  return `Dato ${hace} · ${TXT[f]}`;
}

export function Frescura({ fecha, periodicidad }: { fecha?: string; periodicidad?: string }) {
  const f = frescura({ fecha, periodicidad }, new Date());
  if (!f) return null;
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
      style={{ background: COLOR[f], opacity: f === 'al_dia' ? 0.7 : 1 }}
      title={frescuraTexto(fecha, periodicidad) ?? undefined}
      aria-label={TXT[f]}
    />
  );
}
