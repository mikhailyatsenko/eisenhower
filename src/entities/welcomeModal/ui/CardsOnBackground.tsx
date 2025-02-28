export const CardsOnBackground = () => {
  return (
    <>
      <div className="animate-diagonal-slide-in-top-left absolute right-0 bottom-0 z-1 flex h-[calc(100vh/2)] w-[calc(100vw/2)] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-red-200 opacity-0 dark:bg-red-900">
        <h3 className="text-foreground text-6xl font-bold text-gray-400/50">
          Do first
        </h3>
      </div>
      <div className="animate-diagonal-slide-in-top-right absolute bottom-0 left-0 z-1 flex h-[calc(100vh/2)] w-[calc(100vw/2)] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-200 opacity-0 dark:bg-amber-900">
        <h3 className="text-foreground text-6xl font-bold text-gray-400/50">
          Schedule
        </h3>
      </div>
      <div className="animate-diagonal-slide-in-bottom-left absolute top-0 right-0 z-1 flex h-[calc(100vh/2)] w-[calc(100vw/2)] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-200 opacity-0 dark:bg-blue-900">
        <h3 className="text-foreground text-6xl font-bold text-gray-400/50">
          Delegate
        </h3>
      </div>
      <div className="animate-diagonal-slide-in-bottom-right absolute top-0 left-0 z-1 flex h-[calc(100vh/2)] w-[calc(100vw/2)] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-green-200 opacity-0 dark:bg-green-900">
        <h3 className="text-6xl font-bold text-gray-400/50">Eliminate</h3>
      </div>
    </>
  );
};
