export interface FloatedButtonProps {
  isNoTasks: boolean;
  active: boolean;
  toggleActive: () => void;
}

export const FloatButton: React.FC<FloatedButtonProps> = ({
  active,
  toggleActive,
  isNoTasks,
}) => {
  console.log(isNoTasks);
  return (
    <button
      title={`${active ? 'Hide form' : 'Add Task'} `}
      onClick={toggleActive}
      className={`${!active && isNoTasks ? 'animate-bounce-button' : ''} fixed right-6 bottom-6 z-50 cursor-pointer rounded-full bg-gray-400/30 p-2 duration-150 hover:scale-110 hover:bg-gray-400/50 md:right-10 md:bottom-10 dark:bg-white/30 dark:hover:bg-white/50`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-10 w-10 duration-300 ${active ? 'rotate-[225deg]' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
    </button>
  );
};
