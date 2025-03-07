import React, { useEffect, useState } from 'react';

interface TaskSourceTabsProps {
  switchToFirebaseTasks: () => void;
  switchToLocalTasks: () => void;
  currentSource: 'local' | 'firebase';
}

export const TaskSourceTabs: React.FC<TaskSourceTabsProps> = ({
  switchToFirebaseTasks,
  switchToLocalTasks,
  currentSource,
}) => {
  const [isCloud, setIsCloud] = useState(currentSource === 'firebase');

  useEffect(() => {
    setIsCloud(currentSource === 'firebase');
  }, [currentSource]);

  const handleChange = () => {
    if (isCloud) {
      switchToLocalTasks();
    } else {
      switchToFirebaseTasks();
    }
  };

  return (
    <div
      className="absolute top-0 left-1/2 flex h-6 w-32 -translate-x-1/2 cursor-pointer rounded-b-md bg-gray-300/50 font-medium select-none"
      onClick={handleChange}
    >
      <div className="flex w-full items-center justify-between text-center text-sm">
        <span className={`${isCloud ? 'text-white' : 'text-black'} z-2 w-1/2`}>
          Cloud
        </span>
        <span className={`${isCloud ? 'text-black' : 'text-white'} z-2 w-1/2`}>
          Local
        </span>
        <div
          className={`shadow- absolute top-0 left-0 h-full w-1/2 rounded-b-md bg-white transition-transform duration-250 ease-[cubic-bezier(0.93,0.26,0.07,0.69)] ${isCloud ? 'translate-x-full' : ''}`}
        ></div>
      </div>
    </div>
  );
};
