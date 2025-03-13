import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../styles';
import { cookies } from 'next/headers';
import { Auth } from '@/features/auth/ui/Auth';
import { SwitchTaskSource } from '@/features/switchTaskSource/ui/SwitchTaskSource';
import { ThemeToggle } from '@/features/toggleTheme';
import { WelcomeModal } from '@/entities/welcomeModal';
import { Favicons } from '@/shared/lib/Favicons';
import { HeadScripts } from '@/shared/lib/HeadScripts';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Eisenhower Matrix - Online App',
  description: 'Organize your priorities and workload',
};

export async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const themeCookie = (await cookieStore).get('theme');
  const serverThemeCookie = themeCookie?.value as 'dark' | 'light' | undefined;

  return (
    <html
      lang="en"
      className={serverThemeCookie === 'dark' ? serverThemeCookie : ''}
    >
      <head>
        <HeadScripts />
        <Favicons />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative antialiased`}
      >
        <Auth />
        <ThemeToggle serverThemeCookie={serverThemeCookie} />
        <SwitchTaskSource />
        <WelcomeModal />
        {children}
      </body>
    </html>
  );
}
