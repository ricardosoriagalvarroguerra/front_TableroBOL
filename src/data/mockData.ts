// Datos del "Tablero Inteligente BOL" — snapshot REAL de Bolivia al 17-nov-2026.
// Revisado contra fuentes OFICIALES/primarias (BCB, INE, MEFP, YPFB, ABC, ANH) y
// medios reputados que las citan. Las SERIES históricas usan valores reales
// (corroborados) donde existen; los puntos indicativos se señalan en docs.
// Lo no verificable se marca (s/d, "sector no detallado"). Ver docs/SOURCES.md.
// Coyuntura: primer año de Rodrigo Paz (presidente desde 8-nov-2025), régimen
// cambiario FLEXIBLE (TCO diario del BCB) desde el 29-jun-2026, EFF del FMI aprobado
// el 2-oct, recesión por los bloqueos de mayo–junio. Reemplazar por ingesta en vivo.

import type {
  Kpi, Bloqueo, Mercados, Noticia, Evento, Fuente, ExternoData, CambiarioData,
} from '../types';
import { HISTORY, PERIODICIDAD, sparkFrom } from './series.ts';
import { HISTORICO, RATINGS_HIST } from './historico.ts';
import { ANALISIS } from './analisis.ts';

export { HISTORICO, ANALISIS };

/** Fecha de corte del snapshot (ancla del calendario y del encabezado). */
export const SNAPSHOT = { iso: '2026-11-17', fecha: '17-nov-2026' } as const;

// ─────────────────────────────────────────────────────────────────────
// MÓDULO A — Indicadores macro (19 KPIs; series fechadas + serie anual 2015→hoy)
// ─────────────────────────────────────────────────────────────────────
const c1 = (v: number) => v.toFixed(1).replace('.', ',');
const c2 = (v: number) => v.toFixed(2).replace('.', ',');
const miles = (v: number) => Math.round(v).toLocaleString('es-BO');

