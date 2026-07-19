// Datos del "Tablero Inteligente BOL" — snapshot REAL de Bolivia ~19 jul 2026.
// Revisado contra fuentes OFICIALES/primarias (BCB, INE, MEFP, YPFB, ABC, ANH) y
// medios reputados que las citan. Las SERIES históricas usan valores reales
// (corroborados) donde existen; los puntos indicativos se señalan en docs.
// Lo no verificable se marca (s/d, "sector no detallado"). Ver docs/SOURCES.md.
// Coyuntura: bajo Rodrigo Paz (presidente desde 8-nov-2025), FIN del tipo de cambio
// fijo (26-jun-2026) y régimen FLEXIBLE (TCO diario del BCB) desde el 29-jun;
// negociación con el FMI en curso. Reemplazar por ingesta en vivo (// TODO).

import type {
  Kpi, Bloqueo, Mercados, Noticia, Evento, Fuente, ExternoData, CambiarioData,
} from '../types';
import { HISTORY, PERIODICIDAD, sparkFrom } from './series.ts';

// ─────────────────────────────────────────────────────────────────────
// MÓDULO A — Indicadores macro (11 KPIs; series históricas reales)
// ─────────────────────────────────────────────────────────────────────
const RAW_KPIS: Kpi[] = [
  {
    id: 'usdbob_oficial',
    label: 'USD/BOB OFICIAL',
    value: 10.85,
    fmt: (v) => v.toFixed(2),
    delta: 11.5,
    deltaLabel: '+11,5%',
    sentiment: 'neg',
    // régimen flexible desde 29-jun: 9,73 → 9,83 → 9,96 → 10,10 → 10,24 → 10,50 → 10,70 → 10,85
    spark: [6.96, 6.96, 6.96, 6.96, 9.73, 9.83, 9.96, 10.1, 10.24, 10.5, 10.7, 10.85],
    source: 'BCB · TCO',
    asof: '17 jul · TCO',
    def: 'Tipo de Cambio Oficial (TCO) del BCB bajo el régimen FLEXIBLE vigente desde el 29-jun-2026. Se calcula a diario como promedio ponderado de las compras de dólares de la banca; el referencial de venta es el TCO + Bs 0,10. Al 17-jul: Bs 10,85 (subió desde 9,73 el 29-jun, +11,5%). Frente al antiguo tipo fijo de Bs 6,96 (2011–jun 2026) es +55,9%. La presión al alza es estructural por la escasez de divisas líquidas.',
  },
  {
    id: 'usdbob_paralelo',
    label: 'USD/BOB PARALELO',
    value: 10.75,
    fmt: (v) => v.toFixed(2),
    delta: 8.8,
    deltaLabel: '+8,8%',
    sentiment: 'neg',
    // convergió al oficial con el régimen flexible: 9,94 → 9,98 → 10,01 → 10,34 → 10,60 → 10,51 → 10,63 → 10,75
    spark: [9.88, 9.94, 9.98, 10.01, 10.34, 10.6, 10.51, 10.63, 10.7, 10.72, 10.74, 10.75],
    source: 'paralelo (P2P) · informal',
    asof: '18 jul',
    def: 'Promedio de cotizaciones P2P (informal, no oficial). Con el régimen flexible convergió al oficial: ~Bs 10,75 al 18-jul, incluso levemente por debajo del TCO. Desapareció el premio que llegó a ~42% frente al viejo oficial fijo.',
    extra: { label: 'BRECHA', value: '−0,9%', tone: 'neutral' },
  },
  {
    id: 'vrd',
    label: 'VRD · BCB',
    value: 10.95,
    unit: 'Bs',
    fmt: (v) => v.toFixed(2),
    delta: 10.3,
    deltaLabel: '+10,3%',
    sentiment: 'neg',
    spark: [9.86, 9.93, 9.93, 9.83, 9.93, 10.06, 10.2, 10.34, 10.6, 10.8, 10.9, 10.95],
    source: 'BCB · referencial',
    asof: '17 jul',
    def: 'El Valor Referencial del Dólar del BCB fue absorbido por el TCO: desde el 29-jun ya no se publica un VRD separado. Se muestra el referencial de venta del nuevo régimen (TCO + Bs 0,10 ≈ 10,95 al 17-jul).',
    extra: { label: 'REF. VENTA', value: 'TCO+0,10', tone: 'neutral' },
  },
  {
    id: 'brecha',
    label: 'BRECHA CAMBIARIA',
    value: -0.9,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: -42.9,
    deltaLabel: '−42,9 pp',
    sentiment: 'pos',
    // brecha = paralelo/oficial − 1; colapsó a ≈0 con el TCO flexible (unificación)
    spark: [42.2, 42.1, 42.0, 1.6, 1.3, 2.4, 3.5, 2.0, 0.1, -0.5, -0.7, -0.9],
    source: 'derivado · paralelo/oficial',
    asof: '17 jul',
    def: 'Brecha entre el dólar paralelo y el oficial. Con el TCO flexible (que alcanzó al paralelo) colapsó de ~42% a ≈0 (levemente negativa al 17-jul): es la unificación cambiaria de facto.',
  },
  {
    id: 'brecha_vrd',
    label: 'BRECHA P/VRD',
    value: -1.8,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: -1.3,
    deltaLabel: '−1,3 pp',
    sentiment: 'neutral',
    spark: [],
    source: 'derivado · paralelo/ref.',
    asof: '17 jul',
    def: 'Brecha entre el paralelo y el referencial de venta del BCB (TCO + Bs 0,10). Prácticamente nula/negativa bajo el régimen flexible: el paralelo (~10,75) quedó por debajo del referencial (~10,95).',
  },
  {
    id: 'rin',
    label: 'RIN · BCB',
    value: 4547,
    unit: 'M USD',
    fmt: (v) => v.toLocaleString('es-BO'),
    delta: 22.7,
    deltaLabel: '+22,7%',
    sentiment: 'neg',
    // cortes oficiales BCB 2026: ene 4.417 · mar 3.543 · abr 3.706 · may 4.547 (dic-24 1.976 · dic-25 3.713)
    spark: [1976, 2881, 3275, 3713, 4417, 3543, 3706, 4547],
    source: 'BCB · RIN 31-may-2026',
    asof: '31 may 2026',
    def: 'Reservas Internacionales Netas del BCB. Último dato oficial (31-may-2026): USD 4.546,8 M (oro 3.580,6 M ≈ 79% · divisas líquidas 897,5 M · DEG/FMI 69 M). El pico de 4.819 M (14-may) fue transitorio por el bono soberano de US$1.000 M. El Programa Monetario del BCB registra un drenaje de ~USD 525 M en junio (importación de combustibles, intervención cambiaria y pago de deuda): el nivel efectivo de julio se estima en ~USD 3.600 M con apenas ~USD 671 M en divisas líquidas (prensa). Además, ~6,6 t de oro están comprometidas en ventas forward.',
    extra: { label: 'DIVISAS', value: '~$898 M', tone: 'neutral' },
  },
  {
    id: 'cobertura_importaciones',
    label: 'COBERTURA IMPORT.',
    value: 4.8,
    unit: 'meses',
    fmt: (v) => v.toFixed(1),
    delta: -0.1,
    deltaLabel: '−0,1 m',
    sentiment: 'neg',
    spark: [],
    source: 'derivado · RIN/importaciones',
    asof: '31 may 2026',
    def: 'Reservas en meses de importación (RIN ÷ importaciones ~USD 950 M): ~4,8 meses con la RIN de mayo (4.547 M). Pero las divisas líquidas (~898 M) cubren menos de 1 mes y, con el drenaje de junio, el colchón usable es aún menor: el grueso de la RIN sigue siendo oro, parte comprometido en forwards.',
    extra: { label: 'EN DIVISAS', value: '~0,9 mes', tone: 'neutral' },
  },
  {
    id: 'ipc',
    label: 'IPC INTERANUAL',
    value: 9.23,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: -3.3,
    deltaLabel: '−3,3 pp',
    sentiment: 'neg',
    // INE, interanual: dic-25 20,40 · ene 19,64 · feb 19,73 · mar 15,05 · abr 14,18 · may 12,51 · jun 9,23
    spark: [20.4, 19.64, 19.73, 15.05, 14.18, 12.51, 9.23],
    source: 'INE · IPC junio 2026',
    asof: '07 jul',
    def: 'Variación del IPC a doce meses (INE). Junio 2026: interanual 9,23%, mensual 2,15%, acumulado 1S 4,82%. La fuerte baja del interanual (desde 12,51% en mayo) es efecto base; la presión mensual sigue en ALIMENTOS por los coletazos de los bloqueos. El Gobierno proyecta ~14% para el cierre de 2026.',
    extra: { label: 'MENSUAL', value: '+2,15%', tone: 'neg' },
  },
  {
    id: 'pib',
    label: 'PIB · VAR. INTERANUAL',
    value: -1.58,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: -2.3,
    deltaLabel: '−2,3 pp a/a',
    sentiment: 'neg',
    // INE, var. interanual por trimestre: Q1-24 1,31 · Q2-24 2,58 · Q4-24 −2,60 · 1S-25 −2,40 · Q3-25 0,03 · Q4-25 −1,14 · año-25 −1,58
    spark: [1.31, 2.58, 2.14, -2.6, -2.4, 0.03, -1.14, -1.58],
    source: 'INE · cuentas nac.',
    asof: '2025',
    def: 'PIB real (INE): contracción de −1,58% en 2025 (4T −1,14%), vs +0,73% en 2024. El FMI proyecta −3,3% para 2026. Por sector 2025: agropecuario +6,7%, extractivas (gas/minería) −4,3%, construcción −13,6%, financiero −3,5%.',
  },
  {
    id: 'gas',
    label: 'GAS NATURAL · mm³/d',
    value: 27.34,
    fmt: (v) => v.toFixed(1),
    delta: -5.9,
    deltaLabel: '−5,9% a/a',
    sentiment: 'neg',
    // YPFB: 2024 prom. 31,7 · jul-25 29,06 · dic-25 27,34 (anual/trimestral; sin serie mensual oficial)
    spark: [31.7, 31.0, 30.2, 29.3, 28.7, 29.06, 27.34],
    source: 'YPFB · RPC',
    asof: 'dic 2025',
    def: 'Producción de gas natural: 27,34 mm³/d a dic-2025 (29,06 en jul-2025; 2024 promedió 31,7) — en declive estructural. Las EXPORTACIONES de gas cayeron −39,8% a/a (USD 283,8 M ene–may 2026). Reservas certificadas ~3,7 TCF; la prensa ya proyecta a Bolivia como importador.',
  },
  {
    id: 'fiscal',
    label: 'BALANCE FISCAL · %PIB',
    value: -12.2,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: -2.1,
    deltaLabel: '−2,1 pp',
    sentiment: 'neg',
    // déficit SPNF anual (MEFP): 2021 −9,3 · 2022 −7,2 · 2023 −10,9 · 2024 −10,1 · 2025 −12,2
    spark: [-9.3, -7.2, -10.9, -10.1, -12.2],
    source: 'MEFP · TGN',
    asof: 'cierre 2025',
    def: 'Déficit del SPNF: −12,2% del PIB en 2025 (vs −10,1% en 2024), el mayor desde la pandemia. El PGE 2026 reformulado fija una meta de −9,2% del PIB; el FMI y el Gobierno lo señalan como el ancla del ajuste.',
  },
  {
    id: 'deuda_externa',
    label: 'DEUDA EXTERNA · %PIB',
    value: 24.3,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: -0.5,
    deltaLabel: '−0,5 pp',
    sentiment: 'neg',
    // dato corroborado: 24,3% a mar-2026 (BCB DEPEX); puntos previos indicativos
    spark: [25.0, 24.9, 24.8, 24.6, 24.4, 24.3],
    source: 'BCB · DEPEX',
    asof: 'may 2026',
    def: 'Deuda externa pública: USD 14.418,1 M a mayo-2026 (+988 M vs marzo por la emisión de bonos soberanos). El último % del PIB oficial es 24,3% (marzo); a mayo el BCB lo cifra en torno a ¼ del PIB. La deuda pública total ronda ~45% del PIB.',
    extra: { label: 'STOCK', value: '$14.418 M', tone: 'neutral' },
  },
  {
    id: 'salario_minimo',
    label: 'SALARIO MÍNIMO · Bs',
    value: 3300,
    fmt: (v) => v.toLocaleString('es-BO'),
    delta: +20,
    deltaLabel: '+20%',
    sentiment: 'pos',
    // Bs 2.750 (2025) → Bs 3.300 (+20%) desde ene-2026
    spark: [2750, 2750, 2750, 2750, 2750, 2750, 3300, 3300, 3300, 3300, 3300, 3300],
    source: 'Min. Trabajo · RM 088/26',
    asof: 'ene 2026',
    def: 'Salario mínimo nacional: Bs 3.300, +20% vs Bs 2.750 de 2025, vigente desde enero (DS 5516 / RM 088/26).',
  },
];

