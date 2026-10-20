'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  customBg: string;
  setCustomBg: (color: string) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  setMode: () => {},
  customBg: '#0a0f1d',
  setCustomBg: () => {},
  resolvedTheme: 'dark',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');
  const [customBg, setCustomBgState] = useState<string>('#0a0f1d');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved settings
    const savedMode = (localStorage.getItem('cn_theme_mode') as ThemeMode) || 'dark';
    const savedBg = localStorage.getItem('cn_custom_bg') || '#0a0f1d';
    setModeState(savedMode);
    setCustomBgState(savedBg);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let targetTheme: 'dark' | 'light' = 'dark';
    if (mode === 'system') {
      targetTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      targetTheme = mode;
    }
    setResolvedTheme(targetTheme);

    const root = document.documentElement;
    if (targetTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.setProperty('--app-bg', customBg || '#0a0f1d');
      root.style.setProperty('--app-text', '#f8fafc');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.setProperty('--app-bg', '#f8fafc');
      root.style.setProperty('--app-text', '#0f172a');
    }
  }, [mode, customBg, mounted]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('cn_theme_mode', newMode);
  };

  const setCustomBg = (newBg: string) => {
    setCustomBgState(newBg);
    localStorage.setItem('cn_custom_bg', newBg);
    document.documentElement.style.setProperty('--app-bg', newBg);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, customBg, setCustomBg, resolvedTheme }}>
      <div style={{ backgroundColor: resolvedTheme === 'dark' ? customBg : '#f8fafc' }} className="min-h-screen transition-colors duration-200">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
