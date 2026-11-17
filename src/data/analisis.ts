// Capa analítica (Módulo Z): juicio explícito y fechado sobre los datos de fuente.
// Todo lo que está aquí es LECTURA del tablero (no dato oficial): las cifras que
// cita salen de mockData/series y de docs/SOURCES.md; las probabilidades de los
// escenarios son subjetivas. Se sirve también desde la BDR (tabla `analisis`).
import type { AnalisisData } from '../types';

export const ANALISIS: AnalisisData = {
  asof: '17-nov-2026',
  tesis: {
    titulo: 'Bolivia consiguió el ancla externa; ahora la recesión y la inflación ponen a prueba el ajuste',
    bajada:
      'El tipo de cambio flexible unificó el mercado y el FMI, el BID y el Banco Mundial aportan divisas, pero la economía cayó 3,3% en el primer semestre y el retiro de subsidios reaviva la inflación y la protesta.',
    puntos: [
      'El TCO unificó el mercado (brecha de +2,4%) y FMI, BID y BM comprometen más de USD 3.000 M: bajó el riesgo de crisis cambiaria.',
      'El PIB cayó 3,27% en el 1S y la inflación repunta (7,08% en octubre) tras liberar el diésel.',
      'Diciembre es la prueba: primera revisión del FMI y retiro del subsidio a la gasolina con la COB movilizada.',
      'El auge exportador (+54% ene–sep) sostiene la balanza, pero 82% de la RIN sigue siendo oro.',
      'La deuda externa (26% del PIB) es manejable; la interna y el déficit (12% en 2025) son el problema.',
      'La política suma ruido: ruptura Paz–Lara, audios de Cerimedo y órdenes de captura contra Evo Morales.',
    ],
  },
  semaforo: [
    { id: 'precios', dimension: 'Precios', estado: 'neutral', score: 3, tendencia: 'empeora', ancla: 'IPC 7,08% i/a · +2,07% m', lectura: 'La interanual bajó de 20% por efecto base, pero el ritmo mensual volvió a 2% con el diésel y los pasajes.' },
    { id: 'cambiario', dimension: 'Cambiario', estado: 'pos', score: 4, tendencia: 'estable', ancla: 'TCO 11,67 · brecha +2,4%', lectura: 'Mercado unificado; el TCO oscila en una banda de 11,6–12,2 desde octubre tras la volatilidad de septiembre.' },
    { id: 'reservas', dimension: 'Reservas', estado: 'neg', score: 2, tendencia: 'mejora', ancla: 'RIN 3.978 M · divisas 647 M', lectura: 'Suben por compras de oro y el desembolso del FMI, pero las divisas líquidas cubren menos de un mes de importaciones.' },
    { id: 'actividad', dimension: 'Actividad', estado: 'neg', score: 1, tendencia: 'empeora', ancla: 'PIB 1S −3,27% · 2T −5,94%', lectura: 'Recesión profundizada por los bloqueos; FMI y Banco Mundial esperan −3% en 2026 y otra caída en 2027.' },
    { id: 'fiscal', dimension: 'Fiscal', estado: 'neg', score: 2, tendencia: 'mejora', ancla: 'Déficit 2025 −12,2% · meta 26 −9,2%', lectura: 'El ajuste avanza (diésel a paridad, PGE 2027 con −6,7% y sin BCB), pero desde un déficit muy alto.' },
    { id: 'externo', dimension: 'Sector externo', estado: 'pos', score: 4, tendencia: 'mejora', ancla: 'Saldo ene–sep +2.237 M', lectura: 'Exportaciones récord por minería y soya, e importaciones contenidas: la cuenta corriente pasó a superávit.' },
    { id: 'credito', dimension: 'Crédito soberano', estado: 'neutral', score: 2, tendencia: 'mejora', ancla: 'EMBI 494 pb · Caa2 / CCC+', lectura: 'Moody’s subió a Caa2 en septiembre; el riesgo país repuntó de ~400 a ~500 pb con la volatilidad.' },
    { id: 'social', dimension: 'Social', estado: 'neg', score: 2, tendencia: 'empeora', ancla: 'Pobreza 44,7% · COB en emergencia', lectura: 'La pobreza saltó 6,6 pp en 2025; magisterio y COB presionan antes del retiro del subsidio a la gasolina.' },
  ],
  proyecciones: [
    { fuente: 'FMI · WEO', fecha: 'oct-26', pib2026: -3.0, pib2027: -1.5, ipc2026: null, ipc2027: null, tc2026: null, fiscal2026: -9.2 },
    { fuente: 'Banco Mundial', fecha: 'oct-26', pib2026: -2.8, pib2027: null, ipc2026: null, ipc2027: null, tc2026: null, fiscal2026: null },
    { fuente: 'BCB', fecha: 'oct-26', pib2026: -3.39, pib2027: null, ipc2026: 9.92, ipc2027: null, tc2026: null, fiscal2026: null },
    { fuente: 'Encuesta BCB', fecha: 'sep-26', pib2026: -2.7, pib2027: null, ipc2026: null, ipc2027: null, tc2026: null, fiscal2026: null },
    { fuente: 'Gobierno · PGE 2027', fecha: 'oct-26', pib2026: null, pib2027: null, ipc2026: null, ipc2027: 10.4, tc2026: null, fiscal2026: -9.2 },
    { fuente: 'CEPAL', fecha: 'oct-26', pib2026: 0.2, pib2027: 0.6, ipc2026: null, ipc2027: null, tc2026: null, fiscal2026: null },
  ],
  escenarios: [
    {
      id: 'base',
      nombre: 'Ajuste con ancla',
      probabilidad: 55,
      pib2027: -1.5,
      ipc2027: 10,
      narrativa: 'El EFF avanza con demoras, el subsidio a la gasolina se retira por etapas y el TCO se mantiene en 11,5–13. La economía sigue cayendo, pero menos.',
      gatillos: ['Primera revisión del FMI aprobada', 'PGE 2027 vigente con −6,7%', 'Brecha cambiaria bajo 5%'],
    },
    {
      id: 'optimista',
      nombre: 'Rebote con inversión',
      probabilidad: 20,
      pib2027: 0.6,
      ipc2027: 7,
      narrativa: 'Nueva ley de hidrocarburos e inversión privada (Repsol), oro y soya firmes y desembolsos multilaterales a tiempo: estabilización y rebote moderado.',
      gatillos: ['Ley de hidrocarburos aprobada', 'EMBI bajo 400 pb', 'RIN líquida sobre USD 1.500 M'],
    },
    {
      id: 'riesgo',
      nombre: 'Ruptura social',
      probabilidad: 25,
      pib2027: -4,
      ipc2027: 18,
      narrativa: 'El retiro del subsidio desata una ola de bloqueos como la de mayo–junio, se traba la revisión del FMI y el TCO salta: vuelve la inflación de dos dígitos.',
      gatillos: ['Bloqueos nacionales por más de 2 semanas', 'TCO sobre Bs 13', 'Revisión del EFF postergada'],
    },
  ],
  riesgos: [
    { titulo: 'Retiro del subsidio a la gasolina', detalle: 'YPFB habla del 12-ene; el traspaso a precios y la reacción social son el mayor riesgo de corto plazo.', tipo: 'riesgo', impacto: 'alto', horizonte: 'ene 2027' },
    { titulo: 'Frente COB–magisterio', detalle: 'Huelga de hambre docente y ampliado de emergencia de la COB (18-nov).', tipo: 'riesgo', impacto: 'alto', horizonte: 'nov–dic' },
    { titulo: 'Primera revisión del EFF', detalle: 'Metas de fin de septiembre y medidas de octubre; condiciona el segundo desembolso.', tipo: 'riesgo', impacto: 'medio', horizonte: 'dic 2026' },
    { titulo: 'Volatilidad del TCO', detalle: 'En septiembre fue de 12,64 a 9,83 en ocho días; las divisas líquidas son escasas.', tipo: 'riesgo', impacto: 'medio', horizonte: 'continuo' },
    { titulo: 'Precio del oro', detalle: '82% de la RIN es oro; cayó 6,6% en el mes.', tipo: 'riesgo', impacto: 'medio', horizonte: '3–6 meses' },
    { titulo: 'Crisis política', detalle: 'Ruptura con el vicepresidente Lara, audios de Cerimedo y Evo Morales atrincherado en el Chapare.', tipo: 'riesgo', impacto: 'medio', horizonte: 'continuo' },
    { titulo: 'Auge exportador', detalle: 'Exportaciones ene–sep de USD 10.350 M (+54%), por encima de todo 2025.', tipo: 'oportunidad', impacto: 'alto', horizonte: 'en curso' },
    { titulo: 'Financiamiento multilateral', detalle: 'BID USD 750 M, Banco Mundial USD 500 M y CAF USD 224 M además del FMI.', tipo: 'oportunidad', impacto: 'medio', horizonte: '6–12 meses' },
    { titulo: 'Nueva ley de hidrocarburos', detalle: 'Prometida antes de fin de año; Paz se reunió con Repsol en Madrid.', tipo: 'oportunidad', impacto: 'medio', horizonte: '2027' },
  ],
  lecturas: {
    historico:
      'Una década en una línea: las reservas pasaron de USD 13.056 M (2015) a 1.709 M (2023) con el tipo de cambio fijo, y el déficit fiscal nunca bajó de 6,6% del PIB. La deuda pública total pasó de 34% a 83% del PIB y la nota soberana cayó de BB a CCC−. El quiebre de 2026 (TCO flexible y FMI) es la respuesta a ese desgaste.',
    region:
      'Bolivia es el único de los 9 países que el FMI ve en recesión en 2026 (−3,0%), tiene la segunda inflación más alta tras Argentina, el mayor déficit fiscal (−11,4% del PIB en 2025) y la deuda pública que más creció desde 2015 (+49 pp). Uruguay, en azul, es el contraste: crece poco pero estable y con la inflación en meta. Fuente: FMI, WEO oct-2026; 2026–2027 son proyecciones.',
    cambiario:
      'El régimen flexible cumplió su objetivo de unificar el mercado: la brecha pasó de ~42% a cerca de 0. Septiembre mostró la fragilidad (12,64 → 9,83 en ocho días); desde octubre el TCO se mueve en 11,6–12,2.',
    bloqueos:
      'No hay ola nacional de bloqueos desde el 23-jun, pero la conflictividad se desplazó a focos sectoriales (diésel, magisterio, Chapare). El retiro del subsidio a la gasolina es el próximo detonante probable.',
    externo:
      'La balanza comercial es la mejor noticia del año: superávit de USD 2.237 M en ene–sep por la minería y la soya, y el complejo soya ya supera al gas. La deuda externa (26,1% del PIB) no es el cuello de botella.',
    mercados:
      'El crédito soberano mejoró (Moody’s Caa2) pero sigue en zona de default probable. El EMBI repuntó a ~500 pb en sep–oct; no hay cotizaciones públicas recientes de los bonos 2028 y 2031.',
  },
  kpiLecturas: {
    usdbob_oficial: 'Tras el pico de septiembre, el TCO se estabilizó en 11,6–12,2. Una ruptura de esa banda sería la primera señal de estrés.',
    usdbob_paralelo: 'El paralelo sigue al TCO a 1–3%: ya no es un mercado separado.',
    brecha: 'Brecha bajo 5% = mercado unificado. Volver a dos dígitos indicaría racionamiento de divisas.',
    rin: 'El total mejora, pero lo relevante para defender el TCO son las divisas líquidas (647 M).',
    cobertura_importaciones: 'Con oro la cobertura parece holgada; sin él, no llega a un mes.',
    embi: 'Bajo 400 pb el mercado volvería a abrirse para Bolivia; sobre 700 pb, se cierra.',
    ipc: 'La caída desde 20% fue efecto base. El dato a mirar es el mensual: 2% por mes es inflación anualizada de ~27%.',
    ipc_mensual: 'Tres de los últimos cuatro meses subieron; noviembre recogerá más traspaso del diésel.',
    pib: 'El 2T (−5,94%) es el peor trimestre desde la pandemia; el 2S debería mostrar rebote técnico.',
    gas: 'El declive del gas es estructural: Bolivia ya exporta más soya que gas.',
    salario_minimo: 'El aumento de 20% de enero perdió parte de su poder de compra con la inflación; 2027 abre negociación con la COB.',
    fiscal: 'El superávit de ene–may es estacional; el cierre de 2026 dependerá de los subsidios.',
    deuda_externa: 'Manejable y mayormente multilateral; el riesgo está en la deuda interna con el BCB.',
    exportaciones: 'El auge depende del oro: un giro del precio lo revierte rápido.',
    balanza_saldo: 'Doce meses seguidos de superávit (oct-25 → sep-26); las importaciones contenidas también reflejan la recesión.',
    cuenta_corriente: 'El giro a superávit en 2026 es por el ajuste de importaciones más que por un cambio estructural.',
    pobreza: 'La inflación de 2025 revirtió una década de reducción de pobreza.',
    deuda_publica: 'La deuda que preocupa es la interna con el BCB: el FMI la ve cerca de 100% del PIB en 2026.',
    desempleo: 'El desempleo abierto es bajo porque la informalidad absorbe el ajuste; no refleja la recesión.',
  },
};
