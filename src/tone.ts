// Lógica de color direccional de los indicadores.
//
// Cada indicador tiene una POLARIDAD: si lo "bueno" es que SUBA ('up') o que
// BAJE ('down'), o si es neutral ('none'). El color del delta y de la tendencia
// se calcula a partir de la polaridad + el signo del cambio:
//   inflación que baja  → verde   ·  inflación que sube → rojo
//   reservas que suben  → verde   ·  reservas que bajan → rojo
//
// Es conocimiento de dominio estable; vive en el cliente (no en la BDR) porque
// es presentación. Si en el futuro conviene, se puede mover a una columna
// `polaridad` en la tabla `indicadores`.

import type { Sentiment } from './types';

export type Polarity = 'up' | 'down' | 'none'; // 'up' = más alto es mejor

const POLARITY: Record<string, Polarity> = {
  usdbob_oficial: 'none', // fijo por política
  usdbob_paralelo: 'down', // un paralelo más bajo = menor brecha = bueno
  vrd: 'down', // referencia más baja = menos depreciación = bueno
  brecha: 'down', // brecha más chica = bueno
  rin: 'up', // más reservas = bueno
  ipc: 'down', // menos inflación = bueno
  pib: 'up', // más crecimiento = bueno
  fiscal: 'up', // déficit menos negativo (hacia 0) = bueno
  gas: 'up', // más producción = bueno
  deuda_externa: 'down', // menos deuda/PIB = bueno
  salario_minimo: 'up', // mayor salario = bueno (social)
  brecha_vrd: 'down', // brecha vs VRD más chica = más unificado/normalizado
  cobertura_importaciones: 'up', // más meses de cobertura = bueno
  // métricas de mercado / externo (clickeables)
  embi: 'down', // menor riesgo país = bueno
  balanza_saldo: 'up', // superávit = bueno
  BOL28: 'up', // mayor precio del bono = bueno
  BOL31: 'up',
  oro: 'up', plata: 'up', zinc: 'up', estano: 'up', soya: 'up', // exportaciones: más precio = bueno
  gas_hh: 'none', // referencia EE.UU., no exportación directa
};

export const polarityOf = (id: string): Polarity => POLARITY[id] ?? 'none';

/** Color del delta puntual según hacia dónde se movió. */
export function deltaTone(polarity: Polarity, delta: number): Sentiment {
  if (polarity === 'none' || delta === 0) return 'neutral';
  const favorable = polarity === 'up' ? delta > 0 : delta < 0;
  return favorable ? 'pos' : 'neg';
}

/** Color de la tendencia (serie completa: último vs primero). */
export function trendTone(polarity: Polarity, serie: number[] | undefined): Sentiment {
  if (polarity === 'none' || !serie || serie.length < 2) return 'neutral';
  const change = serie[serie.length - 1] - serie[0];
  if (change === 0) return 'neutral';
  const favorable = polarity === 'up' ? change > 0 : change < 0;
  return favorable ? 'pos' : 'neg';
}
