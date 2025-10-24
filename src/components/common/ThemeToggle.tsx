'use client';

import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useState } from 'react';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'icon', 
  size = 'md' 
}) => {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSize = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          ${buttonSize[size]} 
          rounded-lg
          bg-white/80 dark:bg-gray-800/80
          hover:bg-white/90 dark:hover:bg-gray-700/90
          border border-gray-200 dark:border-gray-700
          text-gray-700 dark:text-gray-200
          transition-all duration-200
          backdrop-blur-sm
          shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
        `}
        aria-label="테마 토글"
        title={actualTheme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
      >
        {actualTheme === 'light' ? (
          <Moon className={iconSize[size]} />
        ) : (
          <Sun className={iconSize[size]} />
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${buttonSize[size]}
          rounded-lg
          bg-white/80 dark:bg-gray-800/80
          hover:bg-white/90 dark:hover:bg-gray-700/90
          border border-gray-200 dark:border-gray-700
          text-gray-700 dark:text-gray-200
          transition-all duration-200
          backdrop-blur-sm
          shadow-sm hover:shadow-md
          focus:outline-none focus:ring-2 focus:ring-blue-500/50
          flex items-center gap-2
        `}
        aria-label="테마 선택"
      >
        {theme === 'light' && <Sun className={iconSize[size]} />}
        {theme === 'dark' && <Moon className={iconSize[size]} />}
        {theme === 'system' && <Monitor className={iconSize[size]} />}
        <span className="text-sm font-medium">
          {theme === 'light' && '라이트'}
          {theme === 'dark' && '다크'}
          {theme === 'system' && '시스템'}
        </span>
      </button>

      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 top-full mt-2 z-20 w-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="p-1">
              <button
                onClick={() => {
                  setTheme('light');
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md
                  transition-colors duration-150
                  ${theme === 'light' 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Sun className="w-4 h-4" />
                라이트 모드
              </button>
              
              <button
                onClick={() => {
                  setTheme('dark');
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md
                  transition-colors duration-150
                  ${theme === 'dark' 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Moon className="w-4 h-4" />
                다크 모드
              </button>
              
              <button
                onClick={() => {
                  setTheme('system');
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md
                  transition-colors duration-150
                  ${theme === 'system' 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Monitor className="w-4 h-4" />
                시스템 설정
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};