const RAW_KPIS: Kpi[] = [
  {
    id: 'usdbob_oficial',
    label: 'Dólar oficial (TCO)',
    value: 11.67,
    unit: 'Bs',
    fmt: c2,
    delta: -3.5,
    deltaLabel: '−3,5% vs 1-nov',
    sentiment: 'neutral',
    spark: [],
    source: 'BCB · TCO',
    asof: '14-16 nov',
    def: 'Tipo de Cambio Oficial del BCB: promedio ponderado diario de las compras de dólares del sistema financiero, vigente al día siguiente. Régimen flexible desde el 29-jun-2026 (arrancó en Bs 9,73). Desde la RD 142/2026 (24-sep) el precio de venta de los bancos es libre: se eliminó el tope TCO + Bs 0,10. Máximo del régimen: Bs 12,64 (9-sep); mínimo: Bs 9,83 (17-sep).',
    extra: { label: 'vs fijo 6,96', value: '+67,7%', tone: 'neg' },
  },
  {
    id: 'usdbob_paralelo',
    label: 'Dólar paralelo',
    value: 11.95,
    unit: 'Bs',
    fmt: c2,
    delta: -2.0,
    deltaLabel: '−2,0%',
    sentiment: 'neutral',
    spark: [],
    source: 'P2P · dolarboliviahoy',
    asof: '16 nov',
    def: 'Cotización informal de venta (P2P), cierre del 16-nov: Bs 11,84 compra / 11,95 venta. No hay una cotización paralela única; los monitores difieren en unos centavos.',
    extra: { label: 'Brecha', value: '+2,4%', tone: 'neutral' },
  },
  {
    id: 'brecha',
    label: 'Brecha cambiaria',
    value: 2.4,
    unit: '%',
    fmt: c1,
    delta: 3.3,
    deltaLabel: '+3,3 pp',
    sentiment: 'neutral',
    spark: [],
    source: 'derivado · paralelo/TCO',
    asof: '16 nov',
    def: 'Paralelo (venta) ÷ TCO − 1. Con el régimen flexible el premio colapsó de ~42% a cerca de 0 y desde entonces oscila entre −2% y +3%: mercado unificado de facto.',
  },
  {
    id: 'rin',
    label: 'Reservas internacionales',
    value: 3978,
    unit: 'M USD',
    fmt: miles,
    delta: 7.1,
    deltaLabel: '+7,1% vs dic',
    sentiment: 'pos',
    spark: [],
    source: 'BCB · RIN',
    asof: '16 oct',
    def: 'RIN del BCB al 16-oct-2026: USD 3.978 M (oro 3.266 M ≈ 82% · divisas 647 M · DEG 29 M · posición FMI 35 M). Incluye el primer desembolso del FMI (USD 211 M, 6-oct). Meta del Gobierno: ~USD 4.000 M a diciembre.',
    extra: { label: 'Divisas', value: '647 M', tone: 'neutral' },
  },
  {
    id: 'cobertura_importaciones',
    label: 'Cobertura de importaciones',
    value: 4.4,
    unit: 'meses',
    fmt: c1,
    delta: -0.4,
    deltaLabel: '−0,4 m',
    sentiment: 'neg',
    spark: [],
    source: 'derivado · RIN/importaciones',
    asof: '16 oct',
    def: 'RIN ÷ importaciones mensuales promedio de ene–sep 2026 (USD 902 M). Sin el oro, las divisas líquidas (647 M) cubren apenas ~0,7 meses.',
    extra: { label: 'En divisas', value: '0,7 m', tone: 'neg' },
  },
  {
    id: 'embi',
    label: 'Riesgo país (EMBI)',
    value: 494,
    unit: 'pb',
    fmt: miles,
    delta: -8,
    deltaLabel: '−8 pb',
    sentiment: 'pos',
    spark: [],
    source: 'JP Morgan · Bloomberg Línea',
    asof: '2 nov',
    def: 'Diferencial del EMBI de Bolivia sobre los bonos del Tesoro de EE.UU. Bajó de 2.087 pb (fin de 2024) a 673 (fin de 2025) y a ~400 en agosto de 2026; repuntó a 483–502 en sep–oct por la volatilidad cambiaria y los conflictos.',
  },
  {
    id: 'ipc',
    label: 'Inflación interanual',
    value: 7.08,
    unit: '%',
    fmt: c2,
    delta: 1.38,
    deltaLabel: '+1,38 pp',
    sentiment: 'neg',
    spark: [],
    source: 'INE · IPC',
    asof: 'oct 2026',
    def: 'Variación del IPC a doce meses (INE, 5-nov). Octubre: 7,08% interanual, +2,07% mensual y 6,03% acumulado. Bajó desde 20,4% (dic-2025) por efecto base y repunta por el fin del subsidio al diésel (19-sep) y la suba de pasajes urbanos (+14,6%).',
    extra: { label: 'Mensual', value: '+2,07%', tone: 'neg' },
  },
  {
    id: 'ipc_mensual',
    label: 'Inflación mensual',
    value: 2.07,
    unit: '%',
    fmt: c2,
    delta: 1.22,
    deltaLabel: '+1,22 pp',
    sentiment: 'neg',
    // INE, var. mensual: may 2,13 · jun 2,15 · jul −2,79 · ago 1,10 · sep 0,85 · oct 2,07
    spark: [2.13, 2.15, -2.79, 1.1, 0.85, 2.07],
    source: 'INE · IPC',
    asof: 'oct 2026',
    def: 'Variación mensual del IPC. Julio fue negativa (−2,79%) por la normalización del abastecimiento tras los bloqueos; agosto–octubre vuelven a subir (pollo, diésel, transporte).',
  },
  {
    id: 'pib',
    label: 'PIB real',
    value: -3.27,
    unit: '% 1S',
    fmt: c2,
    delta: -1.69,
    deltaLabel: '−1,7 pp',
    sentiment: 'neg',
    spark: [],
    source: 'INE · cuentas nacionales',
    asof: '1S 2026',
    def: 'PIB real acumulado ene–jun 2026: −3,27% (INE, 30-oct). El 2T cayó −5,94% interanual por los 53 días de bloqueos de mayo–junio (construcción −29%, comercio −9%). 2025 cerró en −1,58%. Proyección 2026: FMI −3,0% · Banco Mundial −2,8% · BCB −3,4%.',
    extra: { label: '2T', value: '−5,94%', tone: 'neg' },
  },
  {
    id: 'gas',
    label: 'Producción de gas',
    value: 27.34,
    unit: 'MMm³/d',
    fmt: c1,
    delta: -5.9,
    deltaLabel: '−5,9% a/a',
    sentiment: 'neg',
    spark: [],
    source: 'YPFB',
    asof: 'dic 2025 · sin actualizar',
    def: 'Producción de gas natural a dic-2025 (27,34 MMm³/d), en declive estructural desde ~59 en 2015. No hay dato mensual oficial de 2026 publicado; YPFB proyecta un promedio de 26,6 MMm³/d para 2026. Exportaciones de gas ene–sep 2026: USD 831,8 M (−2,2% a/a); el complejo soya ya las superó.',
  },
  {
    id: 'salario_minimo',
    label: 'Salario mínimo',
    value: 3300,
    unit: 'Bs',
    fmt: miles,
    delta: 20,
    deltaLabel: '+20%',
    sentiment: 'pos',
    spark: [],
    source: 'DS 5516',
    asof: 'ene 2026',
    def: 'Salario mínimo nacional de Bs 3.300 desde enero de 2026 (+20% sobre Bs 2.750). Sin cambio a mitad de año. Para 2027 el Gobierno negociará a inicios de año; la COB pide Bs 7.000.',
  },
  {
    id: 'fiscal',
    label: 'Resultado fiscal',
    value: -12.2,
    unit: '% PIB',
    fmt: c1,
    delta: -2.1,
    deltaLabel: '−2,1 pp',
    sentiment: 'neg',
    spark: [],
    source: 'MEFP',
    asof: 'cierre 2025',
    def: 'Déficit del SPNF de 2025: −12,2% del PIB. Meta 2026 (PGE reformulado y programa con el FMI): −9,2%; ene–may 2026 registró un superávit de 0,2% del PIB. El PGE 2027 (30-oct) apunta a −6,7% y a cero financiamiento del BCB.',
    extra: { label: 'Meta 2026', value: '−9,2%', tone: 'neutral' },
  },
  {
    id: 'deuda_externa',
    label: 'Deuda externa pública',
    value: 26.1,
    unit: '% PIB',
    fmt: c1,
    delta: -0.4,
    deltaLabel: '−0,4 pp',
    sentiment: 'pos',
    spark: [],
    source: 'BCB · deuda externa',
    asof: 'sep 2026',
    def: 'Deuda externa pública de mediano y largo plazo: USD 14.117,2 M al 30-sep-2026 (26,1% del PIB). Servicio ene–sep: USD 1.744 M; resta ~USD 223 M en el 4T.',
    extra: { label: 'Stock', value: '14.117 M', tone: 'neutral' },
  },
  {
    id: 'exportaciones',
    label: 'Exportaciones',
    value: 10350,
    unit: 'M USD',
    fmt: miles,
    delta: 54.4,
    deltaLabel: '+54%',
    sentiment: 'pos',
    spark: [],
    source: 'INE · comercio exterior',
    asof: 'ene–sep 2026',
    def: 'Exportaciones acumuladas ene–sep 2026: USD 10.350 M (+54,4% interanual), más que todo 2025 (USD 9.701 M), impulsadas por la minería (oro) y la soya.',
  },
  {
    id: 'balanza_saldo',
    label: 'Balanza comercial',
    value: 183.4,
    unit: 'M USD',
    fmt: miles,
    delta: -176.9,
    deltaLabel: '−177 M',
    sentiment: 'neg',
    spark: [],
    source: 'INE',
    asof: 'sep 2026',
    def: 'Saldo comercial de septiembre: superávit de USD 183,4 M (X 1.304,7 · M 1.121,2). Acumulado ene–sep: +USD 2.236,5 M, frente a déficits en 2023–2025.',
    extra: { label: 'Ene–sep', value: '+2.237 M', tone: 'pos' },
  },
  {
    id: 'cuenta_corriente',
    label: 'Cuenta corriente',
    value: -2.1,
    unit: '% PIB',
    fmt: c1,
    delta: 0.6,
    deltaLabel: '+0,6 pp',
    sentiment: 'pos',
    spark: [],
    source: 'BCB · balanza de pagos',
    asof: '2025',
    def: 'Saldo de la cuenta corriente de 2025: déficit de USD 1.218 M (~2,1% del PIB). En el 1S-2026 giró a superávit de USD 1.376 M por el auge exportador y la caída de importaciones.',
  },
  {
    id: 'deuda_publica',
    label: 'Deuda pública total',
    value: 83.3,
    unit: '% PIB',
    fmt: c1,
    delta: 0.1,
    deltaLabel: '+0,1 pp',
    sentiment: 'neg',
    spark: [],
    source: 'FMI · WEO oct-2026',
    asof: '2025 (est.)',
    def: 'Deuda bruta del gobierno general en % del PIB (FMI, WEO oct-2026): pasó de 34% en 2015 a ~83% en 2025, impulsada por la deuda interna con el BCB. El FMI proyecta ~100% para 2026 por la depreciación y la recesión.',
  },
  {
    id: 'desempleo',
    label: 'Desempleo urbano',
    value: 3.4,
    unit: '%',
    fmt: c1,
    delta: 0.3,
    deltaLabel: '+0,3 pp',
    sentiment: 'neg',
    spark: [],
    source: 'INE · ECE',
    asof: '2T 2026',
    def: 'Tasa de desempleo urbano (Encuesta Continua de Empleo del INE): 3,4% en el 2T-2026. La informalidad es alta, así que el desempleo abierto subestima el deterioro laboral.',
  },
  {
    id: 'pobreza',
    label: 'Pobreza moderada',
    value: 44.7,
    unit: '%',
    fmt: c1,
    delta: 6.6,
    deltaLabel: '+6,6 pp',
    sentiment: 'neg',
    spark: [],
    source: 'INE',
    asof: '2025',
    def: 'Población bajo la línea de pobreza moderada (INE, metodología con base 2016): 44,7% en 2025, desde 38,1% en 2024, por la inflación de 20%. Pobreza extrema: 16,7%.',
  },
];

