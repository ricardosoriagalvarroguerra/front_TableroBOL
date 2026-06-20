# Tablero Inteligente BOL · Command Center

Dashboard de inteligencia estratégica sobre Bolivia: un *command center* que
consolida, en una sola vista, las señales relevantes para decisiones
financieras, institucionales y de planificación.

Implementación del **frontend** en **React 18 + TypeScript + Vite + Tailwind CSS**,
portada desde el prototipo de Claude Design. Estética: densidad informativa
(Bloomberg), tipografía y jerarquías (Linear), minimalismo (Vercel), calma
visual (Are.na). Paleta monocromática + un acento ámbar funcional, modo
claro/oscuro, tipografía Inter + JetBrains Mono.

## Estado del proyecto

- [x] **Frontend** — React 18 + TS + Vite + Tailwind. Layout híbrido: tira de 11 KPIs
  siempre visible + pestañas (Panorama · Bloqueos · Externo & Deuda · Mercados) + footer.
  Series históricas reales, color direccional (verde=bueno/rojo=malo), tooltips en gráficos.
  Consume el API con fallback offline.
- [x] **BDR** — PostgreSQL (`bolivia`): 26 tablas, 6 vistas, 12 enums, 71 índices. Ver [`db/`](db/README.md).
- [x] **Backend** — API Fastify + `pg` que sirve los módulos A–F. Ver [`server/`](server/README.md).
- [x] **Datos reales** — snapshot de Bolivia ~20 jun 2026 (ver [`docs/SOURCES.md`](docs/SOURCES.md)).
- [x] **Históricos reales profundos** — serie fechada por métrica, a profundidad por cadencia
  (diaria→1 año · mensual→3 años · trimestral/anual→5 años), de fuentes oficiales
  (BCB/INE/MEFP/YPFB/JPMorgan/Trading Economics + feed diario paralelo.bo). Clic en cualquier
  indicador, EMBI, bono o commodity abre su modal con histórico + selector de rango. Generadas por
  [`scripts/build-series.mjs`](scripts/build-series.mjs) → [`src/data/series.ts`](src/data/series.ts).
- [ ] **Ingesta en vivo** — conectores automáticos a las fuentes (BCB / INE / YPFB / ABC / EMBI / RSS).

## Arquitectura (full-stack)

```
React (src/) ──fetch──> Fastify (server/) ──pg──> PostgreSQL (db/ · vistas v_*)
```

Correr todo (3 terminales o background):

```bash
# 1) BDR (una vez)
psql -d bolivia -f db/schema.sql && node db/generate-seed.mjs && psql -d bolivia -f db/seed.sql
# 2) API
cd server && npm install && npm run dev      # :5174
# 3) Frontend
npm install && npm run dev                   # :5173
```

Si la API no responde, el frontend usa los datos embebidos (`src/data/mockData.ts`);
el footer indica el origen («BDR en vivo» / «datos locales»).

## Módulos

| ID | Módulo | Descripción |
|----|--------|-------------|
| A | Indicadores macro | 11 KPIs con sparkline + modal de **serie histórica profunda real** (diaria 1 año · mensual 3 años · trimestral/anual 5 años) en un **gráfico D3** interactivo (eje temporal real, hover por fecha vía bisector, selector de rango). Charts construidos con D3.js (d3-scale/shape/axis/array). |
| B | Bloqueos × elecciones | Mapa de Bolivia (9 deptos.) con 4 capas: bloqueos, **presidencial 2025** (coropleta por ganador del balotaje), **municipal 2026** y **localidades 2025** (scatter electoral por partido ganador, geocodificado con GeoNames, con **granularidad seleccionable** —departamento/provincia/municipio/localidad— y **carga perezosa** por nivel). 22 puntos reales de bloqueo (ABC) superpuestos + lista + drawer con contexto electoral. **Zoom/paneo tipo canvas** (rueda, arrastre, botones) y tamaño de punto ∝ votos. El cruce muestra que ~91% de los bloqueos caen en departamentos que Paz ganó. |
| C | Mercados · soberanos | Bonos BOL28/30, EMBI, CDS 5Y, ratings y composición RIN (donut). |
| D | Feed prioritario | Noticias filtrables por tag, indicador *breaking* y modal de detalle. |
| E | Calendario | Línea de tiempo de 30 días con eventos tipados. |
| F | Health-check | Estado, latencia y última actualización de cada fuente. |

