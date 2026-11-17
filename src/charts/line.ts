// Generadores de gráficos con d3 (escalas + shapes), compartidos por los gráficos
// de indicadores. d3 hace la geometría; los componentes React renderizan el SVG.
// d3.js es la base de todos los gráficos de indicadores del tablero (sparklines,
// tarjetas destacadas, modal de serie histórica, donuts).

import { scaleLinear, type ScaleLinear } from 'd3-scale';
import { line as d3line, area as d3area, arc as d3arc, pie as d3pie, curveMonotoneX, curveLinear } from 'd3-shape';
import { extent, bisector } from 'd3-array';

export interface LineChart {
  /** Path `d` de la línea. */
  line: string;
  /** Path `d` del área bajo la línea (relleno). */
  area: string;
  /** Escalas d3 (útiles para ejes, interacción y posicionar marcadores). */
  x: ScaleLinear<number, number>;
  y: ScaleLinear<number, number>;
  /** Puntos proyectados [px, py] de cada dato. */
  points: [number, number][];
}

/**
 * Construye los paths de línea + área de una serie con d3-scale y d3-shape.
 * @param data   serie de valores
 * @param width  ancho del viewBox
 * @param height alto del viewBox
 * @param pad    margen vertical en px (evita que la curva toque los bordes)
 * @param smooth curva monótona (true) o segmentos rectos (false)
 */
export function buildLineChart(
  data: number[],
  width: number,
  height: number,
  pad = 1,
  smooth = true,
): LineChart {
  const n = Math.max(1, data.length - 1);
  const x = scaleLinear().domain([0, n]).range([0, width]);

  let [min, max] = extent(data) as [number, number];
  if (min === undefined) { min = 0; max = 1; }
  if (min === max) { min -= 1; max += 1; } // serie plana → centrada
  const y = scaleLinear().domain([min, max]).range([height - pad, pad]);

  const points = data.map((v, i) => [x(i), y(v)] as [number, number]);
  const curve = smooth ? curveMonotoneX : curveLinear;

  const lineGen = d3line<[number, number]>().x((d) => d[0]).y((d) => d[1]).curve(curve);
  const areaGen = d3area<[number, number]>().x((d) => d[0]).y0(height).y1((d) => d[1]).curve(curve);

  return {
    line: lineGen(points) ?? '',
    area: areaGen(points) ?? '',
    x,
    y,
    points,
  };
}

/** Bisector por índice, para encontrar el punto más cercano al cursor. */
export const indexBisector = bisector((_d: number, i: number) => i).center;

export interface DonutArc {
  /** Path `d` del segmento de anillo. */
  d: string;
  color: string;
  value: number;
}

/**
 * Genera los segmentos de un donut con d3-shape (pie + arc).
 * @param data   valores con su color
 * @param size   lado del SVG cuadrado
 * @param stroke grosor del anillo
 */
export function buildDonut(
  data: { value: number; color: string }[],
  size: number,
  stroke: number,
): DonutArc[] {
  const radius = size / 2;
  const pieGen = d3pie<{ value: number; color: string }>()
    .value((d) => d.value)
    .sortValues(null)
    .padAngle(0.012);
  const arcGen = d3arc<{ startAngle: number; endAngle: number }>()
    .innerRadius(radius - stroke)
    .outerRadius(radius)
    .cornerRadius(1);

  return pieGen(data).map((slice) => ({
    d: arcGen(slice) ?? '',
    color: slice.data.color,
    value: slice.data.value,
  }));
}
