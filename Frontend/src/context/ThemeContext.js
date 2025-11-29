import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'tms_theme_v1';

export const CustomThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-bs-theme', theme);
    const watermarkUrl = `url(${process.env.PUBLIC_URL}/Logo.png)`;
    root.style.setProperty('--tms-watermark', watermarkUrl);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {}
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useCustomTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useCustomTheme must be used within CustomThemeProvider');
  return ctx;
};
