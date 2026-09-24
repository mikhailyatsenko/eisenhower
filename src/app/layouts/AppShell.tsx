import { Auth } from '@/features/auth/ui/Auth';
import { ViewToggle } from '@/features/switchViewMode';
import { ThemeToggle } from '@/features/toggleTheme';
import { ViewAnalytics } from '@/features/viewAnalytics';
import { WelcomeModal } from '@/entities/welcomeModal';
import { Footer } from '@/shared/ui/footer';
import { ClientShortcuts } from './ClientShortcuts';

interface AppShellProps {
  children: React.ReactNode;
  serverThemeCookie?: 'dark' | 'light';
}

// Everything inside <body>: shared by RootLayout and the page-level test seam
export const AppShell = ({ children, serverThemeCookie }: AppShellProps) => (
  <>
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
  </>
);
