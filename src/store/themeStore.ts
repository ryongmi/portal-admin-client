import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setActualTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: 'system',
  actualTheme: 'light',
  setTheme: (theme): void => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  setActualTheme: (actualTheme): void => set({ actualTheme }),
  toggleTheme: (): void => {
    const newTheme = get().actualTheme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
}));
