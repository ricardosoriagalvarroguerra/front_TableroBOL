// Motor analítico del tablero: indicadores DERIVADOS calculados en el cliente a
// partir de los datos de fuente (no son datos nuevos, son relaciones entre datos).
// Cada derivado trae su fórmula explícita y una interpretación por reglas
// transparentes, para que el usuario vea el razonamiento y no sólo la cifra.

import type { Kpi, ExternoData, CambiarioData, Estado } from './types';

/** Antiguo tipo de cambio fijo (venta) vigente nov-2011 → jun-2026. */
export const TC_FIJO = 6.96;
/** Meta de déficit del SPNF del PGE 2026 reformulado (% del PIB). */
export const META_FISCAL = -9.2;

export interface Derivado {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  formula: string;
  estado: Estado;
  lectura: string;
}

const c = (v: number, d = 1) => v.toFixed(d).replace('.', ',');

function val(kpis: Kpi[], id: string): number | null {
  const k = kpis.find((x) => x.id === id);
  return k ? k.value : null;
}

export function derivados(kpis: Kpi[], externo: ExternoData, cambiario: CambiarioData): Derivado[] {
  const tco = val(kpis, 'usdbob_oficial');
  const par = val(kpis, 'usdbob_paralelo');
  const ipc = val(kpis, 'ipc');
  const rin = val(kpis, 'rin');
  const fiscal = val(kpis, 'fiscal');
  const sal = kpis.find((k) => k.id === 'salario_minimo');
  const imp = externo.balanza.importaciones;
  const liq = cambiario.presion.rinLiquidas;
  const serv = externo.servicio.y2026;

  const out: Derivado[] = [];

  // 1. Brecha cambiaria: termómetro de la unificación.
  if (tco != null && par != null) {
    const b = (par / tco - 1) * 100;
    out.push({
      id: 'brecha',
      label: 'Brecha paralelo / oficial',
      value: b,
      unit: '%',
      formula: `paralelo ${c(par, 2)} ÷ TCO ${c(tco, 2)} − 1`,
      estado: Math.abs(b) <= 2 ? 'pos' : Math.abs(b) <= 10 ? 'neutral' : 'neg',
      lectura:
        Math.abs(b) <= 2
          ? 'Mercado unificado: el oficial flexible y el paralelo cotizan prácticamente igual.'
          : b > 10
            ? 'Premio elevado: el oficial no refleja la escasez de divisas y reaparece el mercado dual.'
            : 'Brecha moderada: hay fricciones en el acceso a divisas, pero sin mercado dual pleno.',
    });
  }

  // 2. Depreciación acumulada frente al viejo tipo fijo.
  if (tco != null) {
    const d = (tco / TC_FIJO - 1) * 100;
    out.push({
      id: 'deprec',
      label: 'Depreciación vs Bs 6,96',
      value: d,
      unit: '%',
      formula: `TCO ${c(tco, 2)} ÷ 6,96 − 1`,
      estado: d <= 40 ? 'neutral' : 'neg',
      lectura:
        'Mide cuánto se encareció el dólar oficial desde el fin del tipo fijo (26-jun-2026). Su traspaso a precios de importados es el principal riesgo inflacionario.',
    });
  }

  // 3. Salario mínimo real: poder de compra del ajuste salarial 2026.
  if (sal && ipc != null) {
    const nominal = sal.delta;
    const real = ((1 + nominal / 100) / (1 + ipc / 100) - 1) * 100;
    out.push({
      id: 'salario_real',
      label: 'Salario mínimo real',
      value: real,
      unit: '% a/a',
      formula: `(1 + ${c(nominal)}%) ÷ (1 + IPC ${c(ipc)}%) − 1`,
      estado: real >= 2 ? 'pos' : real >= -1 ? 'neutral' : 'neg',
      lectura:
        real >= 0
          ? 'El aumento nominal supera a la inflación: el salario mínimo gana poder de compra.'
          : 'La inflación se come el aumento: el salario mínimo pierde poder de compra.',
    });
  }

  // 4. Cobertura en divisas líquidas (excluye el oro, poco movilizable).
  if (liq != null && imp != null && imp > 0) {
    const m = liq / imp;
    out.push({
      id: 'cob_liquida',
      label: 'Cobertura en divisas',
      value: m,
      unit: 'meses',
      formula: `divisas ${Math.round(liq).toLocaleString('es-BO')} ÷ import. ${Math.round(imp).toLocaleString('es-BO')} / mes`,
      estado: m >= 3 ? 'pos' : m >= 1 ? 'neutral' : 'neg',
      lectura:
        m >= 3
          ? 'Colchón líquido suficiente (≥3 meses, umbral habitual del FMI).'
          : m >= 1
            ? 'Colchón líquido estrecho: el BCB depende del oro y del financiamiento externo.'
            : 'Menos de un mes de importaciones en divisas líquidas: vulnerabilidad aguda.',
    });
  }

  // 5. Servicio de deuda externa del año sobre la RIN.
  if (serv != null && rin != null && rin > 0) {
    const s = (serv / rin) * 100;
    out.push({
      id: 'servicio_rin',
      label: 'Servicio deuda / RIN',
      value: s,
      unit: '%',
      formula: `servicio 2026 ${serv.toLocaleString('es-BO')} ÷ RIN ${Math.round(rin).toLocaleString('es-BO')}`,
      estado: s <= 25 ? 'pos' : s <= 50 ? 'neutral' : 'neg',
      lectura:
        s > 50
          ? 'Los pagos de deuda del año equivalen a más de la mitad de las reservas: sin refinanciamiento, la RIN no alcanza.'
          : s > 25
            ? 'El servicio de deuda absorbe una porción relevante de las reservas: necesita roll-over o desembolsos.'
            : 'Servicio de deuda holgado frente a las reservas.',
    });
  }

  // 6. Déficit fiscal frente a la meta del PGE.
  if (fiscal != null) {
    const g = fiscal - META_FISCAL;
    out.push({
      id: 'brecha_fiscal',
      label: 'Déficit vs meta PGE',
      value: g,
      unit: 'pp PIB',
      formula: `resultado ${c(fiscal)}% − meta ${c(META_FISCAL)}%`,
      estado: g >= 0 ? 'pos' : g >= -2 ? 'neutral' : 'neg',
      lectura:
        g >= 0
          ? 'El resultado fiscal ya cumple la meta del presupuesto.'
          : `Faltan ${c(-g)} pp del PIB de ajuste para llegar a la meta: el ancla del programa con el FMI.`,
    });
  }

  return out;
}

export const estadoColor = (e: Estado) => (e === 'pos' ? 'var(--pos)' : e === 'neg' ? 'var(--neg)' : 'var(--accent)');
export const estadoSoft = (e: Estado) => (e === 'pos' ? 'var(--pos-soft)' : e === 'neg' ? 'var(--neg-soft)' : 'var(--accent-soft)');
