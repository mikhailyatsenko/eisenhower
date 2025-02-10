import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../styles';
import { cookies } from 'next/headers';
import { ThemeToggle } from '@/features/toggleTheme';

const geistSans = Geist({
  variable: '--font-geist-sans',

  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Eisenhower Matrix App',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeToggle serverThemeCookie={serverThemeCookie} />
        {children}
      </body>
    </html>
  );
}
