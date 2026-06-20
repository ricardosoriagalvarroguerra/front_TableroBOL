import { useState } from 'react';
import { Panel } from '../primitives/Panel';
import { SectionTitle } from '../primitives/SectionTitle';
import type { Noticia, NewsTag } from '../../types';

type Filter = 'Todos' | NewsTag;

const TAGS: Filter[] = ['Todos', 'Económico', 'Político', 'Social', 'Internacional', 'Sectorial'];

interface NewsPanelProps {
  noticias: Noticia[];
  onSelect?: (n: Noticia) => void;
  leidas?: Set<string>;
}

export function NewsPanel({ noticias, onSelect, leidas }: NewsPanelProps) {
  const [active, setActive] = useState<Filter>('Todos');
  const filtered = active === 'Todos' ? noticias : noticias.filter((n) => n.tag === active);

  return (
    <Panel className="flex flex-col h-full">
      <SectionTitle
        id="D ·"
        title="Feed prioritario"
        right={
          <span>
            {filtered.length} de {noticias.length}
          </span>
        }
      />
      <div className="px-3 py-1.5 border-b border-token flex gap-1 overflow-x-auto scrollbar-thin">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] border whitespace-nowrap ${
              active === t ? 'border-strong-token' : 'border-transparent text-muted hover:border-token'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filtered.map((n) => {
          const leida = leidas?.has(n.id) ?? false;
          return (
          <article
            key={n.id}
            onClick={() => onSelect && onSelect(n)}
            className={`px-3 py-2.5 border-b border-token row-hover cursor-pointer group ${leida ? 'opacity-50' : ''}`}
          >
            <div className="flex items-center gap-1.5 mono text-[9px] uppercase tracking-wider text-subtle">
              <span>{n.t}</span>
              <span className="text-subtle">·</span>
              <span className="text-muted">{n.fuente}</span>
              <span className="text-subtle">·</span>
              <span>{n.tag}</span>
              {leida && <span className="text-pos">· leída</span>}
              {n.breaking && !leida && (
                <span className="ml-auto mono text-[9px] uppercase tracking-wider text-accent flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-accent pulse-dot" />
                  breaking
                </span>
              )}
            </div>
            <h4 className="mt-1 text-[12.5px] leading-snug group-hover:text-accent transition-colors">
              {n.titular}
            </h4>
            <p className="text-[11px] text-muted mt-0.5 leading-snug">{n.resumen}</p>
          </article>
          );
        })}
      </div>
    </Panel>
  );
}