// Adjunta a cada KPI su cadencia real (periodicidad) y su SERIE HISTÓRICA fechada
// real y validada (src/data/series.ts). El sparkline corto de las tarjetas se deriva
// de esa misma serie, así tarjeta y modal son siempre coherentes.
export const KPIS: Kpi[] = RAW_KPIS.map((k) => {
  const h = HISTORY[k.id];
  return h && h.length
    ? { ...k, periodicidad: PERIODICIDAD[k.id], history: h, spark: sparkFrom(h) }
    : { ...k, periodicidad: PERIODICIDAD[k.id] };
});

// ─────────────────────────────────────────────────────────────────────
// MÓDULO B — Bloqueos (ABC · transitabilidad RVF, junio 2026)
// Conteo real ABC: 78 (6-jun) → 93 (8-jun, pico) → 79 (9) → 77 (13) → 68 (14) →
// 52 (15). Abajo: MUESTRA georreferenciada representativa de 22 puntos reales
// (coords aprox. de la localidad/tramo), con concentración occidente andino +
// Chapare. Liderazgo: cocaleros del trópico, COB, Túpac Katari, afines a Evo.
// Ver docs/SOURCES.md.
// ─────────────────────────────────────────────────────────────────────
export const BLOQUEOS: Bloqueo[] = [
  { id: 'b1', dept: 'Cochabamba', ruta: 'Ruta 4 (corredor Cochabamba–Santa Cruz, tramo trópico)', km: 'Chimoré – Villa Tunari (trópico/Chapare)', lon: -65.13, lat: -16.87, sector: 'Seis Federaciones del Trópico (cocaleros afines a Evo Morales)', motivo: 'Exigir la renuncia de Rodrigo Paz; rechazo al Estado de Excepción', dia: 36, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b2', dept: 'Cochabamba', ruta: 'Ruta 4 (Cochabamba–Santa Cruz, tramo Colomi–Sacaba)', km: 'Sacaba · cruce Tiraque (Colomi–Sacaba)', lon: -66.04, lat: -17.4, sector: 'Cocaleros / sectores afines a Evo Morales', motivo: 'Bloqueo por renuncia de Rodrigo Paz', dia: 41, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b3', dept: 'Cochabamba', ruta: 'Ruta 4 (Cochabamba–Oruro, sector Parotani)', km: 'Parotani – Llavini', lon: -66.36, lat: -17.55, sector: 'Mineros / sectores movilizados', motivo: 'Medida de presión; renuncia de Paz', dia: 39, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b4', dept: 'Cochabamba', ruta: 'Ruta 4 (Cochabamba–Oruro, sector El Confital)', km: 'Confital · sector Japo Kasa', lon: -66.78, lat: -17.62, sector: 'Sectores afines a Evo Morales / campesinos', motivo: 'Bloqueo por renuncia de Paz', dia: 40, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b5', dept: 'Cochabamba', ruta: 'Ruta departamental Independencia–Tiquipaya (valle)', km: 'Independencia – Tiquipaya', lon: -66.81, lat: -17.07, sector: 'Campesinos / sectores movilizados', motivo: 'Medida de presión por renuncia de Paz', dia: 39, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b6', dept: 'Cochabamba', ruta: 'Ruta del valle alto Tarata–Anzaldo', km: 'Tarata – Anzaldo', lon: -66.02, lat: -17.61, sector: 'Campesinos del valle / afines a Evo', motivo: 'Bloqueo por renuncia de Paz', dia: 38, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b7', dept: 'Cochabamba', ruta: 'Ruta 4 (límite interdepartamental Oruro–Cochabamba)', km: 'Límite Oruro–Cochabamba · sector Tukiña', lon: -66.95, lat: -17.68, sector: 'Sectores movilizados afines a Evo', motivo: 'Medida de presión; renuncia de Paz', dia: 38, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b8', dept: 'La Paz', ruta: 'Ruta 19 / corredor a frontera Perú (Desaguadero)', km: 'Desaguadero – Patamanta', lon: -68.66, lat: -16.56, sector: 'COB / juntas vecinales / afines a Evo', motivo: 'Exigir la renuncia de Rodrigo Paz', dia: 36, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b9', dept: 'La Paz', ruta: 'Ruta 1 · carretera La Paz–Oruro', km: 'Patacamaya – Sica Sica · La Huachaca', lon: -67.92, lat: -17.25, sector: 'Confederación Túpac Katari / campesinos', motivo: 'Bloqueo por renuncia de Paz', dia: 40, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b10', dept: 'La Paz', ruta: 'Ruta hacia Colquiri (zona minera)', km: 'Alcantarilla – Colquiri', lon: -67.34, lat: -17.36, sector: 'Mineros / sectores afines a Evo', motivo: 'Medida de presión; renuncia de Paz', dia: 39, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b11', dept: 'La Paz', ruta: 'Ruta altiplánica Tiwanaku–Guaqui (hacia Desaguadero)', km: 'Tiwanaku – Guaqui', lon: -68.78, lat: -16.59, sector: 'Túpac Katari / campesinos del altiplano', motivo: 'Bloqueo por renuncia de Paz', dia: 37, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b12', dept: 'La Paz', ruta: 'Salidas de El Alto hacia Laja / Copacabana', km: 'Alto Lima – Río Seco (El Alto)', lon: -68.2, lat: -16.49, sector: 'Juntas vecinales / COB / afines a Evo', motivo: 'Bloqueo y disturbios; renuncia de Paz', dia: 34, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b13', dept: 'La Paz', ruta: 'Ruta 1 · sector Panduro (La Paz–Oruro)', km: 'Luribay – límite La Paz/Oruro · Panduro', lon: -67.55, lat: -17.42, sector: 'Campesinos / sectores movilizados', motivo: 'Medida de presión por renuncia de Paz', dia: 38, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b14', dept: 'Oruro', ruta: 'Ruta 1 y Ruta 0052 (Oruro–La Paz / Caihuasi)', km: 'Caracollo · marcha por la vida (San Andrés)', lon: -67.2, lat: -17.69, sector: 'Sectores evistas / mineros / COD Oruro', motivo: 'Exigir la renuncia de Paz', dia: 42, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b15', dept: 'Oruro', ruta: 'Ruta 1 · Oruro–Potosí (sector Challapata)', km: 'Challapata – Crucero · Aguas Calientes', lon: -66.77, lat: -18.9, sector: 'Campesinos / sectores afines a Evo', motivo: 'Bloqueo por renuncia de Paz', dia: 39, severidad: 'alta', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b16', dept: 'Oruro', ruta: 'Ruta 0052 / Ruta 1 (norte de Oruro)', km: 'Paria – Caihuasi · Ocatavi / Lequepalca', lon: -67.1, lat: -17.85, sector: 'Sectores movilizados afines a Evo', motivo: 'Medida de presión; renuncia de Paz', dia: 39, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b17', dept: 'Potosí', ruta: 'Ruta hacia el norte de Potosí', km: 'Puente Río Colorado – Chakapuco', lon: -66.3, lat: -19.3, sector: 'Cooperativistas mineros / sectores movilizados', motivo: 'Medida de presión por renuncia de Paz', dia: 36, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b18', dept: 'Potosí', ruta: 'Ruta 5 / acceso a la ciudad de Potosí (Tarapaya)', km: 'Yocalla – Tarapaya', lon: -65.85, lat: -19.5, sector: 'Sectores movilizados afines a Evo', motivo: 'Bloqueo por renuncia de Paz', dia: 36, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b19', dept: 'Potosí', ruta: 'Ruta 14 · sur de Potosí (hacia Tarija)', km: 'Vitichi – Totoca', lon: -65.48, lat: -20.48, sector: 'Campesinos / sectores movilizados', motivo: 'Medida de presión; renuncia de Paz', dia: 35, severidad: 'baja', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b20', dept: 'Chuquisaca', ruta: 'Ruta 6 · Sucre–Tarabuco–Zudáñez', km: 'Yamparáez – Tarabuco · Montera', lon: -64.92, lat: -19.18, sector: 'Campesinos / sectores afines a Evo', motivo: 'Exigir la renuncia de Paz', dia: 37, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b21', dept: 'Santa Cruz', ruta: 'Ruta 4 · corredor Cochabamba–Santa Cruz (puente Ichilo)', km: 'San Germán · cercanías al Puente Ichilo', lon: -64.3, lat: -17.42, sector: 'Sectores movilizados afines a Evo', motivo: 'Bloqueo en frontera departamental; renuncia de Paz', dia: 34, severidad: 'media', fuente: 'ABC · transitabilidad RVF' },
  { id: 'b22', dept: 'Santa Cruz', ruta: 'Ruta 4 / Ruta 9 · Santa Cruz–Trinidad (San Julián)', km: 'Los Troncos – Núcleo I (San Julián)', lon: -62.5, lat: -17.1, sector: 'Sectores movilizados / interculturales', motivo: 'Medida de presión por renuncia de Paz', dia: 33, severidad: 'baja', fuente: 'ABC · transitabilidad RVF' },
];

