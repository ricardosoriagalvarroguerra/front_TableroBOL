import { createContext, useContext } from 'react';
import type { Theme } from './types';

/**
 * Theme context. Every SVG root keys on this value so React remounts them on
 * toggle and the browser re-resolves the CSS custom properties fresh.
 */
export const ThemeContext = createContext<Theme>('dark');

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
