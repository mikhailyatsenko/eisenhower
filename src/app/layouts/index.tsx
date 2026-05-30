import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../styles';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Auth } from '@/features/auth/ui/Auth';
import { ViewToggle } from '@/features/switchViewMode';
import { ThemeToggle } from '@/features/toggleTheme';
import { ViewAnalytics } from '@/features/viewAnalytics';
import { WelcomeModal } from '@/entities/welcomeModal';
import { Favicons } from '@/shared/lib/Favicons';
import { HeadScripts } from '@/shared/lib/HeadScripts';
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
        {/* Scroll mask for top buttons */}
        <div className="bg-background/60 pointer-events-none fixed top-0 left-0 z-10 h-12 w-full backdrop-blur-xl" />
        <ClientShortcuts />
        <Auth />
        <ThemeToggle serverThemeCookie={serverThemeCookie} />
        <ViewToggle />
        <ViewAnalytics />
        <WelcomeModal />
        {children}
        <div className="fixed bottom-2 left-2 z-20 flex flex-col gap-1 text-[10px] text-gray-400 opacity-60">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
        <div className="fixed top-2 right-44 z-20 flex flex-col gap-1 text-right text-sm text-gray-400">
          <span className="hidden sm:block">
            Quick add: press keys <span className="font-bold">1-4</span>
          </span>
        </div>
        <div className="fixed top-1 left-14 z-10 flex flex-col text-left text-[10px] opacity-40">
          <span>Contact the author:</span>
          <span>m74901379@gmail.com</span>
        </div>
      </body>
    </html>
  );
}
