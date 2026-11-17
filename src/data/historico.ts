// Series ANUALES 2015 → hoy por indicador (pestaña Histórico y vista «2015–hoy»
// del modal). Valor de cierre de cada año (o promedio/acumulado anual, según
// `nota`) y el último dato vigente como «2026*». Los años sin dato verificable
// se OMITEN (no se interpolan). PIB, IPC y comercio: series oficiales del INE. Procedencia y confianza de cada serie:
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
    serie: s([
      ['2015', 2.95], ['2016', 4.0], ['2017', 2.71], ['2018', 1.51], ['2019', 1.47], ['2020', 0.67],
      ['2021', 0.9], ['2022', 3.12], ['2023', 2.12], ['2024', 9.97], ['2025', 20.4], ['2026*', 7.08],
    ]),
    nota: 'Dic/dic · 2026* = oct i/a',
  },

  pib: {
    serie: s([
      ['2015', 4.86], ['2016', 4.26], ['2017', 4.2], ['2018', 4.22], ['2019', 2.22], ['2020', -8.74],
      ['2021', 6.11], ['2022', 3.61], ['2023', 3.08], ['2024', 0.73], ['2025', -1.58], ['2026*', -3.27],
    ]),
    nota: 'Var. real anual (base 1990) · 2017–2025 preliminares · 2026* = acumulado 1S',
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
    serie: s([
      ['2015', 8923], ['2016', 7259], ['2017', 8367], ['2018', 9110], ['2019', 8933], ['2020', 7093],
      ['2021', 11259], ['2022', 13924], ['2023', 10935], ['2024', 9059], ['2025', 9702], ['2026*', 10350],
    ]),
    nota: 'USD M FOB · 2024–2025 preliminares · 2026* = acumulado ene–sep',
  },

  balanza_saldo: {
    serie: s([
      ['2015', -920], ['2016', -1305], ['2017', -1007], ['2018', -892], ['2019', -891], ['2020', 137],
      ['2021', 2139], ['2022', 2028], ['2023', -850], ['2024', -845], ['2025', -362], ['2026*', 2237],
    ]),
    nota: 'Export. FOB − import. CIF, USD M · 2026* = ene–sep',
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
  deuda_publica: {
    serie: s([
      ['2015', 34.0], ['2016', 38.2], ['2017', 41.9], ['2018', 44.2], ['2019', 48.9], ['2020', 67.5],
      ['2021', 68.7], ['2022', 69.2], ['2023', 78.3], ['2024', 83.2], ['2025', 83.3],
    ]),
    nota: 'Deuda bruta del gobierno general, % PIB (FMI, WEO oct-2026) · 2025 estimado',
  },
  desempleo: {
    serie: s([
      ['2015', 4.6], ['2016', 4.7], ['2017', 5.1], ['2018', 4.9], ['2019', 5.0], ['2020', 8.3],
      ['2021', 6.9], ['2022', 4.7], ['2023', 4.1], ['2024', 3.7], ['2025', 3.3], ['2026*', 3.4],
    ]),
    nota: 'Desempleo urbano, % promedio anual (INE vía FMI WEO) · 2026* = 2T',
  },
  embi: {
    serie: s([
      ['2015', 250], ['2016', 83], ['2017', 203], ['2018', 378], ['2019', 218], ['2020', 461],
      ['2021', 412], ['2022', 563], ['2023', 2233], ['2024', 2087], ['2025', 673], ['2026*', 499],
    ]),
    nota: 'pb, último día hábil del año (JP Morgan, serie del BCRD) · 2026* = 13/11',
  },

};

/** Calificación soberana vigente a fin de cada año (S&P / Moody's / Fitch).
 *  S&P: historial de Trading Economics; Moody's y Fitch: countryeconomy.com,
 *  contrastado con las acciones de 2023–2026 reportadas por prensa. */
export const RATINGS_HIST: RatingHistoria[] = [
  { anio: '2015', sp: 'BB', moodys: 'Ba3', fitch: 'BB' },
  { anio: '2016', sp: 'BB', moodys: 'Ba3', fitch: 'BB−' },
  { anio: '2017', sp: 'BB', moodys: 'Ba3', fitch: 'BB−' },
  { anio: '2018', sp: 'BB−', moodys: 'Ba3', fitch: 'BB−' },
  { anio: '2019', sp: 'BB−', moodys: 'Ba3', fitch: 'B+' },
  { anio: '2020', sp: 'B+', moodys: 'B2', fitch: 'B' },
  { anio: '2021', sp: 'B+', moodys: 'B2', fitch: 'B' },
  { anio: '2022', sp: 'B', moodys: 'B2', fitch: 'B' },
  { anio: '2023', sp: 'CCC+', moodys: 'Caa1', fitch: 'B−' },
  { anio: '2024', sp: 'CCC+', moodys: 'Caa3', fitch: null },
  { anio: '2025', sp: 'CCC−', moodys: 'Ca', fitch: 'CCC−' },
  { anio: '2026*', sp: 'CCC+', moodys: 'Caa2', fitch: 'CCC' },
];
