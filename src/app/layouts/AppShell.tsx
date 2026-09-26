import { Header } from '@/widgets/header';
import { SyncBar } from '@/widgets/syncBar';
import { Footer } from '@/shared/ui/footer';
import { CloudMatrixSync, LeaveGuard } from '../providers';
import { Account } from './Account';
import { TopBars } from './TopBars';

interface AppShellProps {
  children: React.ReactNode;
  serverThemeCookie?: 'dark' | 'light';
}

// Everything inside <body>: shared by RootLayout and the page-level test seam
export const AppShell = ({ children, serverThemeCookie }: AppShellProps) => (
  <>
    <CloudMatrixSync />
    <LeaveGuard />
    <TopBars>
      <Header account={<Account />} serverThemeCookie={serverThemeCookie} />
      {/* Right after the header: Reload is the next Tab stop after it */}
      <SyncBar />
    </TopBars>
    <main className="relative min-h-screen flex-grow">{children}</main>
    <Footer />
  </>
);
