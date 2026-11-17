// Configuración del país del tablero. Los componentes de Región, Alertas y Nota
// son agnósticos y leen el país de aquí (en el tablero URU: iso 'URY', hermano 'BOL').
export const PAIS = {
  iso: 'BOL',
  nombre: 'Bolivia',
  tablero: 'Tablero BOL',
  /** País del tablero hermano, resaltado en el comparador regional. */
  hermano: { iso: 'URY', nombre: 'Uruguay', url: 'https://front-tablero-uru.up.railway.app' },
} as const;
