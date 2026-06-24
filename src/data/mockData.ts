// Datos del "Tablero Inteligente BOL" — snapshot REAL de Bolivia ~20 jun 2026.
// Revisado contra fuentes OFICIALES/primarias (BCB, INE, MEFP, YPFB, ABC, ANH) y
// medios reputados que las citan. Las SERIES históricas usan valores reales
// (corroborados) donde existen; los puntos indicativos se señalan en docs.
// Lo no verificable se marca (s/d, "sector no detallado"). Ver docs/SOURCES.md.
// Coyuntura: crisis política y bloqueos (desde 1-may-2026) bajo Rodrigo Paz
// (presidente desde 8-nov-2025); negociación con el FMI. Reemplazar por ingesta
// en vivo (// TODO).

import type {
  Kpi, Bloqueo, Mercados, Noticia, Evento, Fuente, ExternoData,
} from '../types';
import { HISTORY, PERIODICIDAD, sparkFrom } from './series.ts';

// ─────────────────────────────────────────────────────────────────────
// MÓDULO A — Indicadores macro (11 KPIs; series históricas reales)
// ─────────────────────────────────────────────────────────────────────
const RAW_KPIS: Kpi[] = [
  {
    id: 'usdbob_oficial',
    label: 'USD/BOB OFICIAL',
    value: 6.96,
    fmt: (v) => v.toFixed(2),
    delta: 0.0,
    deltaLabel: '0,00%',
    sentiment: 'neutral',
    spark: Array.from({ length: 12 }, () => 6.96),
    source: 'BCB',
    asof: '24 jun · 09:00',
    def: 'Tipo de cambio oficial (venta) fijado por el BCB desde nov-2011. Régimen dual: el BCB publica además el Valor Referencial del Dólar (VRD).',
  },
  {
    id: 'usdbob_paralelo',
    label: 'USD/BOB PARALELO',
    value: 9.9,
    fmt: (v) => v.toFixed(2),
    delta: -0.1,
    deltaLabel: '−0,1%',
    sentiment: 'neg',
    // mercado informal: cayó desde picos ~19 Bs (2025) a ~9,9 (anclas dic-25 9,60 · jun-26 9,90)
    spark: [19.0, 15.5, 12.0, 10.4, 9.6, 9.63, 9.7, 9.85, 9.96, 9.94, 9.92, 9.9],
    source: 'paralelo (P2P) · informal',
    asof: '24 jun',
    def: 'Promedio de cotizaciones P2P (informal, no oficial). Bajó desde picos de ~Bs 19 en 2025; cedió a ~9,90 al 24-jun tras el fin de los bloqueos. Brecha ~42% con el oficial.',
    extra: { label: 'BRECHA', value: '+42,2%', tone: 'neg' },
  },
  {
    id: 'vrd',
    label: 'VRD · BCB',
    value: 9.86,
    unit: 'Bs',
    fmt: (v) => v.toFixed(2),
    delta: -0.6,
    deltaLabel: '−0,6%',
    sentiment: 'neg',
    spark: [9.2, 9.25, 9.3, 9.35, 9.4, 9.5, 9.65, 9.8, 10.0, 10.07, 9.96, 9.86],
    source: 'BCB · VRD',
    asof: '24 jun',
    def: 'Valor Referencial del Dólar del BCB, publicado a diario desde dic-2025. Tocó un récord >Bs 10 a mediados de jun y cedió a ~9,86 (compra 9,76 · venta 9,96 el 24-jun), tercer día bajo Bs 10.',
    extra: { label: 'BRECHA', value: '+41,7%', tone: 'neg' },
  },
  {
    id: 'brecha',
    label: 'BRECHA CAMBIARIA',
    value: 42.2,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: -0.9,
    deltaLabel: '−0,9 pp',
    sentiment: 'neg',
    // brecha = paralelo/oficial − 1; se redujo desde ~170% en el peor 2025
    spark: [173, 123, 72, 49, 38, 38.4, 39.4, 41.5, 43.1, 42.8, 42.5, 42.2],
    source: 'derivado · paralelo/oficial',
    asof: '24 jun',
    def: 'Brecha entre el dólar paralelo y el oficial (6,96). Se redujo desde picos de ~170% en 2025 a ~42% (24-jun).',
  },
  {
    id: 'brecha_vrd',
    label: 'BRECHA P/VRD',
    value: 0.4,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: 0,
    deltaLabel: '≈ 0',
    sentiment: 'neutral',
    spark: [],
    source: 'derivado · paralelo/VRD',
    asof: '24 jun',
    def: 'Brecha entre el dólar paralelo y el VRD (el tipo de cambio de FACTO del BCB, no el oficial). Casi cerrada (~0%): paralelo y VRD ya convergieron, así que la unificación cambiaria del acuerdo con el FMI ocurre de hecho. La brecha grande (43%) es solo contra el oficial administrado de 6,96, al que casi nadie accede.',
  },
  {
    id: 'rin',
    label: 'RIN · BCB',
    value: 4694,
    unit: 'M USD',
    fmt: (v) => v.toLocaleString('es-BO'),
    delta: 32.5,
    deltaLabel: '+32,5%',
    sentiment: 'neg',
    // cortes oficiales BCB: dic-24 1.976 · ago-25 2.881 · sep-25 3.275 · dic-25 3.713 · mar-26 3.543 · 15-may-26 4.694
    spark: [1976, 2350, 2881, 3275, 3713, 3543, 4694],
    source: 'BCB · RIN 15-may-2026',
    asof: '15 may 2026',
    def: 'Reservas Internacionales Netas del BCB. Última lectura (15-may-2026): USD 4.694 M (oro 3.608 M · divisas 1.017 M · DEG/FMI 69 M). Subió ~USD 1.150 M frente a marzo (3.543 M) por la emisión del bono soberano de US$1.000 M; aun así ~77% sigue siendo ORO (≈23 t), parte comprometido en swaps, por lo que la capacidad real de defensa cambiaria es menor que el titular. La foto trimestral de junio podría reordenar la composición.',
    extra: { label: 'DIVISAS', value: '~$1.017 M', tone: 'neutral' },
  },
  {
    id: 'cobertura_importaciones',
    label: 'COBERTURA IMPORT.',
    value: 4.9,
    unit: 'meses',
    fmt: (v) => v.toFixed(1),
    delta: 1.2,
    deltaLabel: '+1,2 m',
    sentiment: 'neg',
    spark: [],
    source: 'derivado · RIN/importaciones',
    asof: '15 may 2026',
    def: 'Reservas en meses de importación (RIN total ÷ importaciones mensuales ~USD 950 M): ~4,9 meses tras el salto de la RIN a 4.694 M (15-may). Con el ingreso del bono, las divisas líquidas (~USD 1.017 M) ya cubren ~1,1 mes de importaciones; aun así buena parte de la RIN sigue siendo oro inmovilizado, por lo que el colchón usable es menor que el titular.',
    extra: { label: 'EN DIVISAS', value: '~1,1 mes', tone: 'neutral' },
  },
  {
    id: 'ipc',
    label: 'IPC INTERANUAL',
    value: 12.51,
    unit: '%',
    fmt: (v) => v.toFixed(1),
    delta: -1.7,
    deltaLabel: '−1,7 pp',
    sentiment: 'neg',
    // INE, interanual corroborada: dic-25 20,40 · ene 19,64 · feb 19,73 · mar 15,05 · abr 14,18 · may 12,51
    spark: [20.4, 19.64, 19.73, 15.05, 14.18, 12.51],
    source: 'INE · IPC mayo 2026',
    asof: '03 jun',
    def: 'Variación del IPC a doce meses (INE). Mayo 2026: interanual 12,51%, mensual 2,13%, acumulado 2,62%. Desacelera desde ~20% de cierre de 2025. Los mayores aportes de mayo vinieron de ALIMENTOS (carne de res, tomate, pollo) por bloqueos y desabastecimiento.',
    extra: { label: 'MENSUAL', value: '+2,13%', tone: 'neg' },
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
    def: 'Producción de gas natural: 27,34 mm³/d a dic-2025 (29,06 en jul-2025; 2024 promedió 31,7) — en declive estructural. Reservas probadas ~3,7 TCF; YPFB proyecta importar gas desde 2031.',
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
    def: 'Déficit del SPNF: −12,2% del PIB en 2025 (vs −10,1% en 2024), el mayor desde la pandemia y sobre la meta del PGE (−9,2%).',
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
    asof: 'mar 2026',
    def: 'Deuda externa pública: USD 13.429,8 M a marzo (24,3% del PIB). La deuda pública total ronda ~45% del PIB (MEFP, últ. consolidado 2024).',
    extra: { label: 'STOCK', value: '$13.430 M', tone: 'neutral' },
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
  // precios al 12-jun-2026 (Trading Economics). polarity 'up' = mayor precio favorece a Bolivia.
  commodities: [
    { id: 'oro', label: 'Oro', value: 4222, unit: 'USD/oz', chgMensual: -9.91, chgAnual: 22.99, polarity: 'up', source: 'Trading Economics', asof: '12 jun' },
    { id: 'plata', label: 'Plata', value: 67.76, unit: 'USD/oz', chgMensual: -22.51, chgAnual: 86.62, polarity: 'up', source: 'Trading Economics', asof: '12 jun' },
    { id: 'zinc', label: 'Zinc', value: 3578, unit: 'USD/t', chgMensual: 0.53, chgAnual: 36.21, polarity: 'up', source: 'Trading Economics', asof: '12 jun' },
    { id: 'estano', label: 'Estaño', value: 52848, unit: 'USD/t', chgMensual: -3.58, chgAnual: 61.89, polarity: 'up', source: 'Trading Economics', asof: '11 jun' },
    { id: 'gas_hh', label: 'Gas natural (Henry Hub)', value: 3.12, unit: 'USD/MMBtu', chgMensual: 8.94, chgAnual: -12.87, polarity: 'none', source: 'Trading Economics', asof: '12 jun', nota: 'referencia EE.UU.' },
    { id: 'soya', label: 'Soya', value: 11.14, unit: 'USD/bushel', chgMensual: -9.4, chgAnual: 4.09, polarity: 'up', source: 'Trading Economics', asof: '12 jun' },
  ],
  deuda: { externaStock: 13429.8, externaPct: 24.3, totalPct: 45.1, asof: 'mar 2026', source: 'BCB · DEPEX' },
  balanza: { exportaciones: 1105, importaciones: 997, saldo: 108, periodo: 'abril 2026', source: 'INE' },
  combustibles: {
    especial: 6.96, premium: 11.0, diesel: 9.8,
    nota: 'Precios fijos por DS 5516 (13-ene-2026); evaluación de ajuste a mitad de año.',
    source: 'ANH · DS 5516',
  },
  servicio: { y2026: 1714, y2027: 1670, y2028: 1945, source: 'BCB/MEFP (vía prensa)' },
  analitica: {
    gasExportUsd: 212.2, gasExportPeriodo: '1T 2026', gasExportVar: -28.2,
    ccPct: -2.1, ccUsd: -1218, ccPeriodo: '2025',
    remesasUsd: 1153.7, remesasPeriodo: 'ene–nov 2024',
    bolivianizacion: 92, bolivPeriodo: 'abr 2025',
    finMonetarioFlujo: 5894, finMonetarioProg: 826, finMonetarioPeriodo: 'ene–abr 2026',
    fmiEstado: 'En negociación', fmiMonto: 3000,
    fmiNota: 'Programa EFF; Bloomberg cifra ~USD 3.000 M (Paz mencionó hasta 5.000). Posible unificación cambiaria. No aprobado al 20-jun.',
    source: 'BCB · INE · MEFP · FMI (vía prensa)',
  },
};

// ─────────────────────────────────────────────────────────────────────
// MÓDULO D — Feed de noticias (titulares reales may–jun 2026)
// ─────────────────────────────────────────────────────────────────────
export const NOTICIAS: Noticia[] = [
  {
    id: 'n14', t: '−9m', mins: 9, fuente: 'Infobae', tag: 'Político',
    titular: 'Rodrigo Paz ratifica el estado de excepción pese al levantamiento de los bloqueos en Bolivia',
    resumen: 'El presidente mantiene la medida tras el fin de los bloqueos —"tenemos muchas cosas que ordenar"— y convoca a una cumbre de unidad nacional para reactivar la economía.',
    breaking: true,
    url: 'https://www.infobae.com/america/america-latina/2026/06/24/rodrigo-paz-ratifica-el-estado-de-excepcion-pese-al-levantamiento-de-los-bloqueos-en-bolivia/',
    body: 'Pese al levantamiento de los bloqueos, Rodrigo Paz ratificó el estado de excepción para prevenir nuevas protestas mientras se reactiva la economía, golpeada por pérdidas estimadas entre USD 2.500 y 3.000 millones durante el conflicto.',
    keywords: ['Estado de excepción', 'Rodrigo Paz', 'reactivación', 'unidad nacional'],
    relacionados: ['Bloqueos · transitabilidad RVF'],
  },
  {
    id: 'n15', t: '−2h', mins: 90, fuente: 'Red Uno', tag: 'Económico',
    titular: 'Nueva baja del dólar referencial: el BCB lo cotiza en Bs 9,76 compra y Bs 9,96 venta',
    resumen: 'El Valor Referencial del Dólar encadena su tercer día por debajo de Bs 10, en línea con el repliegue del paralelo a Bs 9,90 y la brecha cediendo a ~42%.',
    breaking: false,
    url: 'https://www.reduno.com.bo/economia/nueva-baja-del-dolar-referencial-asi-cotiza-este-miercoles-segun-el-bcb-202662492015',
    body: 'El Banco Central de Bolivia reportó una nueva baja del dólar referencial (VRD): Bs 9,76 a la compra y Bs 9,96 a la venta, tercer día consecutivo bajo Bs 10. El mercado paralelo P2P operaba en torno a Bs 9,90, con la brecha cambiaria cediendo a ~42,2%.',
    keywords: ['VRD', 'BCB', 'dólar paralelo', 'brecha cambiaria'],
    relacionados: ['USD/BOB paralelo', 'Brecha cambiaria'],
  },
  {
    id: 'n17', t: '−17h', mins: 1036, fuente: 'Infobae', tag: 'Político',
    titular: '"El bloqueo ha sido derrotado", anunció Rodrigo Paz tras el levantamiento de los cortes',
    resumen: 'El presidente declaró derrotada la medida tras 53 días de protestas que paralizaron el país y advirtió que el bloqueo "no puede volver".',
    breaking: false,
    url: 'https://www.infobae.com/america/america-latina/2026/06/23/el-bloqueo-ha-sido-derrotado-anuncio-el-presidente-rodrigo-paz-tras-el-levantamiento-de-los-cortes-en-bolivia/',
    body: 'Rodrigo Paz afirmó que los sectores pueden reorganizarse, pero que el esfuerzo debe enfocarse en "construir la patria, no destruirla". El conflicto, el más prolongado de los últimos años, dejó pérdidas millonarias y, según la prensa, al menos 16 fallecidos.',
    keywords: ['bloqueo', 'Rodrigo Paz', 'pacificación'],
    relacionados: ['Bloqueos · Red Vial Fundamental'],
  },
  {
    id: 'n18', t: '−21h', mins: 1260, fuente: 'Infobae', tag: 'Político',
    titular: 'Evo Morales anuncia una pausa en los bloqueos de rutas tras más de 50 días de protestas',
    resumen: 'La Coordinadora de las Seis Federaciones del Trópico de Cochabamba declara un cuarto intermedio; Morales aclara que "no significa rendición".',
    breaking: false,
    url: 'https://www.infobae.com/america/america-latina/2026/06/23/crisis-en-bolivia-evo-morales-anuncio-una-pausa-en-los-bloqueos-de-rutas-tras-mas-de-50-dias-de-protestas/',
    body: 'El último bastión del conflicto, el Trópico de Cochabamba, se replegó tras el despeje del resto de sectores bajo el estado de excepción. Morales señaló que "por ahora es un cuarto intermedio", dejando abierta la posibilidad de reactivar las medidas.',
    keywords: ['Evo Morales', 'Trópico de Cochabamba', 'cuarto intermedio'],
    relacionados: ['Bloqueo b1 · Chimoré–Villa Tunari'],
  },
  {
    id: 'n16', t: '−1d', mins: 1484, fuente: 'Opinión', tag: 'Social',
    titular: 'La ABC confirma que las carreteras están libres de bloqueos',
    resumen: 'Tras 54 días de conflicto, la Administradora Boliviana de Carreteras informó que el mapa nacional no registra puntos de bloqueo; solo restaba limpiar escombros en cuatro rutas.',
    breaking: false,
    url: 'https://www.opinion.com.bo/articulo/pais/abc-confirma-que-carreteras-estan-libres-bloqueos/20260623091640992611.html',
    body: 'La ABC reportó a las 06:00 que todas las vías obstruidas por motivos sociales quedaron expeditas. Cuadrillas y maquinaria pesada continúan retirando piedras y escombros en Cochabamba, La Paz y Oruro, con resguardo policial y militar, hasta liberar el 100% de la Red Vial Fundamental.',
    keywords: ['ABC', 'transitabilidad', 'Red Vial Fundamental'],
    relacionados: ['Bloqueos · transitabilidad RVF'],
  },
  {
    id: 'n19', t: '−1d', mins: 1680, fuente: 'La Patria', tag: 'Social',
    titular: 'Restablecen la transitabilidad en carreteras del país tras los bloqueos',
    resumen: 'La ABC reabrió las principales carreteras tras más de 50 días de conflicto y se reanudó el tránsito de buses y carga entre departamentos.',
    breaking: false,
    url: 'https://lapatria.bo/enfoque-nacional/gestion/paz-cochabamba-santa-cruz-reabren-vias-transporte/',
    body: 'Maquinaria pesada continuaba con labores de limpieza en Cochabamba, La Paz y Oruro mientras el transporte interdepartamental se normalizaba. La reapertura siguió al acuerdo Gobierno–COB y al estado de excepción que despejó los piquetes.',
    keywords: ['transitabilidad', 'carreteras', 'transporte'],
    relacionados: ['Bloqueos · transitabilidad RVF'],
  },
  {
    id: 'n1', t: '−4d', mins: 5790, fuente: 'Infobae', tag: 'Político',
    titular: 'Rodrigo Paz declara el estado de excepción para liberar las rutas: "los bolivianos no pueden seguir siendo rehenes"',
    resumen: 'Estado de excepción nacional sin suspender derechos: prohíbe bloqueos y armas y habilita apoyo militar temporal en rutas. El conflicto deja 16 muertos.',
    breaking: true,
    url: 'https://www.infobae.com/america/america-latina/2026/06/20/rodrigo-paz-declaro-el-estado-de-excepcion-en-bolivia-para-liberar-las-rutas-del-pais-los-bolivianos-no-pueden-seguir-siendo-rehenes/',
    body: 'El presidente Rodrigo Paz declaró el estado de excepción de alcance nacional (primera aplicación de la Ley 1740) para despejar las rutas tras 50 días de bloqueos. No suspende derechos constitucionales; prohíbe bloqueos y el uso de armas y autoriza apoyo temporal de las FF.AA. El conflicto deja unos 16 muertos.',
    keywords: ['Estado de excepción', 'Ley 1740', 'Rodrigo Paz', 'FF.AA.'],
    relacionados: ['Bloqueo b9 · Patacamaya'],
  },
  {
    id: 'n2', t: '−4d', mins: 5790, fuente: 'El Deber', tag: 'Social',
    titular: 'Túpac Katari rechaza el acuerdo COB-Gobierno y mantiene los bloqueos en La Paz',
    resumen: 'La Federación campesina Túpac Katari, alineada con el evismo, se aparta del acuerdo y ratifica bloqueos en La Paz con la demanda de renuncia de Paz.',
    breaking: false,
    url: 'https://eldeber.com.bo/la-paz/tupac-katari-rechaza-traicion-cob-llamara-ampliado-domingo_1781923818',
    body: 'La Federación Departamental de Campesinos Túpac Katari (La Paz), alineada con el evismo, se apartó del acuerdo COB-Gobierno y convocó a un ampliado, manteniendo decenas de puntos de bloqueo y la exigencia de renuncia del presidente Paz.',
    keywords: ['Túpac Katari', 'evismo', 'bloqueos', 'La Paz'],
    relacionados: ['Bloqueo b8 · Desaguadero'],
  },
  {
    id: 'n3', t: '−4d', mins: 5910, fuente: 'Al Jazeera', tag: 'Internacional',
    titular: 'Bolivia declara el estado de emergencia en medio de la crisis de bloqueos',
    resumen: 'La cobertura internacional vincula el origen del conflicto al recorte de subsidios a combustibles para reducir el déficit, en plena crisis de dólares y negociación con el FMI.',
    breaking: true,
    url: 'https://www.aljazeera.com/news/2026/6/20/bolivia-declares-state-of-emergency-amid-blockade-crisis',
    body: 'Medios internacionales reportan la declaración del estado de emergencia y vinculan el conflicto al recorte de subsidios a combustibles para reducir el déficit, en medio de la crisis de dólares y la negociación con el FMI; los bloqueos llegaron a aislar a La Paz.',
    keywords: ['Estado de emergencia', 'subsidios', 'déficit', 'FMI'],
    relacionados: ['Deuda externa · %PIB'],
  },
  {
    id: 'n4', t: '−5d', mins: 6690, fuente: 'ABI', tag: 'Político',
    titular: 'La COB instruye levantar los bloqueos y todas las medidas de presión a nivel nacional',
    resumen: 'El secretario ejecutivo de la COB, Mario Argollo, ordenó levantar las medidas tras firmar el acuerdo de pacificación; mesas técnicas desde el 24 de junio.',
    breaking: false,
    url: 'https://abi.bo/la-cob-instruye-levantar-los-bloqueos-y-todas-las-medidas-de-presion-a-nivel-nacional-tras-acuerdo-con-el-gobierno/',
    body: 'El secretario ejecutivo de la COB, Mario Argollo, instruyó levantar los bloqueos y las medidas de presión a nivel nacional tras firmar el acuerdo de pacificación con el Gobierno, que contempla mesas técnicas desde el 24 de junio y plazos de hasta 90 días.',
    keywords: ['COB', 'levantamiento', 'acuerdo', 'Argollo'],
    relacionados: ['Bloqueo b1 · Chimoré'],
  },
  {
    id: 'n5', t: '−5d', mins: 6810, fuente: 'La Razón', tag: 'Político',
    titular: 'Gobierno y COB alcanzan un acuerdo luego de 50 días de movilizaciones',
    resumen: 'Se firmó sobre el pliego de 8 ejes (combustibles, no privatización, canasta familiar, salarios reales) con ejecución de hasta 90 días.',
    breaking: false,
    url: 'https://larazon.bo/nacional/2026/06/19/gobierno-y-cob-alcanzan-acuerdo-luego-de-50-dias-de-movilizaciones/',
    body: 'El acuerdo de pacificación entre el Gobierno y la COB se firmó en la Casa Grande del Pueblo sobre la base del pliego de 8 ejes (combustibles, no privatización de empresas estratégicas, canasta familiar, salarios reales y socialización de normas), con ejecución en plazos de hasta 90 días.',
    keywords: ['Acuerdo 8 ejes', 'COB', 'combustibles', 'salarios'],
    relacionados: ['Bloqueo b2 · Sacaba'],
  },
  {
    id: 'n6', t: '−5d', mins: 6940, fuente: 'Bloomberg Línea', tag: 'Económico',
    titular: 'Los bonos de Bolivia se recuperan y retrocede el riesgo país, a pesar de los bloqueos',
    resumen: 'El EMBI cerró la semana en 444 pb, una mejora de casi 200 pb frente a los 639 del 26 de mayo, junto con la baja de bloqueos por debajo de 50.',
    breaking: false,
    url: 'https://www.bloomberglinea.com/latinoamerica/bolivia/los-bonos-de-bolivia-se-recuperan-y-retrocede-el-riesgo-pais-a-pesar-de-los-bloqueos/',
    body: 'Los bonos soberanos bolivianos se recuperaron y el EMBI cerró la semana en 444 puntos básicos, una mejora cercana a 200 pb frente al máximo de mayo (639), coincidiendo con la reducción de bloqueos por debajo de 50. Bolivia sigue como el segundo mayor riesgo de la región tras Venezuela.',
    keywords: ['EMBI', 'bonos', 'riesgo país', '444'],
    relacionados: ['EMBI Bolivia', 'BOL 9.45% 2031'],
  },
  {
    id: 'n7', t: '−6d', mins: 8670, fuente: 'economy.com.bo', tag: 'Económico',
    titular: 'Los bloqueos golpean la actividad productiva y el sector privado plantea medidas de reactivación',
    resumen: 'El sector privado advierte por el daño a la producción; la CNI estimó pérdidas industriales de unos USD 12 millones diarios.',
    breaking: false,
    url: 'https://www.economy.com.bo/articulo/business/bloqueos-afectan-actividad-productiva-sector-privado-plantea-medidas-reactivacion-economica/20260618093626022910.html',
    body: 'El sector privado advirtió por el golpe a la actividad productiva por los bloqueos y propuso un paquete de medidas para la reactivación. La Cámara Nacional de Industrias estimó pérdidas industriales de alrededor de USD 12 millones diarios.',
    keywords: ['Sector privado', 'reactivación', 'CNI', 'industria'],
    relacionados: ['PIB · var. interanual'],
  },
  {
    id: 'n8', t: '−7d', mins: 9840, fuente: 'paralelo.bo', tag: 'Económico',
    titular: 'El dólar paralelo baja a Bs 9,87 y la brecha con el oficial cede a 41,8%',
    resumen: 'El paralelo P2P acumula una tendencia bajista de -0,5% en 7 días, en medio de las expectativas de unificación cambiaria.',
    breaking: false,
    url: 'https://dolarparalelobolivia.net/noticias/dolar-paralelo-bolivia-hoy-17-de-junio-2026',
    body: 'El dólar paralelo (P2P) se cotizó en Bs 9,87 el 17 de junio, con una brecha de 41,8% frente al tipo oficial (Bs 6,96) y una tendencia bajista de -0,5% en siete días, en medio de las expectativas de unificación cambiaria con el FMI.',
    keywords: ['dólar paralelo', 'brecha', 'P2P', 'unificación'],
    relacionados: ['USD/BOB paralelo', 'BRECHA P/VRD'],
  },
  {
    id: 'n9', t: '−7d', mins: 9990, fuente: 'El País Tarija', tag: 'Político',
    titular: 'El Gobierno da paso al diálogo y la COB plantea 8 ejes para pacificar el país',
    resumen: 'El pliego incluye combustibles, no privatización de empresas estratégicas, canasta familiar y salarios reales.',
    breaking: false,
    url: 'https://elpais.bo/nacional/20260617_el-gobierno-da-paso-al-dialogo-la-cob-plantea-8-ejes-para-pacificar-el-pais.html',
    body: 'El Ejecutivo abrió la puerta al diálogo y la COB presentó su plan de 8 ejes (combustibles, no privatización de empresas estratégicas, suspensión de normas que restringen la protesta, canasta familiar y salarios reales) como base de la negociación.',
    keywords: ['8 ejes', 'COB', 'diálogo', 'combustibles'],
    relacionados: ['Bloqueo b12 · El Alto'],
  },
  {
    id: 'n10', t: '−9d', mins: 12290, fuente: 'Unitel', tag: 'Económico',
    titular: 'Según Bloomberg, Bolivia anuncia a inversores que un acuerdo con el FMI y la unificación cambiaria están cerca',
    resumen: 'El viceministro Christian Morales señaló que los cambios monetarios podrían producirse en la semana; se evalúa pasar a tipo de cambio flotante.',
    breaking: true,
    url: 'https://unitel.bo/noticias/economia/segun-bloomberg-bolivia-anuncio-a-inversores-que-un-acuerdo-con-el-fmi-y-la-unificacion-cambiaria-estan-cerca-FG21414144',
    body: 'En una conferencia con inversores, el viceministro del Tesoro, Christian Morales, señaló que los cambios monetarios podrían producirse en la misma semana: se evalúa pasar a un tipo de cambio flotante y un programa con el FMI citado en hasta USD 3.300 millones, lo que pondría fin al tipo de cambio fijo de más de 15 años.',
    keywords: ['FMI', 'unificación cambiaria', 'tipo flotante', 'BCB'],
    relacionados: ['USD/BOB paralelo', 'Deuda externa · %PIB'],
  },
  {
    id: 'n11', t: '−9d', mins: 12790, fuente: 'Infobae', tag: 'Económico',
    titular: 'Los bloqueos provocan pérdidas de USD 978 millones al sector exportador de Bolivia',
    resumen: 'Según la Caneb, las pérdidas acumuladas subieron 36%; Santa Cruz concentra unos USD 386 millones (cerca del 40%).',
    breaking: false,
    url: 'https://www.infobae.com/america/america-latina/2026/06/15/los-bloqueos-provocan-perdidas-de-978-millones-de-dolares-al-sector-exportador-de-bolivia/',
    body: 'Según la Cámara Nacional de Exportadores (Caneb), las pérdidas acumuladas para el sector privado llegaron a USD 978 millones (un alza de 36%), con Santa Cruz concentrando unos USD 386 millones, cerca del 40% del total.',
    keywords: ['exportaciones', 'pérdidas', 'Caneb', 'Santa Cruz'],
    relacionados: ['PIB · var. interanual', 'RIN · BCB'],
  },
  {
    id: 'n12', t: '−16d', mins: 23190, fuente: 'Unitel', tag: 'Político',
    titular: 'Paz promulga la Ley 1740 que regula el estado de excepción en Bolivia',
    resumen: 'Desarrolla el art. 139 de la CPE y habilita medidas extraordinarias por hasta 90 días, renovables solo con aval de la Asamblea.',
    breaking: false,
    url: 'https://unitel.bo/noticias/politica/paz-promulga-la-ley-1740-que-regula-el-estado-de-excepcion-en-bolivia-BD21228922',
    body: 'El presidente Rodrigo Paz promulgó la Ley 1740, que desarrolla el artículo 139 de la Constitución y habilita medidas extraordinarias por hasta 90 días, renovables solo con aval de la Asamblea Legislativa, tras 39 días de bloqueos. El Gobierno la aplicó por primera vez el 20-jun.',
    keywords: ['Ley 1740', 'estado de excepción', 'Paz', 'Asamblea'],
    relacionados: ['Bloqueo b1 · Chimoré'],
  },
  {
    id: 'n13', t: '−18d', mins: 26290, fuente: 'INE', tag: 'Económico',
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
