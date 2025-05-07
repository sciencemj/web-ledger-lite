'use client';

import type { Theme } from '@/lib/types';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      // Store the resolved system theme if you want 'system' to reflect the actual applied theme
      // localStorage.setItem(storageKey, systemTheme); // Optional: store resolved theme
      return;
    }

    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);
  

  const value = {
    theme,
    setTheme: (newThemeOrCallback: SetStateAction<Theme>) => {
        setTheme(prevTheme => {
            const newTheme = typeof newThemeOrCallback === 'function' 
                ? newThemeOrCallback(prevTheme) 
                : newThemeOrCallback;
            if (typeof window !== 'undefined') {
                localStorage.setItem(storageKey, newTheme);
            }
            return newTheme;
        });
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
