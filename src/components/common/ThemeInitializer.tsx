'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeInitializer(): null {
  const { theme, setTheme, setActualTheme } = useThemeStore();

  // localStorage에서 초기 테마 로드 (마운트 시 1회만)
  useEffect(() => {
    const saved = localStorage.getItem('theme') as typeof theme | null;
    if (saved && ['light', 'dark', 'system'].includes(saved)) {
      setTheme(saved);
    }
  }, []);

  // 시스템 테마 감지 + DOM 업데이트
  useEffect(() => {
    const getActual = (): 'light' | 'dark' =>
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    const actual = getActual();
    setActualTheme(actual);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(actual);

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', actual === 'dark' ? '#1f2937' : '#ffffff');
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent): void => {
        const next = e.matches ? 'dark' : 'light';
        setActualTheme(next);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(next);
      };
      mq.addEventListener('change', handler);
      return (): void => mq.removeEventListener('change', handler);
    }
  }, [theme, setActualTheme]);

  return null;
}
