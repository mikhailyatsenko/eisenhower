import Link from 'next/link';
import { ViewToggle } from '@/features/switchViewMode';
import { ThemeToggle } from '@/features/toggleTheme';
import { Logo } from '../components/Logo';

interface HeaderProps {
  /** Signing in and out: the app puts it together with the Migration */
  account: React.ReactNode;
  serverThemeCookie?: 'dark' | 'light';
}

/**
 * The banner of every page: the app's name as a link to the matrix, then the
 * view, the theme and the account. Its place on the page, sticky with the
 * sync bar under it, is the app's.
 */
export const Header = ({ account, serverThemeCookie }: HeaderProps) => (
  // 56px with the line at the bottom
  <header className="bg-background/70 flex h-14 items-center gap-1 border-b border-gray-200 px-2 backdrop-blur-xl sm:px-4 dark:border-gray-800">
    <Link
      href="/"
      className="flex h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-lg px-1 font-semibold text-gray-900 focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:outline-none dark:text-gray-100 dark:focus-visible:ring-indigo-300"
    >
      <Logo />
      {/* Hidden on a phone but still the link's name */}
      <span className="sr-only md:not-sr-only">Eisenhower Matrix</span>
    </Link>
    <div className="ml-auto flex items-center gap-1">
      <ViewToggle />
      <ThemeToggle serverThemeCookie={serverThemeCookie} />
      {account}
    </div>
  </header>
);
