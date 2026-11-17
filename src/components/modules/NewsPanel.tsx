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
        id="D"
        title="Feed prioritario"
        sub="Titulares verificados con enlace a la fuente"
        right={
          <span>
            {filtered.length} de {noticias.length}
          </span>
        }
      />
      <div className="px-4 py-1.5 border-b border-token flex gap-1 overflow-x-auto scrollbar-thin">
        {TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              active === t ? 'font-medium' : 'text-muted hover:text-[color:var(--fg)]'
            }`}
            style={active === t ? { background: 'var(--bg-sunk)', boxShadow: 'inset 0 0 0 1px var(--border-strong)' } : undefined}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-0">
        {filtered.map((n) => {
          const leida = leidas?.has(n.id) ?? false;
          return (
          <article
            key={n.id}
            onClick={() => onSelect && onSelect(n)}
            className={`px-5 py-3 border-b border-token last:border-b-0 row-hover cursor-pointer group ${leida ? 'opacity-50' : ''}`}
            title={n.resumen}
          >
            <div className="flex items-center gap-1.5 eyebrow">
              <span>{n.t}</span>
              <span className="text-subtle">·</span>
              <span>{n.fuente}</span>
              {leida && <span className="text-pos">· leída</span>}
              {n.breaking && !leida && (
                <span className="ml-auto inline-block w-1.5 h-1.5 rounded-full bg-accent" title="Último momento" />
              )}
            </div>
            <h4 className="mt-0.5 text-[13px] leading-snug group-hover:text-accent transition-colors">
              {n.titular}
            </h4>
          </article>
          );
        })}
      </div>
    </Panel>
  );
}
