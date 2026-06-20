// Carga perezosa (lazy) del scatter electoral por nivel de granularidad.
// Cada nivel es un chunk aparte (Vite lo separa por el import() dinámico), así
// el bundle inicial no carga los 3.730 puntos: solo se baja el nivel que se pide,
// y queda cacheado. dept ~1 KB · prov ~6 KB · muni ~17 KB · loc ~189 KB.

import type { LocPunto } from '../types';

export type Granularidad = 'departamento' | 'provincia' | 'municipio' | 'localidad';

export const GRANULARIDADES: { id: Granularidad; label: string }[] = [
  { id: 'departamento', label: 'Dpto' },
  { id: 'provincia', label: 'Prov' },
  { id: 'municipio', label: 'Muni' },
  { id: 'localidad', label: 'Local' },
];

const importers: Record<Granularidad, () => Promise<{ default: LocPunto[] }>> = {
  departamento: () => import('./localidades/dept'),
  provincia: () => import('./localidades/prov'),
  municipio: () => import('./localidades/muni'),
  localidad: () => import('./localidades/loc'),
};

const cache: Partial<Record<Granularidad, LocPunto[]>> = {};

export async function loadLocalidades(g: Granularidad): Promise<LocPunto[]> {
  const hit = cache[g];
  if (hit) return hit;
  const mod = await importers[g]();
  cache[g] = mod.default;
  return mod.default;
}
