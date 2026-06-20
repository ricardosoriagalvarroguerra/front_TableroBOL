import { Fragment } from 'react';
import type { Noticia } from '../../types';

interface NewsModalProps {
  noticia: Noticia | null;
  onClose: () => void;
  onMarcarLeida?: (id: string) => void;
  leida?: boolean;
}

function dominio(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function NewsModal({ noticia, onClose, onMarcarLeida, leida }: NewsModalProps) {
  if (!noticia) return null;
  const tagColor =
    noticia.tag === 'Económico'
      ? 'var(--accent)'
      : noticia.tag === 'Político'
        ? 'var(--info)'
        : noticia.tag === 'Social'
          ? 'var(--neg)'
          : noticia.tag === 'Internacional'
            ? 'var(--fg-muted)'
            : 'var(--pos)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <article
        className="surface rounded-[6px] w-full max-w-[720px] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '88vh' }}
      >
        {/* meta strip */}
        <div className="px-5 pt-4 pb-3 border-b border-token flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap mono text-[9px] uppercase tracking-[0.16em] text-subtle">
            <span className="text-muted">{noticia.fuente}</span>
            <span>·</span>
            <span style={{ color: tagColor }}>{noticia.tag}</span>
            <span>·</span>
            <span>hace {noticia.t.replace('−', '')}</span>
            {noticia.breaking && (
              <Fragment>
                <span>·</span>
                <span className="text-accent flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-accent pulse-dot" />
                  breaking
                </span>
              </Fragment>
            )}
          </div>
          <button
            onClick={onClose}
            className="mono text-[10px] uppercase tracking-wider text-muted hover:text-accent whitespace-nowrap shrink-0"
          >
            cerrar [esc]
          </button>
        </div>

        {/* body */}
        <div className="px-5 py-5 overflow-y-auto scrollbar-thin">
          <h2 className="text-[20px] sm:text-[22px] leading-snug" style={{ textWrap: 'pretty' }}>
            {noticia.titular}
          </h2>
          <p className="mt-3 text-[13px] text-muted leading-relaxed">{noticia.resumen}</p>
          {noticia.body && (
            <p className="mt-3 text-[13px] leading-relaxed" style={{ textWrap: 'pretty', color: 'var(--fg)' }}>
              {noticia.body}
            </p>
          )}

          {noticia.keywords && noticia.keywords.length > 0 && (
            <div className="mt-5">
              <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">
                Términos clave
              </div>
              <div className="flex flex-wrap gap-1.5">
                {noticia.keywords.map((k) => (
                  <span
                    key={k}
                    className="mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] surface-sunk text-muted"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {noticia.relacionados && noticia.relacionados.length > 0 && (
            <div className="mt-4">
              <div className="mono text-[9px] uppercase tracking-wider text-subtle mb-1.5">Vinculado a</div>
              <ul className="space-y-0.5">
                {noticia.relacionados.map((r) => (
                  <li key={r} className="text-[12px] text-muted flex items-center gap-2">
                    <span className="text-subtle mono text-[10px]">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="px-5 py-3 border-t border-token flex items-center justify-between gap-3">
          <div className="mono text-[10px] text-subtle lowercase tracking-wider truncate">
            {noticia.url ? dominio(noticia.url) : 'sin enlace disponible'}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onMarcarLeida?.(noticia.id)}
              disabled={leida}
              className={`mono text-[10px] uppercase tracking-wider px-2 h-7 surface-sunk rounded-[3px] ${
                leida ? 'text-pos cursor-default' : 'text-muted hover:ring-accent'
              }`}
            >
              {leida ? 'Leída ✓' : 'Marcar leída'}
            </button>
            {noticia.url ? (
              <a
                href={noticia.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-[10px] uppercase tracking-wider px-2 h-7 rounded-[3px] hover:ring-accent flex items-center"
                style={{ background: 'var(--accent)', color: '#0A0A0B' }}
              >
                Abrir fuente ↗
              </a>
            ) : (
              <button
                disabled
                className="mono text-[10px] uppercase tracking-wider px-2 h-7 rounded-[3px] surface-sunk text-subtle cursor-not-allowed"
              >
                Sin enlace
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
