export const TaskMatrixHeaders: React.FC = () => {
  return (
    <>
      <div className="absolute flex h-6 w-full -translate-y-full flex-nowrap">
        <div className="w-1/2 text-center">Urgent</div>
        <div className="w-1/2 text-center">Not Urgent</div>
      </div>
      <div className="absolute left-0 flex h-full w-6 -translate-x-full flex-col">
        <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
          Important
        </div>
        <div className="h-1/2 -scale-100 text-center [writing-mode:_vertical-rl]">
          Not Important
        </div>
      </div>
    </>
  );
};
