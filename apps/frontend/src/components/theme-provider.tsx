import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: Theme) => void;
};

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';
const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

function subscribeToSystemTheme(onChange: () => void) {
  const mediaQuery = window.matchMedia(SYSTEM_THEME_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

const getSystemDarkMode = () => window.matchMedia(SYSTEM_THEME_QUERY).matches;

function readSavedTheme(storageKey: string, defaultTheme: Theme): Theme {
  try {
    const savedTheme = localStorage.getItem(storageKey);
    return savedTheme === 'dark' || savedTheme === 'light' || savedTheme === 'system' ? savedTheme : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState(() => readSavedTheme(storageKey, defaultTheme));
  const isSystemDarkMode = useSyncExternalStore(subscribeToSystemTheme, getSystemDarkMode);
  const resolvedTheme = theme === 'system' ? (isSystemDarkMode ? 'dark' : 'light') : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme);
      try {
        localStorage.setItem(storageKey, nextTheme);
      } catch {
        // Giao diện vẫn đổi khi trình duyệt không cho lưu localStorage.
      }
    },
    [storageKey],
  );
  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
}
