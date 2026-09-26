import { twMerge } from 'tailwind-merge';

interface DialogButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: 'primary' | 'secondary' | 'danger';
}

const variantClasses = {
  primary:
    'bg-indigo-700 text-white hover:bg-indigo-800 dark:bg-indigo-300 dark:text-gray-900 dark:hover:bg-indigo-200',
  secondary:
    'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800',
  danger:
    'text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950',
};

/** An answer button of a Modal */
export const DialogButton = ({
  variant,
  className,
  ...props
}: DialogButtonProps) => (
  <button
    type="button"
    className={twMerge(
      'cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 dark:focus-visible:outline-indigo-300',
      variantClasses[variant],
      className,
    )}
    {...props}
  />
);
