import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // Add this import
import { act } from 'react';
import { RootLayout } from '../index';

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue({ value: 'dark' }),
  }),
}));

jest.mock('@/features/auth/ui/Auth', () => ({
  Auth: () => <div>Auth Component</div>,
}));

jest.mock('@/features/switchTaskSource/ui/SwitchTaskSource', () => ({
  SwitchTaskSource: () => <div>SwitchTaskSource Component</div>,
}));

jest.mock('@/features/toggleTheme', () => ({
  ThemeToggle: ({
    serverThemeCookie,
  }: {
    serverThemeCookie: 'dark' | 'light';
  }) => <div>ThemeToggle Component - {serverThemeCookie}</div>,
}));

jest.mock('@/shared/lib/Favicons', () => ({
  Favicons: () => <link rel="icon" href="/favicon.ico" />,
}));

jest.mock('@/shared/lib/HeadScripts', () => ({
  HeadScripts: () => (
    <script>console.log(&apos;HeadScripts Component&apos;);</script>
  ),
}));

jest.mock('next/font/google', () => ({
  Geist: jest.fn().mockReturnValue(() => <style>{`.geist {}`}</style>),
  Geist_Mono: jest
    .fn()
    .mockReturnValue(() => <style>{`.geist-mono {}`}</style>),
}));

describe('RootLayout', () => {
  it('renders correctly', async () => {
    const ResolvedRootLayout = await RootLayout({
      children: <div>Child Component</div>,
    });

    await act(async () => {
      render(ResolvedRootLayout);
    });

    await waitFor(() => {
      expect(screen.getByText('Auth Component')).toBeInTheDocument();
      expect(
        screen.getByText('ThemeToggle Component - dark'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('SwitchTaskSource Component'),
      ).toBeInTheDocument();
      expect(document.querySelector('link[rel="icon"]')).toBeInTheDocument();
      expect(document.querySelector('script')).toBeInTheDocument();
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });
  });
});
