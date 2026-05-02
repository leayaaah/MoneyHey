import React, { useEffect } from 'react';
import { theme } from './theme';

/**
 * Lightweight ThemeProvider that exposes theme colors as CSS variables.
 * This keeps the project compatible with Bootstrap + plain CSS.
 */
export default function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, []);

  return <>{children}</>;
}