## Atajos de teclado

- `/` — enfocar búsqueda
- `D` — alternar modo claro/oscuro
- `R` — refrescar
- `Esc` — cerrar overlays / desenfocar búsqueda

## Desarrollo

```bash
npm install
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # type-check + build de producción a dist/
npm run preview    # previsualizar el build
npm run typecheck  # solo verificación de tipos
```

## Estructura

```
scripts/
├── bolivia-adm1.geojson           # fuente: límites departamentales (geoBoundaries ADM1)
└── generate-bolivia-map.mjs       # GeoJSON → proyección Mercator → SVG paths (build-time)
src/
├── main.tsx                  # punto de entrada
├── App.tsx                   # layout + estado global + atajos
├── theme.tsx                 # ThemeContext (claro/oscuro)
├── types.ts                  # tipos de dominio (mapean al esquema BDR futuro)
├── index.css                 # tokens de diseño + utilidades
├── data/
│   ├── mockData.ts           # datos simulados · marca // TODO los puntos de integración
│   └── boliviaGeo.ts         # AUTO-GENERADO · geometría real + project(lon,lat)
└── components/
    ├── Header.tsx
    ├── BoliviaMap.tsx        # 9 departamentos reales; bloqueos proyectados desde lon/lat
    ├── primitives/           # Sparkline, Delta, Tag, Panel, Donut, SectionTitle
    ├── modules/              # KpiCard, BloqueosPanel, MercadosPanel, NewsPanel, CalendarioPanel, HealthFooter
    └── overlays/             # KpiModal, BloqueoDrawer, NewsModal
```

## Mapa de Bolivia · datos geográficos

El mapa usa **geometría cartográfica real** de los 9 departamentos, no una
silueta dibujada a mano. Pipeline (build-time, `npm run gen:map`):

1. Fuente: **geoBoundaries ADM1** (`scripts/bolivia-adm1.geojson`).
2. Simplificación Douglas–Peucker + corrección de winding (d3-geo es esférico).
3. Proyección **Mercator** ajustada al viewBox → paths SVG compactos.
4. Salida: [`src/data/boliviaGeo.ts`](src/data/boliviaGeo.ts) (~18 KB) con los paths,
   los centroides de etiqueta y `project(lon, lat)`.

Los bloqueos guardan su `[lon, lat]` real en `mockData.ts` y se proyectan en
runtime con la **misma** proyección, así caen sobre su ubicación geográfica
correcta. Para añadir/mover un bloqueo basta con su lon/lat; no hay coordenadas
de pantalla codificadas a mano.

> **Atribución:** límites departamentales de
> [geoBoundaries](https://www.geoboundaries.org/) (Runfola et al.), licencia
> **CC-BY 4.0**. `d3-geo` se usa solo en build-time; no entra al bundle.

## Integración de datos reales (próxima fase)

Los puntos de conexión están marcados con `// TODO` en `src/data/mockData.ts`:

- **BCB** (`bcb.gob.bo`) — tipo de cambio, RIN, IPC.
- **INE** — PIB, inflación, cuentas nacionales.
- **YPFB** — producción de hidrocarburos.
- **ABC** (`transitabilidad.abc.gob.bo`) — bloqueos / transitabilidad RVF.
- **EMBI / mercados** — Bloomberg / Refinitiv / cbonds.
- **Agregador RSS** — La Razón, El Deber, Página Siete, Los Tiempos, ABI, Bloomberg, Reuters.

Las interfaces en `src/types.ts` están pensadas para mapear 1:1 con los
endpoints del backend y las tablas de la base de datos relacional.
