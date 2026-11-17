// Organización visual del Módulo A: unos pocos indicadores DESTACADOS (tarjeta
// con gráfico grande) + el resto agrupado por categoría en paneles compactos.
// Los destacados son las tres variables que definen la coyuntura al corte:
// el tipo de cambio flexible, la inflación y las reservas.

export const FEATURED = ['usdbob_oficial', 'ipc', 'rin'];

export interface KpiGroupDef {
  title: string;
  ids: string[];
}

export const GROUPS: KpiGroupDef[] = [
  { title: 'Cambiario y riesgo', ids: ['usdbob_paralelo', 'brecha', 'embi', 'cobertura_importaciones'] },
  { title: 'Actividad y precios', ids: ['ipc_mensual', 'pib', 'gas', 'salario_minimo'] },
  { title: 'Fiscal, deuda y externo', ids: ['fiscal', 'deuda_externa', 'exportaciones', 'balanza_saldo'] },
];

/** Indicadores que sólo se muestran en la pestaña Histórico (no en la tira). */
export const SOLO_HISTORICO = ['cuenta_corriente', 'deuda_publica', 'desempleo', 'pobreza'];
