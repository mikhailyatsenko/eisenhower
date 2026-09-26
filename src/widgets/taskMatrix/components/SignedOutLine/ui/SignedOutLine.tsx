interface SignedOutLineProps {
  signIn: () => void;
}

/** Above the empty matrix after Sign out: the tasks aren't lost */
export const SignedOutLine: React.FC<SignedOutLineProps> = ({ signIn }) => (
  <p className="mt-6 text-center text-sm text-gray-700 dark:text-gray-300">
    Your tasks are in your Google account. Sign in to see them.{' '}
    <button
      type="button"
      onClick={signIn}
      className="cursor-pointer rounded font-medium whitespace-nowrap text-indigo-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 dark:text-indigo-300 dark:focus-visible:outline-indigo-300"
    >
      Sign in
    </button>
  </p>
);
