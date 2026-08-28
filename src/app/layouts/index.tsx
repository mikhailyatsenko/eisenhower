import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../styles';
import { cookies } from 'next/headers';
import { Auth } from '@/features/auth/ui/Auth';
import { ViewToggle } from '@/features/switchViewMode';
import { ThemeToggle } from '@/features/toggleTheme';
import { ViewAnalytics } from '@/features/viewAnalytics';
import { WelcomeModal } from '@/entities/welcomeModal';
import { SITE_URL } from '@/shared/consts';
import { Favicons } from '@/shared/lib/Favicons';
import { HeadScripts } from '@/shared/lib/HeadScripts';
import { Footer } from '@/shared/ui/footer';
import { ClientShortcuts } from './ClientShortcuts';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Eisenhower Matrix - Online App',
  description: 'Organize your priorities and workload',
  alternates: {
    canonical: '/',
  },
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
        className={`${geistSans.variable} ${geistMono.variable} relative flex min-h-screen flex-col antialiased`}
      >
        {/* Scroll mask for top buttons */}
        <div className="bg-background/60 pointer-events-none fixed top-0 left-0 z-10 h-12 w-full backdrop-blur-xl" />
        <main className="relative min-h-screen flex-grow">
          <ClientShortcuts />
          <Auth />
          <ThemeToggle serverThemeCookie={serverThemeCookie} />
          <ViewToggle />
          <ViewAnalytics />
          <WelcomeModal />
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