// Adjunta a cada KPI su cadencia real (periodicidad) y su SERIE HISTÓRICA fechada
// real y validada (src/data/series.ts). El sparkline corto de las tarjetas se deriva
// de esa misma serie, así tarjeta y modal son siempre coherentes.
// Fecha del último dato de los KPIs sin serie fechada (el resto la toma de la serie).
const FECHA_DATO: Record<string, string> = {
  ipc_mensual: '2026-10-31',
  exportaciones: '2026-09-30',
  cuenta_corriente: '2025-12-31',
  pobreza: '2025-12-31',
  deuda_publica: '2025-12-31',
  desempleo: '2026-06-30',
};
const PERIODICIDAD_EXTRA: Record<string, Kpi['periodicidad']> = {
  ipc_mensual: 'mensual',
  exportaciones: 'mensual',
  cuenta_corriente: 'anual',
  pobreza: 'anual',
  deuda_publica: 'anual',
  desempleo: 'trimestral',
};

export const KPIS: Kpi[] = RAW_KPIS.map((k) => {
  const h = HISTORY[k.id];
  k = { ...k, fecha: FECHA_DATO[k.id] ?? h?.[h.length - 1]?.f };
  const an = HISTORICO[k.id];
  const base = { ...k, periodicidad: PERIODICIDAD[k.id] ?? PERIODICIDAD_EXTRA[k.id], historico: an?.serie, historicoNota: an?.nota };
  if (h && h.length) return { ...base, history: h, spark: sparkFrom(h) };
  // sin serie fechada: el sparkline usa la serie anual (si existe)
  return !k.spark.length && an ? { ...base, spark: an.serie.map((p) => p.valor) } : base;
});