// Conteo real ABC (transitabilidad RVF). Los 22 puntos de arriba son la muestra
// georreferenciada del conflicto (mayo–jun 2026), ya resuelto. Ver docs/SOURCES.md.
export const BLOQUEOS_INFO = {
  asof: '24 jun 2026',
  total: 0,
  pico: 93,
  picoFecha: '8 jun',
  tendencia: 'baja' as const,
  fuente: 'ABC · transitabilidad RVF',
  nota: 'Conflicto resuelto: la ABC declaró las carreteras libres de bloqueos el 23-jun, tras 54 días (acuerdo Gobierno–COB del 19-jun + estado de excepción del 20-jun). El Trópico de Cochabamba (Evo) declaró un cuarto intermedio.',
};

// ─────────────────────────────────────────────────────────────────────
// MÓDULO C — Mercados (revisados, jun 2026)
// ─────────────────────────────────────────────────────────────────────
export const MERCADOS: Mercados = {
  bonos: [
    { id: 'BOL28', name: 'BOL 4.50% 2028', price: 94.88, yield: 7.68, spread: 368, chg: +0.53 },
    { id: 'BOL31', name: 'BOL 9.45% 2031', price: 96.6, yield: 10.3, spread: 640, chg: -0.5 },
  ],
  embi: {
    value: 425,
    chg: -19,
    series: sparkFrom(HISTORY['embi']),
  },
  cds5y: { value: null, chg: 0, note: 'sin mercado público líquido' },
  ratings: [
    { agencia: 'Moody’s', rating: 'Caa3', outlook: 'Positivo', actualizado: 'mar 2026' },
    { agencia: 'S&P', rating: 'CCC+', outlook: 'Estable', actualizado: 'mar 2026' },
    { agencia: 'Fitch', rating: 'CCC', outlook: '—', actualizado: 'ene 2026' },
  ],
  reservas: { oro: 77, divisas: 22, deg: 1 },
};

// ─────────────────────────────────────────────────────────────────────
// MÓDULO Externo & Deuda (datos oficiales, jun 2026)
// ─────────────────────────────────────────────────────────────────────
export const EXTERNO: ExternoData = {
  // precios al 16-17 jul-2026 (Trading Economics). polarity 'up' = mayor precio favorece a Bolivia.
  commodities: [
    { id: 'oro', label: 'Oro', value: 4016.95, unit: 'USD/oz', chgMensual: -4.59, chgAnual: 19.87, polarity: 'up', source: 'Trading Economics', asof: '17 jul' },
    { id: 'plata', label: 'Plata', value: 55.9, unit: 'USD/oz', chgMensual: -14.86, chgAnual: 46.45, polarity: 'up', source: 'Trading Economics', asof: '17 jul' },
    { id: 'zinc', label: 'Zinc', value: 3524.6, unit: 'USD/t', chgMensual: -3.19, chgAnual: 24.79, polarity: 'up', source: 'Trading Economics', asof: '17 jul' },
    { id: 'estano', label: 'Estaño', value: 53156, unit: 'USD/t', chgMensual: -3.95, chgAnual: 61.01, polarity: 'up', source: 'Trading Economics', asof: '16 jul' },
    { id: 'gas_hh', label: 'Gas natural (Henry Hub)', value: 2.91, unit: 'USD/MMBtu', chgMensual: -9.96, chgAnual: -18.35, polarity: 'none', source: 'Trading Economics', asof: '17 jul', nota: 'referencia EE.UU.' },
    { id: 'soya', label: 'Soya', value: 12.05, unit: 'USD/bushel', chgMensual: 7.28, chgAnual: 17.2, polarity: 'up', source: 'Trading Economics', asof: '17 jul' },
  ],
  deuda: { externaStock: 14418.1, externaPct: 24.3, totalPct: 45.1, asof: 'may 2026', source: 'BCB · DEPEX' },
  balanza: { exportaciones: 720, importaciones: 683, saldo: 37, periodo: 'mayo 2026', source: 'INE' },
  combustibles: {
    especial: 6.96, premium: 11.0, diesel: 9.8,
    nota: 'Precios congelados por DS 5652 (9-jul-2026); factor de ajuste ligado al TC: subvención estatal sólo si el TCO supera Bs 10,40 (hoy 10,85, activa). El DS 5644 abrió la importación privada a precio de mercado.',
    source: 'ANH · DS 5652',
  },
  servicio: { y2026: 2007, y2027: 1670, y2028: 1945, source: 'BCB · DEPEX' },
  analitica: {
    gasExportUsd: 283.8, gasExportPeriodo: 'ene–may 2026', gasExportVar: -39.8,
    ccPct: -2.1, ccUsd: -1218, ccPeriodo: '2025',
    remesasUsd: 1259, remesasPeriodo: '2025',
    bolivianizacion: 90, bolivPeriodo: 'mar 2026',
    finMonetarioFlujo: 5894, finMonetarioProg: 826, finMonetarioPeriodo: 'ene–abr 2026',
    fmiEstado: 'En negociación', fmiMonto: 3000,
    fmiNota: 'Programa EFF. Misión en La Paz (17-18 jul) reunida con Gobierno y empresarios; sin acuerdo firmado. Monto en discusión ~USD 3.000-3.300 M (Paz mencionó hasta 5.000). Condiciones: reducir déficit, unificación cambiaria (ya en marcha) y reforma de subvención a combustibles. Nota: la cuenta corriente giró a superávit (+USD 783 M) en 1T-2026.',
    source: 'BCB · INE · MEFP · FMI (vía prensa)',
  },
};

