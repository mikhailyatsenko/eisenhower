'use client';

import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeToggleProps {
  serverThemeCookie?: Theme;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  serverThemeCookie,
}) => {
  const [theme, setTheme] = useState<Theme>(serverThemeCookie || 'light');
  const isDark = theme === 'dark';

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
    <button
      type="button"
      onClick={toggleTheme}
      // Named after what a click does, not after the icon
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:outline-none dark:hover:bg-gray-800 dark:focus-visible:ring-indigo-300"
    >
      {isDark ? (
        <svg
          aria-hidden
          className="h-6 w-6 fill-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      ) : (
        <svg
          aria-hidden
          className="h-6 w-6 fill-violet-700"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
      )}
    </button>
  );
};
