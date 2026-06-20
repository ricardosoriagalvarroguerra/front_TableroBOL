// Resultados electorales REALES de Bolivia, para cruzar con los bloqueos en el mapa.
// · Presidencial 2025: 1ª vuelta 17-ago, balotaje 19-oct (cómputo oficial OEP).
//   Verificado adversarialmente (triple fuente para el ganador por dpto).
// · Subnacional/municipal 2026: 1ª vuelta 22-mar; las nuevas autoridades asumieron
//   en mayo-2026. Gobierno municipal de cada capital departamental.
// Procedencia y caveats en docs/SOURCES.md.

import type { DeptEleccion } from '../types';

export const ELEC_NACIONAL = {
  frFecha: '17 ago 2025',
  roFecha: '19 oct 2025',
  muniFecha: '22 mar 2026',
  fr: { paz: 32.06, quiroga: 26.7, doria: 19.69, andronico: 8.51 },
  ro: { paz: 54.96, quiroga: 45.04, winner: 'paz' as const },
} as const;

// Orden: por concentración de bloqueos (occidente andino + Chapare primero).
export const ELECCIONES: DeptEleccion[] = [
  { id: 'lapaz', nombre: 'La Paz', fr_paz: 47.05, fr_quiroga: 16.17, fr_doria: 16.09, fr_andronico: 9.08, fr_winner: 'paz', ro_paz: 66.03, ro_quiroga: 33.97, ro_winner: 'paz', muni_partido: 'Innovación Humana', muni_alcalde: 'César Dockweiler' },
  { id: 'cochabamba', nombre: 'Cochabamba', fr_paz: 28.62, fr_quiroga: 28.14, fr_doria: 10.11, fr_andronico: 12.58, fr_winner: 'paz', ro_paz: 61.29, ro_quiroga: 38.71, ro_winner: 'paz', muni_partido: 'APB-Súmate', muni_alcalde: 'Manfred Reyes Villa' },
  { id: 'oruro', nombre: 'Oruro', fr_paz: 48.39, fr_quiroga: 23.88, fr_doria: 7.25, fr_andronico: 7.01, fr_winner: 'paz', ro_paz: 60.36, ro_quiroga: 39.64, ro_winner: 'paz', muni_partido: 'Nueva Generación Patriótica', muni_alcalde: 'Iván Quispe' },
  { id: 'potosi', nombre: 'Potosí', fr_paz: 43.2, fr_quiroga: 22.9, fr_doria: 9.74, fr_andronico: 9.73, fr_winner: 'paz', ro_paz: 63.38, ro_quiroga: 36.62, ro_winner: 'paz', muni_partido: 'Movimiento Tercer Sistema', muni_alcalde: 'Williams Cervantes' },
  { id: 'chuquisaca', nombre: 'Chuquisaca', fr_paz: 35.48, fr_quiroga: 30.89, fr_doria: 12.85, fr_andronico: 8.38, fr_winner: 'paz', ro_paz: 53.72, ro_quiroga: 46.28, ro_winner: 'paz', muni_partido: 'Alianza Gente Nueva', muni_alcalde: 'Marcela Mendoza' },
  { id: 'santacruz', nombre: 'Santa Cruz', fr_paz: 19.48, fr_quiroga: 37.67, fr_doria: 28.07, fr_andronico: 5.33, fr_winner: 'quiroga', ro_paz: 38.5, ro_quiroga: 61.5, ro_winner: 'quiroga', muni_partido: 'APB-Súmate', muni_alcalde: 'Carlos Manuel Saavedra' },
  { id: 'tarija', nombre: 'Tarija', fr_paz: 19.3, fr_quiroga: 21.94, fr_doria: 37.71, fr_andronico: 8.32, fr_winner: 'doria', ro_paz: 49.69, ro_quiroga: 50.31, ro_winner: 'quiroga', muni_partido: 'Alianza Primero Tarija', muni_alcalde: 'Jhonny Torres' },
  { id: 'beni', nombre: 'Beni', fr_paz: 14.08, fr_quiroga: 24.34, fr_doria: 38.28, fr_andronico: 11.13, fr_winner: 'doria', ro_paz: 45.97, ro_quiroga: 54.03, ro_winner: 'quiroga', muni_partido: 'Alianza Patria Unidos', muni_alcalde: 'Mauricio Barba' },
  { id: 'pando', nombre: 'Pando', fr_paz: 21.7, fr_quiroga: 29.05, fr_doria: 21.48, fr_andronico: 8.81, fr_winner: 'quiroga', ro_paz: 54.83, ro_quiroga: 45.17, ro_winner: 'paz', muni_partido: 'Libre Pando', muni_alcalde: 'Diego Suárez' },
];

export const ELEC_BY_ID: Record<string, DeptEleccion> = Object.fromEntries(
  ELECCIONES.map((e) => [e.id, e]),
);

export const CAND_LABEL: Record<string, string> = {
  paz: 'Rodrigo Paz (PDC)',
  quiroga: 'Jorge Quiroga (Alianza Libre)',
  andronico: 'Andrónico Rodríguez (AP)',
  doria: 'Samuel Doria Medina (APB)',
  otro: 'otro',
};

/** Color de relleno por ganador del balotaje (Paz ámbar / Quiroga gris pizarra). */
export const WINNER_COLOR: Record<'paz' | 'quiroga', string> = {
  paz: 'var(--accent)',
  quiroga: 'var(--fg-muted)',
};

/** Colores de los partidos de la presidencial 2025 (índice = PARTIDOS_2025).
 *  Definidos por el usuario; alimentan el scatter de localidades. */
export const PARTIDO_COLOR_2025: string[] = [
  '#38bdf8', // 0 AP — celeste (Andrónico Rodríguez)
  '#1f1f1f', // 1 LYP AND — negro (Pavel Aracena)
  '#a855f7', // 2 APB SUMATE — morado (Manfred Reyes Villa)
  '#ef4444', // 3 LIBRE — rojo (Jorge Quiroga)
  '#9ca3af', // 4 FP — plomo (Jhonny Fernández)
  '#2563eb', // 5 MAS-IPSP — azul (Eduardo del Castillo)
  '#f97316', // 6 MORENA — naranja
  '#eab308', // 7 UNIDAD — amarillo (Samuel Doria Medina)
  '#22c55e', // 8 PDC — verde (Rodrigo Paz)
];
export const PARTIDO_LABEL_2025: string[] = [
  'AP', 'LYP-AND', 'APB-Súmate', 'LIBRE', 'FP', 'MAS-IPSP', 'MORENA', 'UNIDAD', 'PDC',
];

/** Sigla compacta del partido municipal, para la etiqueta del mapa. */
export const PARTY_ABBR: Record<string, string> = {
  'Innovación Humana': 'IH',
  'APB-Súmate': 'APB',
  'Nueva Generación Patriótica': 'NGP',
  'Movimiento Tercer Sistema': 'MTS',
  'Alianza Gente Nueva': 'AGN',
  'Alianza Primero Tarija': 'APT',
  'Alianza Patria Unidos': 'APU',
  'Libre Pando': 'LP',
};
