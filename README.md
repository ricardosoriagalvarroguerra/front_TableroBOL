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

- [x] **Datos al 17-nov-2026** — TCO flexible, IPC de octubre, RIN, EMBI, PIB 1S, comercio
  ene–sep, deuda externa, FMI/BID/BM, 21 noticias reales y agenda 17-nov → 17-dic
  (procedencia en [`docs/SOURCES.md`](docs/SOURCES.md)).
- [x] **Capa analítica** — pestaña Análisis: tesis, semáforo de 8 dimensiones, indicadores
  derivados en vivo ([`src/analytics.ts`](src/analytics.ts)), proyecciones, escenarios 2027 y
  riesgos; lecturas por pestaña y por KPI ([`src/data/analisis.ts`](src/data/analisis.ts)).
- [x] **Series 2015→hoy** — pestaña Histórico y vista «2015–hoy» en el modal
  ([`src/data/historico.ts`](src/data/historico.ts)); calificaciones a fin de año en Mercados.
- [x] **Interfaz minimalista** — menos ruido y menos texto (ver [`docs/ANALISIS.md`](docs/ANALISIS.md) § 0).
- [x] **BDR** — PostgreSQL: [`db/schema.sql`](db/schema.sql) + [`db/seed.sql`](db/seed.sql), generado
  desde `src/data/` con `node db/generate-seed.mjs`. El backend
  ([Back_TableroBOL](https://github.com/ricardosoriagalvarroguerra/Back_TableroBOL)) la aprovisiona
  sola al arrancar.
- [x] **Tablero vivo (v0.9)** — ingesta automática (TCO del BCB, FMI WEO), pestaña **Región**
  (comparador con 8 países de Sudamérica), **alertas** por reglas explícitas, **frescura** de cada
  dato y **nota ejecutiva** imprimible ([`docs/ANALISIS.md`](docs/ANALISIS.md) § 0.5).
- [ ] **Más conectores** — INE (IPC, comercio), YPFB, ABC, EMBI y RSS de noticias.

## Arquitectura (full-stack)

```
React (este repo) ──fetch──> Fastify (Back_TableroBOL) ──pg──> PostgreSQL (vistas v_*)
        │                                                         ▲
        └── fallback a src/data/ si la API no responde            │
db/schema.sql + db/seed.sql ──npm run sync:db──> Back_TableroBOL/db ── auto-seed al arrancar
```

Flujo para publicar datos nuevos:

```bash
node db/generate-seed.mjs                  # 1) regenera db/seed.sql desde src/data/
cd ../Back_TableroBOL && npm run sync:db   # 2) copia schema + seed al backend
git commit -am "data: …" && git push       # 3) al desplegar, la API aplica el seed nuevo
```

Si la API no responde, el frontend usa los datos embebidos; el encabezado y el pie indican el
origen («BDR en vivo» / «datos embebidos») y la fecha de corte.

## Módulos

| ID | Módulo | Descripción |
|----|--------|-------------|
| Z | Análisis | Tesis, semáforo, derivados en vivo, proyecciones, escenarios y riesgos. |
| H | Histórico | Serie anual 2015→hoy por indicador con promedio y extremos. |
| A | Indicadores macro | 19 KPIs con sparkline + modal de **serie histórica profunda real** (diaria 1 año · mensual 3 años · trimestral/anual 5 años) en un **gráfico D3** interactivo (eje temporal real, hover por fecha vía bisector, selector de rango). Charts construidos con D3.js (d3-scale/shape/axis/array). |
| B | Bloqueos × elecciones | Mapa de Bolivia (9 deptos.) con 4 capas: bloqueos, **presidencial 2025** (coropleta por ganador del balotaje), **municipal 2026** y **localidades 2025** (scatter electoral por partido ganador, geocodificado con GeoNames, con **granularidad seleccionable** —departamento/provincia/municipio/localidad— y **carga perezosa** por nivel). 22 puntos reales de bloqueo (ABC) superpuestos + lista + drawer con contexto electoral. **Zoom/paneo tipo canvas** (rueda, arrastre, botones) y tamaño de punto ∝ votos. El cruce muestra que ~91% de los bloqueos caen en departamentos que Paz ganó. |
| C | Mercados · soberanos | Bonos BOL28/30, EMBI, CDS 5Y, ratings y composición RIN (donut). |
| D | Feed prioritario | Noticias filtrables por tag, indicador *breaking* y modal de detalle. |
| E | Calendario | Línea de tiempo de 30 días con eventos tipados. |
| F | Health-check | Estado, latencia y última actualización de cada fuente. |

## Atajos de teclado

- `1`–`8` — cambiar de pestaña
- `N` — nota ejecutiva
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
