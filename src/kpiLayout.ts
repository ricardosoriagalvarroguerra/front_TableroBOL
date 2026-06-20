// Organización visual del Módulo A para reducir la sobrecarga de tarjetas:
// unos pocos indicadores DESTACADOS (tarjeta con gráfico grande) + el resto
// agrupado por categoría en paneles compactos.

export const FEATURED = ['ipc', 'usdbob_paralelo', 'rin'];

export interface KpiGroupDef {
  title: string;
  ids: string[];
}

export const GROUPS: KpiGroupDef[] = [
  { title: 'Cambiario', ids: ['usdbob_oficial', 'vrd', 'brecha', 'brecha_vrd'] },
  { title: 'Actividad y precios', ids: ['pib', 'gas', 'salario_minimo'] },
  { title: 'Fiscal, deuda y reservas', ids: ['fiscal', 'deuda_externa', 'cobertura_importaciones'] },
];
