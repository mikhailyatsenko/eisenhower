import { WELCOME_MODAL_TEXTS } from '../consts';

export const TextContent = () => {
  return (
    <div className="flex flex-col gap-6 text-gray-800 dark:text-gray-100">
      <div className="space-y-4">
        <h1 className="limitedHeight639:!hidden sm576:block hidden text-2xl font-black tracking-tight text-amber-600 sm:text-4xl md:text-5xl dark:text-amber-500">
          {WELCOME_MODAL_TEXTS.TITLE}
        </h1>
        <p className="limitedHeight639:text-sm text-base leading-relaxed font-medium opacity-90 sm:text-lg md:text-xl">
          {WELCOME_MODAL_TEXTS.DESCRIPTION}
        </p>
      </div>

      <div className="limitedHeight639:!hidden sm576:block hidden space-y-4">
        <p className="text-sm font-bold tracking-widest text-gray-500 uppercase dark:text-gray-400">
          {WELCOME_MODAL_TEXTS.ADDITIONAL_INFO}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QuadrantCard
            title="Do First"
            text="Important and Urgent tasks that need immediate attention."
            color="bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800"
            dotColor="bg-red-500"
          />
          <QuadrantCard
            title="Schedule"
            text="Important but Not Urgent tasks that you can plan for later."
            color="bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800"
            dotColor="bg-yellow-500"
          />
          <QuadrantCard
            title="Delegate"
            text="Not Important but Urgent tasks that you can delegate."
            color="bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800"
            dotColor="bg-blue-500"
          />
          <QuadrantCard
            title="Eliminate"
            text="Not Important and Not Urgent tasks that you can eliminate."
            color="bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800"
            dotColor="bg-green-500"
          />
        </div>
      </div>

      <p className="limitedHeight639:text-sm text-sm font-bold text-gray-500 italic dark:text-gray-400">
        {WELCOME_MODAL_TEXTS.FINAL_NOTE}
      </p>
    </div>
  );
};

const QuadrantCard = ({
  title,
  text,
  color,
  dotColor,
}: {
  title: string;
  text: string;
  color: string;
  dotColor: string;
}) => (
  <div
    className={`flex flex-col gap-1 rounded-xl border p-4 text-left transition-transform hover:scale-[1.02] ${color}`}
  >
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${dotColor}`} />
      <span className="text-xs font-black tracking-wider opacity-80">
        {title}
      </span>
    </div>
    <p className="text-xs leading-snug font-bold opacity-90 sm:text-sm">
      {text}
    </p>
  </div>
);