// ─────────────────────────────────────────────────────────────────────
// MÓDULO G — Monitor cambiario (metadatos del régimen flexible)
// Las cotizaciones vivas salen de los KPIs usdbob_* y sus series diarias
// (src/data/series.ts); esto aporta régimen, cronología y lectura.
// ─────────────────────────────────────────────────────────────────────
export const CAMBIARIO: CambiarioData = {
  fijoValor: 6.96,
  fijoDesde: 'nov-2011',
  flexDesde: '29-jun-2026',
  reglas: [
    'El BCB publica el TCO cada día hábil a las 20:00, vigente la jornada siguiente.',
    'TCO = promedio ponderado de las compras de dólares de la banca (00:00–17:00).',
    'El precio de venta al público tiene tope en el TCO + Bs 0,10.',
    'Sustituye al esquema de oficial fijo (Bs 6,96) + dólar referencial: unifica el mercado.',
  ],
  hitos: [
    { etiqueta: '26 jun', titulo: 'RM 245: fin del tipo de cambio fijo de Bs 6,96 (vigente desde 2011)', tono: 'neg' },
    { etiqueta: '29 jun', titulo: 'Arranca el TCO flexible en Bs 9,73; el referencial de venta pasa a TCO + Bs 0,10', tono: 'accent' },
    { etiqueta: '09 jul', titulo: 'El TCO supera Bs 10 por primera vez en la cotización oficial', tono: 'neg' },
    { etiqueta: '13 jul', titulo: 'DS 5652: congela combustibles y ata el subsidio al umbral de Bs 10,40', tono: 'neutral' },
    { etiqueta: '17 jul', titulo: 'Misión del FMI en La Paz; el TCO cierra la semana en Bs 10,85', tono: 'accent' },
  ],
  umbralCombustible: 10.4003,
  presion: {
    rinTotal: 4547,
    rinLiquidas: 898,
    rinEfectivaJul: 3600,
    rinLiquidasJul: 671,
    coberturaDivisas: '~0,9 mes',
    nota: 'RIN 31-may: USD 4.547 M, pero ~79% es oro y solo ~USD 898 M son divisas líquidas. El Programa Monetario del BCB registra un drenaje de ~USD 525 M en junio (combustibles, intervención y deuda): la RIN efectiva de julio se estima en ~USD 3.600 M con ~USD 671 M líquidos. Es la raíz de la presión al alza del TCO.',
  },
  lectura: [
    {
      titulo: 'Es unificación, no flotación limpia',
      texto: 'El TCO sinceró el oficial y cerró la brecha con el paralelo (de ~42% a ≈0), pero el BCB mantiene un tope de venta (TCO + Bs 0,10): sigue siendo un tipo de cambio administrado, no una flotación libre.',
    },
    {
      titulo: 'El traspaso a precios es el riesgo a vigilar',
      texto: 'El oficial se depreció ~56% frente al viejo fijo. El IPC interanual bajó a 9,2% en junio por efecto base, pero un TCO que sigue subiendo presiona el precio de los importados: el pass-through es el principal riesgo inflacionario del segundo semestre.',
    },
    {
      titulo: 'La subvención de combustibles ahora es variable',
      texto: 'El DS 5652 fija que el Estado solo subsidia cuando el TCO supera Bs 10,40 (umbral ya cruzado). El diferencial de importación lo cubre el TGN (hasta Bs 1.000 M) y se habilitó importación privada a precio de mercado: el subsidio dejó de ser un precio fijo para volverse una cuña fiscal que crece con el dólar.',
    },
    {
      titulo: 'El ancla que falta es el FMI',
      texto: 'La unificación cambiaria es una de las condiciones del programa EFF en negociación (~USD 3.000-3.300 M). Sin ese desembolso y con divisas líquidas por debajo de USD 1.000 M, la presión sobre el TCO es estructural, no coyuntural.',
    },
  ],
  source: 'BCB · MEFP · INE · FMI (vía prensa) · elaboración propia',
};

