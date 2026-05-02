import React, { useEffect } from 'react';
import { theme } from './theme';

export default function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, []);

  return <>{children}</>;
}