// ─────────────────────────────────────────────────────────────────────
// MÓDULO B — Bloqueos (ABC · última ola georreferenciada, junio 2026)
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
  asof: '17 nov 2026',
  total: 0,
  pico: 93,
  picoFecha: '8 jun',
  tendencia: 'baja' as const,
  fuente: 'ABC · transitabilidad RVF + prensa',
  nota: 'Sin ola nacional de bloqueos desde el 23-jun (fin de los 53 días de mayo–junio; pico de 93 puntos el 8-jun). La conflictividad sigue en focos sectoriales. El último conteo ABC publicado es del 24-jun; los episodios posteriores salen de prensa.',
  /** Episodios de conflictividad posteriores a la ola de mayo–junio (prensa). */
  episodios: [
    { fecha: '18 nov', titulo: 'Ampliado de emergencia de la COB en apoyo al magisterio', lugar: 'La Paz', tono: 'accent' as const },
    { fecha: '11-12 nov', titulo: 'Choques en el puesto antidroga El Castillo; cocaleros lo queman', lugar: 'Chapare', tono: 'neg' as const },
    { fecha: '10-13 nov', titulo: 'Paro de camioneros chilenos bloquea Arica e Iquique', lugar: 'Frontera', tono: 'neg' as const },
    { fecha: '9-10 nov', titulo: 'Paro de 48 h y huelga de hambre del magisterio urbano', lugar: 'Nacional', tono: 'neg' as const },
    { fecha: '19-21 sep', titulo: 'Protestas de transporte y agro contra el fin del subsidio al diésel', lugar: 'Beni · Santa Cruz', tono: 'neg' as const },
    { fecha: '1-2 sep', titulo: 'Bloqueos de productores por el precio del diésel (DS 5676)', lugar: 'Santa Cruz', tono: 'neg' as const },
  ],
};

// ─────────────────────────────────────────────────────────────────────
// MÓDULO C — Mercados (revisados al 17-nov-2026)
// ─────────────────────────────────────────────────────────────────────
export const MERCADOS: Mercados = {
  // Bonos: sin cotización pública corroborada desde junio (último dato verificado).
  bonos: [
    { id: 'BOL28', name: 'BOL 4,50% 2028', price: 94.88, yield: 7.68, spread: 368, chg: +0.53 },
    { id: 'BOL31', name: 'BOL 9,45% 2031', price: 96.6, yield: 10.3, spread: 640, chg: -0.5 },
  ],
  embi: {
    value: 494,
    chg: -8,
    series: sparkFrom(HISTORY['embi']),
  },
  cds5y: { value: null, chg: 0, note: 'sin mercado público líquido' },
  ratings: [
    { agencia: 'Moody’s', rating: 'Caa2', outlook: 'Positivo', actualizado: 'sep 2026' },
    { agencia: 'S&P', rating: 'CCC+', outlook: 'Estable', actualizado: 'mar 2026' },
    { agencia: 'Fitch', rating: 'CCC', outlook: '—', actualizado: 'ago 2026' },
  ],
  // composición de la RIN al 16-oct-2026 (oro 3.266 · divisas 647 · DEG+FMI 64)
  reservas: { oro: 82, divisas: 16, deg: 2 },
  ratingsHistoria: RATINGS_HIST,
};