// ─────────────────────────────────────────────────────────────────────
// MÓDULO D — Feed de noticias (titulares reales jun–jul 2026)
// ─────────────────────────────────────────────────────────────────────
export const NOTICIAS: Noticia[] = [
  {
    id: 'n38', t: '−1d', mins: 1560, fuente: 'La Razón', tag: 'Económico',
    titular: 'Lupo: un acuerdo con el FMI es clave para resolver el déficit fiscal',
    resumen: 'El ministro de la Presidencia, José Luis Lupo, afirmó que un acuerdo con el FMI será determinante para enfrentar el déficit; el problema central, dijo, es el déficit financiado con recursos del BCB, que alimenta la inflación.',
    breaking: true,
    url: 'https://larazon.bo/economia-y-empresa/2026/07/18/lupo-senala-que-un-acuerdo-con-el-fmi-es-clave-para-resolver-el-deficit-fiscal/',
    body: 'Las declaraciones llegan mientras la misión del Fondo cierra su visita a La Paz. El Gobierno anticipa "novedades en las próximas semanas" sobre el programa de financiamiento.',
    keywords: ['FMI', 'déficit fiscal', 'Lupo'],
    relacionados: [],
  },
  {
    id: 'n37', t: '−2d', mins: 2820, fuente: 'Resumen Latinoamericano', tag: 'Económico',
    titular: 'La misión del FMI se reúne con empresarios en La Paz mientras negocia con el Gobierno',
    resumen: 'Una misión del FMI se reunió con las principales cámaras empresariales para evaluar el desempeño económico y el clima de inversión, en paralelo a la negociación de un paquete de apoyo financiero con el Ejecutivo.',
    breaking: false,
    url: 'https://www.resumenlatinoamericano.org/2026/07/17/bolivia-en-medio-de-las-negociaciones-con-el-gobierno-el-fmi-se-reune-con-empresarios-en-la-paz',
    body: 'Las reuniones se dan en el marco de un programa EFF en discusión. El Gobierno insiste en que un acuerdo con el Fondo es clave para financiar el déficit y anclar la estabilidad del nuevo régimen cambiario.',
    keywords: ['FMI', 'empresarios', 'EFF'],
    relacionados: [],
  },
  {
    id: 'n36', t: '−2d', mins: 3120, fuente: 'Los Tiempos', tag: 'Económico',
    titular: 'Bolivia se acerca a un escenario crítico: importar gas costaría diez veces más que el precio interno',
    resumen: 'Según la Fundación Jubileo, la producción de gas cayó ~55% en once años y el Estado subvenciona el 79% del costo interno; si Bolivia pasa de exportador a importador pagaría USD 14-18/MMBTU frente a ~USD 1,30 internos.',
    breaking: false,
    url: 'https://www.lostiempos.com/actualidad/economia/20260717/bolivia-se-acerca-escenario-critico-importar-gas-costaria-10-veces-mas',
    body: 'El informe alerta que la transición de exportador a importador de gas golpearía las cuentas fiscales y externas justo cuando el país enfrenta escasez de dólares y un nuevo régimen cambiario.',
    keywords: ['gas', 'YPFB', 'subvención', 'importación'],
    relacionados: ['Gas natural'],
  },
  {
    id: 'n35', t: '−3d', mins: 3900, fuente: 'Infobae', tag: 'Económico',
    titular: 'El dólar de mercado sigue subiendo en Bolivia y se aleja del viejo oficial de Bs 6,96',
    resumen: 'En la jornada del 16 de julio el dólar de mercado escaló en torno a Bs 10,6 (cerca de +9% en la semana), mientras el TCO del BCB rondaba Bs 10,7-10,9; el histórico oficial de 6,96 quedó prácticamente sin uso.',
    breaking: false,
    url: 'https://www.infobae.com/noticias/2026/07/16/dolar-hoy-en-bolivia-cotizacion-de-cierre-del-16-de-julio/',
    body: 'La cotización de mercado y el TCO oficial se mueven casi en paralelo, confirmando la unificación cambiaria. La demanda de dólares sigue firme por la escasez de divisas líquidas en las reservas.',
    keywords: ['dólar', 'TCO', 'tipo de cambio flexible'],
    relacionados: ['USD/BOB oficial'],
  },
  {
    id: 'n34', t: '−6d', mins: 8340, fuente: 'El Diario', tag: 'Social',
    titular: 'Disminuyen las filas por gasolina, pero la escasez de diésel continúa en el país',
    resumen: 'La gasolina empezó a normalizarse en varias ciudades, pero el diésel seguía escaso con largas filas de transporte pesado y esperas de hasta una semana, calificadas de "críticas" por los dirigentes.',
    breaking: false,
    url: 'https://www.eldiario.net/portal/2026/07/13/filas-por-gasolina-disminuyen-pero-la-escasez-de-diesel-continua-en-el-pais/',
    body: 'La apertura a la importación privada aún no se traduce en abastecimiento pleno de diésel, el combustible clave para el agro y el transporte de carga. El desabastecimiento presiona costos logísticos y precios de alimentos.',
    keywords: ['diésel', 'combustibles', 'escasez'],
    relacionados: [],
  },
  {
    id: 'n33', t: '−6d', mins: 8820, fuente: 'Infobae', tag: 'Económico',
    titular: 'Bolivia congela el precio de los combustibles por seis meses en medio de la crisis de abastecimiento',
    resumen: 'El DS 5652 congela diésel, gasolina, gas natural y combustible de aviación hasta enero de 2027 y destina hasta Bs 1.000 millones a YPFB para cubrir el diferencial de importación, buscando aislar al consumidor de la devaluación.',
    breaking: true,
    url: 'https://www.infobae.com/america/2026/07/13/bolivia-congela-el-precio-del-combustible-por-seis-meses-en-medio-de-la-crisis-de-abastecimiento-y-calidad/',
    body: 'El decreto introduce un factor de ajuste ligado al tipo de cambio: el Estado subvenciona sólo cuando el TCO oficial supera Bs 10,40. Con el oficial en ~10,85, la subvención sigue activa.',
    keywords: ['combustibles', 'DS 5652', 'subvención', 'YPFB'],
    relacionados: [],
  },
  {
    id: 'n32', t: '−13d', mins: 18600, fuente: 'Bloomberg Línea', tag: 'Económico',
    titular: 'Adiós al dólar referencial: así funciona el nuevo tipo de cambio flexible en Bolivia',
    resumen: 'El BCB calcula un TCO diario según el promedio ponderado de compras de la banca y lo publica cada tarde; los bancos no pueden vender por encima del TCO + Bs 0,10. Economistas advierten que es un esquema administrado, no una flotación limpia.',
    breaking: false,
    url: 'https://www.bloomberglinea.com/latinoamerica/bolivia/adios-al-dolar-referencial-en-bolivia-asi-funcionara-ahora-el-nuevo-tipo-de-cambio-flexible/',
    body: 'El nuevo régimen unifica el antiguo oficial fijo (6,96) y el referencial en un solo tipo de cambio de mercado. En su primera semana el TCO subió de 9,73 a 9,83 y la brecha con el paralelo se redujo a menos del 1%.',
    keywords: ['tipo de cambio flexible', 'BCB', 'TCO'],
    relacionados: ['USD/BOB oficial'],
  },
  {
    id: 'n31', t: '−13d', mins: 18780, fuente: 'Correo del Sur', tag: 'Económico',
    titular: 'Las exportaciones de gas caen US$ 187,5 millones entre enero y mayo, según el INE',
    resumen: 'Las ventas de gas pasaron de US$ 471,3 M (ene-may 2025) a US$ 283,8 M (ene-may 2026), una caída de ~40%, en línea con la nueva y menor certificación de reservas de YPFB.',
    breaking: false,
    url: 'https://correodelsur.com/economia/20260707/ingresos-del-gas-caen-en-187-5-millones-de-dolares.html',
    body: 'El desplome confirma el declive estructural del principal generador histórico de divisas del país. La caída de volúmenes y de mercados de exportación agrava la escasez de dólares y refuerza la urgencia de diversificar.',
    keywords: ['gas', 'exportaciones', 'INE'],
    relacionados: ['Gas natural'],
  },
  {
    id: 'n30', t: '−13d', mins: 18930, fuente: 'El Día', tag: 'Económico',
    titular: 'La inflación acumulada llega a 4,82% en el primer semestre, con junio al alza por segundo mes',
    resumen: 'El IPC de junio subió 2,15% mensual (interanual ~9,2%), empujado por alimentos —plátano, carne de res y pollo, tomate—. El Gobierno proyecta 14% para el cierre de 2026.',
    breaking: false,
    url: 'https://www.eldia.com.bo/2026-07-06/economia/bolivia-registra-alta-inflacion-por-segundo-mes-consecutivo-y-la-acumulada-en-2026-es-de-482.html',
    body: 'El INE reportó una inflación semestral de 4,82%. La desaceleración del interanual (desde 12,51% en mayo) responde a un efecto base, mientras la presión mensual sigue concentrada en alimentos por los coletazos de los bloqueos.',
    keywords: ['inflación', 'IPC', 'INE', 'alimentos'],
    relacionados: ['IPC interanual'],
  },
  {
    id: 'n29', t: '−15d', mins: 21600, fuente: 'Prensa Mercosur', tag: 'Político',
    titular: 'Los dos bloqueos más largos del siglo en Bolivia terminan sin lograr sus objetivos',
    resumen: 'El bloqueo de 53 días impulsado por la COB y sectores afines a Evo Morales terminó por desgaste sin conseguir la renuncia de Paz; analistas lo atribuyen a una agenda partidaria desconectada de las bases.',
    breaking: false,
    url: 'https://prensamercosur.org/2026/07/04/cuando-el-desgaste-se-impone-los-dos-bloqueos-mas-largos-del-siglo-xxi-en-bolivia-no-lograron-sus-objetivos/',
    body: 'El balance del conflicto que marcó mayo y junio deja pérdidas económicas millonarias y un costo político para sus promotores. El Gobierno capitalizó el desenlace para avanzar en su agenda económica.',
    keywords: ['bloqueos', 'COB', 'Evo Morales'],
    relacionados: [],
  },
  {
    id: 'n28', t: '−17d', mins: 24540, fuente: 'NODAL', tag: 'Político',
    titular: 'El Gobierno aprueba un paquete de siete decretos sobre combustibles, comercio, electricidad, pensiones y minería',
    resumen: 'Paz promulgó siete decretos: importación privada de combustibles (5644), rebaja de aranceles en 5 puntos hasta 2027 (5646), banda eléctrica, manual de pensiones por invalidez y anulación de una reserva minera en Potosí.',
    breaking: false,
    url: 'https://www.nodal.am/2026/07/bolivia-el-gobierno-impuso-un-paquete-de-medidas-economicas-sobre-combustibles-comercio-electricidad-pensiones-y-mineria/',
    body: 'El paquete busca dinamizar el comercio exterior y la oferta interna en plena transición al tipo de cambio flexible. La rebaja arancelaria apunta a contener precios de importados; la apertura de combustibles a paliar la falta de diésel.',
    keywords: ['decretos', 'combustibles', 'aranceles', 'Paz'],
    relacionados: [],
  },
  {
    id: 'n27', t: '−18d', mins: 26040, fuente: 'Visión 360', tag: 'Económico',
    titular: 'Acaba el monopolio: privados podrán importar y vender gasolina y diésel a precio de mercado',
    resumen: 'El DS 5644 autoriza a privados a importar y comercializar combustibles a precio de mercado (IEHD en cero hasta 2030). Empacar Energy ya ofrecía diésel a Bs 15,80 frente a Bs 9,80 de YPFB.',
    breaking: true,
    url: 'https://www.vision360.bo/noticias/2026/07/01/55924-acaba-el-monopolio-privados-competiran-con-ypfb-e-importaran-y-venderan-gasolina-y-diesel-a-precio-de-mercado',
    body: 'La medida rompe el monopolio de YPFB en la importación y venta de derivados para aliviar la escasez. Doria Medina la condicionó y Evo Morales la criticó por exponer al país a la volatilidad de los precios internacionales.',
    keywords: ['combustibles', 'DS 5644', 'YPFB', 'importación privada'],
    relacionados: [],
  },
  {
    id: 'n26', t: '−19d', mins: 27060, fuente: 'Infobae', tag: 'Político',
    titular: 'Rodrigo Paz rechaza el paro judicial y acusa al MAS de fomentar "las viejas prácticas de presión"',
    resumen: 'El presidente calificó las amenazas de paro y bloqueo como "cosas del pasado" ligadas al MAS y pidió que la reforma judicial se debata en el Parlamento por acuerdo, no por presión.',
    breaking: false,
    url: 'https://www.infobae.com/america/america-latina/2026/07/01/rodrigo-paz-rechazo-el-paro-judicial-y-acuso-al-mas-de-fomentar-las-viejas-practicas-de-presion/',
    body: 'Paz enmarcó las movilizaciones anunciadas como parte de una lógica de presión que, dijo, el país debe superar. Reiteró su llamado a canalizar la reforma judicial vía la Asamblea Legislativa mediante un acuerdo nacional.',
    keywords: ['Rodrigo Paz', 'MAS', 'reforma judicial'],
    relacionados: [],
  },
  {
    id: 'n23', t: '−21d', mins: 30480, fuente: 'El Diario', tag: 'Económico',
    titular: 'El Gobierno anuncia medidas de apoyo al sector privado ante el nuevo tipo de cambio flexible',
    resumen: 'Con la entrada en vigor del régimen cambiario flexible, el Ejecutivo prepara apoyo financiero, menos trámites e incentivos al sector privado y a las familias emprendedoras.',
    breaking: false,
    url: 'https://www.eldiario.net/portal/2026/06/28/gobierno-anuncia-medidas-de-apoyo-al-sector-privado/',
    body: 'El Gobierno sostiene que la flexibilización dinamizará el sector externo —exportaciones, remesas, inversión y repatriación de capitales— y anunció un paquete de reactivación para acompañar la transición, a detallarse la próxima semana junto al plan para los sectores más golpeados por los bloqueos.',
    keywords: ['tipo de cambio flexible', 'reactivación', 'sector privado'],
    relacionados: ['USD/BOB oficial'],
  },
  {
    id: 'n24', t: '−21d', mins: 30600, fuente: 'Erbol', tag: 'Político',
    titular: 'Evo dice que el dólar flexible es "la receta del FMI" para devaluar al boliviano',
    resumen: 'Morales calificó la flexibilización cambiaria como una imposición del FMI que devaluará la moneda; advirtió sobre libre importación de combustibles y "otro gasolinazo", pero no convocó nuevos bloqueos.',
    breaking: false,
    url: 'https://www.erbol.com.bo/nacional/evo-dice-que-d%C3%B3lar-flexible-es-la-receta-del-fmi-para-devaluar-al-boliviano',
    body: 'Desde el Trópico de Cochabamba, Evo Morales cuestionó el nuevo régimen cambiario como una "receta del FMI" y a la dirigencia de la COB por avalar el acuerdo que habilitó el estado de excepción. El cuarto intermedio de las movilizaciones sigue vigente; Morales no convocó a nuevos cortes de ruta.',
    keywords: ['Evo Morales', 'FMI', 'devaluación', 'tipo de cambio'],
    relacionados: ['USD/BOB oficial'],
  },
  {
    id: 'n25', t: '−23d', mins: 33750, fuente: 'Visión 360', tag: 'Económico',
    titular: 'Bolivia pone fin al tipo de cambio fijo: el dólar oficial será flexible desde el lunes, con un TCO de Bs 9,73',
    resumen: 'El Gobierno (RM 245) y el BCB abandonan el tipo de cambio fijo vigente desde 2011 y adoptan un régimen flexible: el oficial se calculará a diario según el mercado, arrancando el 29-jun en Bs 9,73.',
    breaking: true,
    url: 'https://www.vision360.bo/noticias/2026/06/26/55249-este-lunes-bolivia-iniciara-de-forma-oficial-el-regimen-cambiario-flexible-del-dolar-con-un-tipo-de-cambio-de-bs-9_73',
    body: 'El BCB publicará el Tipo de Cambio Oficial cada día hábil a las 20:00 (para la jornada siguiente), como promedio ponderado de las compras de dólares de la banca; el referencial de venta será el TCO más Bs 0,10. La medida acerca el oficial al paralelo (~Bs 9,88) y, de hecho, unifica el tipo de cambio. El vicepresidente Edman Lara advirtió que, sin medidas de acompañamiento, podría acelerar la inflación.',
    keywords: ['tipo de cambio flexible', 'BCB', 'TCO', 'unificación cambiaria'],
    relacionados: ['USD/BOB oficial', 'Brecha cambiaria'],
  },
  {
    id: 'n20', t: '−2d', mins: 3000, fuente: 'El Diario', tag: 'Social',
    titular: 'El Gobierno finaliza el puente aéreo tras la reapertura de las carreteras',
    resumen: 'Con las vías despejadas y el transporte terrestre normalizándose, el Ejecutivo cierra el puente aéreo que abasteció de insumos críticos durante los bloqueos.',
    breaking: false,
    url: 'https://www.eldiario.net/portal/2026/06/26/gobierno-finaliza-el-puente-aereo/',
    body: 'El cierre del puente aéreo —que durante el conflicto trasladó alimentos, medicamentos y oxígeno medicinal a zonas aisladas— marca la normalización del abastecimiento tras la reapertura de la Red Vial Fundamental. Persisten trabajos de limpieza de escombros en Cochabamba, La Paz y Oruro.',
    keywords: ['puente aéreo', 'abastecimiento', 'normalización'],
    relacionados: ['Bloqueos · transitabilidad RVF'],
  },
  {
    id: 'n21', t: '−3d', mins: 3840, fuente: 'El Deber', tag: 'Económico',
    titular: 'El Gobierno ratifica que no subirá el precio de los combustibles y que hay dólares para comprarlos',
    resumen: 'El ministro de Economía Gabriel Espinoza descarta un alza de combustibles y desmiente falta de divisas; cifra las RIN en torno a US$4.900 M y prevé normalizar los surtidores.',
    breaking: false,
    url: 'https://eldeber.com.bo/pais/gobierno-ratifica-no-subira-precio-combustibles-hay-dolares-compra_1782407329',
    body: 'Espinoza afirmó que "no es un tema de falta de dólares para pagar" y que el BCB cuenta con más de US$700 M en efectivo, con RIN cerca de US$4.900 M. Las colas en surtidores persistían tres días después del fin de los bloqueos; el Gobierno esperaba regularizar el abastecimiento entre la noche del 25 y el 26 de junio. El precio de los carburantes se mantiene sin cambios.',
    keywords: ['combustibles', 'dólares', 'RIN', 'Espinoza'],
    relacionados: ['RIN · BCB'],
  },
  {
    id: 'n22', t: '−3d', mins: 3930, fuente: 'La Patria', tag: 'Económico',
    titular: 'La Paz presenta un plan de reactivación tras pérdidas por US$520 millones por los bloqueos',
    resumen: 'El municipio paceño plantea un plan en tres fases con rutas alternativas y garantías de combustible y alimentos, tras 51 días de bloqueos que costaron unos US$520 millones a la región.',
    breaking: false,
    url: 'https://lapatria.bo/dinero-negocios/economia/plan-reactivacion-economica/',
    body: 'La Asamblea de la Paceñidad fue convocada para presentar el plan de reactivación económica de La Paz, con corredores alternativos hacia los Valles, Cochabamba y el norte paceño, y medidas para asegurar combustible, alimentos y oxígeno medicinal. Es parte de los planes de reactivación que distintas regiones impulsan tras el desenlace del conflicto.',
    keywords: ['reactivación', 'La Paz', 'pérdidas', 'bloqueos'],
    relacionados: ['Bloqueos · Red Vial Fundamental'],
  },
  {
    id: 'n14', t: '−4d', mins: 5770, fuente: 'Infobae', tag: 'Político',
    titular: 'Rodrigo Paz ratifica el estado de excepción pese al levantamiento de los bloqueos en Bolivia',
    resumen: 'El presidente mantiene la medida tras el fin de los bloqueos —"tenemos muchas cosas que ordenar"— y convoca a una cumbre de unidad nacional para reactivar la economía.',
    breaking: true,
    url: 'https://www.infobae.com/america/america-latina/2026/06/24/rodrigo-paz-ratifica-el-estado-de-excepcion-pese-al-levantamiento-de-los-bloqueos-en-bolivia/',
    body: 'Pese al levantamiento de los bloqueos, Rodrigo Paz ratificó el estado de excepción para prevenir nuevas protestas mientras se reactiva la economía, golpeada por pérdidas estimadas entre USD 2.500 y 3.000 millones durante el conflicto.',
    keywords: ['Estado de excepción', 'Rodrigo Paz', 'reactivación', 'unidad nacional'],
    relacionados: ['Bloqueos · transitabilidad RVF'],
  },
  {
    id: 'n15', t: '−4d', mins: 5850, fuente: 'Red Uno', tag: 'Económico',
    titular: 'Nueva baja del dólar referencial: el BCB lo cotiza en Bs 9,76 compra y Bs 9,96 venta',
    resumen: 'El Valor Referencial del Dólar encadena su tercer día por debajo de Bs 10, en línea con el repliegue del paralelo a Bs 9,90 y la brecha cediendo a ~42%.',
    breaking: false,
    url: 'https://www.reduno.com.bo/economia/nueva-baja-del-dolar-referencial-asi-cotiza-este-miercoles-segun-el-bcb-202662492015',
    body: 'El Banco Central de Bolivia reportó una nueva baja del dólar referencial (VRD): Bs 9,76 a la compra y Bs 9,96 a la venta, tercer día consecutivo bajo Bs 10. El mercado paralelo P2P operaba en torno a Bs 9,90, con la brecha cambiaria cediendo a ~42,2%.',
    keywords: ['VRD', 'BCB', 'dólar paralelo', 'brecha cambiaria'],
    relacionados: ['USD/BOB paralelo', 'Brecha cambiaria'],
  },
  {
    id: 'n17', t: '−5d', mins: 6796, fuente: 'Infobae', tag: 'Político',
    titular: '"El bloqueo ha sido derrotado", anunció Rodrigo Paz tras el levantamiento de los cortes',
    resumen: 'El presidente declaró derrotada la medida tras 53 días de protestas que paralizaron el país y advirtió que el bloqueo "no puede volver".',
    breaking: false,
    url: 'https://www.infobae.com/america/america-latina/2026/06/23/el-bloqueo-ha-sido-derrotado-anuncio-el-presidente-rodrigo-paz-tras-el-levantamiento-de-los-cortes-en-bolivia/',
    body: 'Rodrigo Paz afirmó que los sectores pueden reorganizarse, pero que el esfuerzo debe enfocarse en "construir la patria, no destruirla". El conflicto, el más prolongado de los últimos años, dejó pérdidas millonarias y, según la prensa, al menos 16 fallecidos.',
    keywords: ['bloqueo', 'Rodrigo Paz', 'pacificación'],
    relacionados: ['Bloqueos · Red Vial Fundamental'],
  },
  {
    id: 'n18', t: '−5d', mins: 7020, fuente: 'Infobae', tag: 'Político',
    titular: 'Evo Morales anuncia una pausa en los bloqueos de rutas tras más de 50 días de protestas',
    resumen: 'La Coordinadora de las Seis Federaciones del Trópico de Cochabamba declara un cuarto intermedio; Morales aclara que "no significa rendición".',
    breaking: false,
    url: 'https://www.infobae.com/america/america-latina/2026/06/23/crisis-en-bolivia-evo-morales-anuncio-una-pausa-en-los-bloqueos-de-rutas-tras-mas-de-50-dias-de-protestas/',
    body: 'El último bastión del conflicto, el Trópico de Cochabamba, se replegó tras el despeje del resto de sectores bajo el estado de excepción. Morales señaló que "por ahora es un cuarto intermedio", dejando abierta la posibilidad de reactivar las medidas.',
    keywords: ['Evo Morales', 'Trópico de Cochabamba', 'cuarto intermedio'],
    relacionados: ['Bloqueo b1 · Chimoré–Villa Tunari'],
  },
  {
    id: 'n16', t: '−5d', mins: 7244, fuente: 'Opinión', tag: 'Social',
    titular: 'La ABC confirma que las carreteras están libres de bloqueos',
    resumen: 'Tras 54 días de conflicto, la Administradora Boliviana de Carreteras informó que el mapa nacional no registra puntos de bloqueo; solo restaba limpiar escombros en cuatro rutas.',
    breaking: false,
    url: 'https://www.opinion.com.bo/articulo/pais/abc-confirma-que-carreteras-estan-libres-bloqueos/20260623091640992611.html',
    body: 'La ABC reportó a las 06:00 que todas las vías obstruidas por motivos sociales quedaron expeditas. Cuadrillas y maquinaria pesada continúan retirando piedras y escombros en Cochabamba, La Paz y Oruro, con resguardo policial y militar, hasta liberar el 100% de la Red Vial Fundamental.',
    keywords: ['ABC', 'transitabilidad', 'Red Vial Fundamental'],
    relacionados: ['Bloqueos · transitabilidad RVF'],
  },
  {
    id: 'n19', t: '−5d', mins: 7440, fuente: 'La Patria', tag: 'Social',
    titular: 'Restablecen la transitabilidad en carreteras del país tras los bloqueos',
    resumen: 'La ABC reabrió las principales carreteras tras más de 50 días de conflicto y se reanudó el tránsito de buses y carga entre departamentos.',
    breaking: false,
    url: 'https://lapatria.bo/enfoque-nacional/gestion/paz-cochabamba-santa-cruz-reabren-vias-transporte/',
    body: 'Maquinaria pesada continuaba con labores de limpieza en Cochabamba, La Paz y Oruro mientras el transporte interdepartamental se normalizaba. La reapertura siguió al acuerdo Gobierno–COB y al estado de excepción que despejó los piquetes.',
    keywords: ['transitabilidad', 'carreteras', 'transporte'],
    relacionados: ['Bloqueos · transitabilidad RVF'],
  },
  {
    id: 'n1', t: '−6d', mins: 8670, fuente: 'Infobae', tag: 'Político',
    titular: 'Rodrigo Paz declara el estado de excepción para liberar las rutas: "los bolivianos no pueden seguir siendo rehenes"',
    resumen: 'Estado de excepción nacional sin suspender derechos: prohíbe bloqueos y armas y habilita apoyo militar temporal en rutas. El conflicto deja 16 muertos.',
    breaking: true,
    url: 'https://www.infobae.com/america/america-latina/2026/06/20/rodrigo-paz-declaro-el-estado-de-excepcion-en-bolivia-para-liberar-las-rutas-del-pais-los-bolivianos-no-pueden-seguir-siendo-rehenes/',
    body: 'El presidente Rodrigo Paz declaró el estado de excepción de alcance nacional (primera aplicación de la Ley 1740) para despejar las rutas tras 50 días de bloqueos. No suspende derechos constitucionales; prohíbe bloqueos y el uso de armas y autoriza apoyo temporal de las FF.AA. El conflicto deja unos 16 muertos.',
    keywords: ['Estado de excepción', 'Ley 1740', 'Rodrigo Paz', 'FF.AA.'],
    relacionados: ['Bloqueo b9 · Patacamaya'],
  },
  {
    id: 'n2', t: '−6d', mins: 8670, fuente: 'El Deber', tag: 'Social',
    titular: 'Túpac Katari rechaza el acuerdo COB-Gobierno y mantiene los bloqueos en La Paz',
    resumen: 'La Federación campesina Túpac Katari, alineada con el evismo, se aparta del acuerdo y ratifica bloqueos en La Paz con la demanda de renuncia de Paz.',
    breaking: false,
    url: 'https://eldeber.com.bo/la-paz/tupac-katari-rechaza-traicion-cob-llamara-ampliado-domingo_1781923818',
    body: 'La Federación Departamental de Campesinos Túpac Katari (La Paz), alineada con el evismo, se apartó del acuerdo COB-Gobierno y convocó a un ampliado, manteniendo decenas de puntos de bloqueo y la exigencia de renuncia del presidente Paz.',
    keywords: ['Túpac Katari', 'evismo', 'bloqueos', 'La Paz'],
    relacionados: ['Bloqueo b8 · Desaguadero'],
  },
  {
    id: 'n3', t: '−6d', mins: 8790, fuente: 'Al Jazeera', tag: 'Internacional',
    titular: 'Bolivia declara el estado de emergencia en medio de la crisis de bloqueos',
    resumen: 'La cobertura internacional vincula el origen del conflicto al recorte de subsidios a combustibles para reducir el déficit, en plena crisis de dólares y negociación con el FMI.',
    breaking: true,
    url: 'https://www.aljazeera.com/news/2026/6/20/bolivia-declares-state-of-emergency-amid-blockade-crisis',
    body: 'Medios internacionales reportan la declaración del estado de emergencia y vinculan el conflicto al recorte de subsidios a combustibles para reducir el déficit, en medio de la crisis de dólares y la negociación con el FMI; los bloqueos llegaron a aislar a La Paz.',
    keywords: ['Estado de emergencia', 'subsidios', 'déficit', 'FMI'],
    relacionados: ['Deuda externa · %PIB'],
  },
  {
    id: 'n4', t: '−7d', mins: 9570, fuente: 'ABI', tag: 'Político',
    titular: 'La COB instruye levantar los bloqueos y todas las medidas de presión a nivel nacional',
    resumen: 'El secretario ejecutivo de la COB, Mario Argollo, ordenó levantar las medidas tras firmar el acuerdo de pacificación; mesas técnicas desde el 24 de junio.',
    breaking: false,
    url: 'https://abi.bo/la-cob-instruye-levantar-los-bloqueos-y-todas-las-medidas-de-presion-a-nivel-nacional-tras-acuerdo-con-el-gobierno/',
    body: 'El secretario ejecutivo de la COB, Mario Argollo, instruyó levantar los bloqueos y las medidas de presión a nivel nacional tras firmar el acuerdo de pacificación con el Gobierno, que contempla mesas técnicas desde el 24 de junio y plazos de hasta 90 días.',
    keywords: ['COB', 'levantamiento', 'acuerdo', 'Argollo'],
    relacionados: ['Bloqueo b1 · Chimoré'],
  },
  {
    id: 'n5', t: '−7d', mins: 9690, fuente: 'La Razón', tag: 'Político',
    titular: 'Gobierno y COB alcanzan un acuerdo luego de 50 días de movilizaciones',
    resumen: 'Se firmó sobre el pliego de 8 ejes (combustibles, no privatización, canasta familiar, salarios reales) con ejecución de hasta 90 días.',
    breaking: false,
    url: 'https://larazon.bo/nacional/2026/06/19/gobierno-y-cob-alcanzan-acuerdo-luego-de-50-dias-de-movilizaciones/',
    body: 'El acuerdo de pacificación entre el Gobierno y la COB se firmó en la Casa Grande del Pueblo sobre la base del pliego de 8 ejes (combustibles, no privatización de empresas estratégicas, canasta familiar, salarios reales y socialización de normas), con ejecución en plazos de hasta 90 días.',
    keywords: ['Acuerdo 8 ejes', 'COB', 'combustibles', 'salarios'],
    relacionados: ['Bloqueo b2 · Sacaba'],
  },
  {
    id: 'n6', t: '−7d', mins: 9820, fuente: 'Bloomberg Línea', tag: 'Económico',
    titular: 'Los bonos de Bolivia se recuperan y retrocede el riesgo país, a pesar de los bloqueos',
    resumen: 'El EMBI cerró la semana en 444 pb, una mejora de casi 200 pb frente a los 639 del 26 de mayo, junto con la baja de bloqueos por debajo de 50.',
    breaking: false,
    url: 'https://www.bloomberglinea.com/latinoamerica/bolivia/los-bonos-de-bolivia-se-recuperan-y-retrocede-el-riesgo-pais-a-pesar-de-los-bloqueos/',
    body: 'Los bonos soberanos bolivianos se recuperaron y el EMBI cerró la semana en 444 puntos básicos, una mejora cercana a 200 pb frente al máximo de mayo (639), coincidiendo con la reducción de bloqueos por debajo de 50. Bolivia sigue como el segundo mayor riesgo de la región tras Venezuela.',
    keywords: ['EMBI', 'bonos', 'riesgo país', '444'],
    relacionados: ['EMBI Bolivia', 'BOL 9.45% 2031'],
  },
  {
    id: 'n7', t: '−8d', mins: 11550, fuente: 'economy.com.bo', tag: 'Económico',
    titular: 'Los bloqueos golpean la actividad productiva y el sector privado plantea medidas de reactivación',
    resumen: 'El sector privado advierte por el daño a la producción; la CNI estimó pérdidas industriales de unos USD 12 millones diarios.',
    breaking: false,
    url: 'https://www.economy.com.bo/articulo/business/bloqueos-afectan-actividad-productiva-sector-privado-plantea-medidas-reactivacion-economica/20260618093626022910.html',
    body: 'El sector privado advirtió por el golpe a la actividad productiva por los bloqueos y propuso un paquete de medidas para la reactivación. La Cámara Nacional de Industrias estimó pérdidas industriales de alrededor de USD 12 millones diarios.',
    keywords: ['Sector privado', 'reactivación', 'CNI', 'industria'],
    relacionados: ['PIB · var. interanual'],
  },
  {
    id: 'n8', t: '−9d', mins: 12720, fuente: 'paralelo.bo', tag: 'Económico',
    titular: 'El dólar paralelo baja a Bs 9,87 y la brecha con el oficial cede a 41,8%',
    resumen: 'El paralelo P2P acumula una tendencia bajista de -0,5% en 7 días, en medio de las expectativas de unificación cambiaria.',
    breaking: false,
    url: 'https://dolarparalelobolivia.net/noticias/dolar-paralelo-bolivia-hoy-17-de-junio-2026',
    body: 'El dólar paralelo (P2P) se cotizó en Bs 9,87 el 17 de junio, con una brecha de 41,8% frente al tipo oficial (Bs 6,96) y una tendencia bajista de -0,5% en siete días, en medio de las expectativas de unificación cambiaria con el FMI.',
    keywords: ['dólar paralelo', 'brecha', 'P2P', 'unificación'],
    relacionados: ['USD/BOB paralelo', 'BRECHA P/VRD'],
  },
  {
    id: 'n9', t: '−9d', mins: 12870, fuente: 'El País Tarija', tag: 'Político',
    titular: 'El Gobierno da paso al diálogo y la COB plantea 8 ejes para pacificar el país',
    resumen: 'El pliego incluye combustibles, no privatización de empresas estratégicas, canasta familiar y salarios reales.',
    breaking: false,
    url: 'https://elpais.bo/nacional/20260617_el-gobierno-da-paso-al-dialogo-la-cob-plantea-8-ejes-para-pacificar-el-pais.html',
    body: 'El Ejecutivo abrió la puerta al diálogo y la COB presentó su plan de 8 ejes (combustibles, no privatización de empresas estratégicas, suspensión de normas que restringen la protesta, canasta familiar y salarios reales) como base de la negociación.',
    keywords: ['8 ejes', 'COB', 'diálogo', 'combustibles'],
    relacionados: ['Bloqueo b12 · El Alto'],
  },
  {
    id: 'n10', t: '−11d', mins: 15170, fuente: 'Unitel', tag: 'Económico',
    titular: 'Según Bloomberg, Bolivia anuncia a inversores que un acuerdo con el FMI y la unificación cambiaria están cerca',
    resumen: 'El viceministro Christian Morales señaló que los cambios monetarios podrían producirse en la semana; se evalúa pasar a tipo de cambio flotante.',
    breaking: true,
    url: 'https://unitel.bo/noticias/economia/segun-bloomberg-bolivia-anuncio-a-inversores-que-un-acuerdo-con-el-fmi-y-la-unificacion-cambiaria-estan-cerca-FG21414144',
    body: 'En una conferencia con inversores, el viceministro del Tesoro, Christian Morales, señaló que los cambios monetarios podrían producirse en la misma semana: se evalúa pasar a un tipo de cambio flotante y un programa con el FMI citado en hasta USD 3.300 millones, lo que pondría fin al tipo de cambio fijo de más de 15 años.',
    keywords: ['FMI', 'unificación cambiaria', 'tipo flotante', 'BCB'],
    relacionados: ['USD/BOB paralelo', 'Deuda externa · %PIB'],
  },
  {
    id: 'n11', t: '−11d', mins: 15670, fuente: 'Infobae', tag: 'Económico',
    titular: 'Los bloqueos provocan pérdidas de USD 978 millones al sector exportador de Bolivia',
    resumen: 'Según la Caneb, las pérdidas acumuladas subieron 36%; Santa Cruz concentra unos USD 386 millones (cerca del 40%).',
    breaking: false,
    url: 'https://www.infobae.com/america/america-latina/2026/06/15/los-bloqueos-provocan-perdidas-de-978-millones-de-dolares-al-sector-exportador-de-bolivia/',
    body: 'Según la Cámara Nacional de Exportadores (Caneb), las pérdidas acumuladas para el sector privado llegaron a USD 978 millones (un alza de 36%), con Santa Cruz concentrando unos USD 386 millones, cerca del 40% del total.',
    keywords: ['exportaciones', 'pérdidas', 'Caneb', 'Santa Cruz'],
    relacionados: ['PIB · var. interanual', 'RIN · BCB'],
  },
  {
    id: 'n12', t: '−18d', mins: 26070, fuente: 'Unitel', tag: 'Político',
    titular: 'Paz promulga la Ley 1740 que regula el estado de excepción en Bolivia',
    resumen: 'Desarrolla el art. 139 de la CPE y habilita medidas extraordinarias por hasta 90 días, renovables solo con aval de la Asamblea.',
    breaking: false,
    url: 'https://unitel.bo/noticias/politica/paz-promulga-la-ley-1740-que-regula-el-estado-de-excepcion-en-bolivia-BD21228922',
    body: 'El presidente Rodrigo Paz promulgó la Ley 1740, que desarrolla el artículo 139 de la Constitución y habilita medidas extraordinarias por hasta 90 días, renovables solo con aval de la Asamblea Legislativa, tras 39 días de bloqueos. El Gobierno la aplicó por primera vez el 20-jun.',
    keywords: ['Ley 1740', 'estado de excepción', 'Paz', 'Asamblea'],
    relacionados: ['Bloqueo b1 · Chimoré'],
  },
  {
    id: 'n13', t: '−20d', mins: 29170, fuente: 'INE', tag: 'Económico',
    titular: 'Bolivia registra una variación de 2,13% en el IPC de mayo de 2026; la interanual llega a 12,51%',
    resumen: 'La mayor variación mensual del año; acumulado 2,62%. Los mayores aportes: carne de res, tomate y pollo, por bloqueos y abastecimiento.',
    breaking: false,
    url: 'https://www.ine.gob.bo/index.php/bolivia-registro-una-variacion-de-213-en-el-indice-de-precios-al-consumidor-en-mayo-de-2026/',
    body: 'El IPC subió 2,13% en mayo (la mayor variación mensual del año), con un acumulado de 2,62% y una interanual de 12,51%. Los mayores aportes vinieron de carne de res, tomate y pollo, en medio de bloqueos y problemas de abastecimiento.',
    keywords: ['inflación', 'IPC', 'alimentos', 'INE'],
    relacionados: ['IPC interanual'],
  },
];

