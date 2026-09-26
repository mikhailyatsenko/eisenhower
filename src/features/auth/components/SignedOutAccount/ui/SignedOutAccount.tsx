import GoogleIcon from '@/shared/icons/google-icon.svg';

interface SignedOutAccountProps {
  onSignIn: () => void;
}

/**
 * A signed-out user's account in the header: signs in with Google at once,
 * and on a wide screen says where the tasks are kept meanwhile.
 */
export const SignedOutAccount: React.FC<SignedOutAccountProps> = ({
  onSignIn,
}) => (
  <div className="flex shrink-0 items-center gap-3">
    <span className="hidden text-sm text-gray-600 lg:inline dark:text-gray-400">
      Saved only on this device
    </span>
    <button
      type="button"
      onClick={onSignIn}
      className="flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-indigo-200/95 px-3 text-sm font-semibold text-gray-900 hover:bg-indigo-300/95 focus-visible:ring-2 focus-visible:ring-indigo-700 focus-visible:outline-none dark:bg-indigo-950/95 dark:text-gray-100 dark:hover:bg-indigo-900/95 dark:focus-visible:ring-indigo-300"
    >
      <GoogleIcon aria-hidden className="h-5 w-5 fill-current" />
      Sign in
    </button>
  </div>
);