// ─────────────────────────────────────────────────────────────────────
// MÓDULO Externo & Deuda (datos oficiales al 17-nov-2026)
// ─────────────────────────────────────────────────────────────────────
export const EXTERNO: ExternoData = {
  // precios a mediados de nov-2026 (Trading Economics / LME / SMM). polarity 'up' = mayor precio favorece a Bolivia.
  // Variaciones: sólo las publicadas; el resto queda s/d.
  commodities: [
    { id: 'oro', label: 'Oro', value: 3865.75, unit: 'USD/oz', chgMensual: -6.6, chgAnual: null, polarity: 'up', source: 'Trading Economics', asof: '16 nov' },
    { id: 'plata', label: 'Plata', value: 47.2, unit: 'USD/oz', chgMensual: null, chgAnual: null, polarity: 'up', source: 'Trading Economics · Kitco', asof: '16 nov' },
    { id: 'zinc', label: 'Zinc', value: 3702.85, unit: 'USD/t', chgMensual: null, chgAnual: null, polarity: 'up', source: 'Trading Economics', asof: '13 nov' },
    { id: 'estano', label: 'Estaño', value: 46174, unit: 'USD/t', chgMensual: null, chgAnual: null, polarity: 'up', source: 'LME 3M · SMM', asof: '17 nov' },
    { id: 'gas_hh', label: 'Gas natural (Henry Hub)', value: 3.24, unit: 'USD/MMBtu', chgMensual: null, chgAnual: null, polarity: 'none', source: 'NYMEX', asof: '13 nov', nota: 'referencia EE.UU.' },
    { id: 'soya', label: 'Soya', value: 12.29, unit: 'USD/bushel', chgMensual: null, chgAnual: null, polarity: 'up', source: 'CBOT · Brownfield', asof: '16 nov' },
  ],
  deuda: { externaStock: 14117.2, externaPct: 26.1, totalPct: null, asof: 'sep 2026', source: 'BCB' },
  balanza: { exportaciones: 1304.7, importaciones: 1121.2, saldo: 183.4, periodo: 'septiembre 2026', source: 'INE' },
  combustibles: {
    especial: 6.96, premium: 11.0, diesel: 17.95,
    nota: 'Diésel a paridad de importación desde el DS 5716 (19-sep): Bs 17,95 (antes 9,80). La gasolina sigue subsidiada; YPFB anunció el fin del subsidio el 12-ene-2027, pero Hidrocarburos niega una fecha.',
    source: 'ANH · DS 5716',
  },
  servicio: { y2026: 1967, y2027: 1670, y2028: 1945, source: 'BCB' },
  analitica: {
    gasExportUsd: 831.8, gasExportPeriodo: 'ene–sep 2026', gasExportVar: -2.2,
    ccPct: null, ccUsd: 1376, ccPeriodo: '1S 2026',
    remesasUsd: 752.6, remesasPeriodo: 'ene–ago 2026',
    bolivianizacion: 90, bolivPeriodo: 'mar 2026',
    finMonetarioFlujo: 5894, finMonetarioProg: 826, finMonetarioPeriodo: 'ene–abr 2026',
    fmiEstado: 'Aprobado · EFF', fmiMonto: 1900,
    fmiNota: 'EFF de 36 meses aprobado el 2-oct (DEG 1.369 M). Primer desembolso de USD 211 M el 6-oct; primera revisión en diciembre. Además: BID USD 750 M (5-nov), Banco Mundial USD 500 M (12-nov) y CAF USD 224 M (pendiente de la Asamblea).',
    source: 'BCB · INE · FMI · BID · BM',
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
    'El BCB publica el TCO cada día hábil; rige la jornada siguiente.',
    'TCO = promedio ponderado de las compras de dólares del sistema financiero.',
    'Desde la RD 142 (24-sep) la venta bancaria es libre: no hay tope TCO + Bs 0,10.',
    'El FMI admite intervención sólo ante condiciones desordenadas.',
  ],
  hitos: [
    { etiqueta: '26 jun', titulo: 'Fin del tipo de cambio fijo de Bs 6,96', tono: 'neg' },
    { etiqueta: '29 jun', titulo: 'Arranca el TCO flexible en Bs 9,73', tono: 'accent' },
    { etiqueta: '9 sep', titulo: 'Máximo del régimen: Bs 12,64', tono: 'neg' },
    { etiqueta: '17 sep', titulo: 'Mínimo tras la caída abrupta: Bs 9,83', tono: 'pos' },
    { etiqueta: '24 sep', titulo: 'RD 142: venta bancaria libre, TCO único', tono: 'accent' },
    { etiqueta: '2 oct', titulo: 'El FMI aprueba el EFF (USD 1.900 M)', tono: 'pos' },
    { etiqueta: '16 nov', titulo: 'TCO en Bs 11,67, banda de 11,6–12,2 desde octubre', tono: 'neutral' },
  ],
  umbralCombustible: 10.4003,
  presion: {
    rinTotal: 3978,
    rinLiquidas: 647,
    rinEfectivaJul: 3933,
    rinLiquidasJul: 474,
    coberturaDivisas: '~0,7 mes',
    nota: 'La RIN subió de 3.617 M (jun) a 3.978 M (16-oct) por compras de oro y el desembolso del FMI, pero ~82% sigue siendo oro.',
  },
  lectura: [
    { titulo: 'Unificación, no flotación libre', texto: 'El TCO cerró la brecha y se mueve en una banda estrecha: el BCB sigue presente.' },
    { titulo: 'El traspaso a precios vuelve', texto: 'Con el diésel liberado y pasajes más caros, el IPC mensual volvió a 2% en octubre.' },
    { titulo: 'Subsidio de gasolina en cuenta regresiva', texto: 'Con el TCO sobre Bs 10,40 el subsidio sigue activo; su retiro en enero es la prueba siguiente.' },
    { titulo: 'El ancla ya llegó', texto: 'El EFF del FMI y los créditos de BID y BM dan divisas; la primera revisión es en diciembre.' },
  ],
  source: 'BCB · MEFP · INE · FMI',
};

