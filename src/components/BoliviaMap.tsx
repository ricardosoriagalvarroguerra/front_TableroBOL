// Mapa de Bolivia — geometría real de los 9 departamentos + cruce electoral.
// Datos: geoBoundaries ADM1 (CC-BY 4.0) → src/data/boliviaGeo.ts.
// Capas: 'bloqueos' (heat), 'pres2025' (coropleta balotaje), 'municipal' (sigla),
// 'localidades' (scatter por partido ganador 1ª vuelta; tamaño ∝ votos; granularidad
// dpto/prov/muni/localidad cargada perezosamente). Zoom/paneo tipo canvas.
//
// Rendimiento: TODO el contenido va en un <g transform> y el scatter se MEMOIZA, así
// el zoom/paneo solo actualiza el atributo transform (no se reconcilian miles de
// círculos por frame). Trazos con vector-effect para grosor constante sin recálculo.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';
import { useTheme } from '../theme';
import { DEPARTMENTS, MAP_VIEWBOX, project, deptSlug } from '../data/boliviaGeo';
import { ELEC_BY_ID, WINNER_COLOR, PARTY_ABBR, PARTIDO_COLOR_2025, PARTIDO_LABEL_2025 } from '../data/elecciones';
import type { Granularidad } from '../data/localidadesLoader';
import type { Bloqueo, MapLayer, LocPunto } from '../types';

interface BoliviaMapProps {
  bloqueos?: Bloqueo[];
  layer?: MapLayer;
  localidadesData?: LocPunto[];
  granularidad?: Granularidad;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onSelect?: (id: string) => void;
}

const W = MAP_VIEWBOX.width;
const H = MAP_VIEWBOX.height;
const MAX_K = 16;

// floor/ceil del radio (unidades del viewBox) por nivel: pocos puntos = más grandes.
const SIZE: Record<Granularidad, [number, number]> = {
  departamento: [16, 52],
  provincia: [9, 34],
  municipio: [6, 28],
  localidad: [4, 18],
};