// ─────────────────────────────────────────────────────────────────────
// MÓDULO E — Calendario de eventos (HITOS REALES, ventana 14-jun → 14-jul 2026)
// d = días desde el 14-jun. Solo hitos datables y corroborados (ver docs/SOURCES.md):
// la ventana es pobre en eventos duros — cupones de bonos caen en sep/nov, el
// ciclo electoral cerró el 4-may, y el FMI no tiene fecha de directorio.
// ─────────────────────────────────────────────────────────────────────
export const EVENTOS: Evento[] = [
  // d = días desde hoy (20-jun-2026). El calendario del frontend computa hoy → +30.
  // Estado de excepción declarado la madrugada del 20-jun (1ª aplicación de la Ley 1740).
  { d: 0, tag: 'Político', title: 'Estado de excepción nacional · Ley 1740', tone: 'neg' },
  // Mesas de trabajo pactadas en el acuerdo Gobierno–COB del 19-jun (implementación a 90 días).
  { d: 6, tag: 'Político', title: 'Mesas de trabajo Gobierno–COB (acuerdo de 8 ejes)', tone: 'accent' },
  // INE publica el IPC de junio en los primeros días hábiles de julio (patrón: may→3-jun).
  { d: 13, tag: 'INE', title: 'IPC junio 2026 · INE (esperado)', tone: 'info' },
];

// ─────────────────────────────────────────────────────────────────────
// MÓDULO F — Fuentes (estado al 20 jun 2026)
// ─────────────────────────────────────────────────────────────────────
export const FUENTES: Fuente[] = [
  { id: 'bcb', name: 'BCB · Reservas y TC', latency: 142, status: 'ok', last: '09:00' },
  { id: 'ine', name: 'INE · IPC y PIB', latency: 286, status: 'ok', last: '03 jun' },
  { id: 'ypfb', name: 'YPFB · producción', latency: 980, status: 'lag', last: 'jul 2025' },
  { id: 'abc', name: 'ABC · transitabilidad RVF', latency: 74, status: 'live', last: '14:40' },
  { id: 'embi', name: 'EMBI · JPMorgan agg.', latency: 610, status: 'ok', last: '19 jun' },
  { id: 'p2p', name: 'Mercado paralelo · P2P', latency: 11, status: 'live', last: '14:42' },
  { id: 'commodities', name: 'Commodities · TE', latency: 64, status: 'live', last: '12 jun' },
  { id: 'rate', name: 'Calificadoras', latency: null, status: 'cold', last: 'mar 2026' },
];