// ─────────────────────────────────────────────────────────────────────
// MÓDULO D — Feed de noticias (titulares reales sep–nov 2026)
// ─────────────────────────────────────────────────────────────────────
export const NOTICIAS: Noticia[] = [
  {"id": "n100", "t": "−1d", "mins": 1620, "fuente": "La Razón", "tag": "Social", "titular": "La COB convoca a un ampliado nacional de emergencia para este miércoles", "resumen": "La central obrera define el 18-nov su apoyo al magisterio urbano en huelga de hambre.", "breaking": false, "keywords": ["COB", "magisterio"], "url": "https://larazon.bo/nacional/2026/11/16/cob-convoca-a-ampliado-nacional-de-emergencia-para-este-miercoles/"},
  {"id": "n99", "t": "−1d", "mins": 1620, "fuente": "Resumen Latinoamericano", "tag": "Económico", "titular": "YPFB anuncia el fin del subsidio a la gasolina desde el 12 de enero", "resumen": "El Ministerio de Hidrocarburos niega que haya una fecha fijada.", "breaking": true, "keywords": ["subsidio", "gasolina", "YPFB"], "relacionados": ["IPC"], "url": "https://www.resumenlatinoamericano.org/2026/11/16/bolivia-ypfb-anuncia-fin-de-subvencion-a-la-gasolina-desde-el-12-de-enero"},
  {"id": "n98", "t": "−4d", "mins": 5940, "fuente": "BioBio", "tag": "Internacional", "titular": "Paro de camioneros en Chile golpea a Bolivia: el gremio declara emergencia", "resumen": "El bloqueo de los accesos a Arica e Iquique frena importaciones de diésel.", "breaking": false, "keywords": ["comercio", "Chile", "diésel"], "url": "https://www.biobiochile.cl/noticias/internacional/america-latina/2026/11/13/paro-de-camioneros-de-chile-golpea-a-bolivia-gremio-altiplanico-declara-emergencia-por-perdidas.shtml"},
  {"id": "n97", "t": "−5d", "mins": 7380, "fuente": "La Razón", "tag": "Económico", "titular": "El Banco Mundial aprueba un crédito de apoyo presupuestario de USD 500 millones", "resumen": "Primera de dos operaciones: sostenibilidad fiscal, electricidad y empleo.", "breaking": false, "keywords": ["Banco Mundial", "financiamiento"], "relacionados": ["RIN"]},
  {"id": "n96", "t": "−6d", "mins": 8820, "fuente": "Visión 360", "tag": "Social", "titular": "Umopar retoma el punto antidroga en el Chapare; Evo advierte de un levantamiento", "resumen": "Los cocaleros luego quemaron el puesto de El Castillo; tres policías heridos.", "breaking": true, "keywords": ["Chapare", "Evo Morales"], "url": "https://www.vision360.bo/noticias/2026/11/11/76796-umopar-retoma-punto-antidroga-en-el-chapare-evo-advierte-de-un-levantamiento-y-sube-la-tension"},
  {"id": "n95", "t": "−9d", "mins": 13140, "fuente": "El Día", "tag": "Político", "titular": "Rodrigo Paz entrega a la Asamblea el informe de su primer año de gestión", "resumen": "Anuncia rendición de cuentas de los 12 ministerios.", "breaking": false, "keywords": ["Rodrigo Paz", "Asamblea"], "url": "https://www.eldia.com.bo/2026-11-08/politica/rodrigo-paz-entrega-informe-de-su-primer-ano-a-la-asamblea-y-anuncia-rendicion-de-cuentas-de-los-12-ministerios.html"},
  {"id": "n94", "t": "−11d", "mins": 16020, "fuente": "La Razón", "tag": "Político", "titular": "Sin Lara, la Asamblea instala la sesión para clausurar la Legislatura", "resumen": "Se profundiza la ruptura entre el presidente y el vicepresidente.", "breaking": false, "keywords": ["Asamblea", "Lara"], "url": "https://larazon.bo/nacional/2026/11/06/sin-lara-la-asamblea-instala-sesion-para-clausurar-la-legislatura-2025-2026/"},
  {"id": "n93", "t": "−12d", "mins": 17460, "fuente": "La Razón", "tag": "Económico", "titular": "El BID aprueba USD 750 millones para Bolivia", "resumen": "Paquete de apoyo presupuestario atado a la racionalización de subsidios y reformas.", "breaking": false, "keywords": ["BID", "financiamiento"], "relacionados": ["RIN"]},
  {"id": "n92", "t": "−12d", "mins": 17460, "fuente": "Rio Times", "tag": "Económico", "titular": "La inflación de octubre sube 2,07% y la interanual llega a 7,08%", "resumen": "Pesan los pasajes urbanos (+14,6%) y los alimentos.", "breaking": false, "keywords": ["inflación", "INE"], "relacionados": ["IPC"], "url": "https://www.riotimesonline.com/bolivia-inflation-jumps-2-07-percent-october-2026/"},
  {"id": "n91", "t": "−17d", "mins": 24660, "fuente": "Correo del Sur", "tag": "Económico", "titular": "Bolivia registra una contracción de 3,27% entre enero y junio", "resumen": "El PIB del 2T cayó 5,94% por los 53 días de bloqueos.", "breaking": true, "keywords": ["PIB", "INE", "bloqueos"], "relacionados": ["PIB"], "url": "https://correodelsur.com/economia/20261031/bolivia-registra-una-contraccion-economica-del-3-27-entre-enero-y-junio.html"},
  {"id": "n90", "t": "−17d", "mins": 24660, "fuente": "La Razón", "tag": "Económico", "titular": "Las exportaciones mineras impulsan un superávit comercial de USD 183 M en septiembre", "resumen": "Las exportaciones del año ya superan los USD 10.000 M.", "breaking": false, "keywords": ["exportaciones", "minería"], "url": "https://larazon.bo/economia-y-empresa/2026/10/31/exportaciones-mineras-impulsan-superavit-comercial-de-us-183-mm-en-septiembre/"},
  {"id": "n89", "t": "−18d", "mins": 26100, "fuente": "Visión 360", "tag": "Económico", "titular": "El Presupuesto 2027 proyecta un déficit de 6,7% e inflación de 10,4%", "resumen": "Sin financiamiento del BCB y con Bs 11.000 M para subsidios a combustibles.", "breaking": false, "keywords": ["presupuesto", "déficit"], "relacionados": ["fiscal"], "url": "https://www.vision360.bo/noticias/2026/10/30/74868-presupuesto-de-2027-proyecta-deficit-de-6_7por_ciento-inflacion-de-10_4por_ciento-y-bs-14000-millones-para-la-proteccion-social"},
  {"id": "n88", "t": "−20d", "mins": 28980, "fuente": "Correo del Sur", "tag": "Político", "titular": "Los 13 audios de Cerimedo: injerencia, disputas de poder y operaciones en las sombras", "resumen": "El escándalo se amplía; Paz pregunta quién filtra los audios.", "breaking": false, "keywords": ["audios", "Cerimedo"], "url": "https://correodelsur.com/politica/20261028/los-13-audios-de-cerimedo-injerencia-disputas-de-poder-y-operaciones-en-las-sombras.html"},
  {"id": "n87", "t": "−34d", "mins": 49140, "fuente": "Correo del Sur", "tag": "Internacional", "titular": "FMI: Bolivia decrecerá 3% en 2026 y otro 1,5% en 2027", "resumen": "Es la única economía sudamericana que se contrae en ambos años.", "breaking": false, "keywords": ["FMI", "proyecciones"], "relacionados": ["PIB"], "url": "https://correodelsur.com/economia/20261014/fmi-bolivia-decrecera-un-3-en-2026-y-otro-1-5-en-2027.html"},
  {"id": "n86", "t": "−38d", "mins": 54900, "fuente": "El Deber", "tag": "Económico", "titular": "La deuda externa pública llega a USD 14.117 millones a septiembre", "resumen": "Equivale a 26,1% del PIB.", "breaking": false, "keywords": ["deuda externa", "BCB"], "url": "https://eldeber.com.bo/economia/deuda-externa-publica-bolivia-llega-14-117-millones-dolares-septiembre-2026_1791596345"},
  {"id": "n85", "t": "−42d", "mins": 60660, "fuente": "Unitel", "tag": "Económico", "titular": "El BCB confirma el primer desembolso de USD 211,3 millones del FMI", "resumen": "Los recursos se suman a las reservas internacionales.", "breaking": false, "keywords": ["FMI", "reservas"], "relacionados": ["RIN"], "url": "https://unitel.bo/noticias/agencias/banco-central-de-bolivia-confirma-primer-desembolso-de-2113-millones-de-dolares-del-fmi-FN23955880"},
  {"id": "n84", "t": "−46d", "mins": 66420, "fuente": "FMI", "tag": "Internacional", "titular": "El Directorio del FMI aprueba un acuerdo EFF de 36 meses para Bolivia", "resumen": "Unos USD 1.900 M, con un desembolso inmediato de ~USD 214 M.", "breaking": true, "keywords": ["FMI", "EFF"], "relacionados": ["RIN", "EMBI"], "url": "https://www.imf.org/en/news/articles/2026/10/02/pr26317-bolivia-imf-approves-36-month-eff-arrangement"},
  {"id": "n83", "t": "−47d", "mins": 67860, "fuente": "Correo del Sur", "tag": "Político", "titular": "Aprehenden al fiscal general Mariaca y al fiscal Zeballos", "resumen": "Investigación por presuntos vínculos con el narcotráfico tras la revocación de su visa de EE.UU.", "breaking": false, "keywords": ["Fiscalía", "narcotráfico"], "url": "https://correodelsur.com/seguridad/20261001/aprehenden-a-mariaca-y-del-castillo.html"},
  {"id": "n82", "t": "−48d", "mins": 69300, "fuente": "Visión 360", "tag": "Económico", "titular": "Moody’s sube la calificación de Bolivia a Caa2 con perspectiva positiva", "resumen": "Segunda mejora del año tras la de marzo.", "breaking": false, "keywords": ["Moody’s", "calificación"], "relacionados": ["EMBI"]},
  {"id": "n81", "t": "−57d", "mins": 82260, "fuente": "Infobae", "tag": "Social", "titular": "Sindicatos amenazan con protestas tras la eliminación del subsidio al diésel", "resumen": "El DS 5716 lleva el diésel a paridad de importación (Bs 17,95).", "breaking": false, "keywords": ["diésel", "subsidio", "COB"], "relacionados": ["IPC"], "url": "https://www.infobae.com/america/america-latina/2026/09/21/sindicatos-amenazaron-con-lanzar-nuevas-protestas-tras-la-eliminacion-del-subsidio-al-diesel-en-bolivia/"},
  {"id": "n80", "t": "−59d", "mins": 85140, "fuente": "Al Jazeera", "tag": "Político", "titular": "El Congreso de Bolivia aprueba el préstamo de USD 1.900 M del FMI", "resumen": "Primer programa plurianual con el FMI desde 2006.", "breaking": false, "keywords": ["FMI", "Asamblea"], "url": "https://www.aljazeera.com/news/2026/9/19/bolivias-congress-approves-1-9bn-imf-loan-amid-protest-threats"},
];

