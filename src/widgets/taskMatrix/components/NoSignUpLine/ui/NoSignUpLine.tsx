import Link from 'next/link';

/** Above an anonymous user's empty matrix: no account needed, and where tasks are */
export const NoSignUpLine: React.FC = () => (
  <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
    No sign-up — tasks stay in this browser.{' '}
    <Link
      href="/eisenhower-matrix"
      className="rounded font-medium whitespace-nowrap text-indigo-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 dark:text-indigo-300 dark:focus-visible:outline-indigo-300"
    >
      How it works →
    </Link>
  </p>
);
