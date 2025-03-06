interface TaskSourceTabsProps {
  switchToFirebaseTasks: () => void;
  switchToLocalTasks: () => void;
}

export const TaskSourceTabs: React.FC<TaskSourceTabsProps> = ({
  switchToFirebaseTasks,
  switchToLocalTasks,
}) => {
  return (
    <div className="absolute top-0 left-0 flex">
      <button
        onClick={switchToFirebaseTasks}
        className="cursor-pointer rounded-bl-md bg-blue-500 px-4 py-2 text-white"
      >
        Firebase Tasks
      </button>
      <button
        onClick={switchToLocalTasks}
        className="cursor-pointer rounded-br-md bg-gray-500 px-4 py-2 text-white"
      >
        Local Tasks
      </button>
    </div>
  );
};