// ─────────────────────────────────────────────────────────────────────
// MÓDULO E — Calendario de eventos (ventana 17-nov → 17-dic 2026)
// Sólo hitos corroborados o inferidos del calendario de publicación (marcados «estim.»).
// ─────────────────────────────────────────────────────────────────────
export const EVENTOS: Evento[] = [
  // d = días desde el corte (17-nov-2026). «estim.» = fecha inferida del patrón de publicación.
  { d: 0, tag: 'Social', title: 'Huelga de hambre del magisterio urbano (en curso)', tone: 'neg' },
  { d: 1, tag: 'COB', title: 'Ampliado nacional de emergencia de la COB', tone: 'neg' },
  { d: 13, tag: 'INE', title: 'Comercio exterior de octubre (estim.)', tone: 'info' },
  { d: 14, tag: 'FMI', title: 'Primera revisión del EFF · diciembre (fecha a confirmar)', tone: 'accent' },
  { d: 18, tag: 'INE', title: 'IPC de noviembre (estim.)', tone: 'info' },
  { d: 28, tag: 'FMI', title: 'Segundo desembolso del EFF, ~USD 214 M (estim.)', tone: 'accent' },
];

// ─────────────────────────────────────────────────────────────────────
// MÓDULO F — Fuentes (estado al 17-nov-2026)
// ─────────────────────────────────────────────────────────────────────
export const FUENTES: Fuente[] = [
  { id: 'bcb', name: 'BCB · TCO y reservas', latency: 142, status: 'ok', last: '16 nov' },
  { id: 'ine', name: 'INE · IPC, PIB y comercio', latency: 286, status: 'ok', last: '05 nov' },
  { id: 'ypfb', name: 'YPFB · producción', latency: 980, status: 'lag', last: 'dic 2025' },
  { id: 'abc', name: 'ABC · transitabilidad', latency: 74, status: 'lag', last: '24 jun' },
  { id: 'embi', name: 'EMBI · JP Morgan', latency: 610, status: 'ok', last: '02 nov' },
  { id: 'p2p', name: 'Paralelo · P2P', latency: 11, status: 'ok', last: '16 nov' },
  { id: 'commodities', name: 'Commodities', latency: 64, status: 'ok', last: '16 nov' },
  { id: 'rate', name: 'Calificadoras', latency: null, status: 'ok', last: 'sep 2026' },
  { id: 'fmi', name: 'FMI · WEO', latency: null, status: 'ok', last: 'oct 2026' },
];
