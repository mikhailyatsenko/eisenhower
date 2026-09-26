import { SyncBar } from '@/widgets/syncBar';
import { ViewToggle } from '@/features/switchViewMode';
import { ThemeToggle } from '@/features/toggleTheme';
import { Footer } from '@/shared/ui/footer';
import { CloudMatrixSync, LeaveGuard } from '../providers';
import { Account } from './Account';

interface AppShellProps {
  children: React.ReactNode;
  serverThemeCookie?: 'dark' | 'light';
}

// Everything inside <body>: shared by RootLayout and the page-level test seam
export const AppShell = ({ children, serverThemeCookie }: AppShellProps) => (
  <>
    <CloudMatrixSync />
    <LeaveGuard />
    {/* Scroll mask for top buttons */}
    <div className="bg-background/60 pointer-events-none fixed top-0 left-0 z-10 h-12 w-full backdrop-blur-xl" />
    <main className="relative min-h-screen flex-grow">
      <SyncBar />
      <Account />
      <ThemeToggle serverThemeCookie={serverThemeCookie} />
      <ViewToggle />
      {children}
    </main>
    <Footer />
  </>
);