export function BoliviaMap({
  bloqueos = [],
  layer = 'bloqueos',
  localidadesData = [],
  granularidad = 'municipio',
  hoveredId,
  setHoveredId,
  onSelect,
}: BoliviaMapProps) {
  const theme = useTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const byDept = useMemo(() => {
    const m: Record<string, number> = {};
    bloqueos.forEach((b) => {
      const k = deptSlug(b.dept);
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }, [bloqueos]);
  const maxCount = Math.max(1, ...Object.values(byDept));
  const scatter = layer === 'localidades';

  // ── scatter MEMOIZADO (no depende de view → zoom/paneo no lo re-renderiza) ──
  const scatterEls = useMemo(() => {
    if (!scatter || !localidadesData.length) return null;
    const maxT = Math.max(1, ...localidadesData.map((l) => l.t));
    const [floor, ceil] = SIZE[granularidad];
    return localidadesData.map((l, i) => {
      const [cx, cy] = project(l.lon, l.lat);
      const r = floor + (ceil - floor) * Math.sqrt(l.t / maxT);
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          stroke="var(--bg)"
          strokeWidth={0.6}
          vectorEffect="non-scaling-stroke"
          style={{ fill: PARTIDO_COLOR_2025[l.p], fillOpacity: 0.8 }}
        >
          <title>{`${l.n} · ${PARTIDO_LABEL_2025[l.p]} · ${l.t.toLocaleString('es-BO')} votos`}</title>
        </circle>
      );
    });
    // theme en deps para recolorear var(--bg) al cambiar de modo
  }, [scatter, localidadesData, granularidad, theme]);

  // ── zoom / paneo ────────────────────────────────────────────────────
  const clamp = (k: number, x: number, y: number) => ({
    k,
    x: k <= 1 ? 0 : Math.min(0, Math.max(W * (1 - k), x)),
    y: k <= 1 ? 0 : Math.min(0, Math.max(H * (1 - k), y)),
  });
  const toVB = (clientX: number, clientY: number) => {
    const ctm = svgRef.current?.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };
  const zoomAt = (px: number, py: number, factor: number) =>
    setView((v) => {
      const k = Math.min(MAX_K, Math.max(1, v.k * factor));
      const f = k / v.k;
      return clamp(k, px - f * (px - v.x), py - f * (py - v.y));
    });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = toVB(e.clientX, e.clientY);
      zoomAt(p.x, p.y, e.deltaY < 0 ? 1.18 : 1 / 1.18);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  function onPointerDown(e: RPointerEvent<SVGSVGElement>) {
    if (e.button !== 0) return;
    drag.current = toVB(e.clientX, e.clientY);
    moved.current = false;
    setDragging(true);
    try { svgRef.current?.setPointerCapture(e.pointerId); } catch { /* noop */ }
  }
  function onPointerMove(e: RPointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    const p = toVB(e.clientX, e.clientY);
    const dx = p.x - drag.current.x;
    const dy = p.y - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 0.5) moved.current = true;
    setView((v) => clamp(v.k, v.x + dx, v.y + dy));
    drag.current = toVB(e.clientX, e.clientY);
  }
  function endDrag(e: RPointerEvent<SVGSVGElement>) {
    drag.current = null;
    setDragging(false);
    try { svgRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  }
  const selectBloqueo = (id: string) => {
    if (!moved.current) onSelect && onSelect(id);
  };

  function tint(id: string): { fill: string; op: number } | null {
    if (layer === 'bloqueos') {
      const c = byDept[id] || 0;
      return c ? { fill: 'var(--neg)', op: 0.1 + 0.42 * (c / maxCount) } : null;
    }
    if (layer === 'pres2025') {
      const e = ELEC_BY_ID[id];
      if (!e) return null;
      const pct = e.ro_winner === 'paz' ? e.ro_paz : e.ro_quiroga;
      const t = Math.min(1, Math.max(0, (pct - 50) / 16));
      return { fill: WINNER_COLOR[e.ro_winner], op: 0.16 + 0.34 * t };
    }
    return null;
  }

  const Zbtn = ({ label, on, title }: { label: string; on: () => void; title: string }) => (
    <button
      onClick={on}
      title={title}
      className="w-7 h-7 grid place-items-center mono text-[13px] surface-sunk rounded-[4px] border border-token text-muted hover:text-accent hover:border-accent"
      style={{ background: 'color-mix(in srgb, var(--bg-elev) 85%, transparent)' }}
    >
      {label}
    </button>
  );

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        key={theme}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full block"
        preserveAspectRatio="xMidYMid meet"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        style={{ cursor: dragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      >
        <g transform={`translate(${view.x.toFixed(2)} ${view.y.toFixed(2)}) scale(${view.k.toFixed(3)})`}>
          {/* base de departamentos (trazo constante con vector-effect) */}
          {DEPARTMENTS.map((d) => {
            const isHover = hoveredId === d.id;
            return (
              <path
                key={d.id}
                d={d.d}
                strokeWidth={isHover ? 1.6 : 0.9}
                vectorEffect="non-scaling-stroke"
                onMouseEnter={() => setHoveredId(d.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  cursor: dragging ? 'grabbing' : 'pointer',
                  fill: isHover ? 'var(--bg-elev)' : 'var(--bg-sunk)',
                  stroke: isHover ? 'var(--accent)' : 'var(--border-strong)',
                  strokeLinejoin: 'round',
                }}
              />
            );
          })}

          {/* tinte de la capa activa (coropleta) */}
          {DEPARTMENTS.map((d) => {
            const t = tint(d.id);
            if (!t) return null;
            return (
              <path
                key={d.id + '-t'}
                d={d.d}
                style={{ pointerEvents: 'none', fill: t.fill, fillOpacity: t.op, stroke: 'none' }}
              />
            );
          })}

          {/* scatter de localidades — memoizado */}
          {scatterEls}

          {/* etiquetas de departamento (tamaño constante en pantalla) */}
          {DEPARTMENTS.map((d) => {
            const e = ELEC_BY_ID[d.id];
            const abbr = layer === 'municipal' && e ? PARTY_ABBR[e.muni_partido] ?? '' : '';
            return (
              <g key={d.id + '-l'} style={{ pointerEvents: 'none' }}>
                <text
                  x={d.labelX}
                  y={d.labelY}
                  textAnchor="middle"
                  fontSize={13 / view.k}
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fill: 'var(--fg-muted)',
                    opacity: scatter ? 0.65 : 1,
                    paintOrder: 'stroke',
                    stroke: scatter ? 'var(--bg)' : 'none',
                    strokeWidth: scatter ? 3 / view.k : 0,
                  }}
                  fontFamily='"JetBrains Mono", monospace'
                >
                  {d.name}
                </text>
                {abbr && (
                  <text
                    x={d.labelX}
                    y={d.labelY + 14 / view.k}
                    textAnchor="middle"
                    fontSize={9 / view.k}
                    style={{ fill: 'var(--accent)', letterSpacing: '0.08em' }}
                    fontFamily='"JetBrains Mono", monospace'
                  >
                    {abbr}
                  </text>
                )}
              </g>
            );
          })}

          {/* bloqueos — pines de tamaño constante, siempre encima */}
          {bloqueos.map((b) => {
            const [cx, cy] = project(b.lon, b.lat);
            const r = (b.severidad === 'alta' ? 6.5 : b.severidad === 'media' ? 5 : 4) / view.k;
            if (scatter) {
              return (
                <g key={b.id} style={{ cursor: 'pointer' }} onClick={() => selectBloqueo(b.id)}>
                  <circle cx={cx} cy={cy} r={r + 1.5 / view.k} style={{ fill: 'none', stroke: 'var(--bg)' }} strokeWidth={3 / view.k} />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 1.5 / view.k}
                    className={b.severidad === 'alta' ? 'pulse-dot' : ''}
                    style={{ fill: 'none', stroke: 'var(--fg)' }}
                    strokeWidth={1.6 / view.k}
                  />
                </g>
              );
            }
            return (
              <g key={b.id} style={{ cursor: 'pointer' }} onClick={() => selectBloqueo(b.id)}>
                <circle cx={cx} cy={cy} r={r + 5 / view.k} opacity="0.16" style={{ fill: 'var(--neg)' }} />
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  strokeWidth={1.2 / view.k}
                  className={b.severidad === 'alta' ? 'pulse-dot' : ''}
                  style={{ fill: 'var(--neg)', stroke: 'var(--bg-elev)' }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* controles de zoom */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
        <Zbtn label="+" title="Acercar" on={() => zoomAt(W / 2, H / 2, 1.4)} />
        <Zbtn label="−" title="Alejar" on={() => zoomAt(W / 2, H / 2, 1 / 1.4)} />
        <Zbtn label="⟳" title="Restablecer" on={() => setView({ k: 1, x: 0, y: 0 })} />
      </div>
    </div>
  );
}
