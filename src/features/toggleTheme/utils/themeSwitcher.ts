export const applyTheme = (theme: string) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  document.cookie = `theme=${theme}; path=/`;
};

export const initTheme = () => {
  const savedTheme = document.cookie
    .split('; ')
    .find((row) => row.startsWith('theme='))
    ?.split('=')[1];
  if (savedTheme) {
    applyTheme(savedTheme);
  } else {
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
};
