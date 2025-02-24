'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import { ThemeToggleButton } from '../../../../entities/themeToggleButton/ui/ThemeToggleButton';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  serverThemeCookie?: Theme;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  serverThemeCookie,
}) => {
  const [theme, setTheme] = useState<Theme>(serverThemeCookie || 'light');

  useEffect(() => {
    if (!serverThemeCookie) {
      const systemPrefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)',
      ).matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, [serverThemeCookie]);

  useEffect(() => {
    document.documentElement.className = theme === 'dark' ? 'dark' : '';
    Cookies.set('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeToggleButton isDark={theme === 'dark'} toggleTheme={toggleTheme} />
  );
};
