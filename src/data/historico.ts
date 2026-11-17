// Series ANUALES 2015 → hoy por indicador (pestaña Histórico y vista «2015–hoy»
// del modal). Valor de cierre de cada año (o promedio/acumulado anual, según
// `nota`) y el último dato vigente como «2026*». Los años sin dato verificable
// se OMITEN (no se interpolan). Procedencia y confianza de cada serie:
// docs/SOURCES.md § Series históricas 2015→hoy.
import type { RatingHistoria } from '../types';

export interface SerieAnual {
  serie: { periodo: string; valor: number }[];
  nota?: string;
}

type Par = [string, number];
const s = (pares: Par[]) => pares.map(([periodo, valor]) => ({ periodo, valor }));

export const HISTORICO: Record<string, SerieAnual> = {
  usdbob_oficial: {
    serie: s([
      ['2015', 6.96], ['2016', 6.96], ['2017', 6.96], ['2018', 6.96], ['2019', 6.96], ['2020', 6.96],
      ['2021', 6.96], ['2022', 6.96], ['2023', 6.96], ['2024', 6.96], ['2025', 6.96], ['2026*', 11.67],
    ]),
    nota: 'Venta, fin de año · fijo hasta jun-2026, TCO flexible desde el 29-jun',
  },
  ipc: {
    serie: s([['2018', 1.51], ['2019', 1.47], ['2020', 0.67], ['2023', 2.12], ['2024', 9.97], ['2025', 20.4], ['2026*', 7.08]]),
    nota: 'Dic/dic · 2026* = oct i/a · años sin dato verificado omitidos',
  },
  pib: {
    serie: s([['2015', 4.8], ['2016', 4.3], ['2021', 6.1], ['2022', 3.5], ['2023', 3.1], ['2024', 0.73], ['2025', -1.58], ['2026*', -3.27]]),
    nota: 'Var. real anual · 2026* = acumulado 1S · 2017–2020 sin dato verificado',
  },
  rin: {
    serie: s([
      ['2015', 13056], ['2016', 10081], ['2017', 10261], ['2018', 8946], ['2019', 6468], ['2020', 5276],
      ['2021', 4752], ['2022', 3796], ['2023', 1709], ['2024', 1976], ['2025', 3713], ['2026*', 3978],
    ]),
    nota: 'USD M, fin de año · 2026* = 16-oct',
  },
  fiscal: {
    serie: s([
      ['2015', -6.9], ['2016', -6.6], ['2017', -7.8], ['2018', -8.1], ['2019', -7.2], ['2020', -12.7],
      ['2021', -9.3], ['2022', -7.1], ['2023', -10.9], ['2024', -10.1], ['2025', -12.2],
    ]),
    nota: 'Resultado global del SPNF, % del PIB',
  },
  deuda_externa: {
    serie: s([
      ['2016', 23.7], ['2017', 25.0], ['2020', 33.0], ['2021', 31.2], ['2022', 30.0], ['2023', 29.9],
      ['2024', 28.4], ['2025', 24.6], ['2026*', 26.1],
    ]),
    nota: 'Deuda externa pública MLP, % del PIB · 2026* = sep',
  },
  gas: {
    serie: s([
      ['2015', 58.9], ['2016', 56.3], ['2017', 54.9], ['2018', 51.2], ['2019', 45.1], ['2020', 44.9],
      ['2021', 43.2], ['2022', 41.3], ['2023', 35.97], ['2024', 29.3], ['2025', 27.34],
    ]),
    nota: 'Producción, MMm³/d · 2025 = dic',
  },
  salario_minimo: {
    serie: s([
      ['2015', 1656], ['2016', 1805], ['2017', 2000], ['2018', 2060], ['2019', 2122], ['2020', 2122],
      ['2021', 2164], ['2022', 2250], ['2023', 2362], ['2024', 2500], ['2025', 2750], ['2026*', 3300],
    ]),
    nota: 'Bs por mes · nominal',
  },
  exportaciones: {
    serie: s([['2016', 7214], ['2018', 9060], ['2019', 8880], ['2022', 13671], ['2023', 10911], ['2024', 8923], ['2025', 9701], ['2026*', 10350]]),
    nota: 'USD M FOB · 2026* = acumulado ene–sep',
  },
  balanza_saldo: {
    serie: s([['2016', -1213], ['2018', -936], ['2019', -899], ['2021', 1462], ['2022', 1801], ['2023', -585], ['2024', -845], ['2025', -327], ['2026*', 2237]]),
    nota: 'Saldo comercial anual, USD M · 2026* = ene–sep',
  },
  cuenta_corriente: {
    serie: s([
      ['2015', -5.8], ['2016', -5.6], ['2017', -5.0], ['2018', -4.5], ['2019', -3.3], ['2021', 2.0],
      ['2022', -0.3], ['2023', -2.7], ['2024', -2.7], ['2025', -2.1],
    ]),
    nota: '% del PIB · 2020 sin dato anual verificado',
  },
  pobreza: {
    serie: s([
      ['2016', 43.0], ['2017', 42.2], ['2018', 39.9], ['2019', 37.2], ['2020', 39.0], ['2021', 36.4],
      ['2022', 37.7], ['2023', 36.5], ['2024', 38.1], ['2025', 44.7],
    ]),
    nota: 'Pobreza moderada, % · metodología INE 2020 (base 2016)',
  },
  embi: {
    serie: s([['2022', 564], ['2023', 2233], ['2024', 2087], ['2025', 673], ['2026*', 494]]),
    nota: 'pb, fin de año · 2026* = 2-nov',
  },
};

/** Calificación soberana vigente a fin de cada año (S&P / Moody's / Fitch).
 *  Sólo años corroborados: 2015–2024 queda pendiente de verificación. */
export const RATINGS_HIST: RatingHistoria[] = [
  { anio: '2025', sp: 'CCC−', moodys: 'Ca', fitch: 'CCC−' },
  { anio: '2026*', sp: 'CCC+', moodys: 'Caa2', fitch: 'CCC' },
];
